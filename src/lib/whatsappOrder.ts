import { formatCOP } from './wompi';
import type { Order } from '../types';

export const DEFAULT_MERCHANT_WHATSAPP = '+57 300 987 6543';

/** Dígitos internacionales del WhatsApp del negocio (una sola fuente). */
export function getMerchantWhatsAppDigits(supportPhone?: string): string {
  const digits = (supportPhone || DEFAULT_MERCHANT_WHATSAPP).replace(/\D/g, '');
  if (!digits) return '573009876543';
  return digits.startsWith('57') ? digits : `57${digits}`;
}

/** Enlace wa.me con texto prellenado. */
export function waLink(digits: string, text: string): string {
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** Mensaje de pedido para confirmar la compra por WhatsApp (canal sin backend). */
export function buildWhatsAppOrderMessage(order: Order, couponCode?: string | null): string {
  const lines: string[] = [
    '🛍️ *NUEVO PEDIDO — TU TIENDA A LA MANO*',
    `🧾 Ref: ${order.reference}`,
    '',
    `👤 ${order.customer.fullName}`,
    `📞 ${order.customer.phone}`,
    `📍 ${order.customer.address}, ${order.customer.city}`,
    '',
    '*Productos:*',
    ...order.items.map(
      (it) =>
        `• ${it.quantity}x ${it.productTitle} (${it.selectedSize}, ${it.selectedColor}) — $${formatCOP(it.totalPriceInCents)}`
    ),
    '',
    `Subtotal: $${formatCOP(order.subtotalInCents)}`,
  ];
  if (order.discountInCents > 0) {
    lines.push(`Descuento${couponCode ? ` (${couponCode})` : ''}: -$${formatCOP(order.discountInCents)}`);
  }
  lines.push(`Envío: ${order.shippingInCents > 0 ? `$${formatCOP(order.shippingInCents)}` : 'GRATIS'}`);
  lines.push(`*TOTAL: $${formatCOP(order.totalAmountInCents)} COP*`);
  lines.push('');
  lines.push('Quiero coordinar el pago por este chat. ¡Gracias!');
  return lines.join('\n');
}
