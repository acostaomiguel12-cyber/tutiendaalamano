import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Globe,
  Smartphone,
  Sparkles,
  Send,
  MessageCircle,
  Instagram,
  CheckCircle2,
  ShieldCheck,
  Tag,
  KeyRound,
  ArrowRight,
  Truck,
  Package,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareStoreModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { showToast, setActiveView, orders } = useStore();
  const [copied, setCopied] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<'preview' | 'custom'>('preview');
  const [linkPreset, setLinkPreset] = useState<'direct' | 'tracking' | 'welcome-coupon' | 'vip-drop'>('direct');
  const [selectedOrderRef, setSelectedOrderRef] = useState<string>('');
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const previewBase = window.location.origin + window.location.pathname;
  const customBase = 'https://tutiendaalamano.co';

  const baseDomain = selectedDomain === 'custom' ? customBase : previewBase;

  // Determine query parameters or hash based on preset
  let activeUrl = `${baseDomain}#store`;
  if (linkPreset === 'direct') {
    activeUrl = `${baseDomain}#store`;
  } else if (linkPreset === 'tracking') {
    activeUrl = selectedOrderRef ? `${baseDomain}#rastreo=${selectedOrderRef}` : `${baseDomain}#rastreo`;
  } else if (linkPreset === 'welcome-coupon') {
    activeUrl = `${baseDomain}?coupon=MANO10#store`;
  } else if (linkPreset === 'vip-drop') {
    activeUrl = `${baseDomain}?coupon=BLACKVIP#store`;
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    showToast('✅ ¡Enlace de acceso a la tienda copiado con éxito!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    let text = '';
    if (linkPreset === 'tracking') {
      text = selectedOrderRef
        ? `📦 ¡Hola! Puedes rastrear el estado y guía de tu pedido #${selectedOrderRef} en tiempo real aquí:\n\n👉 ${activeUrl}`
        : `📦 ¡Hola! Puedes consultar el estado de tu pedido y guía de Coordinadora/Servientrega ingresando tu número de orden o celular aquí:\n\n👉 ${activeUrl}`;
    } else {
      let bonusText = '';
      if (linkPreset === 'welcome-coupon') {
        bonusText = ' ¡Incluye 10% de descuento de bienvenida aplicado!';
      } else if (linkPreset === 'vip-drop') {
        bonusText = ' ¡Incluye cupón VIP del 15% OFF en esta colección!';
      }
      text = `🛍️ ¡Hola! Te comparto Tu Tienda a la Mano:${bonusText}\n\n👉 ${activeUrl}\n\nEnvíos a toda Colombia y pagos 100% seguros con Wompi.`;
    }

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShareInstagram = () => {
    navigator.clipboard.writeText(activeUrl);
    showToast('📸 Enlace copiado al portapapeles. Pégalo en tu biografía o historias de Instagram.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-left flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-white shadow-inner">
              <Share2 className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-indigo-300 uppercase block font-bold">
                PANEL DE SUPER ADMIN // CONTROL DE ACCESO
              </span>
              <h3 className="text-base font-black tracking-tight uppercase">
                Compartir Enlace de la Tienda
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Informative Architecture Banner */}
          <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/90 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 leading-relaxed">
              <p className="font-bold">100% Aislado y Seguro para Clientes</p>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                Cualquier persona que abra estos enlaces verá únicamente la tienda de moda limpia, con el catálogo de prendas, carrito de compras y pasarela de pago Wompi. <strong>No verá ningún botón de admin, ni menús internos, ni accesos administrativos</strong>.
              </p>
            </div>
          </div>

          {/* Preset Selector Pills */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase text-slate-500 font-mono block">
              Tipo de Enlace a Compartir:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setLinkPreset('direct')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  linkPreset === 'direct'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-bold">Tienda</span>
                </div>
                <p className={`text-[10px] mt-0.5 ${linkPreset === 'direct' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Directo al cliente
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLinkPreset('tracking')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  linkPreset === 'tracking'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-bold">Rastreo</span>
                </div>
                <p className={`text-[10px] mt-0.5 ${linkPreset === 'tracking' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Ver pedidos en vivo
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLinkPreset('welcome-coupon')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  linkPreset === 'welcome-coupon'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-bold">Cupón 10%</span>
                </div>
                <p className={`text-[10px] mt-0.5 ${linkPreset === 'welcome-coupon' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Bienvenida
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLinkPreset('vip-drop')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  linkPreset === 'vip-drop'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold">VIP 15%</span>
                </div>
                <p className={`text-[10px] mt-0.5 ${linkPreset === 'vip-drop' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Drop exclusivo
                </p>
              </button>
            </div>

            {/* If tracking is selected, allow picking an order */}
            {linkPreset === 'tracking' && (
              <div className="mt-2 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 animate-in fade-in duration-200">
                <label className="text-[11px] font-bold text-emerald-950 block mb-1">
                  ¿Quieres vincular una orden específica? (Opcional):
                </label>
                <select
                  value={selectedOrderRef}
                  onChange={(e) => setSelectedOrderRef(e.target.value)}
                  className="w-full text-xs font-mono p-2 rounded-lg bg-white border border-emerald-300 text-zinc-800 focus:outline-hidden"
                >
                  <option value="">Rastreo general (el cliente escribe su orden)</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.reference}>
                      #{o.reference} — {o.customer.fullName} ({o.status})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Main URL Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-slate-700 font-mono flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                Enlace Generado
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Acceso Habilitado
              </span>
            </div>

            {/* URL Display Box */}
            <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-300 shadow-inner">
              <Globe className="w-4 h-4 text-indigo-600 shrink-0 ml-1" />
              <input
                type="text"
                readOnly
                value={activeUrl}
                className="w-full bg-transparent text-xs font-mono font-bold text-slate-900 focus:outline-hidden select-all"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>

            {/* Domain Switcher */}
            <div className="flex gap-2 text-[11px] font-mono">
              <button
                onClick={() => setSelectedDomain('preview')}
                className={`flex-1 py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer font-bold ${
                  selectedDomain === 'preview'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Enlace Actual de la Aplicación
              </button>
              <button
                onClick={() => setSelectedDomain('custom')}
                className={`flex-1 py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer font-bold ${
                  selectedDomain === 'custom'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Dominio Oficial (opusindustri.com)
              </button>
            </div>
          </div>

          {/* Quick Action Channels */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase text-slate-500 font-mono block">
              Canales para Compartir:
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {/* WhatsApp Share */}
              <button
                onClick={handleShareWhatsApp}
                className="p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl flex items-center gap-3 text-left transition-colors cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-950">Compartir en WhatsApp</p>
                  <p className="text-[10px] text-emerald-700 truncate">Mensaje listo para enviar</p>
                </div>
              </button>

              {/* Instagram Share */}
              <button
                onClick={handleShareInstagram}
                className="p-3 bg-pink-50 hover:bg-pink-100/80 border border-pink-200 rounded-2xl flex items-center gap-3 text-left transition-colors cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Instagram className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-pink-950">Instagram Bio / Historias</p>
                  <p className="text-[10px] text-pink-700 truncate">Copiar para redes</p>
                </div>
              </button>
            </div>
          </div>

          {/* QR Code Section Toggle */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900">Código QR para Escaneo Móvil</span>
              </div>
              <button
                onClick={() => setShowQR(!showQR)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                {showQR ? 'Ocultar QR' : 'Mostrar QR'}
              </button>
            </div>

            {showQR && (
              <div className="pt-2 flex flex-col items-center justify-center space-y-2 animate-fade-in">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-md">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      activeUrl
                    )}&margin=1`}
                    alt="QR Code Tu Tienda a la Mano"
                    className="w-40 h-40 object-contain rounded-lg"
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  Escanea desde cualquier teléfono para abrir la tienda sin ingresar contraseñas.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              sessionStorage.setItem('opus_store_link_granted', 'true');
              onClose();
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            <span>Ver Tienda Como Cliente</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
