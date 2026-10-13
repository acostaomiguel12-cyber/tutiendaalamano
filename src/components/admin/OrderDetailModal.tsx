import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  MapPin,
  Mail,
  Phone,
  Package,
  ExternalLink,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  MessageSquare,
  PackageCheck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import { ShippingStatus } from '../../types';
import { buildWhatsAppDirectUrl } from '../../lib/whatsappBusiness';

export const OrderDetailModal: React.FC = () => {
  const {
    selectedOrderForDetail,
    setSelectedOrderForDetail,
    setPrintableInvoiceOrder,
    updateShippingStatus,
    updateOrderStatus,
    sendOrderWhatsAppNotification,
    whatsappConfig,
    showToast,
  } = useStore();

  const [trackingInput, setTrackingInput] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  if (!selectedOrderForDetail) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast(`${label} copiado al portapapeles`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePrint = () => {
    setPrintableInvoiceOrder(selectedOrderForDetail);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => setSelectedOrderForDetail(null)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-slide-left">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/50 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                TRAZABILIDAD EN VIVO WOMPI
              </span>
              <span className="text-[10px] font-mono text-slate-500 font-bold">
                ID: {selectedOrderForDetail.id}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
              {selectedOrderForDetail.reference}
            </h3>
            <span className="text-xs text-slate-500 block mt-0.5">
              Registrado el: {new Date(selectedOrderForDetail.createdAt).toLocaleString('es-CO')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              title="Imprimir resumen / guía"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedOrderForDetail(null)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Status & Wompi Transaction Box */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                Estado de Transacción Wompi
              </span>
              <span
                className={`font-black px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 shadow-xs ${
                  selectedOrderForDetail.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : selectedOrderForDetail.status === 'PENDING'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {selectedOrderForDetail.status === 'APPROVED' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : selectedOrderForDetail.status === 'PENDING' ? (
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>{selectedOrderForDetail.status}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">
                  ID Transacción Wompi
                </span>
                <span className="text-slate-900 font-bold font-mono text-xs">
                  {selectedOrderForDetail.wompiTransaction?.transactionId || 'tr_wompi_live_001'}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">
                  Método de Pago
                </span>
                <span className="text-indigo-600 font-bold font-sans text-xs">
                  {selectedOrderForDetail.wompiTransaction?.paymentMethod || 'Wompi Checkout / PSE'}
                </span>
              </div>
            </div>

            {/* Signature Hash */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Firma SHA-256 de Integridad Wompi
                </span>
                <button
                  onClick={() =>
                    handleCopy(
                      selectedOrderForDetail.wompiTransaction?.signature ||
                        '8f9b2ca934f82a1705e41b8a1c990d1f7e8a93e1104e76d91023910c2837192a',
                      'Firma SHA-256'
                    )
                  }
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-sans cursor-pointer"
                >
                  {copiedField === 'Firma SHA-256' ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>Copiar Hash</span>
                </button>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200 text-[10px] text-slate-600 break-all select-all font-mono">
                {selectedOrderForDetail.wompiTransaction?.signature ||
                  '8f9b2ca934f82a1705e41b8a1c990d1f7e8a93e1104e76d91023910c2837192a'}
              </div>
            </div>
          </div>

          {/* Customer and Shipping Details */}
          <div className="space-y-2 text-xs">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>Datos del Comprador</span>
            </h4>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Cliente:</span>
                <span className="font-bold text-slate-900">{selectedOrderForDetail.customer.fullName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">C.C. / Documento:</span>
                <span className="font-mono text-slate-700">{selectedOrderForDetail.customer.documentId || '1.020.394.102'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="font-mono text-indigo-600">{selectedOrderForDetail.customer.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Teléfono:</span>
                <span className="font-mono text-slate-800">+57 {selectedOrderForDetail.customer.phone}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-start justify-between gap-4">
                <span className="text-slate-500 font-medium shrink-0">Dirección de Entrega:</span>
                <span className="font-semibold text-slate-800 text-right">
                  {selectedOrderForDetail.customer.address}, {selectedOrderForDetail.customer.neighborhood} <br />
                  <span className="text-slate-500 font-normal">
                    {selectedOrderForDetail.customer.city}, {selectedOrderForDetail.customer.department}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-2 text-xs">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
              Productos de la orden ({selectedOrderForDetail.items.length})
            </h4>
            <div className="space-y-2 divide-y divide-slate-100 bg-white border border-slate-200 rounded-2xl p-4">
              {selectedOrderForDetail.items.map((it) => (
                <div key={it.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={it.image}
                      alt={it.productTitle}
                      className="w-12 h-14 object-cover rounded-xl border border-slate-200"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">{it.productTitle}</span>
                      <span className="text-[11px] text-slate-500 block">
                        Talla: <strong className="text-slate-700">{it.selectedSize}</strong> • Color:{' '}
                        <strong className="text-slate-700">{it.selectedColor}</strong> • Cant:{' '}
                        <strong className="text-slate-700">{it.quantity}</strong>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        SKU: {it.productId}-{it.selectedSize}
                      </span>
                    </div>
                  </div>
                  <span className="font-black text-slate-900 font-mono text-xs shrink-0">
                    ${formatCOP(it.totalPriceInCents)} COP
                  </span>
                </div>
              ))}

              <div className="pt-3.5 space-y-1 text-slate-600 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono">
                    ${formatCOP(selectedOrderForDetail.totalAmountInCents - selectedOrderForDetail.shippingCostInCents)} COP
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Envío Nacional:</span>
                  <span className="font-mono">
                    ${formatCOP(selectedOrderForDetail.shippingCostInCents)} COP
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>IVA Incluido (19%):</span>
                  <span className="font-mono">
                    ${formatCOP(selectedOrderForDetail.taxInCents)} COP
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-900 font-black text-sm">
                  <span>Total Pagado:</span>
                  <span className="font-mono text-indigo-600 text-base">
                    ${formatCOP(selectedOrderForDetail.totalAmountInCents)} COP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Logistics & Tracking Updater */}
          <div className="space-y-3 text-xs pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>Despacho & Guía de Envío</span>
              </h4>
              <span className="text-[10px] font-bold text-slate-500">
                Transportadora: {selectedOrderForDetail.carrier || 'Coordinadora Mercantil'}
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Número de Guía (ej. 78291048201)"
                defaultValue={selectedOrderForDetail.trackingNumber || ''}
                onChange={(e) => setTrackingInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold focus:bg-white focus:outline-hidden focus:border-indigo-500 transition-all"
              />
              <button
                onClick={() => {
                  const guide = trackingInput.trim() || selectedOrderForDetail.trackingNumber || `GUI-${Date.now().toString().slice(-8)}`;
                  updateShippingStatus(selectedOrderForDetail.id, 'SHIPPED', guide);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Marcar ENVIADO</span>
              </button>
              <button
                onClick={() => {
                  updateShippingStatus(selectedOrderForDetail.id, 'DELIVERED', selectedOrderForDetail.trackingNumber);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>Marcar ENTREGADO</span>
              </button>
            </div>

            {/* WhatsApp Direct & Auto Dispatch Panel */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>Notificación WhatsApp Business</span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-mono">
                      {whatsappConfig.autoSendOnShipped ? 'Auto-Envío Activo' : 'Manual'}
                    </span>
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Destino: {selectedOrderForDetail.customer.phone} ({selectedOrderForDetail.customer.fullName})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  disabled={isSendingWhatsApp}
                  onClick={async () => {
                    setIsSendingWhatsApp(true);
                    const isDelivered = selectedOrderForDetail.shippingStatus === 'DELIVERED';
                    const eventType = isDelivered ? 'ORDER_DELIVERED' : 'ORDER_SHIPPED';
                    const res = await sendOrderWhatsAppNotification(
                      selectedOrderForDetail.id,
                      eventType,
                      selectedOrderForDetail.carrier,
                      selectedOrderForDetail.trackingNumber
                    );
                    setIsSendingWhatsApp(false);
                    if (res) {
                      showToast(`📲 WhatsApp enviado a ${selectedOrderForDetail.customer.fullName}`);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isSendingWhatsApp ? 'Enviando...' : 'Reenviar WhatsApp'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 sticky bottom-0">
          <span className="text-[11px] text-slate-500">
            Comprobante fiscal e historial sincronizado con pasarela Wompi.
          </span>
          <button
            onClick={() => setSelectedOrderForDetail(null)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
};
