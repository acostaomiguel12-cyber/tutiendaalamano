import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  Bell,
  Store,
  Sparkles,
  Volume2,
  VolumeX,
  Radio,
  Disc,
  ArrowRight,
  TrendingUp,
  Sliders,
  X,
  Tag,
  Truck,
  Star,
  LogOut,
  Palette,
  Globe,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  ShoppingCart,
  Rocket,
  MessageSquare,
  HelpCircle,
  Database,
  Pin,
  PinOff,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Play,
} from 'lucide-react';
import { AdminTab, useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import { ShareStoreModal } from './ShareStoreModal';

interface NavSection {
  title: string;
  items: {
    id: AdminTab;
    label: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    iconBg?: string;
    badge?: number | string;
    badgeColor?: string;
  }[];
}

export const AdminSidebar: React.FC = () => {
  const {
    adminTab,
    setAdminTab,
    orders,
    abandonedCheckouts,
    notifications,
    stockAlerts,
    analytics,
    latestLiveAlertOrder,
    dismissLiveAlert,
    soundEnabled,
    toggleSound,
    setSelectedOrderForDetail,
    coupons,
    reviews,
    currentAdminUser,
    adminLogout,
    setAdminSidebarMobileOpen,
    showToast,
    openSystemVideoTutorial,
    hasModulePermission,
  } = useStore();

  const [isPinned, setIsPinned] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('admin_sidebar_pinned');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
  });

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('admin_sidebar_sections_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      'Ventas & Operaciones': true,
      'Catálogo & Productos': true,
      'Diseño & Personalización': false,
      'Marketing & Promoción': false,
      'Finanzas & Pasarela': false,
      'Sistema, Dominio & Ayuda': true,
    };
  });

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isExpanded = isMobile || isPinned || isHovered;

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('admin_sidebar_pinned', JSON.stringify(next));
      } catch {
        // ignore
      }
      showToast(next ? '📌 Menú lateral fijado' : '⚡ Menú en modo compacto (se abre al pasar el cursor)');
      return next;
    });
  };

  const handleCopyQuickLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('✅ ¡Enlace de la tienda copiado!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const pendingOrdersCount = orders.filter(
    (o) => o.shippingStatus === 'UNFULFILLED' || o.status === 'PENDING'
  ).length;
  const abandonedCount = abandonedCheckouts.filter((c) => c.status === 'ABANDONED').length;

  // Solo módulos permitidos para el usuario actual (empleados no ven lo administrativo).
  const allNavigationSections: NavSection[] = [
    {
      title: 'Ventas & Operaciones',
      items: [
        {
          id: 'dashboard',
          label: 'Panel General',
          description: 'KPIs, ventas del día y métricas en vivo',
          icon: LayoutDashboard,
          iconBg: 'bg-indigo-50 text-indigo-600',
        },
        {
          id: 'orders',
          label: 'Pedidos Wompi',
          description: 'Historial, aprobaciones y despachos',
          icon: ShoppingBag,
          iconBg: 'bg-blue-50 text-blue-600',
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
        {
          id: 'abandoned-checkouts',
          label: 'Carritos Abandonados',
          description: 'Recuperación WhatsApp & Cupones',
          icon: ShoppingCart,
          iconBg: 'bg-rose-50 text-rose-600',
          badge: abandonedCount > 0 ? abandonedCount : undefined,
          badgeColor: 'bg-rose-600 text-white font-black',
        },
        {
          id: 'customers',
          label: 'Clientes & LTV',
          description: 'Directorio de compradores y recurrencia',
          icon: Users,
          iconBg: 'bg-sky-50 text-sky-600',
        },
        {
          id: 'shipping',
          label: 'Guías & Logística',
          description: 'Coordinadora, Servientrega e Inter',
          icon: Truck,
          iconBg: 'bg-purple-50 text-purple-600',
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
          badgeColor: 'bg-indigo-600 text-white',
        },
      ],
    },
    {
      title: 'Catálogo & Productos',
      items: [
        {
          id: 'catalog',
          label: 'Catálogo & SKUs',
          description: 'Productos, stock, precios y variaciones',
          icon: Package,
          iconBg: 'bg-amber-50 text-amber-600',
          badge: stockAlerts.length > 0 ? stockAlerts.length : undefined,
          badgeColor: 'bg-amber-500 text-white',
        },
        {
          id: 'reviews',
          label: 'Reseñas & Social Proof',
          description: 'Calificaciones de clientes 5 estrellas',
          icon: Star,
          iconBg: 'bg-amber-50 text-amber-600',
          badge: reviews.filter((r) => r.status === 'PENDING').length || undefined,
          badgeColor: 'bg-amber-500 text-white',
        },
      ],
    },
    {
      title: 'Diseño & Personalización',
      items: [
        {
          id: 'theme-builder',
          label: 'Diseño & Temas Web',
          description: 'Editor visual, banners, tipografía y presets',
          icon: Palette,
          iconBg: 'bg-violet-50 text-violet-600',
          badge: 'VISUAL',
          badgeColor: 'bg-indigo-600 text-white font-mono',
        },
        {
          id: 'music-player',
          label: 'Música & Banda Sonora',
          description: 'Canción personalizada y modo espía',
          icon: Disc,
          iconBg: 'bg-emerald-50 text-emerald-600',
        },
      ],
    },
    {
      title: 'Marketing & Promoción',
      items: [
        {
          id: 'coupons',
          label: 'Cupones & Promos',
          description: 'Descuentos % y códigos activos',
          icon: Tag,
          iconBg: 'bg-emerald-50 text-emerald-600',
          badge: coupons.filter((c) => c.active).length,
          badgeColor: 'bg-emerald-600 text-white',
        },
        {
          id: 'whatsapp-business',
          label: 'WhatsApp Business API',
          description: 'Auto-mensajes de guías y entregas',
          icon: MessageSquare,
          iconBg: 'bg-emerald-50 text-emerald-600',
          badge: 'v20.0',
          badgeColor: 'bg-emerald-600 text-white font-mono text-[9px] font-bold',
        },
      ],
    },
    {
      title: 'Finanzas & Pasarela',
      items: [
        {
          id: 'wompi-reconciliation',
          label: 'Conciliación Wompi',
          description: 'Dispersiones, comisiones y cuentas',
          icon: CheckCircle2,
          iconBg: 'bg-indigo-50 text-indigo-600',
        },
        {
          id: 'reports',
          label: 'Reportes Financieros',
          description: 'Ventas brutas, IVA e informes contables',
          icon: FileSpreadsheet,
          iconBg: 'bg-blue-50 text-blue-600',
        },
        {
          id: 'settings',
          label: 'Configuración Pasarela',
          description: 'Llaves públicas, llaves privadas y modo',
          icon: Sliders,
          iconBg: 'bg-slate-100 text-slate-700',
        },
        {
          id: 'notifications',
          label: 'Notificaciones & Webhooks',
          description: 'Eventos Wompi y alertas de inventario',
          icon: Bell,
          iconBg: 'bg-rose-50 text-rose-600',
          badge: unreadCount > 0 ? unreadCount : undefined,
          badgeColor: 'bg-rose-600 text-white font-bold animate-pulse',
        },
      ],
    },
    {
      title: 'Sistema, Dominio & Ayuda',
      items: [
        {
          id: 'production-launch',
          label: 'Lanzamiento Producción',
          description: 'Checklist 8 pilares Shopify grade',
          icon: Rocket,
          iconBg: 'bg-emerald-500 text-white shadow-xs',
          badge: '96%',
          badgeColor: 'bg-emerald-600 text-white font-mono text-[9px] font-black',
        },
        {
          id: 'database-sync',
          label: 'Base de Datos & Sync',
          description: 'Verificación en vivo y respaldo nube',
          icon: Database,
          iconBg: 'bg-emerald-50 text-emerald-600',
          badge: 'DB LIVE',
          badgeColor: 'bg-emerald-600 text-white font-mono text-[9px] font-black',
        },
        {
          id: 'domain-trust',
          label: 'Dominio .COM & Confianza',
          description: 'Registro, DNS y sellos de seguridad',
          icon: Globe,
          iconBg: 'bg-blue-50 text-blue-600',
          badge: 'VITAL',
          badgeColor: 'bg-blue-600 text-white font-mono text-[9px] font-black',
        },
        {
          id: 'system-testing',
          label: 'Auditoría & Salud',
          description: 'Integridad y rendimiento operativo',
          icon: ShieldCheck,
          iconBg: 'bg-emerald-50 text-emerald-600',
          badge: '100%',
          badgeColor: 'bg-emerald-500 text-white font-mono text-[9px] font-black',
        },
        {
          id: 'help-center',
          label: 'Centro de Ayuda Fácil',
          description: 'Guías operativas, despachos y atajos',
          icon: HelpCircle,
          iconBg: 'bg-amber-50 text-amber-600',
          badge: 'FÁCIL',
          badgeColor: 'bg-amber-500 text-white font-mono text-[9px] font-bold',
        },
        {
          id: 'store-preview',
          label: 'Ver Tienda Online',
          description: 'Explorar la tienda en vivo como cliente',
          icon: Store,
          iconBg: 'bg-emerald-50 text-emerald-600',
          badge: 'LIVE',
          badgeColor: 'bg-emerald-500 text-white font-mono text-[9px] font-black',
        },
      ],
    },
  ];

  const navigationSections = allNavigationSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => hasModulePermission(item.id as AdminTab)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen max-h-screen shadow-sm transition-all duration-300 ease-in-out relative z-30 ${
        isExpanded ? 'w-[285px]' : 'w-[74px]'
      }`}
    >
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin p-3 space-y-4">
        {/* Brand Header */}
        <div className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 via-green-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-green-200 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>

              {isExpanded && (
                <div className="min-w-0 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black tracking-widest text-slate-900 uppercase truncate">
                      A LA MANO
                    </span>
                    <span className="text-[9px] font-extrabold text-green-700 uppercase bg-green-50 px-1 py-0.5 rounded border border-green-200/60">
                      OS v2.4
                    </span>
                  </div>
                  <h2 className="text-xs font-extrabold text-slate-800 tracking-tight leading-none mt-0.5 truncate">
                    Tienda Admin Pro
                  </h2>
                </div>
              )}
            </div>

            {/* Header Controls (Pinned, Sound & Close) */}
            <div className="flex items-center gap-1 shrink-0">
              {isExpanded && (
                <>
                  {/* Pin Toggle Button */}
                  <button
                    onClick={togglePin}
                    title={isPinned ? 'Desanclar menú (modo hover)' : 'Fijar menú abierto'}
                    className={`hidden lg:flex p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      isPinned
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    {isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
                  </button>

                  {/* Sound Toggle */}
                  <button
                    onClick={toggleSound}
                    title={soundEnabled ? 'Silenciar audio de pedidos' : 'Activar sonido de pedidos'}
                    className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      soundEnabled
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>
                </>
              )}

              {/* Mobile Close */}
              <button
                onClick={() => setAdminSidebarMobileOpen(false)}
                className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                title="Cerrar menú"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Colombian Status Badge (when expanded) */}
          {isExpanded && (
            <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200/80 mt-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px]">Wompi En Línea</span>
              </div>
              <span className="font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[9px] border border-indigo-100">
                🇨🇴 COP ACTIVO
              </span>
            </div>
          )}
        </div>

        {/* Live Order Alert Mini Card (when expanded or when alert exists) */}
        {isExpanded && latestLiveAlertOrder && (
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white p-3 rounded-2xl shadow-md border border-indigo-800/40 relative overflow-hidden animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-pink-400 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-wider text-pink-300">
                  NUEVO PEDIDO WOMPI
                </span>
              </div>
              <button
                onClick={dismissLiveAlert}
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                title="Descartar alerta"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1.5 bg-white/10 p-2 rounded-xl backdrop-blur-xs text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-bold text-indigo-200">
                  {latestLiveAlertOrder.reference}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[8px] font-black px-1.5 py-0.5 rounded">
                  APROBADO
                </span>
              </div>
              <p className="font-bold text-white truncate text-[10px]">
                {latestLiveAlertOrder.customer.fullName} • ${formatCOP(latestLiveAlertOrder.totalAmountInCents)}
              </p>
              <button
                onClick={() => setSelectedOrderForDetail(latestLiveAlertOrder)}
                className="w-full flex items-center justify-center gap-1 bg-white/20 hover:bg-white/30 text-white text-[9px] font-bold py-1 px-2 rounded-lg transition-colors cursor-pointer"
              >
                <span>Ver Detalles</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        )}

        {/* Categorized Navigation List with Collapsible Modules (Accordion) */}
        <div className="space-y-3">
          {isExpanded && (
            <div className="flex items-center justify-between px-1 text-[9px] font-mono font-bold text-slate-400">
              <span className="uppercase tracking-wider">Módulos Desplegables</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const allOpen = navigationSections.every((s) => openSections[s.title] !== false);
                    const next: Record<string, boolean> = {};
                    navigationSections.forEach((s) => {
                      next[s.title] = !allOpen;
                    });
                    setOpenSections(next);
                    try {
                      localStorage.setItem('admin_sidebar_sections_v2', JSON.stringify(next));
                    } catch {}
                  }}
                  className="hover:text-indigo-600 cursor-pointer underline text-[9px]"
                  title="Alternar todos los módulos"
                >
                  {navigationSections.every((s) => openSections[s.title] !== false)
                    ? 'Colapsar Todo'
                    : 'Expandir Todo'}
                </button>
              </div>
            </div>
          )}

          {navigationSections.map((section, sectionIdx) => {
            const isSectionOpen = isExpanded ? (openSections[section.title] ?? true) : true;
            const hasActiveChild = section.items.some((item) => item.id === adminTab);
            const totalBadges = section.items.reduce((acc, curr) => {
              if (typeof curr.badge === 'number') return acc + curr.badge;
              if (curr.badge) return acc + 1;
              return acc;
            }, 0);

            return (
              <div key={sectionIdx} className="space-y-1">
                {isExpanded ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOpenSections((prev) => {
                        const next = { ...prev, [section.title]: !(prev[section.title] ?? true) };
                        try {
                          localStorage.setItem('admin_sidebar_sections_v2', JSON.stringify(next));
                        } catch {}
                        return next;
                      });
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer group select-none ${
                      hasActiveChild
                        ? 'bg-slate-100/90 text-indigo-900 font-black'
                        : 'hover:bg-slate-100/70 text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider truncate">
                        {section.title}
                      </span>
                      {hasActiveChild && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!isSectionOpen && totalBadges > 0 && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                          {totalBadges}
                        </span>
                      )}
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                          isSectionOpen ? 'rotate-0' : '-rotate-90'
                        }`}
                      />
                    </div>
                  </button>
                ) : (
                  <div className="w-full h-px bg-slate-100 my-1" />
                )}

                {/* Items Container: shown when expanded & section open, or always in collapsed icon mode */}
                {isSectionOpen && (
                  <div className="space-y-1 pl-0.5 animate-in fade-in duration-150">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = adminTab === item.id;

                      return (
                        <div key={item.id} className="relative group">
                          <button
                            onClick={() => {
                              setAdminTab(item.id);
                              setAdminSidebarMobileOpen(false);
                            }}
                            className={`w-full text-left transition-all cursor-pointer flex items-center ${
                              isExpanded
                                ? `p-2 rounded-xl border justify-between ${
                                    isActive
                                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-sm'
                                      : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                                  }`
                                : `w-11 h-11 mx-auto rounded-xl justify-center ${
                                    isActive
                                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                  }`
                            }`}
                          >
                            <div className={`flex items-center ${isExpanded ? 'gap-2.5 min-w-0' : 'justify-center'}`}>
                              <div
                                className={`flex items-center justify-center shrink-0 ${
                                  isExpanded
                                    ? `w-8 h-8 rounded-lg ${
                                        isActive
                                          ? 'bg-white/20 text-white'
                                          : item.iconBg || 'bg-slate-100 text-slate-700'
                                      }`
                                    : 'w-full h-full'
                                }`}
                              >
                                <Icon className={`${isExpanded ? 'w-4 h-4' : 'w-5 h-5'}`} />
                              </div>

                              {isExpanded && (
                                <div className="min-w-0 flex-1">
                                  <h4
                                    className={`text-xs font-bold tracking-tight truncate ${
                                      isActive ? 'text-white' : 'text-slate-900'
                                    }`}
                                  >
                                    {item.label}
                                  </h4>
                                  <p
                                    className={`text-[9px] truncate leading-tight mt-0.5 ${
                                      isActive ? 'text-blue-100' : 'text-slate-400'
                                    }`}
                                  >
                                    {item.description}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Badges */}
                            {item.badge !== undefined && (
                              isExpanded ? (
                                <span
                                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full shrink-0 ml-1.5 ${
                                    item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-rose-500 text-white')
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              ) : (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
                              )
                            )}
                          </button>

                          {/* Tooltip on Collapsed Mode */}
                          {!isExpanded && (
                            <div className="hidden group-hover:flex absolute left-14 top-1/2 -translate-y-1/2 z-50 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-xl border border-slate-700 pointer-events-none items-center gap-2 animate-in fade-in duration-150">
                              <span>{item.label}</span>
                              {item.badge !== undefined && (
                                <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded font-mono">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Interactive Video Screencast Quick Launcher */}
        {isExpanded ? (
          <button
            type="button"
            onClick={() => {
              openSystemVideoTutorial();
              setAdminSidebarMobileOpen(false);
            }}
            className="w-full bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white p-2.5 rounded-xl shadow-md shadow-rose-950/20 text-xs font-bold transition-all flex items-center justify-between group cursor-pointer active:scale-98"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-[11px] font-black">Videos del Sistema</span>
                <span className="text-[9px] text-rose-200">Capturas reales paso a paso</span>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded">
              1080P
            </span>
          </button>
        ) : (
          <div className="relative group">
            <button
              type="button"
              onClick={() => {
                openSystemVideoTutorial();
                setAdminSidebarMobileOpen(false);
              }}
              className="w-11 h-11 mx-auto rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
              title="Videos del Sistema (1080p)"
            >
              <Play className="w-5 h-5 fill-rose-600" />
            </button>
            <div className="hidden group-hover:flex absolute left-14 top-1/2 -translate-y-1/2 z-50 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-xl border border-slate-700 pointer-events-none items-center gap-2">
              Videos del Sistema
            </div>
          </div>
        )}

        {/* Quick Mini Stats (when expanded) */}
        {isExpanded && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 space-y-1.5 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-slate-500 font-bold text-[9px] uppercase">
              <span>Métricas Hoy</span>
              <TrendingUp className="w-3 h-3 text-emerald-600" />
            </div>
            <div className="flex justify-between items-center text-slate-900">
              <span className="text-[10px] text-slate-500">Ventas Hoy:</span>
              <span className="font-extrabold text-slate-900 font-mono text-[10px]">
                ${formatCOP(analytics.todayRevenueInCents)} COP
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-900">
              <span className="text-[10px] text-slate-500">Efectividad Wompi:</span>
              <span className="font-extrabold text-emerald-600 text-[10px]">
                {analytics.wompiSuccessRate}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Area: Public Store Link & Profile */}
      <div className={`border-t border-slate-200 bg-slate-50/50 ${isExpanded ? 'p-3 space-y-2.5' : 'p-2 space-y-2'}`}>
        {/* Switch to Store button */}
        {isExpanded ? (
          <button
            onClick={() => {
              setAdminTab('store-preview');
              setAdminSidebarMobileOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-2 px-3 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-98"
          >
            <Store className="w-3.5 h-3.5 text-white" />
            <span>Ver Tienda Online</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse" />
          </button>
        ) : (
          <div className="relative group">
            <button
              onClick={() => {
                setAdminTab('store-preview');
                setAdminSidebarMobileOpen(false);
              }}
              className="w-11 h-11 mx-auto rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Store className="w-5 h-5" />
            </button>
            <div className="hidden group-hover:flex absolute left-14 top-1/2 -translate-y-1/2 z-50 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-xl border border-slate-700 pointer-events-none items-center gap-2">
              Ver Tienda Online
            </div>
          </div>
        )}

        {/* Public Store Domain Mini Card (when expanded) */}
        {isExpanded && (
          <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold uppercase text-slate-400">
                Tienda Pública
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <Globe className="w-3 h-3 text-indigo-600 shrink-0" />
                <span className="text-[11px] font-mono font-bold text-slate-800 truncate">
                  tutiendaalamano.com
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleCopyQuickLink}
                  title="Copiar enlace"
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  title="Compartir o generar QR"
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile / Logout Row */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              {currentAdminUser?.avatarInitials || 'CM'}
            </div>
            {isExpanded && (
              <div className="min-w-0 flex-1 text-left animate-in fade-in duration-150">
                <p className="text-[11px] font-extrabold text-slate-900 truncate">
                  {currentAdminUser?.name || 'Carlos Mendoza'}
                </p>
                <p className="text-[9px] text-indigo-600 font-bold truncate">
                  {currentAdminUser?.roleTitle || 'Super Admin'}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={adminLogout}
            title="Cerrar sesión"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Share Modal */}
      <ShareStoreModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </div>
  );
};
