import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  MessageCircle,
  MapPin,
  Calendar,
  CreditCard,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import { getMerchantWhatsAppDigits, waLink } from '../../lib/whatsappOrder';
import { Order } from '../../types';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const { orders, latestCompletedOrder, themeConfig, showToast, storePreferences } = useStore();
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [copiedLink, setCopiedLink] = useState(false);
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const isDark = themeConfig.mode === 'dark';

  // Synchronize when initialQuery changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialQuery && initialQuery.trim() !== '') {
        setSearchInput(initialQuery);
        executeSearch(initialQuery);
      } else if (latestCompletedOrder) {
        setMatchedOrder(latestCompletedOrder);
        setSearchInput(latestCompletedOrder.reference);
        setHasSearched(true);
      } else {
        // Look up if any order was saved recently in localStorage
        const recentRef = localStorage.getItem('opus_last_order_ref');
        if (recentRef) {
          const found = orders.find(
            (o) => o.reference.toLowerCase() === recentRef.toLowerCase()
          );
          if (found) {
            setMatchedOrder(found);
            setSearchInput(found.reference);
            setHasSearched(true);
          }
        }
      }
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const executeSearch = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setMatchedOrder(null);
      setHasSearched(true);
      return;
    }

    const cleanDigits = q.replace(/\D/g, '');

    const found = orders.find((o) => {
      const ref = o.reference.toLowerCase();
      const id = o.id.toLowerCase();
      const phone = o.customer.phone.replace(/\D/g, '');
      const email = o.customer.email.toLowerCase();
      const guide = (o.trackingNumber || '').toLowerCase();

      return (
        ref.includes(q) ||
        id.includes(q) ||
        (cleanDigits.length >= 7 && phone.includes(cleanDigits)) ||
        email.includes(q) ||
        (guide && guide.includes(q))
      );
    });

    setMatchedOrder(found || null);
    setHasSearched(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchInput);
  };

  const handleCopyOrderLink = (ref: string) => {
    const cleanOrigin = window.location.origin;
    const url = `${cleanOrigin}/#rastreo=${ref}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('📋 Enlace de rastreo copiado al portapapeles.');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppInquiry = (order: Order) => {
    const digits = getMerchantWhatsAppDigits(storePreferences.supportPhoneWhatsApp);
    window.open(
      waLink(digits, `Hola Tu Tienda a la Mano 👋 Consulto sobre mi pedido #${order.reference} a nombre de ${order.customer.fullName}. ¿Me podrían confirmar el estado de la entrega?`),
      '_blank'
    );
  };

  // Determine stage active
  const getStageIndex = (order: Order) => {
    if (order.shippingStatus === 'DELIVERED') return 3;
    if (order.shippingStatus === 'SHIPPED') return 2;
    if (order.shippingStatus === 'FULFILLED' || order.status === 'APPROVED') return 1;
    if (order.status === 'PENDING') return 0;
    if (order.shippingStatus === 'CANCELLED' || order.status === 'DECLINED') return -1;
    return 1;
  };

  const stageIndex = matchedOrder ? getStageIndex(matchedOrder) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl max-h-[92vh] sm:rounded-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border animate-in zoom-in-95 duration-250 ${
          isDark
            ? 'bg-zinc-950 text-white border-zinc-800'
            : 'bg-white text-zinc-900 border-zinc-200'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between border-b ${
            isDark ? 'border-zinc-800/80 bg-zinc-900/60' : 'border-zinc-100 bg-zinc-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white shadow-sm"
              style={{ backgroundColor: themeConfig.primaryColor || '#09090b' }}
            >
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black font-sans uppercase tracking-tight">
                  Rastreo Oficial de Pedidos
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold uppercase">
                  En Vivo
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Consulta pública para clientes sin registro ni contraseñas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-zinc-200 text-zinc-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar Bar */}
        <div className={`p-4 sm:p-5 border-b ${isDark ? 'border-zinc-800/60 bg-zinc-900/30' : 'border-zinc-100 bg-zinc-50/50'}`}>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Ingresa tu número de orden (ej: ORD-2026-1001) o celular..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border font-sans font-medium transition-all focus:outline-hidden ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-600'
                    : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400'
                }`}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition-all cursor-pointer shrink-0 active:scale-95 shadow-xs"
              style={{ backgroundColor: themeConfig.primaryColor || '#09090b' }}
            >
              Consultar
            </button>
          </form>

          {/* Quick chips if user has not entered anything */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto text-[11px] text-zinc-400 font-mono">
            <span className="shrink-0 text-zinc-500">Prueba con:</span>
            {orders.slice(0, 3).map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setSearchInput(o.reference);
                  executeSearch(o.reference);
                }}
                className={`px-2 py-0.5 rounded-md border transition-colors cursor-pointer shrink-0 ${
                  isDark
                    ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-700'
                }`}
              >
                {o.reference}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {matchedOrder ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Top Order Summary Card */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border ${
                  isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-bold">
                      REFERENCIA DE COMPRA
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-base sm:text-lg font-black font-mono tracking-tight text-emerald-500">
                        #{matchedOrder.reference}
                      </span>
                      <button
                        onClick={() => handleCopyOrderLink(matchedOrder.reference)}
                        className={`p-1 rounded-md transition-colors cursor-pointer text-zinc-400 hover:text-white ${
                          isDark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-200'
                        }`}
                        title="Copiar link directo"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {matchedOrder.status === 'APPROVED' ? 'PAGO APROBADO WOMPI' : `ESTADO: ${matchedOrder.status}`}
                    </span>
                    <span className="text-xs sm:text-sm font-black font-mono">
                      {formatCOP(matchedOrder.totalAmountInCents)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-[11px] font-sans">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 block">FECHA DE PEDIDO</span>
                    <span className="font-semibold text-zinc-300">
                      {new Date(matchedOrder.createdAt).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 block">DESTINATARIO</span>
                    <span className="font-semibold truncate block text-zinc-300">
                      {matchedOrder.customer.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 block">DESTINO</span>
                    <span className="font-semibold truncate block text-zinc-300">
                      {matchedOrder.customer.city}, {matchedOrder.customer.department}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 block">MÉTODO DE PAGO</span>
                    <span className="font-semibold truncate block text-zinc-300">
                      {matchedOrder.wompiTransaction?.paymentMethod || 'Wompi / PSE / Bancolombia'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Timeline Tracker */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border ${
                  isDark ? 'bg-zinc-900/30 border-zinc-800' : 'bg-white border-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-black uppercase font-mono tracking-wider text-zinc-400">
                    ETAPA ACTUAL DEL DESPACHO
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-500 font-bold">
                    Actualizado hace minutos
                  </span>
                </div>

                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-0" />
                  <div
                    className="absolute top-4 left-4 h-0.5 bg-emerald-500 transition-all duration-500 -z-0"
                    style={{
                      width: `${Math.min(100, Math.max(0, (stageIndex / 3) * 100))}%`,
                    }}
                  />

                  {/* 4 Steps */}
                  <div className="grid grid-cols-4 relative z-10 text-center">
                    {/* Step 1: Pago Aprobado */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ring-4 ${
                          stageIndex >= 0
                            ? 'bg-emerald-500 text-white ring-emerald-500/20'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 ring-transparent'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold mt-2 leading-tight">
                        Pago Aprobado
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400 mt-0.5">Wompi SSL</span>
                    </div>

                    {/* Step 2: Preparación */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ring-4 ${
                          stageIndex >= 1
                            ? 'bg-emerald-500 text-white ring-emerald-500/20'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 ring-transparent'
                        }`}
                      >
                        <Package className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold mt-2 leading-tight">
                        Preparación
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400 mt-0.5">Control 450 GSM</span>
                    </div>

                    {/* Step 3: En Despacho */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ring-4 ${
                          stageIndex >= 2
                            ? 'bg-emerald-500 text-white ring-emerald-500/20'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 ring-transparent'
                        }`}
                      >
                        <Truck className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold mt-2 leading-tight">
                        En Despacho
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400 mt-0.5">
                        {matchedOrder.carrier || 'Coordinadora'}
                      </span>
                    </div>

                    {/* Step 4: Entregado */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ring-4 ${
                          stageIndex >= 3
                            ? 'bg-emerald-500 text-white ring-emerald-500/20'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 ring-transparent'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold mt-2 leading-tight">
                        Entregado
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400 mt-0.5">En destino</span>
                    </div>
                  </div>
                </div>

                {/* Carrier Details Card */}
                {matchedOrder.trackingNumber && (
                  <div
                    className={`mt-6 p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-emerald-50/60 border-emerald-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold">
                            Transportadora: {matchedOrder.carrier || 'Coordinadora Mercantil'}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-zinc-400">
                          Guía Oficial: <strong className="text-zinc-200">#{matchedOrder.trackingNumber}</strong>
                        </p>
                      </div>
                    </div>

                    <a
                      href={
                        matchedOrder.carrier?.toLowerCase().includes('servientrega')
                          ? `https://www.servientrega.com/wps/portal/rastreo-envio?guia=${matchedOrder.trackingNumber}`
                          : `https://www.coordinadora.com/portafolio-de-servicios/servicios-en-linea/rastreo-en-linea/?guia=${matchedOrder.trackingNumber}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Rastrear en Transportadora</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Items Purchased in Order */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase font-mono tracking-wider text-zinc-400">
                  Productos en este pedido ({matchedOrder.items.length})
                </h4>
                <div className="space-y-2">
                  {matchedOrder.items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                        isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.productTitle}
                            className="w-12 h-12 rounded-lg object-cover bg-zinc-800 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{item.productTitle}</p>
                          <p className="text-[11px] font-mono text-zinc-400">
                            Talla: <span className="font-bold text-zinc-300">{item.selectedSize}</span> • Cantidad: {item.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold">
                          {formatCOP(item.totalPriceInCents || (item.unitPriceInCents * item.quantity))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleWhatsAppInquiry(matchedOrder)}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Consultar por WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyOrderLink(matchedOrder.reference)}
                  className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isDark
                      ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-300'
                      : 'border-zinc-200 hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Enlace Copiado' : 'Guardar Link de Rastreo'}</span>
                </button>
              </div>
            </div>
          ) : hasSearched ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-800/80 text-zinc-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold">No encontramos un pedido con esos datos</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Verifica que el número de referencia coincida con tu confirmación (ej: <span className="font-mono text-zinc-300">ORD-2026-1001</span>) o intenta buscando con tu número de celular registrado.
              </p>
              <div className="pt-2">
                <a
                  href={waLink(getMerchantWhatsAppDigits(storePreferences.supportPhoneWhatsApp), 'Hola Tu Tienda a la Mano, necesito ayuda para ubicar mi pedido')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-500 font-bold hover:underline"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Pedir ayuda a un asesor por WhatsApp</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold">Rastrea cualquier pedido de la tienda</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Ingresa arriba tu número de orden o tu celular para consultar el estado del despacho, guía de Coordinadora/Servientrega y tiempos estimados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
