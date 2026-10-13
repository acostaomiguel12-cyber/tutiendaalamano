import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  Package,
  Truck,
  MessageSquare,
  Film,
  CreditCard,
  Tag,
  ShoppingBag,
  BarChart3,
  Rocket,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Smartphone,
  Sparkles,
  Users,
  Eye,
  Sliders,
  Scan,
  Zap,
  Globe,
  Copy,
  Check,
  BookOpen,
  DollarSign,
  RotateCcw,
  Play,
  Video,
} from 'lucide-react';
import { AdminTab, useStore } from '../../context/StoreContext';

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  category: 'operaciones' | 'marketing' | 'finanzas' | 'diseño';
  tab: AdminTab;
  icon: React.FC<{ className?: string }>;
  iconBg: string;
  badge?: string;
  badgeColor?: string;
}

interface WorkflowStep {
  step: number;
  title: string;
  time: string;
  summary: string;
  details: string[];
  actionTab?: AdminTab;
  actionText?: string;
  badge: string;
  color: string;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  suggestedTab?: AdminTab;
  suggestedActionText?: string;
}

export const AdminHelpCenter: React.FC = () => {
  const { setAdminTab, currentAdminUser, switchAdminUser, adminUsers, openAdminHelp, openSystemVideoTutorial } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkflowStep, setSelectedWorkflowStep] = useState(1);
  const [mainHelpSection, setMainHelpSection] = useState<'all' | 'videos' | 'workflow' | 'modules' | 'nodomain' | 'faqs'>('all');
  const [activeFaqCategory, setActiveFaqCategory] = useState<'all' | 'orders' | 'video' | 'wompi' | 'security'>('all');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const copyText = (text: string, label: string) => {
    const done = () => {
      setCopiedUrl(label);
      setTimeout(() => setCopiedUrl(null), 3000);
    };
    try {
      const p = navigator.clipboard?.writeText(text) as Promise<void> | undefined;
      if (p && typeof p.then === 'function') {
        p.then(done).catch(() => fallbackCopy(text, done));
        return;
      }
      // Clipboard API sin promesa (navegador viejo): usa fallback directo.
      fallbackCopy(text, done);
    } catch {
      fallbackCopy(text, done);
    }
  };

  const fallbackCopy = (text: string, done: () => void) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      done();
    } catch {
      // Sin portapapeles disponible: no se marca como copiado.
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'dispatch-orders',
      title: 'Despachar Pedidos Pendientes',
      subtitle: 'Asignar número de guía Coordinadora/Servientrega y marcar como enviado',
      category: 'operaciones',
      tab: 'orders',
      icon: Package,
      iconBg: 'bg-indigo-50 text-indigo-600',
      badge: 'URGENTE DIARIO',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'whatsapp-status',
      title: 'WhatsApp Business Automático',
      subtitle: 'Comprobar las plantillas automáticas de envío y entrega que recibe el cliente',
      category: 'operaciones',
      tab: 'whatsapp-business',
      icon: MessageSquare,
      iconBg: 'bg-emerald-50 text-emerald-600',
      badge: 'AUTOMATIZADO',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'fix-video',
      title: 'Ajustar Video de Portada (Sin Cortes)',
      subtitle: 'Configurar modo "Ajuste Completo" para ver 100% del video sin recortes',
      category: 'diseño',
      tab: 'theme-builder',
      icon: Film,
      iconBg: 'bg-purple-50 text-purple-600',
      badge: 'NUEVO AJUSTE',
      badgeColor: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'domain-trust',
      title: 'Dominio .COM & Confiabilidad',
      subtitle: 'Comprar tu .com al menor precio (~$38k/año), DNS en Cloud Run y sellos de confianza',
      category: 'operaciones',
      tab: 'domain-trust',
      icon: Globe,
      iconBg: 'bg-blue-50 text-blue-600',
      badge: 'CONSULTA CLAVE',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'wompi-payouts',
      title: 'Conciliar Dinero Wompi Bancolombia',
      subtitle: 'Verificar dispersiones bancarias, comisiones de pasarela y saldo disponible',
      category: 'finanzas',
      tab: 'wompi-reconciliation',
      icon: CreditCard,
      iconBg: 'bg-teal-50 text-teal-600',
      badge: 'PAZ MENTAL',
      badgeColor: 'bg-teal-100 text-teal-700',
    },
    {
      id: 'catalog-stock',
      title: 'Inventario de Tallas & Precios',
      subtitle: 'Editar existencias de Hoodies 450 GSM, fotos y siluetas boxy',
      category: 'operaciones',
      tab: 'catalog',
      icon: ShoppingBag,
      iconBg: 'bg-rose-50 text-rose-600',
    },
    {
      id: 'coupons-discount',
      title: 'Crear Cupones de Descuento',
      subtitle: 'Diseñar promociones por porcentaje o monto fijo para lanzamientos de drops',
      category: 'marketing',
      tab: 'coupons',
      icon: Tag,
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'production-checklist',
      title: 'Checklist de Producción',
      subtitle: 'Revisar estado de llaves Wompi, webhook, HTTPS y preparación para ventas masivas',
      category: 'operaciones',
      tab: 'production-launch',
      icon: Rocket,
      iconBg: 'bg-emerald-500 text-white',
      badge: 'READY',
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'business-analytics',
      title: 'Métricas & Utilidad Neta',
      subtitle: 'Analizar margen bruto, ticket promedio en COP y tendencias de venta diaria',
      category: 'finanzas',
      tab: 'dashboard',
      icon: BarChart3,
      iconBg: 'bg-blue-50 text-blue-600',
    },
  ];

  const workflowSteps: WorkflowStep[] = [
    {
      step: 1,
      title: 'Entrada del Pedido & Pago Wompi',
      time: 'Inmediato (0 segundos)',
      summary: 'El cliente selecciona su talla, ingresa sus datos y paga con Nequi, PSE, Bancolombia o Tarjeta.',
      details: [
        'Wompi procesa la transacción de manera segura y encriptada.',
        'La orden ingresa automáticamente con estado APROBADO o PENDIENTE.',
        'Tu panel emite un sonido de confirmación y muestra el aviso de la venta en tiempo real.',
        'El stock de la talla comprada se descuenta automáticamente para evitar sobreventa.',
      ],
      actionTab: 'orders',
      actionText: 'Ver Pedidos Entrantes',
      badge: 'PASO 1: VENTA',
      color: 'border-indigo-500 text-indigo-600 bg-indigo-50',
    },
    {
      step: 2,
      title: 'Empaque & Asignación de Guía de Envío',
      time: '1 a 4 horas hábiles',
      summary: 'Tomas la prenda del inventario (450 GSM con hangtags) y la entregas a la transportadora.',
      details: [
        'Entras a "Pedidos Wompi" y abres la orden haciendo clic en "Ver Detalle / Despachar".',
        'Ingresas el número de guía que te entrega Coordinadora Mercantil, Servientrega o Interrapidísimo.',
        'Presionas el botón "Asignar & Despachar (Marcar ENVIADO)".',
        'El sistema guarda la guía en el historial y actualiza el estado del pedido a ENVIADO.',
      ],
      actionTab: 'shipping',
      actionText: 'Gestor de Guías de Envío',
      badge: 'PASO 2: LOGÍSTICA',
      color: 'border-amber-500 text-amber-600 bg-amber-50',
    },
    {
      step: 3,
      title: 'Notificación Automática por WhatsApp',
      time: 'Automático e instantáneo',
      summary: 'El comprador recibe un mensaje oficial de WhatsApp en su celular sin que tengas que escribir nada.',
      details: [
        'El mensaje incluye su nombre, el número de guía de rastreo y el link oficial para seguir el paquete.',
        'Reduce en un 95% los mensajes de clientes preguntando "¿dónde está mi pedido?".',
        'Genera profesionalismo y tranquilidad total para el cliente que compra streetwear por primera vez.',
        'Puedes probar y previsualizar las plantillas de mensaje en cualquier momento.',
      ],
      actionTab: 'whatsapp-business',
      actionText: 'Configurar WhatsApp Business',
      badge: 'PASO 3: MENSAJERÍA',
      color: 'border-emerald-500 text-emerald-600 bg-emerald-50',
    },
    {
      step: 4,
      title: 'Entrega en Destino & Agradecimiento',
      time: '24 a 48 horas tras despacho',
      summary: 'Cuando la transportadora confirma la entrega en la puerta del cliente en cualquier ciudad de Colombia.',
      details: [
        'Cambias el estado del pedido a "ENTREGADO".',
        'Se envía el segundo mensaje automático de WhatsApp agradeciéndole por adquirir la prenda.',
        'Se le invita a dejar su reseña en la tienda y etiquetar la marca en Instagram.',
      ],
      actionTab: 'reviews',
      actionText: 'Ver Reseñas & Comentarios',
      badge: 'PASO 4: ENTREGA',
      color: 'border-teal-500 text-teal-600 bg-teal-50',
    },
    {
      step: 5,
      title: 'Conciliación del Dinero en Bancolombia',
      time: '24 a 48 horas hábiles',
      summary: 'Wompi dispersa el saldo neto directamente a tu cuenta bancaria registrada.',
      details: [
        'En la pestaña "Conciliación Wompi", puedes auditar cada cobro, la comisión de pasarela y el IVA aplicado.',
        'Visualizas el saldo disponible y el histórico de transferencias bancarias recibidas.',
        'Te brinda certeza y tranquilidad contable sobre cada peso que entra a tu empresa.',
      ],
      actionTab: 'wompi-reconciliation',
      actionText: 'Abrir Conciliación Wompi',
      badge: 'PASO 5: DINERO',
      color: 'border-blue-500 text-blue-600 bg-blue-50',
    },
  ];

  const faqs: FaqItem[] = [
    {
      id: 'faq-domain-com-free',
      question: '¿Cómo registro mi dominio .com, puede ser gratis y cómo le doy máxima confiabilidad a mis clientes?',
      answer:
        'Los dominios .com tienen un costo base mayorista regulado por ICANN/Verisign de ~$9 USD/año (~$38.000 COP al año, o ~$3.200 COP al mes en registradores como Cloudflare o Porkbun). Mientras arrancas y generas ingresos, puedes usar sin pagar un solo peso el subdominio seguro de Google Cloud Run actual (con SSL de 256 bits y candado HTTPS gratis). Para dar máxima confiabilidad al comprador colombiano, el sistema ya cuenta con pasarela oficial Wompi Bancolombia, sellos PSE/Nequi, NIT legal verificado en Medellín y despachos asegurados por Coordinadora.',
      keywords: ['dominio', 'com', 'gratis', 'confiabilidad', 'seguridad', 'dns', 'cloud run', 'ssl'],
      suggestedTab: 'domain-trust',
      suggestedActionText: 'Ver Gestor de Dominio .COM & Confiabilidad',
    },
    {
      id: 'faq-video-cut',
      question: '¿Cómo hago para que el video de la tienda se vea completo y no me lo corte?',
      answer:
        'Hemos implementado el modo "Ajuste Completo (Sin Cortes / 100% Video Visible)". Ve al "Theme Builder" y en la sección de Video asegúrate de tener activado el modo "contain" (Ajuste Completo). Esto muestra el 100% del encuadre del video con retroiluminación ambiental inteligente de alta gama para que ninguna parte del modelo o prenda quede cortada, tanto en computadores como en celulares.',
      keywords: ['video', 'cortar', 'cortado', 'ajuste', 'resolución', 'portada', 'hero'],
      suggestedTab: 'theme-builder',
      suggestedActionText: 'Ir a Ajustar Video en Theme Builder',
    },
    {
      id: 'faq-roles',
      question: '¿Cómo garantizo que los clientes de la tienda nunca tengan acceso al panel de administración?',
      answer:
        'El sistema cuenta con aislamiento estricto de roles: los compradores que entran a la tienda solo ven el catálogo, carrito y checkout. Todos los accesos de staff han sido removidos del pie de página y del menú móvil. El acceso administrativo se realiza únicamente mediante la ruta protegida de autenticación corporativa (#admin) con correo y contraseña autorizados, y los usuarios sin sesión activa son redirigidos automáticamente.',
      keywords: ['roles', 'seguridad', 'acceso', 'cliente', 'admin', 'producción', 'permisos'],
      suggestedTab: 'production-launch',
      suggestedActionText: 'Revisar Estado de Seguridad',
    },
    {
      id: 'faq-wompi-keys',
      question: '¿Cómo cambio las llaves de Wompi de Sandbox (Pruebas) a Producción real?',
      answer:
        'Las llaves viven en el servidor, no en este panel: la pública (pub_...) va en la variable VITE_WOMPI_PUBLIC_KEY y la privada, integridad y eventos (prv_..., secreto de integridad y de eventos) van como WOMPI_PRIVATE_KEY, WOMPI_INTEGRITY_SECRET y WOMPI_EVENTS_SECRET en el .env del backend o del servicio (Render/VPS). Cópialas desde tu panel de Wompi Colombia (comercios.wompi.co → Desarrolladores) y reinicia el backend. Para cambiar de Sandbox a Producción, cambia WOMPI_ENV y las 4 llaves a las de producción.',
      keywords: ['wompi', 'llaves', 'producción', 'sandbox', 'pagos', 'pse', 'nequi', 'bancolombia'],
      suggestedTab: 'settings',
      suggestedActionText: 'Configurar Llaves Wompi',
    },
    {
      id: 'faq-coupons',
      question: '¿Cómo creo un cupón de 10% o $20.000 COP para un drop exclusivo?',
      answer:
        'Entra a la pestaña "Cupones de Descuento", haz clic en "+ Crear Nuevo Cupón", escribe el código (ejemplo: MANO10), selecciona si es porcentaje o monto fijo en COP, y define el uso máximo y fecha de expiración. El cupón queda inmediatamente habilitado para que los clientes lo apliquen en el checkout.',
      keywords: ['cupón', 'descuento', 'promoción', 'código', 'oferta'],
      suggestedTab: 'coupons',
      suggestedActionText: 'Crear Nuevo Cupón',
    },
    {
      id: 'faq-whatsapp-automatic',
      question: '¿Debo pagar algo adicional por los mensajes de WhatsApp automáticos?',
      answer:
        'El módulo de WhatsApp Business está integrado mediante la API Cloud oficial de Meta. Puedes vincular tu número de teléfono y Phone Number ID desde la pestaña "WhatsApp Business API". Durante la fase inicial o de prueba, puedes utilizar el simulador en vivo que envía las notificaciones directamente a la consola y a los logs del cliente.',
      keywords: ['whatsapp', 'notificaciones', 'mensajes', 'guía', 'rastreo'],
      suggestedTab: 'whatsapp-business',
      suggestedActionText: 'Configuración WhatsApp API',
    },
    {
      id: 'faq-bitly-error',
      question: '¿Por qué Bitly o TinyURL me dio error "Page not found (404)" y cómo lo soluciono?',
      answer:
        'Ese error ocurre por dos razones sencillas: 1) Si la URL que pegaste en Bitly aún no ha sido compartida en la plataforma (debes hacer clic en el botón "Share" o "Publish" arriba a la derecha en AI Studio para activar la dirección pública "ais-pre-..."). 2) O puedes acortar la URL activa de desarrollo ("ais-dev-..."). Una vez verificas que la URL cargue en tu navegador de incógnito, la acortas en Bitly o TinyURL y funcionará perfectamente sin dar error 404.',
      keywords: ['bitly', 'tinyurl', 'error', '404', 'not found', 'enlace', 'acortar', 'url', 'link'],
      suggestedTab: 'domain-trust',
      suggestedActionText: 'Ver Gestor de Dominio & Enlace',
    },
    {
      id: 'faq-sell-no-domain-safe',
      question: '¿Puedo empezar a vender en Colombia hoy mismo sin tener mi dominio .com comprado todavía?',
      answer:
        '¡Totalmente sí! Tu tienda ya está alojada en la infraestructura de Google Cloud Run con certificado SSL oficial HTTPS (candado de seguridad verde). Los pagos de tus clientes con Nequi, PSE, Tarjeta y Bancolombia están 100% protegidos por Wompi Bancolombia. Puedes compartir el link en tus redes o biografía de Instagram sin pagar un solo peso de dominio. Cuando más adelante adquieras tu dominio .com, lo conectamos en 5 minutos sin perder ningún producto ni pedido.',
      keywords: ['sin dominio', 'vender', 'empezar', 'cloud run', 'google', 'seguro', 'comprar'],
      suggestedTab: 'domain-trust',
      suggestedActionText: 'Ver Opciones de Dominio',
    },
    {
      id: 'faq-tracking-no-login',
      question: '¿Cómo hacen los clientes para rastrear su paquete si no tienen usuario ni contraseña?',
      answer:
        'Diseñamos un sistema de rastreo directo: en el pie de página y menú de la tienda hay un botón "Rastrear Pedido en Vivo". El cliente solo escribe su número de orden (ej: OPUS-2026-901) o su número de celular y ve en tiempo real si el pago fue aprobado, si está en preparación o la guía oficial de Coordinadora/Servientrega para rastrearla con un clic.',
      keywords: ['rastreo', 'guía', 'coordinadora', 'servientrega', 'seguimiento', 'paquete'],
      suggestedTab: 'orders',
      suggestedActionText: 'Ir a Pedidos & Guías',
    },
    {
      id: 'faq-payout-timing',
      question: '¿Cómo y cuándo me llega el dinero de las ventas a mi cuenta de Bancolombia?',
      answer:
        'Wompi Colombia transfiere automáticamente los fondos recaudados a la cuenta bancaria de ahorros o corriente que registraste en comercios.wompi.co. El ciclo de dispersión toma entre 24 y 48 horas hábiles tras la aprobación de la transacción, descontando la comisión estándar de pasarela.',
      keywords: ['dinero', 'bancolombia', 'pago', 'retiro', 'banco', 'dispersión', 'ganancia'],
      suggestedTab: 'wompi-reconciliation',
      suggestedActionText: 'Ver Conciliación Wompi',
    },
  ];

  // Filter actions & FAQs by search query
  const filteredActions = useMemo(() => {
    if (!searchQuery.trim()) return quickActions;
    const q = searchQuery.toLowerCase();
    return quickActions.filter(
      (a) => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q) || a.category.includes(q)
    );
  }, [searchQuery]);

  const filteredFaqs = useMemo(() => {
    let list = faqs;
    if (activeFaqCategory !== 'all') {
      list = list.filter((f) => {
        if (activeFaqCategory === 'orders') return f.keywords.includes('guía') || f.keywords.includes('roles');
        if (activeFaqCategory === 'video') return f.keywords.includes('video');
        if (activeFaqCategory === 'wompi') return f.keywords.includes('wompi');
        if (activeFaqCategory === 'security') return f.keywords.includes('seguridad') || f.keywords.includes('roles');
        return true;
      });
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [searchQuery, activeFaqCategory]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Banner: Welcome & Peace of Mind */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/20">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-amber-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>CENTRO DE OPERACIONES & GUÍAS FÁCILES</span>
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-emerald-500/30">
              TRANQUILIDAD DEL NEGOCIO
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            ¿Cómo operar tu tienda de forma simple y sin complicaciones?
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Aquí tienes todo lo que necesitas para el día a día de TU TIENDA A LA MANO: despachar paquetes, enviar guías por
            WhatsApp a tus compradores, ajustar tu video sin recortes y revisar tus ganancias de Wompi Bancolombia con
            un solo clic.
          </p>

          {/* Search Input */}
          <div className="pt-2 relative max-w-xl">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Escribe lo que deseas hacer (ej: 'despachar', 'video', 'wompi', 'guía')..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-800/90 border border-slate-700 focus:border-indigo-400 rounded-2xl text-sm text-white placeholder:text-slate-400 focus:outline-hidden transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Role Verification & Security Badge */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Seguridad de Roles & Producción Activa</h3>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                AISLADO
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Usuario actual: <strong className="text-slate-800">{currentAdminUser?.name}</strong> ({currentAdminUser?.roleTitle}).
              Los clientes en la tienda pública no tienen ningún acceso a este panel.
            </p>
          </div>
        </div>

        {/* Quick Role Switcher for Testing */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Probar vista de:</span>
          <select
            value={currentAdminUser?.id}
            onChange={(e) => switchAdminUser(e.target.value)}
            className="text-xs font-bold font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden cursor-pointer"
          >
            {adminUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.roleTitle} - {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Navigation Section Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setMainHelpSection('all')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            mainHelpSection === 'all'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Vista Completa</span>
        </button>

        <button
          type="button"
          onClick={() => setMainHelpSection('videos')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            mainHelpSection === 'videos'
              ? 'bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Play className="w-4 h-4 fill-rose-500 text-rose-500" />
          <span>Videos del Sistema (1080p)</span>
          <span className="text-[10px] font-mono bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-black">
            5 VIDEOS
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMainHelpSection('nodomain')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            mainHelpSection === 'nodomain'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Globe className="w-4 h-4 text-blue-500" />
          <span>Vender Sin Dominio (Paso a Paso)</span>
          <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-black">
            URGENTE
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMainHelpSection('modules')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            mainHelpSection === 'modules'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span>Manual de Todas las Vistas</span>
        </button>

        <button
          type="button"
          onClick={() => setMainHelpSection('workflow')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            mainHelpSection === 'workflow'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4 text-emerald-400" />
          <span>Flujo Diario de Despacho</span>
        </button>

        <button
          type="button"
          onClick={() => setMainHelpSection('faqs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            mainHelpSection === 'faqs'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Preguntas Frecuentes & Wompi</span>
        </button>
      </div>

      {/* VIDEO TUTORIALS SHOWCASE (1080P SCREENCASTS OF THE SYSTEM) */}
      {(mainHelpSection === 'all' || mainHelpSection === 'videos') && (
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-900/30">
                <Play className="w-6 h-6 fill-white translate-x-0.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white tracking-tight">
                    Videos Tutoriales & Grabaciones Reales del Sistema
                  </h2>
                  <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />
                    1080P HD
                  </span>
                </div>
                <p className="text-xs text-indigo-200">
                  Mira las capturas de video en tiempo real de cómo se despacha, se ajusta el video de portada y se gestiona el catálogo
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openSystemVideoTutorial('orders')}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-md shadow-rose-900/40 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
              <span>Abrir Reproductor Interactivo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: 'design_tour',
                title: 'Tour Completo: Domina la Página de Diseño 360°',
                desc: 'Aprende a navegar las 4 pestañas maestras (Personalizador Rápido, Temas Preset, Constructor WordPress y Respaldo JSON) y probar el simulador móvil.',
                duration: '02:30 min',
                category: 'Diseño Web Completo',
                badge: 'MÁS IMPORTANTE',
              },
              {
                id: 'design_styling',
                title: 'Colores de Marca, Logo PNG, Tipografías & Botones',
                desc: 'Sube tu logo con fondo transparente, aplica paletas como Onyx Black o Royal Indigo y configura anuncios rotativos con envío gratis.',
                duration: '02:15 min',
                category: 'Identidad Visual',
                badge: 'PERSONALIZACIÓN',
              },
              {
                id: 'design_builder',
                title: 'Constructor Visual Estilo WordPress & Elementor',
                desc: 'Maquetación modular con bloques tipo Gutenberg: sliders de video, banners con cuenta regresiva 24h, grillas 450 GSM y carrusel de opiniones.',
                duration: '02:40 min',
                category: 'Maquetación Avanzada',
                badge: 'WORDPRESS',
              },
              {
                id: 'design_sections',
                title: 'Organizar, Ocultar y Reordenar Secciones de la Tienda',
                desc: 'Controla el encendido y apagado de Flash Deals, Colecciones Populares y Feed de Instagram para optimizar el embudo de ventas.',
                duration: '01:50 min',
                category: 'Estructura Tienda',
                badge: 'ESTRUCTURA',
              },
              {
                id: 'video',
                title: 'Subir Video desde PC & Ajuste Sin Cortes (Fit Contain)',
                desc: 'Cómo subir tu video local de la marca, comprimirlo a menos de 5MB y activar "Ajuste Completo" para ver el 100% en celular y PC.',
                duration: '02:10 min',
                category: 'Diseño & Hero',
                badge: 'NUEVO AJUSTE',
              },
              {
                id: 'design_presets',
                title: 'Galería de Temas Preset y Respaldos JSON Seguros',
                desc: 'Aplica temas como Acid Noir o Quiet Luxury con 1 clic sin tocar productos, y exporta copias de seguridad JSON.',
                duration: '02:05 min',
                category: 'Plantillas & Copias',
                badge: 'BACKUP JSON',
              },
              {
                id: 'navbar',
                title: 'Editar Barra Superior (Navbar) & Categorías',
                desc: 'Personaliza los enlaces superiores, oculta categorías con 1-clic y navega automáticamente al publicar productos.',
                duration: '02:00 min',
                category: 'Diseño & Menús',
                badge: 'NAVBAR',
              },
              {
                id: 'orders',
                title: 'Despacho de Pedidos Wompi & Notificaciones',
                desc: 'Aprende a verificar pagos aprobados, escribir la guía de Coordinadora o Servientrega y disparar el WhatsApp automático.',
                duration: '01:45 min',
                category: 'Logística & Pagos',
                badge: 'URGENTE',
              },
              {
                id: 'catalog',
                title: 'Crear Prendas, Tallas S-XL y Algodón 450 GSM',
                desc: 'Registra nuevas siluetas, asigna inventario individual por talla y prueba el nuevo botón "Ver Prenda" in-admin.',
                duration: '01:55 min',
                category: 'Catálogo & SKUs',
                badge: '450 GSM',
              },
              {
                id: 'domain',
                title: 'Dominio .COM, Certificado SSL y Wompi',
                desc: 'Configura tus DNS CNAME en Google Cloud Run, activa HTTPS de 256 bits y concilia los depósitos en Bancolombia.',
                duration: '02:15 min',
                category: 'Infraestructura',
                badge: 'VITAL',
              },
            ].map((vid) => (
              <div
                key={vid.id}
                onClick={() => openSystemVideoTutorial(vid.id)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-400/40 p-4 rounded-2xl transition-all cursor-pointer group flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-indigo-300">
                      {vid.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{vid.duration}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                    {vid.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {vid.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-white transition-colors">
                  <span className="flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Ver Demostración</span>
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SPECIAL SECTION: VENDER SIN DOMINIO (BITLY / CLOUD RUN / SSL) */}
      {(mainHelpSection === 'all' || mainHelpSection === 'nodomain') && (
        <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-blue-400/30 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white tracking-tight">
                    ¿Cómo Vender Hoy Mismo Sin Dominio Propio?
                  </h2>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    100% OPERATIVO
                  </span>
                </div>
                <p className="text-xs text-blue-200">
                  Aprende a compartir tu catálogo, solucionar errores de Bitly y cobrar con Wompi sin pagar dominios
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAdminTab('domain-trust')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Gestor de Dominio .COM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Explanation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>1. SEGURIDAD Y PAGOS</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tu tienda está protegida con <strong>certificado SSL HTTPS</strong> de Google Cloud. Tus clientes pueden pagar
                con <strong>Nequi, Bancolombia, PSE y Tarjetas</strong> con total tranquilidad.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono">
                <AlertCircle className="w-4 h-4" />
                <span>2. ERROR BITLY "404 NOT FOUND"</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ocurre cuando la app no ha sido publicada. Debes pulsar el botón <strong>"Share" / "Publish"</strong> arriba en
                AI Studio, o acortar el enlace activo del servidor dev.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold font-mono">
                <Sparkles className="w-4 h-4" />
                <span>3. CUANDO TENGAS TU .COM</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                No pierdes ningún producto, pedido ni cliente. Conectaremos tu dominio propio en 5 minutos y seguirá
                funcionando sin interrupciones.
              </p>
            </div>
          </div>

          {/* Interactive URL Copy Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-indigo-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Tus Enlaces Oficiales para Clientes:
              </span>
              <span className="text-[10px] text-slate-400">Listos para acortar en TinyURL o Bitly</span>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[10px]">ENLACE TIENDA PÚBLICA (PRODUCCIÓN):</span>
                  <span className="text-indigo-300 truncate block font-bold">
                    https://ais-pre-z7lap5lavdytahk6yolis3-689805127356.us-west2.run.app
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      'https://ais-pre-z7lap5lavdytahk6yolis3-689805127356.us-west2.run.app',
                      'pre'
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer self-end sm:self-auto"
                >
                  {copiedUrl === 'pre' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl === 'pre' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[10px]">ENLACE ACTIVO EN TIEMPO REAL (DEV):</span>
                  <span className="text-emerald-300 truncate block font-bold">
                    https://ais-dev-z7lap5lavdytahk6yolis3-689805127356.us-west2.run.app
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      'https://ais-dev-z7lap5lavdytahk6yolis3-689805127356.us-west2.run.app',
                      'dev'
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer self-end sm:self-auto"
                >
                  {copiedUrl === 'dev' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl === 'dev' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Quick External Shortener Links */}
            <div className="pt-2 flex items-center gap-3 flex-wrap">
              <span className="text-xs text-slate-400 font-medium">Acortadores gratuitos recomendados:</span>
              <a
                href="https://tinyurl.com/app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <span>TinyURL (Sin registro)</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <a
                href="https://bitly.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <span>Bitly.com</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* SPECIAL SECTION: MANUAL DETALLADO DE TODAS LAS VISTAS */}
      {(mainHelpSection === 'all' || mainHelpSection === 'modules') && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest block">
                ENCICLOPEDIA DEL SISTEMA // GUÍA DE PANTALLAS
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                Manual Completo de Todas las Vistas del Menú
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
              12 Módulos Explicados
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Module 1: Pedidos Wompi */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-indigo-300 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                    URGENTE
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Pedidos Wompi & Despachos</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Aquí recibes las compras aprobadas por Wompi. Puedes ver el nombre del cliente, su dirección, las
                  prendas y tallas solicitadas, ingresar el número de guía de Coordinadora/Servientrega y marcarlo como
                  ENVIADO.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdminTab('orders')}
                className="pt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-between border-t border-slate-200 cursor-pointer"
              >
                <span>Abrir Pedidos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Module 2: Catálogo & Stock */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-rose-300 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                    PRODUCTOS
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Catálogo & Tallas (450 GSM)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Crea y edita tus Hoodies y Camisetas Oversized. Define fotos en alta resolución, precios en COP,
                  inventario por talla (S, M, L, XL) y descripciones detalladas con peso de la tela y fit boxy.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdminTab('catalog')}
                className="pt-2 text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center justify-between border-t border-slate-200 cursor-pointer"
              >
                <span>Abrir Catálogo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Module 3: Carritos Abandonados */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-amber-300 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                    + VENTAS
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Carritos Abandonados</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Detecta clientes que llenaron sus datos en el checkout pero no terminaron de pagar con su banco.
                  Permite contactarlos con 1 solo clic por WhatsApp ofreciéndoles un cupón para cerrar la venta.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdminTab('abandoned-checkouts')}
                className="pt-2 text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center justify-between border-t border-slate-200 cursor-pointer"
              >
                <span>Ver Carritos Abandonados</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Module 4: Theme Builder */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-purple-300 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Film className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                    DISEÑO
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Theme Builder & Video Sin Cortes</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Configura el video de portada de tu drop en modo "Ajuste Completo" para que no se corte en ningún
                  teléfono. Personaliza el estilo visual oscuro streetwear, textos y banners promocionales.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdminTab('theme-builder')}
                className="pt-2 text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center justify-between border-t border-slate-200 cursor-pointer"
              >
                <span>Configurar Video y Diseño</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Module 5: Wompi Settings */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-teal-300 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                    PASARELA
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Configuración Wompi Bancolombia</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Conecta tus llaves públicas y privadas de Wompi Colombia (comercios.wompi.co). Cambia entre modo
                  Sandbox (pruebas de pago) y Producción (dinero real transferido a tu cuenta bancaria).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdminTab('settings')}
                className="pt-2 text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center justify-between border-t border-slate-200 cursor-pointer"
              >
                <span>Configuración de Pasarela</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Module 6: Envíos & Tarifas */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-orange-300 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                    LOGÍSTICA
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Envíos & Tarifas Colombia</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Configura fletes por departamento o activa envío gratis en pedidos superiores a cierto monto (ej:
                  $250.000 COP). Conexión con transportadoras aliadas (Coordinadora, Servientrega, Interrapidísimo).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdminTab('shipping')}
                className="pt-2 text-xs font-bold text-orange-600 hover:text-orange-800 flex items-center justify-between border-t border-slate-200 cursor-pointer"
              >
                <span>Configurar Tarifas de Envío</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Module 7: Cupones */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-emerald-300 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Tag className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    MARKETING
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Cupones & Descuentos</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Crea cupones de porcentaje (10%, 15%) o monto fijo ($20.000 COP) para influencers, lanzamientos y
                  clientes recurrentes con límite de usos y fecha de caducidad.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdminTab('coupons')}
                className="pt-2 text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center justify-between border-t border-slate-200 cursor-pointer"
              >
                <span>Administrar Cupones</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Module 8: WhatsApp Business */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-emerald-300 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    AUTOMATIZACIÓN
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">WhatsApp Business API</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Envío automático de notificaciones a los celulares de los clientes cuando su pedido es empacado y
                  cuando se genera la guía de rastreo. Reduce preguntas en soporte en más del 90%.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdminTab('whatsapp-business')}
                className="pt-2 text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center justify-between border-t border-slate-200 cursor-pointer"
              >
                <span>Ver WhatsApp Business</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Module 9: Conciliación Bancaria */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-teal-300 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                    FINANZAS
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Conciliación Wompi Bancolombia</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Audita cada transacción: comisión de pasarela cobrada, retenciones y saldo neto disponible listo para
                  ser transferido a tu cuenta bancaria de ahorros o corriente en Colombia.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdminTab('wompi-reconciliation')}
                className="pt-2 text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center justify-between border-t border-slate-200 cursor-pointer"
              >
                <span>Auditar Conciliación</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section 1: Atajos de 1 Clic */}
      {(mainHelpSection === 'all' || mainHelpSection === 'workflow') && (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Atajos Rápidos de 1 Clic</span>
              <span className="text-xs font-mono font-normal text-slate-500">({filteredActions.length} disponibles)</span>
            </h2>
            <p className="text-xs text-slate-500">Salta directamente a la sección que necesitas sin dar rodeos.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => setAdminTab(action.tab)}
                className="text-left bg-white hover:bg-slate-50/80 p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-98"
              >
                <div className="space-y-3 w-full">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${action.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {action.badge && (
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${action.badgeColor}`}>
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {action.subtitle}
                    </p>
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Ir a esta sección</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
      )}

      {/* Section 2: El Flujo Diario Paso a Paso */}
      {(mainHelpSection === 'all' || mainHelpSection === 'workflow') && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest block">
                OPERACIÓN DIARIA // DE LA VENTA AL DINERO EN TU CUENTA
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                Cómo Trabajar Día a Día en tu Sistema (Paso a Paso)
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
              5 Pasos Clave
            </span>
          </div>

        {/* Step Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {workflowSteps.map((ws) => (
            <button
              key={ws.step}
              type="button"
              onClick={() => setSelectedWorkflowStep(ws.step)}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                selectedWorkflowStep === ws.step
                  ? `${ws.color} border-2 shadow-xs font-bold`
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
              }`}
            >
              <span className="text-[10px] font-mono font-bold uppercase">{ws.badge}</span>
              <span className="text-xs font-bold mt-1 line-clamp-1">{ws.title}</span>
            </button>
          ))}
        </div>

        {/* Active Step Showcase */}
        {(() => {
          const step = workflowSteps.find((s) => s.step === selectedWorkflowStep) || workflowSteps[0];
          return (
            <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                    Paso {step.step} de 5 • {step.time}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">{step.title}</h3>
                </div>
                {step.actionTab && (
                  <button
                    type="button"
                    onClick={() => setAdminTab(step.actionTab!)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
                  >
                    <span>{step.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-white p-3.5 rounded-xl border border-slate-200">
                {step.summary}
              </p>

              <div className="space-y-2 pt-1">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wide font-mono">Lo que ocurre:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {step.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-600 leading-normal">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
        </div>
      )}

      {/* Section 3: Video & Ajustes Especiales */}
      {(mainHelpSection === 'all' || mainHelpSection === 'modules') && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card: Ajuste del Video Sin Cortes */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ajuste de Video: 100% Completo Sin Recortes</h3>
              <p className="text-xs text-slate-500">Cómo garantizar que tu video se vea perfecto en todos los celulares.</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 leading-relaxed bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
            <p>
              <strong>1. Modo Sin Cortes:</strong> El video ahora está configurado de forma predeterminada para usar
              encuadre cinematográfico completo (con proporción 16:9 y retroiluminación ambiental). Ningún elemento queda cortado.
            </p>
            <p>
              <strong>2. Control en Pantalla:</strong> Tanto tú como tus visitantes tienen un botón interactivo{' '}
              <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border">100% Completo / Llenar</span> en el video
              para alternar el modo según prefieran.
            </p>
            <p>
              <strong>3. Cambio de Video:</strong> Puedes colocar la URL de cualquier archivo de video .MP4 o .WEBM en el
              Theme Builder.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAdminTab('theme-builder')}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Scan className="w-4 h-4" />
            <span>Configurar Video en Theme Builder</span>
          </button>
        </div>

        {/* Card: Paz Mental Wompi & Bancolombia */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tranquilidad Financiera con Wompi</h3>
              <p className="text-xs text-slate-500">Claridad total sobre el dinero de tus ventas y transferencias.</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 leading-relaxed bg-teal-50/50 p-4 rounded-2xl border border-teal-100">
            <p>
              <strong>1. Pagos Acreditados:</strong> Cada vez que un comprador finaliza su pedido con Nequi, PSE o tarjeta,
              el dinero ingresa a tu balance comercial de Wompi de manera irreversible.
            </p>
            <p>
              <strong>2. Auditoría en Tiempo Real:</strong> En la pestaña "Conciliación Wompi" puedes ver el desglose exacto
              de comisiones (2.65% + $700 COP aproximado) y el valor neto exacto que llegará a tu banco.
            </p>
            <p>
              <strong>3. Dispersión Automática:</strong> Wompi transfiere el saldo acumulado directo a tu cuenta bancaria
              Bancolombia en 24 a 48 horas hábiles.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAdminTab('wompi-reconciliation')}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <CreditCard className="w-4 h-4" />
            <span>Abrir Conciliación & Saldo Bancario</span>
          </button>
        </div>
      </div>
      )}

      {/* Section 4: Preguntas Frecuentes y Respuestas Inmediatas */}
      {(mainHelpSection === 'all' || mainHelpSection === 'faqs') && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Preguntas Frecuentes & Soluciones</h2>
              <p className="text-xs text-slate-500">Respuestas directas a las dudas operativas más comunes.</p>
            </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveFaqCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFaqCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setActiveFaqCategory('video')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFaqCategory === 'video'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Video
            </button>
            <button
              type="button"
              onClick={() => setActiveFaqCategory('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFaqCategory === 'orders'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Despachos & Guías
            </button>
            <button
              type="button"
              onClick={() => setActiveFaqCategory('wompi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFaqCategory === 'wompi'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Wompi Bancolombia
            </button>
            <button
              type="button"
              onClick={() => setActiveFaqCategory('security')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFaqCategory === 'security'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Seguridad & Roles
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq) => (
            <div key={faq.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>{faq.question}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">{faq.answer}</p>
              {faq.suggestedTab && (
                <div className="pl-6 pt-2">
                  <button
                    type="button"
                    onClick={() => setAdminTab(faq.suggestedTab!)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    <span>{faq.suggestedActionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              No se encontraron resultados para "{searchQuery}". Intenta con otra palabra clave.
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};
