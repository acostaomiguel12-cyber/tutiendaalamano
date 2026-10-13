import React, { useEffect, useRef, useState } from 'react';
import { Star, Plus, ArrowRight, BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import { handleImgError } from '../../lib/images';
import { scrollToCatalog } from '../../lib/storeNavigation';

interface CampaignSlide {
  dept: string;
  tagline: string;
  titleA: string;
  titleB: string;
  sub: string;
  bg: string;
  button: string;
}

const SLIDES: CampaignSlide[] = [
  {
    dept: 'Café e Infusiones',
    tagline: 'Marca de la casa',
    titleA: 'CLUB DEL CAFÉ',
    titleB: 'A LA MANO',
    sub: 'Café especial del Huila e infusiones naturales, tostados cada semana. Precio de origen y envío a toda Colombia.',
    bg: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1600&q=80',
    button: 'Ver cafés e infusiones',
  },
  {
    dept: 'Ropa',
    tagline: 'Lo más pedido',
    titleA: 'VISTE A LA MODA',
    titleB: 'A LA MANO',
    sub: 'Prendas cómodas y duraderas para todos los días, con tallas reales y precios claros.',
    bg: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
    button: 'Ver ropa',
  },
  {
    dept: 'Hogar',
    tagline: 'Tu casa hermosa',
    titleA: 'HOGAR QUE ABRAZA',
    titleB: 'A LA MANO',
    sub: 'Decoración e iluminación cálida para renovar tus espacios sin remodelar.',
    bg: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
    button: 'Ver hogar',
  },
  {
    dept: 'Mascotas',
    tagline: 'Engríelos',
    titleA: 'FELICIDAD PELUDA',
    titleB: 'A LA MANO',
    sub: 'Snacks naturales y accesorios para perros y gatos felices y saludables.',
    bg: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1600&q=80',
    button: 'Ver mascotas',
  },
  {
    dept: 'Accesorios',
    tagline: 'Detalles top',
    titleA: 'DETALLES QUE SUMAN',
    titleB: 'A LA MANO',
    sub: 'Relojes, gafas y complementos para coronar tu estilo todos los días.',
    bg: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1600&q=80',
    button: 'Ver accesorios',
  },
];

/**
 * Banner rotativo por departamento: cada slide cambia fondo, productos
 * y botón a la categoría. Avance automático + flechas + puntos.
 */
export const CampaignBanner: React.FC = () => {
  const {
    products,
    addToCart,
    openQuickView,
    setActiveCategoryFilter,
    setActiveView,
    themeConfig,
  } = useStore();

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = SLIDES.length;

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (paused || reduced) return;
    const t = setInterval(() => setIndex((p) => (p + 1) % count), 6000);
    return () => clearInterval(t);
  }, [paused, count]);

  const slide = SLIDES[index % count];
  const slideProducts = products
    .filter((p) => p.active !== false && (p.category || '').toLowerCase().includes(slide.dept.toLowerCase()))
    .slice(0, 2);

  const go = (next: number) => setIndex(((next % count) + count) % count);

  const handleSeeAll = () => {
    setActiveView('home');
    setActiveCategoryFilter(slide.dept);
    setTimeout(() => scrollToCatalog(true), 70);
  };

  const handleQuickAdd = (e: React.MouseEvent, prodId: string) => {
    e.stopPropagation();
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    addToCart(prod, prod.availableSizes?.[0] || 'Única', (prod.availableColors?.[0] as any)?.name || 'Estándar', 1);
  };

  return (
    <section
      className="relative overflow-hidden text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Fondos con crossfade */}
      {SLIDES.map((s, i) => (
        <img
          key={s.dept}
          src={s.bg}
          alt=""
          aria-hidden
          loading={i === 0 ? 'eager' : 'lazy'}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-out ${
            i === index % count ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80" />

      {/* Flechas */}
      <button
        onClick={() => go(index - 1)}
        className="absolute left-2 sm:left-4 top-1/3 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all"
        title="Anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => go(index + 1)}
        className="absolute right-2 sm:right-4 top-1/3 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all"
        title="Siguiente"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div key={slide.dept} className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center space-y-4">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-amber-300 bg-white/10 border border-white/20 px-3 py-1 rounded-full backdrop-blur-xs">
          <BadgeCheck className="w-3.5 h-3.5" /> {slide.tagline}
        </span>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">
          {slide.titleA} <span className="text-amber-400">{slide.titleB}</span>
        </h2>
        <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
          {slide.sub}
        </p>

        {/* Productos del departamento actual */}
        {slideProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 max-w-md mx-auto pt-1 text-left">
            {slideProducts.map((prod) => {
              const variant = prod.variants?.[0];
              const price = variant?.priceInCents || 0;
              const original = variant?.originalPriceInCents;
              const discount =
                original && original > price ? Math.round((1 - price / original) * 100) : 0;
              return (
                <div
                  key={prod.id}
                  onClick={() => openQuickView(prod)}
                  className="group bg-white text-zinc-900 rounded-3xl overflow-hidden shadow-2xl cursor-pointer transition-transform hover:-translate-y-1 active:scale-[0.98]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={prod.mainImage}
                      alt={prod.title}
                      onError={handleImgError}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow">
                        -{discount}%
                      </span>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-bold">{prod.rating || 4.9}</span>
                      <span className="text-[10px] text-zinc-400">({prod.reviewsCount || 0})</span>
                    </div>
                    <p className="text-xs font-black uppercase tracking-tight line-clamp-1">{prod.title}</p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black" style={{ color: themeConfig.primaryColor }}>
                          ${formatCOP(price)}
                        </span>
                        {original && (
                          <span className="text-[10px] text-zinc-400 line-through">${formatCOP(original)}</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleQuickAdd(e, prod.id)}
                        className="w-8 h-8 rounded-full text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer shrink-0"
                        style={{ backgroundColor: themeConfig.primaryColor }}
                        title={`Agregar ${prod.title}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleSeeAll}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-sm font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-xl"
          >
            {slide.button} <ArrowRight className="w-4 h-4" />
          </button>
          {/* Puntos por departamento */}
          <div className="flex justify-center gap-1.5">
            {SLIDES.map((s, i) => (
              <button
                key={s.dept}
                onClick={() => go(i)}
                title={s.dept}
                className={`h-1.5 rounded-full transition-all ${
                  i === index % count ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
