import React, { useMemo, useState } from 'react';
import { ArrowUpDown, Eye, Search, ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import { handleImgError } from '../../lib/images';
import { Product } from '../../types';

interface CatalogBrowserProps {
  title?: string;
  subtitle?: string;
  categoryFilter?: string;
  columns?: 2 | 3 | 4;
  limit?: number;
  showCategoryNav?: boolean;
  showSearch?: boolean;
  showSort?: boolean;
  /** Ancla única para scroll. Por defecto 'catalog-browser'; los bloques pasan una por bloque. */
  anchorId?: string;
}

/** Bloque catálogo: pills de categorías, buscador en vivo, orden y tarjetas. */
export const CatalogBrowser: React.FC<CatalogBrowserProps> = ({
  title,
  subtitle,
  categoryFilter,
  columns = 3,
  limit = 9,
  showCategoryNav = true,
  showSearch = true,
  showSort = true,
  anchorId = 'catalog-browser',
}) => {
  const {
    products,
    themeConfig,
    openQuickView,
    addToCart,
    activeCategoryFilter,
    setActiveCategoryFilter,
  } = useStore();
  const [localCat, setLocalCat] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    products.forEach((p) => {
      const cat = (p.category || '').trim();
      if (cat && !seen.has(cat.toLowerCase())) seen.set(cat.toLowerCase(), cat);
    });
    return [...seen.values()];
  }, [products]);

  // Current category active filter (local or global from Navbar)
  const currentActiveCategory = localCat !== null ? localCat : activeCategoryFilter;

  const displayed = useMemo(() => {
    const base =
      categoryFilter && categoryFilter !== 'TODOS'
        ? products.filter((p) => (p.category || '').toLowerCase().includes(categoryFilter.toLowerCase()))
        : products;
    let result = base.filter((p) => p.active !== false);
    if (currentActiveCategory) {
      const catLower = currentActiveCategory.toLowerCase();
      result = result.filter((p) => {
        const pCat = (p.category || '').toLowerCase();
        return pCat === catLower || pCat.includes(catLower) || catLower.includes(pCat);
      });
    }
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.reference || '').toLowerCase().includes(q)
      );
    }
    const price = (p: Product) => p.variants?.[0]?.priceInCents || 0;
    if (sortBy === 'price-asc') result = [...result].sort((a, b) => price(a) - price(b));
    else if (sortBy === 'price-desc') result = [...result].sort((a, b) => price(b) - price(a));
    else if (sortBy === 'rating') result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return result.slice(0, Math.min(Math.max(limit, 1), 24));
  }, [products, categoryFilter, currentActiveCategory, query, sortBy, limit]);

  const isDark = themeConfig.mode === 'dark';
  const gridClass =
    columns === 4
      ? 'grid-cols-2 md:grid-cols-4'
      : columns === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  const quickAdd = (e: React.MouseEvent, prod: Product) => {
    e.stopPropagation();
    addToCart(prod, prod.availableSizes?.[0] || 'M', prod.availableColors?.[0]?.name || 'Standard', 1);
  };

  const handleCategoryClick = (cat: string | null) => {
    setLocalCat(cat);
    setActiveCategoryFilter(cat);
  };

  return (
    <div id={anchorId} className="w-full py-8 scroll-mt-20">
      <div className="mb-5">
        {(title !== undefined ? title : 'Colección de prendas') ? (
        <h3 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          {title !== undefined ? title : 'Colección de prendas'}
        </h3>
        ) : null}
        {subtitle ? <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{subtitle}</p> : null}
      </div>

      {(showCategoryNav || showSearch || showSort) && (
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
          {showCategoryNav && categories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-1">
              <button
                onClick={() => handleCategoryClick(null)}
                className={`px-3 py-1.5 text-[11px] font-bold uppercase rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  currentActiveCategory === null ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(currentActiveCategory === cat ? null : cat)}
                  className={`px-3 py-1.5 text-[11px] font-bold uppercase rounded-full whitespace-nowrap transition-all cursor-pointer ${
                    currentActiveCategory === cat ? 'bg-zinc-900 text-white shadow-xs' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 shrink-0">
            {showSearch && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar prenda o ref…"
                  className="pl-8 pr-3 py-1.5 text-xs border border-zinc-200 rounded-xl bg-white focus:outline-hidden focus:border-zinc-900 w-44"
                />
              </div>
            )}
            {showSort && (
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="pl-3 pr-8 py-1.5 text-xs font-bold uppercase rounded-xl border border-zinc-200 bg-white appearance-none cursor-pointer"
                >
                  <option value="featured">Destacados</option>
                  <option value="price-asc">Menor precio</option>
                  <option value="price-desc">Mayor precio</option>
                  <option value="rating">Calificación</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            )}
          </div>
        </div>
      )}

      {displayed.length === 0 ? (
        <p className="text-center text-xs text-zinc-400 py-10">Sin prendas para estos filtros.</p>
      ) : (
        <div className={`grid ${gridClass} gap-5`}>
          {displayed.map((p) => {
            const price = p.variants?.[0]?.priceInCents || 0;
            return (
              <div
                key={p.id}
                onClick={() => openQuickView(p)}
                className={`group rounded-2xl overflow-hidden border cursor-pointer transition-all hover:-translate-y-0.5 ${
                  isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                }`}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={p.mainImage}
                    alt={p.title}
                    loading="lazy"
                    onError={handleImgError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {p.badge && (
                    <span className="absolute top-2 left-2 bg-zinc-950 text-white text-[9px] font-mono font-bold px-2 py-0.5 uppercase rounded">
                      {p.badge}
                    </span>
                  )}
                  {p.showcasePinned && (
                    <span className="absolute top-2 right-2 bg-amber-400 text-black text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                      📌 FIJO
                    </span>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <h4 className={`text-xs font-bold uppercase truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {p.title}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                      ${formatCOP(price)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); openQuickView(p); }}
                        className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                        title="Vista rápida"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => quickAdd(e, p)}
                        className="p-1.5 rounded-lg text-white"
                        style={{ backgroundColor: themeConfig.primaryColor }}
                        title="Añadir a la bolsa"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
