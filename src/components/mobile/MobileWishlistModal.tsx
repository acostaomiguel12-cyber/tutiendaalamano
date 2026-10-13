import React from 'react';
import { Heart, X, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';

interface MobileWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileWishlistModal: React.FC<MobileWishlistModalProps> = ({ isOpen, onClose }) => {
  const { wishlist, toggleWishlist, products, openQuickView, addToCart, showToast } = useStore();

  if (!isOpen) return null;

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-zinc-200 max-h-[85vh] flex flex-col space-y-4 animate-in slide-in-from-bottom-6 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h3 className="text-sm font-black uppercase font-sans tracking-wide">
              Favoritos ({wishlistProducts.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-black rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-3 divide-y divide-zinc-100 pr-1">
          {wishlistProducts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 text-rose-400 flex items-center justify-center">
                <Heart className="w-7 h-7" />
              </div>
              <p className="text-xs font-bold uppercase font-sans text-zinc-800">
                Aún no tienes favoritos
              </p>
              <p className="text-[11px] font-mono text-zinc-400 max-w-xs mx-auto">
                Toca el corazón en cualquier producto para guardarlo en tu lista de deseos.
              </p>
            </div>
          ) : (
            wishlistProducts.map((prod) => (
              <div key={prod.id} className="pt-3 flex gap-3 items-center justify-between">
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  onClick={() => {
                    openQuickView(prod);
                    onClose();
                  }}
                >
                  <img
                    src={prod.mainImage}
                    alt={prod.title}
                    className="w-14 h-16 object-cover rounded-lg bg-zinc-100 border border-zinc-200 shrink-0"
                  />
                  <div className="min-w-0 text-left">
                    <h4 className="text-xs font-black uppercase truncate text-zinc-900 font-sans">
                      {prod.title}
                    </h4>
                    <p className="text-[10px] font-mono text-zinc-400 uppercase truncate">
                      {prod.category}
                    </p>
                    <p className="text-xs font-black text-black font-mono mt-0.5">
                      ${formatCOP(prod.variants?.[0]?.priceInCents || 18990000)} COP
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      const size = prod.availableSizes?.[0] || 'M';
                      const color = prod.availableColors?.[0]?.name || 'Standard';
                      addToCart(prod, size, color, 1);
                      showToast(`¡${prod.title} añadida a tu bolsa!`);
                    }}
                    className="p-2 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-transform active:scale-95"
                    title="Añadir al carrito"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleWishlist(prod.id)}
                    className="p-2 text-zinc-400 hover:text-rose-500 rounded-xl"
                    title="Quitar de favoritos"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {wishlistProducts.length > 0 && (
          <button
            onClick={onClose}
            className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider rounded-xl font-sans"
          >
            Continuar Explorando
          </button>
        )}
      </div>
    </div>
  );
};
