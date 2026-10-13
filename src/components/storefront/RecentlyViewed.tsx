import React from 'react';
import { History } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import { handleImgError } from '../../lib/images';

/**
 * Rail "Vistos recientemente": mantiene al cliente navegando entre productos
 * que ya le interesaron. Solo aparece cuando hay al menos 2 vistos.
 */
export const RecentlyViewed: React.FC = () => {
  const { products, recentlyViewedIds, openQuickView, themeConfig } = useStore();

  const items = recentlyViewedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 10);

  if (items.length < 2) return null;

  const isDark = themeConfig.mode === 'dark';

  return (
    <section className={`py-8 px-4 sm:px-6 ${isDark ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: themeConfig.primaryColor }}
          >
            <History className="w-4 h-4" />
          </span>
          <div>
            <h2 className={`text-lg sm:text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Vistos recientemente
            </h2>
            <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Retoma donde quedaste 👀
            </p>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x">
          {items.map((prod) => {
            const price = prod.variants?.[0]?.priceInCents || 0;
            return (
              <button
                key={prod.id}
                onClick={() => openQuickView(prod)}
                className={`snap-start shrink-0 w-36 sm:w-44 text-left rounded-2xl overflow-hidden border transition-all hover:shadow-md cursor-pointer ${
                  isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                }`}
              >
                <div className="aspect-square overflow-hidden bg-zinc-100">
                  <img
                    src={prod.mainImage}
                    alt={prod.title}
                    onError={handleImgError}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-2.5 space-y-0.5">
                  <p className={`text-[11px] font-bold truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {prod.title}
                  </p>
                  <p className="text-[11px] font-black" style={{ color: themeConfig.primaryColor }}>
                    ${formatCOP(price)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
