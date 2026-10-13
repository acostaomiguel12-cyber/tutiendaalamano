import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Eye,
  Star,
  ArrowRight,
  Zap,
  Lock,
  Volume2,
  VolumeX,
  Video,
  Play,
  Film,
  Scan,
  Flame,
  Pin,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  Heart,
} from 'lucide-react';
import { BuilderBlock } from '../../types/builder';
import { ShowcaseRail } from './ShowcaseRail';
import { CatalogBrowser } from './CatalogBrowser';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import { handleStoreButtonLink } from '../../lib/storeNavigation';
import { getOptimizedImageUrl, parseVideoUrl } from '../../lib/mediaOptimizer';
import { DEFAULT_NAV_LINKS } from '../../data/themes';
import { Product } from '../../types';

interface Props {
  blocks: BuilderBlock[];
  isCanvasPreview?: boolean;
  selectedBlockId?: string | null;
  onSelectBlock?: (blockId: string) => void;
}

export const StorefrontBlockRenderer: React.FC<Props> = ({
  blocks,
  isCanvasPreview = false,
  selectedBlockId = null,
  onSelectBlock,
}) => {
  return (
    <div className="w-full space-y-6">
      {blocks.map((block) => (
        <BlockItem
          key={block.id}
          block={block}
          isCanvasPreview={isCanvasPreview}
          isSelected={selectedBlockId === block.id}
          onSelect={() => onSelectBlock?.(block.id)}
        />
      ))}
    </div>
  );
};

export const BlockItem: React.FC<{
  block: BuilderBlock;
  isCanvasPreview?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}> = ({ block, isCanvasPreview = false, isSelected = false, onSelect }) => {
  const {
    products,
    openQuickView,
    addToCart,
    showToast,
    setActiveView,
    setActiveCategoryFilter,
    openOrderTracking,
    themeConfig,
  } = useStore();

  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Bloque desactivado: en tienda no se renderiza; en el lienzo se atenúa.
  const isDisabled = block.enabled === false;
  if (isDisabled && !isCanvasPreview) {
    return null;
  }

  // Styles helpers
  const styles = block.styles || {};
  const textAlignClass =
    styles.textAlign === 'center'
      ? 'text-center'
      : styles.textAlign === 'right'
      ? 'text-right'
      : 'text-left';

  const paddingYClass =
    styles.paddingY === 'xl'
      ? 'py-16 sm:py-24'
      : styles.paddingY === 'lg'
      ? 'py-12 sm:py-16'
      : styles.paddingY === 'md'
      ? 'py-8'
      : styles.paddingY === 'sm'
      ? 'py-4'
      : 'py-0';

  const paddingXClass =
    styles.paddingX === 'lg'
      ? 'px-8 sm:px-12'
      : styles.paddingX === 'md'
      ? 'px-4 sm:px-8'
      : styles.paddingX === 'sm'
      ? 'px-3 sm:px-4'
      : 'px-0';

  const roundedClass =
    styles.borderRadius === 'full'
      ? 'rounded-full'
      : styles.borderRadius === 'lg'
      ? 'rounded-2xl'
      : styles.borderRadius === 'md'
      ? 'rounded-xl'
      : styles.borderRadius === 'sm'
      ? 'rounded-md'
      : 'rounded-none';

  const borderClass = styles.border ? 'border' : '';
  const shadowClass =
    styles.shadow === 'lg'
      ? 'shadow-xl'
      : styles.shadow === 'md'
      ? 'shadow-md'
      : styles.shadow === 'sm'
      ? 'shadow-xs'
      : '';

  // Render specific element
  const renderBlockContent = () => {
    switch (block.type) {
      case 'container':
        return (
          <div
            className={`w-full ${paddingYClass} ${paddingXClass} ${roundedClass} ${borderClass} ${shadowClass} transition-all`}
            style={{
              backgroundColor: styles.backgroundColor || 'transparent',
              borderColor: styles.borderColor || '#e4e4e7',
              color: styles.textColor || 'inherit',
            }}
          >
            {block.children && block.children.length > 0 ? (
              <div className="space-y-4">
                {block.children.map((child) => (
                  <BlockItem
                    key={child.id}
                    block={child}
                    isCanvasPreview={isCanvasPreview}
                    isSelected={false}
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center border-2 border-dashed border-zinc-300 rounded-lg text-xs font-mono text-zinc-400">
                📦 [Caja / Contenedor Vacío] — Arrastra elementos aquí
              </div>
            )}
          </div>
        );

      case 'columns-2':
        return (
          <div className={`w-full ${paddingYClass} ${paddingXClass}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Column 1 */}
              <div className="space-y-4">
                {block.children && block.children.length > 0 ? (
                  block.children.map((child) => (
                    <BlockItem
                      key={child.id}
                      block={child}
                      isCanvasPreview={isCanvasPreview}
                      isSelected={false}
                    />
                  ))
                ) : (
                  <div className="py-8 text-center border-2 border-dashed border-zinc-300 rounded-lg text-xs font-mono text-zinc-400">
                    Columna 1 vacía
                  </div>
                )}
              </div>

              {/* Column 2 */}
              <div className="space-y-4">
                {block.childrenColumn2 && block.childrenColumn2.length > 0 ? (
                  block.childrenColumn2.map((child) => (
                    <BlockItem
                      key={child.id}
                      block={child}
                      isCanvasPreview={isCanvasPreview}
                      isSelected={false}
                    />
                  ))
                ) : (
                  <div className="py-8 text-center border-2 border-dashed border-zinc-300 rounded-lg text-xs font-mono text-zinc-400">
                    Columna 2 vacía
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'heading': {
        const level = block.headingLevel || 'h2';
        const content = block.content || 'Título de Encabezado';
        const colorStyle = styles.textColor ? { color: styles.textColor } : {};

        if (level === 'h1') {
          return (
            <h1
              className={`text-3xl sm:text-5xl font-black uppercase tracking-tight ${textAlignClass} ${paddingYClass}`}
              style={colorStyle}
            >
              {content}
            </h1>
          );
        }
        if (level === 'h3') {
          return (
            <h3
              className={`text-xl sm:text-2xl font-bold uppercase tracking-tight ${textAlignClass} ${paddingYClass}`}
              style={colorStyle}
            >
              {content}
            </h3>
          );
        }
        if (level === 'h4') {
          return (
            <h4
              className={`text-base sm:text-lg font-bold uppercase tracking-tight ${textAlignClass} ${paddingYClass}`}
              style={colorStyle}
            >
              {content}
            </h4>
          );
        }
        return (
          <h2
            className={`text-2xl sm:text-4xl font-black uppercase tracking-tight ${textAlignClass} ${paddingYClass}`}
            style={colorStyle}
          >
            {content}
          </h2>
        );
      }

      case 'paragraph':
        return (
          <p
            className={`text-sm sm:text-base leading-relaxed ${textAlignClass} ${paddingYClass}`}
            style={{ color: styles.textColor || 'inherit' }}
          >
            {block.content || 'Escribe aquí tu contenido...'}
          </p>
        );

      case 'image': {
        const aspectClass =
          block.aspectRatio === '16:9'
            ? 'aspect-video'
            : block.aspectRatio === '4:3'
            ? 'aspect-4/3'
            : block.aspectRatio === '1:1'
            ? 'aspect-square'
            : block.aspectRatio === '3:4'
            ? 'aspect-3/4'
            : 'aspect-auto max-h-[500px]';

        const optimizedImageUrl = getOptimizedImageUrl(
          block.imageUrl ||
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=75',
          1200,
          75
        );

        return (
          <div className={`w-full ${paddingYClass} flex justify-center`}>
            <div className={`relative overflow-hidden w-full ${roundedClass} ${shadowClass}`}>
              <img
                src={optimizedImageUrl}
                alt={block.imageAlt || 'Imagen de tienda'}
                loading="lazy"
                decoding="async"
                className={`w-full object-cover object-center ${aspectClass}`}
              />
              {block.content && (
                <div className="p-2 text-xs font-mono text-zinc-500 text-center bg-zinc-50 border-t border-zinc-200">
                  {block.content}
                </div>
              )}
              {isCanvasPreview && block.isOptimizedMedia && (
                <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[10px] font-mono uppercase tracking-wider backdrop-blur-xs border border-emerald-500/30 flex items-center gap-1">
                  <span>⚡ WebP Comprimido</span>
                  {block.optimizedSizeKb && <span>({block.optimizedSizeKb} KB)</span>}
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'video': {
        return (
          <VideoBlockView
            block={block}
            isCanvasPreview={isCanvasPreview}
            roundedClass={roundedClass}
            shadowClass={shadowClass}
            paddingYClass={paddingYClass}
          />
        );
      }

      case 'button': {
        const isPrimary = block.buttonVariant !== 'outline' && block.buttonVariant !== 'secondary';
        const buttonText = block.buttonText || 'COMPRAR AHORA';

        const handleClick = () => {
          if (isCanvasPreview) {
            showToast(`Botón interactivo: ${buttonText}`);
            return;
          }
          // Navegación centralizada: funciona con cualquier tema/layout y
          // soporta #catalog, #checkout, #rastreo, #reviews, URLs externas, etc.
          handleStoreButtonLink(block.buttonLink, {
            setActiveView,
            setActiveCategoryFilter,
            openOrderTracking,
            showToast,
          });
        };

        return (
          <div className={`w-full ${paddingYClass} ${textAlignClass}`}>
            <button
              onClick={handleClick}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 ${roundedClass} ${
                isPrimary
                  ? 'bg-black text-white hover:bg-zinc-800'
                  : 'bg-white text-black border border-black hover:bg-zinc-50'
              }`}
              style={
                isPrimary && themeConfig?.primaryColor
                  ? { backgroundColor: themeConfig.primaryColor, color: '#ffffff' }
                  : {}
              }
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      }

      case 'banner': {
        return (
          <BannerBlockView
            block={block}
            isCanvasPreview={isCanvasPreview}
            roundedClass={roundedClass}
            paddingYClass={paddingYClass}
            paddingXClass={paddingXClass}
            showToast={showToast}
          />
        );
      }

      case 'product-grid': {
        const columns = block.productsColumns || 3;
        const limit = block.productsLimit || 6;
        const gridClass =
          columns === 4
            ? 'grid-cols-2 md:grid-cols-4'
            : columns === 2
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

        const displayedProducts = (
          block.categoryFilter && block.categoryFilter !== 'TODOS'
            ? products.filter((p) => (p.category || '').toLowerCase().includes(block.categoryFilter!.toLowerCase()))
            : products
        ).slice(0, limit);

        return (
          <div id={`product-catalog-${block.id}`} className={`w-full scroll-mt-24 ${paddingYClass}`}>
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700">
                  {block.title || `BLOQUE E-COMMERCE: ${block.categoryFilter || 'TODOS'} (${displayedProducts.length} PRODUCTOS)`}
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                {columns} COLUMNAS
              </span>
            </div>

            {displayedProducts.length === 0 ? (
              <div className="py-12 px-6 text-center border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
                <ShoppingBag className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                <p className="font-bold text-sm text-zinc-700">No hay productos en esta sección</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Agrega nuevos productos en el catálogo del panel de control para que se muestren automáticamente en tu tienda.
                </p>
              </div>
            ) : (
              <div className={`grid ${gridClass} gap-6`}>
                {displayedProducts.map((p) => {
                  const variant = p.variants?.[0];
                  const priceInCents = variant?.priceInCents || 17990000;
                  return (
                    <div
                      key={p.id}
                      onClick={() => openQuickView(p)}
                      className="group bg-white border border-zinc-200 hover:border-black rounded-lg overflow-hidden transition-all duration-200 cursor-pointer flex flex-col"
                    >
                      <div className="relative aspect-4/5 bg-zinc-100 overflow-hidden">
                        <img
                          src={p.mainImage}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {p.badge && (
                          <span className="absolute top-2 left-2 bg-black text-white text-[9px] font-mono font-bold px-2 py-0.5 uppercase">
                            {p.badge}
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-white text-black px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded shadow-md flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Prenda</span>
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                            {p.category}
                          </span>
                          <h4 className="text-xs font-bold uppercase tracking-tight text-zinc-900 group-hover:text-black line-clamp-1">
                            {p.title}
                          </h4>
                        </div>

                        <div className="flex items-baseline justify-between pt-1 border-t border-zinc-100">
                          <span className="text-sm font-black text-zinc-900">
                            ${formatCOP(priceInCents)} COP
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const size = p.availableSizes?.[0] || 'M';
                              const color = p.availableColors?.[0]?.name || 'Standard';
                              addToCart(p, size, color, 1);
                            }}
                            className="p-2 bg-black text-white rounded hover:bg-zinc-800 transition-colors"
                            title="Agregar al carrito"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      case 'showcase-rail': {
        return (
          <ShowcaseRail
            asBlock
            title={block.title}
            subtitle={block.subcontent}
            rotateCount={block.showcaseCount ?? (block as any).showcaseRotateCount}
            intervalSec={block.showcaseIntervalSec}
          />
        );
      }

      case 'catalog-browser': {
        const b = block as any;
        return (
          <div className="scroll-mt-24">
          <CatalogBrowser
            anchorId={`catalog-browser-${block.id}`}
            title={block.title}
            subtitle={block.subcontent}
            categoryFilter={block.categoryFilter}
            columns={block.productsColumns}
            limit={block.productsLimit}
            showCategoryNav={block.showCategoryNav ?? b.showCategoryTabs !== false}
            showSearch={block.showSearch ?? b.showSearchBar !== false}
            showSort={block.showSort ?? b.showSortFilter !== false}
          />
          </div>
        );
      }

      case 'trust-badges':
        return (
          <div
            className={`w-full ${paddingYClass} ${paddingXClass} ${roundedClass} border transition-all`}
            style={{
              backgroundColor: styles.backgroundColor || '#18181b',
              color: styles.textColor || '#ffffff',
              borderColor: styles.borderColor || 'transparent',
            }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1.5">
                <Truck className="w-6 h-6 mx-auto text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Envíos Colombia</h4>
                <p className="text-[11px] opacity-75">24-48h Coordinadora / Envia</p>
              </div>
              <div className="space-y-1.5">
                <CreditCard className="w-6 h-6 mx-auto text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Pasarela Wompi</h4>
                <p className="text-[11px] opacity-75">Bancolombia • PSE • Nequi</p>
              </div>
              <div className="space-y-1.5">
                <RotateCcw className="w-6 h-6 mx-auto text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Cambio Fácil</h4>
                <p className="text-[11px] opacity-75">30 días de garantía total</p>
              </div>
              <div className="space-y-1.5">
                <ShieldCheck className="w-6 h-6 mx-auto text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider">450 GSM Heavyweight</h4>
                <p className="text-[11px] opacity-75">Confección 100% Medellín</p>
              </div>
            </div>
          </div>
        );

      case 'newsletter':
        return (
          <div
            className={`w-full ${paddingYClass} ${paddingXClass} ${roundedClass} ${borderClass} transition-all`}
            style={{
              backgroundColor: styles.backgroundColor || '#fafafa',
              borderColor: styles.borderColor || '#e4e4e7',
            }}
          >
            <div className="max-w-xl mx-auto text-center space-y-4">
              <Sparkles className="w-6 h-6 mx-auto text-amber-500" />
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900">
                {block.title || 'ÚNETE AL CLUB // ACCESO VIP'}
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                {block.subcontent || 'Recibe acceso anticipado a los drops exclusivos de 450 GSM y cupones relámpago.'}
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newsletterEmail) return;
                  showToast(`🚀 ¡Suscripción exitosa! ${newsletterEmail}`);
                  setNewsletterEmail('');
                }}
                className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2"
              >
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Tu correo electrónico..."
                  className="flex-1 px-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-xs focus:outline-hidden focus:border-black"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-800 transition-colors shadow-xs"
                >
                  {block.buttonText || 'Suscribirme'}
                </button>
              </form>
            </div>
          </div>
        );

      case 'divider':
        return (
          <div className="w-full py-4 flex items-center justify-center">
            <div className="w-full border-t border-zinc-200" />
          </div>
        );

      case 'spacer': {
        const height = block.spacerHeight || 48;
        return <div style={{ height: `${height}px` }} className="w-full" />;
      }

      default:
        return null;
    }
  };

  return (
    <div
      onClick={(e) => {
        if (isCanvasPreview && onSelect) {
          e.stopPropagation();
          onSelect();
        }
      }}
      className={`relative group/block transition-all ${
        isSelected && isCanvasPreview
          ? 'ring-2 ring-indigo-500 ring-offset-2 rounded-xl'
          : ''
      } ${isDisabled ? 'opacity-50 saturate-50' : ''}`}
    >
      {isDisabled && isCanvasPreview && (
        <span className="absolute top-2 right-2 z-30 bg-zinc-900 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full pointer-events-none">
          OCULTO EN TIENDA
        </span>
      )}
      {renderBlockContent()}
    </div>
  );
};

// ==========================================
// SUB-COMPONENTE: BANNER VIEW
// ==========================================
interface BannerBlockViewProps {
  block: BuilderBlock;
  isCanvasPreview?: boolean;
  roundedClass: string;
  paddingYClass: string;
  paddingXClass: string;
  showToast: (msg: string) => void;
}

const BannerBlockView: React.FC<BannerBlockViewProps> = ({
  block,
  isCanvasPreview,
  roundedClass,
  paddingYClass,
  paddingXClass,
  showToast,
}) => {
  const { themeConfig, setActiveView, setActiveCategoryFilter, openOrderTracking } = useStore();
  const [isMuted, setIsMuted] = useState(block.videoMuted !== false);
  const [blockVideoFit, setBlockVideoFit] = useState<'contain' | 'cover'>('contain');
  const isVideo = block.mediaType === 'video' && Boolean(block.videoUrl);

  const effectiveBannerHeight =
    themeConfig.bannerDesktopHeight ||
    themeConfig.heroBannerCustomHeightDesktop ||
    (block.bannerHeight === 'tall' ? 680 : block.bannerHeight === 'compact' ? 380 : 540);

  const opacity = (block.overlayOpacity ?? themeConfig.bannerOverlayOpacity ?? themeConfig.heroOverlayOpacity ?? 50) / 100;
  
  const blockImage = block.imageUrl && block.imageUrl.trim() ? block.imageUrl.trim() : '';
  const bannerImageSource =
    blockImage !== ''
      ? blockImage
      : (themeConfig.heroImageUrl && themeConfig.heroImageUrl.trim()
          ? themeConfig.heroImageUrl
          : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=75');

  const optimizedImageUrl = getOptimizedImageUrl(
    bannerImageSource,
    1600,
    75
  );
  const posterUrl = block.videoPoster
    ? getOptimizedImageUrl(block.videoPoster, 1600, 70)
    : optimizedImageUrl;

  return (
    <div
      className={`relative w-full flex items-center justify-center overflow-hidden transition-all duration-300 ${roundedClass} ${paddingYClass} ${paddingXClass}`}
      style={{
        height: `${effectiveBannerHeight}px`,
        maxHeight: '86vh',
        minHeight: '280px',
      }}
    >
      {/* Background: Video Loop or Compressed Image */}
      {isVideo ? (
        <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 blur-2xl scale-110">
            <video
              autoPlay={block.videoAutoplay !== false}
              muted
              loop={block.videoLoop !== false}
              playsInline
              className="w-full h-full object-cover"
            >
              <source src={block.videoUrl} type="video/mp4" />
            </video>
          </div>

          <video
            autoPlay={block.videoAutoplay !== false}
            muted={isMuted}
            loop={block.videoLoop !== false}
            playsInline
            preload="metadata"
            poster={posterUrl}
            className={`relative z-10 w-full h-full ${
              blockVideoFit === 'contain' ? 'object-contain' : 'object-cover'
            } object-center transition-all duration-300`}
          >
            <source src={block.videoUrl} type="video/mp4" />
          </video>
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBlockVideoFit((prev) => (prev === 'contain' ? 'cover' : 'contain'));
              }}
              className="px-2.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors cursor-pointer border border-white/20 text-[10px] font-mono flex items-center gap-1"
              title={blockVideoFit === 'contain' ? 'Mostrando todo el video sin recortes' : 'Llenar'}
            >
              <Scan className="w-3 h-3" />
              <span>{blockVideoFit === 'contain' ? 'Sin Cortes' : 'Llenar'}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors cursor-pointer border border-white/20"
              title={isMuted ? 'Activar audio' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono uppercase tracking-wider border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span>Video Loop HD</span>
          </div>
        </div>
      ) : (
        <>
        {(themeConfig.heroImageFit || themeConfig.bannerImageFit || 'contain') === 'contain' && (
          <img
            src={optimizedImageUrl}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-40 pointer-events-none"
          />
        )}
        <img
          src={optimizedImageUrl}
          alt={block.title || 'Banner'}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full transition-transform duration-700"
          style={{
            objectFit: (themeConfig.heroImageFit || themeConfig.bannerImageFit || 'contain') as any,
            objectPosition: `${themeConfig.heroImagePositionX ?? themeConfig.bannerImagePosX ?? 50}% ${themeConfig.heroImagePositionY ?? themeConfig.bannerImagePosY ?? 50}%`,
            transform: `scale(${((themeConfig.heroImageZoom ?? themeConfig.bannerImageZoom ?? 100) / 100)})`,
          }}
        />
        </>
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{ opacity }}
      />

      {/* Banner text content */}
      <div className="relative z-10 max-w-2xl text-center text-white px-4 space-y-4">
        {block.content ? (
          <span className="text-[11px] font-mono font-bold tracking-widest text-zinc-300 uppercase block">
            {block.content}
          </span>
        ) : null}
        {block.badgeSecondary ? (
          <span className="inline-block text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-white/40 text-white/90">
            {block.badgeSecondary}
          </span>
        ) : null}
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight leading-tight">
          {block.title || 'BANNER PROMOCIONAL PRINCIPAL'}
        </h1>
        {block.subcontent && (
          <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto font-medium">
            {block.subcontent}
          </p>
        )}
        {(block.buttonText || block.buttonTextSecondary) && (
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {block.buttonText && (
              <button
                onClick={() => {
                  if (isCanvasPreview) {
                    showToast(`Banner CTA click`);
                  } else {
                    // Usa el enlace configurado (o catálogo por defecto).
                    // Nunca queda estático aunque cambie el tema/layout.
                    handleStoreButtonLink(block.buttonLink || '#catalog', {
                      setActiveView,
                      setActiveCategoryFilter,
                      openOrderTracking,
                      showToast,
                    });
                  }
                }}
                className="px-8 py-3.5 bg-white text-black font-mono text-xs font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all cursor-pointer shadow-xl active:scale-95"
              >
                {block.buttonText}
              </button>
            )}
            {block.buttonTextSecondary && (
              <button
                onClick={() => {
                  if (isCanvasPreview) {
                    showToast(`Banner CTA secundario click`);
                  } else {
                    handleStoreButtonLink(block.buttonLinkSecondary || '#catalog', {
                      setActiveView,
                      setActiveCategoryFilter,
                      openOrderTracking,
                      showToast,
                    });
                  }
                }}
                className="px-8 py-3.5 bg-transparent text-white font-mono text-xs font-black uppercase tracking-widest rounded-xl border border-white/60 hover:bg-white/10 transition-all cursor-pointer active:scale-95"
              >
                {block.buttonTextSecondary}
              </button>
            )}
          </div>
        )}
        {Array.isArray(block.seals) && block.seals.some((s) => s && (s.title || s.sub)) && (
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-2xl mx-auto">
            {block.seals.slice(0, 3).map((s, i) =>
              s && (s.title || s.sub) ? (
                <div key={i} className="rounded-xl border border-white/20 bg-black/40 backdrop-blur-xs px-3 py-2">
                  {s.title && <div className="text-[11px] font-black uppercase tracking-wider text-white">{s.title}</div>}
                  {s.sub && <div className="text-[10px] font-mono text-zinc-300">{s.sub}</div>}
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// SUB-COMPONENTE: VIDEO BLOCK VIEW
// ==========================================
interface VideoBlockViewProps {
  block: BuilderBlock;
  isCanvasPreview?: boolean;
  roundedClass: string;
  shadowClass: string;
  paddingYClass: string;
}

const VideoBlockView: React.FC<VideoBlockViewProps> = ({
  block,
  isCanvasPreview,
  roundedClass,
  shadowClass,
  paddingYClass,
}) => {
  const [isMuted, setIsMuted] = useState(block.videoMuted ?? true);
  const videoUrl = block.videoUrl || '';
  const parsed = parseVideoUrl(videoUrl);

  const aspectClass =
    block.aspectRatio === '9:16'
      ? 'aspect-9/16 max-w-[340px] mx-auto'
      : block.aspectRatio === '16:9'
      ? 'aspect-video w-full'
      : block.aspectRatio === '4:3'
      ? 'aspect-4/3 w-full'
      : block.aspectRatio === '1:1'
      ? 'aspect-square max-w-xl mx-auto'
      : block.aspectRatio === '3:4'
      ? 'aspect-3/4 max-w-md mx-auto'
      : 'aspect-video w-full';

  const posterUrl = block.videoPoster
    ? getOptimizedImageUrl(block.videoPoster, 1200, 75)
    : undefined;

  return (
    <div className={`w-full ${paddingYClass}`}>
      <div className="w-full">
        {block.title && (
          <div className="mb-3 text-center">
            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white font-sans">
              {block.title}
            </h3>
            {block.subcontent && (
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                {block.subcontent}
              </p>
            )}
          </div>
        )}

        <div
          className={`relative overflow-hidden bg-black ${roundedClass} ${shadowClass} ${aspectClass}`}
        >
          {videoUrl ? (
            parsed.type === 'youtube' || parsed.type === 'vimeo' ? (
              <iframe
                src={`${parsed.embedUrl}${
                  parsed.embedUrl.includes('?') ? '&' : '?'
                }${block.videoAutoplay ? 'autoplay=1&mute=1&' : ''}${
                  block.videoLoop ? 'loop=1&' : ''
                }controls=${block.videoControls !== false ? '1' : '0'}`}
                title={block.title || 'Video Embed'}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  src={videoUrl}
                  poster={posterUrl}
                  autoPlay={block.videoAutoplay ?? false}
                  muted={isMuted}
                  loop={block.videoLoop ?? false}
                  controls={block.videoControls !== false}
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                />

                {block.videoAutoplay && isMuted && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/70 hover:bg-black text-white backdrop-blur-xs transition-colors cursor-pointer border border-white/20"
                    title="Activar sonido"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                )}

                <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono uppercase tracking-wider border border-white/10 flex items-center gap-1.5 pointer-events-none">
                  <Film className="w-3 h-3 text-indigo-400" />
                  <span>Streetwear Video</span>
                </div>
              </div>
            )
          ) : (
            <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 bg-zinc-950 text-zinc-400 space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold font-sans uppercase text-white">
                  Reproductor de Video
                </p>
                <p className="text-[11px] font-mono text-zinc-500 mt-1 max-w-xs">
                  Agrega una URL de YouTube, Vimeo o MP4 en el inspector lateral para reproducir tu video.
                </p>
              </div>
            </div>
          )}
        </div>

        {(block.videoCaption || block.content) && (
          <div className="pt-2 text-center text-xs font-mono text-zinc-500 dark:text-zinc-400">
            {block.videoCaption || block.content}
          </div>
        )}
      </div>
    </div>
  );
};
