import React, { useState } from 'react';
import {
  Upload,
  Sliders,
  Crop,
  Maximize2,
  SlidersHorizontal,
  Video,
  Image as ImageIcon,
  Sparkles,
  Move,
  Play,
  Pause,
  AlertCircle,
  CheckCircle2,
  Zap,
  Trash2,
  Film,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { STRIKING_HERO_IMAGE, URBAN_FASHION_HERO_IMAGE } from '../../../data/heroAssets';
import { LIGHTWEIGHT_VIDEO_PRESETS } from '../../../lib/mediaOptimizer';

interface HeroCustomizerProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, targetField: 'logo' | 'footerLogo' | 'heroImage') => void;
  setIsCompressorOpen: (open: boolean) => void;
  /** Modo Avanzado: muestra los ajustes finos expandidos. En Simple van colapsados. */
  advanced?: boolean;
}

export const HeroCustomizer: React.FC<HeroCustomizerProps> = ({ onFileUpload, setIsCompressorOpen, advanced = false }) => {
  const { themeConfig, updateThemeConfig, openHeroImageEditor, showToast } = useStore();
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number | null>(null);
  const [uploadedVideoStats, setUploadedVideoStats] = useState<{ name: string; sizeMB: number } | null>(null);

  const HERO_IMAGE_PRESETS = [
    { title: 'Editorial 2026', url: STRIKING_HERO_IMAGE },
    { title: 'Urban Fashion 450 GSM', url: URBAN_FASHION_HERO_IMAGE },
    { title: 'Minimal Studio', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85' },
    { title: 'Streetwear Dark', url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=85' },
  ];

  // Direct video upload handler from local PC
  const handleLocalVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMB = file.size / (1024 * 1024);
    const fileName = file.name;
    const roundedSizeMB = parseFloat(sizeInMB.toFixed(2));

    setUploadedVideoStats({ name: fileName, sizeMB: roundedSizeMB });
    setIsVideoUploading(true);
    setVideoUploadProgress(15);

    const reader = new FileReader();
    reader.onloadstart = () => setVideoUploadProgress(25);
    reader.onprogress = (pe) => {
      if (pe.lengthComputable) {
        setVideoUploadProgress(Math.round((pe.loaded / pe.total) * 90));
      }
    };

    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      setVideoUploadProgress(100);

      setTimeout(() => {
        updateThemeConfig({
          heroMediaType: 'video',
          heroVideoUrl: dataUrl,
          heroVideoSizeMB: roundedSizeMB,
        });
        setIsVideoUploading(false);
        setVideoUploadProgress(null);
        showToast(
          sizeInMB <= 15
            ? `🎬 Video subido correctamente (${roundedSizeMB} MB)`
            : `⚠️ Video cargado (${roundedSizeMB} MB). Te recomendamos optimizarlo para conexiones móviles.`
        );
      }, 400);
    };

    reader.onerror = () => {
      setIsVideoUploading(false);
      setVideoUploadProgress(null);
      showToast('❌ Error al leer el archivo de video desde tu equipo.');
    };

    reader.readAsDataURL(file);
  };

  const isVideo = themeConfig.heroMediaType === 'video';
  const isCarousel = (themeConfig.heroDisplayMode || 'container') === 'carousel';
  const gallery = themeConfig.heroGalleryUrls || [];
  const [galleryInput, setGalleryInput] = useState('');

  const addGalleryUrl = (url: string) => {
    const clean = (url || '').trim();
    if (!clean || gallery.includes(clean)) return;
    updateThemeConfig({ heroGalleryUrls: [...gallery, clean] });
  };

  return (
    <div className="space-y-4 text-xs text-slate-700 animate-in fade-in">
      {/* Switch Hero Visible */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3">
        <div>
          <span className="font-bold text-slate-800 block text-xs">Mostrar Banner en la Tienda</span>
          <span className="text-[10px] text-slate-400">Activa o desactiva la sección de portada principal</span>
        </div>
        <input
          type="checkbox"
          checked={themeConfig.showHero}
          onChange={(e) => updateThemeConfig({ showHero: e.target.checked })}
          className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
        />
      </div>

      {/* Estilo / Disposición del Banner */}
      <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono font-bold text-slate-800 uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Estilo de Maquetación del Banner:</span>
          </label>
          <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
            {themeConfig.heroStyle === 'full-bleed'
              ? 'Solo Imagen de Fondo'
              : themeConfig.heroStyle === 'minimal-split'
              ? 'Tarjeta Dividida'
              : themeConfig.heroStyle === 'editorial-clean'
              ? 'Editorial Centrado'
              : 'Boutique Espacioso'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => updateThemeConfig({ heroStyle: 'full-bleed' })}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
              themeConfig.heroStyle === 'full-bleed'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="font-mono text-xs font-bold flex items-center gap-1">
              <span>🖼️ Fondo Completo</span>
            </span>
            <span className={`text-[10px] leading-tight ${themeConfig.heroStyle === 'full-bleed' ? 'text-indigo-100' : 'text-slate-400'}`}>
              Solo imagen o video de fondo a pantalla ancha con textos superpuestos.
            </span>
          </button>

          <button
            type="button"
            onClick={() => updateThemeConfig({ heroStyle: 'minimal-split' })}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
              themeConfig.heroStyle === 'minimal-split'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="font-mono text-xs font-bold flex items-center gap-1">
              <span>🔲 Tarjeta Dividida</span>
            </span>
            <span className={`text-[10px] leading-tight ${themeConfig.heroStyle === 'minimal-split' ? 'text-indigo-100' : 'text-slate-400'}`}>
              Tarjeta de mostrario interactivo a un lado y textos al otro.
            </span>
          </button>

          <button
            type="button"
            onClick={() => updateThemeConfig({ heroStyle: 'editorial-clean' })}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
              themeConfig.heroStyle === 'editorial-clean'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="font-mono text-xs font-bold flex items-center gap-1">
              <span>📰 Editorial Centrado</span>
            </span>
            <span className={`text-[10px] leading-tight ${themeConfig.heroStyle === 'editorial-clean' ? 'text-indigo-100' : 'text-slate-400'}`}>
              Elegancia editorial con marco fotográfico centralizado.
            </span>
          </button>

          <button
            type="button"
            onClick={() => updateThemeConfig({ heroStyle: 'centered-spacious' })}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
              themeConfig.heroStyle === 'centered-spacious'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="font-mono text-xs font-bold flex items-center gap-1">
              <span>🌸 Boutique Espacioso</span>
            </span>
            <span className={`text-[10px] leading-tight ${themeConfig.heroStyle === 'centered-spacious' ? 'text-indigo-100' : 'text-slate-400'}`}>
              Estilo moderno espacioso con tarjeta panorámica flotante.
            </span>
          </button>
        </div>
      </div>

      {/* Altura y Tamaño del Banner (Visible siempre) */}
      <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono font-bold text-slate-800 uppercase flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tamaño / Altura del Banner:</span>
          </label>
          <span className="font-mono text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
            {themeConfig.bannerDesktopHeight || themeConfig.heroBannerCustomHeightDesktop || 540} px
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 pt-0.5">
          {[
            { label: 'Compacto', val: 380 },
            { label: 'Estándar', val: 540 },
            { label: 'Amplio', val: 680 },
            { label: 'Pantalla', val: 820 },
          ].map((preset) => {
            const currentH = themeConfig.bannerDesktopHeight || themeConfig.heroBannerCustomHeightDesktop || 540;
            const isSelected = Math.abs(currentH - preset.val) <= 20;
            return (
              <button
                key={preset.val}
                type="button"
                onClick={() =>
                  updateThemeConfig({
                    bannerDesktopHeight: preset.val,
                    heroBannerCustomHeightDesktop: preset.val,
                    heroBannerHeightDesktop: 'custom',
                  })
                }
                className={`py-2 text-[10px] font-mono uppercase font-bold rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {preset.label} ({preset.val}p)
              </button>
            );
          })}
        </div>

        <div className="space-y-1 pt-1">
          <input
            type="range"
            min="280"
            max="880"
            step="10"
            value={themeConfig.bannerDesktopHeight || themeConfig.heroBannerCustomHeightDesktop || 540}
            onChange={(e) => {
              const val = Number(e.target.value);
              updateThemeConfig({
                bannerDesktopHeight: val,
                heroBannerCustomHeightDesktop: val,
                heroBannerHeightDesktop: 'custom',
              });
            }}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>280px (Mínimo)</span>
            <span>540px (Recomendado)</span>
            <span>880px (Máximo)</span>
          </div>
        </div>
      </div>

      {/* Contenedor vs Carrusel */}
      {!isVideo && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-bold text-slate-600 block uppercase">
            Modo: Contenedor o Carrusel:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateThemeConfig({ heroDisplayMode: 'container' })}
              className={`p-2.5 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
                !isCarousel
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              🖼️ Una foto fija
            </button>
            <button
              type="button"
              onClick={() => updateThemeConfig({ heroDisplayMode: 'carousel' })}
              className={`p-2.5 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
                isCarousel
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              🎞️ Carrusel (varias)
            </button>
          </div>
        </div>
      )}

      {/* Galería del carrusel */}
      {!isVideo && isCarousel && (
        <div className="space-y-2 border border-indigo-200 rounded-xl p-3 bg-indigo-50/50">
          <label className="text-[11px] font-mono font-bold text-slate-800 block uppercase">
            Fotos del carrusel ({gallery.length}):
          </label>
          {gallery.length === 0 && (
            <p className="text-[11px] text-slate-500">Agrega al menos 2 fotos para que rote.</p>
          )}
          <div className="space-y-1.5">
            {gallery.map((url, idx) => (
              <div key={url + idx} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1.5">
                <img src={url} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                <span className="font-mono font-black text-slate-400 text-[11px] w-5">{idx + 1}</span>
                <span className="flex-1 truncate text-[10px] text-slate-500 font-mono">{url}</span>
                <button
                  type="button"
                  onClick={() => updateThemeConfig({ heroGalleryUrls: gallery.filter((_, i) => i !== idx) })}
                  className="px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">
            <input
              type="url"
              value={galleryInput}
              onChange={(e) => setGalleryInput(e.target.value)}
              placeholder="Pegar URL de foto…"
              className="flex-1 px-3 py-2 border rounded-xl bg-white text-xs focus:outline-hidden focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => { addGalleryUrl(galleryInput); setGalleryInput(''); }}
              className="px-3 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 cursor-pointer"
            >
              Añadir
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => themeConfig.heroImageUrl && addGalleryUrl(themeConfig.heroImageUrl)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold hover:bg-slate-50 cursor-pointer"
            >
              + Usar portada actual
            </button>
            {HERO_IMAGE_PRESETS.map((p) => (
              <button
                key={p.url}
                type="button"
                onClick={() => addGalleryUrl(p.url)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] hover:bg-slate-50 cursor-pointer"
              >
                + {p.title}
              </button>
            ))}
          </div>
          <div>
            <label className="text-[11px] font-mono font-bold text-slate-700 block mb-1">Cada (segundos)</label>
            <input
              type="number"
              min={3}
              max={120}
              value={themeConfig.heroCarouselIntervalSec || 6}
              onChange={(e) => updateThemeConfig({ heroCarouselIntervalSec: Math.min(120, Math.max(3, Number(e.target.value) || 6)) })}
              className="w-28 px-3 py-2 border rounded-xl bg-white text-xs font-mono font-bold focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Tipo de Contenido: Imagen vs Video */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono font-bold text-slate-600 block uppercase">
          Formato del Banner:
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => updateThemeConfig({ heroMediaType: 'image' })}
            className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all cursor-pointer ${
              !isVideo
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Foto WebP / JPG</span>
          </button>
          <button
            type="button"
            onClick={() => updateThemeConfig({ heroMediaType: 'video' })}
            className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all cursor-pointer ${
              isVideo
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Video MP4 / WebM</span>
          </button>
        </div>
      </div>

      {/* Subir Imagen vs Subir Video */}
      {!isVideo ? (
        <div className="space-y-3 border border-slate-200 rounded-xl p-3 bg-slate-50">
          <label className="text-[11px] font-mono font-bold text-slate-800 block uppercase">
            1. Subir Imagen desde tu PC:
          </label>
          <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-mono font-bold text-xs uppercase rounded-xl hover:bg-indigo-700 transition-all cursor-pointer shadow-xs">
            <Upload className="w-4 h-4" />
            <span>Examinar Foto en mi Computador</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onFileUpload(e, 'heroImage')}
              className="hidden"
            />
          </label>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-500 block">
              O pegar URL directa de la imagen:
            </label>
            <input
              type="url"
              value={themeConfig.heroImageUrl}
              onChange={(e) => updateThemeConfig({ heroImageUrl: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white font-mono"
            />
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-400 block mb-1.5 uppercase">
              Fotos Rápidas de Alta Definición:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {HERO_IMAGE_PRESETS.map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => updateThemeConfig({ heroImageUrl: preset.url })}
                  className={`p-1.5 rounded-lg border text-left text-[11px] font-mono truncate transition-all cursor-pointer ${
                    themeConfig.heroImageUrl === preset.url
                      ? 'bg-indigo-50 border-indigo-500 font-bold text-indigo-900'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* SECCIÓN DE VIDEO: SUBIDA DIRECTA DESDE PC + DETECCIÓN DE PESO + PRESETS */
        <div className="space-y-3.5 border border-indigo-200 rounded-xl p-3.5 bg-indigo-50/40">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono font-black text-indigo-950 block uppercase tracking-tight flex items-center gap-1.5">
              <Film className="w-4 h-4 text-indigo-600" />
              <span>1. Subir Video desde mi PC / Computador</span>
            </label>
            <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              MP4 / WebM
            </span>
          </div>

          {/* Botón Principal para Subir Video desde el PC */}
          <div className="space-y-2">
            <label className="flex flex-col items-center justify-center gap-2 p-4 bg-white border-2 border-dashed border-indigo-300 hover:border-indigo-600 rounded-xl text-indigo-900 transition-all cursor-pointer shadow-xs hover:bg-indigo-50/50 group">
              <div className="w-10 h-10 rounded-full bg-indigo-100 group-hover:bg-indigo-600 group-hover:text-white text-indigo-600 flex items-center justify-center transition-all shadow-xs">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-center">
                <span className="font-mono font-bold text-xs block text-slate-900 group-hover:text-indigo-600">
                  Seleccionar Video desde mi PC
                </span>
                <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
                  Sube tu archivo .mp4 o .webm (Idealmente menos de 15MB para carga ultrarrápida)
                </span>
              </div>
              <input
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                onChange={handleLocalVideoUpload}
                disabled={isVideoUploading}
                className="hidden"
              />
            </label>

            {/* Barra de Progreso durante la Carga */}
            {isVideoUploading && videoUploadProgress !== null && (
              <div className="bg-white p-2.5 rounded-lg border border-indigo-200 space-y-1.5 animate-pulse">
                <div className="flex items-center justify-between text-[10px] font-mono text-indigo-900 font-bold">
                  <span>Procesando video...</span>
                  <span>{videoUploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                    style={{ width: `${videoUploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Ficha de Información de Peso del Video y Alerta de Rendimiento */}
            {themeConfig.heroVideoUrl && (
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-mono text-[11px] font-bold text-slate-800 truncate max-w-[170px]">
                      {uploadedVideoStats?.name || 'Video Activo en Tienda'}
                    </span>
                  </div>
                  {themeConfig.heroVideoSizeMB ? (
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        themeConfig.heroVideoSizeMB <= 12
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {themeConfig.heroVideoSizeMB} MB
                    </span>
                  ) : null}
                </div>

                {/* Recomendación si el video es pesado */}
                {themeConfig.heroVideoSizeMB && themeConfig.heroVideoSizeMB > 15 ? (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-900 leading-snug">
                        Este video pesa <strong>{themeConfig.heroVideoSizeMB} MB</strong>. En conexiones móviles se recomienda &lt; 10 MB.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCompressorOpen(true)}
                      className="px-2 py-1 bg-amber-600 text-white hover:bg-amber-700 font-mono text-[10px] font-bold rounded shrink-0 shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      Optimizar
                    </button>
                  </div>
                ) : null}

                {/* Acciones del Video */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCompressorOpen(true)}
                    className="text-[10px] font-mono text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Zap className="w-3 h-3" />
                    Abrir Optimizador / Compresor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateThemeConfig({
                        heroVideoUrl: '',
                        heroVideoSizeMB: undefined,
                      });
                      setUploadedVideoStats(null);
                    }}
                    className="text-[10px] font-mono text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Quitar Video
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Opción de URL externa o presets ligeros */}
          <div className="space-y-1.5 pt-1 border-t border-indigo-100">
            <label className="text-[10px] font-mono text-slate-500 block uppercase">
              O pegar enlace directo a video MP4 / WebM:
            </label>
            <input
              type="url"
              value={themeConfig.heroVideoUrl || ''}
              onChange={(e) => updateThemeConfig({ heroVideoUrl: e.target.value })}
              placeholder="https://.../video.mp4"
              className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white font-mono"
            />
            <div className="flex gap-1.5 pt-1 overflow-x-auto pb-1">
              {LIGHTWEIGHT_VIDEO_PRESETS.map((vid) => (
                <button
                  key={vid.videoUrl}
                  type="button"
                  onClick={() =>
                    updateThemeConfig({
                      heroVideoUrl: vid.videoUrl,
                    })
                  }
                  className={`text-[10px] font-mono px-2 py-1 rounded border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    themeConfig.heroVideoUrl === vid.videoUrl
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {vid.name} ({vid.sizeEstimate})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EDITOR VISUAL EN MODAL: siempre visible (abre el Posicionador) */}
      {!isVideo && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-3.5 text-white shadow-md flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Move className="w-4 h-4 text-indigo-200" />
              <span className="font-mono font-black text-xs uppercase tracking-tight">
                🎯 Posicionador de Imagen
              </span>
            </div>
            <p className="text-[11px] text-indigo-100 font-sans leading-snug">
              Toca la foto para situar el punto de enfoque (X/Y), ajusta zoom y guarda.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openHeroImageEditor()}
            className="px-3.5 py-2 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-sm hover:scale-105 active:scale-95"
          >
            Abrir Editor
          </button>
        </div>
      )}
      {!isVideo && (
        <div className="bg-slate-900 text-white rounded-xl px-3.5 py-2.5 flex items-center justify-between font-mono text-[11px]">
          <span className="text-slate-300">
            Guardado en tienda → X: <strong className="text-white">{themeConfig.heroImagePositionX ?? themeConfig.bannerImagePosX ?? 50}%</strong>
            {' '}• Y: <strong className="text-white">{themeConfig.heroImagePositionY ?? themeConfig.bannerImagePosY ?? 50}%</strong>
          </span>
          <span className="text-slate-400">Si Y no cambia al guardar, repórtalo con estos valores</span>
        </div>
      )}

      {/* Ajustes finos de tamaño y encuadre: colapsados para no saturar */}
      <details
        open={advanced}
        className="border border-indigo-200 rounded-xl bg-indigo-50/50"
      >
        <summary className="cursor-pointer p-3.5 font-mono font-bold text-xs uppercase text-indigo-950 flex items-center justify-between">
          <span>⚙️ Ajustes finos de tamaño y encuadre (opcional)</span>
          <span className="text-[10px] text-indigo-500 normal-case font-sans font-medium">
            {advanced ? 'abierto' : 'clic para abrir'}
          </span>
        </summary>
        <div className="px-3.5 pb-3.5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-indigo-950 font-bold font-mono text-xs uppercase">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>
              {isVideo
                ? 'Ajuste y Tamaño del Video (Ajuste Perfecto Sin Cortar Nada)'
                : 'Ajuste de Tamaño y Encuadre de la Foto (Para PC y Móvil)'}
            </span>
          </div>
        </div>
        <p className="text-[11px] text-indigo-900/80 leading-relaxed">
          {isVideo
            ? 'Configura el tamaño del video en pantalla y elige cómo se acomoda (completo sin recortar detalles o llenando todo el marco).'
            : 'Controla aquí la altura del banner en pantallas de computador y mueve la foto arriba, abajo o haz zoom para que se vea exactamente como quieres.'}
        </p>

        {/* 1. MODO DE AJUSTE (CONTAIN VS COVER) */}
        <div className="space-y-2 bg-white p-3 rounded-xl border border-indigo-100">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono font-bold text-slate-800 uppercase flex items-center gap-1.5">
              <Crop className="w-3.5 h-3.5 text-indigo-600" />
              <span>Modo de ajuste (cómo se ve en pantalla):</span>
            </label>
            <span className="text-[10px] font-mono text-indigo-600 font-bold">
              {isVideo
                ? (themeConfig.heroVideoFit || 'contain') === 'contain'
                  ? 'Sin Recortes (100% Visible)'
                  : 'Llenar Marco'
                : (themeConfig.bannerImageFit || themeConfig.heroImageFit || 'contain') === 'contain'
                ? 'Sin Recortes'
                : 'Llenar Marco'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                if (isVideo) {
                  updateThemeConfig({ heroVideoFit: 'contain' });
                } else {
                  updateThemeConfig({
                    bannerImageFit: 'contain',
                    heroImageFit: 'contain',
                  });
                }
              }}
              className={`py-2 px-2.5 text-[11px] font-mono rounded-xl border text-left flex flex-col gap-0.5 cursor-pointer transition-all ${
                (isVideo ? (themeConfig.heroVideoFit || 'contain') : (themeConfig.bannerImageFit || themeConfig.heroImageFit)) === 'contain'
                  ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>🎯 Ajuste Completo</span>
                <Crop className="w-3.5 h-3.5 shrink-0" />
              </div>
              <span className={`text-[9px] font-sans ${
                (isVideo ? (themeConfig.heroVideoFit || 'contain') : (themeConfig.bannerImageFit || themeConfig.heroImageFit)) === 'contain'
                  ? 'text-indigo-100'
                  : 'text-slate-400'
              }`}>
                0 Recortes (Muestra todo el video sin cortar nada)
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (isVideo) {
                  updateThemeConfig({ heroVideoFit: 'cover' });
                } else {
                  updateThemeConfig({
                    bannerImageFit: 'cover',
                    heroImageFit: 'cover',
                  });
                }
              }}
              className={`py-2 px-2.5 text-[11px] font-mono rounded-xl border text-left flex flex-col gap-0.5 cursor-pointer transition-all ${
                (isVideo ? (themeConfig.heroVideoFit || 'contain') : (themeConfig.bannerImageFit || themeConfig.heroImageFit || 'contain')) === 'cover'
                  ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>🖼️ Llenar Marco</span>
                <Maximize2 className="w-3.5 h-3.5 shrink-0" />
              </div>
              <span className={`text-[9px] font-sans ${
                (isVideo ? (themeConfig.heroVideoFit || 'contain') : (themeConfig.bannerImageFit || themeConfig.heroImageFit || 'contain')) === 'cover'
                  ? 'text-indigo-100'
                  : 'text-slate-400'
              }`}>
                Cubre el 100% del contenedor
              </span>
            </button>
          </div>
        </div>

        {/* 2. ALTURA EN PANTALLA (COMPUTADOR / ESCRITORIO) */}
        <div className="space-y-2 bg-white p-3 rounded-xl border border-indigo-100">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono font-bold text-slate-800 uppercase">
              Alto del banner:
            </label>
            <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {themeConfig.bannerDesktopHeight || themeConfig.heroBannerCustomHeightDesktop || 540} px
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1 pt-1">
            {[
              { label: 'Compacto', val: 380 },
              { label: 'Estándar', val: 500 },
              { label: 'Amplio', val: 640 },
              { label: 'Cine', val: 760 },
            ].map((preset) => (
              <button
                key={preset.val}
                type="button"
                onClick={() =>
                  updateThemeConfig({
                    bannerDesktopHeight: preset.val,
                    heroBannerCustomHeightDesktop: preset.val,
                    heroBannerHeightDesktop: 'custom',
                  })
                }
                className={`py-1.5 text-[10px] font-mono uppercase font-bold rounded-lg border transition-all cursor-pointer ${
                  (themeConfig.bannerDesktopHeight || themeConfig.heroBannerCustomHeightDesktop) === preset.val
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {preset.label} ({preset.val}p)
              </button>
            ))}
          </div>

          <input
            type="range"
            min="300"
            max="820"
            step="10"
            value={themeConfig.bannerDesktopHeight || themeConfig.heroBannerCustomHeightDesktop || 540}
            onChange={(e) => {
              const val = Number(e.target.value);
              updateThemeConfig({
                bannerDesktopHeight: val,
                heroBannerCustomHeightDesktop: val,
                heroBannerHeightDesktop: 'custom',
              });
            }}
            className="w-full accent-indigo-600 cursor-pointer pt-1"
          />
        </div>

        {/* 3. ENFOQUE / POSICIÓN VERTICAL (EJE Y) */}
        <div className="space-y-2 bg-white p-3 rounded-xl border border-indigo-100">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono font-bold text-slate-800 uppercase">
              {isVideo ? 'Enfoque del video (arriba / abajo):' : 'Mover foto arriba / abajo:'}
            </label>
            <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {isVideo
                ? themeConfig.heroVideoPositionY ?? 50
                : themeConfig.bannerImagePosY ?? themeConfig.heroImagePositionY ?? 50}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (isVideo) {
                  updateThemeConfig({ heroVideoPositionY: 0, heroVideoPosition: 'top' });
                } else {
                  updateThemeConfig({ bannerImagePosY: 0, heroImagePositionY: 0 });
                }
              }}
              className={`py-1.5 text-[10px] font-mono rounded-lg border transition-all cursor-pointer ${
                (isVideo ? (themeConfig.heroVideoPositionY ?? 50) : (themeConfig.bannerImagePosY ?? themeConfig.heroImagePositionY ?? 50)) === 0
                  ? 'bg-indigo-600 text-white font-bold border-indigo-600'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Arriba (Top 0%)
            </button>
            <button
              type="button"
              onClick={() => {
                if (isVideo) {
                  updateThemeConfig({ heroVideoPositionY: 50, heroVideoPosition: 'center' });
                } else {
                  updateThemeConfig({ bannerImagePosY: 50, heroImagePositionY: 50 });
                }
              }}
              className={`py-1.5 text-[10px] font-mono rounded-lg border transition-all cursor-pointer ${
                (isVideo ? (themeConfig.heroVideoPositionY ?? 50) : (themeConfig.bannerImagePosY ?? themeConfig.heroImagePositionY ?? 50)) === 50
                  ? 'bg-indigo-600 text-white font-bold border-indigo-600'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Centro (50%)
            </button>
            <button
              type="button"
              onClick={() => {
                if (isVideo) {
                  updateThemeConfig({ heroVideoPositionY: 100, heroVideoPosition: 'bottom' });
                } else {
                  updateThemeConfig({ bannerImagePosY: 100, heroImagePositionY: 100 });
                }
              }}
              className={`py-1.5 text-[10px] font-mono rounded-lg border transition-all cursor-pointer ${
                (isVideo ? (themeConfig.heroVideoPositionY ?? 50) : (themeConfig.bannerImagePosY ?? themeConfig.heroImagePositionY ?? 50)) === 100
                  ? 'bg-indigo-600 text-white font-bold border-indigo-600'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Abajo (Bottom 100%)
            </button>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={
              isVideo
                ? themeConfig.heroVideoPositionY ?? 50
                : themeConfig.bannerImagePosY ?? themeConfig.heroImagePositionY ?? 50
            }
            onChange={(e) => {
              const val = Number(e.target.value);
              if (isVideo) {
                updateThemeConfig({ heroVideoPositionY: val, heroVideoPosition: `${val}%` });
              } else {
                updateThemeConfig({ bannerImagePosY: val, heroImagePositionY: val });
              }
            }}
            className="w-full accent-indigo-600 cursor-pointer pt-1"
          />
        </div>

        {/* 4. ACERCAR / ALEJAR */}
        <div className="space-y-1.5 bg-white p-3 rounded-xl border border-indigo-100">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono font-bold text-slate-800 uppercase">
              Acercar / alejar ({isVideo ? 'video' : 'foto'}):
            </label>
            <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {isVideo
                ? themeConfig.heroVideoScale ?? 100
                : themeConfig.bannerImageZoom ?? themeConfig.heroImageZoom ?? 100}%
            </span>
          </div>
          <input
            type="range"
            min="80"
            max="150"
            step="5"
            value={
              isVideo
                ? themeConfig.heroVideoScale ?? 100
                : themeConfig.bannerImageZoom ?? themeConfig.heroImageZoom ?? 100
            }
            onChange={(e) => {
              const val = Number(e.target.value);
              if (isVideo) {
                updateThemeConfig({ heroVideoScale: val });
              } else {
                updateThemeConfig({ bannerImageZoom: val, heroImageZoom: val });
              }
            }}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Alejar (80%)</span>
            <span>Normal (100%)</span>
            <span>Acercar (150%)</span>
          </div>
        </div>

        {/* 5. OSCURIDAD DEL FILTRO SUPERIOR */}
        <div className="space-y-1.5 bg-white p-3 rounded-xl border border-indigo-100">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono font-bold text-slate-800 uppercase">
              Oscurecer fondo (para leer el texto):
            </label>
            <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {themeConfig.bannerOverlayOpacity ?? themeConfig.heroOverlayOpacity ?? 40}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            step="5"
            value={themeConfig.bannerOverlayOpacity ?? themeConfig.heroOverlayOpacity ?? 40}
            onChange={(e) => {
              const val = Number(e.target.value);
              updateThemeConfig({
                bannerOverlayOpacity: val,
                heroOverlayOpacity: val,
              });
            }}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>
        </div>
      </details>

      {/* ========================================================= */}
      {/* TEXTOS Y TÍTULOS DEL BANNER */}
      {/* ========================================================= */}
      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold text-xs uppercase text-slate-800">
            Textos y Títulos del Banner:
          </span>
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-700">
            <input
              type="checkbox"
              checked={themeConfig.showHeroTexts !== false}
              onChange={(e) => updateThemeConfig({ showHeroTexts: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
            Mostrar textos
          </label>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 pb-1 border-b border-slate-200">
          {(
            [
              ['showHeroTagline', 'Etiqueta'],
              ['showHeroHeadline', 'Titular'],
              ['showHeroSubheadline', 'Subtítulo'],
              ['showHeroButtons', 'Botones'],
              ['showHeroBadge', 'Sello'],
              ['showHeroTrust', 'Sellos info'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-slate-600">
              <input
                type="checkbox"
                checked={(themeConfig as any)[key] !== false}
                onChange={(e) => updateThemeConfig({ [key]: e.target.checked } as any)}
                className="w-3.5 h-3.5 accent-indigo-600 rounded cursor-pointer"
              />
              {label}
            </label>
          ))}
        </div>

        {/* Etiqueta Superior (lee la tienda como heroTagline) */}
        <div className="space-y-1">
          <label className="text-[11px] font-mono font-bold text-slate-700 block">
            Etiqueta Superior del Banner (Menú tipo "DROP EXCLUSIVO // COLOMBIA"):
          </label>
          <input
            type="text"
            value={themeConfig.heroTagline ?? themeConfig.heroEyebrow ?? ''}
            onChange={(e) => updateThemeConfig({ heroTagline: e.target.value, heroEyebrow: e.target.value })}
            placeholder="DROP EXCLUSIVO // COLOMBIA"
            className="w-full px-3 py-2 text-xs border rounded-lg bg-white font-mono font-bold"
          />
        </div>

        {/* Badge Secundario */}
        <div className="space-y-1">
          <label className="text-[11px] font-mono font-bold text-slate-700 block">
            Badge Secundario (ej: "CONFECCIÓN MEDELLÍN 450 GSM"):
          </label>
          <input
            type="text"
            value={themeConfig.heroSecondaryBadge || ''}
            onChange={(e) => updateThemeConfig({ heroSecondaryBadge: e.target.value })}
            placeholder="CONFECCIÓN MEDELLÍN 450 GSM"
            className="w-full px-3 py-2 text-xs border rounded-lg bg-white font-mono"
          />
        </div>

        {/* Titular Principal H1 */}
        <div className="space-y-1">
          <label className="text-[11px] font-mono font-bold text-slate-700 block">
            Titular Principal (H1):
          </label>
          <input
            type="text"
            value={themeConfig.heroHeadline}
            onChange={(e) => updateThemeConfig({ heroHeadline: e.target.value })}
            placeholder="SILUETA BOXY OVERSIZE"
            className="w-full px-3 py-2 text-xs border rounded-lg bg-white font-bold"
          />
        </div>

        {/* Subtítulo Descriptivo */}
        <div className="space-y-1">
          <label className="text-[11px] font-mono font-bold text-slate-700 block">
            Subtítulo Descriptivo:
          </label>
          <textarea
            rows={2}
            value={themeConfig.heroSubheadline}
            onChange={(e) => updateThemeConfig({ heroSubheadline: e.target.value })}
            placeholder="Algodón de alto gramaje con caída arquitectónica..."
            className="w-full px-3 py-2 text-xs border rounded-lg bg-white"
          />
        </div>

        {/* Botones CTA */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-mono text-slate-500 block mb-1">Texto Botón Primario</label>
            <input
              type="text"
              value={themeConfig.heroButtonText}
              onChange={(e) => updateThemeConfig({ heroButtonText: e.target.value })}
              placeholder="VER COLECCIÓN"
              className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-slate-500 block mb-1">Texto Botón Secundario</label>
            <input
              type="text"
              value={themeConfig.heroSecondaryButtonText || ''}
              onChange={(e) => updateThemeConfig({ heroSecondaryButtonText: e.target.value })}
              placeholder="LOOKBOOK COMUNIDAD"
              className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white font-mono"
            />
          </div>
        </div>

        {/* Sellos de Confianza del Banner */}
        <div className="border-t border-slate-200 pt-3 space-y-2">
          <label className="text-[11px] font-mono font-bold text-slate-700 block uppercase">
            3 Sellos Inferiores del Banner:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block font-bold">Sello 1</span>
              <input
                type="text"
                value={themeConfig.heroTrust1Title || ''}
                onChange={(e) => updateThemeConfig({ heroTrust1Title: e.target.value })}
                placeholder="Envíos 24-48h"
                className="w-full px-2 py-1 text-[11px] border rounded bg-slate-50 font-bold"
              />
              <input
                type="text"
                value={themeConfig.heroTrust1Desc || ''}
                onChange={(e) => updateThemeConfig({ heroTrust1Desc: e.target.value })}
                placeholder="A toda Colombia"
                className="w-full px-2 py-1 text-[10px] border rounded bg-slate-50 text-slate-500"
              />
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block font-bold">Sello 2</span>
              <input
                type="text"
                value={themeConfig.heroTrust2Title || ''}
                onChange={(e) => updateThemeConfig({ heroTrust2Title: e.target.value })}
                placeholder="450 GSM Heavy"
                className="w-full px-2 py-1 text-[11px] border rounded bg-slate-50 font-bold"
              />
              <input
                type="text"
                value={themeConfig.heroTrust2Desc || ''}
                onChange={(e) => updateThemeConfig({ heroTrust2Desc: e.target.value })}
                placeholder="Algodón peinado"
                className="w-full px-2 py-1 text-[10px] border rounded bg-slate-50 text-slate-500"
              />
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block font-bold">Sello 3</span>
              <input
                type="text"
                value={themeConfig.heroTrust3Title || ''}
                onChange={(e) => updateThemeConfig({ heroTrust3Title: e.target.value })}
                placeholder="Wompi Oficial"
                className="w-full px-2 py-1 text-[11px] border rounded bg-slate-50 font-bold"
              />
              <input
                type="text"
                value={themeConfig.heroTrust3Desc || ''}
                onChange={(e) => updateThemeConfig({ heroTrust3Desc: e.target.value })}
                placeholder="Bancolombia, PSE, Nequi"
                className="w-full px-2 py-1 text-[10px] border rounded bg-slate-50 text-slate-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
