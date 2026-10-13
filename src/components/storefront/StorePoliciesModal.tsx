import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  Truck,
  RotateCcw,
  Ruler,
  CheckCircle2,
  ExternalLink,
  Phone,
  Mail,
  Lock,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PolicyModalTab } from '../../types';

export const StorePoliciesModal: React.FC = () => {
  const { policyModalState, closePolicyModal, storePreferences } = useStore();

  const [activeTab, setActiveTab] = useState<PolicyModalTab>(
    policyModalState.activeTab || 'terminos'
  );

  // Sync state if opened with a specific tab
  React.useEffect(() => {
    if (policyModalState.activeTab) {
      setActiveTab(policyModalState.activeTab);
    }
  }, [policyModalState.activeTab]);

  if (!policyModalState.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={closePolicyModal}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 font-mono">
                  CENTRO LEGAL & ATENCIÓN AL CLIENTE
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  🇨🇴 Ley Colombiana
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Políticas Oficiales {storePreferences.storeBrandName}
              </h2>
            </div>
          </div>

          <button
            onClick={closePolicyModal}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-100/50 p-2 gap-1.5 scrollbar-thin">
          <button
            onClick={() => setActiveTab('terminos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'terminos'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Términos y Condiciones</span>
          </button>

          <button
            onClick={() => setActiveTab('privacidad')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'privacidad'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Habeas Data (Ley 1581)</span>
          </button>

          <button
            onClick={() => setActiveTab('envios')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'envios'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Envíos Nacionales</span>
          </button>

          <button
            onClick={() => setActiveTab('garantias')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'garantias'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Garantías & Retracto</span>
          </button>

          <button
            onClick={() => setActiveTab('tallas')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'tallas'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Guía de Tallas (450 GSM)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed scrollbar-thin">
          {activeTab === 'terminos' && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">
                  Términos y Condiciones de Uso y Compra
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Última actualización: Enero 2026 • Razón Social: {storePreferences.storeLegalName} ({storePreferences.nitRUT})
                </p>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <p>
                  Bienvenido a la plataforma de comercio electrónico oficial de <strong>{storePreferences.storeBrandName}</strong>. 
                  Al acceder, navegar o realizar transacciones en este sitio web, usted declara ser mayor de 18 años de edad y acepta 
                  quedar vinculado por los siguientes términos de servicio conforme a las leyes de la República de Colombia.
                </p>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    1. Procesamiento de Pagos Seguros con Wompi
                  </h4>
                  <p className="text-xs text-slate-600">
                    Todas las transacciones en Pesos Colombianos (COP) son procesadas a través de la pasarela de pagos 
                    <strong> Wompi (Bancolombia S.A.)</strong> mediante certificados SSL de 256 bits y protocolos 3D Secure. 
                    Nuestra tienda <strong>nunca almacena ni tiene acceso</strong> a los números completos de sus tarjetas de crédito o credenciales bancarias.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    2. Disponibilidad y Ediciones Limitadas
                  </h4>
                  <p className="text-xs text-slate-600">
                    Nuestras colecciones y productos se producen en lotes de edición limitada con materiales de alto gramaje. 
                    Agregar un producto al carrito de compras no garantiza la reserva del inventario hasta que la pasarela de pagos 
                    emita el estado <strong>APROBADO</strong>. En caso de sobreventa fortuita, se contactará al comprador de inmediato para cambio o reembolso del 100%.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    3. Precios y Facturación
                  </h4>
                  <p className="text-xs text-slate-600">
                    Todos los precios publicados en la tienda están expresados en Pesos Colombianos (COP) e incluyen el Impuesto 
                    sobre las Ventas (IVA) aplicable. Se emite factura proforma electrónica por cada orden completada.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacidad' && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">
                  Política de Tratamiento de Datos Personales (Habeas Data)
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  En estricto cumplimiento de la Ley Estatutaria 1581 de 2012 y el Decreto Reglamentario 1377 de 2013 de Colombia.
                </p>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <p>
                  <strong>{storePreferences.storeLegalName}</strong>, identificada con {storePreferences.nitRUT}, 
                  con domicilio principal en {storePreferences.city}, es la responsable del tratamiento de los datos personales 
                  suministrados por los usuarios en esta tienda.
                </p>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Finalidades de la Recolección de Datos:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                    <li>Procesar y validar las órdenes de compra y facturación electrónica.</li>
                    <li>Generar las guías de transporte nacional con Coordinadora, Servientrega o Inter Rapidísimo.</li>
                    <li>Enviar notificaciones sobre el estado del pedido y número de guía vía WhatsApp o Correo electrónico.</li>
                    <li>Atender solicitudes de soporte, garantías y cambios de talla.</li>
                    <li>Enviar novedades y accesos anticipados a nuevos lanzamientos exclusivamente si el usuario lo autoriza.</li>
                  </ul>
                </div>

                <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 space-y-1.5">
                  <h4 className="font-bold text-indigo-950 text-xs uppercase tracking-wider">
                    Derechos del Titular (ARCO):
                  </h4>
                  <p className="text-xs text-indigo-900">
                    Usted tiene derecho a conocer, actualizar, rectificar y suprimir sus datos en cualquier momento. Para ejercer 
                    estos derechos, puede enviar una solicitud a nuestro correo oficial: 
                    <strong className="ml-1 text-indigo-700">{storePreferences.supportEmail}</strong> o contactar a nuestra línea 
                    WhatsApp <strong className="text-indigo-700">{storePreferences.supportPhoneWhatsApp}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'envios' && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">
                  Política de Envíos, Cobertura y Tiempos de Entrega
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Despachos directos desde bodega central en Medellín, Antioquia hacia toda Colombia.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Medellín & Valle de Aburrá</span>
                  <p className="text-lg font-black text-slate-900">24 a 48 Horas</p>
                  <span className="text-[11px] text-emerald-600 font-bold block">Entrega Express Local</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Ciudades Principales</span>
                  <p className="text-lg font-black text-slate-900">2 a 3 Días Hábiles</p>
                  <span className="text-[11px] text-slate-500 block">Bogotá, Cali, Barranquilla, Buc.</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Trayectos Especiales</span>
                  <p className="text-lg font-black text-slate-900">3 a 5 Días Hábiles</p>
                  <span className="text-[11px] text-slate-500 block">Poblaciones y Municipios</span>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
                  <Truck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                      ¡Envío Gratis en Compras Superiores a $200.000 COP!
                    </p>
                    <p className="text-xs text-emerald-800">
                      Aplica automáticamente en el checkout para cualquier destino en Colombia. Para compras inferiores, la tarifa estándar de envío es de $14.000 COP.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Transportadoras Aliadas y Rastreo en Tiempo Real
                  </h4>
                  <p className="text-xs text-slate-600">
                    Operamos con <strong>Coordinadora Mercantil</strong>, <strong>Servientrega</strong> e <strong>Inter Rapidísimo</strong>. 
                    Una vez generado el despacho, recibirá un SMS y correo con el número de guía para rastreo en vivo 24/7.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'garantias' && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">
                  Garantía Legal, Cambios y Derecho de Retracto
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Estatuto del Consumidor (Ley 1480 de 2011) y política de satisfacción {storePreferences.storeBrandName}.
                </p>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">
                      1. Garantía de Calidad: 30 Días Calendario
                    </h4>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      100% Cubierto
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Todas nuestras prendas 450 GSM y productos premium cuentan con garantía de 30 días contra cualquier 
                    defecto de costura, cremalleras, desprendimiento de broches o inconsistencias en la tela. Se repondrá la 
                    producto por uno nuevo sin costo de transporte para el cliente.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">
                      2. Primer Cambio de Talla Gratuito
                    </h4>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      Sin Costo Adicional
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Si el producto no le quedó en la talla deseada, gestionamos el primer cambio de talla con recogida y entrega 
                    a domicilio gratis dentro de los primeros 15 días tras recibir el pedido. El producto debe estar sin uso, con 
                    etiquetas originales y en su empaque.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">
                    3. Derecho de Retracto (Artículo 47, Ley 1480 de 2011)
                  </h4>
                  <p className="text-xs text-slate-600">
                    El consumidor tiene derecho a retractarse de la compra dentro de los <strong>cinco (5) días hábiles</strong> siguientes 
                    a la entrega del producto. El cliente debe devolver el producto en el mismo estado en que lo recibió, y se le 
                    reembolsará el 100% de su dinero sin retenciones ni penalidades en un plazo máximo de 15 días hábiles.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tallas' && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">
                  Guía Oficial de Tallas y Gramajes Heavyweight (450 GSM)
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Medidas exactas en centímetros. Corte Boxy Oversized Streetwear.
                </p>
              </div>

              {/* Table Hoodies */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-indigo-700 tracking-wider">
                  Hoodies & Buzos Heavyweight (450 GSM Algodón Peinado)
                </span>
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-black">
                      <tr>
                        <th className="p-3">Talla</th>
                        <th className="p-3">Pecho (Ancho)</th>
                        <th className="p-3">Largo Total</th>
                        <th className="p-3">Manga</th>
                        <th className="p-3">Estatura Sugerida</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      <tr>
                        <td className="p-3 font-bold text-slate-900 font-sans">S</td>
                        <td className="p-3">58 cm</td>
                        <td className="p-3">68 cm</td>
                        <td className="p-3">60 cm</td>
                        <td className="p-3 text-slate-500">1.60 - 1.70 m</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900 font-sans">M</td>
                        <td className="p-3">62 cm</td>
                        <td className="p-3">71 cm</td>
                        <td className="p-3">62 cm</td>
                        <td className="p-3 text-slate-500">1.70 - 1.78 m</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900 font-sans">L</td>
                        <td className="p-3">66 cm</td>
                        <td className="p-3">74 cm</td>
                        <td className="p-3">64 cm</td>
                        <td className="p-3 text-slate-500">1.78 - 1.86 m</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900 font-sans">XL</td>
                        <td className="p-3">70 cm</td>
                        <td className="p-3">77 cm</td>
                        <td className="p-3">66 cm</td>
                        <td className="p-3 text-slate-500">1.85 m +</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tip box */}
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs space-y-1">
                <p className="font-bold">💡 Consejo de ajuste oversize:</p>
                <p>
                  Nuestras prendas ya vienen diseñadas con caída amplia y hombros caídos (Drop Shoulder). Si buscas un look 
                  oversize auténtico, pide tu <strong>talla habitual</strong>. Si prefieres un corte más ajustado al cuerpo, pide una talla menos.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-500">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {storePreferences.supportPhoneWhatsApp}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {storePreferences.supportEmail}
            </span>
          </div>

          <button
            onClick={closePolicyModal}
            className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition-all cursor-pointer shadow-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
