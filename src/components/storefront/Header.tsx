import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  X,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  Sparkles,
  MessageCircle,
  Truck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import { scrollToCatalog } from '../../lib/storeNavigation';
import { getMerchantWhatsAppDigits, waLink } from '../../lib/whatsappOrder';
import { getDepartmentTree } from '../../lib/categories';
import { DEFAULT_NAV_LINKS } from '../../data/themes';

export const Header: React.FC = () => {
  const {
    products,
    openQuickView,
    activeView,
    setActiveView,
    cartCount,
    setIsCartOpen,
    wishlist,
    openWishlist,
    searchQuery,
    setSearchQuery,
    activeCategoryFilter,
    setActiveCategoryFilter,
    themeConfig,
    isCustomerLoggedIn,
    currentCustomer,
    setIsCustomerProfileOpen,
    openOrderTracking,
    storePreferences,
    openPolicyModal,
  } = useStore();

  const isDark = themeConfig.mode === 'dark';
  const isWarm = themeConfig.mode === 'warm';
  const rawLogo = themeConfig.logoUrl || storePreferences.storeLogoUrl;
  const activeLogo = rawLogo && rawLogo.trim() ? rawLogo.trim() : '/favicon.png';

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const deptRef = useRef<HTMLDivElement>(null);
  const [deptOpen, setDeptOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastYRef = useRef(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mide la altura para el espaciador (header fijo) y auto-oculta al bajar.
  useEffect(() => {
    const measure = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
    };
    measure();
    window.addEventListener('resize', measure);
    const t = setTimeout(measure, 500);
    lastYRef.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastYRef.current;
      lastYRef.current = y;
      setScrolled(y > 24);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (dy > 8 && y > 140) {
        setHeaderVisible(false);
      } else if (dy < -4 || y <= 140) {
        setHeaderVisible(true);
      }
      idleTimerRef.current = setTimeout(() => setHeaderVisible(true), 1200);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', onScroll);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      clearTimeout(t);
    };
  }, []);

  // Focus input when search is expanded on desktop
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Focus input when mobile search overlay opens
  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        if (!searchQuery) {
          setIsSearchExpanded(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);

  // Dynamic Navigation Links from Theme Config or Default Presets
  const rawNavLinks =
    themeConfig.navCategoryLinks && themeConfig.navCategoryLinks.length > 0
      ? themeConfig.navCategoryLinks
      : DEFAULT_NAV_LINKS;

  const navLinks = rawNavLinks.filter((item) => item.enabled !== false);

  // Árbol de departamentos + subcategorías para el desplegable.
  const departments = React.useMemo(() => getDepartmentTree(products), [products]);
  const isNovedadesActive =
    activeCategoryFilter === null && activeView === 'home' && !searchQuery;

  // Cierra el desplegable al hacer clic fuera o con Escape.
  useEffect(() => {
    if (!deptOpen) return;
    const onDown = (e: MouseEvent) => {
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) {
        setDeptOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDeptOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [deptOpen]);

  const handleNavClick = (filter: string | null) => {
    setActiveView('home');
    setActiveCategoryFilter(filter);
    setSearchQuery('');
    setIsSearchExpanded(false);
    setTimeout(() => {
      scrollToCatalog(true);
    }, 70);
  };

  // Search filter results calculation
  const searchFilteredProducts = React.useMemo(() => {
    if (!searchQuery || searchQuery.trim().length === 0) return [];
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const title = (p.title || (p as any).name || '').toLowerCase();
      const category = (p.category || '').toLowerCase();
      const ref = (p.reference || (p as any).sku || '').toLowerCase();
      return title.includes(q) || category.includes(q) || ref.includes(q);
    });
  }, [products, searchQuery]);

  return (
    <>
    <div aria-hidden style={{ height: headerHeight }} />
    <header
      ref={headerRef}
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 border-b ${
        headerVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isDark
          ? scrolled
            ? 'bg-zinc-950/80 backdrop-blur-xl text-white border-zinc-800/60 shadow-[0_8px_30px_rgba(0,0,0,0.35)]'
            : 'bg-zinc-950/40 backdrop-blur-md text-white border-transparent'
          : isWarm
          ? scrolled
            ? 'bg-[#faf8f5]/80 backdrop-blur-xl text-stone-900 border-stone-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.07)]'
            : 'bg-gradient-to-b from-[#faf8f5]/90 via-[#faf8f5]/40 to-transparent text-stone-900 border-transparent'
          : scrolled
          ? 'bg-white/75 backdrop-blur-xl text-zinc-900 border-zinc-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.07)]'
          : 'bg-gradient-to-b from-white/90 via-white/40 to-transparent backdrop-blur-xs text-zinc-900 border-transparent'
      }`}
    >
      {/* Top Announcement Bar: Clean, calm and subtle */}
      {themeConfig.showAnnouncementBar && (
        <div
          className={`text-[11px] font-sans font-medium py-1 px-4 select-none border-b transition-colors ${
            isDark
              ? 'bg-zinc-900/90 text-zinc-300 border-zinc-800/70'
              : 'bg-gradient-to-r from-green-700 via-green-600 to-green-700 text-white border-green-800'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden sm:flex items-center gap-2 text-zinc-300 text-[10.5px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="font-medium">Envíos a toda Colombia</span>
            </div>

            <div className="text-center font-normal text-zinc-100 text-[11px] sm:text-xs flex-1 truncate">
              {themeConfig.announcementText}
            </div>

            {storePreferences.showTopTrustNotice !== false && (
              <button
                type="button"
                onClick={() => openPolicyModal('garantias')}
                className="hidden md:flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer text-[10.5px] font-medium"
                title="Garantía de compra y envíos asegurados"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pago Seguro Wompi</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Friendly Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* 1. Left: Friendly, Clear Logo */}
          <div className="shrink-0 flex items-center">
            <button
              onClick={() => {
                setActiveView('home');
                setActiveCategoryFilter(null);
                setSearchQuery('');
                setIsSearchExpanded(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group flex items-center gap-2 cursor-pointer text-left focus:outline-hidden"
            >
              {activeLogo ? (
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeLogo}
                    alt={storePreferences.storeBrandName || 'Logo de Tienda'}
                    style={{ height: `${themeConfig.logoHeight || storePreferences.storeLogoHeight || 48}px` }}
                    className="w-auto object-contain max-h-[64px] transition-transform group-hover:scale-105"
                  />
                  {(themeConfig.showBrandNameWithLogo !== false && themeConfig.showLogoImage !== false) && (
                    <div className="hidden sm:flex flex-col items-start">
                      <span
                        className={`text-xl font-black tracking-tight ${
                          themeConfig.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
                        } ${isDark ? 'text-white' : 'text-zinc-950'}`}
                      >
                        {storePreferences.storeBrandName || 'TU TIENDA A LA MANO'}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-start">
                  <span
                    className={`text-xl sm:text-2xl font-black tracking-tight group-hover:opacity-85 transition-opacity ${
                      themeConfig.fontFamily === 'serif' ? 'font-serif tracking-normal' : 'font-sans'
                    } ${isDark ? 'text-white' : 'text-zinc-950'}`}
                  >
                    {storePreferences.storeBrandName || 'TU TIENDA A LA MANO'}
                  </span>
                  <span className="text-[9px] font-medium tracking-widest text-zinc-400 uppercase -mt-0.5">
                    {storePreferences.city || 'Medellín'} • {storePreferences.department || 'Todo a la mano'}
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* 2. Center: Novedades + Departamentos con subcategorías */}
          <nav className="hidden lg:flex items-center justify-center gap-1.5 text-[13px] font-medium font-sans">
            <button
              onClick={() => handleNavClick(null)}
              className={`px-3.5 py-1.5 rounded-full transition-all duration-150 cursor-pointer ${
                isNovedadesActive
                  ? 'font-semibold shadow-xs'
                  : isDark
                  ? 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
              }`}
              style={
                isNovedadesActive && !isDark
                  ? { backgroundColor: `${themeConfig.primaryColor}14`, color: themeConfig.primaryColor }
                  : undefined
              }
            >
              Novedades
            </button>

            <div className="relative" ref={deptRef}>
              <button
                onClick={() => setDeptOpen((v) => !v)}
                aria-expanded={deptOpen}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-150 cursor-pointer ${
                  deptOpen || (activeCategoryFilter !== null && !searchQuery)
                    ? 'font-semibold shadow-xs'
                    : isDark
                    ? 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50'
                }`}
                style={
                  (deptOpen || (activeCategoryFilter !== null && !searchQuery)) && !isDark
                    ? { backgroundColor: `${themeConfig.primaryColor}14`, color: themeConfig.primaryColor }
                    : undefined
                }
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Departamentos{activeCategoryFilter ? `: ${activeCategoryFilter}` : ''}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${deptOpen ? 'rotate-180' : ''}`} />
              </button>

              {deptOpen && (
                <div
                  className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[560px] max-w-[80vw] rounded-2xl border shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150 ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
                  }`}
                >
                  <div className="grid grid-cols-2 gap-1 max-h-[60vh] overflow-y-auto">
                    {departments.map((dept) => {
                      const isDeptActive =
                        activeCategoryFilter !== null &&
                        activeCategoryFilter.toLowerCase() === dept.name.toLowerCase();
                      return (
                        <div
                          key={dept.name}
                          className={`rounded-xl p-2.5 transition-colors ${
                            isDark ? 'hover:bg-zinc-900' : 'hover:bg-zinc-50'
                          }`}
                        >
                          <button
                            onClick={() => {
                              handleNavClick(dept.name);
                              setDeptOpen(false);
                            }}
                            className="w-full flex items-center justify-between gap-2 text-left cursor-pointer group/dept"
                          >
                            <span
                              className="text-[13px] font-bold truncate"
                              style={isDeptActive && !isDark ? { color: themeConfig.primaryColor } : undefined}
                            >
                              {dept.name}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
                              }`}
                            >
                              {dept.count}
                            </span>
                          </button>
                          {dept.subcategories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {dept.subcategories.map((sub) => {
                                const isSubActive =
                                  activeCategoryFilter !== null &&
                                  activeCategoryFilter.toLowerCase() === sub.name.toLowerCase();
                                return (
                                  <button
                                    key={sub.name}
                                    onClick={() => {
                                      handleNavClick(sub.name);
                                      setDeptOpen(false);
                                    }}
                                    style={
                                      isSubActive
                                        ? { backgroundColor: themeConfig.primaryColor, color: '#fff', borderColor: themeConfig.primaryColor }
                                        : undefined
                                    }
                                    className={`text-[11px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                                      isSubActive
                                        ? 'font-bold shadow-xs'
                                        : isDark
                                        ? 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
                                        : 'border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400'
                                    }`}
                                  >
                                    {sub.name}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      handleNavClick(null);
                      setDeptOpen(false);
                    }}
                    className={`w-full mt-2 pt-2 border-t text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      isDark ? 'border-zinc-800 text-zinc-400 hover:text-white' : 'border-zinc-100 text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    Ver todo el catálogo
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* 3. Right: Balanced, Clean Action Suite */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0" ref={searchContainerRef}>
            {/* Mobile search toggle (beside logo to save navbar space) */}
            <button
              onClick={() => setIsMobileSearchOpen((v) => !v)}
              className={`md:hidden p-2 rounded-full transition-colors cursor-pointer ${
                isDark ? 'text-zinc-300 hover:text-white hover:bg-zinc-900' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
              title="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>
            {/* Desktop Expandable / Friendly Search Bar */}
            <div className="relative hidden md:block">
              {isSearchExpanded ? (
                <div className="flex items-center relative animate-in fade-in zoom-in-95 duration-150">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar café, ropa, mascotas..."
                    className={`w-56 lg:w-64 pl-9 pr-8 py-1.5 text-xs rounded-full border transition-all focus:outline-hidden ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-zinc-500'
                        : 'bg-zinc-100 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white shadow-inner'
                    }`}
                  />
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchExpanded(false);
                    }}
                    className="absolute right-2 p-1 text-zinc-400 hover:text-zinc-600 rounded-full cursor-pointer"
                    title="Cerrar búsqueda"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchExpanded(true)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
                      : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/70'
                  }`}
                  title="Buscar en la tienda"
                >
                  <Search className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-zinc-400 font-normal">Buscar productos...</span>
                </button>
              )}

              {/* Desktop Instant Search Results Dropdown */}
              {isSearchExpanded && searchQuery.trim().length > 0 && (
                <div
                  className={`absolute right-0 top-full mt-2 w-80 p-3 rounded-2xl border shadow-xl max-h-80 overflow-y-auto space-y-2 z-50 animate-in fade-in duration-150 ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
                  }`}
                >
                  {searchFilteredProducts.length === 0 ? (
                    <div className="text-center py-4 text-zinc-400 text-xs font-sans">
                      No encontramos productos con "{searchQuery}"
                    </div>
                  ) : (
                    searchFilteredProducts.slice(0, 4).map((product) => {
                      const firstVariant = product.variants?.[0];
                      const price = firstVariant?.priceInCents || 17990000;
                      const image = product.mainImage || product.thumbnailImages?.[0] || '';
                      return (
                        <div
                          key={product.id}
                          onClick={() => {
                            openQuickView(product);
                            setSearchQuery('');
                            setIsSearchExpanded(false);
                          }}
                          className={`flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer ${
                            isDark ? 'hover:bg-zinc-900' : 'hover:bg-zinc-50'
                          }`}
                        >
                          <img
                            src={image}
                            alt={product.title}
                            className="w-10 h-10 rounded-lg object-cover bg-zinc-100 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold truncate text-left">{product.title}</p>
                            <p className="text-[10px] text-zinc-400 font-mono text-left">${formatCOP(price)}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Button (Friendly icon button) */}
            <button
              onClick={openWishlist}
              className={`relative p-2 sm:p-2.5 rounded-full transition-colors cursor-pointer ${
                isDark
                  ? 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
              title="Mis Favoritos"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlist.length > 0 && (
                <span className="absolute 0.5 top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Order Tracking / Customer Profile Button */}
            <button
              onClick={() => {
                if (isCustomerLoggedIn) {
                  setIsCustomerProfileOpen(true);
                } else {
                  openOrderTracking();
                }
              }}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                isDark
                  ? 'text-zinc-300 hover:text-white hover:bg-zinc-900 border border-zinc-800'
                  : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border border-zinc-200'
              }`}
              title={isCustomerLoggedIn ? 'Mi Cuenta' : 'Rastrear Pedido'}
            >
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">
                {isCustomerLoggedIn ? (currentCustomer?.fullName.split(' ')[0] || 'Mi Cuenta') : 'Rastrear'}
              </span>
            </button>

            {/* WhatsApp Chat Support Icon */}
            <a
              href={waLink(getMerchantWhatsAppDigits(storePreferences.supportPhoneWhatsApp), 'Hola Tu Tienda a la Mano, deseo asesoria con mi compra')}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 sm:p-2.5 rounded-full transition-colors cursor-pointer text-emerald-600 hover:text-emerald-500 ${
                isDark ? 'hover:bg-zinc-900' : 'hover:bg-zinc-100'
              }`}
              title="Atención por WhatsApp"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>

            {/* Friendly Shopping Bag Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs ${
                isDark
                  ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                  : 'bg-zinc-950 text-white hover:bg-zinc-800'
              }`}
              style={{
                backgroundColor: isDark ? '#ffffff' : themeConfig.primaryColor,
                color: isDark ? '#09090b' : '#ffffff',
              }}
              title="Abrir bolsa de compras"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline font-sans">Bolsa</span>
              <span className="text-[11px] font-mono font-black bg-white/20 dark:bg-black/10 px-1.5 py-0.5 rounded-full">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (compact overlay beside logo — opens on demand) */}
        <div className="md:hidden pb-2 pt-0.5 space-y-2">

          {/* Mobile Category Horizontal Rail */}
          {navLinks.length > 0 && !searchQuery && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar -mx-1 px-1">
              {navLinks.map((item, idx) => {
                const isActive =
                  (item.filter === null && activeCategoryFilter === null && activeView === 'home') ||
                  (item.filter !== null &&
                    activeCategoryFilter !== null &&
                    (activeCategoryFilter.toLowerCase() === item.filter.toLowerCase() ||
                      item.filter.toLowerCase().includes(activeCategoryFilter.toLowerCase()) ||
                      activeCategoryFilter.toLowerCase().includes(item.filter.toLowerCase())));

                return (
                  <button
                    key={item.id || `mob-nav-${item.name}-${idx}`}
                    onClick={() => handleNavClick(item.filter)}
                    style={
                      isActive && !isDark
                        ? { backgroundColor: themeConfig.primaryColor, borderColor: themeConfig.primaryColor }
                        : undefined
                    }
                    className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-sans font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      isActive
                        ? isDark
                          ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                          : 'text-white font-semibold shadow-xs'
                        : isDark
                        ? 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                        : 'bg-zinc-100 text-zinc-700 border border-zinc-200/60'
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="text-[8.5px] font-mono font-bold px-1 rounded-full bg-emerald-500/20 text-emerald-400 uppercase">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Mobile Instant Results Dropdown */}
          {searchQuery.trim().length > 0 && (
            <div
              className={`mt-2 p-3 rounded-2xl border shadow-xl max-h-72 overflow-y-auto space-y-2 animate-in fade-in slide-in-from-top-1 duration-150 ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
              }`}
            >
              {searchFilteredProducts.length === 0 ? (
                <div className="text-center py-4 text-zinc-400 text-xs font-sans">
                  No encontramos productos con "{searchQuery}"
                </div>
              ) : (
                searchFilteredProducts.slice(0, 4).map((product) => {
                  const firstVariant = product.variants?.[0];
                  const price = firstVariant?.priceInCents || 17990000;
                  const totalStock = product.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
                  const image = product.mainImage || product.thumbnailImages?.[0] || (product as any).images?.[0] || '';

                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        openQuickView(product);
                        setSearchQuery('');
                        setIsMobileSearchOpen(false);
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer ${
                        isDark ? 'hover:bg-zinc-900' : 'hover:bg-zinc-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={image}
                          alt={product.title}
                          className="w-10 h-10 rounded-lg object-cover bg-zinc-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{product.title}</p>
                          <p className="text-[10px] font-mono text-zinc-400 truncate">
                            Ref: {product.reference}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 pl-2">
                        <p className="text-xs font-mono font-bold">${formatCOP(price)}</p>
                        <span className={`text-[9px] font-medium ${totalStock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {totalStock > 0 ? `Stock (${totalStock})` : 'Agotado'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile search overlay (beside logo, floats over content) */}
      {isMobileSearchOpen && (
        <div
          className={`md:hidden absolute top-full inset-x-0 z-50 border-b shadow-xl animate-in fade-in slide-in-from-top-1 duration-150 ${
            isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'
          }`}
        >
          <div className="px-4 py-2.5 flex items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-zinc-400 pointer-events-none" />
              <input
                ref={mobileSearchRef}
                type="text"
                placeholder="Buscar productos o marcas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsMobileSearchOpen(false);
                    setSearchQuery('');
                  }
                }}
                className={`w-full pl-9 pr-9 py-2 text-xs rounded-full border transition-all focus:outline-hidden ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500'
                    : 'bg-zinc-100 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:bg-white'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 rounded-full text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setIsMobileSearchOpen(false);
                setSearchQuery('');
              }}
              className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </header>
    </>
  );
};

