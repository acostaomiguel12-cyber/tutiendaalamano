import React from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Package,
  Calendar,
  Building,
  User,
  MapPin,
  Barcode,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';

export const PrintableInvoiceModal: React.FC = () => {
  const { printableInvoiceOrder, setPrintableInvoiceOrder, storePreferences, shippingGuides } = useStore();

  if (!printableInvoiceOrder) return null;

  const order = printableInvoiceOrder;
  const guide = shippingGuides.find((g) => g.orderId === order.id);

  const handlePrint = () => {
    window.print();
  };

  // Tax calculations (IVA 19% included)
  const total = order.totalAmountInCents || (order as any).totalInCents || 0;
  const shipping = order.shippingInCents || 0;
  const netBeforeTax = Math.round((total - shipping) / 1.19);
  const ivaAmount = total - shipping - netBeforeTax;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 animate-fade-in print:p-0 print:m-0 print:block">
      {/* Backdrop (hidden when printing) */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity print:hidden"
        onClick={() => setPrintableInvoiceOrder(null)}
      />

      {/* Invoice Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 font-mono">
              FACTURA DE VENTA & GUÍA DE DESPACHO
            </span>
            <span className="text-xs text-slate-300 font-mono">
              {order.reference}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={() => setPrintableInvoiceOrder(null)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div id="printable-invoice" className="p-6 sm:p-10 overflow-y-auto space-y-6 text-slate-900 font-sans print:p-8 print:text-black">
          {/* Company & Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black uppercase tracking-tighter text-slate-950 font-sans">
                  {storePreferences.storeBrandName}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-300">
                  ORIGINAL
                </span>
              </div>
              <p className="text-xs font-bold text-slate-700">{storePreferences.storeLegalName}</p>
              <p className="text-xs text-slate-600 font-mono">{storePreferences.nitRUT} • Régimen Común</p>
              <p className="text-xs text-slate-600">{storePreferences.address}, {storePreferences.city}</p>
              <p className="text-xs text-slate-600 font-mono">
                Email: {storePreferences.supportEmail} | Tel: {storePreferences.supportPhoneWhatsApp}
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200 print:bg-transparent print:p-0 print:border-none">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 block">
                REMISIÓN & FACTURA ELECTRÓNICA
              </span>
              <h2 className="text-lg font-black font-mono text-slate-950">
                {order.reference}
              </h2>
              <p className="text-xs text-slate-600 flex sm:justify-end items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(order.createdAt).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <div className="pt-1 flex sm:justify-end items-center gap-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  PAGO APROBADO WOMPI
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Customer Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 print:border-slate-300">
              <div className="flex items-center gap-1.5 font-black text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Datos del Comprador</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-slate-950">{order.customer.fullName}</p>
                <p className="font-mono text-slate-600">
                  C.C. / Documento: <strong>{order.customer.idNumber || 'Consumidor Final'}</strong>
                </p>
                <p className="font-mono text-slate-600">Tel: {order.customer.phone || 'No especificado'}</p>
                <p className="text-slate-600">Email: {order.customer.email}</p>
              </div>
            </div>

            {/* Delivery Destination Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 print:border-slate-300">
              <div className="flex items-center gap-1.5 font-black text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Destino & Operador Logístico</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-950">{order.customer.address}</p>
                {order.customer.neighborhood && (
                  <p className="text-slate-600">Barrio / Sector: {order.customer.neighborhood}</p>
                )}
                <p className="font-bold text-slate-800">
                  {order.customer.city}, {order.customer.department}
                </p>
                <div className="flex items-center justify-between pt-1 font-mono text-[11px]">
                  <span className="text-slate-500">Transportadora:</span>
                  <span className="font-extrabold text-indigo-700 uppercase">
                    {guide?.carrier || 'COORDINADORA MERCANTIL'}
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-500">Guía de Despacho:</span>
                  <span className="font-extrabold text-slate-900">
                    {guide?.trackingNumber || order.trackingNumber || 'COORD-772910384'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-600" />
              Detalle de Prendas & Despacho
            </h3>

            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-black">
                  <tr>
                    <th className="p-3">SKU / Referencia</th>
                    <th className="p-3">Descripción de Prenda</th>
                    <th className="p-3 text-center">Talla</th>
                    <th className="p-3 text-center">Cant.</th>
                    <th className="p-3 text-right">Precio Unitario</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {order.items.map((item, idx) => {
                    const sku = item.variantSku || (item as any).sku || `OPUS-SKU-${idx + 1}`;
                    const title = item.productTitle || (item as any).title || 'Prenda OPUS';
                    const unitPrice = item.unitPriceInCents || (item as any).priceInCents || 0;
                    const subtotal = item.totalPriceInCents || unitPrice * item.quantity;
                    return (
                      <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : ''}>
                        <td className="p-3 font-bold text-slate-900">{sku}</td>
                        <td className="p-3 font-sans font-medium text-slate-900">
                          {title}
                          <span className="block text-[10px] text-slate-500 font-mono">Gramaje: Heavyweight 450 GSM</span>
                        </td>
                        <td className="p-3 text-center font-sans font-bold">{item.selectedSize}</td>
                        <td className="p-3 text-center font-bold text-slate-900">{item.quantity}</td>
                        <td className="p-3 text-right">${formatCOP(unitPrice)}</td>
                        <td className="p-3 text-right font-bold text-slate-950">
                          ${formatCOP(subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown & Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            {/* Barcode & Quality Control Checklist */}
            <div className="w-full sm:w-1/2 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 print:bg-transparent print:border-slate-300">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Código de Rastreo de Envío (Code 128)
                </span>
                {/* SVG Barcode visual */}
                <div className="bg-white p-2 rounded-lg border border-slate-200 flex flex-col items-center justify-center">
                  <div className="h-10 w-full flex items-center justify-center gap-0.5 overflow-hidden">
                    {[1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 1, 3, 2].map(
                      (w, i) => (
                        <span
                          key={i}
                          className="h-full bg-slate-950 inline-block"
                          style={{ width: `${w * 1.8}px` }}
                        />
                      )
                    )}
                  </div>
                  <span className="font-mono text-[10px] tracking-widest text-slate-700 mt-1 font-bold">
                    *{order.reference}*
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800 uppercase">Control de Calidad Bodega:</p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                    <span>Costuras & Tela OK</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                    <span>Etiquetas OPUS</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                    <span>Pack de Stickers</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Totals Table */}
            <div className="w-full sm:w-5/12 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Subtotal Prendas:</span>
                <span className="font-bold text-slate-900">${formatCOP(order.subtotalInCents)} COP</span>
              </div>

              {order.discountInCents > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-600">
                  <span>Descuento Cupón {order.appliedCoupon ? `(${order.appliedCoupon})` : ''}:</span>
                  <span className="font-bold">-${formatCOP(order.discountInCents)} COP</span>
                </div>
              )}

              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Costo de Envío Nacional:</span>
                <span className="font-bold text-slate-900">
                  {shipping === 0 ? '¡GRATIS!' : `$${formatCOP(shipping)} COP`}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500 text-[11px]">
                <span>Base Gravable (Excl. IVA):</span>
                <span>${formatCOP(netBeforeTax)} COP</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500 text-[11px]">
                <span>IVA 19% Discriminado:</span>
                <span>${formatCOP(ivaAmount)} COP</span>
              </div>

              <div className="flex justify-between py-2.5 bg-slate-100 px-3 rounded-xl text-slate-950 font-black text-sm">
                <span>TOTAL LIQUIDADO:</span>
                <span className="text-indigo-700">${formatCOP(total)} COP</span>
              </div>

              <div className="text-[10px] text-slate-500 pt-1">
                Método de Pago: <strong>{order.wompiTransaction?.paymentMethod || (order as any).paymentMethod || 'Wompi Tarjeta/PSE'}</strong> • Transacción: {order.wompiTransaction?.transactionId || (order as any).wompiTransactionId || 'TX-WOMPI-APROBADA'}
              </div>
            </div>
          </div>

          {/* Legal Notice Footer */}
          <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-500 space-y-1 leading-normal">
            <p>
              <strong>Estatuto del Consumidor (Ley 1480 de 2011):</strong> Esta remisión/factura ampara la garantía 
              de 30 días calendario por calidad de manufactura y el derecho de retracto dentro de los 5 días hábiles siguientes 
              a la entrega. Para solicitar cambio de talla gratuito a domicilio, contacta a nuestra línea oficial WhatsApp: 
              <strong> {storePreferences.supportPhoneWhatsApp}</strong> o al correo <strong>{storePreferences.supportEmail}</strong>.
            </p>
            <p className="text-slate-400 font-mono">
              Generado automáticamente por TU TIENDA A LA MANO • OS v2.4 • Medellín, Colombia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
