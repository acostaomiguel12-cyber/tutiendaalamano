import React, { useState } from 'react';
import {
  Store,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Sparkles,
  Palette,
  Package,
  ShieldCheck,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Header } from '../storefront/Header';
import { MobileCategoryBar } from '../mobile/MobileCategoryBar';
import { StorefrontHomeMain } from '../storefront/StorefrontHomeMain';
import { CartDrawer } from '../storefront/CartDrawer';
import { ProductQuickViewModal } from '../storefront/ProductQuickViewModal';
import { Footer } from '../storefront/Footer';

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export const StorePreviewView: React.FC = () => {
  const {
    setActiveView,
    setAdminTab,
    themeConfig,
    showToast,
  } = useStore();

  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    showToast('🔄 Vista previa actualizada.');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">
      {/* Top Interactive Toolbar for Admin */}
      <div className="sticky top-0 z-30 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Left: Info & Status */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-white">
                Vista Previa de la Tienda En Vivo
              </h2>
              <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Tema Activo: <strong className="text-slate-200">{themeConfig.name}</strong> • Modo: {themeConfig.mode} • <span className="text-emerald-400">Sincronizado en vivo</span>
            </p>
          </div>
        </div>

        {/* Center: Device Viewport Switcher */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewport === 'desktop'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Vista Escritorio (100%)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setViewport('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewport === 'tablet'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Vista Tablet (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>

          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewport === 'mobile'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Vista Móvil (390px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Móvil</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Refresh preview button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Recargar Vista Previa"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Quick links to customize */}
          <button
            type="button"
            onClick={() => setAdminTab('theme-builder')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5 text-pink-400" />
            <span>Editar Tema</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('catalog')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Package className="w-3.5 h-3.5 text-indigo-400" />
            <span>Productos</span>
          </button>

          {/* Open Full Storefront */}
          <button
            type="button"
            onClick={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
            title="Navegar la tienda a pantalla completa como cliente"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver Tienda Completa</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Preview Stage */}
      <div className="flex-1 p-3 sm:p-6 flex items-start justify-center overflow-x-auto">
        <div
          key={refreshKey}
          className={`transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden bg-white text-slate-900 ${
            viewport === 'desktop'
              ? 'w-full max-w-7xl'
              : viewport === 'tablet'
              ? 'w-[768px] border-8 border-slate-800 rounded-[32px] my-4 shadow-slate-950/80'
              : 'w-[390px] border-8 border-slate-800 rounded-[40px] my-4 shadow-slate-950/80'
          }`}
        >
          {/* Simulated Device Top Notch for Mobile */}
          {viewport === 'mobile' && (
            <div className="bg-slate-800 py-1.5 px-4 flex items-center justify-between text-slate-400 text-[10px] font-mono">
              <span>9:41</span>
              <div className="w-20 h-3.5 bg-slate-950 rounded-full" />
              <span>5G 100%</span>
            </div>
          )}

          {/* Rendered Live Storefront: mismo contenido que producción (StorefrontHomeMain) */}
          <div className="min-h-screen flex flex-col bg-white">
            <Header />
            <MobileCategoryBar />

            <main className="flex-1">
              <StorefrontHomeMain />
            </main>

            <Footer />
          </div>

          {/* Modales de tienda para que los clics en prendas y bolsa respondan igual que en producción */}
          <CartDrawer />
          <ProductQuickViewModal />
        </div>
      </div>
    </div>
  );
};
