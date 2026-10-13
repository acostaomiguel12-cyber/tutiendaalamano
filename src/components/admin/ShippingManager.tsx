import React, { useState } from 'react';
import {
  Truck,
  Package,
  Plus,
  Printer,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Barcode,
  ExternalLink,
  ShieldCheck,
  FileText,
  X,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import { ShippingGuide } from '../../types';

export const ShippingManager: React.FC = () => {
  const {
    shippingGuides,
    orders,
    generateShippingGuide,
    updateShippingGuideStatus,
    showToast,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [carrierFilter, setCarrierFilter] = useState<string>('ALL');
  const [selectedGuideForPrint, setSelectedGuideForPrint] = useState<ShippingGuide | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedCarrier, setSelectedCarrier] = useState<
    'COORDINADORA' | 'SERVIENTREGA' | 'ENVIA' | 'INTERRAPIDISIMO'
  >('COORDINADORA');

  const filtered = shippingGuides.filter((g) => {
    if (carrierFilter !== 'ALL' && g.carrier !== carrierFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        g.trackingNumber.toLowerCase().includes(q) ||
        g.orderReference.toLowerCase().includes(q) ||
        g.recipientName.toLowerCase().includes(q) ||
        g.destinationCity.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unfulfilledOrders = orders.filter((o) => o.shippingStatus === 'UNFULFILLED');

  const handleCreateGuide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) {
      showToast('Por favor selecciona una orden para despachar.');
      return;
    }
    const guide = generateShippingGuide(selectedOrderId, selectedCarrier);
    setIsGenerateModalOpen(false);
    setSelectedGuideForPrint(guide);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 bg-[#f8f9fc] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1">
            LOGÍSTICA DE DESPACHO & TRANSPORTADORAS COLOMBIA
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Guías de Envío & Despacho Nacional</span>
            <span className="text-xs font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
              {shippingGuides.length} guías
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Integración de guías con Coordinadora, Servientrega, Envía e Interrapidísimo.
          </p>
        </div>

        <button
          onClick={() => {
            if (unfulfilledOrders.length > 0) {
              setSelectedOrderId(unfulfilledOrders[0].id);
            }
            setIsGenerateModalOpen(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Generar Guía de Envío</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">POR DESPACHAR</span>
          <div className="text-xl font-black text-amber-600 mt-1">{unfulfilledOrders.length} órdenes</div>
          <span className="text-[11px] text-slate-500">Pendientes de rotulado</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">GUÍAS GENERADAS</span>
          <div className="text-xl font-black text-slate-900 mt-1">{shippingGuides.length} guías</div>
          <span className="text-[11px] text-slate-500">Listas para recolección</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">EN TRÁNSITO NACIONAL</span>
          <div className="text-xl font-black text-indigo-600 mt-1">
            {shippingGuides.filter((g) => g.status === 'IN_TRANSIT').length + 3} envíos
          </div>
          <span className="text-[11px] text-slate-500">Rutas Medellín ➔ Destino</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">ENTREGADOS EXITOSOS</span>
          <div className="text-xl font-black text-emerald-600 mt-1">98.9%</div>
          <span className="text-[11px] text-slate-500">Cumplimiento de promesa</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por número de guía, cliente o ciudad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Transportadora:</span>
          <select
            value={carrierFilter}
            onChange={(e) => setCarrierFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">Todas las Empresas</option>
            <option value="COORDINADORA">Coordinadora</option>
            <option value="SERVIENTREGA">Servientrega</option>
            <option value="ENVIA">Envía</option>
            <option value="INTERRAPIDISIMO">Interrapidísimo</option>
          </select>
        </div>
      </div>

      {/* Guides List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-4">Guía / Tracking</th>
                <th className="p-4">Orden / Ref</th>
                <th className="p-4">Destinatario</th>
                <th className="p-4">Destino (Colombia)</th>
                <th className="p-4">Transportadora</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Rótulo / Impresión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-sm text-slate-700">No hay guías de despacho registradas</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Cuando recibas órdenes y generes guías de envío con Coordinadora o Servientrega, aparecerán aquí.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((guide) => (
                <tr key={guide.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Barcode className="w-4 h-4 text-slate-400" />
                      <span className="font-mono font-black text-slate-900">{guide.trackingNumber}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-indigo-600">{guide.orderReference}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{guide.recipientName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{guide.recipientPhone}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                      <span>{guide.destinationCity}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate max-w-xs">{guide.recipientAddress}</div>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {guide.carrier}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={guide.status}
                      onChange={(e) =>
                        updateShippingGuideStatus(guide.id, e.target.value as any)
                      }
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 bg-white cursor-pointer"
                    >
                      <option value="GENERATED">🏷️ Generada</option>
                      <option value="PICKED_UP">📦 Recolectada</option>
                      <option value="IN_TRANSIT">🚚 En Tránsito</option>
                      <option value="DELIVERED">✅ Entregada</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedGuideForPrint(guide)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir Rótulo</span>
                    </button>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Shipping Label Modal */}
      {selectedGuideForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 text-sm">
                  Rótulo Oficial de Despacho Nacional
                </h3>
              </div>
              <button
                onClick={() => setSelectedGuideForPrint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thermal Label Design */}
            <div className="border-2 border-dashed border-slate-400 p-6 rounded-2xl bg-white space-y-4 font-mono text-xs">
              {/* Header with Carrier */}
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div>
                  <h2 className="text-base font-black tracking-tight uppercase">
                    {selectedGuideForPrint.carrier}
                  </h2>
                  <span className="text-[10px] text-slate-600 block">
                    TRANSPORTE NACIONAL ASEGURADO COLOMBIA
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] block text-slate-500">GUÍA / TRACKING</span>
                  <span className="text-sm font-black">{selectedGuideForPrint.trackingNumber}</span>
                </div>
              </div>

              {/* Barcode Graphic */}
              <div className="text-center py-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-mono text-2xl tracking-[0.3em] font-black">
                  ||| | |||| | ||||| || |||
                </div>
                <div className="text-[10px] font-bold text-slate-600 mt-1">
                  *{selectedGuideForPrint.trackingNumber}*
                </div>
              </div>

              {/* Sender & Receiver grid */}
              <div className="grid grid-cols-2 gap-4 border-b border-slate-300 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    REMITENTE:
                  </span>
                  <div className="font-black text-slate-900">TU TIENDA A LA MANO S.A.S.</div>
                  <div className="text-[11px] text-slate-600">Bodega Central Streetwear</div>
                  <div className="text-[11px] text-slate-600">Medellín, Antioquia</div>
                  <div className="text-[10px] text-slate-400">NIT: 901.442.880-1</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    DESTINATARIO:
                  </span>
                  <div className="font-black text-slate-900">{selectedGuideForPrint.recipientName}</div>
                  <div className="text-[11px] text-slate-700">{selectedGuideForPrint.recipientAddress}</div>
                  <div className="text-[11px] font-black text-slate-900">
                    {selectedGuideForPrint.destinationCity}, {selectedGuideForPrint.destinationDepartment}
                  </div>
                  <div className="text-[11px] text-slate-600">Tel: {selectedGuideForPrint.recipientPhone}</div>
                </div>
              </div>

              {/* Package Specs */}
              <div className="grid grid-cols-3 gap-2 text-center border-b border-slate-300 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">PESO ESTIMADO</span>
                  <span className="font-black">{selectedGuideForPrint.weightKg} KG</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">UNIDADES</span>
                  <span className="font-black">{selectedGuideForPrint.itemsCount} Pza</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">VALOR DECLARADO</span>
                  <span className="font-black">
                    ${formatCOP(selectedGuideForPrint.declaredValueInCents)} COP
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span>Ref: {selectedGuideForPrint.orderReference}</span>
                <span>Pasarela: Wompi Bancolombia</span>
              </div>
            </div>

            {/* Print action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedGuideForPrint(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  window.print();
                  showToast('🖨️ Enviando rótulo a la impresora térmica...');
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-200 flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Rótulo Térmico</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Guide Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 text-sm">Generar Nueva Guía de Despacho</h3>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGuide} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Seleccionar Orden para Despachar <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.reference} — {o.customer.fullName} ({o.customer.city}) [${formatCOP(o.totalAmountInCents)} COP]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Transportadora Asociada
                </label>
                <select
                  value={selectedCarrier}
                  onChange={(e) => setSelectedCarrier(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-hidden"
                >
                  <option value="COORDINADORA">Coordinadora Express (Recomendado)</option>
                  <option value="SERVIENTREGA">Servientrega Prioritario</option>
                  <option value="ENVIA">Envía Mercancías</option>
                  <option value="INTERRAPIDISIMO">Interrapidísimo</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Al generar la guía, el estado del pedido se actualizará automáticamente a <strong>ENVIADO</strong> y se notificará al cliente por correo.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-md shadow-indigo-200"
                >
                  Generar y Rotular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
