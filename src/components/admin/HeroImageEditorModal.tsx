import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Move,
  Maximize2,
  Sliders,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  Upload,
  Layers,
  Info,
  ZoomIn,
  Sun,
  ShieldCheck,
  Tag,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Crosshair,
  Plus,
  Minus,
  Sparkle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { compressImageFile } from '../../lib/mediaOptimizer';

const STREETWEAR_PRESETS = [
  {
    title: 'Drop Editorial Poblado',
    url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Heavy Cotton Studio 450 GSM',
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Minimalist Runway Black',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Archive Showroom Racks',
    url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1600&q=80',
  },
];

const QUICK_ALIGNMENTS = [
  { label: '↖ Arriba-Izq', x: 15, y: 15 },
  { label: '⬆ Arriba', x: 50, y: 15 },
  { label: '↗ Arriba-Der', x: 85, y: 15 },
  { label: '⬅ Izquierda', x: 15, y: 50 },
  { label: '🎯 Centro', x: 50, y: 50 },
  { label: '➡ Derecha', x: 85, y: 50 },
  { label: '↙ Abajo-Izq', x: 15, y: 85 },
  { label: '⬇ Abajo', x: 50, y: 85 },
  { label: '↘ Abajo-Der', x: 85, y: 85 },
];

export const HeroImageEditorModal: React.FC = () => {
  const {
    isHeroImageEditorOpen,
    closeHeroImageEditor,
    themeConfig,
    updateThemeConfig,
    saveThemeToCloud,
    showToast,
  } = useStore();

  // Local working state
  const [posX, setPosX] = useState<number>(50);
  const [posY, setPosY] = useState<number>(50);
  const [fit, setFit] = useState<'cover' | 'contain' | 'auto'>('cover');
  const [zoom, setZoom] = useState<number>(100);
  const [bannerHeight, setBannerHeight] = useState<number>(540);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(40);
  const [imageUrl, setImageUrl] = useState<string>(
    () => themeConfig.heroImageUrl || 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1600&q=80'
  );
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showSimulatedText, setShowSimulatedText] = useState<boolean>(true);
  const [isDraggingPin, setIsDraggingPin] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [hasSavedToast, setHasSavedToast] = useState<boolean>(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'canvas' | 'controls' | 'presets'>('canvas');

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with current theme configuration when modal opens
  useEffect(() => {
    if (isHeroImageEditorOpen) {
      setPosX(themeConfig.heroImagePositionX ?? themeConfig.bannerImagePosX ?? 50);
      setPosY(themeConfig.heroImagePositionY ?? themeConfig.bannerImagePosY ?? 50);
      setFit(themeConfig.heroImageFit ?? themeConfig.bannerImageFit ?? 'contain');
      setZoom(themeConfig.heroImageZoom ?? themeConfig.bannerImageZoom ?? 100);
      setBannerHeight(
        themeConfig.heroBannerCustomHeightDesktop ??
        themeConfig.bannerDesktopHeight ??
        (themeConfig.heroBannerHeightDesktop === 'compact' ? 400 : themeConfig.heroBannerHeightDesktop === 'large' ? 680 : 540)
      );
      setOverlayOpacity(themeConfig.heroOverlayOpacity ?? themeConfig.bannerOverlayOpacity ?? 40);
      setImageUrl(themeConfig.heroImageUrl || 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1600&q=80');
      setHasSavedToast(false);
    }
  }, [isHeroImageEditorOpen, themeConfig]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isHeroImageEditorOpen) {
        closeHeroImageEditor();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHeroImageEditorOpen, closeHeroImageEditor]);

  // Window-level safety cleanup for pointer release
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      setIsDraggingPin(false);
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('touchend', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('touchend', handleGlobalPointerUp);
    };
  }, []);

  if (!isHeroImageEditorOpen) {
    return null;
  }

  // Interactive coordinate picking on touch, pointer, or mouse
  const handleCanvasInteraction = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;

    const clampedX = Math.max(0, Math.min(rect.width, relativeX));
    const clampedY = Math.max(0, Math.min(rect.height, relativeY));

    const percentX = Math.round((clampedX / rect.width) * 100);
    const percentY = Math.round((clampedY / rect.height) * 100);

    setPosX(percentX);
    setPosY(percentY);
  };

  // Pointer Events (supports Mouse, Touch, Stylus seamlessly across Mobile & Desktop)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary button
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    setIsDraggingPin(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    handleCanvasInteraction(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingPin) {
      handleCanvasInteraction(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingPin(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
  };

  // Fine-tuning D-Pad adjustments
  const adjustPosition = (deltaX: number, deltaY: number) => {
    setPosX((prev) => Math.max(0, Math.min(100, prev + deltaX)));
    setPosY((prev) => Math.max(0, Math.min(100, prev + deltaY)));
  };

  // Image Upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await compressImageFile(file, {
        maxWidth: 1920,
        maxHeight: 1200,
        quality: 0.82,
        targetFormat: 'webp',
      });
      setImageUrl(result.dataUrl);
      showToast('📸 Foto cargada y optimizada para el banner.');
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
          showToast('📸 Imagen cargada correctamente.');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  // Save changes to theme configuration
  const handleSaveCoordinates = () => {
    updateThemeConfig({
      heroImageUrl: imageUrl,
      heroImagePositionX: posX,
      heroImagePositionY: posY,
      bannerImagePosX: posX,
      bannerImagePosY: posY,
      heroImageFit: fit,
      bannerImageFit: fit,
      heroImageZoom: zoom,
      bannerImageZoom: zoom,
      heroBannerHeightDesktop: 'custom',
      heroBannerCustomHeightDesktop: bannerHeight,
      bannerDesktopHeight: bannerHeight,
      heroOverlayOpacity: overlayOpacity,
      bannerOverlayOpacity: overlayOpacity,
    });

    setHasSavedToast(true);
    showToast('✨ Coordenadas y encuadre del HeroBanner guardados con éxito.');
    // Publica en la nube para que aplique en tienda y dispositivos.
    saveThemeToCloud().catch(() => undefined);
    setTimeout(() => {
      closeHeroImageEditor();
    }, 500);
  };

  // Reset to default
  const handleResetDefaults = () => {
    setPosX(50);
    setPosY(50);
    setFit('cover');
    setZoom(100);
    setBannerHeight(540);
    setOverlayOpacity(40);
    showToast('🔄 Valores restablecidos al centro (50%, 50%).');
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-6xl max-h-[96vh] sm:max-h-[92vh] rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/90 dark:bg-zinc-950/70 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Move className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase font-mono truncate max-w-[200px] sm:max-w-none">
                  Posicionador de Imagen
                </h2>
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  Táctil & PC
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 font-sans hidden sm:block">
                Toca o arrastra la foto para definir el punto focal exacto (evita cortes de rostros o prendas).
              </p>
            </div>
          </div>

          {/* Device switcher and Close button */}
          <div className="flex items-center gap-2">
            {/* Device Viewport Toggle (Visible on both Mobile and Desktop) */}
            <div className="flex items-center bg-slate-200/90 dark:bg-zinc-800 p-0.5 sm:p-1 rounded-xl gap-0.5">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  previewDevice === 'desktop'
                    ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
                title="Vista PC"
              >
                <Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">PC</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('tablet')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  previewDevice === 'tablet'
                    ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
                title="Vista Tablet"
              >
                <Tablet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Tab</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  previewDevice === 'mobile'
                    ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
                title="Vista Celular"
              >
                <Smartphone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Móvil</span>
              </button>
            </div>

            <button
              type="button"
              onClick={closeHeroImageEditor}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile View Selector Tabs (Canvas / Controles / Ajustes) */}
        <div className="flex lg:hidden border-b border-slate-200 dark:border-zinc-800 bg-slate-100/70 dark:bg-zinc-950 p-1 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveMobileTab('canvas')}
            className={`flex-1 py-1.5 text-center font-mono text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeMobileTab === 'canvas'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>1. Lienzo Táctil ({posX}%, {posY}%)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('controls')}
            className={`flex-1 py-1.5 text-center font-mono text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeMobileTab === 'controls'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>2. Ajustes / Sliders</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('presets')}
            className={`flex-1 py-1.5 text-center font-mono text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeMobileTab === 'presets'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>3. Fotos</span>
          </button>
        </div>

        {/* Modal Body: 2-Column Responsive Layout */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
          
          {/* LEFT: Visual Interactive Canvas (7 cols on desktop, tab-aware on mobile) */}
          <div
            className={`lg:col-span-7 flex flex-col gap-3 ${
              activeMobileTab === 'canvas' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-zinc-200 uppercase flex items-center gap-1.5">
                  <Crosshair className="w-4 h-4 text-indigo-600" />
                  <span>Lienzo Táctil Interactivo</span>
                </span>
                <span className="text-[10px] sm:text-[11px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  X: {posX}% • Y: {posY}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSimulatedText(!showSimulatedText)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                    showSimulatedText
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                      : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>{showSimulatedText ? 'Ocultar Letras' : 'Ver Letras'}</span>
                </button>
              </div>
            </div>

            {/* Instruction banner for mobile */}
            <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl p-2.5 flex items-center justify-between text-[11px] font-sans text-indigo-900 dark:text-indigo-200">
              <span className="flex items-center gap-1.5">
                <span className="text-base">👉</span>
                <strong>Toca cualquier parte de la foto</strong> para mover el punto focal en tiempo real.
              </span>
              <button
                type="button"
                onClick={() => {
                  setPosX(50);
                  setPosY(50);
                }}
                className="font-mono font-bold text-[10px] bg-indigo-600 text-white px-2 py-1 rounded-lg shrink-0 hover:bg-indigo-700 transition-all"
              >
                Centrar (50/50)
              </button>
            </div>

            {/* Interactive Frame Container */}
            <div className="flex-1 flex items-center justify-center bg-slate-950 rounded-2xl p-2.5 sm:p-4 overflow-hidden shadow-inner relative select-none min-h-[260px]">
              <div
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onClick={(e) => handleCanvasInteraction(e.clientX, e.clientY)}
                className={`relative overflow-hidden rounded-xl cursor-crosshair border-2 border-indigo-500/70 shadow-2xl transition-all touch-none select-none ${
                  previewDevice === 'desktop'
                    ? 'w-full aspect-[16/9] max-h-[400px]'
                    : previewDevice === 'tablet'
                    ? 'w-full max-w-[420px] aspect-[4/3] max-h-[380px]'
                    : 'w-full max-w-[260px] sm:max-w-[280px] aspect-[9/16] max-h-[420px]'
                }`}
                style={{
                  backgroundColor: '#050505',
                  touchAction: 'none',
                }}
              >
                {/* Image Element with custom object-position, fit and scale */}
                {imageUrl && imageUrl.trim() ? (
                  <img
                    src={imageUrl}
                    alt="Hero Banner Preview"
                    className="w-full h-full pointer-events-none transition-all duration-75 select-none"
                    style={{
                      objectFit: fit === 'auto' ? undefined : fit,
                      objectPosition: `${posX}% ${posY}%`,
                      transform: `scale(${zoom / 100})`,
                    }}
                    draggable={false}
                    referrerPolicy="no-referrer"
                  />
                ) : null}

                {/* Dark Overlay Preview */}
                <div
                  className="absolute inset-0 bg-black pointer-events-none transition-opacity select-none"
                  style={{ opacity: overlayOpacity / 100 }}
                />

                {/* Simulated Headline & Buttons Overlay */}
                {showSimulatedText && (
                  <div className="absolute inset-0 p-3 sm:p-5 flex flex-col justify-end text-white pointer-events-none bg-gradient-to-t from-black/85 via-black/35 to-transparent select-none">
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 mb-0.5">
                      {themeConfig.heroTagline ?? 'DROP EXCLUSIVO // COLOMBIA'}
                    </span>
                    <h3 className="text-base sm:text-xl font-black uppercase tracking-tight leading-tight mb-1.5 drop-shadow-md">
                      {themeConfig.heroHeadline ?? 'NUEVA COLECCIÓN STREETWEAR'}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-zinc-300 line-clamp-2 max-w-sm mb-2 font-light">
                      {themeConfig.heroSubheadline ?? 'Prendas confeccionadas en tela pesada de 450 GSM.'}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded-md bg-white text-black font-mono text-[10px] font-bold uppercase shadow-sm">
                        {themeConfig.heroButtonText ?? 'Comprar Ahora'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Crosshair Target Pin with Touch-Friendly Hitbox */}
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 transition-all duration-75 select-none"
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                >
                  <div className="relative flex items-center justify-center">
                    {/* Concentric pulsing rings */}
                    <span className="w-9 h-9 rounded-full border-2 border-white bg-indigo-600/70 shadow-2xl animate-pulse absolute" />
                    <span className="w-3.5 h-3.5 rounded-full bg-white shadow-md z-10" />
                    <div className="w-12 h-0.5 bg-white/90 absolute" />
                    <div className="h-12 w-0.5 bg-white/90 absolute" />

                    {/* Coordinate chip */}
                    <div className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/95 text-white font-mono text-[9px] font-black px-2 py-0.5 rounded-md shadow-2xl border border-white/30 tracking-tight">
                      X:{posX}% Y:{posY}%
                    </div>
                  </div>
                </div>

                {/* Grid Overlay Guide (Subtle Rule of Thirds) */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-white/10 select-none">
                  <div className="border-r border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-b border-white/10" />
                  <div className="border-r border-white/10" />
                  <div className="border-r border-white/10" />
                  <div />
                </div>
              </div>
            </div>

            {/* Precision D-Pad Buttons for Mobile & Quick Alignments */}
            <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-slate-200 dark:border-zinc-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Ajuste Fino Milimétrico (Botones Táctiles)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Paso ±5%</span>
              </div>

              {/* D-Pad Buttons */}
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustPosition(-5, 0)}
                  className="p-2.5 sm:p-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all font-mono font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                  title="Mover a la Izquierda"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-[10px] font-mono">Izq</span>
                </button>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => adjustPosition(0, -5)}
                    className="p-2.5 sm:p-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all font-mono font-bold text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                    title="Mover Arriba"
                  >
                    <ArrowUp className="w-4 h-4" />
                    <span className="text-[10px] font-mono">Arriba</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustPosition(0, 5)}
                    className="p-2.5 sm:p-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all font-mono font-bold text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                    title="Mover Abajo"
                  >
                    <ArrowDown className="w-4 h-4" />
                    <span className="text-[10px] font-mono">Abajo</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => adjustPosition(5, 0)}
                  className="p-2.5 sm:p-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all font-mono font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                  title="Mover a la Derecha"
                >
                  <span className="text-[10px] font-mono">Der</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Generated CSS Code Badge */}
            <div className="bg-slate-100 dark:bg-zinc-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-700 dark:text-zinc-300 overflow-x-auto">
              <span className="text-slate-400 uppercase font-bold shrink-0">CSS:</span>
              <code className="text-indigo-600 dark:text-indigo-400 font-bold truncate ml-2">
                object-position: {posX}% {posY}%;
              </code>
            </div>
          </div>

          {/* RIGHT: Numeric Sliders, Alignments & Height Controls (5 cols on desktop, tab-aware on mobile) */}
          <div
            className={`lg:col-span-5 space-y-4 text-slate-800 dark:text-zinc-200 ${
              activeMobileTab === 'controls' ? 'block' : activeMobileTab === 'presets' ? 'hidden lg:block' : 'hidden lg:block'
            }`}
          >
            {/* 1. Alignment Grid Presets */}
            <div className="bg-slate-50 dark:bg-zinc-800/40 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1. Alineación Rápida (9 Puntos)</span>
                </span>
                <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  ({posX}%, {posY}%)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {QUICK_ALIGNMENTS.map((align) => {
                  const isActive = Math.abs(posX - align.x) <= 8 && Math.abs(posY - align.y) <= 8;
                  return (
                    <button
                      key={align.label}
                      type="button"
                      onClick={() => {
                        setPosX(align.x);
                        setPosY(align.y);
                      }}
                      className={`py-2 px-1.5 rounded-lg border font-mono text-[10px] sm:text-[11px] transition-all cursor-pointer truncate text-center font-bold ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-[1.02]'
                          : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      {align.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Position Sliders X and Y */}
            <div className="bg-slate-50 dark:bg-zinc-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-zinc-300 block">
                2. Coordenadas Milimétricas (Eje X y Y)
              </span>

              {/* Slider X */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600 dark:text-zinc-400 font-bold">Horizontal (Eje X):</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => adjustPosition(-5, 0)}
                      className="w-6 h-6 rounded bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold font-mono hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={posX}
                      onChange={(e) => setPosX(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                      className="w-12 px-1.5 py-0.5 border rounded text-center font-mono text-xs bg-white dark:bg-zinc-800 font-bold text-indigo-600 dark:text-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={() => adjustPosition(5, 0)}
                      className="w-6 h-6 rounded bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold font-mono hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                    >
                      +
                    </button>
                    <span className="text-slate-400 text-xs">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={posX}
                  onChange={(e) => setPosX(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>0% (Izquierda)</span>
                  <span>50% (Centro)</span>
                  <span>100% (Derecha)</span>
                </div>
              </div>

              {/* Slider Y */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-zinc-700/60">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600 dark:text-zinc-400 font-bold">Vertical (Eje Y):</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => adjustPosition(0, -5)}
                      className="w-6 h-6 rounded bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold font-mono hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={posY}
                      onChange={(e) => setPosY(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                      className="w-12 px-1.5 py-0.5 border rounded text-center font-mono text-xs bg-white dark:bg-zinc-800 font-bold text-indigo-600 dark:text-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={() => adjustPosition(0, 5)}
                      className="w-6 h-6 rounded bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold font-mono hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                    >
                      +
                    </button>
                    <span className="text-slate-400 text-xs">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={posY}
                  onChange={(e) => setPosY(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>0% (Arriba/Rostro)</span>
                  <span>50% (Centro)</span>
                  <span>100% (Abajo)</span>
                </div>
              </div>
            </div>

            {/* 3. Banner Height in PC & Fit Mode */}
            <div className="bg-slate-50 dark:bg-zinc-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-zinc-300 block">
                3. Altura del Banner & Modo de Ajuste
              </span>

              {/* Desktop Height Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600 dark:text-zinc-400">Altura del Banner (PC):</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{bannerHeight} px</span>
                </div>
                <input
                  type="range"
                  min={360}
                  max={840}
                  step={10}
                  value={bannerHeight}
                  onChange={(e) => setBannerHeight(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                {/* Quick Height presets */}
                <div className="grid grid-cols-4 gap-1 pt-1 font-mono text-[10px]">
                  {[
                    { label: '390px', h: 390 },
                    { label: '540px', h: 540 },
                    { label: '680px', h: 680 },
                    { label: '780px', h: 780 },
                  ].map((p) => (
                    <button
                      key={p.h}
                      type="button"
                      onClick={() => setBannerHeight(p.h)}
                      className={`py-1.5 border rounded-lg text-center truncate transition-all cursor-pointer font-bold ${
                        bannerHeight === p.h
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit Mode Switcher */}
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-700 space-y-1.5">
                <label className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 block">
                  Modo de Ajuste (Object-Fit):
                </label>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setFit('cover')}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      fit === 'cover'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 font-bold text-indigo-900 dark:text-indigo-200 shadow-xs'
                        : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    <span>Cover (Llena el Marco)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFit('contain')}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      fit === 'contain'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 font-bold text-indigo-900 dark:text-indigo-200 shadow-xs'
                        : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    <span>Contain (Foto Completa)</span>
                  </button>
                </div>
              </div>

              {/* Zoom Scale & Overlay Opacity */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-zinc-700">
                {/* Zoom */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-600 dark:text-zinc-400">Zoom:</span>
                    <span className="font-bold text-indigo-600">{zoom}%</span>
                  </div>
                  <input
                    type="range"
                    min={80}
                    max={180}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom(100)}
                    className="text-[10px] font-mono text-slate-400 hover:text-indigo-600 underline"
                  >
                    Restablecer 100%
                  </button>
                </div>

                {/* Dark Overlay */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-600 dark:text-zinc-400">Capa Oscura:</span>
                    <span className="font-bold text-indigo-600">{overlayOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={90}
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-[10px] font-mono text-slate-400 block">
                    Contraste textos
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* PRESETS & IMAGE UPLOAD (Shown in 3rd tab on mobile or right column) */}
          <div
            className={`lg:col-span-12 ${
              activeMobileTab === 'presets' ? 'block' : 'hidden'
            }`}
          >
            <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>Subir Foto o Cambiar Portada</span>
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-mono font-bold hover:bg-indigo-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Optimizando...' : 'Examinar Foto'}</span>
                </button>
              </div>

              {/* Quick Streetwear Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {STREETWEAR_PRESETS.map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => {
                      setImageUrl(preset.url);
                      showToast(`📸 Foto seleccionada: ${preset.title}`);
                    }}
                    className={`p-2.5 border rounded-xl text-left text-xs font-mono flex items-center gap-2.5 transition-all cursor-pointer ${
                      imageUrl === preset.url
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 font-bold text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.title}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <span className="truncate">{preset.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions - Always Sticky at Bottom */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/95 dark:bg-zinc-950/90 flex flex-row items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 text-[11px] sm:text-xs font-mono text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restablecer</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeHeroImageEditor}
              className="px-3.5 sm:px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-xl text-[11px] sm:text-xs font-mono font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSaveCoordinates}
              className="px-4 sm:px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{hasSavedToast ? '¡Guardado!' : 'Guardar Coordenadas'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
