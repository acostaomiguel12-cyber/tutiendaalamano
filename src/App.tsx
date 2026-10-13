import React, { Suspense, lazy, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/storefront/Header';
import { StorefrontHomeMain } from './components/storefront/StorefrontHomeMain';
import { PaymentTrustBanner } from './components/storefront/PaymentTrustBanner';
import { Footer } from './components/storefront/Footer';
import { ProductDetailPage } from './components/storefront/ProductDetailPage';
import { CheckoutPage } from './components/storefront/CheckoutPage';
import { CartDrawer } from './components/storefront/CartDrawer';
import { WishlistModal } from './components/storefront/WishlistModal';
import { ProductQuickViewModal } from './components/storefront/ProductQuickViewModal';
import { SystemLoginGateway } from './components/auth/SystemLoginGateway';

// El panel admin (con recharts y todos los managers) se carga solo al entrar.
// Ahorra ~1MB del bundle inicial para los compradores.
const AdminLayout = lazy(() =>
  import('./components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);
import { StorefrontMobileNav } from './components/mobile/StorefrontMobileNav';
import { HipHopStreetBar } from './components/storefront/HipHopStreetBar';
import { CustomerReviewsStrip } from './components/storefront/CustomerReviewsStrip';
import { StorePoliciesModal } from './components/storefront/StorePoliciesModal';
import { OrderTrackingModal } from './components/storefront/OrderTrackingModal';
import { WhatsAppFloatingButton } from './components/storefront/WhatsAppFloatingButton';
import { PWAInstallBanner } from './components/mobile/PWAInstallBanner';
import { WelcomePopup } from './components/storefront/WelcomePopup';
import { CustomerProfileModal } from './components/mobile/CustomerProfileModal';

const MainAppContent: React.FC = () => {
  const {
    activeView,
    setActiveView,
    toastMessage,
    isCustomerLoggedIn,
    isAdminAuthenticated,
    themeConfig,
    isOrderTrackingOpen,
    setIsOrderTrackingOpen,
    trackingQuery,
    isCustomerProfileOpen,
    setIsCustomerProfileOpen,
  } = useStore();

  // Splash de arranque fuera una vez montada la app (si el bundle falla, queda el logo).
  useEffect(() => {
    document.getElementById('boot-splash')?.remove();
  }, []);

  // Strict Security Guard: Prevent unauthenticated users from ever accessing admin view.
  // Sin persistir: si recargó en admin con sesión válida, la validación lo devuelve.
  useEffect(() => {
    if (activeView === 'admin' && !isAdminAuthenticated) {
      setActiveView('login', false);
    }
  }, [activeView, isAdminAuthenticated, setActiveView]);

  // Listen to URL hash or query for seamless customer navigation & secure admin routing
  useEffect(() => {
    const handleHashOrQueryChange = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      // Shared link for clients / customers
      if (
        hash === '#store' ||
        hash === '#tienda' ||
        hash === '#catalogo' ||
        hash === '#home' ||
        search.includes('view=store') ||
        search.includes('store=1') ||
        search.includes('client=1') ||
        search.includes('ref=client') ||
        search.includes('ref=store') ||
        search.includes('coupon=')
      ) {
        setActiveView('home');
        return;
      }

      // Explicit Admin route: portal login for authenticated or secret admin staff only
      if (hash === '#admin' || hash === '#/admin' || search.includes('admin=1') || search.includes('admin=true')) {
        if (isAdminAuthenticated) {
          setActiveView('admin');
        } else {
          setActiveView('login');
        }
        return;
      }

      // Explicit Login route
      if (hash === '#login' || hash === '#/login' || search.includes('login=1')) {
        setActiveView('login');
        return;
      }

      // Checkout route
      if (hash === '#checkout' || search.includes('view=checkout')) {
        setActiveView('checkout');
        return;
      }

      // Order tracking route (e.g. #rastreo or #pedido)
      if (hash.startsWith('#rastreo') || hash.startsWith('#pedido') || hash.startsWith('#order') || search.includes('rastreo') || search.includes('pedido')) {
        setActiveView('home');
        setIsOrderTrackingOpen(true);
      }
    };

    handleHashOrQueryChange();
    window.addEventListener('hashchange', handleHashOrQueryChange);

    // Keyboard shortcut for verified merchant: only activates if ALREADY authenticated
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        if (isAdminAuthenticated) {
          e.preventDefault();
          setActiveView(activeView === 'admin' ? 'home' : 'admin');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleHashOrQueryChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeView, setActiveView, isCustomerLoggedIn, isAdminAuthenticated]);

  return (
    <div
      className={`min-h-screen flex flex-col font-sans antialiased pb-24 lg:pb-0 transition-colors duration-300 ${
        themeConfig.mode === 'dark'
          ? 'bg-[#08080a] text-zinc-100 selection:bg-[#ccff00] selection:text-black'
          : themeConfig.mode === 'warm'
          ? 'bg-[#faf8f5] text-stone-900 selection:bg-amber-600 selection:text-white'
          : 'bg-white text-slate-900 selection:bg-zinc-900 selection:text-white'
      }`}
      style={{
        backgroundColor: themeConfig.backgroundColor,
        color: themeConfig.textColor,
      }}
    >
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-24 sm:bottom-5 right-4 sm:right-5 z-50 bg-slate-950/95 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 text-xs font-semibold flex items-center gap-2.5 animate-bounce-short backdrop-blur-md max-w-sm">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Wishlist Modal */}
      <WishlistModal />

      {/* Product Quick View Modal */}
      <ProductQuickViewModal />

      {/* Welcome coupon popup (first visit) */}
      <WelcomePopup />

      {/* Customer profile: montado a nivel App para que ningún cambio de
          vista lo desmonte. Solo se cierra con salida explícita (X, Escape,
          botón Salir o cerrar sesión). */}
      <CustomerProfileModal
        isOpen={isCustomerProfileOpen}
        onClose={() => setIsCustomerProfileOpen(false)}
      />

      {/* View Switching */}
      {activeView === 'login' ? (
        <SystemLoginGateway />
      ) : activeView === 'admin' ? (
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-xs font-mono">
              Cargando panel administrativo…
            </div>
          }
        >
          <AdminLayout />
        </Suspense>
      ) : (
        <>
          <Header />

          <main className="flex-1">
            {activeView === 'home' && <StorefrontHomeMain />}

            {activeView === 'product-detail' && (
              <>
                <ProductDetailPage />
                <CustomerReviewsStrip />
                <PaymentTrustBanner />
              </>
            )}

            {activeView === 'checkout' && <CheckoutPage />}
          </main>
          <Footer />

          {/* Floating Hip Hop Cypher Beat (Non-intrusive) */}
          <HipHopStreetBar variant="floating" />

          {/* Floating Official WhatsApp Support Widget */}
          <WhatsAppFloatingButton />

          {/* PWA install banner (uses usePWAInstall hook) */}
          <PWAInstallBanner />

          {/* Storefront Mobile Bottom Bar */}
          <StorefrontMobileNav />
        </>
      )}

      {/* Global Colombian Store Policies & Legal Modal */}
      <StorePoliciesModal />

      {/* Direct Order Tracking Modal for Customers (No Registration Required) */}
      <OrderTrackingModal
        isOpen={isOrderTrackingOpen}
        onClose={() => setIsOrderTrackingOpen(false)}
        initialQuery={trackingQuery}
      />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}
