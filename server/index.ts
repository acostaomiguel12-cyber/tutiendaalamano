// TU TIENDA A LA MANO — backend mínimo de producción.
// Sirve el build (dist/), firma sesiones del Widget Wompi, verifica
// transacciones, recibe el webhook y reenvía WhatsApp vía Meta Cloud API.
// Los secretos viven SOLO aquí (variables de entorno), nunca en el frontend.
//
// Desarrollo:  terminal 1 → npm run dev     (Vite, proxy /api → :4001)
//               terminal 2 → npm run server  (tsx --watch server/index.ts)
// Producción:   npm run build && npm start   (este servidor sirve dist/ + /api)
import 'dotenv/config';
import { config as dotenvConfig } from 'dotenv';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import {
  buildWidgetUrl,
  fetchTransaction,
  verifyEventChecksum,
  type WompiEnv,
} from './wompi.js';
import {
  signSession,
  verifySession,
  revokeSession,
  loginRateLimited,
  loginRateReset,
  type AdminSession,
} from './auth.js';

dotenvConfig({ path: '.env' });
dotenvConfig({ path: '.env.local' });

const DEFAULT_SUPABASE_URL = '';
const DEFAULT_SUPABASE_KEY = '';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PORT = Number(process.env.PORT || 4001);
const WOMPI_ENV = (process.env.WOMPI_ENV === 'sandbox' ? 'sandbox' : 'production') as WompiEnv;
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY || process.env.VITE_WOMPI_PUBLIC_KEY || '';
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY || '';
const WOMPI_INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET || '';
const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET || '';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || '';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '256kb' }));

// Cabeceras mínimas de seguridad.
// HSTS solo lo honran navegadores en HTTPS, así que es seguro enviarlo siempre.
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// IP real: x-forwarded-for solo si hay proxy confiable delante (TRUST_PROXY=1).
function clientIp(req: express.Request): string {
  if (process.env.TRUST_PROXY === '1') {
    const fwd = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    if (fwd) return fwd;
  }
  return req.socket.remoteAddress || 'unknown';
}

app.get('/api/health', async (_req, res) => {
  // Diagnóstico de login admin (conteos, sin emails ni hashes).
  let admin = { users: -1, withPassword: -1 };
  try {
    const sb = supabaseServer();
    if (sb) {
      const { data, error } = await sb.from('admin_users').select('password_hash');
      if (!error && Array.isArray(data)) {
        admin = {
          users: data.length,
          withPassword: data.filter((u: any) => !!u.password_hash).length,
        };
      }
    }
  } catch {
    // se reporta -1 (sin acceso a la tabla)
  }
  res.json({
    ok: true,
    env: WOMPI_ENV,
    wompi: {
      publicKey: Boolean(WOMPI_PUBLIC_KEY),
      privateKey: Boolean(WOMPI_PRIVATE_KEY),
      integritySecret: Boolean(WOMPI_INTEGRITY_SECRET),
      eventsSecret: Boolean(WOMPI_EVENTS_SECRET),
    },
    supabase: Boolean(SUPABASE_URL && SUPABASE_KEY),
    whatsapp: Boolean(WHATSAPP_TOKEN && WHATSAPP_PHONE_NUMBER_ID),
    serviceRole: Boolean(SUPABASE_SERVICE_ROLE),
    admin,
    timestamp: new Date().toISOString(),
  });
});

/** Auth admin real: email + password (hash bcrypt en admin_users.password_hash). */
app.post('/api/admin/login', async (req, res) => {
  const ip = clientIp(req);
  if (loginRateLimited(ip)) {
    res.status(429).json({ error: 'Demasiados intentos. Espera 10 minutos.' });
    return;
  }
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase().slice(0, 254) : '';
  const password = typeof req.body?.password === 'string' ? req.body.password.slice(0, 256) : '';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
    res.status(400).json({ error: 'Email y contraseña requeridos.' });
    return;
  }
  const sb = supabaseServer();
  if (!sb) {
    res.status(500).json({ error: 'Supabase sin configurar en servidor.' });
    return;
  }
  try {
    const { data: user, error } = await sb
      .from('admin_users')
      .select('id,email,name,role,role_title,avatar_initials,password_hash')
      .eq('email', email)
      .maybeSingle();
    if (error || !user || !user.password_hash) {
      res.status(401).json({ error: 'Credenciales inválidas.' });
      return;
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      res.status(401).json({ error: 'Credenciales inválidas.' });
      return;
    }
    loginRateReset(ip);
    try {
      await sb.from('admin_users').update({ last_login: new Date().toISOString() }).eq('id', user.id);
    } catch {
      // No bloquea el login si el update de auditoría falla.
    }
    const token = signSession({ sub: user.id, email: user.email, name: user.name, role: user.role });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, roleTitle: user.role_title, avatarInitials: user.avatar_initials },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error de autenticación.' });
  }
});

app.get('/api/admin/me', (req, res) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const session = token ? verifySession(token) : null;
  if (!session) {
    res.status(401).json({ error: 'Sesión inválida o expirada.' });
    return;
  }
  res.json({ user: { id: session.sub, email: session.email, name: session.name, role: session.role } });
});

app.post('/api/admin/logout', (req, res) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (token) revokeSession(token);
  res.json({ ok: true });
});

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const session = token ? verifySession(token) : null;
  if (!session) {
    res.status(401).json({ error: 'Requiere sesión de administrador.' });
    return;
  }
  (req as express.Request & { admin?: AdminSession }).admin = session;
  next();
}

// Rate limit liviano para endpoints públicos (anti-abuso). El login tiene el suyo.
const publicHits = new Map<string, { count: number; resetAt: number }>();
function sweepPublicHits(): void {
  const now = Date.now();
  for (const [ip, e] of publicHits) {
    if (e.resetAt < now) publicHits.delete(ip);
  }
  if (publicHits.size > 5000) publicHits.clear();
}
function publicRateLimit(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const ip = clientIp(req);
  const now = Date.now();
  const entry = publicHits.get(ip);
  if (!entry || entry.resetAt < now) {
    publicHits.set(ip, { count: 1, resetAt: now + 60 * 1000 });
    if (publicHits.size % 100 === 0) sweepPublicHits();
    next();
    return;
  }
  entry.count++;
  if (entry.count > 120) {
    res.status(429).json({ error: 'Demasiadas solicitudes. Intenta en un minuto.' });
    return;
  }
  next();
}

// Tope sensato por compra: $5.000.000 COP en centavos (anti-abuso de firmas).
const MAX_AMOUNT_CENTS = 500000000;

/** redirectUrl solo https (o http en localhost para dev). */
function validRedirectUrl(raw: unknown): string {
  if (typeof raw !== 'string' || !raw) return '';
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase();
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    if (u.protocol === 'https:') return raw.slice(0, 500);
    if (u.protocol === 'http:' && isLocal) return raw.slice(0, 500);
    return '';
  } catch {
    return '';
  }
}

/** Crea una sesión de pago: firma servidor y devuelve la URL del Widget. */
app.post('/api/wompi/checkout-session', publicRateLimit, (req, res) => {
  const body = (req.body || {}) as Record<string, unknown>;
  const reference = typeof body.reference === 'string' ? body.reference.slice(0, 60) : '';
  const amountInCents = body.amountInCents;
  const email = typeof body.email === 'string' ? body.email.slice(0, 254) : undefined;
  const fullName = typeof body.fullName === 'string' ? body.fullName.slice(0, 120) : undefined;
  const phone = typeof body.phone === 'string' ? body.phone.replace(/\D/g, '').slice(0, 15) : undefined;
  const redirectUrl = validRedirectUrl(body.redirectUrl);
  if (!reference || !Number.isInteger(amountInCents) || (amountInCents as number) <= 0 || (amountInCents as number) > MAX_AMOUNT_CENTS) {
    res.status(400).json({ error: 'reference y amountInCents válidos son requeridos.' });
    return;
  }
  if (!redirectUrl) {
    res.status(400).json({ error: 'redirectUrl https válido requerido.' });
    return;
  }
  if (!WOMPI_PUBLIC_KEY || !WOMPI_INTEGRITY_SECRET) {
    res.status(500).json({ error: 'Servidor sin llaves Wompi configuradas.' });
    return;
  }
  const url = buildWidgetUrl(
    {
      publicKey: WOMPI_PUBLIC_KEY,
      reference,
      amountInCents: amountInCents as number,
      currency: 'COP',
      redirectUrl,
      email,
      fullName,
      phone,
    },
    WOMPI_INTEGRITY_SECRET
  );
  res.json({ url, reference, amountInCents, currency: 'COP', env: WOMPI_ENV });
});

/** Lista transacciones recientes vía backend (requiere admin). */
app.get('/api/wompi/transactions', requireAdmin, async (req, res) => {
  try {
    if (!WOMPI_PRIVATE_KEY) {
      res.status(500).json({ error: 'Servidor sin llave privada Wompi.' });
      return;
    }
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const host = WOMPI_ENV === 'sandbox' ? 'https://sandbox.wompi.co' : 'https://production.wompi.co';
    const apiRes = await fetch(
      `${host}/v1/transactions?from_date=2025-01-01T00:00:00Z&until_date=2026-12-31T23:59:59Z&page=1&page_size=${limit}`,
      { headers: { Authorization: `Bearer ${WOMPI_PRIVATE_KEY.trim()}` } }
    );
    if (!apiRes.ok) {
      console.error('[wompi] transactions list failed:', apiRes.status);
      res.status(502).json({ error: 'No se pudo consultar Wompi.' });
      return;
    }
    const json = (await apiRes.json()) as { data?: any[] };
    res.json({ transactions: json.data || [], env: WOMPI_ENV });
  } catch {
    res.status(502).json({ error: 'No se pudo consultar Wompi.' });
  }
});
/** Confirmación de pago post-Widget: el servidor re-verifica con Wompi y marca la orden. */
app.post('/api/wompi/confirm', publicRateLimit, async (req, res) => {
  const reference = typeof req.body?.reference === 'string' ? req.body.reference.slice(0, 60) : '';
  const transactionId = typeof req.body?.transactionId === 'string' ? req.body.transactionId.slice(0, 120) : '';
  if (!reference || !transactionId) {
    res.status(400).json({ error: 'reference y transactionId requeridos.' });
    return;
  }
  if (!WOMPI_PRIVATE_KEY) {
    res.status(500).json({ error: 'Servidor sin llave privada Wompi.' });
    return;
  }
  const sb = supabaseServer();
  if (!sb) {
    res.status(500).json({ error: 'Supabase sin configurar en servidor.' });
    return;
  }
  try {
    const tx = await fetchTransaction(WOMPI_ENV, String(transactionId), WOMPI_PRIVATE_KEY);
    if (tx.reference !== reference) {
      res.status(422).json({ error: 'La transacción no corresponde a este pedido.' });
      return;
    }
    const { data: order } = await sb.from('orders').select('*').eq('reference', reference).maybeSingle();
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado.' });
      return;
    }
    if (Number(tx.amount_in_cents) !== Number(order.total_amount_in_cents)) {
      res.status(422).json({ error: 'El monto pagado no coincide con el total.' });
      return;
    }
    const statusMap: Record<string, string> = { APPROVED: 'APPROVED', DECLINED: 'DECLINED', ERROR: 'ERROR', VOIDED: 'VOIDED', PENDING: 'PENDING' };
    const orderStatus = statusMap[tx.status] || 'PENDING';
    const { data: updated, error } = await sb
      .from('orders')
      .update({
        status: orderStatus,
        tracking_number: orderStatus === 'APPROVED' && !order.tracking_number
          ? `CRD-${Math.floor(100000000 + Math.random() * 900000000)}-CO`
          : order.tracking_number,
        carrier: orderStatus === 'APPROVED' && !order.carrier ? 'Coordinadora Express Asegurado' : order.carrier,
        wompi_transaction: { ...(tx as object), server_confirmed: true },
        updated_at: new Date().toISOString(),
      })
      .eq('reference', reference)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    res.json({ status: orderStatus, order: updated, transaction: tx });
  } catch {
    console.error('[wompi] confirm failed');
    res.status(502).json({ error: 'No se pudo confirmar el pago.' });
  }
});
/** Verifica una transacción contra la API Wompi (llave privada en servidor). */
app.get('/api/wompi/transaction/:id', publicRateLimit, async (req, res) => {
  try {
    if (!WOMPI_PRIVATE_KEY) {
      res.status(500).json({ error: 'Servidor sin llave privada Wompi.' });
      return;
    }
    const id = String(req.params.id || '').slice(0, 120);
    if (!id) {
      res.status(400).json({ error: 'ID requerido.' });
      return;
    }
    const tx = await fetchTransaction(WOMPI_ENV, id, WOMPI_PRIVATE_KEY);
    res.json({ transaction: tx, env: WOMPI_ENV });
  } catch {
    res.status(502).json({ error: 'No se pudo consultar Wompi.' });
  }
});

function supabaseServer() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    return createClient(SUPABASE_URL.replace(/\/+$/, ''), SUPABASE_KEY);
  } catch {
    return null;
  }
}

/**
 * Webhook Wompi: siempre responde 200 (evita tormenta de reintentos).
 * Solo muta la BD cuando la firma verifica; si no, se registra y se deja
 * la confirmación en manos de /api/wompi/confirm (que re-verifica vía API).
 */
app.post('/api/wompi/webhook', publicRateLimit, async (req, res) => {
  const payload = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, any>;
  const tx = payload?.data?.transaction && typeof payload.data.transaction === 'object'
    ? payload.data.transaction
    : null;
  const verified = verifyEventChecksum(payload, WOMPI_EVENTS_SECRET);
  const statusMap: Record<string, string> = { APPROVED: 'APPROVED', DECLINED: 'DECLINED', ERROR: 'ERROR', VOIDED: 'VOIDED', PENDING: 'PENDING' };
  const orderStatus = tx && typeof tx.status === 'string' ? statusMap[tx.status] || 'PENDING' : 'PENDING';
  const reference = tx && typeof tx.reference === 'string' ? tx.reference.slice(0, 60) : '';

  if (tx && reference && verified) {
    const sb = supabaseServer();
    if (sb) {
      try {
        const { data: existing } = await sb
          .from('orders')
          .select('id')
          .eq('reference', reference)
          .maybeSingle();
        await sb
          .from('orders')
          .update({
            status: orderStatus,
            wompi_transaction: { ...(tx || {}), webhook_verified: verified },
            updated_at: new Date().toISOString(),
          })
          .eq('reference', reference);
        if (typeof tx.id === 'string' && tx.id) {
          try {
            const { error: upsertError } = await sb.from('wompi_transactions').upsert(
              {
                order_id: existing?.id || reference,
                wompi_transaction_id: String(tx.id).slice(0, 120),
                amount_in_cents: Number(tx.amount_in_cents) || 0,
                currency: typeof tx.currency === 'string' ? tx.currency.slice(0, 8) : 'COP',
                status: orderStatus,
                payment_method_type: typeof tx.payment_method_type === 'string' ? tx.payment_method_type.slice(0, 40) : null,
                reference,
                raw_payload: { ...payload, webhook_verified: verified },
              },
              { onConflict: 'wompi_transaction_id' }
            );
            if (upsertError) throw new Error(upsertError.message);
          } catch (e: any) {
            console.error('[webhook] wompi_transactions upsert failed:', e?.message);
          }
        }
      } catch (err) {
        console.error('[webhook] supabase update failed:', (err as Error)?.message);
      }
    }
  } else if (tx && reference) {
    console.warn('[webhook] evento no verificado, sin mutación:', reference);
  }

  res.json({
    received: true,
    verified,
    event: payload?.event || 'transaction.updated',
    reference: tx?.reference || null,
    transaction_status: tx?.status || null,
    processed_at: new Date().toISOString(),
  });
});

/** Envío WhatsApp vía Meta Cloud API. Requiere admin. Sin token → SIMULATED. */
app.post('/api/whatsapp/send', requireAdmin, async (req, res) => {
  const { to, text } = req.body || {};
  if (!to || !text) {
    res.status(400).json({ error: 'to y text son requeridos.' });
    return;
  }
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    res.json({ status: 'SIMULATED', reason: 'WHATSAPP_TOKEN sin configurar en servidor.' });
    return;
  }
  try {
    const digits = String(to).replace(/\D/g, '').replace(/^0+/, '');
    const response = await fetch(
      `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: digits,
          type: 'text',
          text: { preview_url: false, body: String(text).slice(0, 4000) },
        }),
      }
    );
    const data = (await response.json().catch(() => ({}))) as any;
    if (!response.ok) {
      console.error('[whatsapp] Meta API failed:', response.status);
      res.status(502).json({ status: 'FAILED', error: 'No se pudo enviar por WhatsApp.' });
      return;
    }
    res.json({ status: 'SENT', wamid: data?.messages?.[0]?.id });
  } catch {
    res.status(502).json({ status: 'FAILED', error: 'No se pudo enviar por WhatsApp.' });
  }
});

/** Sync admin (requiere sesión): upsert/delete en tablas allowlist con service_role. */
const ADMIN_SYNC_TABLES: Record<string, { conflict: string }> = {
  products: { conflict: 'id' },
  product_variants: { conflict: 'id' },
  page_layouts: { conflict: 'id' },
  page_layout_blocks: { conflict: 'id' },
  coupons: { conflict: 'id' },
  store_theme_configs: { conflict: 'id' },
};

app.post('/api/admin/sync', requireAdmin, async (req, res) => {
  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
  const table = typeof body.table === 'string' ? body.table : '';
  const allowed = ADMIN_SYNC_TABLES[table];
  if (!allowed || !SUPABASE_URL) {
    res.status(400).json({ error: 'Tabla no permitida o Supabase sin configurar.' });
    return;
  }
  if (!SUPABASE_SERVICE_ROLE) {
    res.status(500).json({ error: 'Sin SUPABASE_SERVICE_ROLE_KEY en servidor.' });
    return;
  }
  const sb = supabaseServer();
  if (!sb) {
    res.status(500).json({ error: 'Supabase sin configurar en servidor.' });
    return;
  }
  const cleanIds = (v: unknown): string[] =>
    Array.isArray(v)
      ? v.filter((x): x is string => typeof x === 'string' && x.length > 0 && x.length <= 120).slice(0, 200)
      : [];
  try {
    const deleteIds = cleanIds(body.deleteIds);
    if (deleteIds.length > 0) {
      const { error } = await sb.from(table).delete().in('id', deleteIds);
      if (error) throw new Error(error.message);
    }
    if (table === 'page_layout_blocks' && typeof body.replaceLayoutId === 'string' && body.replaceLayoutId) {
      const { error } = await sb.from(table).delete().eq('layout_id', body.replaceLayoutId.slice(0, 120));
      if (error) throw new Error(error.message);
    }
    if (Array.isArray(body.rows) && body.rows.length > 0) {
      if (body.rows.length > 200) {
        res.status(400).json({ error: 'Demasiadas filas (máx 200).' });
        return;
      }
      // onConflict siempre de la allowlist: el cliente no elige columnas.
      const { error } = await sb.from(table).upsert(body.rows, { onConflict: allowed.conflict });
      if (error) throw new Error(error.message);
    }
    res.json({ ok: true, table });
  } catch {
    console.error('[sync] failed for table:', table);
    res.status(500).json({ error: 'Error sincronizando.' });
  }
});

// Estáticos del build + fallback SPA (solo si existe dist/).
// index.html SIEMPRE no-cache: si el navegador guarda uno viejo, pide chunks
// con hash que ya no existen en dist/ y el admin/tienda quedan rotos.
const distDir = path.join(root, 'dist');
app.use(express.static(distDir, { maxAge: '1h', index: false }));
app.get('*', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(distDir, 'index.html'), (err) => (err ? next() : undefined));
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[tienda-mano] API + storefront en puerto ${PORT} (wompi: ${WOMPI_ENV})`);
});
server.on('error', (err: any) => {
  if (err?.code === 'EADDRINUSE') {
    console.error(
      `[tienda-mano] Puerto ${PORT} ocupado por otra instancia. Ciérrala o corre: node scripts/free-port.mjs ${PORT}`
    );
    process.exit(1);
  }
  throw err;
});
