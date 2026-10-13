import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit3,
  Trash2,
  Copy,
  CheckCircle2,
  Flame,
  Star,
  Tag,
  ExternalLink,
  Layers,
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  Eye,
  X,
  Store,
  Pin,
  PinOff,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import { Product } from '../../types';
import { ProductModal } from './ProductModal';

export const CatalogManager: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    setShowcasePinned,
    deleteProduct,
    duplicateProduct,
    updateProductStock,
    showToast,
    openProductDetail,
    setActiveCategoryFilter,
    setActiveView,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const categories = Array.from(
    new Set(
      products
        .map((p) => (p.category || '').trim())
        .filter((c): c is string => Boolean(c))
    )
  );

  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (savedProduct: Product) => {
    if (productToEdit) {
      updateProduct(savedProduct.id, savedProduct);
      showToast?.(`Producto "${savedProduct.title}" actualizado con éxito`);
    } else {
      addProduct(savedProduct);
      showToast?.(`¡Producto "${savedProduct.title}" publicado! Navegando a la categoría...`);
      
      // Navigate to the category in the storefront so user can preview it directly
      if (savedProduct.category) {
        setActiveCategoryFilter(savedProduct.category);
        setActiveView('home');
        setTimeout(() => {
          const el =
            document.getElementById('catalogo-drops') ||
            document.getElementById('catalogo-productos') ||
            document.getElementById('drops-urbanos');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      }
    }
  };

  const handleDelete = (prod: Product) => {
    if (window.confirm(`¿Estás seguro de eliminar el producto "${prod.title}"?`)) {
      deleteProduct(prod.id);
    }
  };

  const filtered = products.filter((p) => {
    const pCat = p.category || '';
    if (selectedCategory !== 'ALL' && pCat !== selectedCategory) return false;
    
    const totalStock = p.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
    if (stockFilter === 'IN_STOCK' && totalStock <= 0) return false;
    if (stockFilter === 'LOW_STOCK' && (totalStock > 10 || totalStock <= 0)) return false;
    if (stockFilter === 'OUT_OF_STOCK' && totalStock > 0) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const title = (p.title || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const ref = (p.reference || '').toLowerCase();
      return (
        title.includes(q) ||
        cat.includes(q) ||
        ref.includes(q)
      );
    }
    return true;
  });

  const totalStockAcrossCatalog = products.reduce(
    (acc, p) => acc + (p.variants?.reduce((vAcc, v) => vAcc + (v.stock || 0), 0) || 0),
    0
  );

  return (
    <div className="p-6 sm:p-8 space-y-6 bg-[#f8f9fc] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1">
            CONTROL DE PRODUCTOS, SKU & STOCK COLOMBIA
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Catálogo Maestro de Productos</span>
            <span className="text-xs font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
              {filtered.length} productos
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total en inventario: <strong className="text-slate-800 font-mono">{totalStockAcrossCatalog}</strong> unidades activas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear producto</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU, referencia o tela..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">Todas las Categorías</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">Todo el Stock</option>
            <option value="IN_STOCK">En Stock (&gt; 0)</option>
            <option value="LOW_STOCK">Stock Bajo (≤ 10)</option>
            <option value="OUT_OF_STOCK">Agotado (0)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Cuadrícula
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Tabla
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid View */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-12 text-center">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Catálogo Limpio y Listo</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No hay productos registrados en este momento. Puedes crear tu primer producto haciendo clic en el botón de abajo.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Crear primer producto</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((prod) => {
            const firstVariant = prod.variants?.[0];
            const price = firstVariant?.priceInCents || 18990000;
            const originalPrice = firstVariant?.originalPriceInCents;
            const totalStock = prod.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;

            return (
              <div
                key={prod.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:border-indigo-300 transition-all group"
              >
                <div>
                  <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                    <img
                      src={prod.mainImage}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {prod.badge && (
                      <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                        <Flame className="w-3 h-3 text-rose-500 fill-rose-500" /> {prod.badge}
                      </span>
                    )}
                    <span className="absolute top-3 right-3 bg-black/75 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                      {prod.reference}
                    </span>

                    {totalStock <= 0 && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                        <span className="bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                          Agotado
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 text-[10px] font-bold">
                        {prod.category}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{prod.rating || 5.0}</span>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm line-clamp-1">{prod.title}</h3>

                    <div className="flex items-baseline gap-2 pt-0.5">
                      <span className="text-base font-black text-indigo-700 font-mono">
                        ${formatCOP(price)} COP
                      </span>
                      {originalPrice && (
                        <span className="text-xs text-slate-400 line-through font-mono">
                          ${formatCOP(originalPrice)} COP
                        </span>
                      )}
                    </div>

                    {/* Sizing & Colors summary */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1 font-mono">
                      <span>Tallas: {prod.availableSizes?.join(', ') || 'Única'}</span>
                      <span>•</span>
                      <span>{prod.availableColors?.length || 1} colores</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-bold text-[11px]">Stock Total:</span>
                      <input
                        type="number"
                        min={0}
                        value={firstVariant?.stock || 0}
                        onChange={(e) => updateProductStock(prod.id, Number(e.target.value))}
                        className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono font-bold text-center text-xs"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewProduct(prod)}
                      className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-bold text-xs bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-indigo-200/80 active:scale-95"
                      title="Ver Ficha y Vista Previa del producto"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Ver producto</span>
                    </button>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(prod)}
                      className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => duplicateProduct(prod.id)}
                      className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors"
                      title="Duplicar producto"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowcasePinned(prod.id, !prod.showcasePinned);
                        showToast?.(
                          prod.showcasePinned ? '📌 Salió de la vitrina fija' : '📌 Fijado en la vitrina'
                        );
                      }}
                      className={`p-1.5 border rounded-xl text-xs font-bold transition-colors ${
                        prod.showcasePinned
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-white text-slate-400 border-slate-200 hover:text-amber-700'
                      }`}
                      title={prod.showcasePinned ? 'Quitar de la vitrina fija' : 'Fijar en la vitrina'}
                    >
                      {prod.showcasePinned ? <Pin className="w-3.5 h-3.5 fill-amber-400" /> : <PinOff className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleDelete(prod)}
                      className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-xl text-xs font-bold transition-colors"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-4">Producto / Foto</th>
                  <th className="p-4">SKU / Ref</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Precio COP</th>
                  <th className="p-4">Variantes</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((prod) => {
                  const firstVariant = prod.variants?.[0];
                  const totalStock = prod.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.mainImage}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block line-clamp-1">{prod.title}</span>
                            {prod.badge && (
                              <span className="text-[10px] font-black text-rose-600">
                                🔥 {prod.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-600">{prod.reference}</td>
                      <td className="p-4 text-slate-600 font-medium">{prod.category}</td>
                      <td className="p-4 font-mono font-black text-indigo-700">
                        ${formatCOP(firstVariant?.priceInCents || 18990000)} COP
                      </td>
                      <td className="p-4 text-slate-500">
                        {prod.availableSizes?.length || 1} tallas • {prod.availableColors?.length || 1} colores
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          min={0}
                          value={firstVariant?.stock || 0}
                          onChange={(e) => updateProductStock(prod.id, Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-center text-xs"
                        />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setShowcasePinned(prod.id, !prod.showcasePinned);
                              showToast?.(
                                prod.showcasePinned
                                  ? `📌 "${prod.title}" sale de la vitrina fija`
                                  : `📌 "${prod.title}" fijado en la vitrina`
                              );
                            }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
                              prod.showcasePinned
                                ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-300'
                                : 'text-slate-400 hover:text-amber-700 hover:bg-amber-50 border-transparent'
                            }`}
                            title={prod.showcasePinned ? 'Quitar de la vitrina fija' : 'Fijar en la vitrina'}
                          >
                            {prod.showcasePinned ? <Pin className="w-4 h-4 fill-amber-400" /> : <PinOff className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewProduct(prod)}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 bg-indigo-50 rounded-lg transition-colors cursor-pointer border border-indigo-200/60"
                            title="Ver Ficha y Vista Previa del producto"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                            title="Editar producto"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => duplicateProduct(prod.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                            title="Duplicar"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Create & Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
      />

      {/* In-Admin Product Preview Modal */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    Vista Previa de producto
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Ref / SKU: {previewProduct.reference} • {previewProduct.category}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Cerrar vista previa"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={previewProduct.mainImage}
                    alt={previewProduct.title}
                    className="w-full h-full object-cover"
                  />
                  {previewProduct.badge && (
                    <span className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                      🔥 {previewProduct.badge}
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                    PRODUCTO VERIFICADO
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {previewProduct.category}
                    </span>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                      {previewProduct.title}
                    </h2>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-xl font-black text-slate-900 font-mono">
                        ${formatCOP(previewProduct.variants?.[0]?.priceInCents || 18990000)} COP
                      </span>
                      {previewProduct.variants?.[0]?.compareAtPriceInCents && (
                        <span className="text-xs text-slate-400 line-through font-mono">
                          ${formatCOP(previewProduct.variants[0].compareAtPriceInCents)} COP
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pt-2">
                      {previewProduct.description || 'Producto de calidad verificada con fotos reales, stock listo y garantía de 30 días.'}
                    </p>
                  </div>

                  {/* Stock & Sizes */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Tallas Disponibles:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {previewProduct.availableSizes?.map((sz) => (
                          <span
                            key={sz}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono font-bold text-[10px] border border-slate-200"
                          >
                            {sz}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-500 font-semibold">Stock Total:</span>
                      <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        {previewProduct.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0} unidades
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  const prod = previewProduct;
                  setPreviewProduct(null);
                  openProductDetail(prod);
                  showToast(`Visualizando "${prod.title}" en la vitrina pública.`);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Ver en Tienda Pública (Cliente)</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const prod = previewProduct;
                    setPreviewProduct(null);
                    handleOpenEditModal(prod);
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Editar producto
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewProduct(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
