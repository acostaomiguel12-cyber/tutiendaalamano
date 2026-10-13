import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

// En producción sin secreto se falla cerrado (sin firmas). En dev se usa un
// secreto efímero aleatorio: funciona local pero no es forjable desde el repo.
let ephemeralSecret: string | null = null;

export function getSessionSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET || '';
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_SESSION_SECRET ausente o corto (<32). El login admin está deshabilitado.');
  }
  if (!ephemeralSecret) {
    ephemeralSecret = randomBytes(48).toString('hex');
    console.warn('[auth] Sin ADMIN_SESSION_SECRET: usando secreto efímero de desarrollo (sesiones no sobreviven reinicios).');
  }
  return ephemeralSecret;
}

function b64urlEncode(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

function b64urlDecode<T>(s: string): T {
  return JSON.parse(Buffer.from(s, 'base64url').toString('utf8')) as T;
}

// Revocación best-effort en memoria (logout). No sustituye expiración corta.
const revoked = new Map<string, number>();

export function revokeSession(token: string): void {
  revoked.set(token, Date.now() + SESSION_TTL_MS);
}

function sweepRevoked(): void {
  const now = Date.now();
  for (const [t, exp] of revoked) {
    if (exp < now) revoked.delete(t);
  }
  if (revoked.size > 5000) revoked.clear();
}

export interface AdminSession {
  sub: string;
  email: string;
  name: string;
  role: string;
  exp: number;
}

/** Token firmado HMAC-SHA256: base64url(payload).hex. Sin dependencias. */
export function signSession(s: Omit<AdminSession, 'exp'>): string {
  const payload = b64urlEncode({ ...s, exp: Date.now() + SESSION_TTL_MS });
  const sig = createHmac('sha256', getSessionSecret()).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifySession(token: string): AdminSession | null {
  try {
    sweepRevoked();
    if (revoked.has(token)) return null;
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;
    const expected = createHmac('sha256', getSessionSecret()).update(payload).digest('hex');
    const a = Buffer.from(sig, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const session = b64urlDecode<AdminSession>(payload);
    if (!session.exp || session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

// Rate limit en memoria (por IP) para /api/admin/login.
const attempts = new Map<string, { count: number; resetAt: number }>();

export function loginRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return false;
  }
  entry.count++;
  return entry.count > 8;
}

export function loginRateReset(ip: string): void {
  attempts.delete(ip);
}
