import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Eye,
  FileText,
  Filter,
  Download,
  AlertCircle,
  XCircle,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Zap,
  Printer,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import { Order, ShippingStatus, PaymentStatus } from '../../types';

export const OrdersManager: React.FC = () => {
  const {
    orders,
    setSelectedOrderForDetail,
    setPrintableInvoiceOrder,
    updateOrderStatus,
    updateShippingStatus,
    showToast,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [shippingFilter, setShippingFilter] = useState<string>('ALL');

  const filtered = orders.filter((ord) => {
    if (statusFilter !== 'ALL' && ord.status !== statusFilter) return false;
    if (shippingFilter !== 'ALL' && ord.shippingStatus !== shippingFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const txId = ord.wompiTransaction?.transactionId?.toLowerCase() || '';
      return (
        (ord.id || '').toLowerCase().includes(q) ||
        (ord.reference || '').toLowerCase().includes(q) ||
        (ord.customer?.fullName || '').toLowerCase().includes(q) ||
        (ord.customer?.city || '').toLowerCase().includes(q) ||
        (ord.customer?.email || '').toLowerCase().includes(q) ||
        txId.includes(q)
      );
    }
    return true;
  });

  const exportOrdersCSV = () => {
    const headers = [
      'ID Orden',
      'Referencia',
      'Fecha',
      'Cliente',
      'Email',
      'Teléfono',
      'Ciudad',
      'Departamento',
      'Dirección',
      'Total COP',
      'IVA (19%) COP',
      'Estado Wompi',
      'Método Pago',
      'ID Transacción Wompi',
      'Estado Envío',
      'Transportadora',
      'Guía Rastreo',
    ];

    const rows = filtered.map((o) => [
      `"${o.id}"`,
      `"${o.reference}"`,
      `"${new Date(o.createdAt).toLocaleString('es-CO')}"`,
      `"${o.customer.fullName.replace(/"/g, '""')}"`,
      `"${o.customer.email}"`,
      `"${o.customer.phone}"`,
      `"${o.customer.city}"`,
      `"${o.customer.department}"`,
      `"${o.customer.address}"`,
      Math.round(o.totalAmountInCents / 100),
      Math.round(o.taxInCents / 100),
      `"${o.status}"`,
      `"${o.wompiTransaction?.paymentMethod || 'Wompi'}"`,
      `"${o.wompiTransaction?.transactionId || 'N/A'}"`,
      `"${o.shippingStatus}"`,
      `"${o.carrier || 'N/A'}"`,
      `"${o.trackingNumber || 'N/A'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Apex_Reporte_Ordenes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Reporte de órdenes exportado exitosamente en formato CSV / Excel.');
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 bg-[#f8f9fc] min-h-screen">
      {/* Top Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1">
            GESTIÓN LOGÍSTICA & PAGOS COLOMBIA
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Órdenes y Despachos Nacionales</span>
            <span className="text-xs font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
              {filtered.length} {filtered.length === 1 ? 'orden' : 'órdenes'}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportOrdersCSV}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Exportar a Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, #ORD, ciudad, email o Wompi ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Wompi Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
            <span className="text-[11px] font-bold text-slate-500">Wompi:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="APPROVED">Aprobados Wompi</option>
              <option value="PENDING">Pendientes</option>
              <option value="DECLINED">Rechazados</option>
            </select>
          </div>

          {/* Shipping Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
            <span className="text-[11px] font-bold text-slate-500">Logística:</span>
            <select
              value={shippingFilter}
              onChange={(e) => setShippingFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">Todo el Flujo</option>
              <option value="UNFULFILLED">Por Preparar</option>
              <option value="FULFILLED">Preparado</option>
              <option value="SHIPPED">En Ruta</option>
              <option value="DELIVERED">Entregado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Orden / Fecha</th>
                <th className="py-3.5 px-4">Cliente & Destino</th>
                <th className="py-3.5 px-4">Productos / Items</th>
                <th className="py-3.5 px-4">Monto Total COP</th>
                <th className="py-3.5 px-4">Pasarela Wompi</th>
                <th className="py-3.5 px-4">Logística & Despacho</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="font-bold text-sm text-slate-600">No se encontraron órdenes con esos criterios</p>
                    <p className="text-xs text-slate-400 mt-1">Prueba cambiando los filtros o buscando otro término.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Order Reference */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <div className="text-indigo-600 font-black">{ord.reference}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {new Date(ord.createdAt).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{ord.customer.fullName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>
                          {ord.customer.city}, {ord.customer.department}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">{ord.customer.phone}</div>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {ord.items.length} {ord.items.length === 1 ? 'producto' : 'productos'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {ord.items.map((i) => `${i.quantity}x ${i.productTitle}`).join(', ')}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4">
                      <div className="font-black text-slate-900 font-mono text-[13px]">
                        ${formatCOP(ord.totalAmountInCents)} COP
                      </div>
                      <div className="text-[10px] text-slate-400">
                        IVA incl: ${formatCOP(ord.taxInCents)}
                      </div>
                    </td>

                    {/* Wompi Status */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {ord.status === 'APPROVED' ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> APROBADO
                          </span>
                        ) : ord.status === 'PENDING' ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" /> PENDIENTE
                          </span>
                        ) : (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-600" /> RECHAZADO
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1">
                        {ord.wompiTransaction?.paymentMethod || 'Wompi'} •{' '}
                        {ord.wompiTransaction?.transactionId || 'N/A'}
                      </div>
                    </td>

                    {/* Shipping Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={ord.shippingStatus}
                        onChange={(e) => updateShippingStatus(ord.id, e.target.value as ShippingStatus)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-hidden ${
                          ord.shippingStatus === 'DELIVERED'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : ord.shippingStatus === 'SHIPPED'
                            ? 'bg-blue-50 border-blue-200 text-blue-800'
                            : ord.shippingStatus === 'FULFILLED'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                            : ord.shippingStatus === 'CANCELLED'
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}
                      >
                        <option value="UNFULFILLED">📦 POR PREPARAR</option>
                        <option value="FULFILLED">📋 PREPARADO</option>
                        <option value="SHIPPED">🚚 EN RUTA</option>
                        <option value="DELIVERED">✅ ENTREGADO</option>
                        <option value="CANCELLED">❌ CANCELADO</option>
                      </select>
                      {ord.trackingNumber && (
                        <div className="text-[9px] font-mono text-slate-400 mt-1 truncate max-w-[140px]">
                          {ord.carrier?.split(' ')[0]}: {ord.trackingNumber}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPrintableInvoiceOrder(ord)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
                          title="Imprimir Factura Proforma / Remisión de Despacho"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-600" />
                          <span className="hidden sm:inline">Factura</span>
                        </button>
                        <button
                          onClick={() => setSelectedOrderForDetail(ord)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-bold text-xs transition-colors cursor-pointer"
                          title="Ver Detalle y Trazabilidad Wompi"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detalles</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
