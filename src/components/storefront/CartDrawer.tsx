import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Sparkles, Plus } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import { handleImgError } from '../../lib/images';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    cartTotalInCents,
    cartCount,
    appliedCoupon,
    setAppliedCoupon,
    applyCouponByCode,
    couponDiscountInCents,
    setActiveView,
    showToast,
    products,
    addToCart,
    openQuickView,
    storePreferences,
    themeConfig,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');

  if (!isCartOpen) return null;

  const rawSubtotal = cart.reduce((acc, item) => acc + item.priceInCents * item.quantity, 0);
  const freeShippingThreshold =
    (storePreferences.freeShippingThresholdCOP || 200000) * 100; // $200.000 COP en centavos
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - rawSubtotal);
  const progressPercent = Math.min(100, Math.round((rawSubtotal / freeShippingThreshold) * 100));

  // Upsell: productos que aún no están en la bolsa.
  const cartProductIds = new Set(cart.map((item) => item.productId));
  const upsellProducts = products.filter((p) => !cartProductIds.has(p.id)).slice(0, 3);

  const handleUpsellAdd = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    const size = prod.availableSizes?.[0] || 'M';
    const color = (prod.availableColors?.[0] as any)?.name || 'Estándar';
    addToCart(prod, size, color, 1);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const result = applyCouponByCode(couponInput);
    showToast(result.message);
    if (result.success) {
      setCouponInput('');
    }
  };

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setActiveView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col min-h-0 border-l border-zinc-200">
          {/* Header */}
          <div
            className="p-4 sm:p-5 border-b border-green-800 flex items-center justify-between text-white shrink-0"
            style={{ background: `linear-gradient(135deg, ${themeConfig.primaryColor}, ${themeConfig.primaryHover})` }}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-white" />
              <h2 className="text-sm font-black uppercase tracking-wider font-sans">
                BOLSA DE COMPRAS
              </h2>
              <span className="bg-white text-black text-xs font-mono font-bold px-2 py-0.2 rounded-full">
                {cartCount}
              </span>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-full transition-colors cursor-pointer"
              title="Cerrar bolsa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-green-50 px-5 py-3 border-b border-green-100 font-mono text-xs shrink-0">
            {amountToFreeShipping === 0 ? (
              <div className="flex items-center gap-1.5 text-green-800 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>¡FELICIDADES! TIENES ENVÍO GRATIS A TODA COLOMBIA.</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-green-900 text-[11px]">
                  <span>AGREGA ${formatCOP(amountToFreeShipping)} COP PARA</span>
                  <strong className="uppercase">ENVÍO GRATIS</strong>
                </div>
                <div className="w-full bg-green-200 h-1.5 overflow-hidden rounded-full">
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%`, backgroundColor: themeConfig.primaryColor }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Zona scroll única: items + upsell (el footer queda fijo abajo) */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${themeConfig.primaryColor}, ${themeConfig.primaryHover})` }}>
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-tight text-black font-sans">
                  TU BOLSA ESTÁ VACÍA
                </h3>
                <p className="text-xs text-zinc-500 max-w-xs font-mono">
                  Explora el catálogo y aprovecha tu 10% OFF de bienvenida con el código MANO10.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-white text-xs font-mono font-bold uppercase px-6 py-3 transition-all rounded-full shadow-md active:scale-95 cursor-pointer"
                  style={{ backgroundColor: themeConfig.primaryColor }}
                >
                  EXPLORAR CATÁLOGO
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 rounded-3xl bg-zinc-50 border border-zinc-100 group">
                  <img
                    src={item.image}
                    alt={item.title}
                    onError={handleImgError}
                    className="w-24 h-28 object-cover rounded-2xl shrink-0 bg-zinc-200"
                  />

                  <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-extrabold uppercase text-zinc-900 line-clamp-2 font-sans text-[13px] leading-tight">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-zinc-300 hover:text-rose-500 p-1 transition-colors shrink-0 cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-[10px] font-mono text-zinc-400 mt-1 uppercase truncate">
                        {item.selectedSize} • {item.selectedColor}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-full px-1 py-0.5 font-mono shadow-xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full text-zinc-700 hover:bg-zinc-100 font-black text-sm leading-none transition-colors cursor-pointer"
                        >
                          −
                        </button>
                        <span className="text-[11px] font-black text-zinc-900 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full text-white font-black text-sm leading-none transition-transform active:scale-90 cursor-pointer"
                          style={{ backgroundColor: themeConfig.primaryColor }}
                        >
                          +
                        </button>
                      </div>

                      <span className="font-black text-[13px] font-sans" style={{ color: themeConfig.primaryColor }}>
                        ${formatCOP(item.priceInCents * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Upsell en carrusel horizontal (dentro del scroll) */}
            {cart.length > 0 && upsellProducts.length > 0 && (
              <div className="pt-1">
                <p className="text-[11px] font-black uppercase tracking-wider text-zinc-900 mb-2 px-1">
                  🛍️ Completa tu compra
                </p>
                <div className="flex gap-2.5 overflow-x-auto pb-1 snap-x no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {upsellProducts.map((prod) => {
                    const price = prod.variants?.[0]?.priceInCents || 0;
                    return (
                      <div
                        key={prod.id}
                        className="snap-start shrink-0 w-32 rounded-2xl border border-zinc-200 bg-white overflow-hidden"
                      >
                        <button
                          onClick={() => {
                            setIsCartOpen(false);
                            openQuickView(prod);
                          }}
                          className="block w-full cursor-pointer"
                          title={prod.title}
                        >
                          <img
                            src={prod.mainImage}
                            alt={prod.title}
                            onError={handleImgError}
                            loading="lazy"
                            className="w-full h-24 object-cover bg-zinc-100"
                          />
                        </button>
                        <div className="p-2">
                          <p className="text-[10px] font-bold text-zinc-900 truncate">{prod.title}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-[11px] font-black" style={{ color: themeConfig.primaryColor }}>${formatCOP(price)}</p>
                            <button
                              onClick={() => handleUpsellAdd(prod.id)}
                              className="w-6 h-6 rounded-full text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer shrink-0"
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
            )}
          </div>

          {/* Footer fijo: cupón + total + CTA (siempre visible) */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-zinc-200 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.08)] space-y-2.5 font-mono shrink-0">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="CUPÓN (EJ: MANO10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono uppercase focus:outline-hidden"
                    style={{ ['--tw-ring-color' as any]: themeConfig.primaryColor }}
                  />
                </div>
                <button
                  type="submit"
                  className="text-white px-4 py-2 text-xs font-bold uppercase transition-all rounded-xl cursor-pointer active:scale-95"
                  style={{ backgroundColor: themeConfig.primaryColor }}
                >
                  APLICAR
                </button>
              </form>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-[11px] text-white p-2.5 rounded-xl"
                  style={{ backgroundColor: themeConfig.primaryHover }}>
                  <span className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-300" /> CUPÓN: {appliedCoupon}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-emerald-300">
                      -${formatCOP(couponDiscountInCents)} COP
                    </span>
                    <button
                      onClick={() => {
                        setAppliedCoupon(null);
                        showToast('Cupón removido');
                      }}
                      className="text-white/60 font-bold hover:text-white underline cursor-pointer"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-1 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span>SUBTOTAL</span>
                  <span className="font-bold text-zinc-900">${formatCOP(rawSubtotal)} COP</span>
                </div>

                {couponDiscountInCents > 0 && (
                  <div className="flex justify-between font-bold" style={{ color: themeConfig.primaryColor }}>
                    <span>DESCUENTO</span>
                    <span>-${formatCOP(couponDiscountInCents)} COP</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>ENVÍO NACIONAL</span>
                  <span className="font-bold text-zinc-900">
                    {amountToFreeShipping === 0 ? 'GRATIS' : '$12.000 COP'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm font-black text-zinc-900 pt-1.5 border-t border-zinc-100 font-sans">
                  <span>TOTAL A PAGAR</span>
                  <span className="text-lg" style={{ color: themeConfig.primaryColor }}>${formatCOP(cartTotalInCents)} COP</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleProceedCheckout}
                className="w-full text-white py-3.5 px-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.98] cursor-pointer font-sans rounded-2xl"
                style={{ backgroundColor: themeConfig.primaryColor }}
              >
                <span>FINALIZAR PEDIDO</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: themeConfig.primaryColor }} />
                <span>PAGO 100% SEGURO Y ENCRIPTADO</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
