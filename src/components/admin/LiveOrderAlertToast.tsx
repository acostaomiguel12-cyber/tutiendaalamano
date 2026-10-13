import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import {
  Bell,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Package,
  Volume2,
  X,
  CreditCard,
  Building2,
  Smartphone,
  Sparkles,
} from 'lucide-react';

export const LiveOrderAlertToast: React.FC = () => {
  const {
    latestLiveAlertOrder,
    dismissLiveAlert,
    setSelectedOrderForDetail,
    setAdminTab,
    testAudioSound,
  } = useStore();

  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!latestLiveAlertOrder) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const duration = 12000; // 12 seconds auto-dismiss
    const intervalTime = 100;
    const decrement = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev <= decrement) {
            clearInterval(timer);
            dismissLiveAlert();
            return 0;
          }
          return prev - decrement;
        });
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [latestLiveAlertOrder, isPaused, dismissLiveAlert]);

  if (!latestLiveAlertOrder) return null;

  const order = latestLiveAlertOrder;
  const paymentMethod = order.wompiTransaction?.paymentMethod || 'PSE';
  const firstItem = order.items?.[0];

  const handleViewOrder = () => {
    setSelectedOrderForDetail(order);
    setAdminTab('orders');
    dismissLiveAlert();
  };

  return (
    <div
      id="live-order-alert-toast"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-md w-full sm:w-96 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-emerald-500/30 overflow-hidden animate-bounce-short transition-all"
    >
      {/* Top Accent bar with live indicator */}
      <div className="bg-gradient-to-r from-emerald-500 via-indigo-500 to-emerald-400 h-1.5 w-full relative">
        <div
          className="h-full bg-slate-900/40 transition-all duration-100 ease-linear"
          style={{ width: `${100 - progress}%`, float: 'right' }}
        />
      </div>

      <div className="p-4 sm:p-4.5 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1">
              <span>¡NUEVA VENTA EN VIVO!</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300 font-normal">Wompi Gateway</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={testAudioSound}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Reproducir sonido de alerta"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={dismissLiveAlert}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Order Details & Value */}
        <div className="flex items-start justify-between gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-black text-white">{order.reference}</span>
              <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                APROBADO
              </span>
            </div>
            <p className="text-xs font-bold text-slate-200 line-clamp-1">{order.customer.fullName}</p>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="line-clamp-1">{order.customer.city}, {order.customer.department}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Recibido</span>
            <span className="text-base font-black text-emerald-400 tracking-tight font-mono">
              ${formatCOP(order.totalAmountInCents)}
            </span>
            <span className="text-[9px] text-slate-400 font-mono block">COP</span>
          </div>
        </div>

        {/* Product preview & Payment Method */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            {firstItem?.image ? (
              <img
                src={firstItem.image}
                alt={firstItem.productTitle}
                className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-slate-400" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-300 truncate">
                {firstItem?.productTitle || 'Prenda Drop Exclusivo'}
              </p>
              <p className="text-[10px] text-slate-400">
                {order.items.length} {order.items.length === 1 ? 'artículo' : 'artículos'} • Talla {firstItem?.selectedSize || 'Standard'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-200">
            {paymentMethod === 'CARD' ? (
              <CreditCard className="w-3 h-3 text-indigo-400" />
            ) : paymentMethod === 'PSE' ? (
              <Building2 className="w-3 h-3 text-blue-400" />
            ) : (
              <Smartphone className="w-3 h-3 text-purple-400" />
            )}
            <span>{paymentMethod}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleViewOrder}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 font-black text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/30 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ver Pedido en Despachos</span>
          </button>
          <button
            onClick={dismissLiveAlert}
            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            Descartar
          </button>
        </div>
      </div>
    </div>
  );
};
