import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Zap,
  Mail,
  MessageSquare,
  ShieldCheck,
  Filter,
  Volume2,
  CheckCheck,
  Search,
  ExternalLink,
  ShoppingBag,
  AlertTriangle,
  Send,
  Eye,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    testAudioSound,
    orders,
    setSelectedOrderForDetail,
    setAdminTab,
    showToast,
  } = useStore();

  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD' | 'ORDERS' | 'WHATSAPP' | 'EMAIL' | 'SYSTEM'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const orderAlertsCount = useMemo(
    () => notifications.filter((n) => n.type === 'NEW_ORDER_ALERT' || n.type === 'PAYMENT_CONFIRMATION').length,
    [notifications]
  );
  const whatsappCount = useMemo(
    () => notifications.filter((n) => n.channel === 'WHATSAPP' || n.type === 'WHATSAPP').length,
    [notifications]
  );

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      // Status/Type filter
      if (filterType === 'UNREAD' && n.read) return false;
      if (filterType === 'ORDERS' && n.type !== 'NEW_ORDER_ALERT' && n.type !== 'PAYMENT_CONFIRMATION') return false;
      if (filterType === 'WHATSAPP' && n.channel !== 'WHATSAPP' && n.type !== 'WHATSAPP') return false;
      if (filterType === 'EMAIL' && n.channel !== 'EMAIL' && n.type !== 'EMAIL') return false;
      if (filterType === 'SYSTEM' && n.channel !== 'SYSTEM' && n.type !== 'SYSTEM' && n.type !== 'NEW_ORDER_ALERT') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSubject = n.subject.toLowerCase().includes(q);
        const matchesPreview = n.previewText.toLowerCase().includes(q);
        const matchesRecipient = n.recipient.toLowerCase().includes(q);
        const matchesRef = n.orderReference?.toLowerCase().includes(q) || false;
        const matchesCustomer = n.customerName?.toLowerCase().includes(q) || false;
        if (!matchesSubject && !matchesPreview && !matchesRecipient && !matchesRef && !matchesCustomer) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, filterType, searchQuery]);

  const handleOpenOrder = (notif: typeof notifications[0]) => {
    markNotificationAsRead(notif.id);
    if (notif.orderId || notif.orderReference) {
      const target = orders.find(
        (o) =>
          o.id === notif.orderId ||
          o.reference === notif.orderReference ||
          (notif.orderReference && o.reference.includes(notif.orderReference.replace('#', '')))
      );
      if (target) {
        setSelectedOrderForDetail(target);
        setAdminTab('orders');
        showToast(`Abriendo detalle de pedido ${target.reference}`);
        return;
      }
    }
    showToast('Pedido no encontrado en los registros activos.');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-[#f8f9fc] min-h-screen">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1">
            TRAZABILIDAD EN TIEMPO REAL & AUDITORÍA DE EVENTOS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Centro de Notificaciones y Webhooks Wompi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Recepción instantánea de pedidos, confirmaciones de pago por pasarela y envíos a compradores.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={testAudioSound}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            title="Probar sonido de notificación de orden"
          >
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <span>Probar Sonido</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-emerald-700 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Marcar todas como leídas"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Marcar Leídas ({unreadCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Total Eventos
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {notifications.length}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">En historial activo</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
              Sin Leer
            </span>
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </div>
          <span className="text-xl sm:text-2xl font-black text-rose-600 font-mono">
            {unreadCount}
          </span>
          <span className="text-[11px] text-rose-500/80 block mt-0.5">Requieren atención</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
            Alertas de Venta
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
            {orderAlertsCount}
          </span>
          <span className="text-[11px] text-emerald-600/80 block mt-0.5">Wompi Gateway</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Canal WhatsApp / SMS
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {whatsappCount}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Confirmaciones cliente</span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Todos ({notifications.length})
          </button>
          <button
            onClick={() => setFilterType('UNREAD')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              filterType === 'UNREAD'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            <span>No Leídos</span>
            {unreadCount > 0 && (
              <span className="bg-white text-rose-700 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterType('ORDERS')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              filterType === 'ORDERS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Ventas Wompi
          </button>
          <button
            onClick={() => setFilterType('WHATSAPP')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              filterType === 'WHATSAPP'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            WhatsApp
          </button>
          <button
            onClick={() => setFilterType('EMAIL')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              filterType === 'EMAIL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setFilterType('SYSTEM')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              filterType === 'SYSTEM'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Sistema
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, ref..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No hay notificaciones con este filtro</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Las notificaciones transaccionales y de inventario aparecerán aquí en tiempo real cuando ocurran eventos en tu tienda.
            </p>
          </div>
        ) : (
          filtered.map((n) => {
            const isNewOrder = n.type === 'NEW_ORDER_ALERT';
            const isWhatsApp = n.channel === 'WHATSAPP' || n.type === 'WHATSAPP';
            const isEmail = n.channel === 'EMAIL' || n.type === 'EMAIL';

            return (
              <div
                key={n.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors ${
                  !n.read
                    ? isNewOrder
                      ? 'bg-emerald-50/40 hover:bg-emerald-50/70 border-l-4 border-l-emerald-500'
                      : 'bg-indigo-50/30 hover:bg-indigo-50/60 border-l-4 border-l-indigo-600'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Channel / Type Icon */}
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
                      isNewOrder
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isWhatsApp
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : isEmail
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                        : 'bg-purple-50 text-purple-600 border border-purple-200'
                    }`}
                  >
                    {isNewOrder ? (
                      <ShoppingBag className="w-5 h-5 text-emerald-700" />
                    ) : isWhatsApp ? (
                      <MessageSquare className="w-5 h-5 text-emerald-600" />
                    ) : isEmail ? (
                      <Mail className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Zap className="w-5 h-5 text-purple-600" />
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-slate-900 text-sm">{n.subject}</h4>

                      {!n.read && (
                        <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          NUEVO
                        </span>
                      )}

                      {/* Channel Badge */}
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold">
                        {isNewOrder ? 'CANAL SISTEMA (MOS)' : isWhatsApp ? 'WHATSAPP BOT' : isEmail ? 'EMAIL SMTP' : 'SISTEMA'}
                      </span>

                      {/* Order Reference Pill */}
                      {n.orderReference && (
                        <button
                          onClick={() => handleOpenOrder(n)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Hacer clic para ver este pedido"
                        >
                          <span>{n.orderReference}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}

                      {/* Amount if present */}
                      {n.amountInCents && (
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-mono font-black px-2 py-0.5 rounded-md border border-emerald-200">
                          ${formatCOP(n.amountInCents)} COP
                        </span>
                      )}
                    </div>

                    <p className="text-slate-600 text-xs leading-relaxed">{n.previewText}</p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(n.sentAt).toLocaleString('es-CO')}
                      </span>
                      <span>•</span>
                      <span>Destinatario: <strong className="text-slate-600 font-mono">{n.recipient}</strong></span>
                      {n.paymentMethod && (
                        <>
                          <span>•</span>
                          <span>Método: <strong className="text-slate-700">{n.paymentMethod}</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {(n.orderId || n.orderReference) && (
                    <button
                      onClick={() => handleOpenOrder(n)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Pedido</span>
                    </button>
                  )}

                  {!n.read ? (
                    <button
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        showToast(`Notificación marcada como leída`);
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Marcar Leído
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400 px-2 py-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Leído</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
