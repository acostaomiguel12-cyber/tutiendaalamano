import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ArrowUpRight,
  ShieldCheck,
  Truck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Maximize2,
  X,
  Scan,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CarouselMedia } from './CarouselMedia';
import { getOptimizedImageUrl } from '../../lib/mediaOptimizer';
import { handleStoreButtonLink } from '../../lib/storeNavigation';
import { STRIKING_HERO_IMAGE } from '../../data/heroAssets';

export const HeroBanner: React.FC = () => {
  const {
    setActiveCategoryFilter,
    setActiveView,
    openOrderTracking,
    showToast,
    themeConfig,
  } = useStore();
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [videoFitMode, setVideoFitMode] = useState<'contain' | 'cover'>(() => {
    return themeConfig.heroVideoFit || 'contain';
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  // Altura compacta en móvil para que la imagen se vea completa y grande.
  const [isNarrowHero, setIsNarrowHero] = useState<boolean>(
    () => typeof window !== 'undefined' && window.innerWidth < 640
  );
  useEffect(() => {
    const onResize = () => setIsNarrowHero(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (themeConfig.heroVideoFit) {
      setVideoFitMode(themeConfig.heroVideoFit);
    }
  }, [themeConfig.heroVideoFit]);

  const mediaMode = themeConfig.heroMediaType === 'video' ? 'video' : 'image';

  if (!themeConfig.showHero) {
    return null;
  }

  const handleExploreDrop = () => {
    // Navegación centralizada: funciona en los 4 estilos del hero y
    // aunque el tema cambie o el catálogo esté filtrado.
    handleStoreButtonLink('#catalog', {
      setActiveView,
      setActiveCategoryFilter,
      openOrderTracking,
      showToast,
    });
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const isDark = themeConfig.mode === 'dark';
  const isWarm = themeConfig.mode === 'warm';

  // Striking Hero Image Source (Priority: Configured image on active theme or fallback)
  const heroImageSrc =
    (themeConfig.heroImageUrl && themeConfig.heroImageUrl.trim()) || STRIKING_HERO_IMAGE;

  // Versión optimizada para mostrar (misma URL = misma caché en todos los slots).
  const heroDisplaySrc = getOptimizedImageUrl(heroImageSrc, 1400, 70);

  // Precarga la portada para que no parpadee la imagen anterior/defecto.
  useEffect(() => {
    const img = new Image();
    img.decoding = 'async';
    (img as any).fetchPriority = 'high';
    img.src = heroDisplaySrc;
  }, [heroDisplaySrc]);

  // Aparición suave al cargar (evita el salto visual feo).
  const fadeInOnLoad = {
    onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => {
      e.currentTarget.style.opacity = '1';
    },
  } as const;
  const fadeStyle = { opacity: 0, transition: 'opacity 500ms ease' } as const;

  // Banner Dynamic Height
  const effectiveBannerHeight = useMemo(() => {
    if (themeConfig.bannerDesktopHeight) return themeConfig.bannerDesktopHeight;
    if (themeConfig.heroBannerCustomHeightDesktop) return themeConfig.heroBannerCustomHeightDesktop;
    if (themeConfig.heroBannerHeightDesktop === 'compact') return 380;
    if (themeConfig.heroBannerHeightDesktop === 'large') return 680;
    if (themeConfig.heroBannerHeightDesktop === 'full') return 820;
    return 540;
  }, [
    themeConfig.bannerDesktopHeight,
    themeConfig.heroBannerCustomHeightDesktop,
    themeConfig.heroBannerHeightDesktop,
  ]);

  // Ultra-lightweight compressed video stream
  const defaultCompressedVideoUrl =
    'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-black-jacket-41121-large.mp4';
  const activeVideoUrl =
    (themeConfig.heroVideoUrl && themeConfig.heroVideoUrl.trim()) || defaultCompressedVideoUrl;
  const optimizedPosterUrl = themeConfig.heroVideoPoster
    ? getOptimizedImageUrl(themeConfig.heroVideoPoster, 1400, 70)
    : heroImageSrc;

  // 1. MINIMALIST SPLIT HERO (High-impact streetwear visual with striking card on side)
  if (themeConfig.heroStyle === 'minimal-split') {
    return (
      <section
        className={`relative border-b transition-colors overflow-hidden ${
          isDark
            ? 'bg-zinc-950 text-white border-zinc-800'
            : isWarm
            ? 'bg-[#1c1917] text-white border-stone-800'
            : 'bg-zinc-950 text-white border-zinc-900'
        }`}
      >
        {/* Background Atmospheric Visual */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {mediaMode === 'video' ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={optimizedPosterUrl}
              className="w-full h-full object-cover object-center lg:object-right opacity-25 sm:opacity-35 lg:opacity-40 filter contrast-125 brightness-90 transform scale-105"
            >
              <source src={activeVideoUrl} type="video/mp4" />
            </video>
          ) : (
            <img
              src={heroDisplaySrc}
              alt="Hero Visual Texture"
              className="w-full h-full object-cover opacity-25 sm:opacity-35 lg:opacity-40 filter contrast-125 brightness-90 transform scale-105"
              style={{
                objectPosition: `${themeConfig.heroImagePositionX ?? themeConfig.bannerImagePosX ?? 50}% ${themeConfig.heroImagePositionY ?? themeConfig.bannerImagePosY ?? 50}%`,
              }}
            />
          )}
          {/* Multi-layer gradient overlays ensuring pristine text contrast and cinematic depth */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/85 to-zinc-950/60"
            style={{ opacity: ((themeConfig.heroOverlayOpacity ?? themeConfig.bannerOverlayOpacity ?? 40) + 40) / 100 }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 lg:via-zinc-950/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-14 items-center">
            
            {/* Visual Hero Card */}
            <div className="lg:col-span-5 w-full order-1 lg:order-2">
              <div
                className={`relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/20 group ring-1 ring-white/10 flex items-center justify-center transition-all duration-300 ${
                  mediaMode === 'image' &&
                  themeConfig.heroDisplayMode === 'carousel' &&
                  themeConfig.heroGalleryUrls &&
                  themeConfig.heroGalleryUrls.length > 0
                    ? 'aspect-[4/3]'
                    : ''
                }`}
                style={
                  mediaMode === 'image' &&
                  themeConfig.heroDisplayMode === 'carousel' &&
                  themeConfig.heroGalleryUrls &&
                  themeConfig.heroGalleryUrls.length > 0
                    ? { maxHeight: '850px' }
                    : {
                        height: isNarrowHero ? '300px' : `${effectiveBannerHeight}px`,
                        minHeight: isNarrowHero ? '300px' : '280px',
                        maxHeight: '850px',
                      }
                }
              >
                {mediaMode === 'image' ? (
                  <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
                    {themeConfig.heroDisplayMode === 'carousel' &&
                    themeConfig.heroGalleryUrls &&
                    themeConfig.heroGalleryUrls.length > 0 ? (
                      <CarouselMedia
                        images={themeConfig.heroGalleryUrls}
                        alt="Streetwear Mostrario y Lookbook Editorial"
                        fit={themeConfig.heroImageFit || themeConfig.bannerImageFit || 'contain'}
                        position={`${themeConfig.heroImagePositionX ?? themeConfig.bannerImagePosX ?? 50}% ${themeConfig.heroImagePositionY ?? themeConfig.bannerImagePosY ?? 50}%`}
                        zoom={themeConfig.heroImageZoom ?? themeConfig.bannerImageZoom ?? 100}
                        intervalSec={themeConfig.heroCarouselIntervalSec || 6}
                        onOpenZoom={() => setIsZoomOpen(true)}
                      />
                    ) : (
                    <>
                    {(themeConfig.heroImageFit || themeConfig.bannerImageFit || 'contain') === 'contain' && (
                      <img
                        src={heroDisplaySrc}
                        alt=""
                        aria-hidden
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-40 pointer-events-none"
                      />
                    )}
                    <img
                      src={heroDisplaySrc}
                      alt="Streetwear Mostrario y Lookbook Editorial"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      {...fadeInOnLoad}
                      className="relative z-10 w-full h-full transition-all duration-500 ease-out cursor-pointer"
                      style={{
                        objectFit: (themeConfig.heroImageFit || themeConfig.bannerImageFit || 'contain') as any,
                        objectPosition: `${themeConfig.heroImagePositionX ?? themeConfig.bannerImagePosX ?? 50}% ${themeConfig.heroImagePositionY ?? themeConfig.bannerImagePosY ?? 50}%`,
                        transform: `scale(${((themeConfig.heroImageZoom ?? themeConfig.bannerImageZoom ?? 100) / 100)})`,
                        ...fadeStyle,
                      }}
                      onClick={() => setIsZoomOpen(true)}
                    />
                    </>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 blur-2xl scale-125">
                      <video
                        src={activeVideoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <video
                      ref={videoRef}
                      autoPlay
                      muted={isMuted}
                      loop
                      playsInline
                      preload="metadata"
                      poster={optimizedPosterUrl}
                      className={`relative z-10 max-h-full max-w-full w-auto h-auto ${
                        videoFitMode === 'contain' ? 'object-contain' : 'w-full h-full object-cover'
                      } transition-all duration-300 shadow-2xl`}
                      style={{
                        objectPosition:
                          themeConfig.heroVideoPosition ||
                          (themeConfig.heroVideoPositionX !== undefined && themeConfig.heroVideoPositionY !== undefined
                            ? `${themeConfig.heroVideoPositionX}% ${themeConfig.heroVideoPositionY}%`
                            : 'center'),
                        transform:
                          themeConfig.heroVideoScale && themeConfig.heroVideoScale !== 100
                            ? `scale(${(themeConfig.heroVideoScale ?? 100) / 100})`
                            : undefined,
                      }}
                    >
                      <source src={activeVideoUrl} type="video/mp4" />
                    </video>
                  </div>
                )}

                {/* Discrete Customer Media Controls */}
                <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                  {mediaMode === 'image' ? (
                    <button
                      type="button"
                      onClick={() => setIsZoomOpen(true)}
                      className="p-2 rounded-xl bg-black/50 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md border border-white/15 transition-all cursor-pointer shadow-lg"
                      title="Ampliar Imagen"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 bg-black/75 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-lg">
                      <button
                        type="button"
                        onClick={() => setVideoFitMode((prev) => (prev === 'contain' ? 'cover' : 'contain'))}
                        className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          videoFitMode === 'contain'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-white/80 hover:text-white hover:bg-white/20'
                        }`}
                        title={
                          videoFitMode === 'contain'
                            ? 'Ajuste Completo'
                            : 'Modo Llenar'
                        }
                      >
                        <Scan className="w-3 h-3" />
                        <span>{videoFitMode === 'contain' ? '100% Completo' : 'Llenar'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={togglePlay}
                        className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                        title={isPlaying ? 'Pausar' : 'Reproducir'}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                        title={isMuted ? 'Activar sonido' : 'Silenciar'}
                      >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsZoomOpen(true)}
                        className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                        title="Pantalla Completa"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 order-2 lg:order-1">
              {themeConfig.showHeroTexts !== false && (
              <>
              {themeConfig.showHeroTagline !== false && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full border border-white/15">
                  <span
                    className="w-2.5 h-2.5 rounded-full animate-pulse"
                    style={{ backgroundColor: themeConfig.primaryColor }}
                  ></span>
                  <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase text-zinc-300">
                    {themeConfig.heroTagline ?? 'DROP EXCLUSIVO // COLOMBIA'}
                  </span>
                </div>

                {themeConfig.showHeroBadge !== false && themeConfig.heroSecondaryBadge && (
                  <span className="bg-zinc-900/90 text-emerald-400 text-[10px] sm:text-xs font-mono font-bold px-3 py-1 uppercase tracking-wider border border-zinc-700/80 flex items-center gap-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {themeConfig.heroSecondaryBadge}
                  </span>
                )}
              </div>
              )}

              {themeConfig.showHeroHeadline !== false && (
              <h1
                className={`text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.04] text-white ${
                  themeConfig.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
                }`}
              >
                {themeConfig.heroHeadline ?? 'STREETWEAR ARCHIVE & CULTURA URBANA'}
              </h1>
              )}

              {themeConfig.showHeroSubheadline !== false && (
              <p className="text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl text-zinc-300">
                {themeConfig.heroSubheadline ??
                  'Siluetas pesadas, corte boxy oversized y densidad textil de 450 GSM. Confección de alta precisión en Medellín con despacho prioritario a toda Colombia.'}
              </p>
              )}
              </>
              )}
              {themeConfig.showHeroTexts !== false && themeConfig.showHeroButtons !== false && (

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-1">
                <button
                  onClick={handleExploreDrop}
                  className="px-7 py-3.5 sm:px-8 sm:py-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
                  style={{
                    backgroundColor: themeConfig.primaryColor,
                    color: ['#ccff00', '#fcee0a', '#ffffff'].includes(themeConfig.primaryColor.toLowerCase())
                      ? '#08080a'
                      : '#ffffff',
                  }}
                >
                  <span>{themeConfig.heroButtonText ?? 'VER COLECCIÓN COMPLETA'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleExploreDrop}
                  className="px-6 py-3.5 sm:py-4 rounded-xl text-xs font-bold tracking-wider uppercase border border-white/20 bg-white/5 hover:bg-white/15 text-white backdrop-blur-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{themeConfig.heroSecondaryButtonText || 'Ver Colección'}</span>
                </button>
              </div>
              )}

              {/* Trust Indicators */}
              {themeConfig.showHeroTexts !== false && themeConfig.showHeroTrust !== false && (
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-5 sm:pt-6 border-t border-white/15 text-xs">
                <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                  <span className="font-bold block text-[11px] sm:text-xs text-white">
                    {themeConfig.heroTrust1Title || 'Envíos Colombia'}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-zinc-400">
                    {themeConfig.heroTrust1Desc || '24-48 horas con guía'}
                  </span>
                </div>
                <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                  <span className="font-bold block text-[11px] sm:text-xs text-white">
                    {themeConfig.heroTrust2Title || 'Pago Seguro'}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-zinc-400">
                    {themeConfig.heroTrust2Desc || 'Wompi • PSE • Nequi'}
                  </span>
                </div>
                <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                  <span className="font-bold block text-[11px] sm:text-xs text-white">
                    {themeConfig.heroTrust3Title || 'Algodón 450 GSM'}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-zinc-400">
                    {themeConfig.heroTrust3Desc || 'Confección Medellín'}
                  </span>
                </div>
              </div>
              )}
            </div>

          </div>
        </div>

        {/* Lightbox Modal */}
        {isZoomOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
            onClick={() => setIsZoomOpen(false)}
          >
            <div
              className="relative max-w-5xl max-h-[90vh] bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    FOTOGRAFÍA EDITORIAL // LOOKBOOK STREETWEAR
                  </span>
                </div>
                <button
                  onClick={() => setIsZoomOpen(false)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-2 sm:p-4 overflow-auto flex items-center justify-center bg-black min-h-[300px]">
                {mediaMode === 'video' ? (
                  <video
                    src={activeVideoUrl}
                    autoPlay
                    controls
                    playsInline
                    className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
                  />
                ) : (
                  <img
                    src={heroDisplaySrc}
                    alt="Streetwear Lookbook Fotografía Editorial"
                    referrerPolicy="no-referrer"
                    className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl"
                  />
                )}
              </div>

              <div className="p-3 sm:p-4 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white">
                <div className="text-zinc-400 font-mono text-[11px] text-center sm:text-left">
                  {mediaMode === 'video'
                    ? 'Video Oficial // Alta fidelidad • Confección Medellín 450 GSM'
                    : 'Telas pesadas de 450 GSM • Silueta boxy oversized • Fotografía oficial.'}
                </div>
                <button
                  onClick={() => {
                    setIsZoomOpen(false);
                    handleExploreDrop();
                  }}
                  className="px-5 py-2 bg-white text-black font-mono font-bold uppercase rounded-lg text-xs cursor-pointer hover:bg-zinc-200 transition-all flex items-center gap-1.5 shadow-md"
                >
                  <span>Explorar Catálogo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  // 2. EDITORIAL CLEAN (Centered luxury look with refined proportions)
  if (themeConfig.heroStyle === 'editorial-clean') {
    return (
      <section
        className={`py-12 sm:py-20 px-4 sm:px-6 border-b text-center transition-colors ${
          isDark
            ? 'bg-zinc-950 text-white border-zinc-800'
            : isWarm
            ? 'bg-[#faf8f5] text-stone-900 border-stone-200'
            : 'bg-white text-zinc-900 border-zinc-200'
        }`}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {themeConfig.showHeroTexts !== false && (
          <>
          {themeConfig.showHeroTagline !== false && (
          <span className="text-xs font-mono font-bold tracking-[0.25em] text-zinc-500 uppercase block">
            {themeConfig.heroTagline ?? 'EDICIÓN NUMERADA // MEDELLÍN'}
          </span>
          )}
          {themeConfig.showHeroHeadline !== false && (
          <h1
            className={`text-4xl sm:text-6xl font-light tracking-tight uppercase leading-[1.1] ${
              themeConfig.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
            }`}
          >
            {themeConfig.heroHeadline ?? 'SILUETAS ATEMPORALES & LUJO CALLEJERO'}
          </h1>
          )}
          {themeConfig.showHeroSubheadline !== false && (
          <p className="text-base sm:text-lg text-zinc-500 max-w-2xl mx-auto font-light leading-relaxed">
            {themeConfig.heroSubheadline ??
              'Piezas artesanales confeccionadas en tirajes limitados para amantes del corte boxy y la densidad textil.'}
          </p>
          )}
          </>
          )}

          {/* Centerpiece Frame with Dynamic Height */}
          <div className="pt-2 max-w-3xl mx-auto">
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 group bg-black flex items-center justify-center transition-all duration-300"
              style={{
                height: `${effectiveBannerHeight}px`,
                maxHeight: '850px',
              }}
            >
              {mediaMode === 'image' ? (
                <>
                {(themeConfig.heroImageFit || themeConfig.bannerImageFit || 'contain') === 'contain' && (
                  <img
                    src={heroDisplaySrc}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-40 pointer-events-none"
                  />
                )}
                <img
                  src={heroDisplaySrc}
                  alt="Editorial Lookbook Mostrario"
                  loading="eager"
                  fetchPriority="high"
                  referrerPolicy="no-referrer"
                  {...fadeInOnLoad}
                  className="relative z-10 w-full h-full transition-transform duration-700 cursor-pointer"
                  style={{
                    objectFit: (themeConfig.heroImageFit || themeConfig.bannerImageFit || 'contain') as any,
                    objectPosition: `${themeConfig.heroImagePositionX ?? themeConfig.bannerImagePosX ?? 50}% ${themeConfig.heroImagePositionY ?? themeConfig.bannerImagePosY ?? 50}%`,
                    transform: `scale(${((themeConfig.heroImageZoom ?? themeConfig.bannerImageZoom ?? 100) / 100)})`,
                    ...fadeStyle,
                  }}
                  onClick={() => setIsZoomOpen(true)}
                />
                </>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  muted={isMuted}
                  loop
                  playsInline
                  preload="metadata"
                  poster={optimizedPosterUrl}
                  className={`w-full h-full ${
                    videoFitMode === 'contain' ? 'object-contain' : 'object-cover'
                  } object-center`}
                >
                  <source src={activeVideoUrl} type="video/mp4" />
                </video>
              )}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3">
            {themeConfig.showHeroTexts !== false && themeConfig.showHeroButtons !== false && (
            <button
              onClick={handleExploreDrop}
              className="px-8 py-3.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all shadow-md cursor-pointer hover:opacity-90 flex items-center gap-2"
              style={{
                backgroundColor: themeConfig.primaryColor,
                color: ['#ffffff', '#fafafa', '#f4f4f5'].includes(themeConfig.backgroundColor?.toLowerCase() || '') && ['#ccff00', '#fcee0a', '#ffffff'].includes(themeConfig.primaryColor.toLowerCase())
                  ? '#09090b'
                  : '#ffffff',
              }}
            >
              <span>{themeConfig.heroButtonText ?? 'DESCUBRIR COLECCIÓN'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  // 3. CENTERED SPACIOUS (Boutique contemporary aesthetic with floating card)
  if (themeConfig.heroStyle === 'centered-spacious') {
    return (
      <section
        className={`py-12 sm:py-16 px-4 sm:px-6 border-b text-center transition-colors ${
          isDark
            ? 'bg-zinc-950 text-white border-zinc-800'
            : isWarm
            ? 'bg-[#fff7ed] text-stone-900 border-amber-200'
            : 'bg-zinc-50 text-slate-900 border-zinc-200'
        }`}
      >
        <div className="max-w-5xl mx-auto space-y-6">
          {themeConfig.showHeroTexts !== false && (
          <>
          {themeConfig.showHeroTagline !== false && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 font-mono text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{themeConfig.heroTagline ?? 'DAILY ESSENTIALS'}</span>
          </div>
          )}

          {themeConfig.showHeroHeadline !== false && (
          <h1
            className={`text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-tight ${
              themeConfig.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
            }`}
          >
            {themeConfig.heroHeadline ?? 'CONFORT URBANO & TONOS SUAVES'}
          </h1>
          )}

          {themeConfig.showHeroSubheadline !== false && (
          <p className="text-sm sm:text-base lg:text-lg max-w-2xl mx-auto text-stone-600 dark:text-zinc-400 font-normal leading-relaxed">
            {themeConfig.heroSubheadline ??
              'Prendas con textura ultrasuave pensadas para uso diario con cortes relajados y alta comodidad.'}
          </p>
          )}
          </>
          )}

          {/* Floating showcase frame with Dynamic Height */}
          <div
            className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-zinc-800 bg-black flex items-center justify-center transition-all duration-300"
            style={{
              height: `${effectiveBannerHeight}px`,
              maxHeight: '850px',
            }}
          >
            {mediaMode === 'image' ? (
              <img
                src={heroDisplaySrc}
                alt="Boutique Showcase"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 cursor-pointer"
                style={{
                  objectPosition: `${themeConfig.heroImagePositionX ?? themeConfig.bannerImagePosX ?? 50}% ${themeConfig.heroImagePositionY ?? themeConfig.bannerImagePosY ?? 50}%`,
                  transform: `scale(${((themeConfig.heroImageZoom ?? themeConfig.bannerImageZoom ?? 100) / 100)})`,
                }}
                onClick={() => setIsZoomOpen(true)}
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                preload="metadata"
                poster={optimizedPosterUrl}
                className="w-full h-full object-cover"
              >
                <source src={activeVideoUrl} type="video/mp4" />
              </video>
            )}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {themeConfig.showHeroTexts !== false && themeConfig.showHeroButtons !== false && (
            <button
              onClick={handleExploreDrop}
              className="px-8 py-3.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all shadow-md cursor-pointer hover:opacity-90 flex items-center gap-2"
              style={{
                backgroundColor: themeConfig.primaryColor,
                color: '#ffffff',
              }}
            >
              <span>{themeConfig.heroButtonText ?? 'VER BÁSICOS'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  // 4. FULL-BLEED (Cinematic Background Banner - Solo imagen de fondo completo o video)
  return (
    <section className="relative bg-black text-white overflow-hidden">
      <div
        className="relative flex items-end transition-all duration-300"
        style={{
          minHeight: `${effectiveBannerHeight}px`,
          height: `${effectiveBannerHeight}px`,
        }}
      >
        <div className="absolute inset-0 z-0 bg-black flex items-center justify-center overflow-hidden">
          {mediaMode === 'image' ? (
          themeConfig.heroDisplayMode === 'carousel' &&
          themeConfig.heroGalleryUrls &&
          themeConfig.heroGalleryUrls.length > 0 ? (
            <CarouselMedia
              images={themeConfig.heroGalleryUrls}
              alt="Streetwear Lookbook"
              fit={themeConfig.heroImageFit || themeConfig.bannerImageFit || 'contain'}
              position={`${themeConfig.heroImagePositionX ?? themeConfig.bannerImagePosX ?? 50}% ${themeConfig.heroImagePositionY ?? themeConfig.bannerImagePosY ?? 50}%`}
              zoom={themeConfig.heroImageZoom ?? themeConfig.bannerImageZoom ?? 100}
              intervalSec={themeConfig.heroCarouselIntervalSec || 6}
            />
          ) : (
          <>
            {(themeConfig.heroImageFit || themeConfig.bannerImageFit || 'contain') === 'contain' && (
              <img
                src={heroDisplaySrc}
                alt=""
                aria-hidden
                loading="lazy"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-40 pointer-events-none"
              />
            )}
            <img
              src={heroDisplaySrc}
              alt="Streetwear Lookbook"
              loading="eager"
              fetchPriority="high"
              referrerPolicy="no-referrer"
              {...fadeInOnLoad}
              className="relative z-10 w-full h-full filter contrast-105 transition-all duration-500"
              style={{
                objectFit: (themeConfig.heroImageFit || themeConfig.bannerImageFit || 'contain') as any,
                objectPosition: `${themeConfig.heroImagePositionX ?? themeConfig.bannerImagePosX ?? 50}% ${themeConfig.heroImagePositionY ?? themeConfig.bannerImagePosY ?? 50}%`,
                transform: `scale(${((themeConfig.heroImageZoom ?? themeConfig.bannerImageZoom ?? 100) / 100)})`,
                ...fadeStyle,
              }}
            />
          </>
          )) : (
            <>
              {/* Atmospheric ambient glow */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 blur-3xl scale-125">
                <video
                  src={activeVideoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Full Video Stream */}
              <video
                ref={videoRef}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                preload="metadata"
                poster={optimizedPosterUrl}
                className={`relative z-10 w-full h-full ${
                  videoFitMode === 'contain' ? 'object-contain' : 'object-cover'
                } object-center filter contrast-105 transition-all duration-300`}
                style={{
                  objectPosition:
                    themeConfig.heroVideoPosition ||
                    (themeConfig.heroVideoPositionX !== undefined && themeConfig.heroVideoPositionY !== undefined
                      ? `${themeConfig.heroVideoPositionX}% ${themeConfig.heroVideoPositionY}%`
                      : 'center'),
                  transform:
                    themeConfig.heroVideoScale && themeConfig.heroVideoScale !== 100
                      ? `scale(${(themeConfig.heroVideoScale ?? 100) / 100})`
                      : undefined,
                }}
              >
                <source src={activeVideoUrl} type="video/mp4" />
              </video>
            </>
          )}

          {/* Dark Overlay with custom opacity */}
          <div
            className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300"
            style={{ opacity: (themeConfig.heroOverlayOpacity ?? themeConfig.bannerOverlayOpacity ?? 40) / 100 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/30 to-transparent pointer-events-none" />

          {/* Media Playback Controls Top-Right */}
          {mediaMode === 'video' && (
            <div className="absolute top-6 right-6 z-20 flex items-center gap-1.5 bg-black/75 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-xl">
              <button
                type="button"
                onClick={() => setVideoFitMode((prev) => (prev === 'contain' ? 'cover' : 'contain'))}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  videoFitMode === 'contain'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/20'
                }`}
                title={
                  videoFitMode === 'contain'
                    ? 'Ajuste Completo'
                    : 'Modo Llenar'
                }
              >
                <Scan className="w-3.5 h-3.5" />
                <span>{videoFitMode === 'contain' ? '100% Completo' : 'Llenar'}</span>
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="p-2 rounded-xl text-white hover:bg-white/20 transition-colors cursor-pointer"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-xl text-white hover:bg-white/20 transition-colors cursor-pointer"
                title={isMuted ? 'Activar audio' : 'Silenciar'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-14 pt-24 w-full">
          <div className="max-w-3xl space-y-6">
          {themeConfig.showHeroTexts !== false && (
          <>
          {(themeConfig.showHeroTagline !== false || themeConfig.showHeroBadge !== false) && (
            <div className="flex items-center gap-2.5 flex-wrap">
              {themeConfig.showHeroTagline !== false && (
              <span className="bg-white text-black text-[10px] sm:text-xs font-black px-3 py-1 uppercase tracking-widest font-mono">
                {themeConfig.heroTagline ?? 'DROP EXCLUSIVO // COLOMBIA'}
              </span>
              )}
              {themeConfig.showHeroBadge !== false && (
              <span className="bg-zinc-900/90 text-emerald-400 text-[10px] sm:text-xs font-mono font-bold px-3 py-1 uppercase tracking-wider border border-zinc-700/80 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {themeConfig.heroSecondaryBadge ||
                  (mediaMode === 'video' ? 'VIDEO EN VIVO // DROP 2026' : 'FOTOGRAFÍA EDITORIAL 2026 // 450 GSM')}
              </span>
              )}
            </div>
          )}

            <div className="space-y-2">
              {themeConfig.showHeroHeadline !== false && (
              <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-[0.95]">
                {themeConfig.heroHeadline ?? 'STREETWEAR ARCHIVE & CULTURA URBANA'}
              </h1>
              )}
              {themeConfig.showHeroSubheadline !== false && (
              <p className="text-sm sm:text-base text-zinc-300 max-w-xl font-normal leading-relaxed pt-2">
                {themeConfig.heroSubheadline ??
                  'Siluetas pesadas, corte boxy oversized y densidad textil de 450 GSM. Confección de alta precisión en Medellín con despacho prioritario a toda Colombia.'}
              </p>
              )}
            </div>
            </>
            )}

            {themeConfig.showHeroTexts !== false && themeConfig.showHeroButtons !== false && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
              <button
                onClick={handleExploreDrop}
                className="bg-white hover:bg-zinc-200 text-black px-8 py-4 text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-2xl"
              >
                <span>{themeConfig.heroButtonText ?? 'VER COLECCIÓN COMPLETA'}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              {themeConfig.heroSecondaryButtonText && (
                <button
                  onClick={handleExploreDrop}
                  className="px-8 py-4 rounded-none text-xs font-bold tracking-wider uppercase border border-white/30 bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{themeConfig.heroSecondaryButtonText}</span>
                </button>
              )}
            </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
