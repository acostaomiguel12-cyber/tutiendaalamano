import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Zap,
  Check,
  ShieldCheck,
  Truck,
  Heart,
  Ruler,
  ArrowRight,
  Star,
  RotateCcw,
  Sparkles,
  Search,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';

export const ProductQuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    closeQuickView,
    openProductDetail,
    addToCart,
    wishlist,
    toggleWishlist,
    setActiveView,
    showToast,
    themeConfig,
  } = useStore();

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setMousePos({ x, y });
  };

  // Sync state whenever the quick view product changes
  useEffect(() => {
    if (quickViewProduct) {
      setSelectedImage(quickViewProduct.mainImage);
      setSelectedColor(quickViewProduct.availableColors?.[0]?.name || 'Onyx Black');
      setSelectedSize(quickViewProduct.availableSizes?.[0] || 'M');
      setQuantity(1);
      setJustAdded(false);
      setShowSizeGuide(false);
    }
  }, [quickViewProduct]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeQuickView();
      }
    };
    if (quickViewProduct) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickViewProduct, closeQuickView]);

  if (!quickViewProduct) return null;

  const isDark = themeConfig.mode === 'dark';
  const isWarm = themeConfig.mode === 'warm';

  const roundedModalClass =
    themeConfig.borderRadius === 'rounded'
      ? 'rounded-2xl'
      : themeConfig.borderRadius === 'pill'
      ? 'rounded-3xl'
      : 'rounded-none';

  const roundedBtnClass =
    themeConfig.borderRadius === 'rounded'
      ? 'rounded-xl'
      : themeConfig.borderRadius === 'pill'
      ? 'rounded-full'
      : 'rounded-none';

  const isFav = wishlist.includes(quickViewProduct.id);
  const variant = quickViewProduct.variants?.[0];
  const unitPriceInCents = variant?.priceInCents || 17990000;
  const originalPriceInCents = variant?.originalPriceInCents;
  const subtotalEstimatedInCents = unitPriceInCents * quantity;

  const handleAddToCart = () => {
    addToCart(quickViewProduct, selectedSize, selectedColor, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(quickViewProduct, selectedSize, selectedColor, quantity);
    closeQuickView();
    setActiveView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToFullPage = () => {
    openProductDetail(quickViewProduct);
  };

  const thumbnails = quickViewProduct.thumbnailImages?.length
    ? quickViewProduct.thumbnailImages
    : [quickViewProduct.mainImage];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={closeQuickView}
      />

      {/* Modal Container */}
      <div
        className={`relative bg-white w-full max-w-4xl shadow-2xl border overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 ${roundedModalClass} ${
          isDark ? 'bg-zinc-950 text-white border-zinc-800' : 'border-zinc-200'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Top Control Bar */}
        <div
          className={`flex items-center justify-between px-5 py-3 border-b ${
            isDark
              ? 'bg-zinc-900 border-zinc-800 text-white'
              : 'bg-zinc-950 border-zinc-200 text-white'
          }`}
        >
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-zinc-400">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: themeConfig.primaryColor }}
            />
            <span>DETALLE DE PRODUCTO // VISTA DIRECTA</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWishlist(quickViewProduct.id)}
              className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Guardar en favoritos"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button
              onClick={closeQuickView}
              className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Cerrar modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Column Left: Visual Gallery */}
          <div
            className={`md:col-span-6 p-6 border-r flex flex-col justify-between space-y-4 ${
              isDark
                ? 'bg-zinc-900/50 border-zinc-800'
                : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            {/* Primary Main Image Container with Interactive Zoom */}
            <div
              className={`relative aspect-4/5 overflow-hidden border cursor-crosshair group select-none ${roundedModalClass} ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-200 border-zinc-300'
              }`}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {/* Badge Top Left */}
              {quickViewProduct.badge && (
                <div className="absolute top-3 left-3 z-10 bg-zinc-950 text-white text-[10px] font-bold font-mono px-2.5 py-1 uppercase tracking-wider rounded">
                  {quickViewProduct.badge}
                </div>
              )}

              {/* 450 GSM Badge */}
              <div className="absolute bottom-3 left-3 z-10 bg-zinc-950/85 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2.5 py-1 uppercase rounded">
                ALGODÓN 450 GSM // HEAVYWEIGHT
              </div>

              {/* Zoom hint badge bottom right */}
              <div className="absolute bottom-3 right-3 z-10 bg-zinc-950/80 backdrop-blur-xs text-white text-[9px] font-mono px-2 py-0.5 rounded flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <Search className="w-3 h-3 text-zinc-300" />
                <span>ZOOM HD</span>
              </div>

              <img
                src={selectedImage || quickViewProduct.mainImage}
                alt={quickViewProduct.title}
                className="w-full h-full object-cover transition-transform duration-200 ease-out pointer-events-none"
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                        transform: 'scale(2)',
                      }
                    : {
                        transform: 'scale(1)',
                        objectPosition: quickViewProduct.imagePosition || 'center',
                      }
                }
              />
            </div>

            {/* Thumbnails Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {thumbnails.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-16 h-18 shrink-0 overflow-hidden border-2 transition-all cursor-pointer rounded ${
                    selectedImage === img
                      ? 'border-black ring-1 ring-black'
                      : 'border-zinc-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Ángulo ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Fit reassurance notice */}
            <div
              className={`p-3 border font-mono text-[11px] space-y-1 rounded-md ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  : 'bg-white border-zinc-200 text-zinc-600'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className={isDark ? 'text-white' : 'text-zinc-900'}>CORTE OVERSIZED // BOXY FIT</span>
                <span className="text-emerald-500">BODEGA MEDELLÍN</span>
              </div>
              <p className="text-[10px] text-zinc-400">
                Caída de hombro pronunciada. Si prefieres un ajuste más ajustado, sugerimos una talla menos.
              </p>
            </div>
          </div>

          {/* Column Right: Details & Purchase Actions */}
          <div
            className={`md:col-span-6 p-6 flex flex-col justify-between space-y-5 ${
              isDark ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-900'
            }`}
          >
            <div className="space-y-4">
              {/* Category & Reference */}
              <div
                className={`flex items-center justify-between text-[11px] font-mono uppercase border-b pb-2 ${
                  isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-100 text-zinc-500'
                }`}
              >
                <span className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {quickViewProduct.category}
                </span>
                <span>REF: {quickViewProduct.reference}</span>
              </div>

              {/* Title & Review score */}
              <div>
                <h2
                  className={`text-xl sm:text-2xl font-black uppercase tracking-tight leading-tight ${
                    themeConfig.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
                  }`}
                >
                  {quickViewProduct.title}
                </h2>
                <div className="flex items-center gap-2 pt-1.5">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-mono font-bold">4.9</span>
                  <span className="text-xs text-zinc-400 font-mono">(34 reseñas de clientes)</span>
                </div>
              </div>

              {/* Price & Installments */}
              <div
                className={`p-3.5 border space-y-1 rounded-lg ${
                  isDark
                    ? 'bg-zinc-900/60 border-zinc-800'
                    : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-black font-sans">
                    ${formatCOP(unitPriceInCents)} COP
                  </span>
                  {originalPriceInCents && (
                    <span className="text-sm text-zinc-400 line-through font-medium">
                      ${formatCOP(originalPriceInCents)} COP
                    </span>
                  )}
                  <span
                    className="text-white text-[10px] font-mono font-bold px-2 py-0.5 uppercase rounded"
                    style={{ backgroundColor: themeConfig.primaryColor }}
                  >
                    DISPONIBLE
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">
                  O 3 cuotas de{' '}
                  <strong className={isDark ? 'text-white' : 'text-black'}>
                    ${formatCOP(Math.round(unitPriceInCents / 3))} COP
                  </strong>{' '}
                  con tarjetas o <strong>Addi</strong>.
                </p>
              </div>

              {/* Color Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold uppercase">
                    COLOR: <span className="text-zinc-400 font-normal">{selectedColor}</span>
                  </span>
                  <span className="text-emerald-500 font-bold text-[11px]">EN STOCK</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {(quickViewProduct.availableColors || [{ name: 'Onyx Black', hex: '#18181b' }]).map((col) => (
                    <button
                      key={col.name}
                      onClick={() => setSelectedColor(col.name)}
                      className={`flex items-center gap-2 px-3 py-1.5 border text-xs font-mono uppercase transition-all cursor-pointer rounded ${
                        selectedColor === col.name
                          ? 'border-black bg-zinc-900 text-white font-bold shadow-xs'
                          : isDark
                          ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-white/40 shrink-0"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span>{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector with Size Guide */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold uppercase">
                    TALLA: <span className="text-zinc-400 font-normal">{selectedSize}</span>
                  </span>
                  <button
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-bold text-[11px] underline cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>{showSizeGuide ? 'Ocultar Medidas' : 'Guía de Medidas'}</span>
                  </button>
                </div>

                {showSizeGuide && (
                  <div className="p-3 bg-zinc-900 text-white rounded-md border border-zinc-800 text-[11px] font-mono space-y-1 animate-in fade-in duration-150">
                    <span className="font-bold text-amber-400 uppercase block">
                      GUÍA DE MEDIDAS OVERSIZED (CM):
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center pt-1">
                      <div className="border border-zinc-700 p-1">S: Pecho 110 | Largo 72</div>
                      <div className="border border-zinc-700 p-1">M: Pecho 118 | Largo 74</div>
                      <div className="border border-zinc-700 p-1">L: Pecho 126 | Largo 77</div>
                      <div className="border border-zinc-700 p-1">XL: Pecho 134 | Largo 80</div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2 font-mono">
                  {(quickViewProduct.availableSizes || ['S', 'M', 'L', 'XL']).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2.5 text-xs font-bold uppercase border transition-all cursor-pointer rounded ${
                        selectedSize === sz
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-md'
                          : isDark
                          ? 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                          : 'bg-white text-zinc-900 border-zinc-200 hover:border-black'
                      }`}
                      style={
                        selectedSize === sz && themeConfig.primaryColor !== '#000000'
                          ? { backgroundColor: themeConfig.primaryColor, borderColor: themeConfig.primaryColor, color: '#ffffff' }
                          : {}
                      }
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div
                className={`flex items-center justify-between pt-2 border-t ${
                  isDark ? 'border-zinc-800' : 'border-zinc-100'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">CANTIDAD</span>
                  <div
                    className={`flex items-center border rounded ${
                      isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-300 bg-white'
                    }`}
                  >
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-inherit hover:opacity-75 text-sm font-black font-mono transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3.5 py-1.5 text-xs font-bold font-mono min-w-[30px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1.5 text-inherit hover:opacity-75 text-sm font-black font-mono transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block">Subtotal estimado</span>
                  <span className="text-lg font-black font-sans">
                    ${formatCOP(subtotalEstimatedInCents)} COP
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className={`space-y-2.5 pt-2 border-t ${
                isDark ? 'border-zinc-800' : 'border-zinc-200'
              }`}
            >
              <button
                onClick={handleAddToCart}
                className={`w-full py-3.5 px-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${roundedBtnClass} ${
                  justAdded
                    ? 'bg-emerald-600 text-white'
                    : 'text-white'
                }`}
                style={
                  !justAdded
                    ? { backgroundColor: themeConfig.primaryColor, color: '#ffffff' }
                    : {}
                }
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡AGREGADO A LA BOLSA CON ÉXITO!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>AGREGAR A LA BOLSA</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className={`w-full py-3 px-4 border text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${roundedBtnClass} ${
                  isDark
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-700'
                    : 'bg-white hover:bg-zinc-100 text-zinc-950 border-zinc-300'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>COMPRAR AHORA (PSE • NEQUI • TARJETAS)</span>
              </button>

              {/* Link to full product page */}
              <div className="pt-2 text-center">
                <button
                  onClick={handleGoToFullPage}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-400 hover:text-zinc-200 uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <span>Ver ficha técnica completa y reseñas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Colombian Payment & Logistics Trust Strip */}
              <div
                className={`pt-3 border-t flex items-center justify-between text-[10px] font-mono ${
                  isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-100 text-zinc-500'
                }`}
              >
                <div className="flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Pago Seguro PSE / Nequi / Tarjetas</span>
                </div>
                <div className="flex items-center gap-1 font-bold">
                  <Truck className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Entrega 24-48h Colombia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
