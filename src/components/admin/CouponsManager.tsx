import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  Percent,
  DollarSign,
  Calendar,
  Layers,
  Copy,
  ToggleLeft,
  ToggleRight,
  X,
  Sparkles,
  Search,
  Flame,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import { Coupon } from '../../types';

export const CouponsManager: React.FC = () => {
  const { coupons, addCoupon, deleteCoupon, toggleCoupon, showToast } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Coupon Form State
  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [value, setValue] = useState<number>(15);
  const [minPurchaseCOP, setMinPurchaseCOP] = useState<number>(150000);
  const [description, setDescription] = useState('');
  const [maxUses, setMaxUses] = useState<number>(500);
  const [expiresAt, setExpiresAt] = useState('2026-12-31');

  const filtered = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const newCoupon: Coupon = {
      id: `cpn-${Date.now()}`,
      code: code.trim().toUpperCase(),
      type: type,
      value: Number(value),
      minPurchaseInCents: minPurchaseCOP ? minPurchaseCOP * 100 : undefined,
      description: description.trim() || `Descuento ${type === 'PERCENTAGE' ? `${value}%` : `$${formatCOP(value * 100)} COP`}`,
      active: true,
      usedCount: 0,
      maxUses: maxUses || undefined,
      expiresAt: expiresAt || undefined,
      createdAt: new Date().toISOString(),
    };

    addCoupon(newCoupon);
    setIsModalOpen(false);
    setCode('');
    setValue(15);
    setDescription('');
  };

  const copyCode = (couponCode: string) => {
    navigator.clipboard?.writeText(couponCode);
    showToast(`📋 Cupón "${couponCode}" copiado al portapapeles.`);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 bg-[#f8f9fc] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1">
            CAMPAÑAS DE CONVERSIÓN & PROMOCIONES
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Gestor de Cupones & Descuentos</span>
            <span className="text-xs font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
              {coupons.length} cupones
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Los cupones se validan en tiempo real durante el checkout con Wompi Colombia.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nuevo Cupón</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código (ej. MANO10, FLASH10)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Coupons Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-12 text-center">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <Tag className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900">No hay cupones activos</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Crea cupones de descuento porcentuales o de valor fijo para tus campañas de marketing y drops.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Nuevo Cupón</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((cpn) => (
          <div
            key={cpn.id}
            className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between relative overflow-hidden ${
              cpn.active ? 'border-slate-200 shadow-xs' : 'border-slate-200/60 opacity-60 bg-slate-50'
            }`}
          >
            {/* Top Row */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl font-mono text-sm font-black tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    {cpn.code}
                  </span>
                  <button
                    onClick={() => copyCode(cpn.code)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Copiar código"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => toggleCoupon(cpn.id)}
                  className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                    cpn.active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {cpn.active ? 'Activo' : 'Pausado'}
                </button>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">{cpn.description}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {cpn.type === 'PERCENTAGE'
                      ? `${cpn.value}% OFF`
                      : `$${formatCOP(cpn.value * 100)} COP`}
                  </span>
                  {cpn.minPurchaseInCents && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      (Mínimo ${formatCOP(cpn.minPurchaseInCents)} COP)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Meta */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 block font-mono">Usos registrados</span>
                <span className="font-bold text-slate-700">
                  {cpn.usedCount} {cpn.maxUses ? `/ ${cpn.maxUses}` : 'veces'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteCoupon(cpn.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Eliminar cupón"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Nuevo Cupón de Descuento</h3>
                  <span className="text-[10px] text-slate-400">Promociones Tu Tienda a la Mano</span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Código del Cupón <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. BLACKFRIDAY20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold uppercase text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Descuento</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden"
                  >
                    <option value="PERCENTAGE">Porcentaje (%)</option>
                    <option value="FIXED">Monto Fijo (COP)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Valor {type === 'PERCENTAGE' ? '(%)' : '(COP)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Compra Mínima (COP)</label>
                <input
                  type="number"
                  step={5000}
                  value={minPurchaseCOP}
                  onChange={(e) => setMinPurchaseCOP(Number(e.target.value))}
                  placeholder="150000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción de Campaña</label>
                <input
                  type="text"
                  placeholder="ej. 20% OFF en toda la colección de Hoodies"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Límite de Usos</label>
                  <input
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha de Expiración</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-md shadow-indigo-200"
                >
                  Crear Cupón
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
