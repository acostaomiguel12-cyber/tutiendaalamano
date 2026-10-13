import { createHash } from 'node:crypto';

export type WompiEnv = 'production' | 'sandbox';

export function wompiHost(env: WompiEnv): string {
  return env === 'sandbox' ? 'https://sandbox.wompi.co' : 'https://production.wompi.co';
}

export function widgetHost(env: WompiEnv): string {
  return env === 'sandbox' ? 'https://checkout.wompi.co/p/' : 'https://checkout.wompi.co/p/';
}

/** Firma de integridad: SHA-256(reference + amountInCents + currency + secret). */
export function integritySignature(
  reference: string,
  amountInCents: number,
  currency: string,
  secret: string
): string {
  return createHash('sha256')
    .update(`${reference}${amountInCents}${currency}${secret}`, 'utf8')
    .digest('hex');
}

export interface CheckoutSessionInput {
  publicKey: string;
  reference: string;
  amountInCents: number;
  currency?: string;
  redirectUrl: string;
  email?: string;
  fullName?: string;
  phone?: string;
}

/** URL del Widget Wompi (checkout redirigido). El cliente paga allá; Wompi vuelve a redirectUrl?id=<txId>. */
export function buildWidgetUrl(input: CheckoutSessionInput, integritySecret: string): string {
  const currency = input.currency || 'COP';
  const signature = integritySignature(input.reference, input.amountInCents, currency, integritySecret);
  const params = new URLSearchParams({
    'public-key': input.publicKey,
    currency,
    'amount-in-cents': String(input.amountInCents),
    reference: input.reference,
    'signature:integrity': signature,
    'redirect-url': input.redirectUrl,
  });
  if (input.email) params.set('customer-data:email', input.email);
  if (input.fullName) params.set('customer-data:full-name', input.fullName);
  if (input.phone) params.set('customer-data:phone-number', input.phone);
  return `${widgetHost('production')}?${params.toString()}`;
}

export interface WompiTransaction {
  id: string;
  status: string;
  reference: string;
  amount_in_cents: number;
  currency: string;
  payment_method_type?: string;
  customer_email?: string;
  created_at?: string;
}

/** Consulta una transacción a la API Wompi (llave privada, solo servidor). */
export async function fetchTransaction(
  env: WompiEnv,
  transactionId: string,
  privateKey: string
): Promise<WompiTransaction> {
  const res = await fetch(`${wompiHost(env)}/v1/transactions/${encodeURIComponent(transactionId)}`, {
    headers: { Authorization: `Bearer ${privateKey.trim()}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Wompi ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as { data: WompiTransaction };
  return json.data;
}

/**
 * Verifica el checksum de eventos (header X-Event-Checksum).
 * Fórmula documentada por Wompi: SHA256(transaction.id + transaction.status + amount_in_cents + eventsSecret).
 * Si Wompi cambia el formato, el webhook igual se procesa pero marcado como no verificado.
 */
export function verifyEventChecksum(payload: any, eventsSecret: string): boolean {
  try {
    const tx = payload?.data?.transaction;
    if (!tx || !eventsSecret) return false;
    const raw = `${tx.id}${tx.status}${tx.amount_in_cents}${eventsSecret}`;
    const expected = createHash('sha256').update(raw, 'utf8').digest('hex');
    return expected === payload?.signature?.checksum || expected === payload?.checksum;
  } catch {
    return false;
  }
}
