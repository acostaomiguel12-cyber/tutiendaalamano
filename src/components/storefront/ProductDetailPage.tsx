import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  ShoppingBag,
  Share2,
  Bookmark,
  CheckCircle2,
  Lock,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Ruler,
  Flame,
  Search,
  X,
  User,
  MessageSquare,
  Check,
  ArrowUpRight,
  Eye,
  Heart,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';

export const ProductDetailPage: React.FC = () => {
  const {
    products,
    selectedProduct,
    openProductDetail,
    openQuickView,
    addToCart,
    setActiveView,
    showToast,
    reviews,
    addProductReview,
    toggleWishlist,
    wishlist,
  } = useStore();

  const [selectedImage, setSelectedImage] = useState<string>(selectedProduct?.mainImage || '');
  const [selectedColor, setSelectedColor] = useState<string>(
    selectedProduct?.availableColors?.[0]?.name || 'Onyx Black'
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    selectedProduct?.availableSizes?.[0] || 'M'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [justAdded, setJustAdded] = useState<boolean>(false);

  // Synchronize state whenever selectedProduct changes
  useEffect(() => {
    if (selectedProduct) {
      setSelectedImage(selectedProduct.mainImage);
      setSelectedColor(selectedProduct.availableColors?.[0]?.name || 'Onyx Black');
      setSelectedSize(selectedProduct.availableSizes?.[0] || 'M');
      setQuantity(1);
      setJustAdded(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedProduct]);

  // Accordion states
  const [openAccordion, setOpenAccordion] = useState<string | null>('materials');

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewCity, setReviewCity] = useState('Medellín');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  const productReviews = reviews.filter(
    (r) => r.productId === selectedProduct?.id || r.productId === 'prod-1'
  );

  const avgRating =
    productReviews.length > 0
      ? (
          productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length
        ).toFixed(1)
      : '4.9';

  const unitPriceInCents =
    selectedProduct?.variants?.[0]?.priceInCents || 17990000;
  const originalPriceInCents =
    selectedProduct?.variants?.[0]?.originalPriceInCents || 22490000;
  const subtotalEstimatedInCents = unitPriceInCents * quantity;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const handleBuyNowWompi = () => {
    addToCart(selectedProduct, selectedSize, selectedColor, quantity);
    setActiveView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddBag = () => {
    addToCart(selectedProduct, selectedSize, selectedColor, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="bg-white min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Top Breadcrumbs & Stock Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-500 border-b border-zinc-200 pb-4">
          <nav className="flex items-center gap-1.5 flex-wrap font-mono uppercase text-[11px]">
            <button
              onClick={() => setActiveView('home')}
              className="hover:text-black transition-colors"
            >
              INICIO
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hover:text-black cursor-pointer">{selectedProduct.category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-bold text-black truncate max-w-[200px] sm:max-w-none">
              {selectedProduct.title}
            </span>
          </nav>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black text-white font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>STOCK VERIFICADO</span>
            </div>
            <span className="text-zinc-500 font-bold">
              REF: {selectedProduct.reference}
            </span>
          </div>
        </div>

        {/* Main Product Layout (True Streetwear Editorial style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Editorial Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image with Zoom */}
            <div
              className="relative aspect-4/5 bg-zinc-100 border border-zinc-200 overflow-hidden cursor-crosshair group"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {/* Badges Top Left */}
              <div className="absolute top-4 left-4 z-20 space-y-1.5 font-mono">
                {selectedProduct.badge && (
                  <div className="bg-black text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest">
                    {selectedProduct.badge}
                  </div>
                )}
                <div className="bg-white/90 backdrop-blur-xs text-black text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wider border border-zinc-200">
                  HEAVYWEIGHT 450 GSM
                </div>
              </div>

              {/* Verified Badge bottom right */}
              <div className="absolute bottom-4 right-4 z-20 bg-black/80 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1.5 border border-zinc-700">
                TU TIENDA A LA MANO // COLOMBIA
              </div>

              {/* Zoom hint bottom left */}
              <div className="absolute bottom-4 left-4 z-20 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono px-2.5 py-1 flex items-center gap-1.5">
                <Search className="w-3 h-3 text-zinc-300" />
                <span>PASA EL CURSOR PARA ZOOM HD</span>
              </div>

              {/* Main Image */}
              <img
                src={selectedImage}
                alt={selectedProduct.title}
                className="w-full h-full object-cover transition-transform duration-200"
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                        transform: 'scale(1.8)',
                      }
                    : { transform: 'scale(1)', objectPosition: selectedProduct.imagePosition || 'center' }
                }
              />
            </div>

            {/* Thumbnails row */}
            <div className="grid grid-cols-4 gap-3">
              {(selectedProduct?.thumbnailImages || [selectedProduct?.mainImage || '']).map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(thumb)}
                  className={`aspect-square overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImage === thumb
                      ? 'border-black ring-1 ring-black'
                      : 'border-zinc-200 hover:border-zinc-400 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={thumb} alt="Vista previa" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Model sizing indicator (solo ropa) */}
            {selectedProduct.category === 'Ropa' && (
            <div className="bg-zinc-50 p-3 border border-zinc-200 font-mono text-[11px] text-zinc-600 flex items-center justify-between">
              <span>📐 FIT: OVERSIZED BOXY DROP SHOULDER</span>
              <span>MODELO: 1.83M • USA TALLA L</span>
            </div>
            )}
          </div>

          {/* Right Column: Buy Module (True style) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header / Brand */}
            <div className="space-y-2 border-b border-zinc-200 pb-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500">
                  [ TU TIENDA A LA MANO // CATÁLOGO ]
                </span>

                <div className="flex items-center gap-2 text-zinc-400">
                  <button
                    onClick={() => showToast('Enlace de producto copiado al portapapeles.')}
                    className="p-1.5 hover:text-black transition-colors"
                    title="Compartir"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => showToast('Producto guardado en tus favoritos.')}
                    className="p-1.5 hover:text-black transition-colors"
                    title="Guardar"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black font-sans leading-tight">
                {selectedProduct.title}
              </h1>

              {/* Price Display */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl font-black text-black font-sans">
                  ${formatCOP(unitPriceInCents)} COP
                </span>
                {originalPriceInCents && (
                  <span className="text-sm text-zinc-400 line-through font-medium">
                    ${formatCOP(originalPriceInCents)} COP
                  </span>
                )}
                <span className="bg-black text-white text-[10px] font-mono font-bold px-2 py-0.5">
                  -20% OFERTA
                </span>
              </div>

              <p className="text-xs text-zinc-500 font-mono">
                O paga en <strong>3 cuotas sin interés</strong> de ${formatCOP(Math.round(unitPriceInCents / 3))} COP con tarjetas o Addi.
              </p>
            </div>

            {/* Color Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-black uppercase">
                  COLOR: <span className="text-zinc-600">{selectedColor}</span>
                </span>
                <span className="text-emerald-600 font-bold text-[11px]">DISPONIBLE</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {(selectedProduct?.availableColors || [{ name: 'Onyx Black', hex: '#18181b' }]).map((col) => (
                  <button
                    key={col.name}
                    onClick={() => setSelectedColor(col.name)}
                    className={`flex items-center gap-2 px-3 py-1.5 border text-xs font-mono uppercase transition-all ${
                      selectedColor === col.name
                        ? 'border-black bg-black text-white font-bold'
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

            {/* Size Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-black uppercase">
                  SELECCIONA TU TALLA:
                </span>
                <button
                  onClick={() => showToast('Guía de Tallas Oversize: S (Pecho 110cm), M (Pecho 118cm), L (Pecho 126cm), XL (Pecho 134cm)')}
                  className="text-zinc-500 hover:text-black flex items-center gap-1 font-bold text-[11px] underline"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Guía de Medidas</span>
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2 font-mono">
                {(selectedProduct?.availableSizes || ['S', 'M', 'L', 'XL']).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`py-3 text-xs font-black uppercase border transition-all ${
                      selectedSize === sz
                        ? 'bg-black text-white border-black shadow-md'
                        : 'bg-white text-black border-zinc-200 hover:border-black'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
              <div className="flex items-center border border-zinc-300 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-black hover:bg-zinc-100 text-sm font-black font-mono transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-black text-black font-mono min-w-[32px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2 text-black hover:bg-zinc-100 text-sm font-black font-mono transition-colors"
                >
                  +
                </button>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-zinc-400 uppercase font-mono block">Subtotal</span>
                <span className="text-lg font-black text-black font-sans">${formatCOP(subtotalEstimatedInCents)} COP</span>
              </div>
            </div>

            {/* Action Buttons (True High-Impact Buttons) */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleBuyNowWompi}
                className="w-full bg-black hover:bg-zinc-900 text-white py-4 px-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>COMPRAR AHORA (PSE • NEQUI • TARJETAS)</span>
              </button>

              <button
                onClick={handleAddBag}
                className={`w-full py-4 px-4 border-2 border-black text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
                  justAdded
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white hover:bg-zinc-100 text-black'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡AGREGADO A LA BOLSA!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>AGREGAR A LA BOLSA</span>
                  </>
                )}
              </button>
            </div>

            {/* Colombian Payment Badges Strip */}
            <div className="bg-zinc-50 p-3.5 border border-zinc-200 space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-zinc-700 font-bold uppercase">
                <span>PAGO 100% PROTEGIDO</span>
                <span className="text-zinc-500">TRANSACCIÓN SEGURA</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-zinc-800 font-bold">
                <span className="bg-white px-2 py-0.5 border border-zinc-200">PSE</span>
                <span className="bg-white px-2 py-0.5 border border-zinc-200 text-pink-600">NEQUI</span>
                <span className="bg-white px-2 py-0.5 border border-zinc-200 text-blue-700">BANCOLOMBIA</span>
                <span className="bg-white px-2 py-0.5 border border-zinc-200 text-red-600">DAVIPLATA</span>
                <span className="bg-white px-2 py-0.5 border border-zinc-200">TARJETAS</span>
              </div>
            </div>

            {/* Accordions */}
            <div className="border-t border-zinc-200 pt-4 space-y-2">
              {/* Accordion 1: Material & Composición */}
              <div className="border border-zinc-200">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'materials' ? null : 'materials')}
                  className="w-full p-3.5 bg-zinc-50 hover:bg-zinc-100 flex items-center justify-between text-xs font-black uppercase text-black transition-colors text-left font-mono"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-black" />
                    CONFECCIÓN & MATERIALES (450 GSM)
                  </span>
                  {openAccordion === 'materials' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'materials' && (
                  <div className="p-4 bg-white text-xs text-zinc-600 space-y-2 leading-relaxed font-sans">
                    <p>{selectedProduct?.description || ''}</p>
                    <ul className="list-disc list-inside space-y-1 text-zinc-800 font-medium pt-1 font-mono text-[11px]">
                      {(selectedProduct?.features || []).map((feat, idx) => (
                        <li key={idx}>{feat}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion 2: Envíos */}
              <div className="border border-zinc-200">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                  className="w-full p-3.5 bg-zinc-50 hover:bg-zinc-100 flex items-center justify-between text-xs font-black uppercase text-black transition-colors text-left font-mono"
                >
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-black" />
                    ENVÍOS NACIONALES 24-48 HORAS
                  </span>
                  {openAccordion === 'shipping' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'shipping' && (
                  <div className="p-4 bg-white text-xs text-zinc-600 space-y-2 leading-relaxed">
                    <p>{selectedProduct.shippingInfo}</p>
                    <p className="font-semibold text-zinc-900 font-mono text-[11px]">
                      • Medellín & Bogotá: 24 a 48 horas hábiles.
                      <br />
                      • Cali, Barranquilla, Bucaramanga: 48 a 72 horas.
                      <br />
                      • Despachos asegurados con Coordinadora y Servientrega.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Garantía y Cambios */}
              <div className="border border-zinc-200">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'returns' ? null : 'returns')}
                  className="w-full p-3.5 bg-zinc-50 hover:bg-zinc-100 flex items-center justify-between text-xs font-black uppercase text-black transition-colors text-left font-mono"
                >
                  <span className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-black" />
                    CAMBIOS GRATIS EN 30 DÍAS
                  </span>
                  {openAccordion === 'returns' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'returns' && (
                  <div className="p-4 bg-white text-xs text-zinc-600 space-y-2 leading-relaxed">
                    <p>{selectedProduct.returnPolicy}</p>
                    <p>
                      Si necesitas cambiar la talla de tu producto, programamos la recolección en tu domicilio sin costo alguno en el primer cambio.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="pt-12 border-t border-zinc-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500 block mb-1">
                [ OPINIONES VERIFICADAS // COLOMBIA ]
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black font-sans">
                RESEÑAS DE LA COMUNIDAD A LA MANO
              </h2>
            </div>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-mono font-bold uppercase transition-colors self-start sm:self-auto cursor-pointer flex items-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Escribir Reseña</span>
            </button>
          </div>

          {/* Rating Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-zinc-50 p-6 border border-zinc-200">
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-white border border-zinc-200">
              <span className="text-5xl font-black text-black font-sans">{avgRating}</span>
              <div className="flex items-center gap-1 text-black my-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-black text-black" />
                ))}
              </div>
              <span className="text-xs font-bold text-black font-mono">98% DE SATISFACCIÓN</span>
              <span className="text-[11px] text-zinc-500 font-mono">
                {productReviews.length} reseñas verificadas en Colombia
              </span>
            </div>

            <div className="md:col-span-8 flex flex-col justify-center space-y-2 font-mono text-xs">
              <div className="flex items-center gap-3">
                <span className="w-20 font-bold text-zinc-800">5 Estrellas</span>
                <div className="flex-1 bg-zinc-200 h-2 overflow-hidden">
                  <div className="bg-black h-full" style={{ width: '92%' }}></div>
                </div>
                <span className="w-16 text-right text-zinc-500">92%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-20 font-bold text-zinc-800">4 Estrellas</span>
                <div className="flex-1 bg-zinc-200 h-2 overflow-hidden">
                  <div className="bg-zinc-500 h-full" style={{ width: '7%' }}></div>
                </div>
                <span className="w-16 text-right text-zinc-500">7%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-20 font-bold text-zinc-800">3 Estrellas</span>
                <div className="flex-1 bg-zinc-200 h-2 overflow-hidden">
                  <div className="bg-zinc-400 h-full" style={{ width: '1%' }}></div>
                </div>
                <span className="w-16 text-right text-zinc-500">1%</span>
              </div>
            </div>
          </div>

          {/* Dynamic Review Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {productReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-5 border border-zinc-200 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1 text-black">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-black text-black' : 'text-zinc-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-zinc-400">
                      {new Date(rev.createdAt).toLocaleDateString('es-CO')}
                    </span>
                  </div>
                  <h4 className="text-xs font-black uppercase text-black">{rev.title}</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">"{rev.comment}"</p>
                </div>
                <div className="pt-2 border-t border-zinc-100 font-mono text-[11px] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-black flex items-center gap-1">
                      {rev.authorName}
                      {rev.verifiedPurchase && (
                        <ShieldCheck className="w-3 h-3 text-emerald-600 inline" />
                      )}
                    </span>
                    <span className="text-zinc-400">{rev.authorCity} • Colombia</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Review Modal */}
          {isReviewModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white max-w-md w-full p-6 space-y-4 border border-zinc-300 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                  <div>
                    <h3 className="font-black text-sm uppercase text-black font-sans">
                      Escribir Reseña
                    </h3>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {selectedProduct.title}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsReviewModalOpen(false)}
                    className="p-1 text-zinc-400 hover:text-black cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!reviewName.trim() || !reviewComment.trim()) return;
                    addProductReview({
                      productId: selectedProduct.id,
                      authorName: reviewName.trim(),
                      authorCity: reviewCity.trim() || 'Colombia',
                      rating: reviewRating,
                      title: reviewTitle.trim() || 'Excelente producto',
                      comment: reviewComment.trim(),
                      verifiedPurchase: true,
                      status: 'APPROVED',
                    });
                    setIsReviewModalOpen(false);
                    setReviewName('');
                    setReviewTitle('');
                    setReviewComment('');
                    showToast('🎉 ¡Gracias por tu reseña! Ha sido publicada.');
                  }}
                  className="space-y-3 text-xs font-mono"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-black mb-1 uppercase text-[10px]">
                        Tu Nombre
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ej. Mateo Correa"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 text-xs focus:bg-white focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-black mb-1 uppercase text-[10px]">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        placeholder="Medellín / Bogotá"
                        value={reviewCity}
                        onChange={(e) => setReviewCity(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 text-xs focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-black mb-1 uppercase text-[10px]">
                      Calificación
                    </label>
                    <div className="flex items-center gap-1.5 p-2 bg-zinc-50 border border-zinc-300">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setReviewRating(s)}
                          className="cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              s <= reviewRating ? 'fill-black text-black' : 'text-zinc-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-[11px] font-bold text-black ml-2 font-mono">
                        {reviewRating} de 5 Estrellas
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-black mb-1 uppercase text-[10px]">
                      Título de la Opinión
                    </label>
                    <input
                      type="text"
                      placeholder="ej. Corte oversize y tela pesada de 10/10"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 text-xs focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-black mb-1 uppercase text-[10px]">
                      Tu Experiencia
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe el ajuste, textura del algodón y velocidad de envío..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full p-2.5 bg-zinc-50 border border-zinc-300 text-xs focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(false)}
                      className="px-4 py-2 text-zinc-600 font-bold uppercase text-[11px] cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-black hover:bg-zinc-800 text-white px-5 py-2 font-bold uppercase text-[11px] transition-colors cursor-pointer"
                    >
                      Publicar Opinión
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>

        {/* Related Products / Recomendados */}
        <section className="border-t border-zinc-200 pt-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-zinc-900 pb-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                <span>COMPLETA TU COMPRA // TU TIENDA A LA MANO</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black font-sans mt-1">
                RECOMENDADOS
              </h2>
            </div>
            <button
              onClick={() => {
                setActiveView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-black hover:text-zinc-600 uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>Ver catálogo completo</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {products
              .filter((p) => p.id !== selectedProduct?.id)
              .slice(0, 4)
              .map((prod) => {
                const isFav = wishlist.includes(prod.id);
                const price = prod.variants?.[0]?.priceInCents || 18990000;
                return (
                  <div
                    key={prod.id}
                    onClick={() => openProductDetail(prod)}
                    className="group flex flex-col justify-between cursor-pointer space-y-2.5"
                  >
                    <div className="relative aspect-4/5 bg-zinc-100 overflow-hidden border border-zinc-200">
                      {prod.badge && (
                        <div className="absolute top-2 left-2 z-10 bg-black text-white text-[9px] font-black font-mono px-2 py-0.5 uppercase tracking-widest">
                          {prod.badge}
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(prod.id);
                        }}
                        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 text-black flex items-center justify-center transition-transform active:scale-90"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-black text-black' : 'text-zinc-600'}`} />
                      </button>

                      <img
                        src={prod.mainImage}
                        alt={prod.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />

                      <div className="absolute inset-x-0 bottom-0 bg-black/90 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between text-white font-mono text-[10px]">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Ver producto
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openQuickView(prod);
                          }}
                          className="bg-white text-black px-2 py-0.5 font-bold uppercase hover:bg-zinc-200"
                        >
                          Vista Rápida
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase">
                        <span>{prod.category}</span>
                        <span>REF: {prod.reference}</span>
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-tight text-zinc-900 group-hover:text-zinc-600 line-clamp-1 font-sans">
                        {prod.title}
                      </h3>
                      <div className="text-xs font-black text-black font-sans">
                        ${formatCOP(price)} COP
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Mobile Sticky Add-To-Bag Action Bar (Native App Experience) */}
        <div className="lg:hidden fixed bottom-14 sm:bottom-16 inset-x-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={selectedImage}
              alt={selectedProduct?.title}
              className="w-10 h-10 rounded-lg object-cover border border-zinc-200 shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-zinc-500 block truncate">
                Talla: {selectedSize} // {selectedColor}
              </span>
              <span className="text-xs font-black text-black dark:text-white font-sans block">
                ${formatCOP(unitPriceInCents)} COP
              </span>
            </div>
          </div>

          <button
            onClick={handleAddBag}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shrink-0 ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-black dark:bg-white text-white dark:text-black shadow-md'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Agregado</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Añadir</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
