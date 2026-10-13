import React, { useMemo } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import { handleImgError } from '../../lib/images';
import { scrollToCatalog } from '../../lib/storeNavigation';
import { getDepartmentTree } from '../../lib/categories';

/**
 * Rieles por departamento (estilo grandes tiendas): todo el surtido de un
 * vistazo sin bajar hasta el catálogo completo.
 */
export const DepartmentRails: React.FC = () => {
  const {
    products,
    openQuickView,
    addToCart,
    setActiveView,
    setActiveCategoryFilter,
    themeConfig,
  } = useStore();

  const departments = useMemo(() => getDepartmentTree(products), [products]);
  const byDept = useMemo(() => {
    const map = new Map<string, typeof products>();
    for (const p of products) {
      if (p.active === false) continue;
      const d = (p.category || 'Otros').trim() || 'Otros';
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(p);
    }
    return map;
  }, [products]);

  if (departments.length === 0) return null;

  const isDark = themeConfig.mode === 'dark';

  const handleSeeAll = (dept: string) => {
    setActiveView('home');
    setActiveCategoryFilter(dept);
    setTimeout(() => scrollToCatalog(true), 70);
  };

  return (
    <section className={`py-10 px-4 sm:px-6 border-b ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50/60 border-zinc-200'}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {departments.slice(0, 5).map((dept) => {
          const items = (byDept.get(dept.name) || []).slice(0, 6);
          if (items.length === 0) return null;
          return (
            <div key={dept.name} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-1.5 h-6 rounded-full shrink-0"
                    style={{ backgroundColor: themeConfig.primaryColor }}
                  />
                  <h2 className={`text-base sm:text-lg font-black uppercase tracking-tight truncate ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                    {dept.name}
                  </h2>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200/70 text-zinc-600'}`}>
                    {dept.count}
                  </span>
                </div>
                <button
                  onClick={() => handleSeeAll(dept.name)}
                  className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider shrink-0 transition-opacity hover:opacity-70 cursor-pointer"
                  style={{ color: themeConfig.primaryColor }}
                >
                  Ver todo <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 snap-x no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                {items.map((prod) => {
                  const price = prod.variants?.[0]?.priceInCents || 0;
                  const original = prod.variants?.[0]?.originalPriceInCents;
                  return (
                    <div
                      key={prod.id}
                      onClick={() => openQuickView(prod)}
                      className={`snap-start shrink-0 w-40 sm:w-48 rounded-2xl overflow-hidden border cursor-pointer transition-all hover:shadow-lg active:scale-[0.98] ${
                        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                      }`}
                    >
                      <div className="relative aspect-square overflow-hidden bg-zinc-100">
                        <img
                          src={prod.mainImage}
                          alt={prod.title}
                          onError={handleImgError}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        {original && original > price && (
                          <span className="absolute top-2 left-2 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow">
                            -{Math.round((1 - price / original) * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="p-2.5 space-y-1">
                        <p className={`text-[11px] font-bold uppercase truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                          {prod.title}
                        </p>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-black" style={{ color: themeConfig.primaryColor }}>
                            ${formatCOP(price)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(prod, prod.availableSizes?.[0] || 'Única', (prod.availableColors?.[0] as any)?.name || 'Estándar', 1);
                            }}
                            className="w-7 h-7 rounded-full text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer shrink-0"
                            style={{ backgroundColor: themeConfig.primaryColor }}
                            title={`Agregar ${prod.title}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
