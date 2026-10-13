/**
 * Navegación centralizada de la tienda.
 * Todos los botones/CTA (hero, bloques del maquetador, footer) deben pasar por aquí
 * para que sigan funcionando aunque se cambie el tema o el layout.
 */

export type StoreNavActions = {
  setActiveView: (view: 'home' | 'checkout' | 'product-detail' | 'login' | 'admin') => void;
  setActiveCategoryFilter?: (cat: string | null) => void;
  openOrderTracking?: (query?: string) => void;
  showToast?: (msg: string) => void;
};

export const CATALOG_ANCHOR_IDS = [
  'catalog-section',
  'catalogo-drops',
  'catalogo-productos',
  'drops-urbanos',
  'catalog-browser',
  'product-catalog',
  'showcase-rail',
  'categorias-grid',
  'catalog',
];

export function scrollToCatalog(fallbackTop = true): boolean {
  if (typeof document === 'undefined') return false;
  for (const id of CATALOG_ANCHOR_IDS) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    }
  }
  // Bloques del maquetador con id único (product-catalog-<blockId>, etc.).
  const prefixed = document.querySelector('[id^="product-catalog"], [id^="catalog-browser"]');
  if (prefixed) {
    prefixed.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }
  if (fallbackTop) {
    window.scrollTo({ top: window.innerHeight * 0.6, behavior: 'smooth' });
  }
  return false;
}

export function scrollToElementId(id: string): boolean {
  if (typeof document === 'undefined' || !id) return false;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }
  return false;
}

function goHomeAndScrollCatalog(actions: StoreNavActions): void {
  try {
    actions.setActiveView('home');
  } catch {
    // ignore
  }
  try {
    actions.setActiveCategoryFilter?.(null);
  } catch {
    // ignore
  }
  setTimeout(() => {
    const found = scrollToCatalog(true);
    if (!found) {
      actions.showToast?.('Explorando catálogo completo');
    }
  }, 80);
}

/**
 * Resuelve cualquier buttonLink configurado en el maquetador o temas.
 * Soporta: #catalog*, #checkout, #rastreo/#pedido, #reviews, #comunidad,
 * #confianza, anclas genéricas (#mi-id), URLs externas y WhatsApp.
 * Siempre ejecuta una acción visible: nunca deja el botón estático.
 */
export function handleStoreButtonLink(
  rawLink: string | undefined | null,
  actions: StoreNavActions,
): void {
  const link = (rawLink || '').trim();

  // Sin enlace: ir al catálogo (comportamiento histórico).
  if (!link || link === '#') {
    goHomeAndScrollCatalog(actions);
    return;
  }

  const lower = link.toLowerCase();

  // URLs externas / WhatsApp: abrir en pestaña nueva.
  if (/^(https?:\/\/|wa\.me|whatsapp:)/i.test(link)) {
    try {
      window.open(link, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = link;
    }
    return;
  }

  // Checkout directo (Wompi).
  if (lower === '#checkout' || lower === 'checkout') {
    actions.setActiveView('checkout');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 60);
    return;
  }

  // Rastreo de pedido.
  if (
    lower.includes('rastreo') ||
    lower.includes('pedido') ||
    lower.includes('tracking') ||
    lower.includes('order-tracking') ||
    lower === '#rastreo'
  ) {
    try {
      if (actions.openOrderTracking) {
        actions.openOrderTracking('');
        return;
      }
    } catch {
      // fallback abajo
    }
    actions.setActiveView('home');
    setTimeout(() => actions.openOrderTracking?.(''), 120);
    return;
  }

  // Reseñas / opiniones.
  if (lower.includes('review') || lower.includes('opinion') || lower.includes('testimon')) {
    actions.setActiveView('home');
    setTimeout(() => {
      if (!scrollToElementId('reviews-section')) scrollToCatalog(true);
    }, 80);
    return;
  }

  // Comunidad / lookbook.
  if (lower.includes('comunidad') || lower.includes('lookbook') || lower.includes('community')) {
    actions.setActiveView('home');
    setTimeout(() => {
      if (!scrollToElementId('comunidad-lookbook')) scrollToCatalog(true);
    }, 80);
    return;
  }

  // Confianza / pagos.
  if (lower.includes('confianza') || lower.includes('pagos') || lower.includes('trust') || lower.includes('wompi')) {
    actions.setActiveView('home');
    setTimeout(() => {
      if (!scrollToElementId('confianza-pagos')) scrollToCatalog(true);
    }, 80);
    return;
  }

  // Catálogo / drops / tienda (todas las variantes históricas).
  if (
    lower.includes('catalog') ||
    lower.includes('drops') ||
    lower.includes('tienda') ||
    lower.includes('store') ||
    lower.includes('coleccion') ||
    lower.includes('colección') ||
    lower === '#ver-drop' ||
    lower === '#ir-drop'
  ) {
    goHomeAndScrollCatalog(actions);
    return;
  }

  // Ancla genérica: #mi-seccion -> busca el id en el DOM.
  if (link.startsWith('#')) {
    const id = link.slice(1);
    actions.setActiveView('home');
    setTimeout(() => {
      if (!scrollToElementId(id)) scrollToCatalog(true);
    }, 80);
    return;
  }

  // Cualquier otro texto: trátalo como URL externa si parece dominio.
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(link)) {
    try {
      window.open(`https://${link}`, '_blank', 'noopener,noreferrer');
    } catch {
      goHomeAndScrollCatalog(actions);
    }
    return;
  }

  // Fallback final: nunca dejar el botón muerto.
  goHomeAndScrollCatalog(actions);
}
