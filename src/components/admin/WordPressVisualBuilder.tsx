import React, { useState } from 'react';
import {
  Layers,
  Move,
  GripVertical,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Smartphone,
  Tablet,
  Monitor,
  Eye,
  Edit3,
  Sliders,
  Type,
  Image as ImageIcon,
  Square,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Divide,
  Mail,
  Zap,
  Flame,
  LayoutGrid,
  Check,
  RotateCcw,
  Download,
  Upload,
  Globe,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Palette,
  Video,
  Film,
  Volume2,
  VolumeX,
  Gauge,
  FileCheck,
  ArrowLeft,
  X,
  Pin,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BuilderBlock, BuilderBlockType } from '../../types/builder';
import { BUILDER_TEMPLATES } from '../../data/builderTemplates';
import { StorefrontBlockRenderer, BlockItem } from '../storefront/StorefrontBlockRenderer';
import { MediaCompressorModal } from './MediaCompressorModal';
import { LIGHTWEIGHT_VIDEO_PRESETS, formatBytes } from '../../lib/mediaOptimizer';

interface PaletteItem {
  type: BuilderBlockType;
  label: string;
  category: 'Estructura' | 'Contenido' | 'Tienda';
  icon: React.ElementType;
  description: string;
  defaultData: Partial<BuilderBlock>;
}

const PALETTE_ITEMS: PaletteItem[] = [
  // Structure
  {
    type: 'container',
    label: 'Caja / Contenedor',
    category: 'Estructura',
    icon: Square,
    description: 'Caja con color de fondo, padding y borde para agrupar contenido',
    defaultData: {
      styles: {
        backgroundColor: '#f4f4f5',
        paddingY: 'lg',
        paddingX: 'md',
        borderRadius: 'md',
        border: true,
        borderColor: '#e4e4e7',
        textAlign: 'center',
      },
      children: [
        {
          id: 'inner-heading',
          type: 'heading',
          headingLevel: 'h3',
          content: 'NUEVA SECCIÓN EN CAJA',
          styles: { textAlign: 'center', textColor: '#09090b' },
        },
        {
          id: 'inner-p',
          type: 'paragraph',
          content: 'Personaliza el fondo, relleno y bordes de esta caja desde el inspector de la derecha.',
          styles: { textAlign: 'center', textColor: '#71717a' },
        },
      ],
    },
  },
  {
    type: 'columns-2',
    label: '2 Columnas (50/50)',
    category: 'Estructura',
    icon: Layers,
    description: 'División en 2 columnas para combinar fotos y textos en paralelo',
    defaultData: {
      styles: { paddingY: 'lg', paddingX: 'none' },
      children: [
        {
          id: 'col-img',
          type: 'image',
          imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=85',
          aspectRatio: '4:3',
          styles: { borderRadius: 'md' },
        },
      ],
      childrenColumn2: [
        {
          id: 'col-h',
          type: 'heading',
          headingLevel: 'h3',
          content: 'TITULAR DE COLUMNA',
          styles: { textAlign: 'left', textColor: '#09090b' },
        },
        {
          id: 'col-p',
          type: 'paragraph',
          content: 'Escribe aquí la historia o los beneficios del producto de esta sección.',
          styles: { textAlign: 'left', textColor: '#71717a' },
        },
        {
          id: 'col-btn',
          type: 'button',
          buttonText: 'VER COLECCIÓN',
          buttonVariant: 'primary',
          styles: { textAlign: 'left', borderRadius: 'md' },
        },
      ],
    },
  },
  {
    type: 'divider',
    label: 'Línea Divisoria',
    category: 'Estructura',
    icon: Divide,
    description: 'Línea sutil para separar bloques temáticos',
    defaultData: {
      styles: { paddingY: 'sm' },
    },
  },
  {
    type: 'spacer',
    label: 'Espaciador',
    category: 'Estructura',
    icon: Move,
    description: 'Espacio en blanco ajustable en altura',
    defaultData: {
      spacerHeight: 48,
    },
  },

  // Content
  {
    type: 'heading',
    label: 'Encabezado / Título',
    category: 'Contenido',
    icon: Type,
    description: 'Titular H1, H2, H3 o H4 con alineación y color',
    defaultData: {
      headingLevel: 'h2',
      content: 'TITULAR DE SECCIÓN EDITABLE',
      styles: { textAlign: 'center', textColor: '#09090b', paddingY: 'md' },
    },
  },
  {
    type: 'paragraph',
    label: 'Párrafo de Texto',
    category: 'Contenido',
    icon: Edit3,
    description: 'Bloque de texto para historias de marca o descripciones',
    defaultData: {
      content:
        'Confeccionamos cada pieza con estándares de alta costura streetwear en Medellín, utilizando cortes boxy y materiales heavyweight.',
      styles: { textAlign: 'center', textColor: '#52525b', paddingY: 'sm' },
    },
  },
  {
    type: 'image',
    label: 'Imagen / Foto',
    category: 'Contenido',
    icon: ImageIcon,
    description: 'Fotografía con aspect ratio y presets de alta resolución',
    defaultData: {
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
      imageAlt: 'Prenda Medellín',
      aspectRatio: '16:9',
      styles: { borderRadius: 'md', paddingY: 'md' },
    },
  },
  {
    type: 'video',
    label: 'Video / Reproductor',
    category: 'Contenido',
    icon: Video,
    description: 'Video de YouTube, Vimeo o MP4 con aspect ratio, bucle y presets de pasarela',
    defaultData: {
      title: 'DROP TEASER // PASARELA STREETWEAR',
      subcontent: 'Campaña visual grabada en Medellín con cortes boxy y algodón pesado.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-black-jacket-41121-large.mp4',
      videoPoster: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=70',
      aspectRatio: '16:9',
      videoAutoplay: false,
      videoMuted: true,
      videoLoop: true,
      videoControls: true,
      videoCaption: 'Campaña audiovisual oficial TU TIENDA A LA MANO // Nueva temporada',
      styles: { borderRadius: 'md', paddingY: 'md' },
    },
  },
  {
    type: 'button',
    label: 'Botón CTA',
    category: 'Contenido',
    icon: Zap,
    description: 'Llamado a la acción para comprar o ir al catálogo',
    defaultData: {
      buttonText: 'EXPLORAR TIENDA',
      buttonLink: '#catalog',
      buttonVariant: 'primary',
      styles: { textAlign: 'center', borderRadius: 'full', paddingY: 'sm' },
    },
  },

  // Commerce
  {
    type: 'product-grid',
    label: 'Cuadrícula de Productos',
    category: 'Tienda',
    icon: ShoppingBag,
    description: 'Muestra las prendas reales con apertura en 1 clic y carrito',
    defaultData: {
      categoryFilter: 'TODOS',
      productsColumns: 3,
      productsLimit: 6,
      productCardStyle: 'bordered',
      styles: { paddingY: 'md' },
    },
  },
  {
    type: 'banner',
    label: 'Banner Hero / Promo',
    category: 'Tienda',
    icon: Sparkles,
    description: 'Gran banner con imagen de fondo, oscurecimiento y texto',
    defaultData: {
      title: 'DROP EXCLUSIVO // NUEVA TEMPORADA',
      subcontent: 'Prendas con telas pesadas de 450 GSM confeccionadas para durar.',
      imageUrl: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1600&q=85',
      buttonText: 'ORDENAR AHORA',
      bannerHeight: 'medium',
      overlayOpacity: 50,
      styles: { textAlign: 'center', borderRadius: 'none', paddingY: 'xl' },
    },
  },
  {
    type: 'showcase-rail',
    label: 'Vitrina Destacada',
    category: 'Tienda',
    icon: Flame,
    description: 'Fijados con PIN + rotación automática temporizada, pausa en hover',
    defaultData: {
      title: 'VITRINA TU TIENDA A LA MANO',
      subcontent: 'Fijos seleccionados y rotación del catálogo.',
      showcaseCount: 4,
      showcaseIntervalSec: 8,
      styles: { paddingY: 'md' },
    },
  },
  {
    type: 'catalog-browser',
    label: 'Catálogo con Navegador',
    category: 'Tienda',
    icon: LayoutGrid,
    description: 'Pills de categorías, buscador en vivo, orden y tarjetas de compra',
    defaultData: {
      title: 'COLECCIÓN DE PRENDAS',
      subcontent: 'Explora, filtra y ordena el catálogo.',
      categoryFilter: 'TODOS',
      productsColumns: 3,
      productsLimit: 9,
      showCategoryNav: true,
      showSearch: true,
      showSort: true,
      styles: { paddingY: 'md' },
    },
  },
  {
    type: 'trust-badges',
    label: 'Insignias de Confianza',
    category: 'Tienda',
    icon: ShieldCheck,
    description: 'Sellos de Wompi Bancolombia, PSE, Nequi y envíos Coordinadora',
    defaultData: {
      styles: {
        backgroundColor: '#18181b',
        textColor: '#ffffff',
        paddingY: 'lg',
        paddingX: 'md',
        borderRadius: 'md',
      },
    },
  },
  {
    type: 'newsletter',
    label: 'Caja Newsletter VIP',
    category: 'Tienda',
    icon: Mail,
    description: 'Captura correos para acceso prioritario a los lanzamientos',
    defaultData: {
      title: 'ACCESO VIP AL PRÓXIMO DROP',
      subcontent: 'Suscríbete y recibe tu código con 30 minutos de anticipación.',
      buttonText: 'REGISTRARME',
      styles: {
        backgroundColor: '#fafafa',
        paddingY: 'xl',
        paddingX: 'md',
        textAlign: 'center',
        border: true,
        borderColor: '#e4e4e7',
        borderRadius: 'lg',
      },
    },
  },
];

// Presets for quick image selection
const STOCK_IMAGES = [
  { label: 'Hoodie Minimal Blanco', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Editorial Street Sand', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Confección 450 GSM', url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Dark Cyber Medellín', url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Pantalones Cargo Fit', url: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Detalle de Costuras', url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=85' },
];

export const WordPressVisualBuilder: React.FC = () => {
  const {
    pageLayout,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock,
    applyBuilderTemplate,
    toggleStorefrontLayoutMode,
    resetBuilderToDefault,
    exportPageLayoutJson,
    importPageLayoutJson,
    showToast,
    setActiveView,
    themeConfig,
    products,
  } = useStore();

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    pageLayout.blocks[0]?.id || null
  );
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeLeftTab, setActiveLeftTab] = useState<'blocks' | 'templates' | 'json'>('blocks');
  const [mobileViewTab, setMobileViewTab] = useState<'canvas' | 'palette' | 'inspector'>('canvas');
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [draggedBlockType, setDraggedBlockType] = useState<BuilderBlockType | null>(null);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [copiedExport, setCopiedExport] = useState(false);
  const [searchPalette, setSearchPalette] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('TODOS');
  const [isCompressorOpen, setIsCompressorOpen] = useState<boolean>(false);
  const [compressorTargetBlockId, setCompressorTargetBlockId] = useState<string | null>(null);

  // Find currently selected block
  const findBlockById = (blocks: BuilderBlock[], id: string): BuilderBlock | null => {
    for (const b of blocks) {
      if (b.id === id) return b;
      if (b.children) {
        const found = findBlockById(b.children, id);
        if (found) return found;
      }
      if (b.childrenColumn2) {
        const found = findBlockById(b.childrenColumn2, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedBlock = selectedBlockId ? findBlockById(pageLayout.blocks, selectedBlockId) : null;

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, item: PaletteItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.setData('text/plain', item.type);
    setDraggedBlockType(item.type);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDropIndicatorIndex(index);
  };

  const handleDragLeave = () => {
    // optional reset
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDropIndicatorIndex(null);
    setDraggedBlockType(null);

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const item: PaletteItem = JSON.parse(dataStr);
        const dynamicData = { ...item.defaultData };
        if (item.type === 'banner' && themeConfig.heroImageUrl) {
          dynamicData.imageUrl = themeConfig.heroImageUrl;
        } else if (item.type === 'image' && products.length > 0 && products[0].mainImage) {
          dynamicData.imageUrl = products[0].mainImage;
        }
        const newBlock: BuilderBlock = {
          id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: item.type,
          ...dynamicData,
          styles: { ...(item.defaultData.styles || {}) },
        };
        addBlock(newBlock, targetIndex);
        setSelectedBlockId(newBlock.id);
        return;
      }
    } catch {
      // fallback
    }

    // Direct type drag
    const typeStr = e.dataTransfer.getData('text/plain') as BuilderBlockType;
    const foundItem = PALETTE_ITEMS.find((p) => p.type === typeStr);
    if (foundItem) {
      const dynamicData = { ...foundItem.defaultData };
      if (foundItem.type === 'banner' && themeConfig.heroImageUrl) {
        dynamicData.imageUrl = themeConfig.heroImageUrl;
      } else if (foundItem.type === 'image' && products.length > 0 && products[0].mainImage) {
        dynamicData.imageUrl = products[0].mainImage;
      }
      const newBlock: BuilderBlock = {
        id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: foundItem.type,
        ...dynamicData,
        styles: { ...(foundItem.defaultData.styles || {}) },
      };
      addBlock(newBlock, targetIndex);
      setSelectedBlockId(newBlock.id);
    }
  };

  const handle1ClickInsert = (item: PaletteItem) => {
    const dynamicData = { ...item.defaultData };
    if (item.type === 'banner' && themeConfig.heroImageUrl) {
      dynamicData.imageUrl = themeConfig.heroImageUrl;
    } else if (item.type === 'image' && products.length > 0 && products[0].mainImage) {
      dynamicData.imageUrl = products[0].mainImage;
    }
    const newBlock: BuilderBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: item.type,
      ...dynamicData,
      styles: { ...(item.defaultData.styles || {}) },
    };
    addBlock(newBlock);
    setSelectedBlockId(newBlock.id);
    setMobileViewTab('canvas');
    showToast(`✅ Bloque "${item.label}" agregado`);
  };

  // Filtered palette items
  const filteredPalette = PALETTE_ITEMS.filter((item) => {
    const matchesSearch =
      item.label.toLowerCase().includes(searchPalette.toLowerCase()) ||
      item.description.toLowerCase().includes(searchPalette.toLowerCase());
    const matchesCat = activeCategory === 'TODOS' || item.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-68px)] bg-zinc-100 overflow-hidden font-sans">
      {/* 1. TOP WORDPRESS-STYLE CONTROL BAR */}
      <header className="min-h-14 py-2 px-3 sm:px-4 bg-white border-b border-zinc-200 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 shrink-0 z-20 shadow-2xs">
        {/* Brand & Mode Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-xs font-black uppercase tracking-tight bg-black text-white px-2 sm:px-2.5 py-1 rounded shrink-0">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">GUTENBERG / ELEMENTOR BUILDER</span>
            <span className="sm:hidden">BUILDER</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => toggleStorefrontLayoutMode()}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full font-mono text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer border ${
                pageLayout.enabledInStorefront
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-zinc-100 text-zinc-600 border-zinc-300 hover:bg-zinc-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  pageLayout.enabledInStorefront ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                }`}
              />
              <span className="hidden md:inline">
                {pageLayout.enabledInStorefront
                  ? 'PUBLICADO EN TIENDA VIVA'
                  : 'MODO BORRADOR (Haz clic para Publicar)'}
              </span>
              <span className="md:hidden">
                {pageLayout.enabledInStorefront ? 'PUBLICADO' : 'BORRADOR'}
              </span>
            </button>
          </div>
        </div>

        {/* Center: Device View Switcher */}
        <div className="flex items-center bg-zinc-100 p-0.5 sm:p-1 rounded-lg border border-zinc-200 shrink-0">
          <button
            onClick={() => setDevicePreview('desktop')}
            className={`p-1 sm:p-1.5 rounded transition-all cursor-pointer ${
              devicePreview === 'desktop' ? 'bg-white text-black shadow-xs font-bold' : 'text-zinc-500 hover:text-black'
            }`}
            title="Vista Escritorio (100%)"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevicePreview('tablet')}
            className={`p-1 sm:p-1.5 rounded transition-all cursor-pointer ${
              devicePreview === 'tablet' ? 'bg-white text-black shadow-xs font-bold' : 'text-zinc-500 hover:text-black'
            }`}
            title="Vista Tablet (768px)"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevicePreview('mobile')}
            className={`p-1 sm:p-1.5 rounded transition-all cursor-pointer ${
              devicePreview === 'mobile' ? 'bg-white text-black shadow-xs font-bold' : 'text-zinc-500 hover:text-black'
            }`}
            title="Vista Móvil (375px)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Right Actions: Compressor, Preview Mode & Live Storefront Link */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => {
              setCompressorTargetBlockId(selectedBlockId);
              setIsCompressorOpen(true);
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-mono font-bold rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all cursor-pointer shadow-2xs"
            title="Optimizar imágenes a WebP y configurar videos ultralivianos sin lag"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Compresor WebP</span>
          </button>

          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-mono font-bold rounded-md border transition-all cursor-pointer ${
              previewMode
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{previewMode ? 'Salir de Previa' : 'Vista Previa'}</span>
          </button>

          <button
            onClick={() => {
              if (!pageLayout.enabledInStorefront) {
                toggleStorefrontLayoutMode(true);
              }
              setActiveView('home');
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ver en Tienda</span>
          </button>
        </div>
      </header>

      {/* Mobile Sub-Navigation Segmented Control (< lg screens) */}
      {!previewMode && (
        <div className="lg:hidden bg-white border-b border-zinc-200 px-2 py-1.5 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="grid grid-cols-3 gap-1.5 w-full">
            <button
              onClick={() => setMobileViewTab('canvas')}
              className={`py-1.5 px-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileViewTab === 'canvas'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Lienzo</span>
            </button>
            <button
              onClick={() => setMobileViewTab('palette')}
              className={`py-1.5 px-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileViewTab === 'palette'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Bloques</span>
            </button>
            <button
              onClick={() => setMobileViewTab('inspector')}
              className={`py-1.5 px-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileViewTab === 'inspector'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate max-w-[80px]">
                {selectedBlock ? selectedBlock.type : 'Ajustes'}
              </span>
              {selectedBlock && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN 3-COLUMN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: BLOCK & ELEMENT DRAWER */}
        {!previewMode && (
          <aside
            className={`w-full lg:w-80 bg-white border-r border-zinc-200 flex flex-col shrink-0 z-10 ${
              mobileViewTab === 'palette' ? 'flex flex-1 lg:flex-initial' : 'hidden lg:flex'
            }`}
          >
            {/* Mobile Return to Canvas Bar */}
            <div className="lg:hidden p-2.5 bg-zinc-900 text-white flex items-center justify-between shrink-0">
              <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Catálogo de Bloques</span>
              </span>
              <button
                onClick={() => setMobileViewTab('canvas')}
                className="px-2.5 py-1 bg-white text-black text-xs font-mono font-bold rounded flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Ver Lienzo</span>
              </button>
            </div>
            {/* Drawer Tabs */}
            <div className="flex border-b border-zinc-200 bg-zinc-50 text-xs font-mono">
              <button
                onClick={() => setActiveLeftTab('blocks')}
                className={`flex-1 py-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer ${
                  activeLeftTab === 'blocks'
                    ? 'border-black text-black bg-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Bloques (+ Arrastrar)
              </button>
              <button
                onClick={() => setActiveLeftTab('templates')}
                className={`flex-1 py-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer ${
                  activeLeftTab === 'templates'
                    ? 'border-black text-black bg-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Plantillas Web
              </button>
              <button
                onClick={() => setActiveLeftTab('json')}
                className={`py-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer ${
                  activeLeftTab === 'json'
                    ? 'border-black text-black bg-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                JSON
              </button>
            </div>

            {/* TAB CONTENT */}
            {activeLeftTab === 'blocks' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search & Category Pills */}
                <div className="p-3 border-b border-zinc-100 space-y-2">
                  <input
                    type="text"
                    placeholder="Buscar bloque (caja, imagen, botón...)"
                    value={searchPalette}
                    onChange={(e) => setSearchPalette(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md text-xs font-mono focus:outline-hidden focus:border-black"
                  />
                  <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5">
                    {['TODOS', 'Estructura', 'Contenido', 'Tienda'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                          activeCategory === cat
                            ? 'bg-black text-white'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drag Instructions Banner */}
                <div className="px-3 py-2 bg-indigo-50 border-b border-indigo-100 text-[11px] text-indigo-900 font-mono flex items-center gap-1.5">
                  <GripVertical className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Arrastra cualquier elemento al lienzo o haz clic para insertarlo al final.</span>
                </div>

                {/* Elements List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {filteredPalette.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.type}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onClick={() => handle1ClickInsert(item)}
                        className="group p-2.5 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-black rounded-lg cursor-pointer lg:cursor-grab active:cursor-grabbing transition-all duration-150 shadow-2xs hover:shadow-xs flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="p-2 rounded-md bg-zinc-100 group-hover:bg-black group-hover:text-white transition-colors text-zinc-700 shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-zinc-900 group-hover:text-black truncate">
                                {item.label}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-zinc-100 text-zinc-500 rounded shrink-0">
                                {item.category}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-500 line-clamp-1 leading-tight">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-zinc-400 group-hover:text-black shrink-0">
                          <span className="text-[10px] font-mono font-bold text-indigo-600 lg:hidden bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            + Añadir
                          </span>
                          <span className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB TEMPLATES */}
            {activeLeftTab === 'templates' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <p className="text-xs text-zinc-500 font-mono">
                  Aplica una composición completa prediseñada estilo WordPress:
                </p>
                {BUILDER_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="p-3 bg-white border border-zinc-200 hover:border-black rounded-lg space-y-2 transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-900">{tmpl.name}</h4>
                      <span
                        className="w-3 h-3 rounded-full border border-zinc-300"
                        style={{ backgroundColor: tmpl.previewColor }}
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-tight">
                      {tmpl.description}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-zinc-400">
                        {tmpl.blocks.length} bloques
                      </span>
                      <button
                        onClick={() => applyBuilderTemplate(tmpl.id)}
                        className="px-3 py-1 bg-black hover:bg-zinc-800 text-white text-[11px] font-bold rounded cursor-pointer uppercase font-mono"
                      >
                        Cargar Plantilla
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB JSON IMPORT/EXPORT */}
            {activeLeftTab === 'json' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-zinc-900 font-mono">Exportar Diseño Actual:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(exportPageLayoutJson());
                      setCopiedExport(true);
                      setTimeout(() => setCopiedExport(false), 2000);
                      showToast('📋 JSON copiado al portapapeles.');
                    }}
                    className="w-full py-2 bg-zinc-900 hover:bg-black text-white font-mono rounded text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{copiedExport ? '¡Copiado!' : 'Copiar Configuración JSON'}</span>
                  </button>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-zinc-200">
                  <span className="font-bold text-zinc-900 font-mono">Importar desde la Red / JSON:</span>
                  <textarea
                    rows={6}
                    placeholder="Pega aquí el código JSON del diseño..."
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded font-mono text-[10px] focus:outline-hidden focus:border-black"
                  />
                  <button
                    onClick={() => {
                      if (importPageLayoutJson(importJsonText)) {
                        setImportJsonText('');
                      }
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-mono rounded text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Importar y Aplicar Bloques</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-zinc-200">
                  <button
                    onClick={resetBuilderToDefault}
                    className="w-full py-1.5 text-zinc-600 hover:text-red-600 font-mono text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restaurar a bloques originales</span>
                  </button>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* CENTER: INTERACTIVE CANVAS WITH DRAG & DROP SLOTS */}
        <main
          className={`flex-1 overflow-y-auto p-2 sm:p-4 lg:p-8 flex justify-center bg-zinc-200/70 transition-all ${
            previewMode ? 'bg-white' : ''
          } ${mobileViewTab === 'canvas' ? 'flex' : 'hidden lg:flex'}`}
        >
          <div
            className={`w-full bg-white transition-all shadow-xl border border-zinc-300 min-h-[90vh] ${
              devicePreview === 'mobile'
                ? 'max-w-[375px] rounded-2xl sm:rounded-3xl p-3 sm:p-4 my-2 sm:my-4 ring-4 sm:ring-8 ring-zinc-900'
                : devicePreview === 'tablet'
                ? 'max-w-[768px] rounded-xl sm:rounded-2xl p-4 sm:p-6 my-2 sm:my-4 ring-4 sm:ring-8 ring-zinc-800'
                : 'max-w-5xl rounded-lg sm:rounded-xl p-3 sm:p-6 lg:p-10 my-1 sm:my-2'
            }`}
          >
            {/* Top Drop Zone (Before block 0) */}
            {!previewMode && (
              <div
                onDragOver={(e) => handleDragOver(e, 0)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 0)}
                className={`py-2 text-center border-2 border-dashed transition-all rounded-md text-[10px] font-mono mb-4 ${
                  dropIndicatorIndex === 0
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold py-4'
                    : 'border-zinc-200 text-zinc-400 hover:border-zinc-400'
                }`}
              >
                <span>+ Soltar bloque al inicio de la página</span>
              </div>
            )}

            {/* Blocks List */}
            {pageLayout.blocks.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <Square className="w-12 h-12 text-zinc-300 mx-auto" />
                <h3 className="text-base font-bold text-zinc-700">Tu lienzo está vacío</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Arrastra elementos desde la barra lateral izquierda (cajas, imágenes, textos, cuadrículas) para comenzar a diseñar tu página.
                </p>
                <button
                  onClick={() => applyBuilderTemplate('minimal-clean')}
                  className="px-4 py-2 bg-black text-white text-xs font-bold uppercase rounded font-mono cursor-pointer"
                >
                  Cargar Plantilla Minimalista
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {pageLayout.blocks.map((block, idx) => {
                  const isSelected = selectedBlockId === block.id;

                  return (
                    <div key={block.id} className="relative group/canvas-item">
                      {/* Interactive Editing Toolbar for the Selected Block */}
                      {!previewMode && isSelected && (
                        <div className="absolute -top-9 left-0 right-0 z-30 flex items-center justify-between bg-zinc-950 text-white px-2 sm:px-3 py-1.5 rounded-t-md text-xs font-mono shadow-md animate-in fade-in duration-150">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                              {block.type}
                            </span>
                            <span className="hidden sm:inline text-[11px] text-zinc-300 font-sans font-bold">
                              Bloque #{idx + 1}
                            </span>
                            {/* Mobile Shortcut to Open Inspector */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMobileViewTab('inspector');
                              }}
                              className="lg:hidden flex items-center gap-1 px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Ajustes</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-0.5 sm:gap-1">
                            <button
                              onClick={() => moveBlock(idx, idx - 1)}
                              disabled={idx === 0}
                              className="p-1 hover:bg-zinc-800 disabled:opacity-30 rounded cursor-pointer"
                              title="Subir bloque"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => moveBlock(idx, idx + 1)}
                              disabled={idx === pageLayout.blocks.length - 1}
                              className="p-1 hover:bg-zinc-800 disabled:opacity-30 rounded cursor-pointer"
                              title="Bajar bloque"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-px h-3 bg-zinc-700 mx-0.5 sm:mx-1" />
                            <button
                              onClick={() => duplicateBlock(block.id)}
                              className="p-1 hover:bg-zinc-800 rounded cursor-pointer text-zinc-300 hover:text-white"
                              title="Duplicar bloque"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteBlock(block.id)}
                              className="p-1 hover:bg-red-900 rounded cursor-pointer text-red-400 hover:text-red-300"
                              title="Eliminar bloque"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Actual Block Renderer Container */}
                      <div
                        onClick={() => setSelectedBlockId(block.id)}
                        className={`transition-all rounded-md ${
                          !previewMode
                            ? isSelected
                              ? 'ring-2 ring-indigo-600 ring-offset-2'
                              : 'hover:outline-1 hover:outline-dashed hover:outline-zinc-400 cursor-pointer'
                            : ''
                        }`}
                      >
                        <BlockItem
                          block={block}
                          isCanvasPreview={!previewMode}
                          isSelected={isSelected}
                          onSelect={() => setSelectedBlockId(block.id)}
                        />
                      </div>

                      {/* Drop Zone between blocks */}
                      {!previewMode && (
                        <div
                          onDragOver={(e) => handleDragOver(e, idx + 1)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, idx + 1)}
                          className={`mt-3 py-1.5 text-center border-2 border-dashed transition-all rounded text-[9px] font-mono ${
                            dropIndicatorIndex === idx + 1
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold py-3'
                              : 'border-transparent hover:border-zinc-300 text-transparent hover:text-zinc-400'
                          }`}
                        >
                          <span>+ Insertar bloque aquí</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* RIGHT COLUMN: INSPECTOR DE BLOQUE (WORDPRESS SETTINGS) */}
        {!previewMode && (
          <aside
            className={`w-full lg:w-80 bg-white border-l border-zinc-200 flex flex-col shrink-0 z-10 overflow-y-auto ${
              mobileViewTab === 'inspector' ? 'flex flex-1 lg:flex-initial' : 'hidden lg:flex'
            }`}
          >
            {/* Mobile Return to Canvas Bar */}
            <div className="lg:hidden p-2.5 bg-zinc-900 text-white flex items-center justify-between shrink-0">
              <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ajustes {selectedBlock ? `(${selectedBlock.type})` : ''}</span>
              </span>
              <button
                onClick={() => setMobileViewTab('canvas')}
                className="px-2.5 py-1 bg-white text-black text-xs font-mono font-bold rounded flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Ver Lienzo</span>
              </button>
            </div>

            {/* Inspector Header */}
            <div className="p-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-black" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  Inspector de Bloque
                </span>
              </div>
              {selectedBlock && (
                <span className="bg-black text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                  {selectedBlock.type}
                </span>
              )}
            </div>

            {!selectedBlock ? (
              <div className="p-6 text-center space-y-3 text-zinc-500 my-auto">
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                  <Sliders className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-mono font-bold text-zinc-800 uppercase">
                  Ningún Bloque Seleccionado
                </h4>
                <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                  Toca cualquier bloque en el lienzo o añade uno desde el catálogo para personalizar sus textos, colores y enlaces.
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={() => setMobileViewTab('canvas')}
                    className="px-3.5 py-1.5 bg-black text-white text-xs font-mono font-bold rounded-lg uppercase cursor-pointer"
                  >
                    Ver Lienzo
                  </button>
                  <button
                    onClick={() => setMobileViewTab('palette')}
                    className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-mono font-bold rounded-lg uppercase cursor-pointer"
                  >
                    + Bloques
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-5 text-xs">
                {/* Visibilidad global del bloque */}
                <label className="flex items-center justify-between bg-zinc-950 text-white rounded-xl px-3 py-2.5 cursor-pointer">
                  <span className="font-mono font-bold uppercase text-[11px]">
                    Visible en tienda
                  </span>
                  <input
                    type="checkbox"
                    checked={selectedBlock.enabled !== false}
                    onChange={(e) => updateBlock(selectedBlock.id, { enabled: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </label>
                {/* SECTION A: CONTENT SETTINGS */}
              <div className="space-y-3">
                <span className="font-mono font-bold uppercase text-[11px] text-zinc-900 block border-b border-zinc-100 pb-1">
                  1. Contenido & Textos
                </span>

                {/* Heading Block */}
                {selectedBlock.type === 'heading' && (
                  <>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Texto del Encabezado:</label>
                      <input
                        type="text"
                        value={selectedBlock.content || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded font-sans text-xs focus:outline-hidden focus:border-black"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Tamaño del título:</label>
                      <div className="grid grid-cols-4 gap-1 font-mono">
                        {(['h1', 'h2', 'h3', 'h4'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => updateBlock(selectedBlock.id, { headingLevel: lvl })}
                            className={`py-1.5 uppercase font-bold border rounded transition-all cursor-pointer ${
                              selectedBlock.headingLevel === lvl
                                ? 'bg-black text-white border-black'
                                : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Paragraph Block */}
                {selectedBlock.type === 'paragraph' && (
                  <div className="space-y-1">
                    <label className="font-medium text-zinc-700">Párrafo de Texto:</label>
                    <textarea
                      rows={4}
                      value={selectedBlock.content || ''}
                      onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value })}
                      className="w-full p-2 border border-zinc-300 rounded font-sans text-xs focus:outline-hidden focus:border-black"
                    />
                  </div>
                )}

                {/* Image Block */}
                {selectedBlock.type === 'image' && (
                  <>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">URL de la Imagen:</label>
                      <input
                        type="text"
                        value={selectedBlock.imageUrl || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { imageUrl: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded font-mono text-[11px] focus:outline-hidden focus:border-black"
                      />
                    </div>

                    {/* Real Store Hero Banner Selector */}
                    {themeConfig.heroImageUrl && (
                      <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                        <span className="text-[10px] font-mono font-bold text-indigo-900 uppercase block">
                          🌟 Portada Real de tu Tienda:
                        </span>
                        <div className="flex items-center gap-2">
                          <img
                            src={themeConfig.heroImageUrl}
                            alt="Portada"
                            className="w-12 h-10 object-cover rounded-md border border-indigo-300 shrink-0"
                          />
                          <button
                            type="button"
                            onClick={() => updateBlock(selectedBlock.id, { imageUrl: themeConfig.heroImageUrl })}
                            className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-mono font-bold text-center cursor-pointer transition-colors"
                          >
                            Usar Portada Actual
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Real Store Products Selector */}
                    {products.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] text-zinc-600 font-mono font-bold block">
                          👕 Prendas Reales de tu Catálogo ({products.length}):
                        </span>
                        <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-1 bg-zinc-50 border border-zinc-200 rounded-lg">
                          {products.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => updateBlock(selectedBlock.id, { imageUrl: p.mainImage, imageAlt: p.title })}
                              title={p.title}
                              className="group relative aspect-square rounded overflow-hidden border border-zinc-300 hover:border-black transition-all cursor-pointer bg-white"
                            >
                              <img src={p.mainImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <span className="absolute bottom-0 inset-x-0 bg-black/75 text-white text-[8px] truncate px-1 py-0.5 font-mono text-center">
                                {p.title.split(' ')[0]}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Compressor trigger */}
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setCompressorTargetBlockId(selectedBlock.id);
                          setIsCompressorOpen(true);
                        }}
                        className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>⚡ Subir Foto desde mi PC y Comprimir</span>
                      </button>
                      {selectedBlock.isOptimizedMedia && (
                        <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-emerald-700 bg-emerald-50/70 px-2 py-0.5 rounded">
                          <span>✓ Optimizada en WebP</span>
                          <span>{selectedBlock.optimizedSizeKb ? `${selectedBlock.optimizedSizeKb} KB` : 'Ultraligera'}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Forma de la foto:</label>
                      <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
                        {(['16:9', '4:3', '1:1', '3:4'] as const).map((ar) => (
                          <button
                            key={ar}
                            onClick={() => updateBlock(selectedBlock.id, { aspectRatio: ar })}
                            className={`py-1 border rounded transition-all cursor-pointer font-bold ${
                              selectedBlock.aspectRatio === ar
                                ? 'bg-black text-white border-black'
                                : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                            }`}
                          >
                            {ar}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Video Block */}
                {selectedBlock.type === 'video' && (
                  <>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700 flex items-center justify-between">
                        <span>URL del Video:</span>
                        <span className="text-[10px] font-mono text-indigo-600 font-bold">
                          {selectedBlock.videoUrl?.includes('youtube.com') || selectedBlock.videoUrl?.includes('youtu.be')
                            ? 'YouTube Embed'
                            : selectedBlock.videoUrl?.includes('vimeo.com')
                            ? 'Vimeo Embed'
                            : selectedBlock.videoUrl?.endsWith('.mp4') || selectedBlock.videoUrl?.includes('video')
                            ? 'MP4 Directo'
                            : 'Personalizado'}
                        </span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/watch?v=... o enlace .mp4"
                        value={selectedBlock.videoUrl || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { videoUrl: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded font-mono text-xs focus:outline-hidden focus:border-indigo-600"
                      />
                      <p className="text-[10px] text-zinc-500 font-mono">
                        Acepta videos de <strong>YouTube</strong>, <strong>Vimeo</strong>, o archivos <strong>.MP4 directos</strong>.
                      </p>
                    </div>

                    {/* Curated Streetwear Video Presets */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">
                        Videos de Moda & Taller Listos (1 Clic):
                      </span>
                      <div className="space-y-1.5">
                        {LIGHTWEIGHT_VIDEO_PRESETS.map((vp) => (
                          <button
                            key={vp.id}
                            type="button"
                            onClick={() =>
                              updateBlock(selectedBlock.id, {
                                videoUrl: vp.videoUrl,
                                videoPoster: vp.posterUrl,
                                title: vp.name.toUpperCase(),
                                videoCaption: vp.description,
                              })
                            }
                            className={`w-full p-2 border rounded-lg text-left transition-all cursor-pointer flex items-center justify-between ${
                              selectedBlock.videoUrl === vp.videoUrl
                                ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900'
                                : 'bg-zinc-50 hover:bg-white border-zinc-200 text-zinc-700'
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="text-[11px] font-bold truncate">{vp.name}</p>
                              <p className="text-[9px] text-zinc-500 font-mono truncate">{vp.description}</p>
                            </div>
                            <span className="text-[9px] font-mono font-bold uppercase text-indigo-600 shrink-0 bg-white px-1.5 py-0.5 rounded border border-indigo-200">
                              {vp.sizeEstimate.split(' ')[0]} {vp.sizeEstimate.split(' ')[1]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Video Title & Subtitle */}
                    <div className="space-y-1 pt-1">
                      <label className="font-medium text-zinc-700">Título Superior (Opcional):</label>
                      <input
                        type="text"
                        placeholder="Ej: DROP TEASER // PASARELA"
                        value={selectedBlock.title || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { title: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded text-xs font-bold uppercase focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Subtítulo / Bajada:</label>
                      <input
                        type="text"
                        placeholder="Ej: Campaña grabada en Medellín 2025"
                        value={selectedBlock.subcontent || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { subcontent: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded text-xs focus:outline-hidden"
                      />
                    </div>

                    {/* Aspect Ratio */}
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Formato de la foto:</label>
                      <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
                        {[
                          { id: '16:9', label: '16:9 Panorámico' },
                          { id: '9:16', label: '9:16 Reel / TikTok' },
                          { id: '4:3', label: '4:3 Clásico' },
                          { id: '1:1', label: '1:1 Cuadrado' },
                        ].map((ar) => (
                          <button
                            key={ar.id}
                            type="button"
                            onClick={() => updateBlock(selectedBlock.id, { aspectRatio: ar.id as any })}
                            className={`py-1.5 px-1 border rounded text-center transition-all cursor-pointer font-bold ${
                              (selectedBlock.aspectRatio || '16:9') === ar.id
                                ? 'bg-black text-white border-black shadow-xs'
                                : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                            }`}
                          >
                            {ar.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Poster Image */}
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Imagen de Portada (Poster):</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={selectedBlock.videoPoster || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { videoPoster: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded font-mono text-xs focus:outline-hidden"
                      />
                    </div>

                    {/* Video Options / Toggles */}
                    <div className="space-y-2 pt-2 border-t border-zinc-200">
                      <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">
                        Opciones de Reproducción:
                      </span>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className="flex items-center gap-1.5 p-1.5 border border-zinc-200 rounded bg-zinc-50 hover:bg-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBlock.videoAutoplay ?? false}
                            onChange={(e) => updateBlock(selectedBlock.id, { videoAutoplay: e.target.checked })}
                            className="rounded text-indigo-600"
                          />
                          <span className="text-[11px] font-medium text-zinc-800">Autoplay</span>
                        </label>

                        <label className="flex items-center gap-1.5 p-1.5 border border-zinc-200 rounded bg-zinc-50 hover:bg-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBlock.videoMuted ?? true}
                            onChange={(e) => updateBlock(selectedBlock.id, { videoMuted: e.target.checked })}
                            className="rounded text-indigo-600"
                          />
                          <span className="text-[11px] font-medium text-zinc-800">Silenciado</span>
                        </label>

                        <label className="flex items-center gap-1.5 p-1.5 border border-zinc-200 rounded bg-zinc-50 hover:bg-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBlock.videoLoop ?? true}
                            onChange={(e) => updateBlock(selectedBlock.id, { videoLoop: e.target.checked })}
                            className="rounded text-indigo-600"
                          />
                          <span className="text-[11px] font-medium text-zinc-800">Bucle (Loop)</span>
                        </label>

                        <label className="flex items-center gap-1.5 p-1.5 border border-zinc-200 rounded bg-zinc-50 hover:bg-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBlock.videoControls !== false}
                            onChange={(e) => updateBlock(selectedBlock.id, { videoControls: e.target.checked })}
                            className="rounded text-indigo-600"
                          />
                          <span className="text-[11px] font-medium text-zinc-800">Ver Controles</span>
                        </label>
                      </div>
                    </div>

                    {/* Caption / Pie de video */}
                    <div className="space-y-1 pt-1">
                      <label className="font-medium text-zinc-700">Leyenda / Pie de Video:</label>
                      <textarea
                        rows={2}
                        placeholder="Descripción o créditos del video..."
                        value={selectedBlock.videoCaption || selectedBlock.content || ''}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            videoCaption: e.target.value,
                            content: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-zinc-300 rounded text-xs focus:outline-hidden"
                      />
                    </div>
                  </>
                )}

                {/* Button Block */}
                {selectedBlock.type === 'button' && (
                  <>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Texto del Botón:</label>
                      <input
                        type="text"
                        value={selectedBlock.buttonText || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { buttonText: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded text-xs focus:outline-hidden focus:border-black font-bold uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Acción / Enlace:</label>
                      <select
                        value={['#catalog', '#checkout', '#rastreo', '#reviews', '#comunidad', '#confianza'].includes(selectedBlock.buttonLink || '') || (selectedBlock.buttonLink || '').startsWith('http') ? (selectedBlock.buttonLink || '#catalog') : '__custom__'}
                        onChange={(e) => {
                          if (e.target.value !== '__custom__') {
                            updateBlock(selectedBlock.id, { buttonLink: e.target.value });
                          }
                        }}
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded font-mono text-xs focus:outline-hidden"
                      >
                        <option value="#catalog">Ir al Catálogo / Drop (#catalog)</option>
                        <option value="#checkout">Ir Directo al Checkout Wompi (#checkout)</option>
                        <option value="#rastreo">Rastrear Pedido (#rastreo)</option>
                        <option value="#reviews">Ver Reseñas (#reviews)</option>
                        <option value="#comunidad">Ver Comunidad (#comunidad)</option>
                        <option value="#confianza">Ver Confianza y Pagos (#confianza)</option>
                        <option value="https://instagram.com">Instagram / Redes Sociales</option>
                        <option value="__custom__">Enlace personalizado…</option>
                      </select>
                      <input
                        type="text"
                        value={selectedBlock.buttonLink || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { buttonLink: e.target.value })}
                        placeholder="#catalog, #checkout, #rastreo o https://…"
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded font-mono text-[11px] focus:outline-hidden focus:border-black"
                      />
                      <p className="text-[10px] text-zinc-500 font-mono">
                        Todos los destinos redirigen en tienda aunque cambie el tema.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Estilo del Botón:</label>
                      <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
                        <button
                          onClick={() => updateBlock(selectedBlock.id, { buttonVariant: 'primary' })}
                          className={`py-1.5 border rounded cursor-pointer ${
                            selectedBlock.buttonVariant === 'primary' || !selectedBlock.buttonVariant
                              ? 'bg-black text-white font-bold border-black'
                              : 'bg-zinc-50 text-zinc-700'
                          }`}
                        >
                          Principal
                        </button>
                        <button
                          onClick={() => updateBlock(selectedBlock.id, { buttonVariant: 'outline' })}
                          className={`py-1.5 border rounded cursor-pointer ${
                            selectedBlock.buttonVariant === 'outline'
                              ? 'bg-black text-white font-bold border-black'
                              : 'bg-zinc-50 text-zinc-700'
                          }`}
                        >
                          Borde Fino
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Product Grid Block */}
                {selectedBlock.type === 'product-grid' && (
                  <>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Filtro de Categoría:</label>
                      <select
                        value={selectedBlock.categoryFilter || 'TODOS'}
                        onChange={(e) => updateBlock(selectedBlock.id, { categoryFilter: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded font-mono text-xs focus:outline-hidden"
                      >
                        <option value="TODOS">Todas las Prendas</option>
                        <option value="Hoodies">Hoodies & Buzos (450 GSM)</option>
                        <option value="Camisetas">Camisetas & Tees Boxy</option>
                        <option value="Chaquetas">Chaquetas & Outerwear</option>
                        <option value="Pantalones">Pantalones & Cargos</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Columnas en Pantalla:</label>
                      <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
                        {([2, 3, 4] as const).map((col) => (
                          <button
                            key={col}
                            onClick={() => updateBlock(selectedBlock.id, { productsColumns: col })}
                            className={`py-1.5 border rounded cursor-pointer font-bold ${
                              selectedBlock.productsColumns === col
                                ? 'bg-black text-white border-black'
                                : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                            }`}
                          >
                            {col} Cols
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Cantidad Máxima de Prendas:</label>
                      <input
                        type="number"
                        min={2}
                        max={16}
                        value={selectedBlock.productsLimit || 6}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, { productsLimit: parseInt(e.target.value) || 6 })
                        }
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded font-mono text-xs"
                      />
                    </div>
                  </>
                )}

                {/* Showcase Rail Block */}
                {selectedBlock.type === 'showcase-rail' && (
                  <>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Título:</label>
                      <input
                        type="text"
                        value={selectedBlock.title || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { title: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded text-xs font-bold uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Subtítulo:</label>
                      <textarea
                        rows={2}
                        value={selectedBlock.subcontent || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { subcontent: e.target.value })}
                        className="w-full p-2 border border-zinc-300 rounded text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Prendas en rotación:</label>
                      <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
                        {([2, 3, 4, 6] as const).map((n) => (
                          <button
                            key={n}
                            onClick={() => updateBlock(selectedBlock.id, { showcaseCount: n })}
                            className={`py-1.5 border rounded cursor-pointer font-bold ${
                              (selectedBlock.showcaseCount || 4) === n
                                ? 'bg-black text-white border-black'
                                : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">
                        Rotar cada ({selectedBlock.showcaseIntervalSec || 8}s):
                      </label>
                      <input
                        type="range"
                        min={3}
                        max={30}
                        value={selectedBlock.showcaseIntervalSec || 8}
                        onChange={(e) => updateBlock(selectedBlock.id, { showcaseIntervalSec: Number(e.target.value) })}
                        className="w-full accent-black cursor-pointer"
                      />
                      <p className="text-[10px] text-zinc-500">
                        Fijos con 📌 en Catálogo. Se pausa al pasar el cursor.
                      </p>
                    </div>
                  </>
                )}

                {/* Catalog Browser Block */}
                {selectedBlock.type === 'catalog-browser' && (
                  <>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Título del catálogo:</label>
                      <input
                        type="text"
                        value={selectedBlock.title || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { title: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded text-xs font-bold uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Subtítulo:</label>
                      <textarea
                        rows={2}
                        value={selectedBlock.subcontent || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { subcontent: e.target.value })}
                        className="w-full p-2 border border-zinc-300 rounded text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Columnas en Pantalla:</label>
                      <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
                        {([2, 3, 4] as const).map((col) => (
                          <button
                            key={col}
                            onClick={() => updateBlock(selectedBlock.id, { productsColumns: col })}
                            className={`py-1.5 border rounded cursor-pointer font-bold ${
                              selectedBlock.productsColumns === col
                                ? 'bg-black text-white border-black'
                                : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                            }`}
                          >
                            {col} Cols
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Límite de prendas:</label>
                      <input
                        type="number"
                        min={2}
                        max={24}
                        value={selectedBlock.productsLimit || 9}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, { productsLimit: parseInt(e.target.value) || 9 })
                        }
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded font-mono text-xs"
                      />
                    </div>
                    {(
                      [
                        ['showCategoryNav', 'Navegador de categorías'],
                        ['showSearch', 'Buscador en vivo'],
                        ['showSort', 'Selector de orden'],
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key} className="flex items-center justify-between text-xs font-medium text-zinc-700">
                        <span>{label}</span>
                        <input
                          type="checkbox"
                          checked={selectedBlock[key] !== false}
                          onChange={(e) => updateBlock(selectedBlock.id, { [key]: e.target.checked })}
                          className="w-4 h-4 accent-black cursor-pointer"
                        />
                      </label>
                    ))}
                  </>
                )}

                {/* Banner Block */}
                {selectedBlock.type === 'banner' && (
                  <>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Etiqueta superior (vacío = oculta):</label>
                      <input
                        type="text"
                        value={selectedBlock.content || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value })}
                        placeholder="Ej: DROP EXCLUSIVO // COLOMBIA"
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Título del Banner:</label>
                      <input
                        type="text"
                        value={selectedBlock.title || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { title: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded text-xs font-bold uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Subtítulo / Bajada:</label>
                      <textarea
                        rows={2}
                        value={selectedBlock.subcontent || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { subcontent: e.target.value })}
                        className="w-full p-2 border border-zinc-300 rounded text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Texto Botón Banner:</label>
                      <input
                        type="text"
                        value={selectedBlock.buttonText || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { buttonText: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded text-xs uppercase font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Destino del Botón Banner:</label>
                      <input
                        type="text"
                        value={selectedBlock.buttonLink || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { buttonLink: e.target.value })}
                        placeholder="#catalog, #checkout, #rastreo, https://…"
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded font-mono text-[11px] focus:outline-hidden focus:border-black"
                      />
                      <p className="text-[10px] text-zinc-500 font-mono">
                        Vacío = va al catálogo. Siempre redirige aunque cambie el tema.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Badge Secundario (ej: CONFECCIÓN MEDELLÍN 450 GSM):</label>
                      <input
                        type="text"
                        value={selectedBlock.badgeSecondary || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { badgeSecondary: e.target.value })}
                        placeholder="Vacío = oculto"
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded font-mono text-[11px] uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Texto Botón Secundario (vacío = oculto):</label>
                      <input
                        type="text"
                        value={selectedBlock.buttonTextSecondary || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { buttonTextSecondary: e.target.value })}
                        placeholder="Ej: LOOKBOOK COMUNIDAD"
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded text-xs uppercase font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Destino del Botón Secundario:</label>
                      <input
                        type="text"
                        value={selectedBlock.buttonLinkSecondary || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, { buttonLinkSecondary: e.target.value })}
                        placeholder="#catalog, #checkout, #rastreo, https://…"
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded font-mono text-[11px] focus:outline-hidden focus:border-black"
                      />
                    </div>
                    <div className="space-y-1.5 pt-2 border-t border-zinc-200">
                      <label className="font-medium text-zinc-700 block">3 Sellos Inferiores del Banner:</label>
                      {[0, 1, 2].map((i) => {
                        const seal = (selectedBlock.seals && selectedBlock.seals[i]) || {};
                        const setSeal = (patch: { title?: string; sub?: string }) => {
                          const next = [0, 1, 2].map((j) => ({ ...((selectedBlock.seals && selectedBlock.seals[j]) || {}), ...(j === i ? patch : {}) }));
                          updateBlock(selectedBlock.id, { seals: next });
                        };
                        return (
                          <div key={i} className="grid grid-cols-2 gap-1.5">
                            <input
                              type="text"
                              value={seal.title || ''}
                              onChange={(e) => setSeal({ title: e.target.value })}
                              placeholder={`Sello ${i + 1} título (ej: Envíos 24-48h)`}
                              className="px-2 py-1.5 border border-zinc-300 rounded font-mono text-[11px] font-bold uppercase"
                            />
                            <input
                              type="text"
                              value={seal.sub || ''}
                              onChange={(e) => setSeal({ sub: e.target.value })}
                              placeholder={`Sello ${i + 1} detalle (ej: A toda Colombia)`}
                              className="px-2 py-1.5 border border-zinc-300 rounded font-mono text-[11px]"
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Media Type Switcher: Image or Video */}
                    <div className="space-y-1.5 pt-2 border-t border-zinc-200">
                      <label className="font-medium text-zinc-700 flex items-center justify-between">
                        <span>Fondo del Banner:</span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {selectedBlock.mediaType === 'video' ? 'Video Streaming' : 'Foto WebP'}
                        </span>
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
                        <button
                          type="button"
                          onClick={() => updateBlock(selectedBlock.id, { mediaType: 'image' })}
                          className={`py-2 border rounded-lg cursor-pointer font-bold flex items-center justify-center gap-1.5 transition-all ${
                            selectedBlock.mediaType !== 'video'
                              ? 'bg-black text-white border-black shadow-xs'
                              : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                          }`}
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Foto Liviana</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateBlock(selectedBlock.id, {
                              mediaType: 'video',
                              videoUrl: selectedBlock.videoUrl || LIGHTWEIGHT_VIDEO_PRESETS[0].videoUrl,
                              videoPoster: selectedBlock.videoPoster || selectedBlock.imageUrl,
                              videoAutoplay: true,
                              videoMuted: true,
                              videoLoop: true,
                            })
                          }
                          className={`py-2 border rounded-lg cursor-pointer font-bold flex items-center justify-center gap-1.5 transition-all ${
                            selectedBlock.mediaType === 'video'
                              ? 'bg-black text-white border-black shadow-xs'
                              : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                          }`}
                        >
                          <Video className="w-3.5 h-3.5 text-amber-400" />
                          <span>Video Loop</span>
                        </button>
                      </div>
                    </div>

                    {/* If Video is chosen */}
                    {selectedBlock.mediaType === 'video' ? (
                      <div className="space-y-2.5 p-3 bg-zinc-950 text-white rounded-xl border border-zinc-800">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold text-amber-400 flex items-center gap-1">
                            <Video className="w-3.5 h-3.5" />
                            <span>Configuración de Video</span>
                          </span>
                          <span className="text-[9px] font-mono bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">
                            Loop H.264 / WebM
                          </span>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-zinc-400 block">
                            URL del Video (MP4 / WebM):
                          </label>
                          <input
                            type="text"
                            value={selectedBlock.videoUrl || ''}
                            onChange={(e) => updateBlock(selectedBlock.id, { videoUrl: e.target.value })}
                            placeholder="https://.../video.mp4"
                            className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded font-mono text-[10px] text-white focus:outline-hidden focus:border-amber-400"
                          />
                        </div>

                        {/* Video Presets */}
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-mono text-zinc-400 block">
                            Loops Streetwear Livianos (&lt;2 MB):
                          </span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {LIGHTWEIGHT_VIDEO_PRESETS.map((vid) => (
                              <button
                                key={vid.id}
                                type="button"
                                onClick={() =>
                                  updateBlock(selectedBlock.id, {
                                    videoUrl: vid.videoUrl,
                                    videoPoster: vid.posterUrl,
                                    mediaType: 'video',
                                  })
                                }
                                className={`p-1.5 rounded text-left transition-all border cursor-pointer ${
                                  selectedBlock.videoUrl === vid.videoUrl
                                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                                }`}
                              >
                                <span className="font-bold text-[10px] block truncate">{vid.name}</span>
                                <span className="text-[9px] font-mono text-zinc-400">{vid.sizeEstimate}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Video Poster URL */}
                        <div className="space-y-1 pt-1">
                          <label className="text-[10px] font-mono text-zinc-400 block">
                            Poster de Carga (Imagen mientras carga el video):
                          </label>
                          <input
                            type="text"
                            value={selectedBlock.videoPoster || selectedBlock.imageUrl || ''}
                            onChange={(e) => updateBlock(selectedBlock.id, { videoPoster: e.target.value })}
                            className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded font-mono text-[10px] text-white"
                          />
                        </div>

                        {/* Controls: Muted, Loop, Autoplay */}
                        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
                            <input
                              type="checkbox"
                              checked={selectedBlock.videoMuted !== false}
                              onChange={(e) => updateBlock(selectedBlock.id, { videoMuted: e.target.checked })}
                              className="rounded text-amber-500"
                            />
                            <span>Silenciado</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
                            <input
                              type="checkbox"
                              checked={selectedBlock.videoLoop !== false}
                              onChange={(e) => updateBlock(selectedBlock.id, { videoLoop: e.target.checked })}
                              className="rounded text-amber-500"
                            />
                            <span>Loop Infinito</span>
                          </label>
                        </div>
                      </div>
                    ) : (
                      /* If Image is chosen */
                      <>
                        <div className="space-y-1">
                          <label className="font-medium text-zinc-700">URL Imagen Fondo:</label>
                          <input
                            type="text"
                            value={selectedBlock.imageUrl || ''}
                            onChange={(e) => updateBlock(selectedBlock.id, { imageUrl: e.target.value })}
                            placeholder="Vacío = usa la portada del tema"
                            className="w-full px-2.5 py-1.5 border border-zinc-300 rounded font-mono text-[11px]"
                          />
                        </div>

                        {/* Real Store Hero Banner Selector */}
                        {themeConfig.heroImageUrl && (
                          <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                            <span className="text-[10px] font-mono font-bold text-indigo-900 uppercase block">
                              🌟 Portada Real de tu Tienda:
                            </span>
                            <div className="flex items-center gap-2">
                              <img
                                src={themeConfig.heroImageUrl}
                                alt="Portada"
                                className="w-12 h-10 object-cover rounded-md border border-indigo-300 shrink-0"
                              />
                              <button
                                type="button"
                                onClick={() => updateBlock(selectedBlock.id, { imageUrl: themeConfig.heroImageUrl })}
                                className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-mono font-bold text-center cursor-pointer transition-colors"
                              >
                                Sincronizar con Portada Actual
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Real Store Products Selector */}
                        {products.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] text-zinc-600 font-mono font-bold block">
                              👕 Usar Foto de Prenda Real ({products.length}):
                            </span>
                            <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-1 bg-zinc-50 border border-zinc-200 rounded-lg">
                              {products.map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => updateBlock(selectedBlock.id, { imageUrl: p.mainImage })}
                                  title={p.title}
                                  className="group relative aspect-square rounded overflow-hidden border border-zinc-300 hover:border-black transition-all cursor-pointer bg-white"
                                >
                                  <img src={p.mainImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  <span className="absolute bottom-0 inset-x-0 bg-black/75 text-white text-[8px] truncate px-1 py-0.5 font-mono text-center">
                                    {p.title.split(' ')[0]}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Compress Image Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setCompressorTargetBlockId(selectedBlock.id);
                            setIsCompressorOpen(true);
                          }}
                          className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Zap className="w-3.5 h-3.5 text-emerald-600" />
                          <span>⚡ Subir Foto desde mi PC y Comprimir</span>
                        </button>
                        {selectedBlock.isOptimizedMedia && (
                          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-700 bg-emerald-50/70 px-2 py-1 rounded">
                            <span>✓ Imagen WebP optimizada</span>
                            <span>{selectedBlock.optimizedSizeKb ? `${selectedBlock.optimizedSizeKb} KB` : 'Ultra liviana'}</span>
                          </div>
                        )}
                      </>
                    )}

                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">
                        Oscurecer fondo ({selectedBlock.overlayOpacity ?? 50}%):
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={90}
                        value={selectedBlock.overlayOpacity ?? 50}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, { overlayOpacity: parseInt(e.target.value) })
                        }
                        className="w-full accent-black"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-zinc-700">Altura del Banner:</label>
                      <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                        {(['compact', 'medium', 'tall'] as const).map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => updateBlock(selectedBlock.id, { bannerHeight: h })}
                            className={`py-1.5 border rounded-lg cursor-pointer font-bold uppercase transition-all ${
                              (selectedBlock.bannerHeight || 'medium') === h
                                ? 'bg-black text-white border-black'
                                : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                            }`}
                          >
                            {h === 'compact' ? 'Bajo' : h === 'tall' ? 'Alto' : 'Medio'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Spacer Block */}
                {selectedBlock.type === 'spacer' && (
                  <div className="space-y-1">
                    <label className="font-medium text-zinc-700">
                      Altura del espacio ({selectedBlock.spacerHeight || 48}px):
                    </label>
                    <input
                      type="range"
                      min={16}
                      max={140}
                      step={8}
                      value={selectedBlock.spacerHeight || 48}
                      onChange={(e) =>
                        updateBlock(selectedBlock.id, { spacerHeight: parseInt(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* SECTION B: VISUAL STYLING & DESIGN (colapsable) */}
              <details className="pt-3 border-t border-zinc-200">
                <summary className="cursor-pointer font-mono font-bold uppercase text-[11px] text-zinc-900 block pb-1">
                  ⚙️ 2. Diseño visual y colores (opcional)
                </summary>
                <div className="space-y-3 pt-2">

                {/* Background Color */}
                <div className="space-y-1.5">
                  <label className="font-medium text-zinc-700">Color de Fondo:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedBlock.styles?.backgroundColor || '#ffffff'}
                      onChange={(e) =>
                        updateBlock(selectedBlock.id, {
                          styles: { ...selectedBlock.styles, backgroundColor: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded border border-zinc-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={selectedBlock.styles?.backgroundColor || 'transparente'}
                      onChange={(e) =>
                        updateBlock(selectedBlock.id, {
                          styles: { ...selectedBlock.styles, backgroundColor: e.target.value },
                        })
                      }
                      className="flex-1 px-2 py-1 border border-zinc-300 rounded font-mono text-xs"
                    />
                  </div>
                  {/* Preset color buttons */}
                  <div className="flex gap-1 pt-1 flex-wrap">
                    {[
                      { label: 'Blanco', hex: '#ffffff' },
                      { label: 'Gris Claro', hex: '#f4f4f5' },
                      { label: 'Arena Cálido', hex: '#ece7df' },
                      { label: 'Negro Street', hex: '#09090b' },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        onClick={() =>
                          updateBlock(selectedBlock.id, {
                            styles: { ...selectedBlock.styles, backgroundColor: c.hex },
                          })
                        }
                        className="text-[10px] font-mono px-2 py-0.5 border border-zinc-200 rounded hover:border-black cursor-pointer"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Alignment */}
                <div className="space-y-1">
                  <label className="font-medium text-zinc-700">Alineación del Texto:</label>
                  <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() =>
                          updateBlock(selectedBlock.id, {
                            styles: { ...selectedBlock.styles, textAlign: align },
                          })
                        }
                        className={`py-1.5 border rounded cursor-pointer font-bold ${
                          selectedBlock.styles?.textAlign === align || (!selectedBlock.styles?.textAlign && align === 'left')
                            ? 'bg-black text-white border-black'
                            : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                        }`}
                      >
                        {align === 'left' ? 'Izquierda' : align === 'center' ? 'Centro' : 'Derecha'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vertical Padding */}
                <div className="space-y-1">
                  <label className="font-medium text-zinc-700">Espacio arriba / abajo:</label>
                  <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
                    {(['none', 'sm', 'md', 'lg', 'xl'] as const).map((pad) => (
                      <button
                        key={pad}
                        onClick={() =>
                          updateBlock(selectedBlock.id, {
                            styles: { ...selectedBlock.styles, paddingY: pad },
                          })
                        }
                        className={`py-1 border rounded cursor-pointer font-bold uppercase ${
                          selectedBlock.styles?.paddingY === pad
                            ? 'bg-black text-white border-black'
                            : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                        }`}
                      >
                        {pad}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border Radius */}
                <div className="space-y-1">
                  <label className="font-medium text-zinc-700">Esquinas:</label>
                  <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
                    {(['none', 'sm', 'md', 'full'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() =>
                          updateBlock(selectedBlock.id, {
                            styles: { ...selectedBlock.styles, borderRadius: r },
                          })
                        }
                        className={`py-1 border rounded cursor-pointer font-bold uppercase ${
                          selectedBlock.styles?.borderRadius === r
                            ? 'bg-black text-white border-black'
                            : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                        }`}
                      >
                        {r === 'full' ? 'Pill' : r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border toggle */}
                <div className="pt-2 flex items-center justify-between">
                  <label className="font-medium text-zinc-700">Borde alrededor:</label>
                  <input
                    type="checkbox"
                    checked={!!selectedBlock.styles?.border}
                    onChange={(e) =>
                      updateBlock(selectedBlock.id, {
                        styles: { ...selectedBlock.styles, border: e.target.checked },
                      })
                    }
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                </div>
              </details>

              {/* Action Buttons for selected block */}
              <div className="pt-4 border-t border-zinc-200 flex gap-2">
                <button
                  onClick={() => duplicateBlock(selectedBlock.id)}
                  className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-mono text-xs font-bold rounded flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicar</span>
                </button>
                <button
                  onClick={() => {
                    deleteBlock(selectedBlock.id);
                    setSelectedBlockId(null);
                  }}
                  className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 font-mono text-xs font-bold rounded flex items-center justify-center gap-1 cursor-pointer border border-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mobile Apply and Return Button */}
              <button
                onClick={() => setMobileViewTab('canvas')}
                className="lg:hidden w-full py-2.5 bg-black hover:bg-zinc-800 text-white font-mono text-xs font-bold uppercase rounded-lg flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Aplicar y Ver en Lienzo</span>
              </button>
            </div>
          )}
        </aside>
      )}
      </div>

      {/* Media Compressor & Ultra-Lightweight Video Modal */}
      <MediaCompressorModal
        isOpen={isCompressorOpen}
        onClose={() => setIsCompressorOpen(false)}
        onApplyImage={(dataUrl, sizeKb) => {
          if (compressorTargetBlockId) {
            updateBlock(compressorTargetBlockId, {
              imageUrl: dataUrl,
              videoPoster: dataUrl,
              isOptimizedMedia: true,
              optimizedSizeKb: sizeKb,
            });
            showToast(`⚡ ¡Foto optimizada a WebP (${sizeKb} KB) y aplicada con éxito!`);
          } else {
            showToast('⚡ Foto comprimida a WebP lista en el portapapeles');
          }
        }}
        onApplyVideo={(videoUrl, posterUrl) => {
          if (compressorTargetBlockId) {
            updateBlock(compressorTargetBlockId, {
              mediaType: 'video',
              videoUrl,
              videoPoster: posterUrl,
              videoAutoplay: true,
              videoMuted: true,
              videoLoop: true,
            });
            showToast('🎥 ¡Video loop ultraliviano configurado en el Banner!');
          }
        }}
        targetBlockTitle={selectedBlock?.title || selectedBlock?.type}
      />
    </div>
  );
};
