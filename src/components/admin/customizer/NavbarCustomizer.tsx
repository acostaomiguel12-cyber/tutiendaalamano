import React, { useState, useMemo } from 'react';
import {
  Menu,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Sparkles,
  RotateCcw,
  Tag,
  Check,
  RefreshCw,
  Sliders,
  ExternalLink,
  Save,
  Database,
  Volume2,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { NavCategoryLink } from '../../../types';
import { DEFAULT_NAV_LINKS } from '../../../data/themes';
import { isSupabaseConfigured, syncThemeToSupabase } from '../../../lib/supabase';

export const NavbarCustomizer: React.FC<{ advanced?: boolean }> = ({ advanced = false }) => {
  const { themeConfig, updateThemeConfig, products, setActiveCategoryFilter, setActiveView, showToast } = useStore();
  const [isSavingDb, setIsSavingDb] = useState(false);

  // Active navigation links list from theme or fallback to defaults
  const navLinks: NavCategoryLink[] =
    themeConfig.navCategoryLinks && themeConfig.navCategoryLinks.length > 0
      ? themeConfig.navCategoryLinks
      : DEFAULT_NAV_LINKS;

  // New category link form state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newFilter, setNewFilter] = useState('');
  const [newBadge, setNewBadge] = useState('');
  const [selectedExistingCategory, setSelectedExistingCategory] = useState('');

  // Editing link state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Extract all unique categories present in the products catalog
  const catalogCategories: string[] = useMemo(() => {
    const list: string[] = [];
    products.forEach((p) => {
      const cat = (p.category || '').trim();
      if (cat && !list.includes(cat)) {
        list.push(cat);
      }
    });
    return list;
  }, [products]);

  // Find categories in catalog that are not yet in the navbar
  const unlinkedCatalogCategories: string[] = catalogCategories.filter(
    (cat: string) => !navLinks.some((l) => (l.filter || '').toLowerCase() === cat.toLowerCase())
  );

  // Count products per category filter
  const getProductCountForFilter = (filter: string | null) => {
    if (!filter) return products.length;
    const filterLower = filter.toLowerCase();
    return products.filter((p) => {
      const pCat = (p.category || '').toLowerCase();
      return (
        pCat === filterLower ||
        pCat.includes(filterLower) ||
        filterLower.includes(pCat)
      );
    }).length;
  };

  const handleManualSaveDb = async () => {
    setIsSavingDb(true);
    try {
      if (isSupabaseConfigured()) {
        const ok = await syncThemeToSupabase(themeConfig);
        if (ok) {
          showToast('✅ Menú y configuración del Navbar guardados en Supabase.');
        } else {
          showToast('⚠️ Guardado localmente. Revisa la conexión de Supabase.');
        }
      } else {
        showToast('💾 Guardado localmente en el navegador.');
      }
    } catch {
      showToast('⚠️ Guardado localmente.');
    } finally {
      setIsSavingDb(false);
    }
  };

  const handleToggleEnabled = (id: string) => {
    const updated = navLinks.map((link) => {
      if (link.id === id) {
        return { ...link, enabled: link.enabled === false ? true : false };
      }
      return link;
    });
    updateThemeConfig({ navCategoryLinks: updated });
  };

  const handleDeleteLink = (id: string, name: string) => {
    const updated = navLinks.filter((link) => link.id !== id);
    updateThemeConfig({ navCategoryLinks: updated });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...navLinks];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    updateThemeConfig({ navCategoryLinks: updated });
  };

  const handleMoveDown = (index: number) => {
    if (index === navLinks.length - 1) return;
    const updated = [...navLinks];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    updateThemeConfig({ navCategoryLinks: updated });
  };

  const handleUpdateLink = (id: string, updates: Partial<NavCategoryLink>) => {
    const updated = navLinks.map((link) => {
      if (link.id === id) {
        return { ...link, ...updates };
      }
      return link;
    });
    updateThemeConfig({ navCategoryLinks: updated });
  };

  const handleAddNewCategoryLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newId = `nav-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newLink: NavCategoryLink = {
      id: newId,
      name: newName.trim(),
      filter: newFilter.trim() ? newFilter.trim() : newName.trim(),
      badge: newBadge.trim() || undefined,
      enabled: true,
    };

    const updated = [...navLinks, newLink];
    updateThemeConfig({ navCategoryLinks: updated });

    // Reset form
    setNewName('');
    setNewFilter('');
    setNewBadge('');
    setSelectedExistingCategory('');
    setIsAddingNew(false);
  };

  const handleQuickAddFromCatalog = (catName: string) => {
    if (!catName) return;
    const newId = `nav-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newLink: NavCategoryLink = {
      id: newId,
      name: catName.split('&')[0].trim(), // Clean short display name
      filter: catName,
      enabled: true,
    };
    const updated = [...navLinks, newLink];
    updateThemeConfig({ navCategoryLinks: updated });
  };

  const handleSyncAllFromCatalog = () => {
    const defaultAll: NavCategoryLink = {
      id: 'nav-all',
      name: 'Novedades',
      filter: null,
      enabled: true,
    };

    const fromProducts: NavCategoryLink[] = catalogCategories.map((cat, idx) => ({
      id: `nav-cat-${idx}-${Date.now()}`,
      name: cat.split('&')[0].trim(),
      filter: cat,
      enabled: true,
    }));

    updateThemeConfig({
      navCategoryLinks: [defaultAll, ...fromProducts],
    });
  };

  const handleResetToDefaults = () => {
    if (window.confirm('¿Restablecer el menú del Navbar a las categorías originales?')) {
      updateThemeConfig({ navCategoryLinks: DEFAULT_NAV_LINKS });
    }
  };

  const activeCount = navLinks.filter((l) => l.enabled !== false).length;

  return (
    <div className="space-y-4 text-xs text-slate-700 animate-in fade-in">
      {/* Informative Header / Helper Banner */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-950 font-bold">
            <Menu className="w-4 h-4 text-indigo-600" />
            <span>Administrador del Navbar & Categorías del Menú</span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
            {activeCount} visibles de {navLinks.length}
          </span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Quita, agrega, renombra o reordena las categorías que tus clientes ven en la barra superior (Navbar) y en la versión móvil.
          Al hacer clic en cualquier categoría, la tienda navegará y mostrará de inmediato las prendas correspondientes.
        </p>
      </div>

      {/* Barra de Anuncios Superior */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono font-bold text-slate-800 uppercase flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Barra de Anuncios Superior:</span>
          </label>
          <button
            type="button"
            onClick={() => updateThemeConfig({ showAnnouncementBar: !themeConfig.showAnnouncementBar })}
            className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
              themeConfig.showAnnouncementBar
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {themeConfig.showAnnouncementBar ? 'ACTIVADA' : 'OCULTA'}
          </button>
        </div>
        {themeConfig.showAnnouncementBar && (
          <input
            type="text"
            value={themeConfig.announcementText || ''}
            onChange={(e) => updateThemeConfig({ announcementText: e.target.value })}
            placeholder="Texto del anuncio superior (ej: ENVÍO GRATIS POR COMPRAS SUPERIORES A $200.000 COP)"
            className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-medium focus:outline-hidden focus:border-indigo-600"
          />
        )}
      </div>

      {/* Quick Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingNew ? 'Cerrar Formulario' : 'Agregar Categoría al Navbar'}</span>
          </button>

          <button
            type="button"
            onClick={handleManualSaveDb}
            disabled={isSavingDb}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isSavingDb ? 'Guardando en BD...' : 'Guardar en Base de Datos'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {unlinkedCatalogCategories.length > 0 && (
            <button
              type="button"
              onClick={handleSyncAllFromCatalog}
              title="Importar todas las categorías que tienen prendas en tu inventario"
              className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer text-[11px]"
            >
              <RefreshCw className="w-3 h-3 text-emerald-600" />
              <span>Sincronizar Catálogo ({unlinkedCatalogCategories.length} pendientes)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResetToDefaults}
            title="Restablecer categorías originales de la tienda"
            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Form: Add New Category Link */}
      {isAddingNew && (
        <form
          onSubmit={handleAddNewCategoryLink}
          className="p-4 bg-white border-2 border-indigo-200 rounded-2xl shadow-md space-y-3 animate-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Nueva Categoría en la Barra de Navegación</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">Paso rápido</span>
          </div>

          {/* Quick Select from existing products */}
          {unlinkedCatalogCategories.length > 0 && (
            <div className="p-2.5 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                ⚡ Categorías con prendas creadas en tu inventario:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {unlinkedCatalogCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setNewName(cat.split('&')[0].trim());
                      setNewFilter(cat);
                    }}
                    className="px-2 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-700 font-mono text-[10px] rounded-lg transition-all cursor-pointer"
                  >
                    + {cat} ({getProductCountForFilter(cat)})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Nombre en el Navbar <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ej. Hoodies, Gorras, Buzos"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (!newFilter) setNewFilter(e.target.value);
                }}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-600 text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Conecta con {advanced ? '(filtro manual)' : '(automático)'}
              </label>
              <input
                type="text"
                placeholder="ej. Hoodies & Buzos"
                value={newFilter}
                readOnly={!advanced}
                title={advanced ? 'Filtro de categoría exacta o parcial' : 'Se llena solo con el nombre. Activa Avanzado para editarlo.'}
                onChange={(e) => setNewFilter(e.target.value)}
                className={`w-full px-3 py-2 border rounded-xl text-xs font-mono ${
                  advanced
                    ? 'bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-600'
                    : 'bg-slate-100 text-slate-500 cursor-not-allowed'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Badge Opcional (Etiqueta)
              </label>
              <select
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden text-xs font-medium cursor-pointer"
              >
                <option value="">Sin Etiqueta</option>
                <option value="HOT">🔥 HOT</option>
                <option value="NEW">⚡ NUEVO</option>
                <option value="DROP">💎 DROP</option>
                <option value="SALE">🏷️ SALE</option>
                <option value="450 GSM">🧵 450 GSM</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar en Navbar</span>
            </button>
          </div>
        </form>
      )}

      {/* Categories List in Navbar */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between px-1">
          <span>Categorías actuales en el Navbar ({navLinks.length})</span>
          <span className="text-[10px] text-slate-400">Usa las flechas para reordenar</span>
        </div>

        {navLinks.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
            <Menu className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-slate-600 font-medium">No hay categorías configuradas en el Navbar.</p>
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-xl text-xs"
            >
              Cargar Categorías por Defecto
            </button>
          </div>
        ) : (
          navLinks.map((item, index) => {
            const isEnabled = item.enabled !== false;
            const count = getProductCountForFilter(item.filter);
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all ${
                  isEnabled
                    ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200/60 opacity-60'
                }`}
              >
                {isEditing ? (
                  /* Inline Edit Form */
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nombre en Menú</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateLink(item.id, { name: e.target.value })}
                          className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-xs font-bold"
                        />
                      </div>
                      <div className={advanced ? '' : 'hidden'}>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Conecta con (filtro)</label>
                        <input
                          type="text"
                          value={item.filter === null ? '' : item.filter}
                          placeholder="Todos los productos"
                          onChange={(e) =>
                            handleUpdateLink(item.id, {
                              filter: e.target.value.trim() ? e.target.value : null,
                            })
                          }
                          className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Badge</label>
                        <input
                          type="text"
                          placeholder="ej. HOT, NUEVO"
                          value={item.badge || ''}
                          onChange={(e) => handleUpdateLink(item.id, { badge: e.target.value || undefined })}
                          className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-xs font-medium"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                      >
                        Listo
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Row */
                  <div className="flex items-center justify-between gap-2">
                    {/* Left: Move buttons & Status */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveUp(index)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          title="Mover arriba"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={index === navLinks.length - 1}
                          onClick={() => handleMoveDown(index)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          title="Mover abajo"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-xs truncate">{item.name}</span>
                          {item.badge && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                              {item.badge}
                            </span>
                          )}
                          {!isEnabled && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-600 shrink-0">
                              Oculto
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>Filtro: {item.filter === null ? 'Todo el Catálogo (Novedades)' : item.filter}</span>
                          <span>•</span>
                          <span className={count > 0 ? 'text-emerald-600 font-semibold' : 'text-amber-600'}>
                            {count} prendas
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Test link in storefront */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveView('home');
                          setActiveCategoryFilter(item.filter);
                        }}
                        title="Probar filtro en la tienda"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => setEditingId(item.id)}
                        className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Editar
                      </button>

                      {/* Toggle Visibility Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleEnabled(item.id)}
                        title={isEnabled ? 'Ocultar del Navbar' : 'Mostrar en Navbar'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isEnabled
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      {/* Delete / Remove category button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteLink(item.id, item.name)}
                        title="Quitar categoría del Navbar"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
