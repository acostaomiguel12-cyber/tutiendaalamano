import React from 'react';
import {
  X,
  User,
  Package,
  Truck,
  Heart,
  Tag,
  MapPin,
  MessageCircle,
  Zap,
  Moon,
  Sun,
  Download,
  ShieldCheck,
  LogOut,
  ChevronRight,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  Bell,
  CreditCard,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import { getMerchantWhatsAppDigits, waLink } from '../../lib/whatsappOrder';

interface MobileMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWishlist: () => void;
  onOpenProfileTab: (tab: 'orders' | 'addresses' | 'vip' | 'wishlist' | 'settings') => void;
}

export const MobileMenuSheet: React.FC<MobileMenuSheetProps> = ({
  isOpen,
  onClose,
  onOpenWishlist,
  onOpenProfileTab,
}) => {
  const {
    currentCustomer,
    isCustomerLoggedIn,
    customerLogout,
    customerOrders,
    openOrderTracking,
    wishlist,
    coupons,
    cartCount,
    setIsCartOpen,
    themeConfig,
    updateThemeConfig,
    showToast,
    setActiveView,
    isAdminAuthenticated,
    setActiveCategoryFilter,
    storePreferences,
  } = useStore();

  if (!isOpen) return null;

  const isDark = themeConfig.mode === 'dark';

  const toggleDarkMode = () => {
    const nextMode = isDark ? 'light' : 'dark';
    updateThemeConfig({ mode: nextMode });
    showToast(nextMode === 'dark' ? '🌙 Modo Oscuro Activado' : '☀️ Modo Claro Activado');
  };

  const handleWhatsAppSupport = () => {
    const digits = getMerchantWhatsAppDigits(storePreferences.supportPhoneWhatsApp);
    window.open(
      waLink(digits, '¡Hola Tu Tienda a la Mano! 👋 Necesito asesoría con un pedido o producto desde el aplicativo móvil.'),
      '_blank'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content - Facebook Style Menu Sheet */}
      <div
        className={`relative z-10 w-full max-w-lg rounded-t-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 ${
          isDark
            ? 'bg-zinc-950 text-white border-t border-zinc-800'
            : 'bg-[#f8f9fa] text-zinc-900 border-t border-zinc-300'
        }`}
      >
        {/* Drag Handle Bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-zinc-400/40" />
        </div>

        {/* Facebook Style Menu Header */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black font-sans tracking-tight">Menú</h2>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase">
              App Móvil
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* 1. Customer Profile Card or Direct Order Tracking Card */}
          {isCustomerLoggedIn && currentCustomer ? (
            <div
              onClick={() => {
                onClose();
                onOpenProfileTab('settings');
              }}
              className={`p-3.5 rounded-2xl flex items-center justify-between border shadow-xs transition-all active:scale-[0.99] cursor-pointer ${
                isDark
                  ? 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                  : 'bg-white border-zinc-200/90 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  {currentCustomer.avatarUrl ? (
                    <img
                      src={currentCustomer.avatarUrl}
                      alt={currentCustomer.fullName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/50"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-black flex items-center justify-center text-base shadow-sm">
                      {currentCustomer.fullName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white">
                      {currentCustomer.fullName}
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                      {currentCustomer.tier || 'VIP'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">
                    {currentCustomer.email}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-zinc-400" />
            </div>
          ) : (
            <div
              onClick={() => {
                onClose();
                openOrderTracking();
              }}
              className={`p-3.5 rounded-2xl flex items-center justify-between border shadow-xs transition-all active:scale-[0.99] cursor-pointer ${
                isDark
                  ? 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                  : 'bg-white border-zinc-200/90 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 font-black flex items-center justify-center text-base shadow-sm">
                  <Truck className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white">
                      Rastrear Mi Pedido
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                      Sin Registro
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">
                    Consulta con tu número de orden o celular
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-zinc-400" />
            </div>
          )}

          {/* 2. Shortcuts Section Header */}
          <div>
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-xs font-black uppercase tracking-wider font-mono text-zinc-500 dark:text-zinc-400">
                Tus accesos directos
              </span>
              <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                Pedidos & Envíos
              </span>
            </div>

            {/* Shortcuts 2-Column Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Shortcut: Mis Pedidos */}
              <button
                onClick={() => {
                  onClose();
                  if (isCustomerLoggedIn) {
                    onOpenProfileTab('orders');
                  } else {
                    openOrderTracking();
                  }
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer shadow-2xs ${
                  isDark
                    ? 'bg-zinc-900/70 border-zinc-800/80 hover:bg-zinc-850'
                    : 'bg-white border-zinc-200/80 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  {customerOrders.length > 0 && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                      {customerOrders.length}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold font-sans">Mis Pedidos</h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                    Estado & Rastreo
                  </p>
                </div>
              </button>

              {/* Shortcut: Rastreo de Guía */}
              <button
                onClick={() => {
                  onClose();
                  openOrderTracking();
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer shadow-2xs ${
                  isDark
                    ? 'bg-zinc-900/70 border-zinc-800/80 hover:bg-zinc-850'
                    : 'bg-white border-zinc-200/80 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                    Coordinadora
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold font-sans">Rastreo de Guía</h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                    Seguimiento 24/48h
                  </p>
                </div>
              </button>

              {/* Shortcut: Deseos / Favoritos */}
              <button
                onClick={() => {
                  onClose();
                  onOpenWishlist();
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer shadow-2xs ${
                  isDark
                    ? 'bg-zinc-900/70 border-zinc-800/80 hover:bg-zinc-850'
                    : 'bg-white border-zinc-200/80 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <Heart className="w-5 h-5" />
                  </div>
                  {wishlist.length > 0 && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                      {wishlist.length}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold font-sans">Favoritos</h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                    Lista de deseos
                  </p>
                </div>
              </button>

              {/* Shortcut: Cupones & Promos */}
              <button
                onClick={() => {
                  onClose();
                  onOpenProfileTab('vip');
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer shadow-2xs ${
                  isDark
                    ? 'bg-zinc-900/70 border-zinc-800/80 hover:bg-zinc-850'
                    : 'bg-white border-zinc-200/80 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Tag className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase">
                    Hasta 40% OFF
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold font-sans">Cupones & Promos</h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                    {coupons.length} Códigos activos
                  </p>
                </div>
              </button>

              {/* Shortcut: Mis Direcciones */}
              <button
                onClick={() => {
                  onClose();
                  onOpenProfileTab('addresses');
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer shadow-2xs ${
                  isDark
                    ? 'bg-zinc-900/70 border-zinc-800/80 hover:bg-zinc-850'
                    : 'bg-white border-zinc-200/80 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold font-sans">Direcciones de Envío</h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                    Medellín, Bogotá, etc.
                  </p>
                </div>
              </button>

              {/* Shortcut: WhatsApp Asesor Directo */}
              <button
                onClick={handleWhatsAppSupport}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer shadow-2xs ${
                  isDark
                    ? 'bg-zinc-900/70 border-zinc-800/80 hover:bg-zinc-850'
                    : 'bg-white border-zinc-200/80 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-sans">WhatsApp Directo</h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                    Asesor 24/7 en línea
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Settings & Preferences (List Style like Facebook Menu footer) */}
          <div
            className={`rounded-2xl border overflow-hidden divide-y ${
              isDark
                ? 'bg-zinc-900/80 border-zinc-800 divide-zinc-800'
                : 'bg-white border-zinc-200 divide-zinc-100'
            }`}
          >
            {/* Dark Mode Toggle */}
            <div
              onClick={toggleDarkMode}
              className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                  {isDark ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                </div>
                <div>
                  <p className="text-xs font-bold font-sans">Modo de Pantalla</p>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    {isDark ? 'Oscuro (OLED Black)' : 'Claro (Clean Studio)'}
                  </p>
                </div>
              </div>
              <div
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                  isDark ? 'bg-blue-600' : 'bg-zinc-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isDark ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            {/* Logout Option (if customer is logged in) */}
            {isCustomerLoggedIn && (
              <div
                onClick={() => {
                  onClose();
                  customerLogout();
                }}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors text-rose-600 dark:text-rose-400"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold font-sans">Cerrar Sesión</p>
                    <p className="text-[10px] text-zinc-500 font-mono">Salir de tu cuenta de cliente</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="text-center pt-2 pb-6 text-zinc-400 font-mono text-[10px]">
            TU TIENDA A LA MANO // APLICATIVO MÓVIL v2.5
          </div>
        </div>
      </div>
    </div>
  );
};
