import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Clock,
  ShieldCheck,
  Check,
  Sparkles,
  X,
  Zap,
  Menu,
  Command,
  ChevronDown,
  LogOut,
  UserCheck,
  Smartphone,
  Volume2,
  Package,
  ExternalLink,
  CheckCheck,
  Globe,
  Share2,
  Store,
  HelpCircle,
  MoreVertical,
  Activity,
  Move,
  Play,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ShareStoreModal } from './ShareStoreModal';

export const AdminHeader: React.FC = () => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    testAudioSound,
    orders,
    setSelectedOrderForDetail,
    showToast,
    adminSearchQuery,
    setAdminSearchQuery,
    setAdminTab,
    setAdminSidebarMobileOpen,
    setCommandPaletteOpen,
    currentAdminUser,
    adminUsers,
    switchAdminUser,
    adminLogout,
    openAdminHelp,
    openSystemVideoTutorial,
    openHeroImageEditor,
  } = useStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExtraMenu, setShowExtraMenu] = useState(false);

  const extraMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (extraMenuRef.current && !extraMenuRef.current.contains(e.target as Node)) {
        setShowExtraMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.read);

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markNotificationAsRead(notif.id);

    // If notification has associated order reference, open that order
    if (notif.orderReference || notif.orderId) {
      const matched = orders.find(
        (o) =>
          o.id === notif.orderId ||
          o.reference === notif.orderReference ||
          (notif.orderReference && o.reference.includes(notif.orderReference.replace('#', '')))
      );
      if (matched) {
        setSelectedOrderForDetail(matched);
        setAdminTab('orders');
        setShowNotifications(false);
        showToast(`Abriendo detalle de pedido ${matched.reference}`);
        return;
      }
    }

    setShowNotifications(false);
    setAdminTab('notifications');
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-4 sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Sidebar Hamburger & Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-lg">
        <button
          onClick={() => setAdminSidebarMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
          title="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input & Command Shortcut */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={adminSearchQuery}
            onChange={(e) => setAdminSearchQuery(e.target.value)}
            placeholder="Buscar órdenes, SKUs o clientes..."
            className="w-full pl-9 pr-14 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md transition-colors cursor-pointer"
            title="Abrir paleta de comandos rápida (⌘K)"
          >
            <span>⌘K</span>
          </button>
        </div>
      </div>

      {/* Right Controls: Clean, well-spaced and organized */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* View Store Button (Interactive Live Preview / Storefront) */}
        <button
          onClick={() => setAdminTab('store-preview')}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 border border-emerald-500"
          title="Ver y explorar la tienda en vivo"
        >
          <Store className="w-3.5 h-3.5" />
          <span className="font-sans">Ver Tienda</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse hidden sm:inline" />
        </button>

        {/* HeroBanner Visual Image Positioning & Sizing Editor Button */}
        <button
          onClick={() => openHeroImageEditor()}
          className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
          title="Editor Visual de Imagen — Posición (object-position) y Tamaño del HeroBanner"
        >
          <Move className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-sans hidden lg:inline">Ajustar Portada</span>
          <span className="font-sans lg:hidden">Portada</span>
        </button>

        {/* Share Store Public Link for Super Admin */}
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-indigo-200 active:scale-95"
          title="Compartir enlace público de la tienda a clientes"
        >
          <Share2 className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-sans hidden sm:inline">Compartir Link a Clientes</span>
          <span className="font-sans sm:hidden">Compartir</span>
        </button>

        {/* Video Tutorials Screencast Button */}
        <button
          onClick={() => openSystemVideoTutorial()}
          className="flex items-center gap-1.5 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold px-2.5 sm:px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer shadow-xs border border-rose-400/40 active:scale-95 group"
          title="Ver Grabaciones y Videos Tutoriales del Sistema en 1080p"
        >
          <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
          <span className="font-sans hidden lg:inline">Videos del Sistema</span>
          <span className="font-sans lg:hidden hidden sm:inline">Videos</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping hidden md:inline" />
        </button>

        {/* Quick Help Guide & Manual Button */}
        <button
          onClick={() => openAdminHelp()}
          className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold px-2.5 sm:px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer shadow-xs border border-amber-400/40 active:scale-95 group"
          title="Abrir Guías Rápidas y Manual de esta sección"
        >
          <HelpCircle className="w-3.5 h-3.5 text-white group-hover:rotate-12 transition-transform" />
          <span className="font-sans hidden sm:inline">Ayuda</span>
        </button>

        {/* More Tools Dropdown (Domain & System Health consolidated to avoid clutter) */}
        <div className="relative" ref={extraMenuRef}>
          <button
            onClick={() => {
              setShowExtraMenu(!showExtraMenu);
              setShowNotifications(false);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/80 cursor-pointer"
            title="Herramientas y accesos rápidos"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showExtraMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Herramientas del Sistema
              </div>
              <button
                onClick={() => {
                  openSystemVideoTutorial();
                  setShowExtraMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors text-left cursor-pointer"
              >
                <Play className="w-4 h-4 fill-rose-600 text-rose-600" />
                <span>🎬 Videos del Sistema (1080p)</span>
              </button>
              <button
                onClick={() => {
                  openHeroImageEditor();
                  setShowExtraMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <Move className="w-4 h-4 text-emerald-600" />
                <span>Editor Imagen Hero (Banner)</span>
              </button>
              <button
                onClick={() => {
                  setAdminTab('domain-trust');
                  setShowExtraMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Gestor Dominio .COM</span>
              </button>
              <button
                onClick={() => {
                  setAdminTab('system-testing');
                  setShowExtraMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Diagnóstico & Salud</span>
              </button>
              <button
                onClick={() => {
                  setShowShareModal(true);
                  setShowExtraMenu(false);
                }}
                className="sm:hidden w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-indigo-600" />
                <span>Compartir Link Tienda</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
              setShowExtraMenu(false);
            }}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative border border-slate-200/80 cursor-pointer"
            title="Notificaciones y Webhooks en Vivo"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-rose-600 text-white font-mono text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white shadow-xs animate-pulse">
                {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 space-y-3 animate-fade-in text-left">
              {/* Header with actions */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">Notificaciones & Webhooks</span>
                  {unreadNotifications.length > 0 ? (
                    <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                      {unreadNotifications.length} sin leer
                    </span>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Al día
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={testAudioSound}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    title="Probar sonido de alerta"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  {unreadNotifications.length > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="Marcar todas como leídas"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                    title="Cerrar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto space-y-2 text-xs pr-1">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No hay notificaciones registradas
                  </div>
                ) : (
                  notifications.slice(0, 8).map((notif) => {
                    const isNewOrder = notif.type === 'NEW_ORDER_ALERT';
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`cursor-pointer p-3 rounded-2xl transition-all border space-y-1.5 relative ${
                          !notif.read
                            ? isNewOrder
                              ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-50'
                              : 'bg-indigo-50/50 border-indigo-200 hover:bg-indigo-50'
                            : 'bg-white border-slate-100 hover:bg-slate-50 opacity-80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {!notif.read && (
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  isNewOrder ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-600'
                                }`}
                              />
                            )}
                            <span className="font-bold text-slate-900 text-[11px] leading-tight line-clamp-1">
                              {notif.subject}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400 shrink-0 font-mono">
                            {new Date(notif.sentAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-600 leading-normal line-clamp-2">
                          {notif.previewText}
                        </p>

                        <div className="flex items-center justify-between pt-1 text-[9px]">
                          {notif.orderReference ? (
                            <span className="font-mono text-indigo-600 font-bold bg-white/80 px-1.5 py-0.5 rounded border border-indigo-100">
                              Ref: {notif.orderReference}
                            </span>
                          ) : (
                            <span className="text-slate-400">{notif.recipient}</span>
                          )}

                          {(notif.orderReference || notif.orderId) && (
                            <span className="font-bold text-emerald-700 hover:underline flex items-center gap-0.5">
                              <span>Ver pedido</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <button
                onClick={() => {
                  setShowNotifications(false);
                  setAdminTab('notifications');
                }}
                className="w-full text-center text-xs font-bold text-indigo-600 hover:text-indigo-800 py-2 border-t border-slate-100 block transition-colors cursor-pointer"
              >
                Abrir Centro de Notificaciones & Trazabilidad →
              </button>
            </div>
          )}
        </div>

        {/* Interactive User Profile & Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
              setShowExtraMenu(false);
            }}
            className="flex items-center gap-2 pl-2 sm:pl-2.5 sm:border-l sm:border-slate-200 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              {currentAdminUser?.avatarInitials || 'CM'}
            </div>
            <div className="hidden sm:block text-left text-xs leading-tight">
              <span className="font-extrabold text-slate-900 block truncate max-w-[120px]">
                {currentAdminUser?.name || 'Carlos Mendoza'}
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider block truncate max-w-[120px]">
                {currentAdminUser?.roleTitle || 'Super Admin'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* User Profile Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-200 p-3.5 z-50 space-y-3 animate-fade-in text-left">
              {/* Header Info */}
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                    Operador Actual
                  </span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                    Activo
                  </span>
                </div>
                <p className="text-xs font-extrabold text-slate-900">
                  {currentAdminUser?.name}
                </p>
                <p className="text-[10px] text-slate-500 font-mono truncate">
                  {currentAdminUser?.email}
                </p>
              </div>

              {/* Fast Switch User */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 block">
                  Cambiar de Rol / Operador
                </span>
                {adminUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchAdminUser(u.id);
                      setShowUserMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      currentAdminUser?.id === u.id
                        ? 'bg-indigo-50 text-indigo-900 font-bold'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center">
                        {u.avatarInitials}
                      </div>
                      <span className="truncate">{u.name}</span>
                    </div>
                    {currentAdminUser?.id === u.id && (
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                  </button>
                ))}
              </div>

              {/* Logout Action */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    adminLogout();
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión Segura</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Public Store Link Modal */}
      <ShareStoreModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </header>
  );
};

