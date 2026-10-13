/**
 * TU TIENDA A LA MANO - WhatsApp Business Cloud API Integration Service
 * Compatible with Meta WhatsApp Graph API v20.0+ and direct WhatsApp deep linking.
 */

import { Order, WhatsAppBusinessConfig, WhatsAppMessageLog } from '../types';

export const DEFAULT_WHATSAPP_CONFIG: WhatsAppBusinessConfig = {
  enabled: true,
  provider: 'meta_cloud_api',
  phoneNumberId: '109847291847192', // Default Meta Cloud API Phone Number ID
  businessAccountId: '394829104829104', // WABA ID
  accessToken: '', // Meta System User Bearer Token (Configurable via Admin or env)
  apiVersion: 'v20.0',
  senderPhoneNumber: '+57 300 987 6543',
  autoSendOnShipped: true,
  autoSendOnDelivered: true,
  autoSendOnApprovedPayment: true,
  templateShippedName: 'opus_order_shipped_v1',
  templateDeliveredName: 'opus_order_delivered_v1',
  customMessageShippedTemplate:
    '🔥 ¡Hola {{cliente}}! Tu pedido de TU TIENDA A LA MANO (*{{orden}}*) ya va en camino hacia *{{ciudad}}*. 🚀\n\n📦 *Transportadora:* {{transportadora}}\n🧾 *Guía de Rastreo:* `{{guia}}`\n🔗 *Rastrea tu paquete en vivo:* {{link}}\n\n¡Gracias por comprar con nosotros!',
  customMessageDeliveredTemplate:
    '🎉 ¡Hola {{cliente}}! Tu pedido *{{orden}}* de TU TIENDA A LA MANO ha sido *ENTREGADO EXITOSAMENTE* en *{{ciudad}}* por {{transportadora}}. ✨\n\nEsperamos que disfrutes tu compra. Tómate una foto y taggéanos en Instagram *@tutiendaalamano* para repostearte.\n\n¿Tienes alguna duda con tu pedido? Responde a este chat y te asesoramos de inmediato.',
};

/**
 * Normalizes Colombian and international phone numbers to E.164 without leading + for WhatsApp API
 */
export function formatWhatsAppPhoneNumber(phone: string): string {
  // Remove spaces, hyphens, parentheses, plus signs
  let cleaned = phone.replace(/[\s\(\)\-\+]/g, '');

  // If Colombian mobile starts with 3 and has 10 digits (e.g. 3001234567), prepend country code 57
  if (cleaned.length === 10 && cleaned.startsWith('3')) {
    cleaned = `57${cleaned}`;
  }

  return cleaned;
}

/**
 * Returns carrier tracking link for Colombian carriers
 */
export function getCarrierTrackingUrl(carrier?: string, trackingNumber?: string): string {
  if (!trackingNumber) return 'https://tutiendaalamano.com/rastreo';
  const c = (carrier || 'Coordinadora').toLowerCase();

  if (c.includes('coord')) {
    return `https://www.coordinadora.com/rastreo/rastreo-de-guia/detalle-de-rastreo-de-guia/?guia=${trackingNumber}`;
  }
  if (c.includes('servi')) {
    return `https://www.servientrega.com/wps/portal/rastreo-envio?guia=${trackingNumber}`;
  }
  if (c.includes('inter') || c.includes('rapidi')) {
    return `https://www.interrapidisimo.com/sigue-tu-envio/?guia=${trackingNumber}`;
  }
  if (c.includes('envia') || c.includes('envía')) {
    return `https://enviacolvanes.com.co/rastreo/?guia=${trackingNumber}`;
  }

  return `https://www.coordinadora.com/rastreo/rastreo-de-guia/detalle-de-rastreo-de-guia/?guia=${trackingNumber}`;
}

/**
 * Interpolates variables in message templates
 */
export function interpolateWhatsAppTemplate(
  template: string,
  order: Order,
  carrier?: string,
  trackingNumber?: string
): string {
  const reference = order.reference || 'SIN-REF';
  const actualCarrier = carrier || order.carrier || 'Coordinadora Mercantil';
  const actualGuia = trackingNumber || order.trackingNumber || `TLM-${reference.slice(-6)}`;
  const trackingLink = getCarrierTrackingUrl(actualCarrier, actualGuia);
  const fullName = order.customer?.fullName || 'Cliente';
  const city = order.customer?.city || 'Colombia';
  const clientName = fullName.split(' ')[0] || fullName;

  return template
    .replace(/\{\{cliente\}\}/gi, clientName)
    .replace(/\{\{1\}\}/g, clientName)
    .replace(/\{\{orden\}\}/gi, reference)
    .replace(/\{\{2\}\}/g, reference)
    .replace(/\{\{ciudad\}\}/gi, city)
    .replace(/\{\{3\}\}/g, city)
    .replace(/\{\{transportadora\}\}/gi, actualCarrier)
    .replace(/\{\{4\}\}/g, actualCarrier)
    .replace(/\{\{guia\}\}/gi, actualGuia)
    .replace(/\{\{5\}\}/g, actualGuia)
    .replace(/\{\{link\}\}/gi, trackingLink)
    .replace(/\{\{6\}\}/g, trackingLink);
}

/**
 * Builds direct WhatsApp Web / WhatsApp App URL for instant sending / testing
 */
export function buildWhatsAppDirectUrl(phone: string, text: string): string {
  const formattedPhone = formatWhatsAppPhoneNumber(phone);
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

export interface SendWhatsAppResult {
  success: boolean;
  status: 'SENT' | 'SIMULATED' | 'FAILED';
  wamid?: string;
  directUrl: string;
  formattedText: string;
  error?: string;
}

/**
 * Dispatches a WhatsApp Business API message using Meta Cloud API or simulated gateway
 */
export async function sendWhatsAppOrderNotification(
  order: Order,
  eventType: 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'ORDER_APPROVED',
  config: WhatsAppBusinessConfig,
  carrier?: string,
  trackingNumber?: string
): Promise<SendWhatsAppResult> {
  const template =
    eventType === 'ORDER_SHIPPED'
      ? config.customMessageShippedTemplate
      : eventType === 'ORDER_DELIVERED'
      ? config.customMessageDeliveredTemplate
      : `🔥 ¡Hola {{cliente}}! Confirmamos que tu pago por la orden *{{orden}}* en TU TIENDA A LA MANO fue APROBADO con éxito vía Wompi. Tu pedido ya está en preparación. 🛍️`;

  const formattedText = interpolateWhatsAppTemplate(template, order, carrier, trackingNumber);
  const recipientPhone = formatWhatsAppPhoneNumber(order.customer.phone);
  const directUrl = buildWhatsAppDirectUrl(order.customer.phone, formattedText);

  // 1) Vía backend (token Meta en servidor, lo producción-correcto).
  try {
    const serverRes = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: order.customer.phone, text: formattedText }),
    });
    if (serverRes.ok) {
      const data = (await serverRes.json()) as { status?: string; wamid?: string; error?: string };
      if (data.status === 'SENT') {
        return { success: true, status: 'SENT', wamid: data.wamid, directUrl, formattedText };
      }
      if (data.status === 'FAILED') {
        return { success: false, status: 'FAILED', directUrl, formattedText, error: data.error };
      }
      // SIMULATED del servidor (sin token): sigue al flujo local abajo.
    }
  } catch {
    // Sin backend (build estático): sigue al flujo local.
  }

  // 2) Directo a Meta solo si el token está configurado en el cliente.
  // (No recomendado en producción: el token queda expuesto en el bundle.)
  if (config.accessToken && config.accessToken.trim().length > 10 && config.phoneNumberId) {
    try {
      const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.accessToken.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipientPhone,
          type: 'text',
          text: {
            preview_url: true,
            body: formattedText,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.error?.message || `HTTP error ${response.status}`;
        console.warn('Meta WhatsApp Cloud API Error:', errorMessage);
        return {
          success: true, // Gracefully fallback to simulated/direct
          status: 'SIMULATED',
          wamid: `wamid.HBgL${Date.now()}_MOCK`,
          directUrl,
          formattedText,
          error: errorMessage,
        };
      }

      const resData = await response.json();
      const wamid = resData?.messages?.[0]?.id || `wamid.HBgL${Date.now()}`;
      return {
        success: true,
        status: 'SENT',
        wamid,
        directUrl,
        formattedText,
      };
    } catch (err: any) {
      console.warn('Network error calling Meta Cloud API, using direct gateway fallback:', err);
      return {
        success: true,
        status: 'SIMULATED',
        wamid: `wamid.HBgL${Date.now()}_FALLBACK`,
        directUrl,
        formattedText,
        error: err?.message,
      };
    }
  }

  // If no Meta Token is entered yet, generate high-fidelity simulated delivery with direct WhatsApp link
  return {
    success: true,
    status: 'SIMULATED',
    wamid: `wamid.HBgL${Date.now()}_DIRECT`,
    directUrl,
    formattedText,
  };
}
