import React, { useState } from 'react';
import { Star, ShoppingBag, Check, Flame } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import { handleImgError } from '../../lib/images';

/**
 * Favoritos de la casa: lo mejor calificado por los clientes, con compra
 * en 1 clic. Acorde a tienda mixta (ropa, hogar, mascotas, café).
 */
export const CommunityLooks: React.FC = () => {
  const { products = [], addToCart, openQuickView, themeConfig } = useStore();
  const [addedId, setAddedId] = useState<string | null>(null);

  // Visible por defecto (undefined = visible): coherente con el toggle de Bloques (checked !== false).
  if (themeConfig.showCommunityLooks === false) {
    return null;
  }

  const isDark = themeConfig.mode === 'dark';
  const isWarm = themeConfig.mode === 'warm';

  const favorites = [...products]
    .filter((p) => p.active !== false)
    .sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0))
    .slice(0, 4);

  if (favorites.length === 0) return null;

  const handleQuickAdd = (e: React.MouseEvent, prodId: string) => {
    e.stopPropagation();
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    addToCart(prod, prod.availableSizes?.[0] || 'Única', (prod.availableColors?.[0] as any)?.name || 'Estándar', 1);
    setAddedId(prodId);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <section
      id="comunidad-lookbook"
      className={`py-10 sm:py-12 px-4 sm:px-6 border-b scroll-mt-24 transition-colors ${
        isDark
          ? 'bg-zinc-950 text-white border-zinc-800'
          : isWarm
          ? 'bg-[#f5f1eb] text-stone-900 border-stone-200'
          : 'bg-white text-zinc-900 border-zinc-200'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b ${
            isDark ? 'border-zinc-800' : 'border-zinc-200'
          }`}
        >
          <div className="space-y-1">
            {(themeConfig.communityBadge !== undefined ? themeConfig.communityBadge : 'LO MEJOR CALIFICADO // LA CASA') ? (
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              {themeConfig.communityBadge !== undefined ? themeConfig.communityBadge : 'LO MEJOR CALIFICADO // LA CASA'}
            </span>
            ) : null}
            {(themeConfig.communitySectionTitle !== undefined ? themeConfig.communitySectionTitle : 'Favoritos de la casa') ? (
            <h2
              className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${
                themeConfig.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
              }`}
            >
              {themeConfig.communitySectionTitle !== undefined ? themeConfig.communitySectionTitle : 'Favoritos de la casa'}
            </h2>
            ) : null}
            {(themeConfig.communitySectionSubtitle !== undefined ? themeConfig.communitySectionSubtitle : 'Los productos con más reseñas 5 estrellas de nuestros clientes en toda Colombia.') ? (
            <p className={`text-xs max-w-xl ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {themeConfig.communitySectionSubtitle !== undefined ? themeConfig.communitySectionSubtitle : 'Los productos con más reseñas 5 estrellas de nuestros clientes en toda Colombia.'}
            </p>
            ) : null}
          </div>

          {(themeConfig.communityInstagramMention !== undefined ? themeConfig.communityInstagramMention : 'MENCIONA @TUTIENDAALAMANO EN INSTAGRAM') ? (
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              {themeConfig.communityInstagramMention !== undefined ? themeConfig.communityInstagramMention : 'MENCIONA @TUTIENDAALAMANO EN INSTAGRAM'}
            </span>
          </div>
          ) : null}
        </div>

        {/* Favoritos grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {favorites.map((prod) => {
            const price = prod.variants?.[0]?.priceInCents || 0;
            const original = prod.variants?.[0]?.originalPriceInCents;
            const discount = original && original > price ? Math.round((1 - price / original) * 100) : 0;
            const added = addedId === prod.id;
            return (
              <div
                key={prod.id}
                onClick={() => openQuickView(prod)}
                className={`group rounded-3xl overflow-hidden border cursor-pointer transition-all hover:shadow-xl active:scale-[0.98] ${
                  isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                }`}
              >
                <div className="relative aspect-square overflow-hidden bg-zinc-100">
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
                  <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {prod.rating || 4.9} ({prod.reviewsCount || 0})
                  </span>
                </div>
                <div className="p-3 space-y-1.5">
                  <p className={`text-[11px] sm:text-xs font-black uppercase tracking-tight line-clamp-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {prod.title}
                  </p>
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
                      className={`h-8 px-3 rounded-full text-[10px] font-black uppercase flex items-center gap-1 transition-all cursor-pointer ${
                        added ? 'bg-emerald-600 text-white' : 'text-white'
                      }`}
                      style={added ? undefined : { backgroundColor: themeConfig.primaryColor }}
                    >
                      {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{added ? '¡Listo!' : 'Agregar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
