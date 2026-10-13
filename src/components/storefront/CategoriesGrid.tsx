import React from 'react';
import { ArrowUpRight, Sparkles, Eye } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CATEGORIES_DATA } from '../../data/mockDatabase';
import { scrollToCatalog } from '../../lib/storeNavigation';

export const CategoriesGrid: React.FC = () => {
  const { products = [], setActiveCategoryFilter, openQuickView, themeConfig } = useStore();

  // Visible por defecto (undefined = visible): coherente con el toggle de Bloques (checked !== false).
  if (themeConfig.showCategories === false) {
    return null;
  }

  const isDark = themeConfig.mode === 'dark';
  const isWarm = themeConfig.mode === 'warm';

  const roundedClass =
    themeConfig.borderRadius === 'rounded'
      ? 'rounded-2xl'
      : themeConfig.borderRadius === 'pill'
      ? 'rounded-3xl'
      : 'rounded-xl';

  const handleSelectCategory = (catName: string) => {
    setActiveCategoryFilter(catName);
    // Helper central: misma lista de anclas que Header y MobileCategoryBar.
    setTimeout(() => {
      scrollToCatalog(true);
    }, 50);
  };

  const catCards = CATEGORIES_DATA.map((cat) => {
    const matchingProduct = products.find(
      (p) =>
        p.category &&
        (p.category.toLowerCase().includes(cat.name.toLowerCase().split('&')[0].trim()) ||
          cat.name.toLowerCase().includes(p.category.toLowerCase()) ||
          cat.slug.toLowerCase().includes((p.category || '').toLowerCase())) &&
        p.mainImage &&
        p.mainImage.trim() !== ''
    );
    return { cat, displayImage: matchingProduct?.mainImage || cat.image };
  });

  return (
    <section
      id="categorias-grid"
      className={`hidden md:block py-10 sm:py-14 px-4 sm:px-6 border-b scroll-mt-24 transition-colors ${
        isDark
          ? 'bg-zinc-950 border-zinc-800 text-white'
          : isWarm
          ? 'bg-[#f5f1eb] border-stone-200 text-stone-900'
          : 'bg-white border-zinc-200 text-zinc-900'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            {(themeConfig.categoriesBadge !== undefined ? themeConfig.categoriesBadge : 'STREETWEAR ARCHIVE // SILUETAS') ? (
            <div className="inline-flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span
                className={`text-[11px] font-mono font-bold uppercase tracking-widest block ${
                  isDark ? 'text-emerald-400' : 'text-zinc-900'
                }`}
              >
                {themeConfig.categoriesBadge !== undefined ? themeConfig.categoriesBadge : 'STREETWEAR ARCHIVE // SILUETAS'}
              </span>
            </div>
            ) : null}
            {(themeConfig.categoriesTitle !== undefined ? themeConfig.categoriesTitle : 'Líneas & Prendas Urbanas') ? (
            <h2
              className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${
                themeConfig.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
              }`}
            >
              {themeConfig.categoriesTitle !== undefined ? themeConfig.categoriesTitle : 'Líneas & Prendas Urbanas'}
            </h2>
            ) : null}
          </div>
          {(themeConfig.categoriesSubtitle !== undefined ? themeConfig.categoriesSubtitle : 'TOCA CUALQUIER CATEGORÍA PARA FILTRAR • CORTE BOXY • 450 GSM') ? (
          <span className="text-xs font-mono text-zinc-400">
            {themeConfig.categoriesSubtitle !== undefined ? themeConfig.categoriesSubtitle : 'TOCA CUALQUIER CATEGORÍA PARA FILTRAR • CORTE BOXY • 450 GSM'}
          </span>
          ) : null}
        </div>

        {/* Móvil: carrusel horizontal compacto */}
        <div className="md:hidden flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
          {catCards.map(({ cat, displayImage }) => (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.name)}
              className="snap-start shrink-0 w-28 text-left group cursor-pointer active:scale-95 transition-transform"
            >
              <div className="relative w-28 h-28 rounded-3xl overflow-hidden border border-zinc-200 shadow-xs">
                <img
                  src={displayImage}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-active:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-1.5 left-1.5 text-[8px] font-mono font-black px-1.5 py-0.5 rounded-full bg-black/70 backdrop-blur text-white uppercase tracking-wide">
                  {cat.countText}
                </span>
              </div>
              <p className={`mt-1.5 text-[11px] font-bold leading-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {cat.name}
              </p>
            </button>
          ))}
        </div>

        {/* Desktop: grilla completa */}
        <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {catCards.map(({ cat, displayImage }) => {
              <div
                key={cat.id}
                onClick={() => handleSelectCategory(cat.name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectCategory(cat.name);
                  }
                }}
                className={`group relative aspect-3/4 bg-zinc-900 overflow-hidden cursor-pointer flex flex-col justify-between p-3.5 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95 ${roundedClass} ${
                  isDark ? 'border-zinc-800 hover:border-zinc-700' : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <img
                  src={displayImage}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 group-hover:via-black/30 transition-colors" />

                {/* Top pill badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-emerald-400 border border-white/10 uppercase tracking-wider">
                    {cat.countText}
                  </span>
                  <span className="p-1 rounded-full bg-black/60 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-3 h-3" />
                  </span>
                </div>

                {/* Bottom text */}
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center justify-between text-white">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight leading-tight group-hover:text-emerald-300 transition-colors">
                      {cat.name}
                    </h3>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-300">
                    <span>Ver detalle</span>
                    <span className="text-emerald-400 font-bold">→</span>
                  </div>
                </div>
              </div>
          })}
        </div>
      </div>
    </section>
  );
};
