import React from 'react';
import { Heart, X, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import { handleImgError } from '../../lib/images';

export const WishlistModal: React.FC = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    closeWishlist,
    wishlist,
    toggleWishlist,
    products,
    openQuickView,
    addToCart,
    showToast,
    themeConfig,
    setActiveView,
    setActiveCategoryFilter,
  } = useStore();

  if (!isWishlistOpen) return null;

  const isDark = themeConfig.mode === 'dark';
  const isWarm = themeConfig.mode === 'warm';

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const handleExploreMore = () => {
    closeWishlist();
    setActiveView('home');
    setActiveCategoryFilter(null);
    setTimeout(() => {
      const el =
        document.getElementById('catalog-section') ||
        document.getElementById('catalogo-drops') ||
        document.getElementById('catalogo-productos') ||
        document.getElementById('drops-urbanos');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border max-h-[90vh] flex flex-col space-y-4 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 ${
          isDark
            ? 'bg-zinc-950 text-white border-zinc-800'
            : isWarm
            ? 'bg-[#faf8f5] text-stone-900 border-stone-200'
            : 'bg-white text-zinc-900 border-zinc-200'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between pb-4 border-b ${
            isDark ? 'border-zinc-800' : 'border-zinc-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase font-sans tracking-tight">
                Mis Favoritos
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                {wishlistProducts.length} {wishlistProducts.length === 1 ? 'producto guardado' : 'productos guardados'}
              </p>
            </div>
          </div>
          <button
            onClick={closeWishlist}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
            title="Cerrar favoritos"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Product List */}
        <div className="flex-1 overflow-y-auto space-y-3 divide-y divide-zinc-100 dark:divide-zinc-800/60 pr-1 max-h-[55vh]">
          {wishlistProducts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Heart className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold uppercase font-sans">
                Aún no tienes favoritos
              </p>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Guarda tus productos preferidos tocando el ícono de corazón en cualquier producto para tenerlos a mano.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleExploreMore}
                  className="px-5 py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explorar el catálogo</span>
                </button>
              </div>
            </div>
          ) : (
            wishlistProducts.map((prod) => {
              const firstVariant = prod.variants?.[0];
              const price = firstVariant?.priceInCents || 18990000;
              const image = prod.mainImage || prod.thumbnailImages?.[0] || '';
              return (
                <div key={prod.id} className="pt-3 flex gap-3 items-center justify-between group">
                  <div
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    onClick={() => {
                      openQuickView(prod);
                      closeWishlist();
                    }}
                  >
                    <img
                      src={image}
                      alt={prod.title}
                      onError={handleImgError}
                      className="w-16 h-18 object-cover rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 text-left">
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-500">
                        {prod.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold truncate font-sans">
                        {prod.title}
                      </h4>
                      <p className="text-xs font-black font-mono mt-0.5">
                        ${formatCOP(price)} COP
                      </p>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">
                        {prod.availableSizes?.join(' · ') || 'Tallas S-XL'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        const size = prod.availableSizes?.[0] || 'M';
                        const color = prod.availableColors?.[0]?.name || 'Standard';
                        addToCart(prod, size, color, 1);
                        showToast(`¡${prod.title} añadida a tu bolsa de compra!`);
                      }}
                      className="p-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-bold transition-all active:scale-95 hover:opacity-90 cursor-pointer shadow-xs flex items-center gap-1.5"
                      title="Añadir a la bolsa"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span className="hidden sm:inline text-[11px]">Bolsa</span>
                    </button>
                    <button
                      onClick={() => toggleWishlist(prod.id)}
                      className="p-2.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                      title="Quitar de favoritos"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        {wishlistProducts.length > 0 && (
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex gap-2">
            <button
              onClick={handleExploreMore}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl font-sans cursor-pointer transition-colors ${
                isDark
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
              }`}
            >
              Seguir Explorando
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
