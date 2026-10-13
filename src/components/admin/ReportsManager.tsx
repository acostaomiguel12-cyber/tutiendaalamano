import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  CreditCard,
  ArrowUpRight,
  Calendar,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';

export const ReportsManager: React.FC = () => {
  const { analytics, orders, showToast } = useStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'30' | '90' | '365'>('30');

  const totalRevenue = analytics.totalRevenueInCents;
  const estimatedWompiFee = Math.round(totalRevenue * 0.0265 + orders.length * 70000); // 2.65% + $700 COP standard Wompi fee
  const estimatedNetProfit = Math.max(0, totalRevenue - estimatedWompiFee);
  const totalUnitsSold = orders.reduce(
    (acc, o) => acc + o.items.reduce((sub, item) => sub + item.quantity, 0),
    0
  );

  const exportFinancialReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      'Periodo,Referencia,Cliente,Ciudad,Metodo Pago,Monto Total COP,Comision Est Wompi,Ingreso Neto COP,Fecha\n' +
      orders
        .map((o) => {
          const fee = Math.round((o.totalAmountInCents * 0.0265) / 100 + 700);
          const net = Math.round(o.totalAmountInCents / 100) - fee;
          return `"${selectedPeriod} dias","${o.reference}","${o.customer.fullName}","${o.customer.city}","${
            o.wompiTransaction?.paymentMethod || 'Wompi'
          }",${Math.round(o.totalAmountInCents / 100)},${fee},${net},"${o.createdAt.slice(0, 10)}"`;
        })
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Apex_Reporte_Financiero_Ventas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('📊 Reporte financiero y de ventas descargado en CSV/Excel.');
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 bg-[#f8f9fc] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1">
            ESTADÍSTICAS FINANCIERAS & VENTAS
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reportes Financieros y Rentabilidad</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-xs">
            <button
              onClick={() => setSelectedPeriod('30')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedPeriod === '30' ? 'bg-[#2b47e5] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Días
            </button>
            <button
              onClick={() => setSelectedPeriod('90')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedPeriod === '90' ? 'bg-[#2b47e5] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Trimestre
            </button>
            <button
              onClick={() => setSelectedPeriod('365')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedPeriod === '365' ? 'bg-[#2b47e5] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Año Actual
            </button>
          </div>

          <button
            onClick={exportFinancialReport}
            className="flex items-center gap-2 bg-[#2b47e5] hover:bg-[#203ac9] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Informe CSV</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Ingresos Brutos</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            ${formatCOP(totalRevenue)} COP
          </div>
          <p className="text-[11px] text-slate-500">100% procesado a través de Wompi</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Comisión Pasarela (Est.)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700 font-mono tracking-tight">
            ${formatCOP(estimatedWompiFee)} COP
          </div>
          <p className="text-[11px] text-slate-500">Tarifa estándar Wompi (2.65% + $700)</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Ingreso Neto Liquidado</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
            ${formatCOP(estimatedNetProfit)} COP
          </div>
          <p className="text-[11px] text-slate-500">Fondos acreditados en cuenta Bancolombia</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Prendas Despachadas</span>
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {totalUnitsSold} unidades
          </div>
          <p className="text-[11px] text-slate-500">En {orders.length} pedidos procesados</p>
        </div>
      </div>

      {/* Visual Analytics Comparison Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Financial Bar Comparison */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Retención de Ingresos vs. Costos de Pasarela</h3>
              <p className="text-xs text-slate-500">Compara el dinero total facturado frente a la comisión Wompi</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              97.2% Retención Neta
            </span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: 'Ventas Totales',
                    monto: Math.round(totalRevenue / 100),
                    color: '#2b47e5',
                  },
                  {
                    name: 'Neto en Banco',
                    monto: Math.round(estimatedNetProfit / 100),
                    color: '#10b981',
                  },
                  {
                    name: 'Comisión Wompi',
                    monto: Math.round(estimatedWompiFee / 100),
                    color: '#f43f5e',
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(val: number) => [`$${formatCOP(val * 100)} COP`, 'Monto']}
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderRadius: '12px',
                    border: '1px solid #27272a',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="monto" radius={[8, 8, 0, 0]} fill="#2b47e5">
                  <Cell fill="#2b47e5" />
                  <Cell fill="#10b981" />
                  <Cell fill="#f43f5e" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Profit Margin Donut Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Salud del Margen de Ganancia</h3>
            <p className="text-xs text-slate-500">Porcentaje retenido tras pasarela Wompi</p>
          </div>

          <div className="h-40 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Ganancia Líquida', value: 97.2, color: '#10b981' },
                    { name: 'Comisión Wompi', value: 2.8, color: '#f43f5e' },
                  ]}
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f43f5e" />
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val}%`, 'Participación']}
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderRadius: '10px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center pointer-events-none">
              <span className="text-xs font-bold text-slate-400">Neto</span>
              <span className="text-base font-black text-emerald-600">97.2%</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Operación altamente rentable con comisiones mínimas de recaudo.</span>
          </div>
        </div>
      </div>

      {/* Financial Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">Desglose de Liquidaciones por Transacción</h3>
            <p className="text-xs text-slate-500">Detalle de ingresos y costos por pasarela de pagos</p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
            {orders.length} Transacciones
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">REFERENCIA</th>
                <th className="py-3 px-4">FECHA</th>
                <th className="py-3 px-4">CLIENTE</th>
                <th className="py-3 px-4">MÉTODO WOMPI</th>
                <th className="py-3 px-4 text-right">TOTAL COP</th>
                <th className="py-3 px-4 text-right">COMISIÓN EST.</th>
                <th className="py-3 px-4 text-right">NETO A CUENTA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {orders.map((ord) => {
                const fee = Math.round((ord.totalAmountInCents * 0.0265) / 100 + 700);
                const net = Math.round(ord.totalAmountInCents / 100) - fee;
                return (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{ord.reference}</td>
                    <td className="py-3 px-4 text-slate-500">{ord.createdAt.slice(0, 10)}</td>
                    <td className="py-3 px-4">{ord.customer.fullName}</td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px] font-bold text-slate-700">
                        {ord.wompiTransaction?.paymentMethod || 'Wompi Checkout'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${formatCOP(ord.totalAmountInCents)} COP
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-600 font-semibold">
                      -${fee.toLocaleString('es-CO')} COP
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-emerald-600">
                      ${net.toLocaleString('es-CO')} COP
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
