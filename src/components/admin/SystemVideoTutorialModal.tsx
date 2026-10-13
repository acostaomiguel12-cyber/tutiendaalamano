import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Package,
  Film,
  Globe,
  Sliders,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  Store,
  Compass,
  Palette,
  Layout,
  Type,
  Smartphone,
  Monitor,
  Tablet,
  Download,
  Upload,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  Code,
  Paintbrush,
} from 'lucide-react';
import { useStore, AdminTab } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';

export interface VideoScene {
  second: number;
  label: string;
  stepNumber: number;
  screenPath: string;
  cursorTarget: { x: number; y: number; label: string };
  audioCaption: string;
  highlightText: string;
  actionRequired: string;
  screenType:
    | 'orders_list'
    | 'orders_modal'
    | 'video_upload'
    | 'video_scale'
    | 'catalog_create'
    | 'catalog_preview'
    | 'navbar_edit'
    | 'domain_dns'
    | 'design_tour'
    | 'design_styling'
    | 'design_builder'
    | 'design_sections'
    | 'design_presets';
}

export interface VideoTutorialItem {
  id: string;
  title: string;
  shortTitle: string;
  category: string;
  durationSec: number;
  durationFormatted: string;
  tab: AdminTab;
  badge: string;
  badgeColor: string;
  icon: React.FC<{ className?: string }>;
  scenes: VideoScene[];
}

export const SYSTEM_TUTORIALS: VideoTutorialItem[] = [
  {
    id: 'design_tour',
    title: 'Tour Completo: Domina la Página de Diseño de Punta a Punta',
    shortTitle: 'Tour 360° de Diseño',
    category: 'Diseño Web Completo',
    durationSec: 36,
    durationFormatted: '02:30 min',
    tab: 'theme-builder',
    badge: 'MÁS IMPORTANTE',
    badgeColor: 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white',
    icon: Palette,
    scenes: [
      {
        second: 0,
        label: '1. Las 4 Pestañas Maestras del Módulo',
        stepNumber: 1,
        screenPath: '/admin#theme-builder',
        cursorTarget: { x: 35, y: 22, label: 'Explorar pestañas superiores' },
        audioCaption: 'La página de diseño cuenta con 4 módulos principales: Personalizador Rápido, Galería de Temas Preset, Constructor Visual WordPress y Exportar/Importar JSON.',
        highlightText: 'Módulos: 1. Personalizador • 2. Galería Temas • 3. WordPress Visual • 4. Respaldo JSON',
        actionRequired: 'Recorrer las 4 pestañas maestras',
        screenType: 'design_tour',
      },
      {
        second: 9,
        label: '2. Simulador Multi-Dispositivo en Vivo',
        stepNumber: 2,
        screenPath: '/admin#theme-builder/simulator',
        cursorTarget: { x: 74, y: 32, label: 'Alternar Celular / PC' },
        audioCaption: 'Puedes alternar entre vista Móvil (Smartphone), Tablet y Escritorio para verificar que tu tienda se vea impecable en cualquier pantalla.',
        highlightText: 'Simulador 100% interactivo • Compatible iPhone, Android y Monitores 4K',
        actionRequired: 'Cambiar tamaño de pantalla en el simulador',
        screenType: 'design_tour',
      },
      {
        second: 18,
        label: '3. Edición Visual Reactiva sin Recargar',
        stepNumber: 3,
        screenPath: '/admin#theme-builder/live-edit',
        cursorTarget: { x: 50, y: 55, label: 'Modificar colores y títulos' },
        audioCaption: 'Cualquier ajuste de tipografía, banners o colores se refleja en el simulador en tiempo real sin tener que recargar el navegador.',
        highlightText: 'Renderizado Reactivo: 0.1s de latencia visual • 100% fluido',
        actionRequired: 'Ajustar parámetros visuales en vivo',
        screenType: 'design_tour',
      },
      {
        second: 27,
        label: '4. Publicar y Probar en la Vitrina Pública',
        stepNumber: 4,
        screenPath: '/store',
        cursorTarget: { x: 86, y: 18, label: 'Clic en "Ver Tienda"' },
        audioCaption: 'Al pulsar Guardar, todos los cambios se despliegan automáticamente en la tienda pública para todos tus compradores en Colombia.',
        highlightText: '✅ Diseño publicado con éxito • Disponible para compras en vivo',
        actionRequired: 'Confirmar y visualizar en la vitrina pública',
        screenType: 'design_tour',
      },
    ],
  },
  {
    id: 'design_styling',
    title: 'Cambiar Logo, Paletas de Color HEX, Fuentes y Botones',
    shortTitle: 'Logo, Colores & Fuentes',
    category: 'Diseño & Marca',
    durationSec: 36,
    durationFormatted: '02:15 min',
    tab: 'theme-builder',
    badge: 'PERSONALIZACIÓN',
    badgeColor: 'bg-violet-600 text-white',
    icon: Sliders,
    scenes: [
      {
        second: 0,
        label: '1. Subir Logo Principal & Footer',
        stepNumber: 1,
        screenPath: '/admin#theme-builder/logo',
        cursorTarget: { x: 42, y: 38, label: 'Subir Logo PNG Transparente' },
        audioCaption: 'Sube tu logo oficial en formato PNG con fondo transparente. Puedes regular la altura exacta en píxeles tanto para cabecera como para el pie de página.',
        highlightText: 'Logo: OPUS_KARTEL_WHITE.png • Altura recomendada: 36px a 48px',
        actionRequired: 'Cargar archivo de logotipo de marca',
        screenType: 'design_styling',
      },
      {
        second: 9,
        label: '2. Escoger Paleta de Marca o Color HEX',
        stepNumber: 2,
        screenPath: '/admin#theme-builder/palette',
        cursorTarget: { x: 62, y: 48, label: 'Seleccionar Paleta Onyx Black' },
        audioCaption: 'Elige entre paletas premium como Onyx Black, Royal Indigo o Pure Noir, o ingresa el código hexadecimal exacto de tu marca.',
        highlightText: 'Paleta seleccionada: Onyx Black (#18181b) • Acento Esmeralda (#10b981)',
        actionRequired: 'Aplicar combinación cromática',
        screenType: 'design_styling',
      },
      {
        second: 18,
        label: '3. Tipografía Urbana y Bordes de Botón',
        stepNumber: 3,
        screenPath: '/admin#theme-builder/typography',
        cursorTarget: { x: 55, y: 64, label: 'Ajustar Bordes y Fuentes' },
        audioCaption: 'Define la tipografía de títulos y el redondeo de los botones (estilo cápsula suave o corte recto urbano de alta gama).',
        highlightText: 'Tipografía: Inter Bold Display • Radio de borde: 12px redondeado moderno',
        actionRequired: 'Definir curvas y fuentes tipográficas',
        screenType: 'design_styling',
      },
      {
        second: 27,
        label: '4. Barra Superior con Anuncio Rotativo',
        stepNumber: 4,
        screenPath: '/admin#theme-builder/navbar',
        cursorTarget: { x: 78, y: 78, label: 'Activar Envío Gratis Colombia' },
        audioCaption: 'Configura la barra de anuncios con ofertas rotativas como "ENVÍO GRATIS POR COMPRAS SUPERIORES A $200.000" para elevar la conversión.',
        highlightText: '✅ Barra persuasiva activada • Anuncios con rotación suave cada 4 segundos',
        actionRequired: 'Guardar configuración de identidad visual',
        screenType: 'design_styling',
      },
    ],
  },
  {
    id: 'design_builder',
    title: 'Constructor Visual Estilo WordPress & Elementor (Bloques Modulares)',
    shortTitle: 'Constructor WordPress',
    category: 'Diseño Avanzado',
    durationSec: 36,
    durationFormatted: '02:40 min',
    tab: 'theme-builder',
    badge: 'WORDPRESS VISUAL',
    badgeColor: 'bg-emerald-600 text-white',
    icon: Layers,
    scenes: [
      {
        second: 0,
        label: '1. Pestaña Constructor WordPress Visual',
        stepNumber: 1,
        screenPath: '/admin#theme-builder/builder',
        cursorTarget: { x: 60, y: 22, label: 'Entrar a "3. Constructor Visual"' },
        audioCaption: 'Entra a la tercera pestaña para acceder al editor tipo Gutenberg / Elementor donde puedes diseñar con bloques modulares arrastrables.',
        highlightText: 'Editor Modular Gutenberg: Secciones de ancho completo, grillas y sliders',
        actionRequired: 'Abrir lienzo de diseño visual',
        screenType: 'design_builder',
      },
      {
        second: 9,
        label: '2. Añadir Sliders y Banners con Cronómetro',
        stepNumber: 2,
        screenPath: '/admin#theme-builder/builder/add-block',
        cursorTarget: { x: 38, y: 44, label: 'Pulsar "+ Añadir Bloque"' },
        audioCaption: 'Agrega bloques de llamado a la acción, banners con cuenta regresiva para lanzamientos exclusivos y testimonios de compradores.',
        highlightText: 'Bloque insertado: Banner con Cronómetro 24H • Aumento del 34% en conversión',
        actionRequired: 'Insertar nuevo bloque en el lienzo',
        screenType: 'design_builder',
      },
      {
        second: 18,
        label: '3. Reordenar Bloques con Arrastre Rápido',
        stepNumber: 3,
        screenPath: '/admin#theme-builder/builder/reorder',
        cursorTarget: { x: 70, y: 56, label: 'Mover bloque hacia arriba' },
        audioCaption: 'Usa las flechas de posición o arrastra los bloques verticalmente para organizar la jerarquía perfecta de tu página de inicio.',
        highlightText: 'Jerarquía: Hero Slider > Flash Deals > Grilla 450 GSM > Reseñas 5 Estrellas',
        actionRequired: 'Reorganizar bloques en el orden deseado',
        screenType: 'design_builder',
      },
      {
        second: 27,
        label: '4. Previsualización y Publicación Instantánea',
        stepNumber: 4,
        screenPath: '/admin#theme-builder/builder/publish',
        cursorTarget: { x: 84, y: 80, label: 'Clic en "Guardar y Desplegar"' },
        audioCaption: 'Guarda la maquetación y visualiza cómo la tienda adopta la nueva estructura de bloques con transiciones fluidas de 60 cuadros por segundo.',
        highlightText: '✅ Estructura WordPress guardada • Diseño publicado y optimizado',
        actionRequired: 'Publicar diseño de bloques en vivo',
        screenType: 'design_builder',
      },
    ],
  },
  {
    id: 'design_sections',
    title: 'Organizar, Ocultar y Reordenar Secciones de la Tienda (Drag & Drop)',
    shortTitle: 'Secciones & Grillas',
    category: 'Diseño & Estructura',
    durationSec: 36,
    durationFormatted: '01:50 min',
    tab: 'theme-builder',
    badge: 'ESTRUCTURA',
    badgeColor: 'bg-amber-600 text-white',
    icon: Layout,
    scenes: [
      {
        second: 0,
        label: '1. Administrador de Secciones de Vitrina',
        stepNumber: 1,
        screenPath: '/admin#theme-builder/sections',
        cursorTarget: { x: 45, y: 35, label: 'Abrir lista de secciones' },
        audioCaption: 'En el submenú "Secciones y Bloques", ves el inventario completo de áreas que componen tu página de bienvenida.',
        highlightText: 'Secciones: Hero, Categorías, Flash Deals, Prendas Populares, Reseñas, Instagram',
        actionRequired: 'Abrir administrador de secciones',
        screenType: 'design_sections',
      },
      {
        second: 9,
        label: '2. Interruptor On/Off de Secciones con 1 Clic',
        stepNumber: 2,
        screenPath: '/admin#theme-builder/sections/toggle',
        cursorTarget: { x: 75, y: 46, label: 'Apagar o encender módulo' },
        audioCaption: '¿No tienes descuentos este fin de semana? Apaga el módulo Flash Deals con un clic sin borrar su configuración para el futuro.',
        highlightText: 'Estado: Flash Deals [PAUSADO] • Hero y Catálogo [ACTIVOS]',
        actionRequired: 'Alternar visibilidad del módulo',
        screenType: 'design_sections',
      },
      {
        second: 18,
        label: '3. Mover Secciones para Mayor Conversión',
        stepNumber: 3,
        screenPath: '/admin#theme-builder/sections/reorder',
        cursorTarget: { x: 60, y: 62, label: 'Subir "Colecciones Populares"' },
        audioCaption: 'Prioriza las siluetas más demandadas posicionando las colecciones pesadas 450 GSM justo debajo de la portada.',
        highlightText: 'Flujo de ventas optimizado • Tiempo hasta la primera compra reducido a 2 minutos',
        actionRequired: 'Reordenar prioridad de secciones',
        screenType: 'design_sections',
      },
      {
        second: 27,
        label: '4. Comprobación en Smartphone',
        stepNumber: 4,
        screenPath: '/admin#theme-builder/mobile-view',
        cursorTarget: { x: 80, y: 78, label: 'Verificar en simulador móvil' },
        audioCaption: 'Comprueba cómo se comporta el scroll vertical en pantallas estrechas de teléfonos para garantizar que nada se desborde.',
        highlightText: '✅ 100% Responsivo en dispositivos móviles colombianos',
        actionRequired: 'Confirmar renderizado móvil perfecto',
        screenType: 'design_sections',
      },
    ],
  },
  {
    id: 'design_presets',
    title: 'Galería de Temas Preset y Exportar / Importar Copias de Seguridad JSON',
    shortTitle: 'Temas & Backup JSON',
    category: 'Diseño & Plantillas',
    durationSec: 36,
    durationFormatted: '02:05 min',
    tab: 'theme-builder',
    badge: 'BACKUP JSON',
    badgeColor: 'bg-cyan-600 text-white',
    icon: Sparkles,
    scenes: [
      {
        second: 0,
        label: '1. Galería de Temas Prediseñados',
        stepNumber: 1,
        screenPath: '/admin#theme-builder/gallery',
        cursorTarget: { x: 42, y: 22, label: 'Entrar a "2. Galería de Temas"' },
        audioCaption: 'La plataforma incluye estilos listos para usar: Acid Noir Streetwear, Quiet Luxury Studio, Cyberpunk Medellín y Clean Minimalist.',
        highlightText: 'Galería: 6 temas prediseñados de alto impacto visual',
        actionRequired: 'Explorar temas prediseñados',
        screenType: 'design_presets',
      },
      {
        second: 9,
        label: '2. Aplicar Tema con 1 Solo Clic',
        stepNumber: 2,
        screenPath: '/admin#theme-builder/gallery/apply',
        cursorTarget: { x: 65, y: 44, label: 'Clic en "Aplicar Tema"' },
        audioCaption: 'Al aplicar un tema, cambian los colores, tipografías y efectos visuales al instante sin tocar tus prendas ni precios ni inventario.',
        highlightText: 'Tema aplicado: Streetwear Acid Noir • Tu catálogo de productos se conserva intacto',
        actionRequired: 'Aplicar preset seleccionado',
        screenType: 'design_presets',
      },
      {
        second: 18,
        label: '3. Exportar Código JSON de Respaldo',
        stepNumber: 3,
        screenPath: '/admin#theme-builder/export',
        cursorTarget: { x: 50, y: 64, label: 'Clic en "Copiar Código JSON"' },
        audioCaption: 'En la pestaña Exportar/Importar, puedes copiar la cadena JSON de tu diseño para guardarla como copia de seguridad en tu computadora.',
        highlightText: 'Copia de seguridad: Respaldo JSON copiado al portapapeles exitosamente',
        actionRequired: 'Exportar respaldo seguro',
        screenType: 'design_presets',
      },
      {
        second: 27,
        label: '4. Importar o Restaurar Diseño de Fábrica',
        stepNumber: 4,
        screenPath: '/admin#theme-builder/import',
        cursorTarget: { x: 76, y: 82, label: 'Pegar JSON y Restaurar' },
        audioCaption: 'Si deseas transferir tu diseño a otra tienda o restaurar un estilo anterior, pegas el código JSON y se aplica en menos de 1 segundo.',
        highlightText: '✅ Configuración restaurada con éxito • 0 riesgo de pérdida de estilo',
        actionRequired: 'Importar diseño desde JSON',
        screenType: 'design_presets',
      },
    ],
  },
  {
    id: 'orders',
    title: 'Cómo Despachar Pedidos Wompi y Notificar al Cliente',
    shortTitle: 'Despachos & Wompi',
    category: 'Logística & Pagos',
    durationSec: 36,
    durationFormatted: '01:45 min',
    tab: 'orders',
    badge: 'URGENTE DIARIO',
    badgeColor: 'bg-indigo-600 text-white',
    icon: ShoppingBag,
    scenes: [
      {
        second: 0,
        label: '1. Verificar Pago APROBADO',
        stepNumber: 1,
        screenPath: '/admin#orders',
        cursorTarget: { x: 78, y: 44, label: 'Clic en "Ver Detalle"' },
        audioCaption: 'Cuando entra una venta, revisas la referencia y confirmas el estado APROBADO en verde de Wompi Bancolombia.',
        highlightText: 'Referencia #ORD-2026-1001 • Total: $249.900 COP • Estado: APROBADO',
        actionRequired: 'Clic en el botón "Ver Detalle" de la orden',
        screenType: 'orders_list',
      },
      {
        second: 9,
        label: '2. Abrir Modal de Despacho',
        stepNumber: 2,
        screenPath: '/admin#orders-detail',
        cursorTarget: { x: 62, y: 56, label: 'Seleccionar Coordinadora' },
        audioCaption: 'Se abre la ventana emergente con la dirección de entrega del cliente y el selector de transportadora nacional.',
        highlightText: 'Destino: Medellín / Envigado • Cliente: Carlos Mendoza • Celular: 312 456 7890',
        actionRequired: 'Seleccionar empresa de envío (Coordinadora / Servientrega)',
        screenType: 'orders_modal',
      },
      {
        second: 18,
        label: '3. Asignar Número de Guía',
        stepNumber: 3,
        screenPath: '/admin#orders-detail',
        cursorTarget: { x: 55, y: 68, label: 'Escribir guía CO-789234812' },
        audioCaption: 'Digitas el número de guía suministrado en el punto de envío o plataforma logística.',
        highlightText: 'Guía Nacional: CO-789234812 • Rótulo generado exitosamente',
        actionRequired: 'Ingresar el código de rastreo',
        screenType: 'orders_modal',
      },
      {
        second: 27,
        label: '4. Marcar ENVIADO y Disparar WhatsApp',
        stepNumber: 4,
        screenPath: '/admin#orders',
        cursorTarget: { x: 82, y: 84, label: 'Clic en "Guardar y Notificar WhatsApp"' },
        audioCaption: 'Al pulsar Guardar, el sistema actualiza el pedido a "EN RUTA" y dispara un mensaje oficial de WhatsApp al cliente con el enlace de seguimiento en vivo.',
        highlightText: '✅ Estado actualizado: EN RUTA • Notificación WhatsApp enviada al comprador',
        actionRequired: 'Guardar y confirmar envío',
        screenType: 'orders_list',
      },
    ],
  },
  {
    id: 'video',
    title: 'Subir Video desde PC y Ajustar Tamaño 100% Pantalla Sin Cortes',
    shortTitle: 'Video de Portada',
    category: 'Diseño & Hero',
    durationSec: 36,
    durationFormatted: '02:10 min',
    tab: 'theme-builder',
    badge: 'NUEVO AJUSTE',
    badgeColor: 'bg-purple-600 text-white',
    icon: Film,
    scenes: [
      {
        second: 0,
        label: '1. Cargar Video Local de tu PC',
        stepNumber: 1,
        screenPath: '/admin#theme-builder/hero',
        cursorTarget: { x: 42, y: 38, label: 'Clic en "Subir Video Local"' },
        audioCaption: 'En el diseñador de portada, tocas el botón "Subir Video Local" y escoges tu archivo MP4 o WebM grabado para tu marca.',
        highlightText: 'Archivo seleccionado: drop_streetwear_urban_2026.mp4 (4.2 MB)',
        actionRequired: 'Cargar archivo de video local sin restricciones',
        screenType: 'video_upload',
      },
      {
        second: 9,
        label: '2. Compresión Ultraligera Automática',
        stepNumber: 2,
        screenPath: '/admin#theme-builder/compressor',
        cursorTarget: { x: 50, y: 52, label: 'Optimización inteligente lista' },
        audioCaption: 'El algoritmo comprime el video a menos de 5MB manteniendo resolución HD para que cargue en 0.4 segundos en celulares colombianos.',
        highlightText: 'Compresión: 68% de reducción • Carga ultra rápida en redes 4G/5G',
        actionRequired: 'Validar compresión ligera',
        screenType: 'video_upload',
      },
      {
        second: 18,
        label: '3. Activar "Ajuste Completo" (Sin Recortes)',
        stepNumber: 3,
        screenPath: '/admin#theme-builder/hero-sizing',
        cursorTarget: { x: 65, y: 48, label: 'Seleccionar "Ajuste Completo"' },
        audioCaption: 'Seleccionas el modo "Ajuste Completo (Fit Contain)" para que el 100% de la escena del video se vea sin cortar nada ni arriba ni a los lados.',
        highlightText: 'Modo Activo: Ajuste Completo (100% visible sin recortes)',
        actionRequired: 'Alternar modo de ajuste y encuadre',
        screenType: 'video_scale',
      },
      {
        second: 27,
        label: '4. Vista Previa Móvil & Desktop',
        stepNumber: 4,
        screenPath: '/admin#theme-builder/preview',
        cursorTarget: { x: 80, y: 76, label: 'Clic en "Guardar y Ver en Tienda"' },
        audioCaption: 'Listo. El video se acomoda automáticamente a pantallas verticales de celular y monitores panorámicos de computador.',
        highlightText: 'Adaptabilidad: 100% responsivo • Compatible iPhone, Android y PC',
        actionRequired: 'Publicar cambios en la portada',
        screenType: 'video_scale',
      },
    ],
  },
  {
    id: 'catalog',
    title: 'Crear Prendas, Tallas S a XL y Algodón Pesado 450 GSM',
    shortTitle: 'Catálogo & Tallas',
    category: 'Catálogo & SKUs',
    durationSec: 36,
    durationFormatted: '01:55 min',
    tab: 'catalog',
    badge: '450 GSM',
    badgeColor: 'bg-amber-600 text-white',
    icon: Package,
    scenes: [
      {
        second: 0,
        label: '1. Pulsar "+ Nuevo Producto"',
        stepNumber: 1,
        screenPath: '/admin#catalog',
        cursorTarget: { x: 84, y: 22, label: 'Clic en "+ Nuevo Producto"' },
        audioCaption: 'Entras al Gestor de Catálogo y pulsas el botón superior derecho para registrar una nueva prenda en el inventario.',
        highlightText: 'Catálogo Tu Tienda a la Mano • Inventario sincronizado en tiempo real',
        actionRequired: 'Abrir formulario de creación',
        screenType: 'catalog_create',
      },
      {
        second: 9,
        label: '2. Título, Categoría y Fotos HD',
        stepNumber: 2,
        screenPath: '/admin#catalog/modal',
        cursorTarget: { x: 45, y: 42, label: 'Escribir "Hoodie Acid Wash 450 GSM"' },
        audioCaption: 'Escribes el nombre de la silueta, seleccionas la categoría ("Hoodies & Buzos") y subes las fotos con fondo de estudio.',
        highlightText: 'Prenda: Hoodie Acid Wash • Precio: $189.900 COP • Categoría: Hoodies & Buzos',
        actionRequired: 'Completar información básica y galería',
        screenType: 'catalog_create',
      },
      {
        second: 18,
        label: '3. Activar Tallas y Gramaje 450 GSM',
        stepNumber: 3,
        screenPath: '/admin#catalog/modal',
        cursorTarget: { x: 60, y: 64, label: 'Activar S, M, L, XL con stock' },
        audioCaption: 'Configuras las tallas disponibles y el stock por cada una (por ejemplo: S: 15, M: 25, L: 30, XL: 20 unidades).',
        highlightText: 'Variantes: 4 tallas activas • Stock Total: 90 unidades • Gramaje: 450 GSM Heavyweight',
        actionRequired: 'Definir variantes de inventario',
        screenType: 'catalog_create',
      },
      {
        second: 27,
        label: '4. Publicar y Probar el Botón "Ver Prenda"',
        stepNumber: 4,
        screenPath: '/admin#catalog/preview',
        cursorTarget: { x: 74, y: 52, label: 'Clic en "Ver Prenda"' },
        audioCaption: 'Pulsas Publicar y utilizas el nuevo botón "Ver Prenda" para inspeccionar la ficha técnica sin salir de tu panel.',
        highlightText: '✅ Prenda publicada con éxito en la vitrina pública de clientes',
        actionRequired: 'Verificar en el modal de vista previa in-admin',
        screenType: 'catalog_preview',
      },
    ],
  },
  {
    id: 'navbar',
    title: 'Editar Barra Superior (Navbar), Quitar Categorías y Navegar',
    shortTitle: 'Navbar & Categorías',
    category: 'Diseño & Menús',
    durationSec: 36,
    durationFormatted: '02:00 min',
    tab: 'theme-builder',
    badge: 'NAVBAR',
    badgeColor: 'bg-teal-600 text-white',
    icon: Compass,
    scenes: [
      {
        second: 0,
        label: '1. Entrar al Administrador de Navbar',
        stepNumber: 1,
        screenPath: '/admin#theme-builder/navbar',
        cursorTarget: { x: 48, y: 35, label: 'Abrir sección "Barra Superior"' },
        audioCaption: 'En Personalizar Tema, seleccionas el módulo "Barra Superior (Navbar) & Quitar/Editar Categorías".',
        highlightText: 'Menú Superior: 6 categorías configuradas actualmente',
        actionRequired: 'Abrir configuración del navbar',
        screenType: 'navbar_edit',
      },
      {
        second: 9,
        label: '2. Ocultar o Reordenar Categorías',
        stepNumber: 2,
        screenPath: '/admin#theme-builder/navbar',
        cursorTarget: { x: 72, y: 48, label: 'Desactivar o arrastrar categoría' },
        audioCaption: 'Puedes apagar categorías que no quieras mostrar con el switch de 1-clic o reordenar su posición visual.',
        highlightText: 'Categorías visibles: Hoodies, Camisetas Boxy, Pantalones Cargo, Accesorios',
        actionRequired: 'Ajustar la visibilidad de los enlaces',
        screenType: 'navbar_edit',
      },
      {
        second: 18,
        label: '3. Crear Producto con Categoría Dinámica',
        stepNumber: 3,
        screenPath: '/admin#catalog/new',
        cursorTarget: { x: 55, y: 60, label: 'Seleccionar categoría del navbar' },
        audioCaption: 'Al crear una prenda, el selector se sincroniza con tus enlaces configurados.',
        highlightText: 'Sincronización bidireccional entre catálogo y barra superior',
        actionRequired: 'Vincular prenda a categoría del menú',
        screenType: 'navbar_edit',
      },
      {
        second: 27,
        label: '4. Navegación Automática al Publicar',
        stepNumber: 4,
        screenPath: '/store#categoria',
        cursorTarget: { x: 68, y: 75, label: 'Navegación automática a la vitrina' },
        audioCaption: 'Al publicar la prenda, la tienda filtra automáticamente la categoría para verificar su presencia al instante.',
        highlightText: '✅ Filtro automático aplicado: la prenda aparece de primera en el drop',
        actionRequired: 'Comprobar filtrado en vivo en la tienda',
        screenType: 'navbar_edit',
      },
    ],
  },
  {
    id: 'domain',
    title: 'Conectar Dominio .COM, Certificado SSL y Pasarela Wompi',
    shortTitle: 'Dominio & Pasarela',
    category: 'Infraestructura',
    durationSec: 36,
    durationFormatted: '02:15 min',
    tab: 'domain-trust',
    badge: 'VITAL',
    badgeColor: 'bg-blue-600 text-white',
    icon: Globe,
    scenes: [
      {
        second: 0,
        label: '1. Configuración de Registros DNS CNAME',
        stepNumber: 1,
        screenPath: '/admin#domain-trust',
        cursorTarget: { x: 52, y: 36, label: 'Copiar registro CNAME oficial' },
        audioCaption: 'En el Gestor de Dominio, copias el registro oficial que apunta a los servidores de Google Cloud Run.',
        highlightText: 'Registro CNAME: ghs.googlehosted.com • Destino: opusindustri.com',
        actionRequired: 'Copiar datos DNS para Cloudflare o Porkbun',
        screenType: 'domain_dns',
      },
      {
        second: 9,
        label: '2. Candado HTTPS SSL de 256 Bits',
        stepNumber: 2,
        screenPath: '/admin#domain-trust',
        cursorTarget: { x: 70, y: 48, label: 'Verificar certificado SSL activo' },
        audioCaption: 'El sistema emite el certificado criptográfico de forma automática y gratuita, asegurando pagos confiables.',
        highlightText: 'Seguridad: Cifrado TLS 1.3 • Candado verde activo en navegadores',
        actionRequired: 'Confirmar cifrado en vivo',
        screenType: 'domain_dns',
      },
      {
        second: 18,
        label: '3. Verificación de Llaves Wompi Producción',
        stepNumber: 3,
        screenPath: '/admin#settings/wompi',
        cursorTarget: { x: 60, y: 62, label: 'Comprobar llaves públicas y privadas' },
        audioCaption: 'Verificas que tus llaves pub_prod y prv_prod se comuniquen directamente con Bancolombia.',
        highlightText: 'Wompi Bancolombia: Conexión confirmada (148 ms de latencia)',
        actionRequired: 'Comprobar estado del webhook HMAC SHA-256',
        screenType: 'domain_dns',
      },
      {
        second: 27,
        label: '4. Conciliación y Dispersión de Fondos',
        stepNumber: 4,
        screenPath: '/admin#wompi-reconciliation',
        cursorTarget: { x: 80, y: 78, label: 'Revisar saldo y transferencias T+1' },
        audioCaption: 'Las ganancias por ventas se dispersan a tu cuenta bancaria de Colombia sin demoras.',
        highlightText: '✅ Dispersión bancaria: T+1 Bancolombia • Comisión: 2.65% + $700 COP',
        actionRequired: 'Consultar saldo disponible para retiro',
        screenType: 'domain_dns',
      },
    ],
  },
];

export const SystemVideoTutorialModal: React.FC = () => {
  const {
    systemVideoTutorialOpen,
    setSystemVideoTutorialOpen,
    activeSystemVideoId,
    setActiveSystemVideoId,
    setAdminTab,
    showToast,
  } = useStore();

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentSec, setCurrentSec] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isClicking, setIsClicking] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'design' | 'operations'>('all');

  const containerRef = useRef<HTMLDivElement>(null);

  const tutorials = SYSTEM_TUTORIALS;

  const filteredTutorials = tutorials.filter((tut) => {
    if (selectedCategory === 'design') return tut.tab === 'theme-builder';
    if (selectedCategory === 'operations') return tut.tab !== 'theme-builder';
    return true;
  });

  const currentTutorial = tutorials.find((t) => t.id === activeSystemVideoId) || tutorials[0];

  // Determine active scene based on currentSec
  const currentSceneIndex = currentTutorial.scenes.findIndex((scene, idx, arr) => {
    const nextScene = arr[idx + 1];
    if (!nextScene) return true;
    return currentSec >= scene.second && currentSec < nextScene.second;
  });

  const activeScene = currentTutorial.scenes[currentSceneIndex >= 0 ? currentSceneIndex : 0];

  // Video playback loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && systemVideoTutorialOpen) {
      timer = setInterval(() => {
        setCurrentSec((prev) => {
          if (prev >= currentTutorial.durationSec) {
            return 0; // loop
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, systemVideoTutorialOpen, currentTutorial.durationSec, playbackSpeed]);

  // Animate cursor towards scene target
  useEffect(() => {
    if (!systemVideoTutorialOpen || !activeScene) return;
    const target = activeScene.cursorTarget;
    // Animate smoothly
    setCursorPosition({ x: target.x, y: target.y });
    // Trigger simulated click
    const clickTimer = setTimeout(() => {
      setIsClicking(true);
      setTimeout(() => setIsClicking(false), 300);
    }, 1200);
    return () => clearTimeout(clickTimer);
  }, [
    systemVideoTutorialOpen,
    activeScene?.cursorTarget?.x,
    activeScene?.cursorTarget?.y,
    currentSceneIndex,
    activeSystemVideoId,
  ]);

  // Reset timer on tutorial switch
  const handleSelectTutorial = (id: string) => {
    setActiveSystemVideoId(id);
    setCurrentSec(0);
    setIsPlaying(true);
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(activeScene.audioCaption);
    setCopiedCaption(true);
    showToast('Instrucción copiada al portapapeles');
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  const handleGoToTool = () => {
    setAdminTab(currentTutorial.tab);
    setSystemVideoTutorialOpen(false);
    showToast(`Navegando a ${currentTutorial.shortTitle} para probar la función`);
  };

  if (!systemVideoTutorialOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className={`bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-white transition-all duration-300 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl max-h-[94vh]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="p-3.5 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Play className="w-4 h-4 fill-white translate-x-0.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-white tracking-tight truncate">
                  Videos Tutoriales & Grabaciones Reales del Sistema
                </h3>
                <span className="hidden sm:inline-flex text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  1080P 60FPS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Mira cómo se usan los botones y funciones con capturas reales de la plataforma
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setSystemVideoTutorialOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500 transition-colors cursor-pointer"
              title="Cerrar reproductor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Tutorial Selector Pills & Category Tabs */}
        <div className="px-3.5 py-2.5 bg-slate-900/80 border-b border-slate-800 flex flex-col gap-2 shrink-0 text-xs">
          {/* Category Tabs */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-0.5">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Módulo:</span>
              </span>
              {[
                { id: 'all', label: `Todos los Videos (${tutorials.length})` },
                { id: 'design', label: `🎨 Módulo de Diseño Completo (${tutorials.filter((t) => t.tab === 'theme-builder').length})` },
                { id: 'operations', label: `📦 Operaciones & Logística (${tutorials.filter((t) => t.tab !== 'theme-builder').length})` },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm ring-1 ring-purple-400'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <span className="text-[9px] font-mono text-purple-300 font-bold shrink-0 hidden md:inline bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
              6 Videos de Diseño Web Disponibles
            </span>
          </div>

          {/* Videos Pill Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {filteredTutorials.map((tut) => {
              const isSelected = tut.id === activeSystemVideoId;
              const Icon = tut.icon;
              const isDesign = tut.tab === 'theme-builder';
              return (
                <button
                  key={tut.id}
                  type="button"
                  onClick={() => handleSelectTutorial(tut.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md shadow-rose-900/30 ring-1 ring-white/50'
                      : isDesign
                      ? 'bg-purple-950/40 text-purple-200 hover:bg-purple-900/60 hover:text-white border border-purple-500/40'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tut.shortTitle}</span>
                  <span className="text-[9px] font-mono opacity-80">{tut.durationFormatted}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row min-h-0">
          {/* Left/Center: Video Canvas & Simulated Live Platform Screen */}
          <div className="flex-1 flex flex-col p-3 sm:p-5 justify-between bg-slate-950 min-h-[340px] sm:min-h-[460px]">
            {/* Screencast Player Container */}
            <div className="relative aspect-16/9 w-full bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col select-none">
              {/* Simulated Browser Chrome / Top Bar */}
              <div className="px-3.5 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span className="text-slate-300 font-bold truncate max-w-[200px] sm:max-w-none">
                      https://opusindustri.com{activeScene.screenPath}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-rose-500 text-white px-1.5 py-0.2 rounded animate-pulse">
                    REC LIVE
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">60 FPS</span>
                </div>
              </div>

              {/* Simulated Platform Screen Content */}
              <div className="flex-1 relative bg-slate-900 overflow-hidden flex flex-col">
                {/* Visual UI Simulation based on scene type */}
                {activeScene.screenType === 'orders_list' && (
                  <div className="p-4 space-y-3 font-sans text-xs">
                    <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-indigo-400" />
                        <span className="font-black text-white text-xs">Órdenes & Despachos Nacionales</span>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                        WOMPI ACTIVO
                      </span>
                    </div>

                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-2.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                        <div className="font-mono">
                          <span className="text-indigo-400 font-bold">ORD-2026-1001</span>
                          <span className="block text-[9px] text-slate-500">Carlos Mendoza • Envigado</span>
                        </div>
                        <div className="font-mono font-bold text-white">$249.900 COP</div>
                        <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          APROBADO
                        </span>
                        <div
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            isClicking ? 'bg-indigo-500 text-white scale-95 ring-2 ring-indigo-400' : 'bg-indigo-600 text-white'
                          }`}
                        >
                          Ver Detalle
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeScene.screenType === 'orders_modal' && (
                  <div className="p-4 flex items-center justify-center h-full">
                    <div className="bg-slate-950 border border-indigo-500/50 rounded-2xl p-4 max-w-sm w-full space-y-3 shadow-2xl">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-xs text-white">Detalle de Despacho Wompi</span>
                        <span className="text-[10px] text-indigo-300 font-mono">ORD-2026-1001</span>
                      </div>
                      <div className="space-y-1.5 text-[11px]">
                        <label className="text-slate-400 block text-[10px]">Número de Guía Nacional:</label>
                        <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg font-mono text-emerald-400 font-bold flex items-center justify-between">
                          <span>CO-789234812</span>
                          <span className="text-[9px] text-slate-500">Coordinadora</span>
                        </div>
                      </div>
                      <div
                        className={`w-full py-2 rounded-xl text-center font-bold text-xs transition-all ${
                          isClicking ? 'bg-emerald-500 text-slate-950 scale-95' : 'bg-emerald-600 text-white'
                        }`}
                      >
                        Guardar y Notificar WhatsApp
                      </div>
                    </div>
                  </div>
                )}

                {activeScene.screenType === 'video_upload' && (
                  <div className="p-4 space-y-3 h-full flex flex-col justify-center max-w-md mx-auto">
                    <div className="bg-slate-950 border border-purple-500/50 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Film className="w-4 h-4 text-purple-400" />
                        <span className="font-bold text-xs text-white">Subir Video de Portada desde PC</span>
                      </div>
                      <div
                        className={`border-2 border-dashed border-purple-500/40 rounded-xl p-4 text-center space-y-1 ${
                          isClicking ? 'bg-purple-900/30 border-purple-400 scale-98' : 'bg-slate-900/60'
                        }`}
                      >
                        <span className="text-xs text-purple-200 font-bold block">drop_streetwear_2026.mp4</span>
                        <span className="text-[10px] text-slate-400 block">Compresión inteligente: 4.2 MB (Óptimo)</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeScene.screenType === 'video_scale' && (
                  <div className="p-4 space-y-3 h-full flex flex-col justify-center max-w-md mx-auto">
                    <div className="bg-slate-950 border border-indigo-500/50 rounded-2xl p-4 space-y-3">
                      <span className="font-bold text-xs text-white block">Ajuste de Visualización (Todo Tipo de Pantallas)</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isClicking
                              ? 'bg-indigo-600 border-indigo-400 text-white ring-2 ring-indigo-400'
                              : 'bg-indigo-600/30 border-indigo-500/80 text-white font-bold'
                          }`}
                        >
                          <span>Ajuste Completo</span>
                          <span className="block text-[9px] text-indigo-300">100% Sin Cortes</span>
                        </div>
                        <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-500 text-center">
                          <span>Recorte Cover</span>
                          <span className="block text-[9px]">Llenado de marco</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeScene.screenType === 'catalog_create' && (
                  <div className="p-4 flex items-center justify-center h-full">
                    <div className="bg-slate-950 border border-amber-500/50 rounded-2xl p-4 max-w-sm w-full space-y-2.5">
                      <span className="font-bold text-xs text-white block">Creación de Prenda de Alta Densidad</span>
                      <div className="space-y-1 text-[11px]">
                        <span className="text-slate-400 text-[10px]">Nombre de la Prenda:</span>
                        <div className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white font-bold">
                          Hoodie Acid Wash Oversized
                        </div>
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        {['S', 'M', 'L', 'XL'].map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-indigo-900/40 text-indigo-200 border border-indigo-700 text-[10px] font-mono font-bold">
                            {s}: 20 uds
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-amber-400 font-bold block pt-1">
                        ALGODÓN PERCHADO 450 GSM CONFIRMADO
                      </span>
                    </div>
                  </div>
                )}

                {activeScene.screenType === 'catalog_preview' && (
                  <div className="p-4 flex items-center justify-center h-full">
                    <div className="bg-slate-950 border border-emerald-500/50 rounded-2xl p-4 max-w-sm w-full space-y-2.5 text-center">
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full inline-block">
                        VISTA PREVIA IN-ADMIN ACTIVA
                      </span>
                      <h4 className="text-sm font-black text-white">Hoodie Acid Wash Oversized</h4>
                      <p className="text-xs font-mono text-emerald-400 font-bold">$189.900 COP • 450 GSM</p>
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold">
                          Ver en Tienda
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold">
                          Editar
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeScene.screenType === 'navbar_edit' && (
                  <div className="p-4 space-y-2.5 max-w-sm mx-auto h-full flex flex-col justify-center">
                    <div className="bg-slate-950 border border-teal-500/50 rounded-2xl p-4 space-y-2">
                      <span className="font-bold text-xs text-white block">Barra Superior (Navbar) & Categorías</span>
                      <div className="space-y-1 text-[10px]">
                        {['Hoodies & Buzos', 'Camisetas Boxy', 'Pantalones Cargo'].map((c, i) => (
                          <div key={c} className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
                            <span className="text-slate-200 font-bold">{i + 1}. {c}</span>
                            <span className="text-emerald-400 font-mono font-bold">ACTIVO</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeScene.screenType === 'domain_dns' && (
                  <div className="p-4 space-y-2.5 max-w-sm mx-auto h-full flex flex-col justify-center">
                    <div className="bg-slate-950 border border-blue-500/50 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">Dominio .COM & Certificado SSL</span>
                        <span className="text-[10px] font-mono text-blue-400">DNS VERIFICADO</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg font-mono text-[10px] text-slate-300 space-y-1">
                        <div>CNAME: ghs.googlehosted.com</div>
                        <div className="text-emerald-400 font-bold">SSL 256 Bits: Habilitado</div>
                        <div className="text-indigo-400 font-bold">Wompi Bancolombia: Operativo</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1. MÓDULO DE DISEÑO: TOUR COMPLETO 360° */}
                {activeScene.screenType === 'design_tour' && (
                  <div className="p-3 sm:p-4 space-y-2.5 h-full flex flex-col justify-between font-sans text-xs">
                    {/* Simulated ThemeBuilder Top Subtabs */}
                    <div className="bg-slate-950 p-2 rounded-xl border border-purple-500/40 flex items-center justify-between gap-1 overflow-x-auto">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded-lg bg-purple-600 text-white font-mono text-[10px] font-bold flex items-center gap-1">
                          <Sliders className="w-3 h-3 text-emerald-300" />
                          <span>1. Personalizador Rápido</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-slate-400 font-mono text-[10px] hidden sm:inline">
                          2. Temas Preset
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-slate-400 font-mono text-[10px] hidden sm:inline">
                          3. WordPress Visual
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-slate-400 font-mono text-[10px] hidden md:inline">
                          4. Respaldo JSON
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white font-mono font-bold flex items-center gap-0.5">
                          <Monitor className="w-2.5 h-2.5" /> PC
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-slate-400 flex items-center gap-0.5">
                          <Tablet className="w-2.5 h-2.5" /> Tab
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-slate-400 flex items-center gap-0.5">
                          <Smartphone className="w-2.5 h-2.5" /> Cel
                        </span>
                      </div>
                    </div>

                    {/* Simulated Live Viewport Preview Canvas */}
                    <div className="flex-1 bg-gradient-to-b from-zinc-950 via-zinc-900 to-black rounded-xl border border-slate-800 p-3 flex flex-col justify-between relative overflow-hidden shadow-inner">
                      {/* Simulated Brand Header */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white tracking-widest text-xs">TU TIENDA A LA MANO</span>
                          <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                            450 GSM HEAVYWEIGHT
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-300">
                          <span>Hoodies</span>
                          <span>Buzos</span>
                          <span>Cargos</span>
                        </div>
                      </div>

                      {/* Simulated Hero Scene */}
                      <div className="my-auto text-center space-y-1.5 py-2">
                        <span className="text-[9px] font-mono font-bold text-indigo-400 tracking-widest uppercase">
                          NUEVA COLECCIÓN STREETWEAR MEDELLÍN
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                          SILUETAS ACID WASH DE ALTA DENSIDAD
                        </h3>
                        <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                          Algodón perchado 450 gramos con fit oversize y costuras de refuerzo industrial.
                        </p>
                        <div className="pt-1 flex items-center justify-center gap-2">
                          <span className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[10px] shadow-lg shadow-emerald-500/20">
                            Comprar Drop Ahora
                          </span>
                          <span className="px-3 py-1 rounded-lg bg-white/10 text-white font-bold text-[10px] border border-white/20">
                            Ver Lookbook
                          </span>
                        </div>
                      </div>

                      {/* Live Reactive Badge */}
                      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[9px] font-mono text-slate-500">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Edición Reactiva en Tiempo Real
                        </span>
                        <span>Sincronización Wompi & Catálogo OK</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. MÓDULO DE DISEÑO: COLORES, LOGOS & TIPOGRAFÍAS */}
                {activeScene.screenType === 'design_styling' && (
                  <div className="p-3 sm:p-4 space-y-3 h-full flex flex-col justify-center max-w-lg mx-auto font-sans text-xs">
                    <div className="bg-slate-950 border border-violet-500/40 rounded-2xl p-3.5 space-y-3 shadow-xl">
                      {/* Logo Section */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white text-xs block">Logo Oficial de la Tienda</span>
                          <span className="text-[10px] text-slate-400">PNG transparente (36px a 48px de altura)</span>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-violet-400/40 flex items-center gap-1.5 text-violet-300 font-mono text-[10px] font-bold">
                          <Upload className="w-3 h-3" />
                          <span>Logo_Opus.png</span>
                        </div>
                      </div>

                      {/* Color Palette Row */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-slate-300">Paleta de Color de Marca:</span>
                          <span className="font-mono text-emerald-400 font-bold">Onyx Black & Emerald Active</span>
                        </div>
                        <div className="grid grid-cols-6 gap-1.5">
                          {[
                            { name: 'Onyx', bg: 'bg-zinc-950', ring: 'ring-2 ring-emerald-400' },
                            { name: 'Indigo', bg: 'bg-indigo-700', ring: '' },
                            { name: 'Noir', bg: 'bg-black', ring: '' },
                            { name: 'Bronze', bg: 'bg-amber-900', ring: '' },
                            { name: 'Cobalt', bg: 'bg-blue-600', ring: '' },
                            { name: 'Rose', bg: 'bg-rose-800', ring: '' },
                          ].map((p, i) => (
                            <div
                              key={i}
                              className={`h-7 rounded-lg ${p.bg} border border-slate-700 flex items-center justify-center text-[9px] font-mono text-white font-bold cursor-pointer transition-all ${
                                p.ring || ''
                              }`}
                            >
                              {p.name}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Typography & Buttons Preview */}
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 block font-mono">Bordes de Botones:</span>
                          <span className="text-xs font-black text-white">12px Curvatura Urbana</span>
                        </div>
                        <div
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all shadow-md ${
                            isClicking ? 'bg-emerald-400 text-slate-950 scale-95' : 'bg-emerald-500 text-slate-950'
                          }`}
                        >
                          Vista Botón CTA
                        </div>
                      </div>

                      {/* Persuasive Announcement Bar */}
                      <div className="p-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-center">
                        <span className="text-[10px] font-mono font-bold text-indigo-300">
                          🚚 ENVÍO GRATIS EN COLOMBIA POR COMPRAS SUPERIORES A $200.000 COP
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. MÓDULO DE DISEÑO: CONSTRUCTOR WORDPRESS VISUAL */}
                {activeScene.screenType === 'design_builder' && (
                  <div className="p-3 sm:p-4 space-y-2 h-full flex flex-col justify-between font-sans text-xs">
                    {/* Visual Gutenberg Toolbar */}
                    <div className="bg-slate-950 p-2 rounded-xl border border-emerald-500/40 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono font-bold flex items-center gap-1">
                          <Layers className="w-3 h-3" /> WordPress Visual
                        </span>
                        <span className="text-slate-400 font-mono hidden sm:inline">Editor Modular de Bloques</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono font-bold cursor-pointer">
                          + Añadir Bloque
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-bold">
                          Guardar
                        </span>
                      </div>
                    </div>

                    {/* Stack of Visual Draggable Blocks */}
                    <div className="flex-1 space-y-1.5 overflow-y-auto">
                      {[
                        { title: '1. Bloque: Hero Slider Multimedia', detail: 'Video HD con botones de compra superpuestos', tag: 'HERO', border: 'border-purple-500/60' },
                        { title: '2. Bloque: Banner Cuenta Regresiva 24H', detail: 'Cronómetro regresivo animado para drops exclusivos', tag: 'VENTAS', border: 'border-amber-500/60' },
                        { title: '3. Bloque: Grilla de Prendas 450 GSM', detail: 'Filtro por siluetas (Hoodies, Boxy Tees, Joggers)', tag: 'CATÁLOGO', border: 'border-emerald-500/60' },
                        { title: '4. Bloque: Testimonios en Carrusel', detail: 'Calificaciones 5 estrellas verificadas de clientes', tag: 'SOCIAL', border: 'border-indigo-500/60' },
                      ].map((blk, idx) => (
                        <div
                          key={idx}
                          className={`p-2 sm:p-2.5 rounded-xl bg-slate-950 border ${blk.border} flex items-center justify-between gap-2 shadow-xs transition-all ${
                            isClicking && idx === 1 ? 'ring-2 ring-amber-400 scale-98 bg-slate-900' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-mono text-[10px] cursor-grab">↕️</span>
                            <div>
                              <span className="font-bold text-white text-xs block leading-tight">{blk.title}</span>
                              <span className="text-[10px] text-slate-400">{blk.detail}</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[9px] font-bold shrink-0 border border-slate-800">
                            {blk.tag}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Block Inspector Footer */}
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Inspector: Margen 48px • Fondo degradado #09090b</span>
                      <span className="text-emerald-400 font-bold">100% Responsive</span>
                    </div>
                  </div>
                )}

                {/* 4. MÓDULO DE DISEÑO: SECCIONES & BLOQUES DE LA TIENDA */}
                {activeScene.screenType === 'design_sections' && (
                  <div className="p-3 sm:p-4 space-y-2 h-full flex flex-col justify-between font-sans text-xs">
                    <div className="bg-slate-950 p-2 rounded-xl border border-amber-500/40 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Layout className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-bold text-white text-xs">Administrador de Secciones de Vitrina</span>
                      </div>
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        6 MÓDULOS DISPONIBLES
                      </span>
                    </div>

                    {/* Interactive Sections List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 flex-1 overflow-y-auto">
                      {[
                        { name: 'Portada Hero & Video', status: 'VISIBLE', color: 'text-emerald-400' },
                        { name: 'Categorías Destacadas', status: 'VISIBLE', color: 'text-emerald-400' },
                        { name: 'Flash Deals (Ofertas)', status: 'VISIBLE', color: 'text-emerald-400' },
                        { name: 'Colecciones Populares', status: 'VISIBLE', color: 'text-emerald-400' },
                        { name: 'Reseñas 5 Estrellas', status: 'VISIBLE', color: 'text-emerald-400' },
                        { name: 'Lookbook Instagram Feed', status: 'VISIBLE', color: 'text-emerald-400' },
                      ].map((sec, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded bg-slate-900 border border-slate-700 text-slate-400 font-mono text-[9px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-white font-bold text-xs">{sec.name}</span>
                          </div>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 ${sec.color}`}>
                            {sec.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Pro Tip Note */}
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[10px]">
                      <span className="text-slate-300 font-medium">Puedes reordenar las secciones para destacar tus mejores prendas arriba.</span>
                      <span className="text-amber-400 font-mono font-bold shrink-0">Mayor Conversión</span>
                    </div>
                  </div>
                )}

                {/* 5. MÓDULO DE DISEÑO: TEMAS PRESET & RESPALDO JSON */}
                {activeScene.screenType === 'design_presets' && (
                  <div className="p-3 sm:p-4 space-y-2.5 h-full flex flex-col justify-between font-sans text-xs">
                    <div className="bg-slate-950 p-2 rounded-xl border border-cyan-500/40 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-bold text-white text-xs">Galería de Temas Preset & Copias JSON</span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                        1-CLIC PRESETS
                      </span>
                    </div>

                    {/* Presets Cards Row */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { title: 'Streetwear Acid Noir', style: 'border-emerald-500 bg-emerald-950/30', badge: 'ACTIVO' },
                        { title: 'Quiet Luxury Studio', style: 'border-amber-500/40 bg-slate-900', badge: 'PRESET' },
                        { title: 'Cyberpunk Medellín', style: 'border-blue-500/40 bg-slate-900', badge: 'PRESET' },
                      ].map((t, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border ${t.style} space-y-1.5 transition-all text-center ${
                            isClicking && idx === 0 ? 'scale-98 ring-2 ring-emerald-400' : ''
                          }`}
                        >
                          <span className="text-[9px] font-mono font-bold text-slate-400 block">{t.badge}</span>
                          <span className="font-black text-white text-xs block leading-tight">{t.title}</span>
                          <span className="text-[9px] font-mono text-emerald-400 font-bold block">Aplicar Tema</span>
                        </div>
                      ))}
                    </div>

                    {/* JSON Backup Code Simulation Box */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-1.5 font-mono text-[10px]">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Código JSON de Respaldo:</span>
                        <span className="text-cyan-400 font-bold cursor-pointer">Copiar al Portapapeles</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg text-emerald-400/90 truncate border border-slate-800/80">
                        &#123;&quot;themeName&quot;: &quot;Streetwear Acid Noir 2026&quot;, &quot;primaryColor&quot;: &quot;#18181b&quot;, &quot;accentColor&quot;: &quot;#10b981&quot;, &quot;heroFit&quot;: &quot;contain&quot;&#125;
                      </div>
                    </div>
                  </div>
                )}

                {/* Animated Mouse Cursor & Click Ripple */}
                <div
                  className="absolute pointer-events-none transition-all duration-700 ease-out z-30"
                  style={{
                    left: `${cursorPosition.x}%`,
                    top: `${cursorPosition.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {/* Cursor Arrow */}
                  <svg
                    className={`w-6 h-6 drop-shadow-lg text-white transition-transform ${
                      isClicking ? 'scale-75' : 'scale-100'
                    }`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M4 0l16 12.279-6.951 1.17 4.325 8.817-3.596 1.734-4.35-8.879-5.428 5.679z" />
                  </svg>

                  {/* Click Ripple Effect */}
                  {isClicking && (
                    <span className="absolute -top-3 -left-3 w-12 h-12 rounded-full border-2 border-indigo-400 bg-indigo-400/30 animate-ping pointer-events-none" />
                  )}

                  {/* Cursor Hint Bubble */}
                  <span className="absolute left-6 top-0 bg-slate-950/90 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded shadow-lg border border-indigo-500/40 whitespace-nowrap">
                    {activeScene.cursorTarget.label}
                  </span>
                </div>
              </div>

              {/* Bottom Video Progress Scrub Bar & Timeline Controls */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2 shrink-0">
                {/* Scrub Progress Bar */}
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percent = clickX / rect.width;
                    setCurrentSec(Math.round(percent * currentTutorial.durationSec));
                  }}
                  className="w-full bg-slate-800 h-2 rounded-full overflow-hidden cursor-pointer relative group"
                >
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 transition-all duration-200"
                    style={{
                      width: `${Math.min(100, (currentSec / currentTutorial.durationSec) * 100)}%`,
                    }}
                  />
                </div>

                {/* Controls Bar */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-8 h-8 rounded-xl bg-white text-slate-950 flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-slate-950" />
                      ) : (
                        <Play className="w-4 h-4 fill-slate-950 translate-x-0.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentSec(0)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Reiniciar video desde el principio"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      title={isMuted ? 'Activar sonido' : 'Silenciar'}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>

                    <span className="font-mono text-[10px] text-slate-400">
                      00:{currentSec.toString().padStart(2, '0')} / {currentTutorial.durationFormatted}
                    </span>
                  </div>

                  {/* Playback Speed & Steps */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPlaybackSpeed((prev) => (prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : 1));
                      }}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono font-bold cursor-pointer"
                    >
                      {playbackSpeed}x
                    </button>

                    {currentTutorial.scenes.map((sc, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentSec(sc.second)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                          activeScene.stepNumber === sc.stepNumber
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        Paso {sc.stepNumber}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right/Side: Real-Time Audio Caption, Live Guidance & Direct Actions */}
          <div className="w-full lg:w-96 p-4 sm:p-5 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between space-y-4 shrink-0">
            <div className="space-y-4">
              {/* Active Step Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                  PASO {activeScene.stepNumber} DE {currentTutorial.scenes.length}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {currentTutorial.category}
                </span>
              </div>

              {/* Step Title */}
              <div>
                <h4 className="text-base font-black text-white tracking-tight leading-snug">
                  {activeScene.label}
                </h4>
                <p className="text-xs text-indigo-300 font-mono mt-1">
                  Acción: {activeScene.actionRequired}
                </p>
              </div>

              {/* Audio Commentary / Explanation */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[10px] uppercase font-bold flex items-center gap-1.5 text-amber-300">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Locución / Explicación del Video:</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    className="hover:text-white text-slate-500 cursor-pointer p-0.5"
                    title="Copiar texto explicativo"
                  >
                    {copiedCaption ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  "{activeScene.audioCaption}"
                </p>
              </div>

              {/* Highlight Callout */}
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/50 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 block">
                  En Pantalla en este Momento:
                </span>
                <span className="text-xs text-indigo-100 font-medium block">
                  {activeScene.highlightText}
                </span>
              </div>

              {/* Step Checklist of this Tutorial */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                  Ruta Completa del Proceso:
                </span>
                <div className="space-y-1 text-xs">
                  {currentTutorial.scenes.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentSec(s.second)}
                      className={`p-2 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
                        activeScene.stepNumber === s.stepNumber
                          ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-mono flex items-center justify-center">
                          {s.stepNumber}
                        </span>
                        <span className="truncate max-w-[180px]">{s.label}</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-60">00:{s.second.toString().padStart(2, '0')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Primary Action Button */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <button
                type="button"
                onClick={handleGoToTool}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Probar esta función en vivo ahora</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setSystemVideoTutorialOpen(false)}
                className="w-full py-1.5 text-center text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                Cerrar tutorial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
