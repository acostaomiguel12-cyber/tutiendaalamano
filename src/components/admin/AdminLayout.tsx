import React, { useEffect } from 'react';
import { AdminTab, useStore } from '../../context/StoreContext';
import { AdminLogin } from './AdminLogin';
import { CommandPalette } from './CommandPalette';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { DashboardOverview } from './DashboardOverview';
import { OrdersManager } from './OrdersManager';
import { CatalogManager } from './CatalogManager';
import { CustomersManager } from './CustomersManager';
import { WompiReconciliation } from './WompiReconciliation';
import { ReportsManager } from './ReportsManager';
import { NotificationsView } from './NotificationsView';
import { WompiSettings } from './WompiSettings';
import { CouponsManager } from './CouponsManager';
import { ShippingManager } from './ShippingManager';
import { ReviewsManager } from './ReviewsManager';
import { AbandonedCheckoutsManager } from './AbandonedCheckoutsManager';
import { ThemeBuilder } from './ThemeBuilder';
import { MusicPlayerSettings } from './MusicPlayerSettings';
import { WhatsAppBusinessManager } from './WhatsAppBusinessManager';
import { StorePreviewView } from './StorePreviewView';
import { SystemTestingView } from './SystemTestingView';
import { LiveOrderAlertToast } from './LiveOrderAlertToast';
import { OrderDetailModal } from './OrderDetailModal';
import { PrintableInvoiceModal } from './PrintableInvoiceModal';
import { HeroImageEditorModal } from './HeroImageEditorModal';
import { ProductionLaunchCenter } from './ProductionLaunchCenter';
import { DomainTrustManager } from './DomainTrustManager';
import { DatabaseSyncManager } from './DatabaseSyncManager';
import { AdminHelpCenter } from './AdminHelpCenter';
import { EmployeesManager } from './EmployeesManager';
import { AdminQuickHelpDrawer } from './AdminQuickHelpDrawer';
import { SystemVideoTutorialModal } from './SystemVideoTutorialModal';
import { AdminMobileNav } from '../mobile/AdminMobileNav';
import { HelpCircle, Sparkles, Play, Video } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const {
    adminTab,
    setAdminTab,
    hasModulePermission,
    isAdminAuthenticated,
    adminSidebarMobileOpen,
    setAdminSidebarMobileOpen,
    openAdminHelp,
    openSystemVideoTutorial,
    toastMessage,
  } = useStore();

  // Guard: require authentication before seeing dashboard
  if (!isAdminAuthenticated) {
    return <AdminLogin />;
  }

  return <AdminLayoutGuarded />;
};

const TAB_FALLBACK_ORDER: AdminTab[] = [
  'dashboard',
  'orders',
  'catalog',
  'help-center',
  'store-preview',
];

/** Contenido con permiso por módulo: redirige y bloquea lo no autorizado. */
const AdminLayoutGuarded: React.FC = () => {
  const {
    adminTab,
    setAdminTab,
    hasModulePermission,
    adminSidebarMobileOpen,
    setAdminSidebarMobileOpen,
    openAdminHelp,
    openSystemVideoTutorial,
    toastMessage,
  } = useStore();

  const tabAllowed = hasModulePermission(adminTab);

  useEffect(() => {
    if (!tabAllowed) {
      const next = TAB_FALLBACK_ORDER.find((t) => hasModulePermission(t));
      if (next) setAdminTab(next);
    }
  }, [tabAllowed, adminTab]);

  return (
    <div className="flex min-h-screen bg-[#f8f9fc] relative">
      {/* Command Palette (⌘K) */}
      <CommandPalette />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0 z-30 transition-all duration-300">
        <AdminSidebar />
      </aside>

      {/* Mobile Drawer Sidebar */}
      {adminSidebarMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setAdminSidebarMobileOpen(false)}
          />
          <div className="relative z-10 w-80 max-w-[88vw] h-full bg-white shadow-2xl flex flex-col overflow-hidden">
            <AdminSidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-[#f8f9fc] pb-20 lg:pb-0">
          {!tabAllowed ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-2xl">
                🔒
              </div>
              <h2 className="text-base font-black uppercase tracking-tight text-slate-900">
                Módulo restringido
              </h2>
              <p className="text-xs text-slate-500 max-w-xs">
                Tu usuario no tiene acceso a esta sección. Pídele permiso al Super Administrador.
              </p>
            </div>
          ) : (
          <>
          {adminTab === 'dashboard' && <DashboardOverview />}
          {adminTab === 'production-launch' && <ProductionLaunchCenter />}
          {adminTab === 'database-sync' && <DatabaseSyncManager />}
          {adminTab === 'domain-trust' && <DomainTrustManager />}
          {adminTab === 'help-center' && <AdminHelpCenter />}
          {adminTab === 'orders' && <OrdersManager />}
          {adminTab === 'abandoned-checkouts' && <AbandonedCheckoutsManager />}
          {adminTab === 'catalog' && <CatalogManager />}
          {adminTab === 'shipping' && <ShippingManager />}
          {adminTab === 'customers' && <CustomersManager />}
          {adminTab === 'coupons' && <CouponsManager />}
          {adminTab === 'reviews' && <ReviewsManager />}
          {adminTab === 'wompi-reconciliation' && <WompiReconciliation />}
          {adminTab === 'reports' && <ReportsManager />}
          {adminTab === 'notifications' && <NotificationsView />}
          {adminTab === 'whatsapp-business' && <WhatsAppBusinessManager />}
          {adminTab === 'settings' && <WompiSettings />}
          {adminTab === 'theme-builder' && <ThemeBuilder />}
          {adminTab === 'music-player' && <MusicPlayerSettings />}
          {adminTab === 'system-testing' && <SystemTestingView />}
          {adminTab === 'employees' && <EmployeesManager />}
          {adminTab === 'store-preview' && <StorePreviewView />}
          </>
          )}
        </main>

        {/* Mobile Admin Bottom App Bar */}
        <AdminMobileNav />
      </div>

      {/* Floating Live Order Notification Alert */}
      <LiveOrderAlertToast />

      {/* Toast de confirmaciones del sistema (solo lectura, mismo mensaje que la tienda) */}
      {toastMessage && (
        <div className="fixed bottom-24 right-4 z-50 bg-slate-950/95 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 text-xs font-semibold flex items-center gap-2.5 animate-bounce-short backdrop-blur-md max-w-sm">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Order Detail Modal */}
      <OrderDetailModal />

      {/* Printable Invoice & Packing Slip Modal */}
      <PrintableInvoiceModal />

      {/* HeroBanner Visual Image Positioning & Sizing Editor */}
      <HeroImageEditorModal />

      {/* Contextual Quick Help Drawer */}
      <AdminQuickHelpDrawer />

      {/* Global Interactive Video Tutorial & Screencast Modal */}
      <SystemVideoTutorialModal />

      {/* Persistent Floating Quick Action Buttons (Videos & Help) */}
      <div className="fixed bottom-20 lg:bottom-6 right-6 z-40 flex items-center gap-2">
        {/* Video Tutorials Button */}
        <button
          onClick={() => openSystemVideoTutorial()}
          className="bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-full shadow-xl shadow-rose-900/30 border border-rose-400/40 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
          title="Ver Videos Demostrativos y Capturas Reales del Sistema"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <Play className="w-3 h-3 fill-white translate-x-0.5" />
          </div>
          <span className="hidden sm:inline font-sans">Videos del Sistema</span>
          <span className="text-[10px] font-mono bg-rose-500/80 px-1.5 py-0.2 rounded font-black uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />
            1080P
          </span>
        </button>

        {/* Section Guide Button */}
        <button
          onClick={() => openAdminHelp()}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-full shadow-lg shadow-amber-500/25 border border-amber-300/40 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
          title="Abrir Guía y Manual de esta Sección"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <HelpCircle className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="hidden md:inline font-sans">Guía</span>
          <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.2 rounded font-black uppercase">
            AYUDA
          </span>
        </button>
      </div>
    </div>
  );
};


