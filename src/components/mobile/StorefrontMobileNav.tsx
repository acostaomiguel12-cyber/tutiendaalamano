import React, { useEffect, useRef, useState } from 'react';
import {
  Home,
  Compass,
  Heart,
  ShoppingBag,
  Menu,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { MobileWishlistModal } from './MobileWishlistModal';
import { MobileMenuSheet } from './MobileMenuSheet';
import { MobileExplorerModal } from './MobileExplorerModal';

export const StorefrontMobileNav: React.FC = () => {
  const {
    activeView,
    setActiveView,
    cartCount,
    setIsCartOpen,
    wishlist,
    setActiveCategoryFilter,
    themeConfig,
    isCustomerLoggedIn,
    currentCustomer,
    isCustomerProfileOpen,
    setIsCustomerProfileOpen,
  } = useStore();

  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const lastYRef = useRef(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-oculta al bajar, reaparece al subir o al pausar el scroll.
  useEffect(() => {
    lastYRef.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastYRef.current;
      lastYRef.current = y;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (dy > 8 && y > 120) {
        setNavVisible(false);
      } else if (dy < -4) {
        setNavVisible(true);
      }
      // Pausa: sin scroll por 1.2s → mostrar.
      idleTimerRef.current = setTimeout(() => setNavVisible(true), 1200);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  const isDark = themeConfig.mode === 'dark';

  // Determine which tab is active (Facebook style)
  const isHomeActive = activeView === 'home' && !menuOpen && !wishlistOpen && !explorerOpen && !isCustomerProfileOpen;
  const isExplorerActive = explorerOpen;
  const isWishlistActive = wishlistOpen;
  const isCartActive = false; // cart opens as drawer
  const isMenuActive = menuOpen || isCustomerProfileOpen;

  // Primary accent color (defaults to Facebook-like vivid blue or custom primary)
  const activeAccentColor = themeConfig.primaryColor && themeConfig.primaryColor !== '#18181b' && themeConfig.primaryColor !== '#121214'
    ? themeConfig.primaryColor
    : '#2563eb'; // Facebook signature royal blue

  return (
    <>
      <nav
        className={`lg:hidden fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur-2xl transition-all duration-300 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] ${
          navVisible ? 'translate-y-0' : 'translate-y-full'
        } ${
          isDark
            ? 'bg-zinc-950/70 border-zinc-800/50 text-white'
            : 'bg-white/70 border-zinc-200/50 text-zinc-900'
        }`}
        style={{
          paddingBottom: 'max(0.45rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-stretch justify-items-center h-14 sm:h-16">
          {/* 1. INICIO (Facebook Style Tab) */}
          <button
            onClick={() => {
              setMenuOpen(false);
              setWishlistOpen(false);
              setExplorerOpen(false);
              setIsCustomerProfileOpen(false);
              setActiveView('home');
              setActiveCategoryFilter(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="relative flex flex-col items-center justify-center w-full h-full transition-all cursor-pointer select-none active:scale-90"
          >
            {/* Facebook Top Active Indicator Bar */}
            {isHomeActive && (
              <span
                className="absolute top-0 inset-x-4 h-[3px] rounded-b-full shadow-xs transition-all"
                style={{ backgroundColor: activeAccentColor }}
              />
            )}

            <div className="relative flex items-center justify-center">
              <Home
                className={`w-[22px] h-[22px] transition-transform ${
                  isHomeActive
                    ? isDark
                      ? 'text-white scale-105'
                      : 'text-blue-600 scale-105'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
                style={isHomeActive && activeAccentColor !== '#2563eb' ? { color: activeAccentColor } : {}}
              />
            </div>
            <span
              className={`text-[10px] font-sans font-bold mt-0.5 tracking-tight transition-colors ${
                isHomeActive
                  ? isDark
                    ? 'text-white'
                    : 'text-blue-600'
                  : 'text-zinc-500 dark:text-zinc-400 font-medium'
              }`}
              style={isHomeActive && activeAccentColor !== '#2563eb' ? { color: activeAccentColor } : {}}
            >
              Inicio
            </span>
          </button>

          {/* 2. EXPLORAR / TIENDA (Facebook Watch/Marketplace Style Tab) */}
          <button
            onClick={() => {
              setMenuOpen(false);
              setWishlistOpen(false);
              setExplorerOpen(true);
            }}
            className="relative flex flex-col items-center justify-center w-full h-full transition-all cursor-pointer select-none active:scale-90"
          >
            {/* Facebook Top Active Indicator Bar */}
            {isExplorerActive && (
              <span
                className="absolute top-0 inset-x-4 h-[3px] rounded-b-full shadow-xs transition-all"
                style={{ backgroundColor: activeAccentColor }}
              />
            )}

            <div className="relative flex items-center justify-center">
              <Compass
                className={`w-[22px] h-[22px] transition-transform ${
                  isExplorerActive
                    ? isDark
                      ? 'text-white scale-105'
                      : 'text-blue-600 scale-105'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
                style={isExplorerActive && activeAccentColor !== '#2563eb' ? { color: activeAccentColor } : {}}
              />
            </div>
            <span
              className={`text-[10px] font-sans font-bold mt-0.5 tracking-tight transition-colors ${
                isExplorerActive
                  ? isDark
                    ? 'text-white'
                    : 'text-blue-600'
                  : 'text-zinc-500 dark:text-zinc-400 font-medium'
              }`}
              style={isExplorerActive && activeAccentColor !== '#2563eb' ? { color: activeAccentColor } : {}}
            >
              Explorar
            </span>
          </button>

          {/* 3. DESEOS (Wishlist with Red Badge) */}
          <button
            onClick={() => {
              setMenuOpen(false);
              setExplorerOpen(false);
              setWishlistOpen(true);
            }}
            className="relative flex flex-col items-center justify-center w-full h-full transition-all cursor-pointer select-none active:scale-90"
          >
            {/* Facebook Top Active Indicator Bar */}
            {isWishlistActive && (
              <span
                className="absolute top-0 inset-x-4 h-[3px] rounded-b-full shadow-xs transition-all"
                style={{ backgroundColor: activeAccentColor }}
              />
            )}

            <div className="relative flex items-center justify-center">
              <Heart
                className={`w-[22px] h-[22px] transition-transform ${
                  wishlist.length > 0
                    ? 'text-rose-500 fill-rose-500'
                    : isWishlistActive
                    ? isDark
                      ? 'text-white'
                      : 'text-blue-600'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
                style={isWishlistActive && activeAccentColor !== '#2563eb' && wishlist.length === 0 ? { color: activeAccentColor } : {}}
              />

              {/* Notification badge */}
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-rose-600 text-white font-mono text-[9px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-zinc-950 shadow-xs animate-in zoom-in-50 duration-150">
                  {wishlist.length}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] font-sans font-bold mt-0.5 tracking-tight transition-colors ${
                isWishlistActive
                  ? isDark
                    ? 'text-white'
                    : 'text-blue-600'
                  : 'text-zinc-500 dark:text-zinc-400 font-medium'
              }`}
              style={isWishlistActive && activeAccentColor !== '#2563eb' ? { color: activeAccentColor } : {}}
            >
              Deseos
            </span>
          </button>

          {/* 4. BOLSA / CARRITO (Cart with Counter Badge) */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex flex-col items-center justify-center w-full h-full transition-all cursor-pointer select-none active:scale-90"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingBag
                className={`w-[22px] h-[22px] transition-transform ${
                  cartCount > 0
                    ? isDark
                      ? 'text-white'
                      : 'text-zinc-900'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              />

              {/* Cart Badge counter */}
              {cartCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-2.5 text-white font-mono text-[9px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-zinc-950 shadow-xs animate-bounce-short"
                  style={{ backgroundColor: activeAccentColor }}
                >
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-sans font-bold mt-0.5 tracking-tight text-zinc-500 dark:text-zinc-400">
              Bolsa
            </span>
          </button>

          {/* 5. MENÚ (Facebook 5th Iconic Tab) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative flex flex-col items-center justify-center w-full h-full transition-all cursor-pointer select-none active:scale-90"
          >
            {/* Facebook Top Active Indicator Bar */}
            {isMenuActive && (
              <span
                className="absolute top-0 inset-x-4 h-[3px] rounded-b-full shadow-xs transition-all"
                style={{ backgroundColor: activeAccentColor }}
              />
            )}

            <div className="relative flex items-center justify-center">
              {isCustomerLoggedIn && currentCustomer?.avatarUrl ? (
                <div className="relative">
                  <img
                    src={currentCustomer.avatarUrl}
                    alt="Perfil"
                    className={`w-[22px] h-[22px] rounded-full object-cover ring-2 ${
                      isMenuActive
                        ? 'ring-blue-600'
                        : 'ring-zinc-300 dark:ring-zinc-700'
                    }`}
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-zinc-950" />
                </div>
              ) : (
                <Menu
                  className={`w-[22px] h-[22px] transition-transform ${
                    isMenuActive
                      ? isDark
                        ? 'text-white scale-105'
                        : 'text-blue-600 scale-105'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                  style={isMenuActive && activeAccentColor !== '#2563eb' ? { color: activeAccentColor } : {}}
                />
              )}
            </div>
            <span
              className={`text-[10px] font-sans font-bold mt-0.5 tracking-tight transition-colors ${
                isMenuActive
                  ? isDark
                    ? 'text-white'
                    : 'text-blue-600'
                  : 'text-zinc-500 dark:text-zinc-400 font-medium'
              }`}
              style={isMenuActive && activeAccentColor !== '#2563eb' ? { color: activeAccentColor } : {}}
            >
              Menú
            </span>
          </button>
        </div>
      </nav>

      {/* 1. Facebook Style Menu Sheet */}
      <MobileMenuSheet
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenWishlist={() => {
          setMenuOpen(false);
          setWishlistOpen(true);
        }}
        onOpenProfileTab={(tab) => {
          setMenuOpen(false);
          setIsCustomerProfileOpen(true);
        }}
      />

      {/* 2. Mobile Explorer Modal */}
      <MobileExplorerModal
        isOpen={explorerOpen}
        onClose={() => setExplorerOpen(false)}
      />

      {/* 3. Mobile Wishlist Modal */}
      <MobileWishlistModal
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
      />
    </>
  );
};
