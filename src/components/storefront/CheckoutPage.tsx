import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Clock,
  CheckCircle2,
  CreditCard,
  Building2,
  Smartphone,
  QrCode,
  FileText,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Info,
  AlertCircle,
  ArrowLeft,
  Printer,
  Copy,
  Check,
  ShoppingBag,
  MapPin,
  Calendar,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import {
  COLOMBIAN_DEPARTMENTS,
  createCheckoutSession,
  formatCOP,
  getWompiRedirectTxId,
  verifyWompiTransaction,
} from '../../lib/wompi';
import { syncOrderToSupabase } from '../../lib/supabase';
import {
  buildWhatsAppOrderMessage,
  getMerchantWhatsAppDigits,
  waLink,
} from '../../lib/whatsappOrder';
import { CustomerInfo, Order, PaymentMethod } from '../../types';
import confetti from 'canvas-confetti';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartTotalInCents,
    orders,
    appliedCoupon,
    setAppliedCoupon,
    applyCouponByCode,
    couponDiscountInCents,
    createOrder,
    updateOrderStatus,
    clearCart,
    setActiveView,
    setIsCustomerProfileOpen,
    setSelectedOrderForDetail,
    saveAbandonedCheckout,
    customerProfile,
    storePreferences,
    showToast,
  } = useStore();

  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const verifyAttemptedRef = React.useRef(false);

  // 15-Minute Reservation Countdown
  const [secondsRemaining, setSecondsRemaining] = useState(14 * 60 + 17);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 15 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  // Form State initialized with real customer profile or blank fields
  const [contact, setContact] = useState<CustomerInfo>({
    email: customerProfile?.email || '',
    fullName: customerProfile?.fullName || '',
    phone: customerProfile?.phone || '',
    department: customerProfile?.department || 'Bogotá D.C.',
    city: customerProfile?.city || 'Bogotá D.C. (Urbano)',
    address: customerProfile?.address || '',
    neighborhood: '',
    extraInfo: '',
  });

  // Track customer checkout progress
  useEffect(() => {
    if (cart.length > 0 && !completedOrder) {
      saveAbandonedCheckout({
        cartToken: 'tok_cart_live_checkout',
        customer: contact,
        items: cart,
        abandonedStage: 'payment_gateway',
        discountInCents: couponDiscountInCents,
        appliedCouponCode: appliedCoupon || undefined,
      });
    }
  }, [contact, cart, appliedCoupon, couponDiscountInCents, completedOrder]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');

  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');

  // Retorno del Widget Wompi (?id=<transactionId>): verifica el pago real.
  useEffect(() => {
    const txId = getWompiRedirectTxId();
    let pendingRef: string | null = null;
    try {
      pendingRef = localStorage.getItem('opus_pending_ref');
    } catch {
      // storage bloqueado: no se puede verificar el retorno
    }
    if (!txId || !pendingRef || verifyAttemptedRef.current) return;
    const order = orders.find((o) => o.reference === pendingRef);
    if (!order) return; // las órdenes aún cargan desde Supabase; reintenta al actualizar
    verifyAttemptedRef.current = true;
    (async () => {
      setIsVerifying(true);
      setVerifyError(null);
      try {
        // 1) Confirmación en servidor (re-verifica con Wompi y actualiza con service_role).
        // 2) Fallback directo (modo estático sin backend).
        let tx: { id: string; status: string; reference: string; amount_in_cents: number; payment_method_type?: string } | null = null;
        try {
          const confirmRes = await fetch('/api/wompi/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference: pendingRef, transactionId: txId }),
          });
          const confirmType = confirmRes.headers.get('content-type') || '';
          if (confirmRes.ok && confirmType.includes('application/json')) {
            const confirmJson = (await confirmRes.json()) as { status: string; transaction: any };
            tx = confirmJson.transaction;
          }
        } catch {
          // sin backend: sigue al fallback
        }
        if (!tx) {
          tx = await verifyWompiTransaction(txId);
        }
        if (tx.reference !== pendingRef) {
          throw new Error('La transacción no corresponde a este pedido.');
        }
        if (tx.amount_in_cents !== order.totalAmountInCents) {
          throw new Error('El monto pagado no coincide con el total del pedido.');
        }
        if (tx.status === 'APPROVED') {
          const updated: Order = {
            ...order,
            status: 'APPROVED',
            trackingNumber: `CRD-${Math.floor(100000000 + Math.random() * 900000000)}-CO`,
            carrier: 'Coordinadora Express Asegurado',
            updatedAt: new Date().toISOString(),
            wompiTransaction: {
              ...order.wompiTransaction!,
              transactionId: tx.id,
              status: 'APPROVED',
              paymentMethod: (tx.payment_method_type as PaymentMethod) || order.wompiTransaction!.paymentMethod,
              rawPayload: tx,
            },
          };
          updateOrderStatus(order.id, 'APPROVED');
          syncOrderToSupabase(updated).catch(() => undefined);
          clearCart();
          setCompletedOrder(updated);
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
          showToast('🎉 ¡Pago confirmado por Wompi!');
        } else {
          updateOrderStatus(order.id, tx.status as Order['status']);
          setVerifyError(
            tx.status === 'PENDING'
              ? 'Tu pago quedó pendiente en Wompi. Te avisaremos al confirmarse.'
              : 'El pago fue rechazado por Wompi. Puedes intentarlo de nuevo.'
          );
        }
      } catch (err: any) {
        setVerifyError(err?.message || 'No pudimos verificar el pago. Intenta de nuevo.');
      } finally {
        localStorage.removeItem('opus_pending_ref');
        window.history.replaceState({}, '', window.location.pathname + '?view=checkout');
        setIsVerifying(false);
      }
    })();
  }, [orders]);

  const rawSubtotal = cart.reduce((acc, item) => acc + item.priceInCents * item.quantity, 0);
  const discountAmount = couponDiscountInCents;
  const totalAmountInCents = cartTotalInCents;
  const taxInCents = Math.round((totalAmountInCents * 19) / 119); // 19% IVA included

  // Available cities for selected department
  const selectedDeptObj = COLOMBIAN_DEPARTMENTS?.find((d) => d.name === contact.department) || COLOMBIAN_DEPARTMENTS?.[0] || { id: 'ANT', name: 'Antioquia', cities: ['Medellín', 'Envigado', 'Itagüí', 'Bello', 'Rionegro', 'Sabaneta'] };
  const availableCities = selectedDeptObj?.cities || ['Medellín', 'Bogotá', 'Cali', 'Barranquilla'];

  const handlePayWithWompi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('⚠️ Tu carrito está vacío.');
      return;
    }

    if (!contact.fullName.trim()) {
      showToast('⚠️ Por favor ingresa tu nombre y apellidos.');
      return;
    }
    if (!contact.email.trim() || !contact.email.includes('@')) {
      showToast('⚠️ Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (!contact.phone.trim()) {
      showToast('⚠️ Por favor ingresa tu número de celular para la guía de transporte.');
      return;
    }
    if (!contact.address.trim()) {
      showToast('⚠️ Por favor ingresa tu dirección de entrega en Colombia.');
      return;
    }

    setIsProcessing(true);
    try {
      // 1) Orden PENDING (se sincroniza a Supabase antes de salir al Widget).
      const { order } = await createOrder(
        contact,
        paymentMethod,
        { preferredMethod: paymentMethod },
        appliedCoupon || undefined,
        'PENDING'
      );

      // 2) Sesión firmada en el backend → redirección al checkout Wompi.
      const session = await createCheckoutSession({
        reference: order.reference,
        amountInCents: order.totalAmountInCents,
        email: contact.email,
        fullName: contact.fullName,
        phone: contact.phone,
      });
      localStorage.setItem('opus_pending_ref', order.reference);
      window.location.href = session.url;
    } catch (err: any) {
      setIsProcessing(false);
      showToast(`❌ ${err?.message || 'Error al iniciar el pago.'}`);
    }
  };

  // Canal alterno sin backend: crea la orden PENDING y la manda al WhatsApp del negocio.
  const handleOrderWithWhatsApp = async () => {
    if (cart.length === 0) {
      showToast('⚠️ Tu carrito está vacío.');
      return;
    }
    if (!contact.fullName.trim()) {
      showToast('⚠️ Por favor ingresa tu nombre y apellidos.');
      return;
    }
    if (!contact.phone.trim()) {
      showToast('⚠️ Por favor ingresa tu número de celular.');
      return;
    }
    if (!contact.address.trim()) {
      showToast('⚠️ Por favor ingresa tu dirección de entrega en Colombia.');
      return;
    }
    setIsProcessing(true);
    try {
      const { order } = await createOrder(
        contact,
        paymentMethod,
        { preferredMethod: paymentMethod, channel: 'WHATSAPP' },
        appliedCoupon || undefined,
        'PENDING'
      );
      const digits = getMerchantWhatsAppDigits(storePreferences.supportPhoneWhatsApp);
      window.open(waLink(digits, buildWhatsAppOrderMessage(order, appliedCoupon)), '_blank');
      clearCart();
      showToast('✅ Pedido enviado al WhatsApp de la tienda. ¡Te contactaremos!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveView('home');
    } catch (err: any) {
      showToast(`❌ ${err?.message || 'No se pudo crear el pedido.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyRef = (ref: string) => {    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    showToast('✅ Referencia copiada al portapapeles');
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // 1. VIEW: Order Confirmation Screen
  if (completedOrder) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] py-10 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Success Hero Header */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-center shadow-xs space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                COMPRA EXITOSA • TRANSACCIÓN APROBADA
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
                ¡Gracias por tu compra, {completedOrder.customer.fullName.split(' ')[0]}!
              </h1>
              <p className="text-slate-500 text-sm max-w-md mx-auto mt-1">
                Hemos enviado la factura y confirmación de despacho a{' '}
                <strong className="text-slate-800">{completedOrder.customer.email}</strong>.
              </p>
            </div>

            {/* Quick Reference Badge */}
            <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 font-mono text-sm text-slate-800">
              <span>Referencia:</span>
              <strong className="font-black text-indigo-700">{completedOrder.reference}</strong>
              <button
                onClick={() => handleCopyRef(completedOrder.reference)}
                className="p-1 text-slate-500 hover:text-slate-900 rounded transition-colors ml-1"
                title="Copiar referencia"
              >
                {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Shipping & Logistics Tracking Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Despacho & Guía de Envío</h3>
                  <p className="text-xs text-slate-500">Transportadora Oficial Nacional</p>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                {completedOrder.carrier || 'Coordinadora Express'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Número de Guía / Rastreo
                </span>
                <span className="font-mono font-black text-sm text-slate-900 block">
                  {completedOrder.trackingNumber}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  En alistamiento para entrega (24 - 48h hábiles)
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Dirección de Entrega
                </span>
                <p className="font-bold text-slate-900 line-clamp-1">{completedOrder.customer.address}</p>
                <p className="text-slate-500">
                  {completedOrder.customer.city}, {completedOrder.customer.department}
                </p>
                {completedOrder.customer.extraInfo && (
                  <p className="text-[10px] text-slate-400 italic">{completedOrder.customer.extraInfo}</p>
                )}
              </div>
            </div>
          </div>

          {/* Purchased Items & Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Resumen de productos ({completedOrder.items.length})</span>
              <span className="text-xs font-mono font-bold text-slate-500">
                Total: ${formatCOP(completedOrder.totalAmountInCents)} COP
              </span>
            </h3>

            <div className="divide-y divide-slate-100">
              {completedOrder.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center gap-3.5 first:pt-0 last:pb-0">
                  <img
                    src={item.image}
                    alt={item.productTitle}
                    referrerPolicy="no-referrer"
                    className="w-14 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <h4 className="font-bold text-slate-900 truncate">{item.productTitle}</h4>
                    <p className="text-slate-500 font-mono text-[11px]">
                      Talla: <strong className="text-slate-800">{item.selectedSize}</strong> • Color: {item.selectedColor} • Cant: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right font-mono font-bold text-xs text-slate-900">
                    ${formatCOP(item.totalPriceInCents)} COP
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold">${formatCOP(completedOrder.subtotalInCents)} COP</span>
              </div>
              {completedOrder.discountInCents > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Descuento Aplicado</span>
                  <span className="font-bold">-${formatCOP(completedOrder.discountInCents)} COP</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Envío Nacional Asegurado</span>
                <span className="text-emerald-600 font-bold">GRATIS ($0 COP)</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>IVA 19% Discriminado</span>
                <span>${formatCOP(completedOrder.taxInCents)} COP</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Pagado</span>
                <span className="text-indigo-700">${formatCOP(completedOrder.totalAmountInCents)} COP</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="w-full sm:flex-1 py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Comprobante</span>
            </button>

            <button
              onClick={() => {
                setIsCustomerProfileOpen(true);
              }}
              className="w-full sm:flex-1 py-3 px-4 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Ver en Mis Pedidos</span>
            </button>

            <button
              onClick={() => setActiveView('home')}
              className="w-full sm:flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Seguir Comprando</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. VIEW: Empty Cart Warning
  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#f8f9fc] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Tu bolsa de compras está vacía</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Agrega productos de nuestro catálogo para continuar con el checkout seguro y despacho nacional.
          </p>
          <button
            onClick={() => setActiveView('home')}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer mt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Catálogo</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] pb-16">
      {/* 15-Minute Reservation Urgency Banner */}
      <div className="bg-[#991b1b] text-white py-2 px-4 text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 animate-spin-slow" />
            <span>
              Tu inventario está reservado por:{' '}
              <strong className="bg-red-950/80 px-2 py-0.5 rounded font-mono text-sm tracking-wider">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </strong>{' '}
              minutos
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-red-100">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Stock asegurado para Bogotá y despacho prioritario nacional</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {isVerifying && (
          <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-xs text-indigo-900 flex items-center gap-2.5">
            <Clock className="w-4 h-4 animate-spin" />
            <span className="font-bold">Verificando tu pago con Wompi… no cierres esta ventana.</span>
          </div>
        )}
        {verifyError && !isVerifying && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-black block">No pudimos confirmar el pago</span>
              <span>{verifyError}</span>
            </div>
          </div>
        )}
        {/* Back to shop link & Phase Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('home')}
              className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
              title="Volver a la tienda"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#2b47e5] text-white text-xs font-black flex items-center justify-center">
                1
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#2b47e5] uppercase tracking-wider block">FASE FINAL</span>
                <h1 className="text-base font-black text-slate-900 tracking-tight">Finalización Segura de Pedido</h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Integridad SHA-256 HMAC</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>PCI DSS Compliant v4.0</span>
            </div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <form onSubmit={handlePayWithWompi} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Steps 1 to 4 */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Información de Contacto (Compra Directa Sin Cuenta) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Datos para Envío y Factura</h3>
                    <p className="text-[11px] text-slate-500">Compra directa como invitado (sin necesidad de crear cuenta previa)</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Compra Inmediata
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Correo Electrónico para Factura y Guía de Transporte
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="ej: tu.correo@gmail.com"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nombre y Apellidos</label>
                    <input
                      type="text"
                      required
                      placeholder="ej: Andrés Mauricio Gómez"
                      value={contact.fullName}
                      onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Celular (Rastreo WhatsApp / Guía SMS)
                    </label>
                    <div className="flex">
                      <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-600 font-bold">
                        +57
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="310 123 4567"
                        value={contact.phone}
                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl focus:bg-white focus:outline-hidden focus:border-indigo-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Optional Registration & Newsletter Checkboxes */}
                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer transition-colors select-none">
                    <input
                      type="checkbox"
                      checked={contact.wantsMarketingNewsletter ?? true}
                      onChange={(e) => setContact({ ...contact, wantsMarketingNewsletter: e.target.checked })}
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer accent-indigo-600"
                    />
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Quiero recibir ofertas exclusivas, lanzamientos y noticias de la marca por correo / WhatsApp
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Te enviaremos cupones de descuento especiales y acceso anticipado a nuevas colecciones y lanzamientos. (Opcional)
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer transition-colors select-none">
                    <input
                      type="checkbox"
                      checked={contact.createAccountAfterOrder ?? false}
                      onChange={(e) => setContact({ ...contact, createAccountAfterOrder: e.target.checked })}
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer accent-indigo-600"
                    />
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-slate-800">
                        Guardar mis datos para agilizar mis próximas compras (crear perfil de cliente)
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Podrás rastrear todos tus pedidos y acumular puntos de cliente frecuente. (Opcional)
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Step 2: Dirección de Entrega */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">
                    2
                  </div>
                  <h3 className="text-sm font-black text-slate-900">Dirección de Entrega</h3>
                </div>
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Colombia</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Departamento</label>
                    <select
                      value={contact.department}
                      onChange={(e) => {
                        const newDept = e.target.value;
                        const deptObj = COLOMBIAN_DEPARTMENTS.find((d) => d.name === newDept);
                        setContact({
                          ...contact,
                          department: newDept,
                          city: deptObj ? deptObj.cities[0] : 'Bogotá D.C. (Urbano)',
                        });
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-500 font-medium"
                    >
                      {COLOMBIAN_DEPARTMENTS.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Ciudad / Municipio</label>
                    <select
                      value={contact.city}
                      onChange={(e) => setContact({ ...contact, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-500 font-medium"
                    >
                      {availableCities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Dirección Residencial / Oficina
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej: Carrera 43A # 18 Sur - 120"
                    value={contact.address}
                    onChange={(e) => setContact({ ...contact, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Barrio / Sector</label>
                    <input
                      type="text"
                      required
                      placeholder="ej: El Poblado"
                      value={contact.neighborhood}
                      onChange={(e) => setContact({ ...contact, neighborhood: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Apto, Oficina o Indicaciones
                    </label>
                    <input
                      type="text"
                      placeholder="ej: Apto 402, Torre 1 (Opcional)"
                      value={contact.extraInfo || ''}
                      onChange={(e) => setContact({ ...contact, extraInfo: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Método de Envío */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">
                    3
                  </div>
                  <h3 className="text-sm font-black text-slate-900">Método de Envío</h3>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  100% Bonificado
                </span>
              </div>

              <div className="p-4 rounded-xl border-2 border-blue-600 bg-blue-50/40 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <input type="radio" checked readOnly className="mt-1 text-blue-600 accent-blue-600 w-4 h-4" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">Express Nacional Asegurado</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 rounded">
                        Coordinadora / Servientrega
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Entrega estimada: Mañana hábil (24-48 horas con número de guía oficial en vivo).
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-emerald-600 uppercase block">Gratis</span>
                  <span className="text-[10px] text-slate-400 line-through">$18.500 COP</span>
                </div>
              </div>
            </div>

            {/* Step 4: Selección de Pago Wompi Colombia */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">
                    4
                  </div>
                  <h3 className="text-sm font-black text-slate-900">Selección de Pago Wompi Colombia</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">PASARELA OFICIAL</span>
                  <span className="bg-[#2b47e5] text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                    WOMPI API v2
                  </span>
                </div>
              </div>

              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'CARD'
                      ? 'bg-[#2b47e5] text-white border-[#2b47e5] shadow-sm shadow-blue-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[11px] font-bold">Tarjeta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('PSE')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'PSE'
                      ? 'bg-[#2b47e5] text-white border-[#2b47e5] shadow-sm shadow-blue-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span className="text-[11px] font-bold">PSE Débito</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('NEQUI')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'NEQUI'
                      ? 'bg-[#2b47e5] text-white border-[#2b47e5] shadow-sm shadow-blue-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[11px] font-bold">Nequi Push</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('BANCOLOMBIA')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'BANCOLOMBIA'
                      ? 'bg-[#2b47e5] text-white border-[#2b47e5] shadow-sm shadow-blue-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span className="text-[11px] font-bold">Bancolombia</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('EFECTY')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'EFECTY'
                      ? 'bg-[#2b47e5] text-white border-[#2b47e5] shadow-sm shadow-blue-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-[11px] font-bold">Efecty</span>
                </button>
              </div>

              {/* Pago seguro en el Widget Wompi (ningún dato de tarjeta se pide aquí) */}
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 text-indigo-900 space-y-1.5 text-xs">
                <span className="font-black flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Pago 100% seguro con Wompi
                </span>
                <p className="text-[11px] text-indigo-700">
                  Al continuar serás redirigido al checkout oficial de Wompi donde eliges{' '}
                  {paymentMethod === 'CARD' ? 'tu tarjeta' : paymentMethod === 'PSE' ? 'tu banco PSE' : paymentMethod === 'NEQUI' ? 'Nequi' : paymentMethod === 'BANCOLOMBIA' ? 'Botón Bancolombia' : 'Efecty'}{' '}
                  y pagas. TU TIENDA A LA MANO nunca ve ni guarda los datos de tu medio de pago.
                </p>
              </div>

              {/* BANCOLOMBIA FORM */}
              {paymentMethod === 'BANCOLOMBIA' && (
                <div className="space-y-3 pt-2 text-xs text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <QrCode className="w-16 h-16 mx-auto text-slate-900" />
                  <span className="font-extrabold text-slate-900 block">Transferencia Botón Bancolombia / QR</span>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Al hacer clic en pagar se generará el código QR y enlace directo a la App Bancolombia para autorizar.
                  </p>
                </div>
              )}

              {/* EFECTY FORM */}
              {paymentMethod === 'EFECTY' && (
                <div className="space-y-3 pt-2 text-xs text-center p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <FileText className="w-8 h-8 mx-auto text-amber-700" />
                  <span className="font-extrabold block">Pago en Efectivo Efecty</span>
                  <p className="text-[11px] text-amber-800">
                    Se generará el número de convenio <strong>110294</strong> y tu PIN de pago con validez de 48 horas.
                  </p>
                </div>
              )}

              {/* Security Banner below method */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-600">
                  <span className="font-bold text-slate-900 block">Firma de integridad generada en el servidor</span>
                  <span className="text-[10px] text-slate-400">
                    Certificado SSL 256-bit •{' '}
                    <strong className="text-indigo-600 uppercase font-bold">WOMPI CO VERIFIED</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary matching screen3.png */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900">Resumen de Orden</h3>
                <span className="bg-blue-100 text-blue-700 text-xs font-black px-2 py-0.5 rounded-full">
                  {cart.length} {cart.length === 1 ? 'Artículo' : 'Artículos'}
                </span>
              </div>

              {/* Items in summary */}
              <div className="space-y-3 divide-y divide-slate-100">
                {cart.map((item) => (
                  <div key={item.id} className="pt-2 flex gap-3">
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-20 object-cover rounded-xl border border-slate-200"
                      />
                      <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                        {item.quantity}x
                      </span>
                    </div>

                    <div className="flex-1 text-xs space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 block">
                        OUTERWEAR
                      </span>
                      <h4 className="font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        Talla: {item.selectedSize} • {item.selectedColor}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-black text-slate-900">
                          ${formatCOP(item.priceInCents * item.quantity)} COP
                        </span>
                        <span className="text-emerald-600 text-[10px] font-bold">En stock</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Box */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Código de cupón"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold uppercase focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!couponCodeInput.trim()) return;
                      const res = applyCouponByCode(couponCodeInput);
                      showToast(res.message);
                      if (res.success) setCouponCodeInput('');
                    }}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Cupón {appliedCoupon}: -${formatCOP(couponDiscountInCents)} COP</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        showToast('Cupón removido');
                      }}
                      className="text-slate-400 hover:text-slate-700 underline text-[10px]"
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-xs pt-1 border-t border-slate-100">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal de productos</span>
                  <span className="font-bold text-slate-800">${formatCOP(rawSubtotal)} COP</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-medium">
                    <span className="flex items-center gap-1">
                      Descuento de Campaña <span className="text-[10px] bg-red-100 px-1 rounded font-bold">-10%</span>
                    </span>
                    <span className="font-bold">-${formatCOP(discountAmount)} COP</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    Envío Nacional <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">FREE</span>
                  </span>
                  <span className="font-bold text-emerald-600">$0 COP</span>
                </div>

                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>IVA discriminado (19%)</span>
                  <span>${formatCOP(taxInCents)} COP</span>
                </div>

                {/* Total Final a Pagar */}
                <div className="pt-3 border-t border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        TOTAL FINAL A PAGAR
                      </span>
                      <span className="text-2xl font-black text-blue-700">
                        ${formatCOP(totalAmountInCents)} COP
                      </span>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Equivalente a: {totalAmountInCents.toLocaleString('es-CO')} centavos
                  </span>
                </div>
              </div>

              {/* Main Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || cart.length === 0}
                className="w-full bg-[#2b47e5] hover:bg-[#203ac9] disabled:opacity-50 text-white py-3.5 px-4 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isProcessing ? 'Procesando con Wompi...' : `Pagar $${formatCOP(totalAmountInCents)} COP con Wompi`}
                </span>
              </button>

              {/* Canal alterno: pedido por WhatsApp */}
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="flex-1 h-px bg-slate-200" />
                <span>o confirma por chat</span>
                <span className="flex-1 h-px bg-slate-200" />
              </div>
              <button
                type="button"
                onClick={handleOrderWithWhatsApp}
                disabled={isProcessing || cart.length === 0}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-50 text-white py-3.5 px-4 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Pedir por WhatsApp</span>
              </button>
              <p className="text-[11px] text-slate-500 text-center -mt-1">
                Enviamos tu pedido al chat de la tienda y coordinas el pago (Nequi, PSE o transferencia).
              </p>

              {/* 3 Micro Guarantees */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px] text-slate-500 font-medium">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Despacho 24h</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
                  <span>Cambio Gratis</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pago Blindado</span>
                </div>
              </div>
            </div>

            {/* Entity info card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-extrabold text-slate-900 uppercase">ENTIDAD PROCESADORA AUTORIZADA</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Gateway Online
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Wompi Colombia es la pasarela de pagos oficial vigilada por la Superintendencia Financiera. TU TIENDA A LA MANO
                no almacena los datos de tu tarjeta ni códigos de seguridad.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 pt-1">
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">SuperFinanciera</span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Token TLS 1.3</span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Bancolombia Partner</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
