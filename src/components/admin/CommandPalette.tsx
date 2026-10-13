import React, { useState, useEffect } from 'react';
import {
  Search,
  Zap,
  ShoppingBag,
  Package,
  Truck,
  Tag,
  Star,
  CheckCircle2,
  FileSpreadsheet,
  Sliders,
  Store,
  LogOut,
  UserCheck,
  X,
  Sparkles,
  Palette,
  Disc,
  ShieldCheck,
  ShoppingCart,
  HelpCircle,
  Globe,
  Database,
  Move,
} from 'lucide-react';
import { useStore, AdminTab } from '../../context/StoreContext';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setAdminTab,
    setActiveView,
    adminUsers,
    switchAdminUser,
    adminLogout,
    openHeroImageEditor,
  } = useStore();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (Cmd+K or Ctrl+K or ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const actions = [
    {
      id: 'view-store',
      title: 'Ver Tienda Online en Vivo (Storefront)',
      category: 'Tienda',
      icon: Store,
      iconColor: 'text-emerald-400',
      run: () => setAdminTab('store-preview'),
    },
    {
      id: 'hero-image-editor',
      title: 'Ajustar Posición y Tamaño de Imagen del HeroBanner (Object-Position, Zoom, Altura)',
      category: 'Diseño',
      icon: Move,
      iconColor: 'text-indigo-400',
      run: () => openHeroImageEditor(),
    },
    {
      id: 'tab-help-center',
      title: 'Centro de Ayuda Fácil & Guías Operativas',
      category: 'Ayuda',
      icon: HelpCircle,
      iconColor: 'text-amber-400',
      run: () => setAdminTab('help-center'),
    },
    {
      id: 'tab-database-sync',
      title: 'Base de Datos & Sincronización en la Nube (PostgreSQL)',
      category: 'Sistema',
      icon: Database,
      iconColor: 'text-emerald-400',
      run: () => setAdminTab('database-sync'),
    },
    {
      id: 'tab-domain-trust',
      title: 'Dominio .COM & Sellos de Confiabilidad',
      category: 'Configuración',
      icon: Globe,
      iconColor: 'text-blue-400',
      run: () => setAdminTab('domain-trust'),
    },
    {
      id: 'tab-orders',
      title: 'Ver Todos los Pedidos Wompi',
      category: 'Navegación',
      icon: ShoppingBag,
      iconColor: 'text-indigo-400',
      run: () => setAdminTab('orders'),
    },
    {
      id: 'tab-abandoned',
      title: 'Recuperar Carritos y Pedidos Abandonados (WhatsApp)',
      category: 'Navegación',
      icon: ShoppingCart,
      iconColor: 'text-rose-400',
      run: () => setAdminTab('abandoned-checkouts'),
    },
    {
      id: 'tab-catalog',
      title: 'Gestionar Catálogo de Productos y SKUs',
      category: 'Navegación',
      icon: Package,
      iconColor: 'text-purple-400',
      run: () => setAdminTab('catalog'),
    },
    {
      id: 'tab-shipping',
      title: 'Guías de Envío y Despachos Nacionales',
      category: 'Navegación',
      icon: Truck,
      iconColor: 'text-sky-400',
      run: () => setAdminTab('shipping'),
    },
    {
      id: 'tab-coupons',
      title: 'Crear o Modificar Cupones de Descuento',
      category: 'Navegación',
      icon: Tag,
      iconColor: 'text-emerald-400',
      run: () => setAdminTab('coupons'),
    },
    {
      id: 'tab-reviews',
      title: 'Moderar Reseñas de Clientes',
      category: 'Navegación',
      icon: Star,
      iconColor: 'text-amber-400',
      run: () => setAdminTab('reviews'),
    },
    {
      id: 'tab-wompi',
      title: 'Auditoría y Conciliación Wompi',
      category: 'Finanzas',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      run: () => setAdminTab('wompi-reconciliation'),
    },
    {
      id: 'tab-reports',
      title: 'Reportes Financieros & DIAN',
      category: 'Finanzas',
      icon: FileSpreadsheet,
      iconColor: 'text-indigo-400',
      run: () => setAdminTab('reports'),
    },
    {
      id: 'tab-theme-builder',
      title: 'Diseño & Temas Web (Personalizador tipo WordPress)',
      category: 'Diseño & Tienda',
      icon: Palette,
      iconColor: 'text-indigo-400',
      run: () => setAdminTab('theme-builder'),
    },
    {
      id: 'tab-music-player',
      title: 'Música & Audio de Tienda (Cambiar Canción & Modo Espía)',
      category: 'Diseño & Tienda',
      icon: Disc,
      iconColor: 'text-emerald-400',
      run: () => setAdminTab('music-player'),
    },
    {
      id: 'tab-settings',
      title: 'Configuración de Credenciales Wompi',
      category: 'Sistema',
      icon: Sliders,
      iconColor: 'text-slate-400',
      run: () => setAdminTab('settings'),
    },
    {
      id: 'tab-system-testing',
      title: 'Testing de Sistema, Auditoría & Diagnóstico E2E',
      category: 'Sistema',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      run: () => setAdminTab('system-testing'),
    },
    {
      id: 'go-store',
      title: 'Ir a la Tienda Pública TU TIENDA A LA MANO',
      category: 'Acciones',
      icon: Store,
      iconColor: 'text-pink-400',
      run: () => {
        setActiveView('home');
      },
    },
  ];

  const filteredActions = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-left">
        {/* Search Input Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe un comando o busca módulo (ej: Pedidos, Cupón, Wompi, Clientes)..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 font-medium focus:outline-hidden"
          />
          <kbd className="hidden sm:inline-block bg-slate-800 text-slate-400 text-[10px] font-mono px-2 py-1 rounded-md border border-slate-700">
            ESC
          </kbd>
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 py-1">
            Comandos y Accesos
          </div>

          {filteredActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => {
                  action.run();
                  setCommandPaletteOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/80 text-white transition-all group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 group-hover:border-indigo-500/50">
                    <Icon className={`w-4 h-4 ${action.iconColor}`} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                      {action.title}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-medium">
                      {action.category}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 group-hover:text-indigo-400 font-mono">
                  Ejecutar ↵
                </span>
              </button>
            );
          })}

          {/* Quick User Switcher Section in Palette */}
          <div className="pt-3 mt-3 border-t border-slate-800">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 py-1">
              Cambiar de Operador / Rol
            </div>
            {adminUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  switchAdminUser(u.id);
                  setCommandPaletteOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 text-left text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {u.avatarInitials}
                  </div>
                  <span className="text-slate-300 font-medium">{u.name} ({u.roleTitle})</span>
                </div>
                <span className="text-[10px] text-slate-500">{u.email}</span>
              </button>
            ))}

            <button
              onClick={() => {
                adminLogout();
                setCommandPaletteOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2.5 mt-1 rounded-xl hover:bg-rose-950/40 text-rose-400 text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión Administrativa</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 px-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>TU TIENDA A LA MANO Admin Quick Command Engine</span>
          </div>
          <span className="font-mono">Atajo: ⌘K / Ctrl+K</span>
        </div>
      </div>
    </div>
  );
};
