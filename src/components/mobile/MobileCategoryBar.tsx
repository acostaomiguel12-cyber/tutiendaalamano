import React from 'react';
import { useStore } from '../../context/StoreContext';
import { scrollToCatalog } from '../../lib/storeNavigation';
import { DEFAULT_NAV_LINKS } from '../../data/themes';
import { productMatchesFilter } from '../../lib/categories';

export const MobileCategoryBar: React.FC = () => {
  const { activeCategoryFilter, setActiveCategoryFilter, setActiveView, themeConfig, products } = useStore();

  const isDark = themeConfig.mode === 'dark';

  const rawNavLinks =
    themeConfig.navCategoryLinks && themeConfig.navCategoryLinks.length > 0
      ? themeConfig.navCategoryLinks
      : DEFAULT_NAV_LINKS;

  const activeLinks = rawNavLinks.filter((l) => l.enabled !== false);

  const PRESET_IMAGES: Record<string, { img: string; icon: string }> = {
    ropa: {
      img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=160&q=80',
      icon: '👕',
    },
    hogar: {
      img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=160&q=80',
      icon: '🏠',
    },
    mascotas: {
      img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=160&q=80',
      icon: '🐾',
    },
    café: {
      img: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=160&q=80',
      icon: '☕',
    },
    chaquetas: {
      img: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=160&q=80',
      icon: '⚡',
    },
    calzado: {
      img: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=160&q=80',
      icon: '👟',
    },
    accesorios: {
      img: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=160&q=80',
      icon: '🧢',
    },
  };

  const categories = React.useMemo(() => {
    const list: { id: string; label: string; value: string | null; icon: string; img: string }[] = [];
    const seen = new Set<string>();

    activeLinks.forEach((link, idx) => {
      const key = (link.name || link.filter || '').trim().toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);

      let img = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=160&q=80';
      let icon = '🔥';

      for (const [k, val] of Object.entries(PRESET_IMAGES)) {
        if (key.includes(k)) {
          img = val.img;
          icon = val.icon;
          break;
        }
      }

      // If there's a product with this category, use its mainImage
      if (link.filter) {
        const match = products.find((p) => {
          const pCat = (p.category || '').toLowerCase();
          return pCat.includes(link.filter!.toLowerCase()) || link.filter!.toLowerCase().includes(pCat);
        });
        if (match && match.mainImage) {
          img = match.mainImage;
        }
      }

      list.push({
        id: link.id || `mob-cat-${idx}-${key}`,
        label: link.name,
        value: link.filter,
        icon: link.badge ? link.badge.slice(0, 2) : icon,
        img,
      });
    });

    return list;
  }, [activeLinks, products]);

  return (
    <div
      className={`lg:hidden border-b py-2.5 px-3 overflow-x-auto scrollbar-none transition-colors select-none ${
        isDark
          ? 'bg-zinc-950 border-zinc-800/80'
          : 'bg-white border-zinc-200/80 shadow-2xs'
      }`}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="flex items-center gap-3.5 min-w-max px-1">
        {categories.map((cat) => {
          const isSelected = activeCategoryFilter === cat.value;
          const count = cat.value
            ? products.filter((p) => productMatchesFilter(p, cat.value)).length
            : products.length;

          return (
            <button
              key={cat.id || `${cat.label}-${cat.value || 'all'}`}
              onClick={() => {
                setActiveView('home');
                setActiveCategoryFilter(cat.value);
                // Lleva al catálogo filtrado (misma UX que la grilla desktop).
                setTimeout(() => {
                  scrollToCatalog(true);
                }, 80);
              }}
              className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer active:scale-95 transition-transform"
            >
              {/* Circular Story / Category Bubble */}
              <div
                className={`relative w-16 h-16 rounded-full p-0.5 transition-all ${
                  isSelected
                    ? 'ring-2 scale-105 shadow-md'
                    : isDark
                    ? 'ring-1 ring-zinc-800 group-hover:ring-zinc-600'
                    : 'ring-1 ring-zinc-200 group-hover:ring-zinc-400'
                }`}
                style={isSelected ? { ['--tw-ring-color' as any]: themeConfig.primaryColor } : undefined}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
                  <img
                    src={cat.img}
                    alt={cat.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Count Pill */}
                {count > 0 && (
                  <span
                    className={`absolute -bottom-1 -right-0.5 text-[9px] font-mono font-black px-1.5 py-0.2 rounded-full border text-white ${
                      isSelected ? '' : 'bg-zinc-900 border-transparent dark:bg-white dark:text-zinc-950'
                    }`}
                    style={isSelected ? { backgroundColor: themeConfig.primaryColor, borderColor: themeConfig.primaryColor } : undefined}
                  >
                    {count}
                  </span>
                )}
              </div>

              {/* Category Label */}
              <span
                className={`text-[11px] font-sans tracking-tight transition-colors max-w-[72px] truncate ${
                  isSelected
                    ? 'font-black'
                    : isDark
                    ? 'text-zinc-400 group-hover:text-white font-medium'
                    : 'text-zinc-600 group-hover:text-zinc-950 font-medium'
                }`}
                style={isSelected ? { color: themeConfig.primaryColor } : undefined}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
