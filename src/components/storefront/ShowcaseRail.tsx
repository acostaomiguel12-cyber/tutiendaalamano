import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, Pin, ShoppingBag } from 'lucide-react';
import { useStore, orderedShowcasePinnedIds } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import { handleImgError } from '../../lib/images';
import { Product } from '../../types';

/**
 * Vitrina principal: productos fijados (pin, siempre visibles) + ventana
 * rotativa del resto del catálogo que avanza cada showcaseIntervalSec.
 * Se pausa al pasar el mouse. Acepta overrides (bloque del maquetador);
 * por defecto usa la config global del tema.
 */
export const ShowcaseRail: React.FC<{
  title?: string;
  subtitle?: string;
  rotateCount?: number;
  intervalSec?: number;
  /** Como bloque del maquetador: ignora gates globales (filtros/búsqueda). */
  asBlock?: boolean;
}> = ({ title: titleOverride, subtitle: subtitleOverride, rotateCount: rotateOverride, intervalSec: intervalOverride, asBlock = false }) => {
  const {
    products,
    themeConfig,
    openQuickView,
    addToCart,
    activeCategoryFilter,
    searchQuery,
  } = useStore();

  const [offset, setOffset] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const enabled = themeConfig.showcaseEnabled !== false;
  const rotateCount = Math.min(
    Math.max(rotateOverride || themeConfig.showcaseRotateCount || 4, 1),
    10
  );
  const intervalSec = Math.min(
    Math.max(intervalOverride || themeConfig.showcaseIntervalSec || 8, 3),
    120
  );

  const pinned = useMemo(() => {
    const ids = orderedShowcasePinnedIds(themeConfig, products);
    const byId = new Map<string, Product>(products.map((p) => [p.id, p]));
    return ids
      .map((id) => byId.get(id))
      .filter((p): p is Product => !!p && p.active !== false);
  }, [products, themeConfig.showcasePinnedIds]);
  const pool = useMemo(() => {
    const pinnedIds = new Set(pinned.map((p) => p.id));
    const rest = products.filter((p) => p.active !== false && !pinnedIds.has(p.id));
    // Nuevos primero (orden del catálogo) salvo que se pida por ventas.
    if (themeConfig.showcaseNewFirst === false) {
      return [...rest].sort((a, b) => (b.salesLast24h || 0) - (a.salesLast24h || 0));
    }
    return rest;
  }, [products, pinned, themeConfig.showcaseNewFirst]);

  // Ventana rotativa cíclica sobre el pool.
  const rotating = useMemo(() => {
    if (pool.length === 0) return [];
    const out: Product[] = [];
    for (let i = 0; i < Math.min(rotateCount, pool.length); i++) {
      out.push(pool[(offset + i) % pool.length]);
    }
    return out;
  }, [pool, offset, rotateCount]);

  useEffect(() => {
    setOffset(0);
  }, [pool.length, rotateCount]);

  useEffect(() => {
    if (paused || pool.length <= rotateCount) return;
    timerRef.current = setInterval(() => {
      setOffset((prev) => (prev + rotateCount) % Math.max(pool.length, 1));
    }, intervalSec * 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, pool.length, rotateCount, intervalSec]);

  if (!asBlock && (!enabled || activeCategoryFilter || searchQuery)) return null;
  if (pinned.length === 0 && pool.length === 0) return null;

  const isDark = themeConfig.mode === 'dark';
  const totalPages = Math.max(1, Math.ceil(pool.length / rotateCount));
  const currentPage = pool.length === 0 ? 0 : Math.floor(offset / rotateCount) % totalPages;

  const step = (dir: 1 | -1) => {
    if (pool.length === 0) return;
    setOffset((prev) => (prev + dir * rotateCount + pool.length * totalPages) % (pool.length || 1));
  };

  const quickAdd = (e: React.MouseEvent, prod: Product) => {
    e.stopPropagation();
    const size = prod.availableSizes?.[0] || 'M';
    const color = prod.availableColors?.[0]?.name || 'Standard';
    addToCart(prod, size, color, 1);
  };

  const renderCard = (prod: Product, fixed: boolean) => {
    const price = prod.variants?.[0]?.priceInCents || 0;
    return (
      <div
        key={prod.id + (fixed ? '-fixed' : '-rot')}
        onClick={() => openQuickView(prod)}
        className={`group relative shrink-0 w-40 sm:w-52 snap-start cursor-pointer rounded-2xl overflow-hidden border transition-transform hover:-translate-y-0.5 ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'
        }`}
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={prod.mainImage}
            alt={prod.title}
            loading="lazy"
            onError={handleImgError}
            className="w-full h-full object-cover"
            style={{ objectPosition: prod.imagePosition || 'center' }}
          />
          {fixed && (
            <span className="absolute top-2 left-2 flex items-center gap-1 bg-zinc-950/85 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
              <Pin className="w-2.5 h-2.5" /> FIJO
            </span>
          )}
          {prod.badge && (
            <span className="absolute top-2 right-2 bg-amber-400 text-black text-[9px] font-mono font-bold px-2 py-0.5 rounded-full max-w-[90px] truncate">
              {prod.badge}
            </span>
          )}
        </div>
        <div className="p-2.5 space-y-1">
          <h4 className={`text-[11px] font-bold uppercase truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {prod.title}
          </h4>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              ${formatCOP(price)}
            </span>
            <button
              onClick={(e) => quickAdd(e, prod)}
              className="p-1.5 rounded-lg text-white transition-transform active:scale-90"
              style={{ backgroundColor: themeConfig.primaryColor }}
              title="Añadir a la bolsa"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="showcase-rail"
      aria-label="Vitrina destacada"
      className={`py-8 px-4 sm:px-6 border-b scroll-mt-24 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}
    >
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>Destacados</span>
            </div>
            {(titleOverride !== undefined
              ? titleOverride
              : themeConfig.showcaseTitle !== undefined
                ? themeConfig.showcaseTitle
                : 'Vitrina Tu Tienda a la Mano') ? (
            <h2 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {titleOverride !== undefined
                ? titleOverride
                : themeConfig.showcaseTitle !== undefined
                  ? themeConfig.showcaseTitle
                  : 'Vitrina Tu Tienda a la Mano'}
            </h2>
            ) : null}
            {(subtitleOverride !== undefined ? subtitleOverride : themeConfig.showcaseSubtitle) ? (
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {subtitleOverride !== undefined ? subtitleOverride : themeConfig.showcaseSubtitle}
              </p>
            ) : null}
          </div>
          {pool.length > rotateCount && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-zinc-400">
                {currentPage + 1}/{totalPages} • rota cada {intervalSec}s
              </span>
              <button
                onClick={() => step(-1)}
                className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'border-zinc-700 text-zinc-300' : 'border-zinc-300 text-zinc-700'}`}
                title="Anteriores"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => step(1)}
                className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'border-zinc-700 text-zinc-300' : 'border-zinc-300 text-zinc-700'}`}
                title="Siguientes"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 snap-x"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {pinned.map((p) => renderCard(p, true))}
          {rotating.map((p) => renderCard(p, false))}
        </div>
      </div>
    </section>
  );
};
