import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Palette,
  Menu,
  Sparkles,
  Store,
} from 'lucide-react';
import { AdminTab, useStore } from '../../context/StoreContext';

export const AdminMobileNav: React.FC = () => {
  const {
    adminTab,
    setAdminTab,
    orders,
    stockAlerts,
    setAdminSidebarMobileOpen,
    setActiveView,
  } = useStore();

  const pendingOrdersCount = orders.filter(
    (o) => o.shippingStatus === 'UNFULFILLED' || o.status === 'PENDING'
  ).length;

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 shadow-2xl safe-area-pb">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-items-center gap-1 text-slate-600">
        {/* 1. Dashboard Overview */}
        <button
          onClick={() => setAdminTab('dashboard')}
          className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all cursor-pointer ${
            adminTab === 'dashboard'
              ? 'text-indigo-600 font-black'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5" />
            {adminTab === 'dashboard' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-600" />
            )}
          </div>
          <span className="text-[10px] font-mono mt-1 uppercase tracking-tight">Panel</span>
        </button>

        {/* 2. Orders */}
        <button
          onClick={() => setAdminTab('orders')}
          className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all cursor-pointer relative ${
            adminTab === 'orders'
              ? 'text-indigo-600 font-black'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white font-mono text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {pendingOrdersCount}
              </span>
            )}
            {adminTab === 'orders' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-600" />
            )}
          </div>
          <span className="text-[10px] font-mono mt-1 uppercase tracking-tight">Pedidos</span>
        </button>

        {/* 3. Catalog */}
        <button
          onClick={() => setAdminTab('catalog')}
          className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all cursor-pointer relative ${
            adminTab === 'catalog'
              ? 'text-indigo-600 font-black'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <div className="relative">
            <Package className="w-5 h-5" />
            {stockAlerts.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white font-mono text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {stockAlerts.length}
              </span>
            )}
            {adminTab === 'catalog' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-600" />
            )}
          </div>
          <span className="text-[10px] font-mono mt-1 uppercase tracking-tight">Catálogo</span>
        </button>

        {/* 4. Theme & Visual Builder */}
        <button
          onClick={() => setAdminTab('theme-builder')}
          className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all cursor-pointer relative ${
            adminTab === 'theme-builder'
              ? 'text-indigo-600 font-black'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <div className="relative">
            <Palette className="w-5 h-5" />
            {adminTab === 'theme-builder' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-600" />
            )}
          </div>
          <span className="text-[10px] font-mono mt-1 uppercase tracking-tight">Diseño</span>
        </button>

        {/* 5. More Menu Drawer */}
        <button
          onClick={() => setAdminSidebarMobileOpen(true)}
          className="flex flex-col items-center justify-center w-full py-1 rounded-xl text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
        >
          <div className="p-1 rounded-lg bg-slate-100 border border-slate-200">
            <Menu className="w-4 h-4 text-slate-700" />
          </div>
          <span className="text-[10px] font-mono mt-0.5 uppercase tracking-tight font-bold">Más</span>
        </button>
      </div>
    </nav>
  );
};
