import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  Flame,
  ArrowRight,
  ShoppingBag,
  Heart,
  ChevronRight,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import { getDepartmentTree, productMatchesFilter } from '../../lib/categories';

interface MobileExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileExplorerModal: React.FC<MobileExplorerModalProps> = ({ isOpen, onClose }) => {
  const {
    products,
    openProductDetail,
    openQuickView,
    activeCategoryFilter,
    setActiveCategoryFilter,
    setActiveView,
    themeConfig,
    wishlist,
    toggleWishlist,
  } = useStore();

  const [localQuery, setLocalQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(activeCategoryFilter);

  // Al abrir, sincroniza con el filtro vigente de la tienda (evita ver
  // resultados de una selección vieja y que parezca que "no funciona").
  useEffect(() => {
    if (isOpen) {
      setSelectedCat(activeCategoryFilter);
      setLocalQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isDark = themeConfig.mode === 'dark';

  const departments = useMemo(() => getDepartmentTree(products), [products]);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  const DEPT_ICONS: Record<string, string> = {
    Ropa: '👕',
    Hogar: '🏠',
    Mascotas: '🐾',
    'Café e Infusiones': '☕',
    Accesorios: '🕶️',
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = productMatchesFilter(p, selectedCat);
    const q = localQuery.trim().toLowerCase();
    const pCat = (p.category || '').toLowerCase();
    const matchesQuery =
      !q ||
      (p.title || '').toLowerCase().includes(q) ||
      (p.reference || '').toLowerCase().includes(q) ||
      pCat.includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative z-10 w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 ${
          isDark
            ? 'bg-zinc-950 text-white border-t sm:border border-zinc-800'
            : 'bg-white text-zinc-900 border-t sm:border border-zinc-200'
        }`}
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-zinc-400/40" />
        </div>

        {/* Top Header */}
        <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-black font-sans tracking-tight">Explorar Catálogo</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 space-y-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por silueta, nombre, SKU o color..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className={`w-full pl-9 pr-9 py-2.5 rounded-xl text-xs font-sans font-medium border focus:outline-hidden transition-all ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500'
                  : 'bg-zinc-100 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-blue-600'
              }`}
            />
            {localQuery && (
              <button
                onClick={() => setLocalQuery('')}
                className="absolute right-3 text-zinc-400 hover:text-zinc-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Departamentos desplegables con subcategorías */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
            <button
              onClick={() => {
                setSelectedCat(null);
                setExpandedDept(null);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                selectedCat === null
                  ? 'text-white shadow-xs'
                  : isDark
                  ? 'bg-zinc-900 text-zinc-300'
                  : 'bg-zinc-100 text-zinc-700'
              }`}
              style={selectedCat === null ? { backgroundColor: themeConfig.primaryColor } : undefined}
            >
              <span>🔥</span>
              <span>Ver todo</span>
            </button>
            {departments.map((dept) => {
              const isDeptSelected = selectedCat !== null && selectedCat.toLowerCase() === dept.name.toLowerCase();
              const isExpanded = expandedDept === dept.name;
              return (
                <div
                  key={dept.name}
                  className={`rounded-xl overflow-hidden transition-colors ${
                    isDark ? 'bg-zinc-900/60' : 'bg-zinc-50'
                  }`}
                >
                  <button
                    onClick={() => {
                      setSelectedCat(dept.name);
                      setExpandedDept(isExpanded ? null : dept.name);
                    }}
                    style={isDeptSelected ? { backgroundColor: `${themeConfig.primaryColor}14`, color: themeConfig.primaryColor } : undefined}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-bold transition-all cursor-pointer"
                  >
                    <span>{DEPT_ICONS[dept.name] || '🏷️'}</span>
                    <span className="flex-1 text-left">{dept.name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200/70 text-zinc-500'}`}>
                      {dept.count}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {(isExpanded || isDeptSelected) && dept.subcategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 px-3 pb-2.5">
                      {dept.subcategories.map((sub) => {
                        const isSub = selectedCat !== null && selectedCat.toLowerCase() === sub.name.toLowerCase();
                        return (
                          <button
                            key={sub.name}
                            onClick={() => setSelectedCat(sub.name)}
                            style={isSub ? { backgroundColor: themeConfig.primaryColor, borderColor: themeConfig.primaryColor } : undefined}
                            className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                              isSub
                                ? 'text-white font-bold shadow-xs'
                                : isDark
                                ? 'border-zinc-700 text-zinc-400'
                                : 'border-zinc-200 text-zinc-500'
                            }`}
                          >
                            {sub.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-500 px-1">
            <span>{filteredProducts.length} PRODUCTOS ENCONTRADOS</span>
            {selectedCat && (
              <button
                onClick={() => setSelectedCat(null)}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Limpiar filtro
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-xs font-bold uppercase font-sans text-zinc-500">
                No encontramos productos con esos criterios
              </p>
              <button
                onClick={() => {
                  setLocalQuery('');
                  setSelectedCat(null);
                }}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold font-mono underline cursor-pointer"
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((p) => {
                const isFav = wishlist.includes(p.id);
                const price = p.variants?.[0]?.priceInCents || 17990000;
                const totalStock = p.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      openQuickView(p);
                      onClose();
                    }}
                    className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer shadow-2xs ${
                      isDark
                        ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                        : 'bg-white border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <img
                        src={p.mainImage}
                        alt={p.title}
                        className="w-full h-full object-cover object-center"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(p.id);
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 dark:bg-black/80 text-black dark:text-white flex items-center justify-center shadow-xs"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                      {p.badge && (
                        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-white font-mono text-[9px] font-bold uppercase">
                          {p.badge.split('//')[0]}
                        </span>
                      )}
                    </div>

                    <div className="p-2.5 space-y-1">
                      <p className="text-[10px] font-mono text-zinc-500 uppercase truncate">
                        {p.category}
                      </p>
                      <h4 className="text-xs font-bold font-sans line-clamp-1 text-zinc-900 dark:text-white">
                        {p.title}
                      </h4>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-black font-sans text-zinc-900 dark:text-white">
                          ${formatCOP(price)}
                        </span>
                        <span className={`text-[9px] font-mono font-bold ${totalStock > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {totalStock > 0 ? `Stock: ${totalStock}` : 'Agotado'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
