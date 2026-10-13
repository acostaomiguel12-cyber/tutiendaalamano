import React, { useState, useMemo, useEffect } from 'react';
import { Heart, ShoppingBag, ArrowUpRight, Flame, Sparkles, Check, Eye, Star, Truck, ArrowUpDown, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP } from '../../lib/wompi';
import { handleImgError } from '../../lib/images';
import { Product } from '../../types';
import { DEFAULT_NAV_LINKS } from '../../data/themes';
import { productMatchesFilter } from '../../lib/categories';
import { scrollToCatalog } from '../../lib/storeNavigation';

export const FlashDeals: React.FC = () => {
  const {
    products,
    openProductDetail,
    openQuickView,
    addToCart,
    wishlist,
    toggleWishlist,
    activeCategoryFilter,
    setActiveCategoryFilter,
    searchQuery,
    setSearchQuery,
    themeConfig,
  } = useStore();

  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  // Catálogo compacto: muestra 8 y revela el resto con "ver más".
  const PAGE_SIZE = 8;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCategoryFilter, searchQuery, sortBy]);


  // Visible por defecto (undefined = visible): coherente con el toggle de Bloques (checked !== false).
  if (themeConfig.showCatalog === false) {
    return null;
  }

  const isDark = themeConfig.mode === 'dark';
  const isWarm = themeConfig.mode === 'warm';

  // Dynamic Categories from Navbar Settings + Existing Product Categories
  const categories = useMemo(() => {
    const rawNavLinks =
      themeConfig.navCategoryLinks && themeConfig.navCategoryLinks.length > 0
        ? themeConfig.navCategoryLinks
        : DEFAULT_NAV_LINKS;

    const activeLinks = rawNavLinks.filter((l) => l.enabled !== false);

    const list: { id: string; label: string; value: string | null; icon: string }[] = [];
    const seenFilters = new Set<string>();
    const seenLabels = new Set<string>();

    activeLinks.forEach((link, idx) => {
      const label = link.name.toUpperCase().trim();
      const filterKey = link.filter ? link.filter.toLowerCase().trim() : '__all__';
      if (!seenLabels.has(label) && !seenFilters.has(filterKey)) {
        seenLabels.add(label);
        seenFilters.add(filterKey);
        list.push({
          id: link.id || `nav-${idx}-${label}`,
          label,
          value: link.filter,
          icon: link.badge ? '💎' : link.filter === null ? '🔥' : '⚡',
        });
      }
    });

    // Check if there are categories in products not present in activeLinks
    products.forEach((p, idx) => {
      const pCat = (p.category || '').trim();
      if (!pCat) return;
      const normalizedLabel = pCat.split('&')[0].trim().toUpperCase();
      const filterKey = pCat.toLowerCase();

      const alreadyIncluded =
        seenFilters.has(filterKey) ||
        seenLabels.has(normalizedLabel) ||
        list.some(
          (c) =>
            (c.value && c.value.toLowerCase() === filterKey) ||
            c.label === normalizedLabel
        );

      if (!alreadyIncluded) {
        seenFilters.add(filterKey);
        seenLabels.add(normalizedLabel);
        list.push({
          id: `prod-cat-${idx}-${normalizedLabel}`,
          label: normalizedLabel,
          value: pCat,
          icon: '🏷️',
        });
      }
    });

    return list;
  }, [themeConfig.navCategoryLinks, products]);

  // Filter and Sort products
  const processedProducts = useMemo(() => {
    let result = products.filter((p) => {
      const pCat = (p.category || '').toLowerCase().trim();

      // Filtro por departamento o subcategoría (ver lib/categories).
      const matchesCategory = productMatchesFilter(p, activeCategoryFilter);

      const q = (searchQuery || '').toLowerCase();
      const matchesSearch =
        !q ||
        (p.title || '').toLowerCase().includes(q) ||
        (p.reference || '').toLowerCase().includes(q) ||
        pCat.includes(q);
      return matchesCategory && matchesSearch;
    });

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => {
        const pA = a.variants?.[0]?.priceInCents || 0;
        const pB = b.variants?.[0]?.priceInCents || 0;
        return pA - pB;
      });
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => {
        const pA = a.variants?.[0]?.priceInCents || 0;
        const pB = b.variants?.[0]?.priceInCents || 0;
        return pB - pA;
      });
    } else if (sortBy === 'rating') {
      result = [...result].sort((a, b) => (b.rating || 5) - (a.rating || 5));
    }

    return result;
  }, [products, activeCategoryFilter, searchQuery, sortBy]);

  const handleQuickAdd = (e: React.MouseEvent, prod: Product, size: string) => {
    e.stopPropagation();
    const color = prod.availableColors[0]?.name || 'Standard';
    addToCart(prod, size, color, 1);
    setJustAddedId(prod.id);
    setTimeout(() => setJustAddedId(null), 1800);
  };

  const gridColsClass =
    themeConfig.productsPerRow === 2
      ? 'grid-cols-2 sm:grid-cols-2'
      : themeConfig.productsPerRow === 4
      ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3';

  const roundedClass =
    themeConfig.borderRadius === 'rounded'
      ? 'rounded-2xl'
      : themeConfig.borderRadius === 'pill'
      ? 'rounded-3xl'
      : 'rounded-none';

  return (
    <section
      id="catalog-section"
      className={`py-8 px-4 sm:px-6 border-b scroll-mt-24 transition-colors ${
        isDark
          ? 'bg-zinc-950 text-white border-zinc-800'
          : isWarm
          ? 'bg-[#faf8f5] text-stone-900 border-stone-200'
          : 'bg-white text-zinc-900 border-zinc-200'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b ${
            isDark ? 'border-zinc-800' : 'border-zinc-200'
          }`}
        >
          <div className="space-y-1.5">
            {(themeConfig.catalogBadge !== undefined ? themeConfig.catalogBadge : 'CATÁLOGO // DISPONIBLE') ? (
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: themeConfig.primaryColor }}
              ></span>
              <span>{themeConfig.catalogBadge !== undefined ? themeConfig.catalogBadge : 'CATÁLOGO // DISPONIBLE'}</span>
            </div>
            ) : null}
            {(themeConfig.catalogTitle !== undefined ? themeConfig.catalogTitle : 'Colección de Productos') ? (
            <h2
              className={`text-3xl sm:text-4xl font-black uppercase tracking-tight ${
                themeConfig.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
              }`}
            >
              {themeConfig.catalogTitle !== undefined ? themeConfig.catalogTitle : 'Colección de Productos'}
            </h2>
            ) : null}
            {(themeConfig.catalogSubtitle !== undefined ? themeConfig.catalogSubtitle : 'Productos originales con envío a toda Colombia. Selecciona tu producto para ver detalles o realizar tu pedido.') ? (
            <p className={`text-xs max-w-lg ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {themeConfig.catalogSubtitle !== undefined ? themeConfig.catalogSubtitle : 'Productos originales con envío a toda Colombia. Selecciona tu producto para ver detalles o realizar tu pedido.'}
            </p>
            ) : null}
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2.5 self-start md:self-auto font-mono text-xs flex-wrap">
            <div
              className={`px-3.5 py-1.5 rounded-full border font-bold ${
                isDark
                  ? 'bg-zinc-900 text-zinc-300 border-zinc-700'
                  : 'bg-zinc-100 text-zinc-800 border-zinc-200'
              }`}
            >
              {processedProducts.length} PRODUCTOS EN LISTA
            </div>
          </div>
        </div>

        {/* Controls & Filter Bar: Categories + Sorting */}
        <div className="space-y-4">
          {/* Active Search Banner */}
          {searchQuery && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 text-white text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">BÚSQUEDA ACTIVA:</span>
                <span>"{searchQuery}" ({processedProducts.length} encontrados)</span>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Quitar filtro</span>
              </button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories.map((cat) => {
                const isSelected = activeCategoryFilter === cat.value;
                const count = cat.value
                  ? products.filter((p) => (p.category || '').toLowerCase().includes(cat.value!.toLowerCase())).length
                  : products.length;

                return (
                  <button
                    key={cat.id || `${cat.label}-${cat.value || 'all'}`}
                    onClick={() => setActiveCategoryFilter(cat.value)}
                    className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all rounded-full cursor-pointer shrink-0 ${
                      isSelected
                        ? 'text-white shadow-md'
                        : isDark
                        ? 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-black border border-zinc-200'
                    }`}
                    style={isSelected ? { backgroundColor: themeConfig.primaryColor, color: '#ffffff' } : {}}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : isDark
                          ? 'bg-zinc-800 text-zinc-400'
                          : 'bg-zinc-200/80 text-zinc-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
              <span className="text-[11px] font-mono text-zinc-400 uppercase hidden sm:inline">Ordenar:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={`pl-3 pr-8 py-2 text-xs font-bold uppercase rounded-xl border appearance-none cursor-pointer focus:outline-hidden ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-200'
                      : 'bg-white border-zinc-200 text-zinc-800 shadow-2xs'
                  }`}
                >
                  <option value="featured">🔥 Más Populares</option>
                  <option value="rating">⭐ Mejor Calificados (4.9+)</option>
                  <option value="price-asc">⬆️ Menor Precio</option>
                  <option value="price-desc">⬇️ Mayor Precio</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {processedProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-zinc-400 font-mono text-xs uppercase">
              No se encontraron productos en esta categoría o búsqueda.
            </p>
            <button
              onClick={() => {
                setActiveCategoryFilter(null);
                setSearchQuery('');
              }}
              className="px-5 py-2 text-xs font-bold uppercase rounded-full text-white cursor-pointer"
              style={{ backgroundColor: themeConfig.primaryColor }}
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className={`grid ${gridColsClass} gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10`}>
            {processedProducts.slice(0, visibleCount).map((prod) => {
              const isFav = wishlist.includes(prod.id);
              const isHovered = hoveredCardId === prod.id;
              const availableSizes = prod.availableSizes || ['S', 'M', 'L', 'XL'];
              const variant = prod.variants?.[0];
              const priceInCents = variant?.priceInCents || 17990000;
              const originalPriceInCents = variant?.originalPriceInCents;
              const secondImage =
                prod.thumbnailImages &&
                prod.thumbnailImages.length > 1 &&
                prod.thumbnailImages[1] &&
                prod.thumbnailImages[1] !== prod.mainImage
                  ? prod.thumbnailImages[1]
                  : null;
              const isFreeShipping = priceInCents >= 15000000;
              const ratingVal = prod.rating || 4.9;
              const reviewsVal = prod.reviewsCount || 650;
              const discountPct =
                originalPriceInCents && originalPriceInCents > priceInCents
                  ? Math.round((1 - priceInCents / originalPriceInCents) * 100)
                  : 0;
              const soldToday = prod.salesLast24h || 0;

              const cardWrapperClass =
                themeConfig.productCardStyle === 'card-elevated'
                  ? `p-3 bg-white shadow-md border border-zinc-200 ${roundedClass}`
                  : themeConfig.productCardStyle === 'bordered'
                  ? `p-2.5 bg-white border ${isDark ? 'border-zinc-800' : 'border-zinc-200 hover:border-zinc-900'} transition-all ${roundedClass}`
                  : 'space-y-3';

              return (
                <div
                  key={prod.id}
                  onClick={() => openQuickView(prod)}
                  onMouseEnter={() => setHoveredCardId(prod.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  className={`group flex flex-col justify-between cursor-pointer ${cardWrapperClass}`}
                >
                  {/* Image Container with 4:5 Aspect Ratio */}
                  <div
                    className={`relative aspect-4/5 overflow-hidden transition-all duration-300 ${roundedClass} ${
                      isDark ? 'bg-zinc-900' : 'bg-zinc-100'
                    }`}
                  >
                    {/* Badge Pill Top-Left */}
                    <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 items-start">
                      {prod.badge && (
                        <div className="bg-zinc-950 text-white text-[10px] font-bold font-mono px-2.5 py-1 uppercase tracking-wider rounded-md shadow-md">
                          {prod.badge}
                        </div>
                      )}
                      {discountPct > 0 && (
                        <div className="bg-rose-600 text-white text-[10px] font-black font-mono px-2 py-1 rounded-md shadow-md">
                          -{discountPct}%
                        </div>
                      )}
                      {isFreeShipping && (
                        <div className="bg-emerald-600 text-white text-[9px] font-bold font-mono px-2 py-0.5 uppercase tracking-wider rounded flex items-center gap-1 shadow-sm">
                          <Truck className="w-2.5 h-2.5" />
                          <span>Envío Gratis</span>
                        </div>
                      )}
                    </div>

                    {/* Quick View Floating Pill on Hover */}
                    <div
                      className={`absolute top-3 inset-x-10 z-20 flex justify-center transition-all duration-300 ${
                        isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openQuickView(prod);
                        }}
                        className="bg-zinc-950 hover:bg-black text-white text-[10px] font-mono font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-zinc-700 uppercase cursor-pointer transition-transform hover:scale-105"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Vista Rápida</span>
                      </button>
                    </div>

                    {/* Wishlist Button Top-Right */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(prod.id);
                      }}
                      className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-black shadow-sm flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                      aria-label="Agregar a favoritos"
                    >
                      <Heart
                        className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-zinc-600'}`}
                      />
                    </button>

                    {/* Product Images (Primary + Hover Secondary) */}
                    <img
                      src={prod.mainImage}
                      alt={prod.title}
                      onError={handleImgError}
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        isHovered && secondImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                      }`}
                      style={{
                        objectPosition: prod.imagePosition || 'center',
                      }}
                    />
                    {secondImage && (
                      <img
                        src={secondImage}
                        alt={`${prod.title} detalle`}
                        onError={handleImgError}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                          isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                        }`}
                        style={{
                          objectPosition: prod.imagePosition || 'center',
                        }}
                      />
                    )}

                    {/* Quick Add Size Overlay on Hover (Desktop) & Tap */}
                    <div
                      className={`absolute inset-x-0 bottom-0 bg-zinc-950/95 backdrop-blur-xs p-2.5 sm:p-3 transition-transform duration-300 z-20 flex flex-col gap-1.5 ${
                        isHovered ? 'translate-y-0' : 'translate-y-full sm:translate-y-full'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-300 uppercase">
                        <span>Añadir talla 1-clic:</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openQuickView(prod);
                          }}
                          className="text-white hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Ver Detalle</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                        {availableSizes.map((sz) => (
                          <button
                            key={sz}
                            onClick={(e) => handleQuickAdd(e, prod, sz)}
                            className="flex-1 min-w-[28px] sm:min-w-[34px] py-1 bg-zinc-800 hover:bg-white hover:text-black text-white text-[9px] sm:text-[10px] font-mono font-bold uppercase transition-colors border border-zinc-700 rounded cursor-pointer active:scale-95"
                            title={`Añadir talla ${sz} directamente al carrito`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Product Details Section */}
                  <div className="space-y-1 pt-2">
                    {/* Subtitle / Rating */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span className="truncate uppercase max-w-[120px]">{prod.category}</span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{ratingVal}</span>
                        <span className="text-zinc-400 font-normal">({reviewsVal})</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      className={`text-xs sm:text-sm font-bold uppercase tracking-tight group-hover:opacity-75 transition-opacity line-clamp-1 ${
                        isDark ? 'text-white' : 'text-zinc-900'
                      }`}
                    >
                      {prod.title}
                    </h3>

                    {soldToday > 0 && (
                      <p className="text-[10px] font-mono font-bold text-orange-600 flex items-center gap-1">
                        <span aria-hidden>🔥</span> {soldToday} vendidos hoy
                      </p>
                    )}

                    {/* Price and Installments */}
                    <div className="flex items-baseline justify-between pt-0.5">
                      <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                        <span className={`text-xs sm:text-base font-black ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                          ${formatCOP(priceInCents)} COP
                        </span>
                        {originalPriceInCents && (
                          <span className="text-[10px] sm:text-xs text-zinc-400 line-through font-medium">
                            ${formatCOP(originalPriceInCents)}
                          </span>
                        )}
                      </div>

                      {justAddedId === prod.id && (
                        <span className="text-[10px] sm:text-[11px] font-mono text-emerald-600 font-bold flex items-center gap-0.5 animate-pulse">
                          <Check className="w-3 h-3" /> En tu Bolsa
                        </span>
                      )}
                    </div>

                    {/* Direct Buy Button (Actionable for customer) */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const defaultSize = availableSizes[0] || 'M';
                          handleQuickAdd(e, prod, defaultSize);
                        }}
                        className="flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                        style={{
                          backgroundColor: themeConfig.primaryColor,
                          color: ['#ccff00', '#fcee0a', '#ffffff'].includes(themeConfig.primaryColor.toLowerCase())
                            ? '#09090b'
                            : '#ffffff',
                        }}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Comprar Talla {availableSizes[0] || 'M'}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openQuickView(prod);
                        }}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          isDark ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                        }`}
                        title="Ver más tallas y medidas"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="hidden sm:flex items-center justify-between text-[10px] font-mono pt-1 text-zinc-400">
                      <span>3 cuotas de ${formatCOP(Math.round(priceInCents / 3))} sin interés</span>
                      <span className="font-bold uppercase text-zinc-500">
                        REF: {prod.reference}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Ver más / ver menos */}
        {processedProducts.length > PAGE_SIZE && (
          <div className="flex justify-center pt-2">
            {visibleCount < processedProducts.length ? (
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all active:scale-95 cursor-pointer shadow-lg"
                style={{ backgroundColor: themeConfig.primaryColor }}
              >
                Ver más ({processedProducts.length - visibleCount} restantes)
              </button>
            ) : (
              <button
                onClick={() => {
                  setVisibleCount(PAGE_SIZE);
                  scrollToCatalog(false);
                }}
                className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all active:scale-95 cursor-pointer ${
                  isDark ? 'border-zinc-700 text-zinc-200 hover:bg-zinc-900' : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                Ver menos
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
