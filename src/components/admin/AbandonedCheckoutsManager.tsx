import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Phone,
  Mail,
  Clock,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Tag,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  DollarSign,
  User,
  MapPin,
  Calendar,
  Send,
  Copy,
  Check,
  Eye,
  Trash2,
  Package,
  Flame,
  Zap,
  ArrowRight,
  CreditCard,
  Truck,
  Plus,
  Share2,
} from 'lucide-react';
import { AbandonedCheckout, CartItem, Coupon } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';

export const AbandonedCheckoutsManager: React.FC = () => {
  const {
    abandonedCheckouts,
    saveAbandonedCheckout,
    markAbandonedCheckoutContacted,
    markAbandonedCheckoutRecovered,
    deleteAbandonedCheckout,
    restoreAbandonedCart,
    sendAbandonedRecoveryWhatsApp,
    coupons,
    addCoupon,
    showToast,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ABANDONED' | 'CONTACTED' | 'RECOVERED'>('ALL');
  const [stageFilter, setStageFilter] = useState<'ALL' | 'cart' | 'customer_info' | 'shipping' | 'payment_gateway'>('ALL');
  const [selectedCheckoutForDetail, setSelectedCheckoutForDetail] = useState<AbandonedCheckout | null>(null);
  const [selectedCheckoutForRecovery, setSelectedCheckoutForRecovery] = useState<AbandonedCheckout | null>(null);

  // Recovery Modal State
  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);
  const [selectedCouponCode, setSelectedCouponCode] = useState<string>('RECOVERY10');
  const [customNotesInput, setCustomNotesInput] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Quick Coupon Creator Modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('RESCATE15');
  const [newCouponDiscount, setNewCouponDiscount] = useState(15);
  const [newCouponType, setNewCouponType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');

  // Metrics calculation
  const metrics = useMemo(() => {
    const totalCount = abandonedCheckouts.length;
    const abandonedOnly = abandonedCheckouts.filter((c) => c.status === 'ABANDONED');
    const contactedOnly = abandonedCheckouts.filter((c) => c.status === 'CONTACTED');
    const recoveredOnly = abandonedCheckouts.filter((c) => c.status === 'RECOVERED');

    const totalPotentialInCents = abandonedCheckouts.reduce((sum, c) => sum + c.totalAmountInCents, 0);
    const pendingRecoveryInCents = abandonedOnly.reduce((sum, c) => sum + c.totalAmountInCents, 0);
    const recoveredInCents = recoveredOnly.reduce((sum, c) => sum + c.totalAmountInCents, 0);
    const recoveryRate = totalCount > 0 ? Math.round((recoveredOnly.length / totalCount) * 100) : 0;

    const byStage = {
      cart: abandonedCheckouts.filter((c) => c.abandonedStage === 'cart').length,
      customer_info: abandonedCheckouts.filter((c) => c.abandonedStage === 'customer_info').length,
      shipping: abandonedCheckouts.filter((c) => c.abandonedStage === 'shipping').length,
      payment_gateway: abandonedCheckouts.filter((c) => c.abandonedStage === 'payment_gateway').length,
    };

    return {
      totalCount,
      abandonedCount: abandonedOnly.length,
      contactedCount: contactedOnly.length,
      recoveredCount: recoveredOnly.length,
      totalPotentialInCents,
      pendingRecoveryInCents,
      recoveredInCents,
      recoveryRate,
      byStage,
    };
  }, [abandonedCheckouts]);

  // Filtered List
  const filteredCheckouts = useMemo(() => {
    return abandonedCheckouts.filter((c) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        (c.customer.fullName && c.customer.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.customer.email && c.customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.customer.phone && c.customer.phone.includes(searchQuery)) ||
        (c.customer.city && c.customer.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.items.some((item) => item.product.title.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchesStage = stageFilter === 'ALL' || c.abandonedStage === stageFilter;

      return matchesSearch && matchesStatus && matchesStage;
    });
  }, [abandonedCheckouts, searchQuery, statusFilter, stageFilter]);

  // WhatsApp Message Generator
  const generatedMessage = useMemo(() => {
    if (!selectedCheckoutForRecovery) return '';
    const name = selectedCheckoutForRecovery.customer.fullName
      ? selectedCheckoutForRecovery.customer.fullName.split(' ')[0]
      : 'Parcero/a';
    const firstProduct = selectedCheckoutForRecovery.items[0]?.product.title || 'tu pedido';
    const firstSize = selectedCheckoutForRecovery.items[0]?.selectedSize || 'M';
    const city = selectedCheckoutForRecovery.customer.city || 'Medellín';
    const totalStr = formatCOP(selectedCheckoutForRecovery.totalAmountInCents);
    const token = selectedCheckoutForRecovery.cartToken;
    const recoveryUrl = `${window.location.origin}${window.location.pathname}?recover=${token}`;

    if (selectedTemplate === 1) {
      return `¡Hola ${name}! 👋 Vimos que dejaste pendiente tu pedido de *${firstProduct}* (${totalStr}) en *TU TIENDA A LA MANO* 🔥.\n\n¿Tuviste algún inconveniente al realizar tu pago con Nequi o PSE? Queremos ayudarte a resolverlo para que puedas estrenar tu pedido cuanto antes.\n\n👉 Retoma tu carrito aquí con un clic: ${recoveryUrl}\n\n¡Quedamos atentos a cualquier duda con tu talla o envío!`;
    } else if (selectedTemplate === 2) {
      return `¡Hola ${name}! 🎁 En *TU TIENDA A LA MANO* queremos que tengas tu *${firstProduct}* en tus manos.\n\nTe hemos generado un cupón exclusivo del *10% OFF*: código 👉 *${selectedCouponCode}* válido por las próximas 24 horas.\n\n👉 Finaliza tu orden con descuento aquí: ${recoveryUrl}\n\n¡Aprovecha antes de que se agoten las unidades de esta edición limitada!`;
    } else if (selectedTemplate === 3) {
      return `¡Buenas noticias ${name}! 🚀 Notamos que tu pedido de *${firstProduct}* hacia *${city}* quedó pendiente.\n\n¡Queremos obsequiarte el *ENVÍO GRATIS 100% ASEGURADO* a tu domicilio hoy mismo! Usa el cupón *${selectedCouponCode}* al confirmar tu compra.\n\n👉 Finalizar compra sin costo de envío: ${recoveryUrl}\n\nDespachamos por Coordinadora / Servientrega con entrega en 24-48 horas.`;
    } else {
      return `⚠️ *ALERTA DE STOCK LIMITADO - TU TIENDA A LA MANO* ⚠️\n\n¡Hola ${name}! Te escribimos porque quedan únicamente *2 unidades* disponibles de *${firstProduct}* en talla *${firstSize}*.\n\nComo lo tenías en tu carrito, reservamos tu cupo temporalmente. Puedes completar tu pago de forma segura aquí:\n\n👉 Confirmar mi pedido: ${recoveryUrl}\n\n¿Deseas que te asistamos con tu pago por Nequi o transferencia Bancolombia directa?`;
    }
  }, [selectedCheckoutForRecovery, selectedTemplate, selectedCouponCode]);

  const handleLaunchWhatsApp = () => {
    if (!selectedCheckoutForRecovery) return;
    const url = sendAbandonedRecoveryWhatsApp(
      selectedCheckoutForRecovery,
      selectedCouponCode,
      generatedMessage
    );
    window.open(url, '_blank', 'noopener,noreferrer');
    setSelectedCheckoutForRecovery(null);
  };

  const handleCopyRecoveryUrl = (token: string) => {
    const url = `${window.location.origin}/checkout?recover=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('🔗 ¡Enlace de recuperación copiado al portapapeles!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = newCouponCode.toUpperCase().trim();
    if (!code) return;

    const newC: Coupon = {
      id: `coup-${Date.now()}`,
      code,
      type: newCouponType,
      value: newCouponDiscount,
      active: true,
      description: `Cupón de recuperación de carritos abandonados (${newCouponDiscount}${newCouponType === 'PERCENTAGE' ? '%' : ' COP'})`,
      usedCount: 0,
      createdAt: new Date().toISOString(),
    };

    addCoupon(newC);
    setSelectedCouponCode(code);
    setIsCouponModalOpen(false);
    showToast(`🎟️ Cupón "${code}" creado con éxito para campañas de recuperación.`);
  };

  const getStageBadge = (stage: AbandonedCheckout['abandonedStage']) => {
    switch (stage) {
      case 'cart':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
            <ShoppingCart className="w-3 h-3" />
            Solo Carrito
          </span>
        );
      case 'customer_info':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200/60">
            <User className="w-3 h-3" />
            Datos de Contacto
          </span>
        );
      case 'shipping':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
            <Truck className="w-3 h-3" />
            Paso de Envío
          </span>
        );
      case 'payment_gateway':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
            <CreditCard className="w-3 h-3" />
            Pasarela Wompi
          </span>
        );
    }
  };

  const getStatusBadge = (status: AbandonedCheckout['status']) => {
    switch (status) {
      case 'ABANDONED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            ABANDONADO
          </span>
        );
      case 'CONTACTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <MessageCircle className="w-3 h-3" />
            CONTACTADO
          </span>
        );
      case 'RECOVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            RECUPERADO
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            ARCHIVADO
          </span>
        );
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffInMs = Date.now() - date.getTime();
      const diffInMin = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInMin < 60) return `Hace ${Math.max(1, diffInMin)} min`;
      if (diffInHours < 24) return `Hace ${diffInHours} horas`;
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    } catch {
      return 'Reciente';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Carritos & Pedidos Abandonados
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                  {metrics.abandonedCount} pendientes
                </span>
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Convierte carritos inconclusos en ventas efectivas con contacto automático por WhatsApp y cupones de rescate.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCouponModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
          >
            <Tag className="w-4 h-4 text-emerald-400" />
            <span>Crear Cupón de Rescate</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monto a Recuperar</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCOP(metrics.pendingRecoveryInCents)}
            </div>
            <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              {metrics.abandonedCount} clientes con pedidos pendientes
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ventas Recuperadas</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 tracking-tight">
              {formatCOP(metrics.recoveredInCents)}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {metrics.recoveredCount} carritos rescatados con éxito
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tasa de Rescate</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.recoveryRate}%
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              Excelente efectividad por WhatsApp (+35% promedio)
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contactados</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.contactedCount}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Mensajes enviados con enlace directo
            </p>
          </div>
        </div>
      </div>

      {/* Stage Breakdown Funnel */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Embudo de Abandono en Tiempo Real
            </h2>
            <p className="text-xs text-slate-400">
              Identifica en qué momento del checkout los clientes dudan para enviarles la solución adecuada.
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Total sesiones registradas: <span className="text-white font-bold">{metrics.totalCount}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setStageFilter(stageFilter === 'cart' ? 'ALL' : 'cart')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              stageFilter === 'cart'
                ? 'bg-amber-500/20 border-amber-400'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
              <span>1. En Carrito</span>
              <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-black text-white mt-1">{metrics.byStage.cart}</div>
            <div className="text-[11px] text-amber-300/90 mt-1 font-medium">Solo agregaron productos</div>
          </button>

          <button
            onClick={() => setStageFilter(stageFilter === 'customer_info' ? 'ALL' : 'customer_info')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              stageFilter === 'customer_info'
                ? 'bg-sky-500/20 border-sky-400'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
              <span>2. Datos Cliente</span>
              <User className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-xl font-black text-white mt-1">{metrics.byStage.customer_info}</div>
            <div className="text-[11px] text-sky-300/90 mt-1 font-medium">Dejaron nombre/celular</div>
          </button>

          <button
            onClick={() => setStageFilter(stageFilter === 'shipping' ? 'ALL' : 'shipping')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              stageFilter === 'shipping'
                ? 'bg-purple-500/20 border-purple-400'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
              <span>3. Paso Envío</span>
              <Truck className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-black text-white mt-1">{metrics.byStage.shipping}</div>
            <div className="text-[11px] text-purple-300/90 mt-1 font-medium">Revisaron costo de envío</div>
          </button>

          <button
            onClick={() => setStageFilter(stageFilter === 'payment_gateway' ? 'ALL' : 'payment_gateway')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              stageFilter === 'payment_gateway'
                ? 'bg-rose-500/20 border-rose-400'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
              <span>4. Pasarela Wompi</span>
              <CreditCard className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-xl font-black text-white mt-1">{metrics.byStage.payment_gateway}</div>
            <div className="text-[11px] text-rose-300/90 mt-1 font-medium">Abrieron PSE / Nequi</div>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, WhatsApp, email o producto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              Limpiar
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status filter pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({abandonedCheckouts.length})
            </button>
            <button
              onClick={() => setStatusFilter('ABANDONED')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'ABANDONED' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendientes ({metrics.abandonedCount})
            </button>
            <button
              onClick={() => setStatusFilter('CONTACTED')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'CONTACTED' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Contactados ({metrics.contactedCount})
            </button>
            <button
              onClick={() => setStatusFilter('RECOVERED')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'RECOVERED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recuperados ({metrics.recoveredCount})
            </button>
          </div>

          {stageFilter !== 'ALL' && (
            <button
              onClick={() => setStageFilter('ALL')}
              className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Quitar filtro etapa ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Abandoned Checkouts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-4">Cliente & Contacto</th>
                <th className="py-3.5 px-4">Productos en carrito</th>
                <th className="py-3.5 px-4">Monto ($ COP)</th>
                <th className="py-3.5 px-4">Etapa del Abandono</th>
                <th className="py-3.5 px-4">Última Actividad</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acción de Recuperación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCheckouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700">No se encontraron carritos abandonados</p>
                      <p className="text-xs text-slate-400">
                        {searchQuery
                          ? 'Prueba modificando tus términos de búsqueda o filtros.'
                          : '¡Excelente! Los carritos abandonados se registrarán automáticamente cuando los clientes salgan del checkout sin completar el pago.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCheckouts.map((checkout) => {
                  const hasPhone = !!checkout.customer.phone;
                  const hasEmail = !!checkout.customer.email;

                  return (
                    <tr
                      key={checkout.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedCheckoutForDetail(checkout)}
                    >
                      {/* Customer Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                            {checkout.customer.fullName
                              ? checkout.customer.fullName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .substring(0, 2)
                                  .toUpperCase()
                              : 'CL'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{checkout.customer.fullName || 'Cliente Anónimo'}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              {hasPhone && (
                                <span className="flex items-center gap-0.5 font-mono text-emerald-700">
                                  <Phone className="w-2.5 h-2.5" />
                                  {checkout.customer.phone}
                                </span>
                              )}
                              {checkout.customer.city && (
                                <span className="flex items-center gap-0.5 text-slate-400">
                                  <MapPin className="w-2.5 h-2.5" />
                                  {checkout.customer.city}
                                </span>
                              )}
                            </div>
                            {hasEmail && (
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[180px]">
                                {checkout.customer.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Items Preview */}
                      <td className="py-4 px-4">
                        <div className="space-y-1 max-w-xs">
                          {checkout.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <img
                                src={item.image || item.product?.mainImage || ''}
                                alt={item.product.title}
                                className="w-7 h-7 rounded-md object-cover bg-slate-100 border border-slate-200 shrink-0"
                              />
                              <div className="truncate">
                                <span className="font-semibold text-slate-800 text-[11px] block truncate">
                                  {item.product.title}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Talla: {item.selectedSize} | Color: {item.selectedColor} (x{item.quantity})
                                </span>
                              </div>
                            </div>
                          ))}
                          {checkout.items.length > 2 && (
                            <span className="text-[10px] text-indigo-600 font-bold">
                              +{checkout.items.length - 2} productos adicionales
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4">
                        <div className="font-black text-slate-900 text-sm">
                          {formatCOP(checkout.totalAmountInCents)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Subtotal: {formatCOP(checkout.subtotalInCents)}
                        </div>
                      </td>

                      {/* Stage Badge */}
                      <td className="py-4 px-4">{getStageBadge(checkout.abandonedStage)}</td>

                      {/* Last Activity Time */}
                      <td className="py-4 px-4">
                        <div className="text-slate-700 font-medium text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatTimeAgo(checkout.lastActivityAt)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(checkout.lastActivityAt).toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {getStatusBadge(checkout.status)}
                          {checkout.recoveryCount > 0 && (
                            <div className="text-[10px] text-slate-500 font-medium">
                              Intentos: {checkout.recoveryCount}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* One-Click WhatsApp Recovery */}
                          <button
                            onClick={() => {
                              setSelectedCheckoutForRecovery(checkout);
                            }}
                            className="p-2 sm:px-3 sm:py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                            title="Abrir asistente de recuperación WhatsApp con plantilla de descuento"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </button>

                          {/* Restore Cart Test */}
                          <button
                            onClick={() => restoreAbandonedCart(checkout.id)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                            title="Cargar carrito en la tienda y ver checkout"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>

                          {/* Detail Button */}
                          <button
                            onClick={() => setSelectedCheckoutForDetail(checkout)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                            title="Ver detalle del pedido abandonado"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => deleteAbandonedCheckout(checkout.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WHATSAPP RECOVERY MODAL */}
      {selectedCheckoutForRecovery && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Recuperación por WhatsApp
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cliente: <span className="font-bold text-slate-800">{selectedCheckoutForRecovery.customer.fullName || 'Cliente'}</span> (
                    {selectedCheckoutForRecovery.customer.phone || 'Sin teléfono'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCheckoutForRecovery(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Template Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider block">
                Selecciona la Estrategia de Conversión:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(1)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTemplate === 1
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-black">1. Asistencia</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Dudas con pago/talla</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTemplate(2)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTemplate === 2
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-black">2. 10% Descuento</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Cupón de incentivo</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTemplate(3)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTemplate === 3
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-black">3. Envío Gratis</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">A su ciudad</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTemplate(4)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTemplate === 4
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-black">4. Stock Crítico</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Últimas 2 unidades</div>
                </button>
              </div>
            </div>

            {/* Coupon selector */}
            {(selectedTemplate === 2 || selectedTemplate === 3) && (
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Cupón a incluir en el mensaje:</label>
                  <select
                    value={selectedCouponCode}
                    onChange={(e) => setSelectedCouponCode(e.target.value)}
                    className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {coupons.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.code} ({c.value}{c.type === 'PERCENTAGE' ? '%' : ' COP'}) - {c.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Message Preview (WhatsApp Bubble Look) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  Previsualización del Mensaje:
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedMessage);
                    setCopiedMessage(true);
                    setTimeout(() => setCopiedMessage(false), 2000);
                  }}
                  className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedMessage ? 'Copiado' : 'Copiar Texto'}
                </button>
              </div>

              <div className="bg-[#e5ddd5] p-4 rounded-2xl border border-slate-300 relative font-sans text-xs text-slate-900 leading-relaxed shadow-inner whitespace-pre-wrap">
                <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-xs max-w-lg border border-slate-100">
                  {generatedMessage}
                  <div className="text-[10px] text-slate-400 text-right mt-1 font-mono">
                    {new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })} ✓✓
                  </div>
                </div>
              </div>
            </div>

            {/* Direct recovery link box */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2 truncate pr-2">
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500 truncate font-mono text-[11px]">
                  https://tutiendaalamano.co/checkout?recover={selectedCheckoutForRecovery.cartToken}
                </span>
              </div>
              <button
                onClick={() => handleCopyRecoveryUrl(selectedCheckoutForRecovery.cartToken)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shrink-0 cursor-pointer"
              >
                {copiedLink ? '¡Copiado!' : 'Copiar Link'}
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedCheckoutForRecovery(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => {
                  markAbandonedCheckoutRecovered(selectedCheckoutForRecovery.id);
                  setSelectedCheckoutForRecovery(null);
                }}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Marcar Ya Recuperado</span>
              </button>

              <button
                type="button"
                onClick={handleLaunchWhatsApp}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Enviar por WhatsApp Web/App</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CART DETAIL MODAL */}
      {selectedCheckoutForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  ID: {selectedCheckoutForDetail.id}
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Detalle del Carrito Abandonado
                </h3>
              </div>
              <button
                onClick={() => setSelectedCheckoutForDetail(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Customer & Location */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Información del Comprador</span>
                {getStatusBadge(selectedCheckoutForDetail.status)}
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Nombre Completo:</span>
                  <span className="font-semibold text-slate-900">{selectedCheckoutForDetail.customer.fullName || 'No especificado'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Celular / WhatsApp:</span>
                  <span className="font-mono font-semibold text-emerald-700">{selectedCheckoutForDetail.customer.phone || 'No especificado'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Email:</span>
                  <span className="font-mono text-slate-900 truncate block">{selectedCheckoutForDetail.customer.email || 'No especificado'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Destino Colombia:</span>
                  <span className="text-slate-900 font-semibold">{selectedCheckoutForDetail.customer.city || 'Medellín'}, {selectedCheckoutForDetail.customer.department || 'Antioquia'}</span>
                </div>
              </div>
              {selectedCheckoutForDetail.customer.address && (
                <div className="pt-2 border-t border-slate-200 text-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Dirección ingresada:</span>
                  <span>{selectedCheckoutForDetail.customer.address}</span>
                </div>
              )}
            </div>

            {/* Items in Cart */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider block">
                Productos ({selectedCheckoutForDetail.items.length})
              </span>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedCheckoutForDetail.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || item.product?.mainImage || ''}
                        alt={item.product.title}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{item.product.title}</div>
                        <div className="text-[11px] text-slate-500">
                          Talla: <span className="font-bold text-slate-700">{item.selectedSize}</span> | Color:{' '}
                          <span className="font-bold text-slate-700">{item.selectedColor}</span> | Cant: {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="font-black text-slate-900 text-xs">
                      {formatCOP(item.priceInCents * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal productos:</span>
                <span>{formatCOP(selectedCheckoutForDetail.subtotalInCents)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Costo de envío estimado:</span>
                <span>{selectedCheckoutForDetail.shippingInCents === 0 ? 'GRATIS' : formatCOP(selectedCheckoutForDetail.shippingInCents)}</span>
              </div>
              {selectedCheckoutForDetail.discountInCents > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Descuento aplicado:</span>
                  <span>-{formatCOP(selectedCheckoutForDetail.discountInCents)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                <span>Total a Pagar:</span>
                <span className="text-emerald-400">{formatCOP(selectedCheckoutForDetail.totalAmountInCents)}</span>
              </div>
            </div>

            {/* Follow-up Notes */}
            {selectedCheckoutForDetail.recoveryNotes && (
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900">
                <span className="font-bold block mb-0.5">Notas de seguimiento:</span>
                <span>{selectedCheckoutForDetail.recoveryNotes}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  restoreAbandonedCart(selectedCheckoutForDetail.id);
                  setSelectedCheckoutForDetail(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Restaurar Carrito</span>
              </button>

              <button
                onClick={() => {
                  setSelectedCheckoutForRecovery(selectedCheckoutForDetail);
                  setSelectedCheckoutForDetail(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Recuperar por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK COUPON CREATOR MODAL */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCoupon}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Tag className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900">Nuevo Cupón de Rescate</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Código del Cupón:</label>
                <input
                  type="text"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="EJ: RESCATE15"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Descuento:</label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="PERCENTAGE">Porcentaje (%)</option>
                    <option value="FIXED">Monto Fijo (COP)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Valor:</label>
                  <input
                    type="number"
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs shadow-md"
              >
                Crear y Activar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
