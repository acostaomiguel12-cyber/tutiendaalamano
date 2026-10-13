import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { StorefrontHomeMain } from '../../storefront/StorefrontHomeMain';
import { MobileCategoryBar } from '../../mobile/MobileCategoryBar';
import { CartDrawer } from '../../storefront/CartDrawer';
import { ProductQuickViewModal } from '../../storefront/ProductQuickViewModal';
import { Footer } from '../../storefront/Footer';
import { DEFAULT_NAV_LINKS } from '../../../data/themes';
import { scrollToCatalog } from '../../../lib/storeNavigation';

/**
 * Simulador del personalizador: renderiza los MISMOS componentes de producción
 * (StorefrontHomeMain + Footer real) para que lo que se ve aquí sea idéntico
 * a la tienda. Cada cambio del panel (desactivar, editar, eliminar, colores,
 * banner) se refleja en tiempo real porque lee el mismo StoreContext.
 * Solo el encabezado es una maqueta liviana: el Header real es fijo al
 * viewport y rompería el marco de vista previa.
 */
export const SimulatorPreview: React.FC = () => {
  const { themeConfig, storePreferences, pageLayout, cartCount, setActiveCategoryFilter, setIsCartOpen } = useStore();
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Enlaces reales del navbar (igual que producción): lo que se edite en el
  // personalizador se refleja aquí en vivo.
  const simNavLinks = (themeConfig.navCategoryLinks && themeConfig.navCategoryLinks.length > 0
    ? themeConfig.navCategoryLinks
    : DEFAULT_NAV_LINKS
  ).filter((l) => l.enabled !== false);

  // La mini-barra filtra igual que el navbar real y baja al catálogo del marco.
  // No cambia activeView: el admin sigue en el panel, solo se filtra el preview.
  const handleSimNavClick = (filter: string | null) => {
    setActiveCategoryFilter(filter);
    setTimeout(() => {
      const frame = document.getElementById('simulator-preview-frame');
      const target =
        frame?.querySelector('[id^="product-catalog"], [id^="catalog-browser"]') || null;
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        scrollToCatalog(true);
      }
    }, 80);
  };

  return (
    <div className="space-y-3">
      {/* Viewport Control Bar */}
      <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
            VISTA PREVIA EN VIVO
          </span>
          <span className="hidden sm:inline font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {pageLayout.enabledInStorefront ? 'MODO BLOQUES' : 'MODO ESTÁNDAR'}
          </span>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setDevicePreview('desktop')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              devicePreview === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Pantalla de Escritorio (100%)"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDevicePreview('tablet')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              devicePreview === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Tablet (720px)"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDevicePreview('mobile')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              devicePreview === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Móvil (360px)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simulated Canvas Frame */}
      <div className="bg-slate-200/90 p-2 sm:p-5 rounded-2xl border border-slate-300 flex justify-center overflow-x-auto min-h-[640px]">
        <div
          id="simulator-preview-frame"
          className={`transition-all duration-300 shadow-2xl overflow-hidden rounded-xl border border-slate-300 flex flex-col bg-white ${
            devicePreview === 'desktop'
              ? 'w-full max-w-full'
              : devicePreview === 'tablet'
              ? 'w-[720px]'
              : 'w-[360px]'
          }`}
          style={{
            backgroundColor: themeConfig.backgroundColor,
            color: themeConfig.textColor,
          }}
        >
          {/* 1. Announcement Bar (maqueta liviana del Header real) */}
          {themeConfig.showAnnouncementBar && (
            <div
              className="py-1.5 px-3 text-center text-[10px] font-mono font-bold uppercase tracking-wider truncate"
              style={{
                backgroundColor: themeConfig.mode === 'dark' ? '#18181b' : '#000000',
                color: '#ffffff',
              }}
            >
              {themeConfig.announcementText || 'ENVÍOS GRATIS A COLOMBIA POR COMPRAS SUPERIORES A $250.000 COP'}
            </div>
          )}

          {/* 2. Mini Header (maqueta: el Header real es fijo al viewport) */}
          <div
            className="px-4 py-3 border-b flex items-center justify-between"
            style={{
              borderColor: themeConfig.borderColor || '#e4e4e7',
              backgroundColor: themeConfig.backgroundColor,
            }}
          >
            <div className="flex items-center gap-3">
              {themeConfig.logoUrl && themeConfig.logoUrl.trim() ? (
                <img
                  src={themeConfig.logoUrl}
                  alt="Logo"
                  style={{ height: `${themeConfig.logoHeight || 36}px` }}
                  className="object-contain max-w-[180px]"
                />
              ) : null}

              {(themeConfig.showBrandNameWithLogo !== false || !themeConfig.logoUrl) && (
                <span className="font-black tracking-widest text-xs uppercase font-sans">
                  {storePreferences.storeBrandName || 'TU TIENDA A LA MANO'}
                </span>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider opacity-75">
              {simNavLinks.slice(0, 4).map((l, idx) => (
                <button
                  key={l.id || `${l.name || 'link'}-${l.filter || 'all'}-${idx}`}
                  type="button"
                  onClick={() => handleSimNavClick(l.filter ?? null)}
                  className="hover:opacity-100 hover:underline underline-offset-4 cursor-pointer uppercase tracking-wider"
                  title={l.filter ? `Filtrar por ${l.name}` : 'Ver todo el catálogo'}
                >
                  {l.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="font-mono text-[10px] px-2 py-1 bg-black text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Abrir bolsa"
              >
                BOLSA ({cartCount})
              </button>
            </div>
          </div>

          {/* Barra de categorías móvil (componente real, igual que en producción) */}
          <MobileCategoryBar />

          {/* 3. Contenido real de producción: idéntico a la tienda.
              Respeta modo bloques/estándar, toggles de secciones,
              textos editados o eliminados, y los 4 estilos del hero. */}
          <StorefrontHomeMain />

          {/* 4. Footer real con newsletter */}
          <Footer />
        </div>
      </div>

      {/* Modales de tienda para que los clics en prendas y bolsa respondan igual que en producción */}
      <CartDrawer />
      <ProductQuickViewModal />
    </div>
  );
};
