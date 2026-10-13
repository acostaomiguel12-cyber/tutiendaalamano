import React, { useEffect, useState } from 'react';
import { X, TicketPercent, Copy, Check, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { scrollToCatalog } from '../../lib/storeNavigation';

const WELCOME_SEEN_KEY = 'opus_welcome_seen_v1';
const WELCOME_COUPON = 'MANO10';

/**
 * Popup de bienvenida (una vez por navegador): regala el cupón de bienvenida
 * y lleva directo al catálogo. Pieza clave de conversión primera visita.
 */
export const WelcomePopup: React.FC = () => {
  const { activeView, applyCouponByCode, showToast, themeConfig } = useStore();
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (activeView !== 'home') return;
    let seen = false;
    try {
      seen = localStorage.getItem(WELCOME_SEEN_KEY) === '1';
    } catch {
      seen = true;
    }
    if (seen) return;
    const t = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(t);
  }, [activeView]);

  const dismiss = () => {
    try {
      localStorage.setItem(WELCOME_SEEN_KEY, '1');
    } catch {
      // ignore
    }
    setVisible(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(WELCOME_COUPON);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast(`Tu código: ${WELCOME_COUPON}`);
    }
  };

  const handleApply = () => {
    const result = applyCouponByCode(WELCOME_COUPON);
    showToast(result.message);
    dismiss();
    setTimeout(() => scrollToCatalog(true), 150);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={dismiss} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors cursor-pointer"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          className="px-6 pt-8 pb-6 text-center text-white"
          style={{ background: `linear-gradient(135deg, ${themeConfig.primaryColor}, ${themeConfig.primaryHover})` }}
        >
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
            <TicketPercent className="w-7 h-7" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
            Bienvenido a tu tienda
          </p>
          <h3 className="text-3xl font-black tracking-tight mt-1">10% OFF</h3>
          <p className="text-xs text-white/85 mt-1">en tu primera compra con este código</p>
        </div>

        <div className="p-6 space-y-4">
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-green-300 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
            title="Copiar código"
          >
            <span className="text-lg font-black font-mono tracking-[0.2em] text-green-700">
              {WELCOME_COUPON}
            </span>
            {copied ? (
              <span className="flex items-center gap-1 text-xs font-bold text-green-700">
                <Check className="w-4 h-4" /> ¡Copiado!
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                <Copy className="w-4 h-4" /> Copiar
              </span>
            )}
          </button>

          <button
            onClick={handleApply}
            className="w-full py-3 rounded-2xl text-sm font-black uppercase tracking-wider text-white transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            style={{ backgroundColor: themeConfig.primaryColor }}
          >
            Aplicar y ver catálogo <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={dismiss}
            className="w-full text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          >
            Ahora no, quiero explorar
          </button>
        </div>
      </div>
    </div>
  );
};
