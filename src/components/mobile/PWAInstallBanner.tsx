import React, { useState } from 'react';
import { Download, Smartphone, X, Sparkles, Share2, PlusSquare, Check } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  variant?: 'floating' | 'inline';
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ variant = 'floating' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  // If on iOS or supported browser, show the responsive mobile app installation card
  const handleInstallClick = () => {
    if (isInstallable) {
      install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <div
        className={`w-full max-w-lg mx-auto bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950 text-white rounded-2xl p-3.5 shadow-xl border border-zinc-800/80 transition-all ${
          variant === 'floating'
            ? 'mb-4 animate-fade-in'
            : 'my-2'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shrink-0 shadow-md ring-2 ring-white/10">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wider uppercase font-sans">
                  TU TIENDA A LA MANO APP
                </span>
                <span className="text-[9px] font-mono font-bold bg-indigo-500/30 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-400/30">
                  PWA MÓVIL
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 font-mono truncate">
                Instalar app en tu celular (rápida y sin descargas pesadas)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-white hover:bg-zinc-100 text-black px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Cerrar banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Guided Install Sheet */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-zinc-950 text-white rounded-3xl p-6 shadow-2xl border border-zinc-800 space-y-5 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg font-black text-lg">
                  OC
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight font-sans">
                    Instalar en iPhone / iPad
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-400">
                    Acceso directo como app nativa
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs text-zinc-300">
              <div className="flex items-start gap-3 p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
                <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <p className="text-[11px] leading-relaxed">
                  Toca el botón <strong className="text-white flex items-center gap-1 inline-flex">Compartir <Share2 className="w-3.5 h-3.5 text-indigo-400 inline" /></strong> en la barra inferior de Safari.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
                <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <p className="text-[11px] leading-relaxed">
                  Desplaza hacia abajo y selecciona <strong className="text-white flex items-center gap-1 inline-flex">Agregar a pantalla de inicio <PlusSquare className="w-3.5 h-3.5 text-indigo-400 inline" /></strong>.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
                <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <p className="text-[11px] leading-relaxed">
                  Toca <strong className="text-white">Agregar</strong> en la esquina superior derecha y listo.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-3 bg-white text-black font-black uppercase text-xs rounded-xl tracking-wider hover:bg-zinc-200 transition-colors"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
