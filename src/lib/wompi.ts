import { PaymentMethod, PaymentStatus, WompiTransactionRecord } from '../types';

const runtimeEnv = (typeof window !== 'undefined' ? (window as any).__ENV__ : null) || {};

export const WOMPI_CONFIG = {
  // Orden: runtime (/config.js del backend) → compilado VITE_* → demo.
  // Llave pública (no es secreta) + entorno. Todo lo demás vive en el servidor.
  publicKey:
    runtimeEnv.WOMPI_PUBLIC_KEY ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WOMPI_PUBLIC_KEY) ||
    'pub_prod_hlVp9WgGN0kWFjDJjNx4wQbDxq1RF0Gw',
  env: (
    runtimeEnv.WOMPI_ENV ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WOMPI_ENV) ||
    'production'
  ) as 'production' | 'sandbox',
  currency: 'COP',
};

export interface WompiMerchantDetails {
  id: number;
  name: string;
  email: string;
  contact_name: string;
  phone_number: string;
  active: boolean;
  legal_name?: string;
  legal_id_type?: string;
  legal_id?: string;
  public_key: string;
  accepted_currencies: string[];
  accepted_payment_methods: string[];
  installments_config?: {
    enabled: boolean;
    max_installments: number;
    default_installments: number;
  };
}

export interface WompiVerificationReport {
  publicKeyValid: boolean;
  privateKeyValid: boolean;
  merchant?: WompiMerchantDetails;
  latencyMs: number;
  recentTransactionsCount?: number;
  recentTransactions?: any[];
  integrityAlgorithmValid: boolean;
  testSignature?: string;
  error?: string;
}

/**
 * Validates the public key and fetches merchant details directly from Wompi's API
 */
export async function fetchWompiMerchant(
  publicKey: string = WOMPI_CONFIG.publicKey,
  env: 'production' | 'sandbox' = 'production'
): Promise<{ success: boolean; data?: WompiMerchantDetails; latencyMs: number; error?: string }> {
  const host = env === 'production' ? 'https://production.wompi.co' : 'https://sandbox.wompi.co';
  const start = performance.now();
  try {
    const res = await fetch(`${host}/v1/merchants/${encodeURIComponent(publicKey)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const elapsed = Math.round(performance.now() - start);

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, latencyMs: elapsed, error: `HTTP ${res.status}: ${errText}` };
    }

    const json = await res.json();
    return {
      success: true,
      data: json.data as WompiMerchantDetails,
      latencyMs: elapsed,
    };
  } catch (err: any) {
    return {
      success: false,
      latencyMs: Math.round(performance.now() - start),
      error: err.message || 'Error de conexión con servidores de Wompi',
    };
  }
}

/**
 * Validates the private key by querying transactions endpoint with Bearer authorization
 */
export async function fetchWompiTransactions(
  privateKey: string,
  env: 'production' | 'sandbox' = 'production',
  limit: number = 10
): Promise<{ success: boolean; transactions?: any[]; totalCount?: number; error?: string }> {
  const host = env === 'production' ? 'https://production.wompi.co' : 'https://sandbox.wompi.co';
  try {
    // Current date range covering the past and current year
    const fromDate = '2025-01-01T00:00:00Z';
    const untilDate = '2026-12-31T23:59:59Z';
    const url = `${host}/v1/transactions?from_date=${encodeURIComponent(fromDate)}&until_date=${encodeURIComponent(untilDate)}&page=1&page_size=${limit}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${privateKey.trim()}`,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `HTTP ${res.status}: ${errText}` };
    }

    const json = await res.json();
    return {
      success: true,
      transactions: json.data || [],
      totalCount: json.meta?.total_results || (json.data ? json.data.length : 0),
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Error al validar llave privada en Wompi',
    };
  }
}

/**
 * Complete diagnostics check for Wompi Production Setup
 */
export async function runWompiDiagnostics(
  publicKey: string = WOMPI_CONFIG.publicKey,
  privateKey: string = '',
  integritySecret: string = '',
  env: 'production' | 'sandbox' = 'production'
): Promise<WompiVerificationReport> {
  const merchantResult = await fetchWompiMerchant(publicKey, env);
  const txResult = privateKey
    ? await fetchWompiTransactions(privateKey, env, 5)
    : { success: false as const, error: 'Sin llave privada en el cliente (vive en el servidor).' };

  const testRef = '#DIAG-' + Date.now().toString(36).toUpperCase();
  const testAmount = 5000000; // $50.000 COP
  const signature = integritySecret
    ? await generateWompiIntegritySignature(testRef, testAmount, 'COP', integritySecret)
    : '';

  return {
    publicKeyValid: merchantResult.success,
    privateKeyValid: txResult.success,
    merchant: merchantResult.data,
    latencyMs: merchantResult.latencyMs,
    recentTransactionsCount: txResult.totalCount || 0,
    recentTransactions: txResult.transactions || [],
    integrityAlgorithmValid: signature.length === 64,
    testSignature: signature || undefined,
    error: merchantResult.error || txResult.error,
  };
}

export interface CheckoutSession {
  url: string;
  reference: string;
  amountInCents: number;
  currency: string;
  env: string;
}

/** Pide al backend la URL firmada del Widget Wompi. */
export async function createCheckoutSession(input: {
  reference: string;
  amountInCents: number;
  email?: string;
  fullName?: string;
  phone?: string;
  redirectUrl?: string;
}): Promise<CheckoutSession> {
  const redirectUrl =
    input.redirectUrl || `${window.location.origin}${window.location.pathname}?view=checkout`;
  const res = await fetch('/api/wompi/checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, redirectUrl }),
  });
  // Sin backend (hosting estático), el fallback SPA devuelve index.html con 200.
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || !contentType.includes('application/json')) {
    throw new Error(
      contentType.includes('application/json')
        ? ((await res.json().catch(() => ({}))) as { error?: string }).error || `Sesión Wompi falló (HTTP ${res.status}).`
        : 'Pagos no disponibles: inicia el backend (npm run server).'
    );
  }
  return (await res.json()) as CheckoutSession;
}

export interface VerifiedTransaction {
  id: string;
  status: string;
  reference: string;
  amount_in_cents: number;
  currency: string;
  payment_method_type?: string;
  customer_email?: string;
}

/** Verifica una transacción contra Wompi vía backend (llave privada en servidor). */
export async function verifyWompiTransaction(transactionId: string): Promise<VerifiedTransaction> {
  const res = await fetch(`/api/wompi/transaction/${encodeURIComponent(transactionId)}`);
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || !contentType.includes('application/json')) {
    throw new Error('Verificación no disponible sin backend (inicia el servidor).');
  }
  const json = (await res.json()) as { transaction: VerifiedTransaction };
  return json.transaction;
}

/** Lista transacciones recientes vía backend. null = backend no disponible. */
export async function fetchServerTransactions(limit = 10): Promise<any[] | null> {
  try {
    const res = await fetch(`/api/wompi/transactions?limit=${limit}`);
    if (!res.ok) return null;
    const json = (await res.json()) as { transactions?: any[] };
    return json.transactions || null;
  } catch {
    return null;
  }
}

/** Estado del backend (llaves Wompi/Supabase/WhatsApp configuradas). null = sin backend. */
export async function fetchBackendHealth(): Promise<any | null> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Lee el id de transacción que Wompi anexa al redirect-url (?id=<txId>). */
export function getWompiRedirectTxId(): string | null {
  try {
    return new URLSearchParams(window.location.search).get('id');
  } catch {
    return null;
  }
}

// SHA-256 de integridad. El secreto NUNCA viene del bundle: se usa solo
// cuando el usuario lo pega manualmente (calculadora) o en el servidor.
export async function generateWompiIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string = 'COP',
  secret: string = ''
): Promise<string> {
  const message = `${reference}${amountInCents}${currency}${secret}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function formatCOP(amountInCents: number): string {
  const pesos = Math.round(amountInCents / 100);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })
    .format(pesos)
    .replace('COP', '')
    .trim();
}

export function formatCOPFull(amountInCents: number): string {
  return `${formatCOP(amountInCents)} COP`;
}

export const COLOMBIAN_BANKS = [
  { id: '1007', name: 'Bancolombia' },
  { id: '1051', name: 'Banco Davivienda' },
  { id: '1001', name: 'Banco de Bogotá' },
  { id: '1013', name: 'BBVA Colombia' },
  { id: '1023', name: 'Banco de Occidente' },
  { id: '1002', name: 'Banco Popular' },
  { id: '1006', name: 'Banco Itaú' },
  { id: '1040', name: 'Banco Agrario' },
  { id: '1052', name: 'Banco AV Villas' },
  { id: '1061', name: 'Banco Falabella' },
  { id: '1062', name: 'Banco Finandina' },
  { id: '1066', name: 'Banco Cooperativo Coopcentral' },
  { id: '1060', name: 'Banco Pichincha' },
  { id: '1063', name: 'Banco Santander Colombia' },
  { id: '1065', name: 'Banco Serfinanza' },
  { id: '1507', name: 'Nequi' },
  { id: '1053', name: 'Daviplata' },
  { id: '1081', name: 'Lulo Bank' },
  { id: '1082', name: 'Nu Colombia (Nubank)' },
  { id: '1083', name: 'Ualá Colombia' },
  { id: '1084', name: 'RappiPay' },
  { id: '1085', name: 'Dale!' },
  { id: '1086', name: 'Iris Neobanco' },
  { id: '1087', name: 'Cootradian' },
  { id: '1088', name: 'Financiera Juriscoop' },
];

export const COLOMBIAN_DEPARTMENTS = [
  {
    name: 'Bogotá D.C.',
    cities: ['Bogotá D.C. (Urbano)', 'Soacha', 'Chía', 'Cajicá', 'Zipaquirá', 'Mosquera', 'Funza', 'Madrid', 'Facatativá'],
  },
  {
    name: 'Antioquia',
    cities: ['Medellín', 'Envigado', 'Itagüí', 'Bello', 'Sabaneta', 'Rionegro', 'La Ceja', 'Apartadó', 'Turbo'],
  },
  {
    name: 'Valle del Cauca',
    cities: ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Cartago', 'Buga', 'Yumbo', 'Jamundí'],
  },
  {
    name: 'Atlántico',
    cities: ['Barranquilla', 'Soledad', 'Malambo', 'Puerto Colombia', 'Baranoa', 'Sabanalarga'],
  },
  {
    name: 'Santander',
    cities: ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja', 'San Gil'],
  },
  {
    name: 'Bolívar',
    cities: ['Cartagena de Indias', 'Magangué', 'Turbaco', 'Arjona', 'El Carmen de Bolívar'],
  },
  {
    name: 'Cundinamarca',
    cities: ['Girardot', 'Fusagasugá', 'Facatativá', 'Chía', 'Zipaquirá', 'Cota', 'Sopó'],
  },
  {
    name: 'Risaralda',
    cities: ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia'],
  },
  {
    name: 'Caldas',
    cities: ['Manizales', 'Villamaría', 'Chinchiná', 'La Dorada', 'Riosucio'],
  },
  {
    name: 'Quindío',
    cities: ['Armenia', 'Calarcá', 'Montenegro', 'La Tebaida', 'Quimbaya', 'Salento'],
  },
  {
    name: 'Norte de Santander',
    cities: ['Cúcuta', 'Villa del Rosario', 'Los Patios', 'Ocaña', 'Pamplona'],
  },
  {
    name: 'Tolima',
    cities: ['Ibagué', 'Espinal', 'Melgar', 'Chaparral', 'Honda'],
  },
  {
    name: 'Huila',
    cities: ['Neiva', 'Pitalito', 'Garzón', 'La Plata'],
  },
  {
    name: 'Magdalena',
    cities: ['Santa Marta', 'Ciénaga', 'Fundación', 'El Banco'],
  },
  {
    name: 'Meta',
    cities: ['Villavicencio', 'Acacías', 'Granada', 'Puerto López'],
  },
  {
    name: 'Cesar',
    cities: ['Valledupar', 'Aguachica', 'Agustín Codazzi', 'Bosconia'],
  },
  {
    name: 'Córdoba',
    cities: ['Montería', 'Cereté', 'Sahagún', 'Lorica', 'Montelíbano'],
  },
];
