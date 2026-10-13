import React, { useState, useMemo, useEffect } from 'react';
import {
  HelpCircle,
  X,
  Search,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Package,
  ShoppingBag,
  CreditCard,
  Truck,
  Globe,
  Film,
  Tag,
  MessageSquare,
  Sparkles,
  Zap,
  ChevronRight,
  Copy,
  Check,
  ShieldCheck,
  RotateCcw,
  Sliders,
  DollarSign,
  Users,
  Play,
  Pause,
  Video,
} from 'lucide-react';
import { useStore, AdminTab } from '../../context/StoreContext';

interface ModuleGuide {
  tab: AdminTab;
  name: string;
  category: 'operaciones' | 'catalogo' | 'finanzas' | 'marketing' | 'configuracion';
  icon: React.FC<{ className?: string }>;
  iconBg: string;
  summary: string;
  steps: { title: string; desc: string }[];
  proTips: string[];
  commonMistakes: string[];
}

export const AdminQuickHelpDrawer: React.FC = () => {
  const {
    adminHelpDrawerOpen,
    setAdminHelpDrawerOpen,
    adminTab,
    setAdminTab,
    adminHelpTopic,
    setAdminHelpTopic,
    showToast,
    openSystemVideoTutorial,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTabGuide, setSelectedTabGuide] = useState<AdminTab>(adminTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'guides' | 'videos'>('guides');
  const [activeVideoId, setActiveVideoId] = useState<string>('orders');
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [activeVideoStep, setActiveVideoStep] = useState<number>(0);
  const [videoElapsedSec, setVideoElapsedSec] = useState<number>(12);

  const tutorialVideos = [
    {
      id: 'orders',
      title: 'Cómo Despachar Pedidos Wompi y Notificar por WhatsApp',
      category: 'Logística & Pagos',
      duration: '01:45',
      targetTab: 'orders' as AdminTab,
      badge: 'URGENTE DIARIO',
      badgeColor: 'bg-indigo-100 text-indigo-700',
      steps: [
        {
          second: 0,
          label: '1. Verificar Pago APROBADO',
          screenTitle: 'Módulo: Pedidos Wompi (production.wompi.co)',
          screenDetail: 'Revisas la referencia (ej: ORD-2026-1001) y confirmas el sello verde "APROBADO".',
          actionText: 'Clic en "Ver Detalle" de la orden',
        },
        {
          second: 35,
          label: '2. Asignar Guía Coordinadora / Servientrega',
          screenTitle: 'Modal: Detalle & Despacho Nacional',
          screenDetail: 'Ingresas el número de guía suministrado por la transportadora colombiana.',
          actionText: 'Escribir guía y seleccionar "Coordinadora"',
        },
        {
          second: 70,
          label: '3. Marcar ENVIADO y Disparar WhatsApp',
          screenTitle: 'Confirmación & Notificación en 1-Clic',
          screenDetail: 'El sistema actualiza el estado a "EN RUTA" y dispara el mensaje automático con tracking.',
          actionText: 'Clic en "Guardar y Notificar WhatsApp"',
        },
      ],
    },
    {
      id: 'design_tour',
      title: 'Tour Completo: Domina la Página de Diseño de Punta a Punta',
      category: 'Diseño Visual',
      duration: '02:30',
      targetTab: 'theme-builder' as AdminTab,
      badge: 'MÁS IMPORTANTE',
      badgeColor: 'bg-purple-100 text-purple-700',
      steps: [
        {
          second: 0,
          label: '1. Las 4 Pestañas Maestras del Módulo',
          screenTitle: 'Panel: Personalizador, Temas, WordPress & JSON',
          screenDetail: 'Recorrido por las cuatro herramientas de maquetación: Personalizador Rápido, Temas Preset, Editor WordPress y Respaldos.',
          actionText: 'Explorar las 4 pestañas superiores',
        },
        {
          second: 40,
          label: '2. Simulador Multi-Dispositivo',
          screenTitle: 'Simulador: Celular, Tablet y Desktop',
          screenDetail: 'Comprueba el aspecto en teléfonos iPhone, Android y pantallas de escritorio en tiempo real.',
          actionText: 'Alternar tamaños de dispositivo',
        },
        {
          second: 75,
          label: '3. Publicar y Probar en Vitrina',
          screenTitle: 'Despliegue Inmediato en la Tienda',
          screenDetail: 'Pulsas Guardar y el diseño queda activo para todos tus clientes en Colombia.',
          actionText: 'Verificar en tienda pública',
        },
      ],
    },
    {
      id: 'design_styling',
      title: 'Cambiar Logo, Paletas de Color HEX, Fuentes y Botones',
      category: 'Diseño Visual',
      duration: '02:15',
      targetTab: 'theme-builder' as AdminTab,
      badge: 'PERSONALIZACIÓN',
      badgeColor: 'bg-violet-100 text-violet-700',
      steps: [
        {
          second: 0,
          label: '1. Subir Logo PNG Transparente',
          screenTitle: 'Configuración de Identidad & Logotipo',
          screenDetail: 'Carga el logo principal y el de pie de página ajustando la altura en píxeles.',
          actionText: 'Subir archivo de logotipo PNG',
        },
        {
          second: 40,
          label: '2. Paleta de Marca o Color HEX',
          screenTitle: 'Selector Cromático: Onyx Black, Indigo, Noir',
          screenDetail: 'Escoge entre paletas prediseñadas o introduce el código hexadecimal de tu tienda.',
          actionText: 'Aplicar paleta de color oficial',
        },
        {
          second: 75,
          label: '3. Fuentes y Botones Redondeados',
          screenTitle: 'Tipografía & Bordes de Botones',
          screenDetail: 'Personaliza los textos y la curvatura de los botones de compra (12px redondeado o recto).',
          actionText: 'Guardar configuración de marca',
        },
      ],
    },
    {
      id: 'design_builder',
      title: 'Constructor Visual Estilo WordPress & Elementor (Bloques)',
      category: 'Diseño Visual',
      duration: '02:40',
      targetTab: 'theme-builder' as AdminTab,
      badge: 'WORDPRESS VISUAL',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      steps: [
        {
          second: 0,
          label: '1. Abrir Constructor Visual',
          screenTitle: 'Editor Modular Gutenberg / Elementor',
          screenDetail: 'Entra a la pestaña 3 para maquetar con componentes modulares arrastrables.',
          actionText: 'Abrir lienzo de bloques visuales',
        },
        {
          second: 45,
          label: '2. Añadir Banners con Cronómetro & Sliders',
          screenTitle: 'Componentes de Alta Conversión',
          screenDetail: 'Inserta banners promocionales con cuenta regresiva para tus drops exclusivos.',
          actionText: 'Insertar bloques de venta',
        },
        {
          second: 80,
          label: '3. Reordenar y Guardar Estructura',
          screenTitle: 'Jerarquía y Sincronización en Vivo',
          screenDetail: 'Mueve los bloques con flechas o arrastrando y pulsa Guardar para publicar.',
          actionText: 'Publicar diseño de bloques',
        },
      ],
    },
    {
      id: 'design_sections',
      title: 'Organizar, Ocultar y Reordenar Secciones de la Tienda',
      category: 'Diseño Visual',
      duration: '01:50',
      targetTab: 'theme-builder' as AdminTab,
      badge: 'ESTRUCTURA',
      badgeColor: 'bg-amber-100 text-amber-800',
      steps: [
        {
          second: 0,
          label: '1. Administrador de Secciones',
          screenTitle: 'Lista de Módulos de la Página de Inicio',
          screenDetail: 'Inspecciona las 6 áreas que componen tu página de bienvenida.',
          actionText: 'Abrir submenú de Secciones',
        },
        {
          second: 40,
          label: '2. Interruptor On/Off de Módulos',
          screenTitle: 'Activar o Pausar Secciones con 1-Clic',
          screenDetail: 'Apaga temporalmente Flash Deals o Reseñas sin perder tu configuración.',
          actionText: 'Alternar visibilidad del módulo',
        },
        {
          second: 70,
          label: '3. Optimizar Flujo de Ventas',
          screenTitle: 'Posicionar Catálogo en Primer Lugar',
          screenDetail: 'Coloca tus mejores siluetas arriba para lograr compras en menos de 2 minutos.',
          actionText: 'Reordenar prioridad de secciones',
        },
      ],
    },
    {
      id: 'design_presets',
      title: 'Galería de Temas Preset y Exportar / Importar Copias JSON',
      category: 'Diseño Visual',
      duration: '02:05',
      targetTab: 'theme-builder' as AdminTab,
      badge: 'BACKUP JSON',
      badgeColor: 'bg-cyan-100 text-cyan-800',
      steps: [
        {
          second: 0,
          label: '1. Probar Temas Prediseñados',
          screenTitle: 'Galería de Estilos de 1-Clic',
          screenDetail: 'Escoge entre Streetwear Acid Noir, Quiet Luxury Studio o Cyberpunk Medellín.',
          actionText: 'Explorar temas preset',
        },
        {
          second: 40,
          label: '2. Aplicar Tema sin Perder Productos',
          screenTitle: 'Transformación Estética Inmediata',
          screenDetail: 'Se actualiza la apariencia completa conservando tu catálogo de prendas y precios.',
          actionText: 'Aplicar preset seleccionado',
        },
        {
          second: 75,
          label: '3. Exportar / Importar Respaldo JSON',
          screenTitle: 'Copias de Seguridad de Diseño',
          screenDetail: 'Copia el código JSON a tu computadora o restáuralo cuando quieras.',
          actionText: 'Copiar respaldo JSON seguro',
        },
      ],
    },
    {
      id: 'video',
      title: 'Subir, Comprimir y Ajustar el Video de Portada sin Cortes',
      category: 'Diseño Visual',
      duration: '02:10',
      targetTab: 'theme-builder' as AdminTab,
      badge: 'NUEVO AJUSTE',
      badgeColor: 'bg-purple-100 text-purple-700',
      steps: [
        {
          second: 0,
          label: '1. Subir Video desde la PC',
          screenTitle: 'Editor de Portada & Hero Banner',
          screenDetail: 'Tocas "Subir Video Local" para seleccionar tu clip MP4 o WebM grabado para tu marca.',
          actionText: 'Cargar archivo de video local',
        },
        {
          second: 40,
          label: '2. Compresión Inteligente Ligera',
          screenTitle: 'Optimizador Web de Video (< 5MB)',
          screenDetail: 'El algoritmo comprime el archivo para que cargue al instante sin consumir datos al cliente.',
          actionText: 'Verificar bitrate y compresión ligera',
        },
        {
          second: 80,
          label: '3. Modo "Ajuste Completo" (Sin Recortes)',
          screenTitle: 'Modo de Visualización: Fit Contain 100%',
          screenDetail: 'Seleccionas "Ajuste Completo" para que el video no se corte ni en iPhone ni en Desktop.',
          actionText: 'Activar "Ajuste Completo Sin Cortes"',
        },
      ],
    },
    {
      id: 'catalog',
      title: 'Crear Prendas, Variantes de Tallas y Precios COP',
      category: 'Catálogo & SKUs',
      duration: '01:55',
      targetTab: 'catalog' as AdminTab,
      badge: '450 GSM',
      badgeColor: 'bg-amber-100 text-amber-800',
      steps: [
        {
          second: 0,
          label: '1. Crear Prenda con Fotos',
          screenTitle: 'Gestor de Catálogo: + Nuevo Producto',
          screenDetail: 'Añades el título (ej: Hoodie Oversized Acid Wash), categoría y fotos en alta resolución.',
          actionText: 'Completar datos principales y fotos',
        },
        {
          second: 45,
          label: '2. Siluetas, Tallas y Algodón 450 GSM',
          screenTitle: 'Tallas S, M, L, XL & Stock Individual',
          screenDetail: 'Asignas las cantidades por talla y activas los sellos de calidad pesada colombiana.',
          actionText: 'Configurar variantes de talla y stock',
        },
        {
          second: 75,
          label: '3. Publicar y Ver en Tienda',
          screenTitle: 'Sincronización Inmediata en la Vitrina',
          screenDetail: 'Tocas "Publicar" y usas el nuevo botón "Ver Prenda" para comprobarla en tiempo real.',
          actionText: 'Guardar y Ver Prenda en la tienda',
        },
      ],
    },
    {
      id: 'domain',
      title: 'Conectar Dominio .COM Propio & WhatsApp Business',
      category: 'Infraestructura',
      duration: '02:20',
      targetTab: 'domain-trust' as AdminTab,
      badge: 'VITAL',
      badgeColor: 'bg-blue-100 text-blue-700',
      steps: [
        {
          second: 0,
          label: '1. Registro o Enlace de Dominio',
          screenTitle: 'Gestor Dominio .COM & Confianza',
          screenDetail: 'Configuras tu registro CNAME hacia Google Cloud Run o usas el subdominio seguro gratuito.',
          actionText: 'Copiar registros DNS oficiales',
        },
        {
          second: 50,
          label: '2. Candado HTTPS & SSL de 256 Bits',
          screenTitle: 'Certificado de Seguridad Automático',
          screenDetail: 'Tu tienda cuenta con cifrado militar para que el comprador pague con tranquilidad.',
          actionText: 'Verificar estado SSL y Wompi',
        },
        {
          second: 95,
          label: '3. Vincular WhatsApp Business Cloud API',
          screenTitle: 'Notificaciones Automáticas por Celular',
          screenDetail: 'Conectas el número oficial de WhatsApp para auto-enviar guías y recuperar carritos.',
          actionText: 'Probar envío de plantilla WhatsApp',
        },
      ],
    },
  ];

  const currentVideo = tutorialVideos.find((v) => v.id === activeVideoId) || tutorialVideos[0];

  // Simulated video playback timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVideoPlaying) {
      interval = setInterval(() => {
        setVideoElapsedSec((prev) => {
          if (prev >= 105) {
            setIsVideoPlaying(false);
            return 0;
          }
          const next = prev + 5;
          if (next > 75) setActiveVideoStep(2);
          else if (next > 40) setActiveVideoStep(1);
          else setActiveVideoStep(0);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVideoPlaying]);

  // Sync with current adminTab whenever drawer opens
  useEffect(() => {
    if (adminHelpDrawerOpen) {
      if (adminHelpTopic) {
        // if a specific topic was passed, find corresponding tab
        const matched = moduleGuides.find(
          (m) =>
            m.tab === adminHelpTopic ||
            m.name.toLowerCase().includes(adminHelpTopic.toLowerCase())
        );
        if (matched) {
          setSelectedTabGuide(matched.tab);
        } else {
          setSelectedTabGuide(adminTab);
        }
      } else {
        setSelectedTabGuide(adminTab);
      }
    }
  }, [adminHelpDrawerOpen, adminTab, adminHelpTopic]);

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && adminHelpDrawerOpen) {
        setAdminHelpDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [adminHelpDrawerOpen, setAdminHelpDrawerOpen]);

  const moduleGuides: ModuleGuide[] = [
    {
      tab: 'orders',
      name: 'Gestión de Pedidos & Despachos',
      category: 'operaciones',
      icon: Package,
      iconBg: 'bg-indigo-50 text-indigo-600',
      summary:
        'Aquí administras las compras realizadas por tus clientes con Wompi, asignas guías de transporte y notificas automáticamente.',
      steps: [
        {
          title: '1. Verificar que el Pago esté APROBADO',
          desc: 'Los pedidos con sello verde "APROBADO" están 100% cobrados y el dinero está asegurado en Wompi Bancolombia.',
        },
        {
          title: '2. Empacar la Prenda y Solicitar Guía',
          desc: 'Toma la prenda de tu inventario (con hangtags y bolsa kraft) y genera la guía con Coordinadora, Servientrega o Interrapidísimo.',
        },
        {
          title: '3. Asignar Guía en la Orden',
          desc: 'Haz clic en "Ver Detalle / Despachar", escribe el número de guía que te dio la transportadora y pulsa "Marcar ENVIADO".',
        },
        {
          title: '4. El Cliente Rastrea en Vivo',
          desc: 'El comprador puede consultar el avance en la tienda con su orden o número de celular sin necesidad de tener contraseña.',
        },
      ],
      proTips: [
        'Puedes imprimir la remisión y factura térmica con 1 clic desde el botón "Imprimir Remisión".',
        'Si el cliente pide información por WhatsApp, envíale el enlace de rastreo directo: /#rastreo=REFERENCIA.',
      ],
      commonMistakes: [
        'Nunca despaches una prenda en estado "PENDIENTE" o "RECHAZADO"; espera siempre la confirmación "APROBADO".',
      ],
    },
    {
      tab: 'catalog',
      name: 'Catálogo de Prendas & Stock',
      category: 'catalogo',
      icon: ShoppingBag,
      iconBg: 'bg-rose-50 text-rose-600',
      summary:
        'Administra tus Hoodies 450 GSM, Camisetas Oversized, tallas S a XL, fotos en alta resolución y precios en Pesos Colombianos (COP).',
      steps: [
        {
          title: '1. Agregar Nueva Prenda',
          desc: 'Presiona "+ Nueva Prenda" en la esquina superior. Define el título de la prenda (ej: "Heavyweight Hoodie Void Black 450 GSM").',
        },
        {
          title: '2. Asignar Tallas y Cantidades',
          desc: 'Ingresa las unidades disponibles para S, M, L y XL. Cuando una talla llegue a 0, el sistema mostrará "Agotado" para evitar sobreventas.',
        },
        {
          title: '3. Fotos de Alta Calidad',
          desc: 'Sube fotos en fondo neutro o con modelo mostrando el fit boxy y los detalles bordados/estampados.',
        },
        {
          title: '4. Precio de Venta y Comparación',
          desc: 'Indica el precio en COP (ej: $240.000 COP) y opcionalmente un precio de descuento tachado para generar urgencia.',
        },
      ],
      proTips: [
        'Resalta en la descripción el gramaje de la tela (450 GSM es el estándar de lujo en streetwear).',
        'Incluye una pequeña guía de medidas de pecho y largo para reducir solicitudes de cambio.',
      ],
      commonMistakes: [
        'No dejes el stock en 0 si tienes prendas listas para entrega inmediata.',
      ],
    },
    {
      tab: 'domain-trust',
      name: 'Dominio .COM & Enlace para Clientes',
      category: 'configuracion',
      icon: Globe,
      iconBg: 'bg-blue-50 text-blue-600',
      summary:
        'Aprende a compartir tu tienda hoy mismo sin necesidad de tener dominio propio y cómo conectar tu .com cuando lo compres.',
      steps: [
        {
          title: '1. ¿Puedo vender ya sin dominio?',
          desc: '¡SÍ! Tu tienda está activa en los servidores de Google Cloud Run con certificado SSL oficial HTTPS y pasarela Wompi conectada.',
        },
        {
          title: '2. Cómo acortar tu enlace con Bitly o TinyURL',
          desc: 'Copia el enlace de tu tienda y pégalo en TinyURL o Bitly. Asegúrate de que tu aplicación esté publicada (con el botón "Share" en AI Studio) para que no dé error 404.',
        },
        {
          title: '3. Enlace en tu Biografía de Instagram',
          desc: 'Pega tu link en el perfil de Instagram o WhatsApp Business para que tus clientes entren directo al catálogo y paguen con Nequi.',
        },
        {
          title: '4. Conectar Dominio Propio (.com)',
          desc: 'Cuando reclames o compres tu dominio (ej: tutiendaalamano.com), solo agregas los registros DNS que te indica esta pestaña y listo.',
        },
      ],
      proTips: [
        'Puedes usar TinyURL.com sin necesidad de crear cuenta, o Linktree para agrupar tu tienda con tu WhatsApp.',
        'El estudiante SENA puede acceder al Student Pack de GitHub para obtener 1 año de dominio gratis tras activar su 2FA.',
      ],
      commonMistakes: [
        'No envíes links rotos o con espacios. Prueba siempre el link en una pestaña de incógnito antes de compartirlo.',
      ],
    },
    {
      tab: 'settings',
      name: 'Configuración Wompi Bancolombia',
      category: 'finanzas',
      icon: CreditCard,
      iconBg: 'bg-teal-50 text-teal-600',
      summary:
        'Conecta tus llaves de pasarela para procesar pagos seguros con Nequi, PSE, Tarjetas de Crédito y Botón Bancolombia.',
      steps: [
        {
          title: '1. Obtener tus Llaves en comercios.wompi.co',
          desc: 'Inicia sesión en tu cuenta de Wompi Colombia y ve a la sección "Desarrolladores".',
        },
        {
          title: '2. Copiar las 4 llaves',
          desc: 'Copia la Llave Pública (pub_...), la Privada (prv_...), el Secreto de Integridad y el Secreto de Eventos.',
        },
        {
          title: '3. Guardar en el SERVIDOR (no en este panel)',
          desc: 'Pégalas como variables de entorno del backend (.env.local en local, o env vars en Render/VPS) y reinicia el servidor. Este panel ya no guarda secretos por seguridad.',
        },
        {
          title: '4. Modo Sandbox vs Modo Producción',
          desc: 'Usa Sandbox para hacer compras simuladas de prueba sin dinero real. Cambia a Producción cuando estés listo para recibir dinero real.',
        },
      ],
      proTips: [
        'Wompi dispersa automáticamente el dinero recaudado a tu cuenta de ahorros o corriente Bancolombia en 24 a 48 horas hábiles.',
        'No necesitas tener dominio .com para que Wompi funcione; la URL de Google Cloud Run es 100% compatible.',
      ],
      commonMistakes: [
        'Nunca compartas tu llave privada (prv_...) con clientes o terceros; solo debe estar guardada en tu panel administrativo.',
      ],
    },
    {
      tab: 'abandoned-checkouts',
      name: 'Recuperación de Carritos Abandonados',
      category: 'marketing',
      icon: RotateCcw,
      iconBg: 'bg-amber-50 text-amber-600',
      summary:
        'Recupera ventas de clientes que llenaron sus datos pero no terminaron el pago en Wompi enviándoles un mensaje personalizado por WhatsApp.',
      steps: [
        {
          title: '1. Revisar Carritos Pendientes',
          desc: 'Aquí verás el nombre, celular, ciudad y las prendas que el cliente dejó en su carrito.',
        },
        {
          title: '2. Enviar Mensaje por WhatsApp en 1 Clic',
          desc: 'Presiona el botón "Recuperar por WhatsApp". El sistema abrirá el chat con un mensaje amigable y su enlace directo para retomar.',
        },
        {
          title: '3. Ofrecer Cupón de Empuje (Opcional)',
          desc: 'Puedes ofrecerle un 10% de descuento (código MANO10) para motivarlo a cerrar la compra de inmediato.',
        },
      ],
      proTips: [
        'Contactar al cliente en las primeras 2 horas posteriores al abandono aumenta la tasa de recuperación en más de un 40%.',
      ],
      commonMistakes: [
        'No presiones al cliente; usa un tono de servicio: "Hola, vimos que no pudiste completar tu compra, ¿tuviste algún problema con Nequi o tu banco?".',
      ],
    },
    {
      tab: 'theme-builder',
      name: 'Personalización Visual & Video de Portada',
      category: 'configuracion',
      icon: Film,
      iconBg: 'bg-purple-50 text-purple-600',
      summary:
        'Personaliza los videos de portada, tipografías, colores de fondo y estilo visual streetwear de tu tienda.',
      steps: [
        {
          title: '1. Ajuste de Video 100% Visible (Sin Cortes)',
          desc: 'Activa la opción "Ajuste Completo" para que el video mantenga su proporción original y no corte los modelos ni las prendas en celulares.',
        },
        {
          title: '2. Cambiar Video de Campaña',
          desc: 'Pega la URL de tu video MP4 de campaña (en Cloudinary, Firebase o servidor propio).',
        },
        {
          title: '3. Estilo Visual y Colores',
          desc: 'Elige entre la paleta Dark Streetwear de alto contraste o tonos neutros minimalistas.',
        },
      ],
      proTips: [
        'Tus clientes tienen un botón en la esquina del video para alternar entre "Ajuste Completo" y "Llenar Pantalla".',
      ],
      commonMistakes: [
        'No uses videos que pesen más de 20 MB para asegurar que carguen rápido con datos móviles en Colombia.',
      ],
    },
    {
      tab: 'coupons',
      name: 'Cupones de Descuento & Promociones',
      category: 'marketing',
      icon: Tag,
      iconBg: 'bg-emerald-50 text-emerald-600',
      summary:
        'Crea códigos promocionales para drops exclusivos, clientes VIP o descuentos por tiempo limitado.',
      steps: [
        {
          title: '1. Crear Nuevo Código',
          desc: 'Pulsa "+ Crear Cupón". Define el código (ej: DROPVIP, MEDELLIN15).',
        },
        {
          title: '2. Elegir Tipo de Descuento',
          desc: 'Puedes fijar un porcentaje (ej: 10% OFF) o un monto fijo en Pesos Colombianos (ej: $30.000 COP).',
        },
        {
          title: '3. Límites y Fechas',
          desc: 'Define cuántas veces se puede usar el cupón y su fecha límite de vencimiento.',
        },
      ],
      proTips: [
        'Puedes compartir un enlace directo con el cupón preaplicado desde el botón "Compartir Tienda".',
      ],
      commonMistakes: [
        'Recuerda calcular tu margen antes de dar descuentos superiores al 20%.',
      ],
    },
    {
      tab: 'shipping',
      name: 'Tarifas y Tiempos de Envío Colombia',
      category: 'operaciones',
      icon: Truck,
      iconBg: 'bg-orange-50 text-orange-600',
      summary:
        'Configura los costos de envío a Bogotá, Medellín, Cali, Barranquilla y municipios nacionales, o activa envío gratis por compras superiores a cierto monto.',
      steps: [
        {
          title: '1. Envío Gratis por Monto Mínimo',
          desc: 'Por ejemplo, envío gratis en compras mayores a $250.000 COP (estrategia ideal para que lleven 2 prendas).',
        },
        {
          title: '2. Tarifas Regionales',
          desc: 'Ajusta el valor del flete para ciudades principales ($14.000 COP) y trayectos especiales ($20.000 COP).',
        },
        {
          title: '3. Tiempos Promedio de Entrega',
          desc: 'Informa claramente que las entregas toman de 2 a 4 días hábiles.',
        },
      ],
      proTips: [
        'El 70% de compradores colombianos abandonan el carrito si el costo de envío es sorpresa; tenerlo claro en el banner superior genera confianza.',
      ],
      commonMistakes: [
        'No prometas entregas en 24 horas a destinos lejanos si la transportadora tarda 3 días hábiles.',
      ],
    },
    {
      tab: 'whatsapp-business',
      name: 'WhatsApp Business Automático',
      category: 'marketing',
      icon: MessageSquare,
      iconBg: 'bg-emerald-50 text-emerald-600',
      summary:
        'Configura mensajes automáticos para que tus clientes reciban su confirmación y guía de entrega por WhatsApp al instante.',
      steps: [
        {
          title: '1. Plantilla de Pedido Aprobado',
          desc: 'Mensaje agradeciendo la compra e indicando que el paquete está en empaque.',
        },
        {
          title: '2. Plantilla de Despacho con Guía',
          desc: 'Incluye automáticamente el nombre de la transportadora y el enlace de rastreo.',
        },
        {
          title: '3. Plantilla de Paquete Entregado',
          desc: 'Invita al cliente a dejar su reseña y foto con la prenda.',
        },
      ],
      proTips: [
        'Puedes probar las plantillas en vivo desde este módulo para ver exactamente cómo se ven en el celular.',
      ],
      commonMistakes: [
        'Asegúrate de tener el código de país +57 en los números de teléfono de Colombia.',
      ],
    },
    {
      tab: 'dashboard',
      name: 'Panel General & Métricas de Negocio',
      category: 'finanzas',
      icon: Sliders,
      iconBg: 'bg-slate-900 text-white',
      summary:
        'Visualiza tus ingresos totales en COP, pedidos del día, ticket promedio y alertas de stock bajo en tiempo real.',
      steps: [
        {
          title: '1. Monitoreo en Tiempo Real',
          desc: 'Revisa las ventas que van entrando durante tus drops o lanzamientos.',
        },
        {
          title: '2. Tareas Pendientes del Día',
          desc: 'El panel te avisa cuántos pedidos tienes pendientes por empacar y despachar.',
        },
        {
          title: '3. Alertas de Inventario',
          desc: 'Te notifica qué tallas de Hoodies o Camisetas están por agotarse para reordenar con taller.',
        },
      ],
      proTips: [
        'Usa el atajo de teclado ⌘K o Ctrl+K para buscar cualquier pedido o producto al instante.',
      ],
      commonMistakes: [],
    },
    {
      tab: 'employees',
      name: 'Gestión de Empleados & Asignación de Módulos',
      category: 'configuracion',
      icon: Users,
      iconBg: 'bg-indigo-50 text-indigo-600',
      summary:
        'Crea usuarios individuales para tu equipo y define exactamente qué secciones del panel pueden ver y administrar según su rol.',
      steps: [
        {
          title: '1. Crear Nuevo Colaborador',
          desc: 'Presiona "Crear Nuevo Empleado", ingresa su nombre, cargo visible, departamento y PIN de 4 dígitos.',
        },
        {
          title: '2. Asignar Módulos con Plantillas o Manualmente',
          desc: 'Usa una plantilla rápida (Logística, Ventas, Diseño, Finanzas) o marca/desmarca individualmente cada uno de los 20 módulos disponibles.',
        },
        {
          title: '3. Probar Acceso al Instante',
          desc: 'Haz clic en el botón "Entrar" en cualquier empleado para ver el panel tal como lo vería ese colaborador.',
        },
      ],
      proTips: [
        'Los operadores logísticos solo necesitan acceso a Pedidos, Guías y Centro de Ayuda para no distraerse ni ver información financiera.',
        'El Super Administrador siempre conserva acceso global ininterrumpido.',
      ],
      commonMistakes: [
        'No asignes acceso a Configuración Pasarela (llaves privadas Wompi) a personal que solo realiza empaque o envíos.',
      ],
    },
  ];

  // Filtered modules based on search query
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return moduleGuides;
    const q = searchQuery.toLowerCase();
    return moduleGuides.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.steps.some((s) => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)) ||
        m.proTips.some((p) => p.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const activeGuide = useMemo(() => {
    return moduleGuides.find((m) => m.tab === selectedTabGuide) || moduleGuides[0];
  }, [selectedTabGuide]);

  if (!adminHelpDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => setAdminHelpDrawerOpen(false)}
      />

      {/* Slide-in Drawer Container */}
      <aside className="relative z-10 w-full max-w-xl sm:max-w-2xl bg-white shadow-2xl h-full flex flex-col overflow-hidden border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight text-white">
                  Manual & Guía Operativa
                </h2>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-amber-400/20 text-amber-300 rounded-full border border-amber-400/30">
                  AYUDA FÁCIL
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Todo lo que necesitas saber para gestionar tu tienda paso a paso
              </p>
            </div>
          </div>

          <button
            onClick={() => setAdminHelpDrawerOpen(false)}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar Guía (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher & Search Bar */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-2.5 shrink-0">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('guides')}
              className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'guides'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Guías Paso a Paso</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('videos')}
              className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'videos'
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-white" />
              <span>Videos Demostrativos</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />
            </button>
          </div>

          {viewMode === 'guides' ? (
            <>
              {/* Quick Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar tema (ej: 'despacho', 'wompi', 'dominio', 'stock', 'bitly')..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 focus:border-indigo-500 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Module Selector Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 shrink-0 mr-1">
                  Ver Guía de:
                </span>
                {filteredModules.map((m) => {
                  const Icon = m.icon;
                  const isCurrent = selectedTabGuide === m.tab;
                  const isPageCurrent = adminTab === m.tab;
                  return (
                    <button
                      key={m.tab}
                      type="button"
                      onClick={() => setSelectedTabGuide(m.tab)}
                      className={`px-2.5 py-1.5 rounded-lg font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{m.name.split('&')[0].trim()}</span>
                      {isPageCurrent && (
                        <span
                          className={`text-[9px] px-1 rounded-sm font-mono ${
                            isCurrent ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          AQUÍ
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Video Selector Chips */
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 shrink-0 mr-1">
                Elegir Video:
              </span>
              {tutorialVideos.map((vid) => {
                const isCurrent = activeVideoId === vid.id;
                return (
                  <button
                    key={vid.id}
                    type="button"
                    onClick={() => {
                      setActiveVideoId(vid.id);
                      setIsVideoPlaying(false);
                      setActiveVideoStep(0);
                      setVideoElapsedSec(0);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{vid.title.split(' ')[0]} {vid.title.split(' ')[1]}</span>
                    <span className="text-[9px] font-mono opacity-80">{vid.duration}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {viewMode === 'videos' ? (
            /* Video Demonstrations UI */
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Video Player Frame Container */}
              <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col text-white">
                {/* Top Video Bar */}
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                      TUTORIAL EN VIDEO • {currentVideo.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setAdminHelpDrawerOpen(false);
                        openSystemVideoTutorial(activeVideoId);
                      }}
                      className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                      title="Abrir en reproductor de pantalla grande"
                    >
                      <span>Pantalla Grande</span>
                    </button>
                    <span className="bg-white/10 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                      1080P
                    </span>
                  </div>
                </div>

                {/* Simulated Screen / Canvas */}
                <div className="relative aspect-16/9 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-6 flex flex-col justify-between overflow-hidden">
                  {/* Subtle Grid Background */}
                  <div className="absolute inset-0 bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

                  {/* Top Screen Tag */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="bg-indigo-600/90 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1.5 shadow-md">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>{currentVideo.steps[activeVideoStep]?.screenTitle || 'Simulador Visual en Vivo'}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Escena {activeVideoStep + 1} de {currentVideo.steps.length}
                    </span>
                  </div>

                  {/* Center Visual Mockup / Step Illustration */}
                  <div className="relative z-10 my-auto text-center space-y-3 max-w-md mx-auto">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                      <Play className="w-7 h-7 fill-white translate-x-0.5" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-white tracking-tight">
                        {currentVideo.steps[activeVideoStep]?.label}
                      </h4>
                      <p className="text-xs text-indigo-200 mt-1 max-w-sm mx-auto leading-relaxed">
                        {currentVideo.steps[activeVideoStep]?.screenDetail}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold px-3 py-1.5 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{currentVideo.steps[activeVideoStep]?.actionText}</span>
                    </div>
                  </div>

                  {/* Bottom Timeline & Controls */}
                  <div className="relative z-10 space-y-2 pt-2">
                    {/* Scrub Bar */}
                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden cursor-pointer">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, (videoElapsedSec / 105) * 100)}%` }}
                      />
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                          className="w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md"
                        >
                          {isVideoPlaying ? (
                            <Pause className="w-4 h-4 fill-slate-950" />
                          ) : (
                            <Play className="w-4 h-4 fill-slate-950 translate-x-0.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setVideoElapsedSec(0);
                            setActiveVideoStep(0);
                          }}
                          className="text-slate-400 hover:text-white p-1"
                          title="Reiniciar video"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        <span className="font-mono text-[10px] text-slate-400">
                          0{Math.floor(videoElapsedSec / 60)}:{(videoElapsedSec % 60).toString().padStart(2, '0')} / {currentVideo.duration}
                        </span>
                      </div>

                      {/* Step Navigation */}
                      <div className="flex items-center gap-1.5">
                        {currentVideo.steps.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setActiveVideoStep(idx);
                              setVideoElapsedSec(s.second);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                              activeVideoStep === idx
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white'
                            }`}
                          >
                            Paso {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step Explanatory Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-mono font-bold text-xs flex items-center justify-center">
                      {activeVideoStep + 1}
                    </span>
                    <h3 className="text-sm font-black text-slate-900">
                      {currentVideo.steps[activeVideoStep]?.label}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    EN ESTA ESCENA
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {currentVideo.steps[activeVideoStep]?.screenDetail}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">¿Listo para probarlo tú mismo?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminTab(currentVideo.targetTab);
                      setAdminHelpDrawerOpen(false);
                      showToast(`Navegando a la sección del tutorial`);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Ir a esta herramienta</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Video List Carousel Cards */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
                  Otros Videos de Capacitación Rápida:
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {tutorialVideos
                    .filter((v) => v.id !== activeVideoId)
                    .map((v) => (
                      <div
                        key={v.id}
                        onClick={() => {
                          setActiveVideoId(v.id);
                          setIsVideoPlaying(true);
                          setActiveVideoStep(0);
                          setVideoElapsedSec(0);
                        }}
                        className="p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Play className="w-4 h-4 fill-rose-600" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate transition-colors">
                              {v.title}
                            </h5>
                            <p className="text-[10px] text-slate-400">
                              {v.category} • {v.duration} min
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform shrink-0 flex items-center gap-1">
                          <span>Ver</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            /* Guides View */
            <>
          {/* Active Guide Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${activeGuide.iconBg}`}>
                  <activeGuide.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">{activeGuide.name}</h3>
                    {adminTab === activeGuide.tab ? (
                      <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        SECCIÓN ACTUAL
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAdminTab(activeGuide.tab);
                          showToast(`Navegando a ${activeGuide.name}`);
                        }}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                      >
                        Ir a esta pantalla &rarr;
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{activeGuide.summary}</p>
                </div>
              </div>
            </div>

            {/* Steps Checklist */}
            <div className="pt-2 space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Pasos Recomendados (Flujo Simple):</span>
              </h4>

              <div className="space-y-2.5">
                {activeGuide.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-white border border-slate-300 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs font-mono">
                      {idx + 1}
                    </div>
                    <div className="text-xs leading-relaxed">
                      <p className="font-bold text-slate-900">{step.title}</p>
                      <p className="text-slate-600 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tips */}
            {activeGuide.proTips.length > 0 && (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Consejos Pro para Maximizar Ventas:</span>
                </div>
                <ul className="space-y-1 text-xs text-emerald-800 pl-5 list-disc leading-relaxed">
                  {activeGuide.proTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Common Mistakes */}
            {activeGuide.commonMistakes.length > 0 && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Qué evitar para no tener problemas:</span>
                </div>
                <ul className="space-y-1 text-xs text-amber-800 pl-5 list-disc leading-relaxed">
                  {activeGuide.commonMistakes.map((mistake, i) => (
                    <li key={i}>{mistake}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Special Quick Section: Vender Sin Dominio (Paso a Paso) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-blue-950">
                ¿Aún no tienes dominio .com? Vende con total tranquilidad:
              </h4>
            </div>
            <div className="text-xs text-blue-900 space-y-2 leading-relaxed">
              <p>
                <strong>1. No necesitas comprar dominio para arrancar:</strong> Tu tienda ya está viva en los servidores de Google con seguridad HTTPS y pasarela Wompi Bancolombia activa.
              </p>
              <p>
                <strong>2. Acortar el enlace correctamente:</strong> Puedes usar <a href="https://tinyurl.com" target="_blank" rel="noopener noreferrer" className="underline font-bold text-indigo-700">TinyURL</a> o <a href="https://bitly.com" target="_blank" rel="noopener noreferrer" className="underline font-bold text-indigo-700">Bitly</a> para tener un enlace como <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-bold">bit.ly/tutiendaalamano</code>.
              </p>
              <p>
                <strong>3. Si Bitly te dio error "Page not found":</strong> Asegúrate de publicar la tienda pulsando el botón <strong>"Share" / "Publish"</strong> en la esquina superior de AI Studio antes de acortar la URL.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAdminTab('domain-trust');
                setAdminHelpDrawerOpen(false);
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>Ver Guía Completa de Dominios & DNS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Button to Full Help Center */}
          <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="text-xs font-bold text-slate-800">¿Quieres ver todas las guías detalladas y preguntas frecuentes?</p>
              <p className="text-[11px] text-slate-500">Visita el Centro de Ayuda integral con videos y atajos de teclado.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAdminTab('help-center');
                setAdminHelpDrawerOpen(false);
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <span>Abrir Centro Completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          </>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>TU TIENDA A LA MANO • Soporte Colombia</span>
          </div>
          <button
            onClick={() => setAdminHelpDrawerOpen(false)}
            className="text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
          >
            Cerrar Guía (Esc)
          </button>
        </div>
      </aside>
    </div>
  );
};
