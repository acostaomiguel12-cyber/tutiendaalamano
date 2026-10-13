import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Check,
  Eye,
  RotateCcw,
  Download,
  Upload,
  Layers,
  Sliders,
  Type,
  Layout,
  Smartphone,
  Tablet,
  Monitor,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  Globe,
  Star,
  Zap,
  Tag,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Plus,
  Video,
  Image as ImageIcon,
  Disc,
  FileUp,
  SlidersHorizontal,
  Crop,
  Maximize2,
  Trash2,
  Menu,
  Play,
  Film,
  BookOpen,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PRESET_THEMES } from '../../data/themes';
import { StoreThemeConfig, ThemePresetKey } from '../../types';
import { formatCOP } from '../../lib/wompi';
import { WordPressVisualBuilder } from './WordPressVisualBuilder';
import { MediaCompressorModal } from './MediaCompressorModal';
import { LIGHTWEIGHT_VIDEO_PRESETS } from '../../lib/mediaOptimizer';
import { STRIKING_HERO_IMAGE, URBAN_FASHION_HERO_IMAGE } from '../../data/heroAssets';
import { LogoCustomizer } from './customizer/LogoCustomizer';
import { NavbarCustomizer } from './customizer/NavbarCustomizer';
import { HeroCustomizer } from './customizer/HeroCustomizer';
import { TextsCustomizer } from './customizer/TextsCustomizer';
import { FooterCustomizer } from './customizer/FooterCustomizer';
import { StylingCustomizer } from './customizer/StylingCustomizer';
import { BlocksCustomizer } from './customizer/BlocksCustomizer';
import { SimulatorPreview } from './customizer/SimulatorPreview';

export const ThemeBuilder: React.FC = () => {
  const {
    themeConfig,
    setThemeConfig,
    updateThemeConfig,
    saveThemeToCloud,
    availableThemes,
    applyThemePreset,
    importThemeFromJson,
    exportThemeJson,
    resetThemeToDefault,
    setActiveView,
    setAdminTab,
    products,
    storePreferences,
    updateStorePreferences,
    openSystemVideoTutorial,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'customizer' | 'gallery' | 'builder' | 'import-export'>('customizer');
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [openSection, setOpenSection] = useState<string>('logo');
  const [importJsonText, setImportJsonText] = useState('');
  const [copiedExport, setCopiedExport] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isCompressorOpen, setIsCompressorOpen] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [showDesignVideoTutorials, setShowDesignVideoTutorials] = useState<boolean>(true);
  // Modo Simple (usuario final) vs Avanzado (técnico). Persiste por navegador.
  const [designMode, setDesignMode] = useState<'simple' | 'avanzado'>(() => {
    try {
      return localStorage.getItem('opus_design_mode') === 'avanzado' ? 'avanzado' : 'simple';
    } catch {
      return 'simple';
    }
  });
  const isAdvanced = designMode === 'avanzado';
  const switchDesignMode = (mode: 'simple' | 'avanzado') => {
    setDesignMode(mode);
    try {
      localStorage.setItem('opus_design_mode', mode);
    } catch {
      // ignore
    }
    if (mode === 'simple') {
      setActiveSubTab((prev) => (prev === 'builder' || prev === 'import-export' ? 'customizer' : prev));
    }
  };

  const handleSave = () => {
    updateThemeConfig({ ...themeConfig });
    saveThemeToCloud().catch(() => undefined);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetField: 'logo' | 'footerLogo' | 'heroImage') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (targetField === 'logo') {
        updateThemeConfig({ logoUrl: dataUrl });
        updateStorePreferences({ storeLogoUrl: dataUrl });
      } else if (targetField === 'footerLogo') {
        updateThemeConfig({ footerLogoUrl: dataUrl });
      } else if (targetField === 'heroImage') {
        updateThemeConfig({ heroImageUrl: dataUrl, heroMediaType: 'image' });
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick hero image options for 1-click selection
  const HERO_IMAGE_PRESETS = [
    {
      title: 'Editorial Llamativa 2026',
      url: STRIKING_HERO_IMAGE,
    },
    {
      title: 'Urban Fashion 450 GSM',
      url: URBAN_FASHION_HERO_IMAGE,
    },
    {
      title: 'Minimal Studio White',
      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
    },
    {
      title: 'Quiet Luxury Editorial',
      url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85',
    },
    {
      title: 'Streetwear Medellín Dark',
      url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=85',
    },
    {
      title: 'Modern Clean Lifestyle',
      url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85',
    },
    {
      title: 'Techwear Minimal Gray',
      url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1200&q=85',
    },
  ];

  const COLOR_PALETTES = [
    { name: 'Onyx Black', hex: '#18181b', bg: '#ffffff', accent: '#059669' },
    { name: 'Royal Indigo', hex: '#4338ca', bg: '#ffffff', accent: '#6366f1' },
    { name: 'Warm Bronze & Ivory', hex: '#292524', bg: '#faf8f5', accent: '#b45309' },
    { name: 'Pure Noir Dark', hex: '#f4f4f5', bg: '#09090b', accent: '#10b981' },
    { name: 'Electric Cobalt', hex: '#1d4ed8', bg: '#f8fafc', accent: '#2563eb' },
    { name: 'Rose & Sand', hex: '#881337', bg: '#fff7ed', accent: '#f43f5e' },
  ];

  const handleCopyJson = () => {
    navigator.clipboard.writeText(exportThemeJson());
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;
    const ok = importThemeFromJson(importJsonText);
    if (ok) {
      setImportJsonText('');
      setActiveSubTab('customizer');
    }
  };

  const toggleSection = (sec: string) => {
    setOpenSection((prev) => (prev === sec ? '' : sec));
  };

  const filteredThemes = availableThemes.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.author.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedTag && t.preset !== selectedTag) return false;
    return true;
  });

  return (
    <div className={`${activeSubTab === 'builder' ? 'p-1.5 sm:p-4 lg:p-6 space-y-3 sm:space-y-6' : 'p-4 sm:p-6 lg:p-8 space-y-6'} max-w-7xl mx-auto`}>
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
            <Palette className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight font-sans">
                DISEÑO & TEMAS
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                Responsive Studio
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Maquetador visual responsive estilo WordPress / Gutenberg para diseñar y personalizar tu tienda desde celular, tablet o escritorio con total fluidez.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200" title="Modo Simple oculta opciones técnicas">
            <button
              onClick={() => switchDesignMode('simple')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all cursor-pointer ${
                !isAdvanced ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => switchDesignMode('avanzado')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all cursor-pointer ${
                isAdvanced ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Avanzado
            </button>
          </div>
          <button
            onClick={() => openSystemVideoTutorial('design_tour')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black font-mono uppercase flex items-center gap-1.5 transition-all shadow-md shadow-purple-900/20 cursor-pointer ring-2 ring-purple-400/40 hover:scale-105 active:scale-95"
            title="Ver los 6 videos demostrativos interactivos del módulo de diseño"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Videos de Diseño (6)</span>
          </button>

          <button
            onClick={() => setActiveView('home')}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold font-mono uppercase flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Ver la tienda como un cliente real"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ver Tienda</span>
          </button>

          <button
            onClick={() => setAdminTab('music-player')}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-bold font-mono uppercase flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Cambiar la canción de fondo y ajustar el modo espía"
          >
            <Disc className="w-3.5 h-3.5 text-[#ccff00] animate-spin" style={{ animationDuration: '4s' }} />
            <span className="hidden sm:inline">Música Tienda</span>
            <span className="sm:hidden">Audio</span>
          </button>

          <button
            onClick={resetThemeToDefault}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold font-mono uppercase flex items-center gap-1.5 transition-all cursor-pointer"
            title="Volver al tema Minimalist Clean"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tema por Defecto</span>
            <span className="sm:hidden">Reset</span>
          </button>
        </div>
      </div>

      {/* Interactive Video Tutorials Suite (solo modo Avanzado; en Simple se oculta para no saturar) */}
      {isAdvanced && (
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/80 rounded-2xl border border-purple-500/30 p-4 sm:p-5 shadow-xl text-white space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Play className="w-4 h-4 fill-white translate-x-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-tight uppercase font-sans">
                  Academia en Video: Domina el Módulo de Diseño Completo
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  6 TUTORIALES HD
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Demostraciones interactivas grabadas en vivo para que aprendas a diseñar toda la tienda sin tocar código.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openSystemVideoTutorial('design_tour')}
              className="px-3 py-1.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950 translate-x-0.5" />
              <span>Ver Tour Completo (02:30)</span>
            </button>
            <button
              onClick={() => setShowDesignVideoTutorials(!showDesignVideoTutorials)}
              className="px-2 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-mono font-bold transition-colors cursor-pointer"
              title={showDesignVideoTutorials ? 'Ocultar catálogo de videos' : 'Mostrar catálogo de videos'}
            >
              {showDesignVideoTutorials ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {showDesignVideoTutorials && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1 animate-in fade-in duration-200">
            {[
              {
                id: 'design_tour',
                title: 'Tour Completo: Todo el Módulo',
                desc: 'Las 4 pestañas: Personalizador, Temas Preset, WordPress Visual y Copias JSON.',
                duration: '02:30 min',
                badge: 'MÁS IMPORTANTE',
                color: 'from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-200',
              },
              {
                id: 'design_styling',
                title: 'Logo, Paletas HEX & Fuentes',
                desc: 'Subir PNG transparente, paletas Onyx Black/Indigo y bordes de botones.',
                duration: '02:15 min',
                badge: 'IDENTIDAD',
                color: 'from-violet-500/20 to-indigo-500/20 border-violet-500/40 text-violet-200',
              },
              {
                id: 'design_builder',
                title: 'Constructor Visual WordPress',
                desc: 'Editor modular Gutenberg: sliders, banners con cronómetro y grillas de prendas.',
                duration: '02:40 min',
                badge: 'WORDPRESS',
                color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-200',
              },
              {
                id: 'design_sections',
                title: 'Secciones & Grillas Tienda',
                desc: 'Activar, pausar y reordenar módulos: Flash Deals, Colecciones y Reseñas.',
                duration: '01:50 min',
                badge: 'ESTRUCTURA',
                color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-200',
              },
              {
                id: 'video',
                title: 'Video Portada sin Cortes',
                desc: 'Cargar video MP4 de PC, compresión ligera y modo Ajuste Completo 100%.',
                duration: '02:10 min',
                badge: 'HERO VIDEO',
                color: 'from-rose-500/20 to-purple-500/20 border-rose-500/40 text-rose-200',
              },
              {
                id: 'design_presets',
                title: 'Temas Preset & Copias JSON',
                desc: 'Aplica estilos con 1 clic sin tocar productos y exporta respaldos seguros.',
                duration: '02:05 min',
                badge: 'BACKUP JSON',
                color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-200',
              },
            ].map((vid) => (
              <div
                key={vid.id}
                onClick={() => openSystemVideoTutorial(vid.id)}
                className={`p-3 rounded-xl bg-gradient-to-br ${vid.color} border hover:border-white/40 hover:bg-white/10 transition-all cursor-pointer group flex flex-col justify-between space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40 text-white">
                    {vid.badge}
                  </span>
                  <span className="text-[10px] font-mono text-slate-300">{vid.duration}</span>
                </div>
                <div>
                  <h3 className="text-xs font-black text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                    <Play className="w-3 h-3 fill-current shrink-0 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span>{vid.title}</span>
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {vid.desc}
                  </p>
                </div>
                <div className="pt-1 flex items-center justify-between text-[10px] text-purple-300 font-mono font-bold border-t border-white/5">
                  <span>Reproducir video</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Main Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setActiveSubTab('customizer')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs font-mono uppercase flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'customizer'
                ? 'bg-slate-900 text-white shadow-sm ring-2 ring-emerald-500 ring-offset-1'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="hidden md:inline">1. Personalizador Rápido (Logo, Banner, Textos, Colores)</span>
            <span className="md:hidden">1. Personalizador</span>
          </button>

          <button
            onClick={() => setActiveSubTab('gallery')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs font-mono uppercase flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'gallery'
                ? 'bg-slate-900 text-white shadow-sm ring-2 ring-indigo-500 ring-offset-1'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="hidden md:inline">2. Galería de Temas ({availableThemes.length})</span>
            <span className="md:hidden">2. Temas ({availableThemes.length})</span>
          </button>

          {isAdvanced && (
          <button
            onClick={() => setActiveSubTab('builder')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs font-mono uppercase flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'builder'
                ? 'bg-slate-900 text-white shadow-sm ring-2 ring-purple-500 ring-offset-1'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="hidden md:inline">3. Maquetador Avanzado por Bloques (WordPress)</span>
            <span className="md:hidden">3. Bloques</span>
          </button>
          )}

          {isAdvanced && (
          <button
            onClick={() => setActiveSubTab('import-export')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs font-mono uppercase flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'import-export'
                ? 'bg-slate-900 text-white shadow-sm ring-2 ring-amber-500 ring-offset-1'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Download className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden md:inline">4. Importar / Exportar JSON</span>
            <span className="md:hidden">4. JSON</span>
          </button>
          )}
        </div>

        {/* Current Active Theme Indicator */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono bg-indigo-50 text-indigo-900 border border-indigo-200 px-3 py-1.5 rounded-xl shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Tema: <strong>{themeConfig.name}</strong></span>
        </div>
      </div>

      {/* SUBTAB 3: WORDPRESS DRAG AND DROP BUILDER (solo Avanzado) */}
      {activeSubTab === 'builder' && isAdvanced && (
        <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs animate-in fade-in duration-150">
          <WordPressVisualBuilder />
        </div>
      )}

      {/* SUBTAB 1: GALLERY OF THEMES */}
      {activeSubTab === 'gallery' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar temas (minimalista, lujo, dark, editorial)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-sans"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                  selectedTag === null
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({availableThemes.length})
              </button>
              {(['minimal', 'luxury', 'streetwear', 'pastel', 'cyber'] as ThemePresetKey[]).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredThemes.map((theme) => {
              const isActive = themeConfig.id === theme.id || themeConfig.name === theme.name;

              return (
                <div
                  key={theme.id}
                  className={`bg-white rounded-2xl overflow-hidden border transition-all flex flex-col justify-between group ${
                    isActive
                      ? 'border-indigo-600 ring-2 ring-indigo-600/30 shadow-lg'
                      : 'border-slate-200 hover:border-slate-400 hover:shadow-md'
                  }`}
                >
                  {/* Theme Thumbnail / Visual Preview */}
                  <div className="relative aspect-16/10 bg-slate-100 overflow-hidden border-b border-slate-100">
                    <img
                      src={theme.heroImageUrl}
                      alt={theme.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay & Header Simulation */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-black/75 text-white backdrop-blur-xs border border-white/20">
                          {theme.preset} // v{theme.version}
                        </span>

                        {isActive && (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                            <Check className="w-3 h-3" /> ACTIVO
                          </span>
                        )}
                      </div>

                      <div className="text-white space-y-1">
                        <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-300 block">
                          {theme.heroTagline}
                        </span>
                        <h4 className="text-sm sm:text-base font-black uppercase tracking-tight line-clamp-1">
                          {theme.heroHeadline}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Theme Specs & Body */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-sm font-sans flex items-center gap-1.5">
                          <span>{theme.name}</span>
                        </h3>
                        <span className="text-[11px] text-slate-400 font-mono">Por {theme.author}</span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {theme.description}
                      </p>

                      {/* Palette Color Swatches */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                        <span className="text-[11px] font-mono text-slate-400 uppercase">Paleta:</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-xs"
                            style={{ backgroundColor: theme.primaryColor }}
                            title={`Primario: ${theme.primaryColor}`}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-xs"
                            style={{ backgroundColor: theme.backgroundColor }}
                            title={`Fondo: ${theme.backgroundColor}`}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-xs"
                            style={{ backgroundColor: theme.accentColor }}
                            title={`Acento: ${theme.accentColor}`}
                          />
                          <span className="text-[10px] font-mono text-slate-500 ml-1 uppercase">
                            {theme.mode}
                          </span>
                        </div>
                      </div>

                      {/* Key features pill list */}
                      <div className="flex items-center gap-1 flex-wrap pt-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">
                          {theme.fontFamily === 'serif' ? 'Serif Editorial' : theme.fontFamily === 'mono' ? 'Monospace Street' : 'Sans Minimal'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">
                          {theme.productsPerRow} col
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">
                          Bordes {theme.borderRadius}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      {isActive ? (
                        <button
                          onClick={() => setActiveSubTab('customizer')}
                          className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Personalizar Este Tema</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => applyThemePreset(theme.id)}
                          className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Activar e Instalar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cloud Theme Suggestion Callout */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-xs text-emerald-400 uppercase font-bold tracking-wider">
                  CONEXIÓN CON TEMAS DE LA RED
                </span>
              </div>
              <h3 className="text-base font-bold">¿Deseas consumir o importar un tema externo de internet?</h3>
              <p className="text-xs text-slate-400 max-w-xl">
                Puedes exportar tu tema actual, importar cualquier archivo JSON o pegar la configuración directa para cambiar al instante toda la estética de la tienda.
              </p>
            </div>
            <button
              onClick={() => setActiveSubTab('import-export')}
              className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-mono font-bold uppercase hover:bg-slate-100 transition-all cursor-pointer shrink-0"
            >
              Importar / Exportar JSON
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 2: VISUAL CUSTOMIZER (Modular & WordPress style) */}
      {activeSubTab === 'customizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-150">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="font-mono text-xs font-black uppercase text-slate-800 block">
                    PERSONALIZADOR RÁPIDO & DIRECTO
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Tema: <strong>{themeConfig.name}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-mono font-bold uppercase hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{savedToast ? '¡Guardado!' : 'Guardar'}</span>
                  </button>
                </div>
              </div>

              {savedToast && (
                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-mono flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Configuración guardada y lista en tu tienda.</span>
                </div>
              )}

              {/* Accordions */}
              <div className="divide-y divide-slate-100 pt-2 text-xs">
                {/* 1. Logo & Identidad */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSection('logo')}
                    className="w-full py-3 flex items-center justify-between font-bold text-slate-800 uppercase font-mono hover:text-indigo-600 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>1. Logo e Identidad de la Tienda</span>
                    </div>
                    {openSection === 'logo' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {openSection === 'logo' && (
                    <div className="pb-4 pt-1">
                      <LogoCustomizer onFileUpload={handleFileUpload} />
                    </div>
                  )}
                </div>

                {/* 2. Barra de Navegación (Navbar) & Categorías */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSection('navbar')}
                    className="w-full py-3 flex items-center justify-between font-bold text-slate-800 uppercase font-mono hover:text-indigo-600 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Menu className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>2. Barra Superior (Navbar) & Quitar/Editar Categorías</span>
                    </div>
                    {openSection === 'navbar' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {openSection === 'navbar' && (
                    <div className="pb-4 pt-1">
                      <NavbarCustomizer advanced={isAdvanced} />
                    </div>
                  )}
                </div>

                {/* 3. Banner Principal & Ajustes de Imagen */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSection('hero')}
                    className="w-full py-3 flex items-center justify-between font-bold text-slate-800 uppercase font-mono hover:text-indigo-600 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>3. Banner Principal & Imagen (No Recortar en PC)</span>
                    </div>
                    {openSection === 'hero' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {openSection === 'hero' && (
                    <div className="pb-4 pt-1">
                      <HeroCustomizer
                        onFileUpload={handleFileUpload}
                        setIsCompressorOpen={setIsCompressorOpen}
                        advanced={isAdvanced}
                      />
                    </div>
                  )}
                </div>

                {/* 4. Textos y Títulos de Todas las Secciones */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSection('texts')}
                    className="w-full py-3 flex items-center justify-between font-bold text-slate-800 uppercase font-mono hover:text-indigo-600 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>4. Textos y Títulos de Todos los Bloques</span>
                    </div>
                    {openSection === 'texts' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {openSection === 'texts' && (
                    <div className="pb-4 pt-1">
                      <TextsCustomizer />
                    </div>
                  )}
                </div>

                {/* 5. Pie de Página (Footer) */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSection('footer')}
                    className="w-full py-3 flex items-center justify-between font-bold text-slate-800 uppercase font-mono hover:text-indigo-600 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>5. Pie de Página (Footer) & Legal</span>
                    </div>
                    {openSection === 'footer' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {openSection === 'footer' && (
                    <div className="pb-4 pt-1">
                      <FooterCustomizer onFileUpload={handleFileUpload} />
                    </div>
                  )}
                </div>

                {/* 6. Colores, Tipografías y Bordes */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSection('styling')}
                    className="w-full py-3 flex items-center justify-between font-bold text-slate-800 uppercase font-mono hover:text-indigo-600 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>6. Colores, Tipografía y Estilo</span>
                    </div>
                    {openSection === 'styling' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {openSection === 'styling' && (
                    <div className="pb-4 pt-1">
                      <StylingCustomizer advanced={isAdvanced} />
                    </div>
                  )}
                </div>

                {/* 7. Bloques y Visibilidad */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSection('blocks')}
                    className="w-full py-3 flex items-center justify-between font-bold text-slate-800 uppercase font-mono hover:text-indigo-600 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>7. Secciones (Activar / Ocultar)</span>
                    </div>
                    {openSection === 'blocks' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {openSection === 'blocks' && (
                    <div className="pb-4 pt-1">
                      <BlocksCustomizer />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Live Simulator Viewport (7 cols) */}
          <div className="lg:col-span-7">
            <SimulatorPreview />
          </div>
        </div>
      )}

      {/* SUBTAB 4: IMPORT / EXPORT JSON (solo Avanzado) */}
      {activeSubTab === 'import-export' && isAdvanced && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Current Theme */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Exportar Configuración del Tema</h3>
                </div>
                <button
                  onClick={handleCopyJson}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold uppercase hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                  <span>{copiedExport ? '¡Copiado!' : 'Copiar JSON'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Esta es la definición técnica completa de tu tema actual. Puedes compartirla o guardarla como respaldo:
              </p>

              <textarea
                readOnly
                value={exportThemeJson()}
                rows={12}
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 resize-none focus:outline-none"
              />
            </div>

            {/* Import External Theme */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Importar Tema desde la Red / JSON</h3>
              </div>

              <p className="text-xs text-slate-500">
                Pega aquí cualquier archivo o preset de tema JSON descargado de la red para instalarlo instantáneamente:
              </p>

              <form onSubmit={handleImportSubmit} className="space-y-4">
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder='Pega aquí el código JSON del tema, por ejemplo:
{
  "id": "mi-tema-personalizado",
  "name": "Minimalist Loft Medellín",
  "preset": "minimal",
  "primaryColor": "#18181b",
  ...
}'
                  rows={9}
                  className="w-full p-3 font-mono text-xs border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      // Insert Minimalist sample
                      setImportJsonText(JSON.stringify(PRESET_THEMES[0], null, 2));
                    }}
                    className="text-xs text-indigo-600 hover:underline font-mono"
                  >
                    Cargar plantilla de ejemplo
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-xs font-bold uppercase rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Validar & Aplicar Tema
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Media Compressor Modal */}
      <MediaCompressorModal
        isOpen={isCompressorOpen}
        onClose={() => setIsCompressorOpen(false)}
        onApplyImage={(dataUrl, sizeKb) => {
          updateThemeConfig({
            heroImageUrl: dataUrl,
            heroMediaType: 'image',
          });
        }}
        onApplyVideo={(videoUrl, posterUrl) => {
          updateThemeConfig({
            heroMediaType: 'video',
            heroVideoUrl: videoUrl,
            heroVideoPoster: posterUrl,
          });
        }}
        targetBlockTitle="Hero Principal"
      />
    </div>
  );
};
