import React, { useState } from 'react';
import { Users, Search, Mail, Phone, MapPin, ShoppingBag, ShieldCheck, Crown, Calendar, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';

export const CustomersManager: React.FC = () => {
  const { customers, showToast } = useStore();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');

  const filtered = customers.filter((c) => {
    if (tierFilter !== 'ALL' && c.tier !== tierFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 sm:p-8 space-y-6 bg-[#f8f9fc] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1">
            CRM & FIDELIZACIÓN COLOMBIA
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Directorio de Clientes & LTV</span>
            <span className="text-xs font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
              {filtered.length} registrados
            </span>
          </h1>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, email, ciudad o depto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500">Nivel Cliente:</span>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">Todos los Niveles</option>
            <option value="VIP">Clientes VIP</option>
            <option value="REGULAR">Frecuentes (Regular)</option>
            <option value="NUEVO">Nuevos</option>
          </select>
        </div>
      </div>

      {/* Customer Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-12 text-center">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Directorio de Clientes Vacío</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Los clientes se registrarán automáticamente con sus datos de contacto y entrega cuando realicen su primer pedido en la tienda.
            </p>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((cust) => (
          <div
            key={cust.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-4 flex flex-col justify-between hover:border-indigo-300 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                    {cust.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{cust.fullName}</h3>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" /> {cust.city}, {cust.department}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    cust.tier === 'VIP'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : cust.tier === 'REGULAR'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {cust.tier === 'VIP' && <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />}
                  {cust.tier}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{cust.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>+57 {cust.phone}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Última compra: {cust.lastOrderDate}</span>
                  </div>
                  {cust.newsletterOptIn && (
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Ofertas & Noticias
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">LTV Acumulado</span>
                <span className="font-black text-indigo-700 text-sm font-mono">
                  ${formatCOP(cust.ltvInCents)} COP
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Pedidos</span>
                <span className="font-bold text-slate-900">{cust.totalOrders} órdenes</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
