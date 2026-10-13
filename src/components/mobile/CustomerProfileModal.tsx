import React, { useEffect, useState } from 'react';
import {
  X,
  User,
  Package,
  MapPin,
  Tag,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  Copy,
  Check,
  ShoppingBag,
  CreditCard,
  Phone,
  Mail,
  Award,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import { CustomerAddress } from '../../types';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ProfileTab = 'orders' | 'addresses' | 'vip' | 'wishlist' | 'settings';

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    currentCustomer,
    isCustomerLoggedIn,
    customerLogin,
    customerLogout,
    customerAddresses,
    addCustomerAddress,
    deleteCustomerAddress,
    setDefaultCustomerAddress,
    customerOrders,
    wishlist,
    products,
    addToCart,
    applyCouponByCode,
    coupons,
    customers,
    themeConfig,
    showToast,
    setIsCartOpen,
    setActiveView,
  } = useStore();

  const [activeTab, setActiveTab] = useState<ProfileTab>('orders');
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Address modal form state
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState('Casa');
  const [newRecipient, setNewRecipient] = useState(currentCustomer?.fullName || '');
  const [newPhone, setNewPhone] = useState(currentCustomer?.phone || '');
  const [newDept, setNewDept] = useState('Antioquia');
  const [newCity, setNewCity] = useState('Medellín');
  const [newAddress, setNewAddress] = useState('');
  const [newNeighborhood, setNewNeighborhood] = useState('');
  const [newExtra, setNewExtra] = useState('');
  const [newIsDefault, setNewIsDefault] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPhone, setLoginPhone] = useState('');

  // Selected order tracking detail
  const [viewingOrderTracking, setViewingOrderTracking] = useState<string | null>(null);

  // Salida explícita con Escape. El fondo NO cierra: solo X, botón Salir o logout.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDark = themeConfig.mode === 'dark';

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    applyCouponByCode(code);
    showToast(`🎟️ Cupón "${code}" copiado y aplicado a tu bolsa.`);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim() || !newCity.trim()) {
      showToast('⚠️ Completa la dirección y ciudad.');
      return;
    }
    addCustomerAddress({
      label: newAddressLabel,
      recipientName: newRecipient || currentCustomer?.fullName || 'Cliente',
      phone: newPhone || currentCustomer?.phone || '3000000000',
      department: newDept,
      city: newCity,
      address: newAddress,
      neighborhood: newNeighborhood,
      extraDetails: newExtra,
      isDefault: newIsDefault,
    });
    setShowAddAddressModal(false);
    setNewAddress('');
    setNewNeighborhood('');
    setNewExtra('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      showToast('⚠️ Ingresa un correo electrónico válido.');
      return;
    }
    customerLogin(loginEmail, loginName, loginPhone);
  };

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  // Progreso de nivel por pedidos acumulados (retención).
  const TIER_ORDER = ['NUEVO', 'MIEMBRO', 'VIP', 'GOLD'];
  const TIER_GOALS = [0, 1, 5, 15];
  const ordersCount = Math.max(customerOrders.length, currentCustomer?.totalOrders || 0);
  const tierIdx = Math.max(0, TIER_ORDER.indexOf((currentCustomer?.tier || 'NUEVO').toUpperCase()));
  const isMaxTier = tierIdx >= TIER_ORDER.length - 1;
  const nextIdx = Math.min(tierIdx + 1, TIER_ORDER.length - 1);
  const tierBase = TIER_GOALS[tierIdx];
  const tierNext = TIER_GOALS[nextIdx];
  const tierProgress = isMaxTier
    ? 100
    : Math.min(100, Math.max(0, ((ordersCount - tierBase) / Math.max(1, tierNext - tierBase)) * 100));
  const ordersToNext = isMaxTier ? 0 : Math.max(0, tierNext - ordersCount);
  const totalSpent = currentCustomer?.ltvInCents || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full sm:max-w-2xl sm:rounded-3xl max-h-[92vh] sm:max-h-[85vh] flex flex-col rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 ${
          isDark ? 'bg-zinc-950 text-white border border-zinc-800' : 'bg-white text-zinc-900 border border-zinc-200'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between border-b ${
            isDark ? 'border-zinc-800/80 bg-zinc-900/50' : 'border-zinc-100 bg-zinc-50/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white shadow-sm"
              style={{ backgroundColor: themeConfig.primaryColor }}
            >
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black font-sans tracking-wide uppercase">
                {isCustomerLoggedIn ? 'Mi Cuenta Oficial' : 'Ingresar a Mi Cuenta'}
              </h2>
              <p className="text-[10px] font-mono text-zinc-400">
                {isCustomerLoggedIn ? 'TU TIENDA A LA MANO // CLIENT PRIVILEGES' : 'Inicia sesión para ver tu historial y puntos'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-200 text-zinc-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Not Logged In View */}
        {!isCustomerLoggedIn ? (
          <div className="p-6 overflow-y-auto space-y-6">
            <div
              className={`p-5 rounded-2xl border text-center space-y-2 ${
                isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200/80'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black uppercase tracking-tight">Acceso Exclusivo Miembro</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Rastrea tus envíos en tiempo real con Coordinadora y Servientrega, guarda tus direcciones de Colombia y accede a drops con cupones VIP.
              </p>
            </div>

            {/* Quick Demo Login Accounts */}
            <div>
              <p className="text-[11px] font-mono font-bold uppercase text-zinc-400 mb-2.5">
                Ingreso rápido con cuentas de prueba:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {customers.slice(0, 3).map((cust) => (
                  <button
                    key={cust.id}
                    onClick={() => customerLogin(cust.email, cust.fullName, cust.phone, cust.city)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isDark
                        ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-600'
                        : 'bg-white border-zinc-200 hover:border-black'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-amber-400/20 text-amber-500">
                        {cust.tier}
                      </span>
                      <p className="text-xs font-bold mt-1.5 truncate">{cust.fullName}</p>
                      <p className="text-[10px] font-mono text-zinc-400 truncate">{cust.city}</p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-500 font-bold mt-2">
                      {cust.totalOrders} compras reales
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Email Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-[11px] font-mono font-bold uppercase text-zinc-400">O ingresa con tu correo:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">Tu Nombre Completo</label>
                  <input
                    type="text"
                    placeholder="Ej: Mateo Arango"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl border font-sans ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">WhatsApp (+57)</label>
                  <input
                    type="text"
                    placeholder="Ej: 300 123 4567"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl border font-sans ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border font-sans ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs text-white shadow-md transition-transform active:scale-98 cursor-pointer"
                style={{ backgroundColor: themeConfig.primaryColor }}
              >
                Ingresar / Crear Cuenta Member
              </button>
            </form>
          </div>
        ) : (
          /* Logged In Customer Profile Content */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Hero de identidad: degradado de marca, avatar, nivel y progreso */}
            <div
              className="relative overflow-hidden text-white"
              style={{ background: `linear-gradient(135deg, ${themeConfig.primaryColor}, ${themeConfig.primaryHover})` }}
            >
              <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -bottom-14 -left-8 w-40 h-40 rounded-full bg-black/10 pointer-events-none" />
              <div className="relative p-4 sm:p-5 flex items-center gap-3.5">
                <img
                  src={
                    currentCustomer?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={currentCustomer?.fullName}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/80 shadow-lg shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black uppercase tracking-tight truncate">{currentCustomer?.fullName}</h3>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full font-black bg-amber-400 text-black uppercase shadow-sm">
                      {currentCustomer?.tier || 'NUEVO'}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/85 truncate mt-0.5">
                    {currentCustomer?.email} • <strong>{currentCustomer?.city}</strong>
                  </p>
                  <p className="text-[10px] text-white/70 mt-0.5 font-mono">
                    {ordersCount} compras acumuladas
                  </p>
                </div>
                <div className="text-right shrink-0 bg-black/20 rounded-2xl px-3 py-2 backdrop-blur-xs">
                  <p className="text-[9px] font-mono uppercase text-white/70">Puntos</p>
                  <p className="text-sm font-mono font-black text-amber-300">
                    {currentCustomer?.vipPoints || 0}
                  </p>
                </div>
              </div>
              <div className="relative px-4 sm:px-5 pb-4">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/90 mb-1.5">
                  <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-amber-300" /> Nivel {TIER_ORDER[tierIdx]}</span>
                  <span>{isMaxTier ? 'Nivel máximo 🏆' : `${ordersToNext} pedido${ordersToNext === 1 ? '' : 's'} para ${TIER_ORDER[nextIdx]}`}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/25 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-400 transition-all duration-700"
                    style={{ width: `${tierProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-2 px-4 sm:px-5 pt-3">
              {[
                { label: 'Pedidos', value: String(ordersCount), icon: Package },
                { label: 'Total', value: `$${formatCOP(totalSpent)}`, icon: CreditCard },
                { label: 'Deseos', value: String(wishlist.length), icon: Heart },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className={`rounded-2xl border px-2 py-2.5 text-center ${
                      isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200/80'
                    }`}
                  >
                    <Icon className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                    <p className="text-xs font-black truncate">{s.value}</p>
                    <p className="text-[9px] font-mono uppercase text-zinc-400">{s.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 px-4 pt-3 pb-1 overflow-x-auto scrollbar-none">
              {[
                { id: 'orders', label: 'Mis Pedidos', icon: Package, count: customerOrders.length },
                { id: 'addresses', label: 'Direcciones', icon: MapPin, count: customerAddresses.length },
                { id: 'vip', label: 'Club & Cupones', icon: Tag, count: coupons.filter((c) => c.active).length },
                { id: 'wishlist', label: 'Deseos', icon: Heart, count: wishlist.length },
                { id: 'settings', label: 'Ajustes', icon: Settings, count: null },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ProfileTab)}
                    style={isActive ? { backgroundColor: themeConfig.primaryColor, borderColor: themeConfig.primaryColor } : undefined}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold font-sans uppercase tracking-wider whitespace-nowrap transition-all rounded-full border cursor-pointer shrink-0 ${
                      isActive
                        ? 'text-white shadow-md'
                        : isDark
                        ? 'text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-600'
                        : 'text-zinc-500 border-zinc-200 hover:text-zinc-900 hover:border-zinc-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                          isActive ? 'bg-white/25 text-white' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
              {/* TAB 1: REAL ORDERS HISTORY */}
              {activeTab === 'orders' && (
                <div className="space-y-3">
                  {customerOrders.length === 0 ? (
                    <div className="text-center py-10 space-y-3">
                      <Package className="w-10 h-10 text-zinc-400 mx-auto" />
                      <p className="text-sm font-bold uppercase">No tienes pedidos registrados aún</p>
                      <p className="text-xs text-zinc-400 font-mono">
                        Tus compras y pedidos aparecerán aquí con seguimiento en tiempo real.
                      </p>
                      <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-sm cursor-pointer"
                        style={{ backgroundColor: themeConfig.primaryColor }}
                      >
                        Explorar Drops Ahora
                      </button>
                    </div>
                  ) : (
                    customerOrders.map((order) => {
                      const isTrackingOpen = viewingOrderTracking === order.id;

                      return (
                        <div
                          key={order.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'
                          }`}
                        >
                          {/* Order Card Header */}
                          <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-black uppercase text-zinc-900 dark:text-white">
                                  {order.reference}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-400">
                                  {new Date(order.createdAt).toLocaleDateString('es-CO', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                              <p className="text-[11px] font-mono text-zinc-400">
                                Pago: <strong className="text-emerald-500">{order.wompiTransaction?.paymentMethod || 'EN LÍNEA'}</strong> • {order.items.length} productos
                              </p>
                            </div>

                            <div className="text-right">
                              <span
                                className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase inline-block ${
                                  order.status === 'APPROVED'
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : order.status === 'PENDING'
                                    ? 'bg-amber-500/10 text-amber-500'
                                    : 'bg-rose-500/10 text-rose-500'
                                }`}
                              >
                                {order.status === 'APPROVED' ? 'PAGO APROBADO' : order.status}
                              </span>
                              <p className="text-xs font-mono font-black mt-1">
                                ${formatCOP(order.totalAmountInCents)}
                              </p>
                            </div>
                          </div>

                          {/* Order Items Preview */}
                          <div className="py-3 space-y-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={item.image}
                                    alt={item.productTitle}
                                    className="w-11 h-11 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0"
                                  />
                                  <div>
                                    <p className="text-xs font-bold font-sans uppercase line-clamp-1">{item.productTitle}</p>
                                    <p className="text-[10px] font-mono text-zinc-400">
                                      Talla: <strong>{item.selectedSize}</strong> • Cant: {item.quantity} • {item.selectedColor}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-xs font-mono font-bold whitespace-nowrap">
                                  ${formatCOP(item.totalPriceInCents)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Shipping Status & Carrier Info */}
                          <div
                            className={`p-3 rounded-xl flex items-center justify-between gap-2 text-xs font-mono ${
                              isDark ? 'bg-zinc-950/70' : 'bg-zinc-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-emerald-500 shrink-0" />
                              <div>
                                <span className="font-bold text-[11px] block">
                                  {order.carrier || 'Coordinadora Express'}
                                </span>
                                <span className="text-[10px] text-zinc-400">
                                  Guía: <strong>{order.trackingNumber || 'CRD-2026-MED-881'}</strong>
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => setViewingOrderTracking(isTrackingOpen ? null : order.id)}
                              className="text-[10px] font-bold text-emerald-500 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>{isTrackingOpen ? 'Ocultar Rastreo' : 'Rastrear Envío'}</span>
                              <ChevronRight className={`w-3 h-3 transition-transform ${isTrackingOpen ? 'rotate-90' : ''}`} />
                            </button>
                          </div>

                          {/* Live Tracking Timeline Dropdown */}
                          {isTrackingOpen && (
                            <div
                              className={`mt-3 p-3.5 rounded-xl border text-xs font-mono space-y-3 animate-in fade-in duration-200 ${
                                isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                              }`}
                            >
                              <p className="text-[11px] font-bold uppercase text-zinc-400">Estado de Entrega en Ruta:</p>
                              <div className="space-y-2 relative pl-4 border-l-2 border-emerald-500">
                                <div className="relative">
                                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                                  <p className="font-bold text-emerald-500">En Tránsito hacia {order.customer.city}</p>
                                  <p className="text-[10px] text-zinc-400">Centro de Distribución Medellín // Despacho Prioritario</p>
                                </div>
                                <div className="relative opacity-60">
                                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-400" />
                                  <p className="font-bold">Pago Aprobado y Guía Generada</p>
                                  <p className="text-[10px] text-zinc-400">Verificación de seguridad completada</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Repeat Purchase Action */}
                          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-zinc-400">
                              Dirección: {order.customer.address}, {order.customer.city}
                            </span>

                            <button
                              onClick={() => {
                                order.items.forEach((it) => {
                                  const prod = products.find((p) => p.id === it.productId);
                                  if (prod) {
                                    addToCart(prod, it.selectedSize, it.selectedColor, it.quantity);
                                  }
                                });
                                showToast('🛍️ Productos agregados nuevamente a tu bolsa.');
                                onClose();
                                setIsCartOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 transition-colors cursor-pointer"
                            >
                              Volver a Comprar
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 2: SAVED ADDRESSES */}
              {activeTab === 'addresses' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono font-bold uppercase text-zinc-400">
                      Direcciones de Envío Guardadas en Colombia
                    </p>
                    <button
                      onClick={() => setShowAddAddressModal(true)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
                      style={{ backgroundColor: themeConfig.primaryColor }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nueva</span>
                    </button>
                  </div>

                  {customerAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-sans uppercase">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-500 uppercase">
                                Principal
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-medium">{addr.address}</p>
                          <p className="text-[11px] font-mono text-zinc-400">
                            Barrio {addr.neighborhood} • {addr.city}, {addr.department}
                          </p>
                          <p className="text-[10px] font-mono text-zinc-500">
                            Recibe: {addr.recipientName} (Tel: {addr.phone})
                          </p>
                          {addr.extraDetails && (
                            <p className="text-[10px] font-mono text-zinc-400 italic">
                              Nota: {addr.extraDetails}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!addr.isDefault && (
                            <button
                              onClick={() => setDefaultCustomerAddress(addr.id)}
                              className="text-[10px] font-mono font-bold text-zinc-400 hover:text-emerald-500 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                            >
                              Hacer Principal
                            </button>
                          )}
                          <button
                            onClick={() => deleteCustomerAddress(addr.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Eliminar dirección"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Address Form Dialog */}
                  {showAddAddressModal && (
                    <form
                      onSubmit={handleSaveAddress}
                      className={`p-4 rounded-2xl border space-y-3 animate-in fade-in ${
                        isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-50 border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                        <span className="text-xs font-black uppercase">Agregar Nueva Dirección de Envío</span>
                        <button
                          type="button"
                          onClick={() => setShowAddAddressModal(false)}
                          className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">Nombre Lugar (ej: Casa)</label>
                          <input
                            type="text"
                            value={newAddressLabel}
                            onChange={(e) => setNewAddressLabel(e.target.value)}
                            className={`w-full px-3 py-2 text-xs rounded-xl border ${
                              isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">Departamento</label>
                          <input
                            type="text"
                            value={newDept}
                            onChange={(e) => setNewDept(e.target.value)}
                            className={`w-full px-3 py-2 text-xs rounded-xl border ${
                              isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">Ciudad / Municipio *</label>
                          <input
                            type="text"
                            required
                            value={newCity}
                            onChange={(e) => setNewCity(e.target.value)}
                            className={`w-full px-3 py-2 text-xs rounded-xl border ${
                              isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">Barrio / Sector</label>
                          <input
                            type="text"
                            value={newNeighborhood}
                            onChange={(e) => setNewNeighborhood(e.target.value)}
                            className={`w-full px-3 py-2 text-xs rounded-xl border ${
                              isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">Dirección Exacta (Calle, Carrera, Apto) *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Calle 10 # 43E-22, Apto 804"
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                          className={`w-full px-3 py-2 text-xs rounded-xl border ${
                            isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">Indicaciones de Entrega</label>
                        <input
                          type="text"
                          placeholder="Ej: Dejar en portería con vigilancia 24h"
                          value={newExtra}
                          onChange={(e) => setNewExtra(e.target.value)}
                          className={`w-full px-3 py-2 text-xs rounded-xl border ${
                            isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200'
                          }`}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newIsDefault}
                            onChange={(e) => setNewIsDefault(e.target.checked)}
                            className="rounded text-black focus:ring-0"
                          />
                          <span>Marcar como dirección principal</span>
                        </label>

                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
                          style={{ backgroundColor: themeConfig.primaryColor }}
                        >
                          Guardar Dirección
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 3: VIP CLUB & COUPONS */}
              {activeTab === 'vip' && (
                <div className="space-y-4">
                  {/* VIP Progress */}
                  <div
                    className={`p-4 rounded-2xl border ${
                      isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase">Nivel: VIP GOLD</span>
                      <span className="text-xs font-mono font-black text-amber-500">
                        {currentCustomer?.vipPoints || 1420} / 2,000 PTS
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-500"
                        style={{ width: `${Math.min(100, ((currentCustomer?.vipPoints || 1420) / 2000) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-mono text-zinc-400 mt-2">
                      Te faltan {2000 - (currentCustomer?.vipPoints || 1420)} puntos para desbloquear el nivel <strong>BLACK ARCHIVE</strong> con envíos gratis de por vida.
                    </p>
                  </div>

                  {/* Active Member Coupons */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-mono font-bold uppercase text-zinc-400">
                      Tus Cupones de Descuento Disponibles:
                    </p>
                    {coupons.filter((c) => c.active).map((coupon) => (
                      <div
                        key={coupon.id}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                          isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black tracking-wider text-emerald-500 uppercase">
                              {coupon.code}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
                              {coupon.type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `$${formatCOP(coupon.value * 100)} COP`}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{coupon.description}</p>
                        </div>

                        <button
                          onClick={() => handleCopyCoupon(coupon.code)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                            copiedCoupon === coupon.code
                              ? 'bg-emerald-500 text-white'
                              : isDark
                              ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                              : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                          }`}
                        >
                          {copiedCoupon === coupon.code ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Aplicado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: WISHLIST INTEGRATED */}
              {activeTab === 'wishlist' && (
                <div className="space-y-3">
                  {wishlistProducts.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <Heart className="w-8 h-8 text-zinc-400 mx-auto" />
                      <p className="text-xs font-bold uppercase">Tu lista de deseos está vacía</p>
                      <p className="text-[11px] font-mono text-zinc-400">Guarda productos haciendo clic en el corazón.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {wishlistProducts.map((p) => {
                        const wPrice = p.variants?.[0]?.priceInCents || 0;
                        const wSize = p.availableSizes?.[0] || 'M';
                        const wColor = p.availableColors?.[0]?.name || 'Estándar';
                        return (
                        <div
                          key={p.id}
                          className={`p-3 rounded-2xl border flex items-center gap-3 ${
                            isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'
                          }`}
                        >
                          <img
                            src={p.mainImage}
                            alt={p.title}
                            className="w-14 h-14 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold uppercase truncate">{p.title}</p>
                            <p className="text-xs font-mono font-black text-emerald-500">
                              ${formatCOP(wPrice)}
                            </p>
                            <button
                              onClick={() => {
                                addToCart(p, wSize, wColor);
                                showToast(`🛍️ ${p.title} agregado a la bolsa.`);
                              }}
                              className="mt-1 text-[10px] font-bold text-zinc-900 dark:text-white underline cursor-pointer"
                            >
                              Agregar a Bolsa
                            </button>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: SETTINGS & ACCOUNT ACTIONS */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'
                    }`}
                  >
                    <p className="text-xs font-mono font-bold uppercase text-zinc-400">Datos Personales</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                        <span className="text-zinc-400 font-mono">Nombre:</span>
                        <span className="font-bold">{currentCustomer?.fullName}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                        <span className="text-zinc-400 font-mono">Correo:</span>
                        <span className="font-bold">{currentCustomer?.email}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                        <span className="text-zinc-400 font-mono">WhatsApp:</span>
                        <span className="font-bold">{currentCustomer?.phone}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-zinc-400 font-mono">Ciudad Principal:</span>
                        <span className="font-bold">{currentCustomer?.city}, Colombia</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        customerLogout();
                        onClose();
                        setActiveView('home');
                        showToast('Has cerrado sesión de cliente.');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-bold font-mono uppercase transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión de Mi Cuenta</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Salida explícita del perfil */}
            <div className="px-4 sm:px-5 py-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 transition-colors cursor-pointer"
              >
                ← Salir del perfil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
