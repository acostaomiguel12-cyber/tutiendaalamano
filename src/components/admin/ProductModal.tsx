import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Sparkles,
  Plus,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  Package,
  Layers,
  Tag,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Flame,
  ArrowRight,
  Upload,
  Zap,
  Move,
} from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { formatCOP } from '../../lib/wompi';
import { useStore } from '../../context/StoreContext';
import { DEFAULT_NAV_LINKS } from '../../data/themes';
import { compressImageFile } from '../../lib/mediaOptimizer';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  productToEdit?: Product | null;
}

const PRESET_IMAGES = [
  {
    category: 'Ropa',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80',
    name: 'Ropa para todos',
  },
  {
    category: 'Hogar',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
    name: 'Decoración hogar',
  },
  {
    category: 'Mascotas',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1000&q=80',
    name: 'Mascotas felices',
  },
  {
    category: 'Café e Infusiones',
    url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1000&q=80',
    name: 'Café de origen',
  },
  {
    category: 'Accesorios',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
    name: 'Accesorios top',
  },
];

const AVAILABLE_CATEGORIES = [
  'Ropa',
  'Hogar',
  'Mascotas',
  'Café e Infusiones',
  'Accesorios',
];

const BADGE_PRESETS = [
  'DROP EXCLUSIVO',
  'FLASH DEAL',
  'BESTSELLER',
  'EDICIÓN LIMITADA',
  'NUEVO LANZAMIENTO',
  'HECHO EN COLOMBIA',
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
}) => {
  const { products, themeConfig } = useStore();
  const isEditing = Boolean(productToEdit);

  // Dynamic list of categories from config + existing catalog
  const allKnownCategories = useMemo(() => {
    const set = new Set<string>();
    AVAILABLE_CATEGORIES.forEach((c) => set.add(c));
    (themeConfig.navCategoryLinks || DEFAULT_NAV_LINKS).forEach((l) => {
      if (l.filter) set.add(l.filter);
    });
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products, themeConfig.navCategoryLinks]);

  // Form State
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'variants' | 'specs' | 'media'>('general');
  const [title, setTitle] = useState(productToEdit?.title || '');
  const [reference, setReference] = useState(productToEdit?.reference || `APX-${Math.floor(1000 + Math.random() * 9000)}`);
  const [category, setCategory] = useState(productToEdit?.category || 'Ropa');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategoryActive, setIsCustomCategoryActive] = useState(false);
  const [subcategory, setSubcategory] = useState(productToEdit?.subcategory || 'Edición Limitada');
  const [badge, setBadge] = useState(productToEdit?.badge || 'DROP EXCLUSIVO');
  const [description, setDescription] = useState(
    productToEdit?.description ||
      'Prenda confeccionada con estándares de alta costura urbana en Medellín, Colombia. Diseñada con un corte oversize contemporáneo y tejidos pesados de máxima durabilidad.'
  );

  // Pricing (in COP pesos)
  const defaultPriceCOP = productToEdit?.variants?.[0]?.priceInCents
    ? productToEdit.variants[0].priceInCents / 100
    : 189900;
  const defaultOriginalPriceCOP = productToEdit?.variants?.[0]?.originalPriceInCents
    ? productToEdit.variants[0].originalPriceInCents / 100
    : 249900;

  const [priceCOP, setPriceCOP] = useState<number>(defaultPriceCOP);
  const [originalPriceCOP, setOriginalPriceCOP] = useState<number>(defaultOriginalPriceCOP);
  const [costCOP, setCostCOP] = useState<number>(Math.round(defaultPriceCOP * 0.45)); // Estimated cost 45%

  // Sizing & Colors
  const [sizes, setSizes] = useState<string[]>(productToEdit?.availableSizes || ['S', 'M', 'L', 'XL']);
  const [colors, setColors] = useState<{ name: string; hex: string }[]>(
    productToEdit?.availableColors || [
      { name: 'Cyber Black', hex: '#18181b' },
      { name: 'Bone White', hex: '#f4f4f5' },
    ]
  );
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#2b47e5');

  // Stock per variant or overall
  const [baseStock, setBaseStock] = useState<number>(
    productToEdit?.variants?.[0]?.stock || 25
  );

  // Specs & Materials
  const [materials, setMaterials] = useState(
    productToEdit?.materials || '100% Algodón Peinado Heavyweight (450 GSM)'
  );
  const [features, setFeatures] = useState<string[]>(
    productToEdit?.features || [
      'Gramaje pesado de 450 GSM con caída estructurada',
      'Cremalleras metálicas YKK reforzadas y tiradores custom',
      'Corte Boxy Fit relajado unisex',
      'Hecho éticamente en talleres de confección de Medellín, Colombia',
    ]
  );
  const [newFeature, setNewFeature] = useState('');

  // Media
  const [mainImage, setMainImage] = useState(
    productToEdit?.mainImage ||
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80'
  );
  const [thumbnailImages, setThumbnailImages] = useState<string[]>(
    productToEdit?.thumbnailImages || [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
    ]
  );
  const [imagePosition, setImagePosition] = useState<string>(
    productToEdit?.imagePosition || 'center'
  );
  const [compressionStats, setCompressionStats] = useState<{
    originalKB: number;
    compressedKB: number;
    savedPct: number;
  } | null>(null);
  const [customThumbUrl, setCustomThumbUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadMainImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await compressImageFile(file, {
        maxWidth: 1200,
        maxHeight: 1600,
        quality: 0.82,
        targetFormat: 'webp',
      });
      setMainImage(result.dataUrl);
      setThumbnailImages((prev) => [result.dataUrl, ...prev.filter((t) => t !== result.dataUrl)]);
      setCompressionStats({
        originalKB: Math.round(result.originalSize / 1024),
        compressedKB: Math.round(result.compressedSize / 1024),
        savedPct: result.savedPercentage,
      });
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const url = event.target.result as string;
          setMainImage(url);
          setThumbnailImages((prev) => [url, ...prev.filter((t) => t !== url)]);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsGalleryUploading(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const result = await compressImageFile(file, {
            maxWidth: 1200,
            maxHeight: 1600,
            quality: 0.82,
            targetFormat: 'webp',
          });
          newUrls.push(result.dataUrl);
        } catch {
          // fallback
        }
      }
      if (newUrls.length > 0) {
        setThumbnailImages((prev) => [...prev, ...newUrls]);
      }
    } finally {
      setIsGalleryUploading(false);
    }
  };

  // Calculations
  const grossProfitCOP = priceCOP - costCOP;
  const marginPercent = priceCOP > 0 ? Math.round((grossProfitCOP / priceCOP) * 100) : 0;
  const discountPercent =
    originalPriceCOP > priceCOP
      ? Math.round(((originalPriceCOP - priceCOP) / originalPriceCOP) * 100)
      : 0;

  if (!isOpen) return null;

  const handleToggleSize = (size: string) => {
    if (sizes.includes(size)) {
      if (sizes.length > 1) {
        setSizes(sizes.filter((s) => s !== size));
      }
    } else {
      setSizes([...sizes, size]);
    }
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setColors([...colors, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName('');
  };

  const handleRemoveColor = (name: string) => {
    if (colors.length > 1) {
      setColors(colors.filter((c) => c.name !== name));
    }
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    setFeatures([...features, newFeature.trim()]);
    setNewFeature('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleAddThumbnail = () => {
    if (!customThumbUrl.trim()) return;
    setThumbnailImages([...thumbnailImages, customThumbUrl.trim()]);
    setCustomThumbUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalThumbnails = [
      mainImage,
      ...thumbnailImages.filter((t) => t && t.trim() !== '' && t !== mainImage),
    ];

    // Generate variants
    const generatedVariants: ProductVariant[] = [];
    colors.forEach((col) => {
      sizes.forEach((sz) => {
        generatedVariants.push({
          id: `var-${reference.toLowerCase()}-${col.name.slice(0, 3).toLowerCase()}-${sz.toLowerCase()}`,
          sku: `${reference}-${col.name.slice(0, 3).toUpperCase()}-${sz}`,
          colorName: col.name,
          colorHex: col.hex,
          size: sz,
          priceInCents: priceCOP * 100,
          originalPriceInCents: originalPriceCOP ? originalPriceCOP * 100 : undefined,
          stock: baseStock,
          stockReserved: 0,
          images: finalThumbnails,
        });
      });
    });

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const finalCategory = isCustomCategoryActive && customCategory.trim()
      ? customCategory.trim()
      : category;

    const finalProduct: Product = {
      id: productToEdit?.id || `prod-${Date.now()}`,
      title: title.trim(),
      slug: slug || `producto-${Date.now()}`,
      reference: reference.toUpperCase().trim(),
      category: finalCategory,
      subcategory: subcategory,
      badge: badge || undefined,
      discountPercentage: discountPercent > 0 ? discountPercent : undefined,
      rating: productToEdit?.rating || 4.9,
      reviewsCount: productToEdit?.reviewsCount || 18,
      description: description.trim(),
      features: features.length > 0 ? features : ['Corte Boxy Fit exclusivo', 'Algodón peinado premium'],
      materials: materials,
      shippingInfo: 'Envío prioritario con Coordinadora / Servientrega (24-48h a ciudades principales de Colombia)',
      returnPolicy: '30 días de garantía total por defectos o cambios de talla en Colombia',
      active: true,
      variants: generatedVariants,
      availableSizes: sizes,
      availableColors: colors,
      mainImage: mainImage,
      thumbnailImages: finalThumbnails,
      imagePosition: imagePosition || 'center',
      salesLast24h: productToEdit?.salesLast24h || Math.floor(3 + Math.random() * 8),
    };

    onSave(finalProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                {isEditing ? `Editar Prenda: ${productToEdit?.title}` : 'Crear Nuevo Producto / Drop Apex'}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Gestión avanzada de SKU, inventario y pasarela Wompi Colombia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 overflow-x-auto text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Información Básica</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Precios & Margen COP</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('variants')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'variants'
                ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tallas, Colores & Stock</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Gramaje & Ficha Técnica</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'media'
                ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Galería & Fotos</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="font-bold text-slate-800 block">
                    Nombre Comercial de la Prenda <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Oversized Heavyweight Raw Hoodie (450 GSM)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">
                    Referencia / SKU Base <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="APX-8821-HD"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold uppercase focus:bg-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 block">Categoría Principal</label>
                    <button
                      type="button"
                      onClick={() => setIsCustomCategoryActive(!isCustomCategoryActive)}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                    >
                      {isCustomCategoryActive ? 'Ver Lista' : '+ Nueva Categoría'}
                    </button>
                  </div>

                  {isCustomCategoryActive ? (
                    <input
                      type="text"
                      placeholder="Ej: Gorras & Beanies"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-indigo-50/60 border border-indigo-300 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:border-indigo-600"
                    />
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomCategoryActive(true);
                        } else {
                          setCategory(e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                    >
                      {allKnownCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__custom__">➕ Crear Otra Categoría...</option>
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">Subcategoría / Colección</label>
                  <input
                    type="text"
                    placeholder="Drop Season 2026"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">Badge / Etiqueta Visual</label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-600 focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="">Sin Etiqueta</option>
                    {BADGE_PRESETS.map((b) => (
                      <option key={b} value={b}>
                        🔥 {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">Descripción Narrativa de Moda</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe los cortes, sensaciones táctiles, estilo y propósito de la prenda..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Quick Image Upload & Preview in Tab 1 */}
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-16 h-20 rounded-xl overflow-hidden border border-indigo-200 bg-white shrink-0 shadow-xs">
                    <img
                      src={mainImage}
                      alt={title || 'Prenda'}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: imagePosition || 'center' }}
                    />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Foto Principal de la Prenda</span>
                    <span className="text-[11px] text-slate-500 font-sans block">
                      {compressionStats
                        ? `Optimizado a WebP (${compressionStats.compressedKB} KB - ${compressionStats.savedPct}% ahorro)`
                        : 'Sube la foto desde tu PC o celular con compresión WebP automática'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('media')}
                      className="text-[10px] font-mono text-indigo-600 hover:text-indigo-800 underline font-bold mt-1 inline-block"
                    >
                      Ajustar encuadre o galería ({thumbnailImages.length} fotos) →
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Optimizando...' : 'Subir Foto desde mi PC'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & MARGIN */}
          {activeTab === 'pricing' && (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                  <label className="font-extrabold text-indigo-950 block">
                    Precio de Venta al Público (COP) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      step={1000}
                      min={10000}
                      required
                      value={priceCOP}
                      onChange={(e) => setPriceCOP(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2.5 bg-white border border-indigo-200 rounded-xl font-mono text-base font-black text-indigo-700 focus:outline-hidden"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Equivale a ${formatCOP(priceCOP * 100)} COP en pasarela
                  </span>
                </div>

                <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="font-bold text-slate-700 block">
                    Precio de Comparación / Original (COP)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      step={1000}
                      value={originalPriceCOP}
                      onChange={(e) => setOriginalPriceCOP(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-600 focus:outline-hidden"
                    />
                  </div>
                  {discountPercent > 0 ? (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Descuento visible de {discountPercent}% OFF
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Sin descuento tachado</span>
                  )}
                </div>

                <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="font-bold text-slate-700 block">Costo de Fabricación (COP)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      step={1000}
                      value={costCOP}
                      onChange={(e) => setCostCOP(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-700 focus:outline-hidden"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">Tela, confección, tags y empaque</span>
                </div>
              </div>

              {/* Profit & Margin Calculator Card */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    PROYECCIÓN DE RENTABILIDAD
                  </span>
                  <h4 className="text-sm font-black">Margen Bruto de Ganancia por Unidad</h4>
                  <p className="text-xs text-slate-400">
                    Ganancia neta estimada antes de comisiones Wompi (2.65% + $700 COP)
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">Margen %</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {marginPercent}%
                    </span>
                  </div>
                  <div className="text-right border-l border-slate-700 pl-6">
                    <span className="text-[10px] text-slate-400 block font-mono">Utilidad Bruta</span>
                    <span className="text-2xl font-black text-white font-mono">
                      ${formatCOP(grossProfitCOP * 100)} COP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VARIANTS & SIZES */}
          {activeTab === 'variants' && (
            <div className="space-y-6 text-xs">
              {/* Sizes Selector */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="font-bold text-slate-800 block">
                  Curva de Tallas Disponibles en Colombia
                </label>
                <div className="flex items-center gap-2 flex-wrap font-mono">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única', 'Ajustable', '38', '40', '42'].map(
                    (sz) => {
                      const isSelected = sizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleToggleSize(sz)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    }
                  )}
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  Selecciona todas las tallas que se generarán en el inventario.
                </p>
              </div>

              {/* Color Swatches */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="font-bold text-slate-800 block">Variantes de Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {colors.map((c) => (
                    <div
                      key={c.name}
                      className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs"
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-slate-300 shadow-inner"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="font-bold text-slate-800">{c.name}</span>
                      {colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(c.name)}
                          className="text-slate-400 hover:text-rose-500 ml-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Color Row */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-slate-200 p-0.5 cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Nombre del color (ej. Verde Olivo Militar)"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    Agregar Color
                  </button>
                </div>
              </div>

              {/* Base Stock per variant */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">Stock Inicial por Variante</h4>
                  <p className="text-[11px] text-slate-500">
                    Se generarán {sizes.length * colors.length} SKUs únicos con este inventario cada uno.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={baseStock}
                    onChange={(e) => setBaseStock(Number(e.target.value))}
                    className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-center text-xs"
                  />
                  <span className="font-bold text-slate-500 text-xs">unidades</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SPECS & MATERIALS */}
          {activeTab === 'specs' && (
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">Composición & Gramaje Textil</label>
                <input
                  type="text"
                  placeholder="ej. 100% Algodón Peinado Heavyweight (450 GSM)"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">
                  Puntos Clave / Características Destacadas
                </label>
                <div className="space-y-2">
                  {features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <span className="font-medium text-slate-700 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        {feat}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="ej. Forro térmico interior y costuras dobles reforzadas..."
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors text-xs"
                  >
                    Agregar Detalle
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MEDIA & GALLERY */}
          {activeTab === 'media' && (
            <div className="space-y-6 text-xs">
              {/* Main Image Upload & URL */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-bold text-slate-800 block text-xs">Foto Principal de la Prenda</label>
                    <span className="text-[11px] text-slate-500">
                      Sube la foto real desde tu PC o celular. El sistema la optimiza y comprime automáticamente a WebP.
                    </span>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleUploadMainImage}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Optimizando...' : 'Examinar Foto en mi Equipo'}</span>
                    </button>
                  </div>
                </div>

                {/* Compression stats banner */}
                {compressionStats && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-[11px] font-mono text-emerald-900 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Foto optimizada a WebP:</strong> Reducida de {compressionStats.originalKB} KB a {compressionStats.compressedKB} KB ({compressionStats.savedPct}% de ahorro en peso).
                      </span>
                    </div>
                    <span className="bg-emerald-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                      WebP Ultra-Ligero
                    </span>
                  </div>
                )}

                {/* Preview Box & Posicionador de Enfoque */}
                {mainImage && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3">
                      <div className="relative w-20 h-24 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 shadow-xs">
                        <img
                          src={mainImage}
                          alt="Vista previa principal"
                          className="w-full h-full object-cover"
                          style={{ objectPosition: imagePosition || 'center' }}
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-black/75 text-white text-[8px] font-mono text-center py-0.5 font-bold">
                          PRINCIPAL
                        </span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">URL o Imagen Base64:</span>
                        <input
                          type="text"
                          required
                          value={mainImage}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMainImage(val);
                            setThumbnailImages((prev) => [val, ...prev.filter((t) => t !== val)]);
                          }}
                          placeholder="https://..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-[10px] focus:outline-hidden focus:border-indigo-500 truncate"
                        />
                      </div>
                    </div>

                    {/* Posicionador y Enfoque de Prenda */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                          <Move className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Posicionador y Enfoque de la Prenda (Vitrina y Celular)</span>
                        </div>
                        <span className="text-[10px] font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                          {imagePosition}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans">
                        Controla el encuadre para evitar recortes de capota, estampados en el pecho, corte de tiro o zapatillas:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 font-mono text-[10px]">
                        {[
                          { label: '🎯 Centro', val: 'center' },
                          { label: '⬆ Rostro / Capota', val: '50% 15%' },
                          { label: '👕 Pecho / Logo', val: '50% 35%' },
                          { label: '👖 Cintura / Tiro', val: '50% 60%' },
                          { label: '👟 Zapatillas / Base', val: '50% 85%' },
                        ].map((pos) => (
                          <button
                            key={pos.val}
                            type="button"
                            onClick={() => setImagePosition(pos.val)}
                            className={`py-2 px-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                              imagePosition === pos.val
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Presets Gallery */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">
                  O elige una foto de muestra en alta resolución (Unsplash Pro):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => {
                        setMainImage(preset.url);
                        if (!thumbnailImages.includes(preset.url)) {
                          setThumbnailImages([...thumbnailImages, preset.url]);
                        }
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        mainImage === preset.url
                          ? 'border-indigo-600 ring-2 ring-indigo-200'
                          : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] p-1 truncate font-medium">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Thumbnails with PC File Upload */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-bold text-slate-800 block text-xs">Fotos Secundarias / Galería</label>
                    <span className="text-[11px] text-slate-500">
                      Sube más ángulos de la prenda desde tu PC o ingresa la URL.
                    </span>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={galleryFileInputRef}
                      onChange={handleUploadGalleryImage}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => galleryFileInputRef.current?.click()}
                      disabled={isGalleryUploading}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{isGalleryUploading ? 'Comprimiendo...' : 'Subir Fotos desde mi PC'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {thumbnailImages.map((thumb, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group bg-white shadow-xs"
                    >
                      <img
                        src={thumb}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{ objectPosition: imagePosition || 'center' }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setThumbnailImages(thumbnailImages.filter((_, i) => i !== idx))
                        }
                        className="absolute inset-0 bg-rose-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                        title="Eliminar de galería"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="url"
                    placeholder="O pegar URL directa de foto secundaria..."
                    value={customThumbUrl}
                    onChange={(e) => setCustomThumbUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddThumbnail}
                    className="bg-slate-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-slate-850 cursor-pointer"
                  >
                    Agregar URL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>
                {isEditing
                  ? 'Los cambios se sincronizan en tiempo real con Wompi y la vitrina pública.'
                  : 'Al publicar el producto, la tienda navegará automáticamente a su categoría.'}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEditing ? 'Guardar Cambios' : 'Publicar y Ver en Categoría'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
