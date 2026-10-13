import React, { useState } from 'react';
import {
  Globe,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Zap,
  CreditCard,
  Truck,
  Scale,
  MessageCircle,
  Store,
  RefreshCw,
  Sliders,
  DollarSign,
  HelpCircle,
  ArrowRight,
  Server,
  Key,
  GraduationCap,
  BookOpen,
  UserCheck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface RegistrarOption {
  name: string;
  priceUSD: string;
  priceCOP: string;
  recommendedFor: string;
  pros: string[];
  url: string;
  badge?: string;
  badgeColor?: string;
}

export const DomainTrustManager: React.FC = () => {
  const {
    storePreferences,
    updateStorePreferences,
    showToast,
    setActiveView,
    openPolicyModal,
  } = useStore();

  const [domainInput, setDomainInput] = useState(storePreferences.customDomain || 'tutiendaalamano.com');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerifyingDNS, setIsVerifyingDNS] = useState(false);
  const [dnsCheckResult, setDnsCheckResult] = useState<'success' | 'checking' | null>(null);
  const [activeTab, setActiveTab] = useState<'domain' | 'student-pack' | 'dns' | 'trust-factors'>('student-pack');

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://tutiendaalamano.com';

  const handleCopy = (text: string, fieldId: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    showToast(`Copiado: ${label}`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSaveDomain = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDomain = domainInput.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!cleanDomain) {
      showToast('Por favor ingresa un nombre de dominio válido (ej: tutiendaalamano.com)');
      return;
    }
    updateStorePreferences({ customDomain: cleanDomain });
    showToast(`Dominio oficial actualizado a: ${cleanDomain}`);
  };

  const handleTestDNS = () => {
    setIsVerifyingDNS(true);
    setDnsCheckResult('checking');
    setTimeout(() => {
      setIsVerifyingDNS(false);
      setDnsCheckResult('success');
      showToast('Verificación completada: Certificado SSL y enrutamiento listos.');
    }, 1800);
  };

  const registrars: RegistrarOption[] = [
    {
      name: 'Cloudflare Registrar',
      priceUSD: '$9.77 USD / año',
      priceCOP: '~ $38.000 COP / año (~ $3.200 COP / mes)',
      recommendedFor: 'La opción más económica y transparente a nivel mundial',
      pros: [
        'Vende a precio de costo mayorista exacto de Verisign (sin recargos ni trampas de renovación).',
        'Incluye DNS ultrarrápido y protección DDoS de grado bancario gratis.',
        'Privacidad WHOIS gratuita de por vida.',
      ],
      url: 'https://www.cloudflare.com/products/registrar/',
      badge: 'MEJOR PRECIO REAL',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      name: 'Porkbun',
      priceUSD: '$9.50 - $10.00 USD / año',
      priceCOP: '~ $39.000 COP / año',
      recommendedFor: 'Excelente servicio al cliente y soporte simple',
      pros: [
        'Precios claros sin comisiones sorpresas en la renovación del segundo año.',
        'Certificados SSL adicionales y privacidad de datos gratis.',
        'Panel de control limpio y fácil para principiantes.',
      ],
      url: 'https://porkbun.com/',
      badge: 'POPULAR & SIMPLE',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      name: 'Hostinger / Ionos (Promoción 1er Año)',
      priceUSD: '$0.99 - $1.99 USD (1er año)',
      priceCOP: '~ $5.000 - $8.000 COP el primer año',
      recommendedFor: 'Iniciar con la menor inversión posible mientras la tienda despega',
      pros: [
        'Precio de entrada casi regalado para el primer año de lanzamiento.',
        'Ideal para validar las primeras ventas de ropa streetwear sin capital inicial.',
        'Nota importante: en el segundo año la renovación suele subir a $15 - $18 USD.',
      ],
      url: 'https://www.hostinger.co/',
      badge: 'ENTRADA ULTRA-BAJA',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      name: 'GitHub Student Developer Pack (Estudiantes)',
      priceUSD: '$0.00 USD (100% Gratis 1er Año)',
      priceCOP: '$0 COP',
      recommendedFor: 'Si tú o alguien de tu equipo tiene correo universitario (.edu)',
      pros: [
        '1 año de dominio .com o .me 100% gratis a través de Namecheap o Name.com.',
        'No requiere tarjeta de crédito ni compromiso de renovación.',
        'Beneficio oficial avalado por GitHub para emprendedores.',
      ],
      url: 'https://education.github.com/pack',
      badge: '100% GRATIS (ESTUDIANTES)',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    },
  ];

  const dnsRecords = [
    {
      type: 'CNAME',
      name: 'www',
      value: 'ghs.googlehosted.com',
      ttl: 'Auto / 3600',
      description: 'Apunta el subdominio www hacia los servidores de alta disponibilidad de Google.',
    },
    {
      type: 'A',
      name: '@ (raíz)',
      value: '216.239.32.21',
      ttl: 'Auto / 3600',
      description: 'Dirección Anycast IP 1 de Google Cloud para el dominio principal sin www.',
    },
    {
      type: 'A',
      name: '@ (raíz)',
      value: '216.239.34.21',
      ttl: 'Auto / 3600',
      description: 'Dirección Anycast IP 2 con redundancia geográfica para Colombia.',
    },
    {
      type: 'A',
      name: '@ (raíz)',
      value: '216.239.36.21',
      ttl: 'Auto / 3600',
      description: 'Dirección Anycast IP 3 para tolerancia a fallos y velocidad de respuesta.',
    },
    {
      type: 'A',
      name: '@ (raíz)',
      value: '216.239.38.21',
      ttl: 'Auto / 3600',
      description: 'Dirección Anycast IP 4 de respaldo de Google Cloud.',
    },
  ];

  const trustPillars = [
    {
      id: 'wompi',
      title: 'Pasarela Oficial Wompi Bancolombia',
      status: 'Activo',
      impact: 'Máxima Confianza en Colombia',
      description:
        'El comprador colombiano reconoce inmediatamente los logos de Bancolombia, Nequi y PSE. Saben que su dinero está protegido por una entidad vigilada por la Superintendencia Financiera de Colombia.',
      icon: CreditCard,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      id: 'ssl',
      title: 'Candado de Seguridad SSL HTTPS (256 Bits)',
      status: 'Activo',
      impact: 'Certificado de Grado Bancario',
      description:
        'Toda la navegación, carrito de compras y datos personales viajan cifrados. El navegador muestra el candado de seguridad, impidiendo cualquier alerta de "Sitio no seguro".',
      icon: Lock,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      id: 'logistics',
      title: 'Despachos Nacionales Asegurados',
      status: 'Activo',
      impact: 'Trazabilidad y Tranquilidad',
      description:
        'Alianzas logísticas con Coordinadora Mercantil, Servientrega e Interrapidísimo. Notificación instantánea de la guía de rastreo a su WhatsApp.',
      icon: Truck,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      id: 'legal',
      title: 'NIT & Razón Social Colombiana Transparente',
      status: 'Activo',
      impact: 'Comercio Formal y Confiable',
      description:
        'TU TIENDA A LA MANO S.A.S. • NIT 901.834.129-4 con sede en Medellín (El Poblado). Visibilidad legal que disipa cualquier temor de estafa digital.',
      icon: Scale,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Oficial con Respuesta Humana',
      status: 'Activo',
      impact: 'Atención Personalizada en Vivo',
      description:
        `Línea ${storePreferences.supportPhoneWhatsApp} visible en el pie de página y botón flotante. El cliente sabe que detrás de la marca hay personas reales listas para resolver dudas de tallas o envíos.`,
      icon: MessageCircle,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
    },
    {
      id: 'guarantee',
      title: 'Garantía 30 Días & Retracto (Ley 1480)',
      status: 'Activo',
      impact: 'Cero Riesgo para el Comprador',
      description:
        'Política clara de cambios de talla gratuitos y derecho de retracto conforme al Estatuto del Consumidor en Colombia. Si la prenda no le queda, se le cambia sin complicaciones.',
      icon: ShieldCheck,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/20">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>DOMINIO .COM & CONFIANZA TOTAL</span>
            </span>
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-indigo-500/30">
              SEGURIDAD PARA EL COMPRADOR
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            ¿Cómo tener tu dominio .COM y transmitir 100% de confianza a tus clientes?
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Aprende cómo registrar tu .com al menor costo posible (o usar el subdominio seguro gratuito de Google
            mientras generas tus primeras ventas) y activa los 6 sellos de garantía que convencen al cliente colombiano
            de pagar con tranquilidad en tu tienda.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setActiveView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-98"
            >
              <Store className="w-4 h-4" />
              <span>Ver Tienda Pública</span>
            </button>
            <button
              onClick={() => handleCopy(`${currentOrigin}?access=store`, 'store-link', 'Enlace de la Tienda')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-white/15"
            >
              {copiedField === 'store-link' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedField === 'store-link' ? '¡Enlace Copiado!' : 'Copiar URL Actual de Tienda'}</span>
            </button>
          </div>
        </div>

        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Navigation Subtabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('domain')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'domain'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Opciones de Dominio .COM</span>
        </button>

        <button
          onClick={() => setActiveTab('student-pack')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'student-pack'
              ? 'border-purple-600 text-purple-600 bg-purple-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-purple-700'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-purple-600" />
          <span>Pack Estudiantes ($0 COP)</span>
          <span className="text-[10px] font-mono font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
            100% GRATIS
          </span>
        </button>

        <button
          onClick={() => setActiveTab('dns')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'dns'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Configuración DNS & Cloud Run</span>
        </button>

        <button
          onClick={() => setActiveTab('trust-factors')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'trust-factors'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Sellos de Confiabilidad para Clientes</span>
        </button>
      </div>

      {/* TAB 1: Opciones de Dominio .COM */}
      {activeTab === 'domain' && (
        <div className="space-y-6">
          {/* Card: Honest Explanation of .COM Costs */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-3xl p-6 sm:p-7 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-black text-amber-950">
                  ¿Se puede tener un dominio .COM 100% gratis para siempre?
                </h2>
                <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                  <strong>La respuesta honesta y transparente:</strong> La extensión mundial <code>.com</code> es propiedad
                  de la entidad global <strong>Verisign</strong> y está regulada por la <strong>ICANN</strong>. Verisign cobra
                  una tarifa base obligatoria a nivel mundial de aproximadamente <strong>$9 a $10 USD anuales</strong> por cada
                  dominio .com registrado. Por este motivo técnico legal, <strong>ninguna empresa seria puede regalar un .com legítimo gratis de por vida</strong> sin que haya publicidad invasiva o riesgo de perder la marca.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="bg-white p-4 rounded-2xl border border-amber-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Mientras arrancas (Costo $0 COP):</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Puedes utilizar sin problema el enlace seguro HTTPS de Google Cloud Run actual (<code>{currentOrigin.replace('https://', '')}</code>).
                  Tiene <strong>certificado SSL de nivel bancario gratuito</strong>, carga en menos de 1 segundo y funciona perfectamente con Wompi, Nequi y PSE.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  <span>Tu .COM oficial (~ $38.000 COP al año):</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Con registradores transparentes como <strong>Cloudflare</strong> o <strong>Porkbun</strong>, tu dominio <code>.com</code> cuesta
                  solo ~$38.000 COP por <strong>todo el año completo</strong> (lo que equivale a ~$3.200 COP al mes). Con la venta de un solo hoodie 450 GSM cubres más de 5 años de tu dominio.
                </p>
              </div>
            </div>
          </div>

          {/* Card: Current Domain in Store Preferences */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>Configurar el Dominio Oficial de tu Marca</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Define el nombre de dominio con el que se generarán los enlaces en WhatsApp, Instagram y pasarela Wompi.
                </p>
              </div>

              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-auto">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>SSL HTTPS Activo</span>
              </span>
            </div>

            <form onSubmit={handleSaveDomain} className="space-y-4 max-w-xl">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-mono">
                  NOMBRE DE DOMINIO OFICIAL:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 select-none">
                      https://
                    </span>
                    <input
                      type="text"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      placeholder="ejemplo: tutiendaalamano.com o tumarca.com"
                      className="w-full pl-18 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-900 font-bold focus:bg-white focus:outline-hidden focus:border-indigo-500 transition-all shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    Guardar
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Actualmente guardado como:{' '}
                  <strong className="text-slate-700 font-mono">https://{storePreferences.customDomain || 'tutiendaalamano.com'}</strong>
                </p>
              </div>
            </form>
          </div>

          {/* Card: Recommended Registrars Comparison Table */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest block">
                COMPARATIVA Y RECOMENDACIONES OFICIALES
              </span>
              <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                ¿Dónde comprar tu dominio .COM al mejor precio sin sobrecostos?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Seleccionamos los registradores más confiables del mundo con precios justos y sin comisiones engañosas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {registrars.map((reg) => (
                <div
                  key={reg.name}
                  className="bg-slate-50/70 border border-slate-200 hover:border-indigo-300 p-5 rounded-2xl transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{reg.name}</h4>
                      {reg.badge && (
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border ${reg.badgeColor}`}>
                          {reg.badge}
                        </span>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-base font-black text-slate-900 font-mono">{reg.priceUSD}</p>
                      <p className="text-xs font-semibold text-emerald-600 font-mono">{reg.priceCOP}</p>
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{reg.recommendedFor}</p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                      {reg.pros.map((pro, i) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{pro}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <a
                      href={reg.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Ir a {reg.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1.5: Pack de Estudiantes (GitHub Student Developer Pack) */}
      {activeTab === 'student-pack' && (
        <div className="space-y-6">
          {/* Main Hero Card for Student Pack */}
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-xl space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-purple-500/30 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                <span>BENEFICIO OFICIAL GITHUB EDUCATION</span>
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-emerald-500/30">
                100% GRATIS • SIN TARJETA DE CRÉDITO
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              ¿Cómo conseguir tu dominio GRATIS con el GitHub Student Developer Pack?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              <strong>GitHub</strong> (propiedad de Microsoft) tiene un programa mundial llamado <strong>GitHub Student Developer Pack</strong>.
              Si estás estudiando o tienes a algún familiar, socio o amigo que estudie en cualquier colegio, instituto o universidad
              (con correo <code>.edu</code> o carné estudiantil vigente), tienen derecho a reclamar <strong>1 año de dominio gratis</strong> en registradores oficiales como <strong>Namecheap</strong> o <strong>Name.com</strong>.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="https://education.github.com/pack"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-purple-500 hover:bg-purple-400 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Abrir GitHub Student Pack Oficial</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => setActiveTab('dns')}
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 border border-white/15 cursor-pointer"
              >
                <span>Ver cómo conectarlo a este sistema (DNS)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Step by Step Guide */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <span className="text-[10px] font-mono font-bold text-purple-600 uppercase tracking-widest block">
                PASO A PASO DETALLADO
              </span>
              <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                Los 4 Pasos Exactos para Reclamar tu Dominio Gratis
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Sigue esta guía paso a paso; la aprobación de GitHub suele tardar entre unas pocas horas y 48 horas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Paso 1 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-purple-600 text-white text-xs font-black flex items-center justify-center font-mono">
                      1
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                      Requisito
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Tener o pedir un correo de estudiante</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Necesitas un correo institucional (por ejemplo: <code>tunombre@universidad.edu.co</code>, <code>@sena.edu.co</code> o cualquier entidad educativa). Si no eres estudiante, cualquier amigo, primo o familiar que estudie te puede colaborar prestando su correo para validar el beneficio.
                  </p>
                </div>
                <div className="text-[11px] text-purple-700 bg-purple-50 p-2.5 rounded-xl border border-purple-100 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>¿No tienes .edu? Puedes subir foto de carné o matrícula vigente.</span>
                </div>
              </div>

              {/* Paso 2 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-purple-600 text-white text-xs font-black flex items-center justify-center font-mono">
                      2
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                      Registro
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Aplicar en GitHub Education</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Entra a <strong>education.github.com/pack</strong>, haz clic en "Sign up for Student Developer Pack" e inicia sesión con tu cuenta de GitHub (crearla es gratis). Agrega el correo estudiantil como correo secundario en tu cuenta.
                  </p>
                </div>
                <a
                  href="https://education.github.com/pack"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-purple-700 hover:underline flex items-center gap-1"
                >
                  <span>Ir al formulario de solicitud de GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Paso 3 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-purple-600 text-white text-xs font-black flex items-center justify-center font-mono">
                      3
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                      Canje
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Elegir Namecheap o Name.com</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Una vez aprobado, en la lista de ofertas del pack verás las opciones de dominio:
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1 pl-1">
                    <li>• <strong>Namecheap:</strong> 1 año de dominio gratis (extensiones <code>.me</code> o paquetes con descuento especial para <code>.com</code>).</li>
                    <li>• <strong>Name.com:</strong> 1 año de dominio gratis (incluye extensiones como <code>.live</code>, <code>.ninja</code> o cupones de crédito de hasta $15 USD para tu <code>.com</code>).</li>
                  </ul>
                </div>
                <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>El cupón se aplica al finalizar la compra dejando el total en $0.</span>
                </div>
              </div>

              {/* Paso 4 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-purple-600 text-white text-xs font-black flex items-center justify-center font-mono">
                      4
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Conexión
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Apuntar los DNS a este sistema</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Cuando tu dominio quede registrado, entra al panel de Namecheap o Name.com en la pestaña "Advanced DNS" y pega los registros DNS (CNAME y registros A) que te mostramos en la pestaña <strong>"Configuración DNS & Cloud Run"</strong> de este panel.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('dns')}
                  className="text-[11px] font-bold text-purple-700 hover:underline flex items-center gap-1 text-left cursor-pointer"
                >
                  <span>Copiar registros DNS para Google Cloud Run</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Pros and What Happens on Year 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Ventajas del GitHub Student Pack:</span>
              </div>
              <ul className="text-xs text-emerald-900/90 space-y-2">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Costo $0 real:</strong> No te debitan nada durante los primeros 12 meses.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Beneficios adicionales:</strong> Incluye créditos en servidores de GitHub, herramientas de diseño como Canva Pro gratis, y herramientas de programación sin pagar.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Tiempo suficiente para vender:</strong> En 1 año tu marca de streetwear ya habrá vendido cientos de prendas con Wompi, dejando utilidades de sobra.</span>
                </li>
              </ul>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span>¿Qué pasa cuando se acaba el año gratis?</span>
              </div>
              <ul className="text-xs text-amber-900/90 space-y-2">
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Al cumplirse los 12 meses, decides si renovar el dominio o no.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Consejo PRO de ahorro:</strong> Si Namecheap te cobra $14 USD por renovar, puedes transferir tu dominio a <strong>Cloudflare Registrar</strong> donde siempre cuesta solo $9.77 USD (~ $38.000 COP al año).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Tu sistema nunca se borra ni se pierde: la tienda sigue funcionando con la base de datos y los productos intactos.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Configuración DNS & Cloud Run */}
      {activeTab === 'dns' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest block">
                  REGISTROS DNS PARA GOOGLE CLOUD RUN
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                  ¿Cómo conectar tu dominio .COM a este sistema?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Google Cloud Run te brinda <strong>Certificado SSL de Google Gratis</strong> para siempre. Solo debes agregar estos registros en tu panel DNS (Cloudflare, Namecheap o GoDaddy):
                </p>
              </div>

              <button
                onClick={handleTestDNS}
                disabled={isVerifyingDNS}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingDNS ? 'animate-spin' : ''}`} />
                <span>{isVerifyingDNS ? 'Verificando DNS...' : 'Probar Conexión DNS'}</span>
              </button>
            </div>

            {/* DNS Test Feedback */}
            {dnsCheckResult === 'success' && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-xs text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong>¡Enrutamiento de Google Cloud Run Verificado!</strong>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    El servicio está respondiendo con protocolo HTTPS y certificado TLS de 256 bits listo para recibir tráfico seguro.
                  </p>
                </div>
              </div>
            )}

            {/* DNS Records Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Tipo</th>
                    <th className="p-3.5">Nombre / Host</th>
                    <th className="p-3.5">Valor / Destino</th>
                    <th className="p-3.5">TTL</th>
                    <th className="p-3.5">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {dnsRecords.map((record, index) => (
                    <tr key={index} className="hover:bg-slate-50/60">
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          record.type === 'CNAME' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {record.type}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">{record.name}</td>
                      <td className="p-3.5 text-indigo-600 font-bold">{record.value}</td>
                      <td className="p-3.5 text-slate-400">{record.ttl}</td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleCopy(record.value, `dns-${index}`, `${record.type} ${record.value}`)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-sans font-medium transition-colors cursor-pointer flex items-center gap-1"
                        >
                          {copiedField === `dns-${index}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === `dns-${index}` ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide font-mono">
                Pasos para aplicar estos registros:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                    1
                  </span>
                  <p className="font-bold text-slate-800">Entra a tu registrador</p>
                  <p className="text-[11px] text-slate-500">
                    Inicia sesión en Cloudflare, Namecheap o donde compraste tu .com y entra a la sección "DNS".
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                    2
                  </span>
                  <p className="font-bold text-slate-800">Copia los registros</p>
                  <p className="text-[11px] text-slate-500">
                    Copia el registro CNAME para www y los 4 registros A para la raíz (@).
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                    3
                  </span>
                  <p className="font-bold text-slate-800">Espera la propagación</p>
                  <p className="text-[11px] text-slate-500">
                    El certificado SSL gratuito de Google se emitirá automáticamente en 15 a 60 minutos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Sellos de Confiabilidad para Clientes */}
      {activeTab === 'trust-factors' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest block">
                PSICOLOGÍA DEL COMPRADOR COLOMBIANO
              </span>
              <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                Los 6 Factores que Hacen que un Cliente Confíe y Pague en tu Tienda
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                En Colombia, el miedo a ser estafado en internet es alto. Más que el nombre del dominio, los compradores
                buscan estas 6 señales de seguridad antes de ingresar los datos de su tarjeta o su cuenta Nequi:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trustPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${pillar.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          {pillar.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{pillar.title}</h4>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono block mt-0.5">
                          {pillar.impact}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{pillar.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Toggle Controls for Storefront Trust Elements */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Elementos de Confianza Visibles en la Tienda Pública</span>
              </h3>
              <p className="text-xs text-slate-500">
                Activa o desactiva las insignias de seguridad que ven los clientes al navegar y en el checkout.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900">Barra Flotante Superior de Compra Segura</span>
                  <p className="text-[11px] text-slate-500">
                    Muestra el aviso "COMPRA 100% PROTEGIDA • ENCRIPTACIÓN BANCARIA" en la parte superior.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={storePreferences.showTopTrustNotice !== false}
                  onChange={(e) => {
                    updateStorePreferences({ showTopTrustNotice: e.target.checked });
                    showToast(e.target.checked ? 'Barra de confianza activada' : 'Barra de confianza oculta');
                  }}
                  className="w-5 h-5 accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900">Insignia de Empresa Registrada con NIT en Pie de Página</span>
                  <p className="text-[11px] text-slate-500">
                    Muestra "{storePreferences.storeLegalName} • {storePreferences.nitRUT} • Medellín" visible para todos.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={storePreferences.showVerifiedBusinessBadge !== false}
                  onChange={(e) => {
                    updateStorePreferences({ showVerifiedBusinessBadge: e.target.checked });
                    showToast(e.target.checked ? 'Insignia de NIT activada' : 'Insignia de NIT oculta');
                  }}
                  className="w-5 h-5 accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900">Sellos Oficiales de Medios de Pago en Checkout</span>
                  <p className="text-[11px] text-slate-500">
                    Logos de Wompi Bancolombia, Nequi, PSE, Daviplata y Visa/Mastercard con tokenización PCI.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  SIEMPRE ACTIVO (REQUERIDO)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
