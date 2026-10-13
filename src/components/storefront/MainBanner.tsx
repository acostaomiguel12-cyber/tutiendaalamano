import React, { useMemo } from 'react';
import { ArrowRight, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { handleStoreButtonLink } from '../../lib/storeNavigation';
import { CarouselMedia } from './CarouselMedia';
import type { Product } from '../../types';

/**
 * Banner único de la tienda (arriba del home): formato dividido claro con
 * textos del tema (editables en el personalizador) y carrusel de 6 productos
 * destacados — tocar la foto abre el producto.
 */
export const MainBanner: React.FC = () => {
  const {
    products,
    openQuickView,
    setActiveView,
    setActiveCategoryFilter,
    openOrderTracking,
    showToast,
    themeConfig,
  } = useStore();

  if (themeConfig.showHero === false) {
    return null;
  }

  // 6 productos rotando, uno por departamento para variar.
  const bannerProducts: Product[] = useMemo(() => {
    const active = products.filter((p) => p.active !== false && p.mainImage && p.mainImage.trim() !== '');
    const byDept = new Map<string, Product[]>();
    for (const p of active) {
      const d = (p.category || 'Otros').trim() || 'Otros';
      if (!byDept.has(d)) byDept.set(d, []);
      byDept.get(d)!.push(p);
    }
    const lists = Array.from(byDept.values());
    const picked: Product[] = [];
    let guard = 0;
    while (picked.length < 6 && lists.some((l) => l.length > 0) && guard < 50) {
      guard += 1;
      for (const l of lists) {
        if (picked.length >= 6) break;
        const next = l.shift();
        if (next) picked.push(next);
      }
    }
    return picked;
  }, [products]);

  const gallery =
    bannerProducts.length >= 2
      ? bannerProducts.map((p) => p.mainImage)
      : themeConfig.heroGalleryUrls && themeConfig.heroGalleryUrls.length > 0
      ? themeConfig.heroGalleryUrls
      : [themeConfig.heroImageUrl].filter(Boolean);

  const handleExplore = () => {
    handleStoreButtonLink('#catalog', {
      setActiveView,
      setActiveCategoryFilter,
      openOrderTracking,
      showToast,
    });
  };

  const handleSlideClick = (index: number) => {
    const prod = bannerProducts[index % Math.max(bannerProducts.length, 1)];
    if (prod) openQuickView(prod);
  };

  return (
    <section className="bg-[#faf6ef] border-b border-amber-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
        {/* Columna de texto (editable en Diseño → Personalizador) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5 order-2 lg:order-1">
          {themeConfig.showHeroTexts !== false && (
            <>
              {themeConfig.showHeroTagline !== false && (
                <span
                  className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                  style={{ backgroundColor: `${themeConfig.primaryColor}14`, color: themeConfig.primaryColor }}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: themeConfig.primaryColor }}
                  />
                  {themeConfig.heroTagline ?? 'TU TIENDA A LA MANO // COLOMBIA'}
                </span>
              )}
              {themeConfig.showHeroHeadline !== false && (
                <h1
                  className={`text-3xl sm:text-5xl font-black uppercase tracking-tight leading-[1.05] text-zinc-950 ${
                    themeConfig.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
                  }`}
                >
                  {themeConfig.heroHeadline ?? 'TODO LO QUE BUSCAS, A LA MANO'}
                </h1>
              )}
              {themeConfig.showHeroSubheadline !== false && (
                <p className="text-sm sm:text-base leading-relaxed max-w-xl text-zinc-600">
                  {themeConfig.heroSubheadline ??
                    'Catálogo con precios claros, compra en pocos clics y pago seguro. Envíos rápidos a toda Colombia.'}
                </p>
              )}
            </>
          )}
          {themeConfig.showHeroTexts !== false && themeConfig.showHeroButtons !== false && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
              <button
                onClick={handleExplore}
                className="px-7 py-3.5 rounded-2xl text-xs font-black tracking-widest uppercase transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-white"
                style={{ backgroundColor: themeConfig.primaryColor }}
              >
                <span>{themeConfig.heroButtonText ?? 'EXPLORAR CATÁLOGO'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-zinc-500 font-mono text-center sm:text-left">
                👆 Toca la foto para ver el producto
              </span>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 max-w-lg pt-1">
            {[
              { icon: Truck, title: 'Envío 24-48h', sub: 'Toda Colombia' },
              { icon: ShieldCheck, title: 'Pago seguro', sub: 'Wompi · Nequi' },
              { icon: RotateCcw, title: 'Garantía', sub: 'Cambios fácil' },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.title} className="flex items-center gap-2 bg-white border border-amber-100 rounded-2xl px-2.5 py-2 shadow-xs">
                  <Icon className="w-4 h-4 shrink-0" style={{ color: themeConfig.primaryColor }} />
                  <div>
                    <p className="text-[11px] font-black text-zinc-900 leading-tight">{t.title}</p>
                    <p className="text-[10px] text-zinc-500">{t.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tarjeta visual dividida con 6 productos rotando */}
        <div className="lg:col-span-5 w-full order-1 lg:order-2">
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-amber-100">
            <CarouselMedia
              images={gallery}
              alt="Productos destacados"
              fit="cover"
              position="center"
              zoom={100}
              intervalSec={5}
              onSlideClick={bannerProducts.length >= 2 ? handleSlideClick : undefined}
            />
            <span className="absolute top-3 left-3 z-20 bg-black/65 backdrop-blur text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
              ⭐ Destacados
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
