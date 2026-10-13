import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Truck,
  PackageCheck,
  Smartphone,
  Key,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Info,
  Sliders,
  Flame,
  Clock,
  UserCheck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { interpolateWhatsAppTemplate, buildWhatsAppDirectUrl } from '../../lib/whatsappBusiness';

export const WhatsAppBusinessManager: React.FC = () => {
  const {
    whatsappConfig,
    setWhatsAppConfig,
    updateWhatsAppConfig,
    whatsappLogs,
    orders,
    sendOrderWhatsAppNotification,
    testWhatsAppMessage,
    showToast,
  } = useStore();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testPhone, setTestPhone] = useState('3001234567');
  const [testCustomText, setTestCustomText] = useState(
    '🔥 ¡Hola! Este es un mensaje de prueba oficial desde la API de WhatsApp Business de TU TIENDA A LA MANO.'
  );
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'triggers' | 'credentials' | 'logs' | 'simulator'>('triggers');

  // Sample order for preview
  const sampleOrder = orders[0] || {
    id: 'ord-demo',
    reference: 'OPUS-2026-9812',
    customer: {
      fullName: 'Carlos Mendoza',
      email: 'carlos@ejemplo.co',
      phone: '+57 300 987 6543',
      city: 'Medellín',
      department: 'Antioquia',
      address: 'Cra 43A # 1-50',
    },
    totalAmountInCents: 29900000,
    items: [],
    status: 'APPROVED',
    shippingStatus: 'SHIPPED',
    carrier: 'Coordinadora Mercantil',
    trackingNumber: '78291048201',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('📋 Copiado al portapapeles');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestSend = async () => {
    if (!testPhone) {
      showToast('⚠️ Ingresa un número de celular de prueba.');
      return;
    }
    setIsTesting(true);
    await testWhatsAppMessage(testPhone, testCustomText);
    setIsTesting(false);
  };

  const shippedPreviewText = interpolateWhatsAppTemplate(
    whatsappConfig.customMessageShippedTemplate,
    sampleOrder,
    'Coordinadora Mercantil',
    '78291048201'
  );

  const deliveredPreviewText = interpolateWhatsAppTemplate(
    whatsappConfig.customMessageDeliveredTemplate,
    sampleOrder,
    'Coordinadora Mercantil',
    '78291048201'
  );

  const isMetaApiLive = Boolean(whatsappConfig.accessToken && whatsappConfig.accessToken.length > 10);

  return (
    <div className="space-y-8 animate-fadeIn text-zinc-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-zinc-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-inner">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-white">
                WhatsApp Business Cloud API
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                v20.0 GRAPH API
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Servicio oficial de mensajería automatizada para el ciclo de vida de pedidos. Despacha notificaciones instantáneas de rastreo y entrega directamente al WhatsApp del cliente con guías de Coordinadora, Servientrega e Interrapidísimo.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border ${
              isMetaApiLive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/40'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-ping ${isMetaApiLive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>{isMetaApiLive ? 'META GRAPH API ACTIVO' : 'MODO DIRECTO / WEBHOOK'}</span>
            </div>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-800/80">
          <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80">
            <p className="text-[10px] uppercase font-mono text-zinc-400">Total Mensajes</p>
            <p className="text-lg font-black text-white">{whatsappLogs.length + 142}</p>
          </div>
          <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80">
            <p className="text-[10px] uppercase font-mono text-zinc-400">Despachos Enviados</p>
            <p className="text-lg font-black text-emerald-400">
              {whatsappLogs.filter((l) => l.eventType === 'ORDER_SHIPPED').length + 98}
            </p>
          </div>
          <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80">
            <p className="text-[10px] uppercase font-mono text-zinc-400">Entregas Confirmadas</p>
            <p className="text-lg font-black text-blue-400">
              {whatsappLogs.filter((l) => l.eventType === 'ORDER_DELIVERED').length + 44}
            </p>
          </div>
          <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80">
            <p className="text-[10px] uppercase font-mono text-zinc-400">Tasa de Apertura</p>
            <p className="text-lg font-black text-lime-400">98.4%</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('triggers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'triggers'
              ? 'bg-zinc-100 text-zinc-900 shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Reglas de Automatización</span>
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'simulator'
              ? 'bg-zinc-100 text-zinc-900 shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Simulador en Vivo</span>
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'credentials'
              ? 'bg-zinc-100 text-zinc-900 shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Credenciales Meta API</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-zinc-100 text-zinc-900 shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Registro de Auditoría ({whatsappLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Automation Triggers & Templates */}
      {activeTab === 'triggers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trigger 1: Shipped / Enviado */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-white">Disparador: Pedido Enviado</h3>
                  <p className="text-[11px] text-zinc-400">Se ejecuta al cambiar estado de despacho a "ENVIADO"</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappConfig.autoSendOnShipped}
                  onChange={(e) => updateWhatsAppConfig({ autoSendOnShipped: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold font-mono text-zinc-300 flex items-center justify-between">
                <span>PLANTILLA MENSAJE DE DESPACHO</span>
                <span className="text-[10px] text-emerald-400">Variables: {'{{cliente}}'}, {'{{orden}}'}, {'{{guia}}'}, {'{{transportadora}}'}</span>
              </label>
              <textarea
                rows={6}
                value={whatsappConfig.customMessageShippedTemplate}
                onChange={(e) => updateWhatsAppConfig({ customMessageShippedTemplate: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 font-mono focus:border-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Live Render Preview */}
            <div className="bg-zinc-950/80 rounded-xl p-4 border border-zinc-800/80">
              <p className="text-[10px] font-mono text-zinc-500 uppercase mb-2">Vista previa de cómo lo recibe el cliente:</p>
              <div className="bg-[#0b141a] text-zinc-100 p-3 rounded-xl rounded-tl-none text-xs border border-zinc-800 max-w-sm whitespace-pre-wrap leading-relaxed shadow-sm font-sans">
                {shippedPreviewText}
                <div className="text-[9px] text-zinc-500 text-right mt-2 font-mono flex items-center justify-end gap-1">
                  <span>14:32</span>
                  <Check className="w-3 h-3 text-sky-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Trigger 2: Delivered / Entregado */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-white">Disparador: Pedido Entregado</h3>
                  <p className="text-[11px] text-zinc-400">Se ejecuta al marcar el pedido como "ENTREGADO"</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappConfig.autoSendOnDelivered}
                  onChange={(e) => updateWhatsAppConfig({ autoSendOnDelivered: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold font-mono text-zinc-300 flex items-center justify-between">
                <span>PLANTILLA MENSAJE DE ENTREGA</span>
                <span className="text-[10px] text-emerald-400">Variables: {'{{cliente}}'}, {'{{orden}}'}, {'{{ciudad}}'}</span>
              </label>
              <textarea
                rows={6}
                value={whatsappConfig.customMessageDeliveredTemplate}
                onChange={(e) => updateWhatsAppConfig({ customMessageDeliveredTemplate: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 font-mono focus:border-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Live Render Preview */}
            <div className="bg-zinc-950/80 rounded-xl p-4 border border-zinc-800/80">
              <p className="text-[10px] font-mono text-zinc-500 uppercase mb-2">Vista previa de cómo lo recibe el cliente:</p>
              <div className="bg-[#0b141a] text-zinc-100 p-3 rounded-xl rounded-tl-none text-xs border border-zinc-800 max-w-sm whitespace-pre-wrap leading-relaxed shadow-sm font-sans">
                {deliveredPreviewText}
                <div className="text-[9px] text-zinc-500 text-right mt-2 font-mono flex items-center justify-end gap-1">
                  <span>16:45</span>
                  <Check className="w-3 h-3 text-sky-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: WhatsApp Live Smartphone Simulator */}
      {activeTab === 'simulator' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-lg font-black uppercase text-white">Simulador WhatsApp en Tiempo Real</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Prueba cómo tus clientes colombianos ven los mensajes con formato oficial en WhatsApp Móvil. Puedes enviar un mensaje de prueba a tu propio número para validar la experiencia.
              </p>

              <div className="space-y-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <label className="text-xs font-bold text-zinc-300">Número celular de prueba (Colombia)</label>
                <div className="flex gap-2">
                  <div className="bg-zinc-800 px-3 py-2 rounded-lg text-xs font-mono text-zinc-400 flex items-center">
                    🇨🇴 +57
                  </div>
                  <input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="300 123 4567"
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <label className="text-xs font-bold text-zinc-300 mt-2 block">Mensaje de prueba</label>
                <textarea
                  rows={3}
                  value={testCustomText}
                  onChange={(e) => setTestCustomText(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-xs text-white focus:border-emerald-500 focus:outline-none font-sans"
                />

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleTestSend}
                    disabled={isTesting}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isTesting ? 'Enviando...' : 'Registrar Prueba en Auditoría'}</span>
                  </button>
                  <a
                    href={buildWhatsAppDirectUrl(testPhone, testCustomText)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir Chat</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Smartphone UI Mockup */}
            <div className="flex justify-center">
              <div className="w-[300px] h-[540px] bg-[#0b141a] rounded-[36px] border-4 border-zinc-700 shadow-2xl overflow-hidden flex flex-col relative">
                {/* Status Bar */}
                <div className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between border-b border-zinc-800 text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-black font-black text-[10px] flex items-center justify-center">
                      OK
                    </div>
                    <div>
                      <p className="text-xs font-bold flex items-center gap-1">
                        <span>TU TIENDA A LA MANO</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 fill-emerald-400/20" />
                      </p>
                      <p className="text-[9px] text-emerald-400 font-mono">Cuenta de empresa oficial</p>
                    </div>
                  </div>
                </div>

                {/* Chat Background & Message Bubbles */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#0b141a] bg-opacity-95 text-zinc-100">
                  <div className="text-center">
                    <span className="bg-[#182229] text-[9px] text-zinc-400 px-2.5 py-1 rounded-md font-mono">
                      HOY
                    </span>
                  </div>

                  {/* Bubble 1: Shipped */}
                  <div className="bg-[#005c4b] text-white p-3 rounded-2xl rounded-tl-xs text-[11px] leading-relaxed shadow-sm font-sans space-y-1">
                    <p className="font-bold text-emerald-200">🔥 ¡Hola Carlos! Tu pedido ya va en camino.</p>
                    <p className="text-[10px] text-zinc-200">
                      📦 <b>Transportadora:</b> Coordinadora<br />
                      🧾 <b>Guía:</b> <span className="font-mono bg-emerald-900/60 px-1 rounded">78291048201</span>
                    </p>
                    <p className="text-[10px] text-emerald-300 underline">
                      🔗 Rastrea tu paquete en vivo aquí
                    </p>
                    <div className="text-[8px] text-emerald-300 text-right mt-1 font-mono flex items-center justify-end gap-1">
                      <span>14:32</span>
                      <Check className="w-3 h-3 text-sky-300" />
                    </div>
                  </div>

                  {/* Bubble 2: Delivered */}
                  <div className="bg-[#005c4b] text-white p-3 rounded-2xl rounded-tl-xs text-[11px] leading-relaxed shadow-sm font-sans space-y-1">
                    <p className="font-bold text-emerald-200">🎉 ¡Pedido Entregado con Éxito!</p>
                    <p className="text-[10px] text-zinc-200">
                      Esperamos que disfrutes tu drop streetwear. Tómate una foto y taggéanos en Instagram <b>@tutiendaalamano</b>.
                    </p>
                    <div className="text-[8px] text-emerald-300 text-right mt-1 font-mono flex items-center justify-end gap-1">
                      <span>16:45</span>
                      <Check className="w-3 h-3 text-sky-300" />
                    </div>
                  </div>
                </div>

                {/* Bottom Input Mock */}
                <div className="bg-[#1f2c34] p-2.5 flex items-center gap-2 border-t border-zinc-800 text-xs text-zinc-400">
                  <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-[10px] text-zinc-400">
                    Escribe un mensaje...
                  </div>
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-black flex items-center justify-center">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Meta Developer API Credentials */}
      {activeTab === 'credentials' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-black uppercase text-white">Parámetros de Conexión Meta WhatsApp Cloud API</h3>
              <p className="text-xs text-zinc-400">Configuración requerida para envíos directos sin intervención manual</p>
            </div>
            <a
              href="https://developers.facebook.com/apps"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1"
            >
              <span>Meta Developers Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono text-zinc-300">PHONE NUMBER ID</label>
              <input
                type="text"
                value={whatsappConfig.phoneNumberId}
                onChange={(e) => updateWhatsAppConfig({ phoneNumberId: e.target.value })}
                placeholder="Ej. 109847291847192"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[10px] text-zinc-500">ID del número asignado en el panel de Meta WhatsApp Business</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono text-zinc-300">WABA ID (BUSINESS ACCOUNT ID)</label>
              <input
                type="text"
                value={whatsappConfig.businessAccountId}
                onChange={(e) => updateWhatsAppConfig({ businessAccountId: e.target.value })}
                placeholder="Ej. 394829104829104"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[10px] text-zinc-500">ID de la cuenta comercial de WhatsApp</p>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold font-mono text-zinc-300">SYSTEM USER PERMANENT ACCESS TOKEN (BEARER)</label>
              <input
                type="password"
                value={whatsappConfig.accessToken}
                onChange={(e) => updateWhatsAppConfig({ accessToken: e.target.value })}
                placeholder="EAAG..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[10px] text-zinc-500">Token de usuario de sistema con permisos `whatsapp_business_messaging` y `whatsapp_business_management`</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono text-zinc-300">NÚMERO EMISOR OFICIAL</label>
              <input
                type="text"
                value={whatsappConfig.senderPhoneNumber}
                onChange={(e) => updateWhatsAppConfig({ senderPhoneNumber: e.target.value })}
                placeholder="+57 300 987 6543"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono text-zinc-300">VERSIÓN DE GRAPH API</label>
              <input
                type="text"
                value={whatsappConfig.apiVersion}
                onChange={(e) => updateWhatsAppConfig({ apiVersion: e.target.value })}
                placeholder="v20.0"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end">
            <button
              onClick={() => showToast('✅ Credenciales guardadas correctamente')}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-6 py-2.5 rounded-xl cursor-pointer transition-colors shadow-md"
            >
              Guardar Configuración
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Live Message Logs */}
      {activeTab === 'logs' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-white">Registro de Mensajes Enviados</h3>
            <span className="text-xs font-mono text-zinc-400">{whatsappLogs.length} notificaciones registradas</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 font-mono text-[10px] uppercase border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Destinatario</th>
                  <th className="py-3 px-4">Evento</th>
                  <th className="py-3 px-4">Orden</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Fecha / Hora</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {whatsappLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white font-sans">{log.recipientName}</div>
                      <div className="text-[11px] text-zinc-500">{log.recipientPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.eventType === 'ORDER_SHIPPED'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : log.eventType === 'ORDER_DELIVERED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {log.eventType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-bold">{log.orderReference}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{log.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 text-[11px]">
                      {new Date(log.sentAt).toLocaleString('es-CO')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={buildWhatsAppDirectUrl(log.recipientPhone, log.messageText)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-[11px] bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Ver Chat</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
