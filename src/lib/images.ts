/** Imagen de respaldo cuando la foto del producto falla (URL rota, 429, offline). */
export const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80';

import type { SyntheticEvent } from 'react';

/** onError para <img>: evita el icono roto reemplazando una sola vez. */
export function handleImgError(e: SyntheticEvent<HTMLImageElement>) {
  const el = e.currentTarget;
  if (el.src !== FALLBACK_PRODUCT_IMAGE) {
    el.src = FALLBACK_PRODUCT_IMAGE;
  }
}
