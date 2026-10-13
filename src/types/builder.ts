export type BuilderBlockType =
  | 'container'
  | 'columns-2'
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'video'
  | 'button'
  | 'product-grid'
  | 'catalog-browser'
  | 'showcase-rail'
  | 'banner'
  | 'trust-badges'
  | 'divider'
  | 'spacer'
  | 'newsletter'
  | 'showcase-rail'
  | 'catalog-browser';

export interface BuilderBlockStyles {
  backgroundColor?: string;
  textColor?: string;
  paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  paddingX?: 'none' | 'sm' | 'md' | 'lg';
  textAlign?: 'left' | 'center' | 'right';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  border?: boolean;
  borderColor?: string;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface BuilderBlock {
  id: string;
  type: BuilderBlockType;
  /** Visible en tienda. false = oculto (se conserva en el maquetador). */
  enabled?: boolean;
  title?: string;
  content?: string;
  subcontent?: string;
  imageUrl?: string;
  imageAlt?: string;
  aspectRatio?: 'auto' | '16:9' | '9:16' | '4:3' | '1:1' | '3:4';
  buttonText?: string;
  buttonLink?: string;
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4';
  // Product grid & catalog browser block properties
  categoryFilter?: string;
  productsLimit?: number;
  productsColumns?: 2 | 3 | 4;
  productCardStyle?: 'borderless' | 'bordered' | 'elevated';
  // Showcase rail block (fijos + rotación)
  showcaseCount?: number;
  // Catalog browser block (pills + buscador + orden)
  showCategoryNav?: boolean;
  showSearch?: boolean;
  showSort?: boolean;

  showCategoryTabs?: boolean;
  showSearchBar?: boolean;
  showSortFilter?: boolean;
  // Showcase rail block properties
  showcaseIntervalSec?: number;
  showcaseRotateCount?: number;
  showPinnedOnly?: boolean;
  // Banner: sello secundario, segundo botón y sellos inferiores (todo opcional).
  badgeSecondary?: string;
  buttonTextSecondary?: string;
  buttonLinkSecondary?: string;
  seals?: Array<{ title?: string; sub?: string }>;
  // Spacer block
  spacerHeight?: number; // px
  // Banner block
  bannerHeight?: 'compact' | 'medium' | 'tall';
  overlayOpacity?: number; // 0 to 100
  // Video & Media Optimization fields
  mediaType?: 'image' | 'video';
  videoUrl?: string;
  videoPoster?: string;
  videoAutoplay?: boolean;
  videoMuted?: boolean;
  videoLoop?: boolean;
  videoControls?: boolean;
  videoCaption?: string;
  isOptimizedMedia?: boolean;
  optimizedSizeKb?: number;
  // Container nested children (for container and columns-2)
  children?: BuilderBlock[];
  childrenColumn2?: BuilderBlock[];
  styles: BuilderBlockStyles;
}

export interface PageLayout {
  id: string;
  name: string;
  enabledInStorefront: boolean;
  blocks: BuilderBlock[];
  updatedAt: string;
  /** Sello de migración: sin este valor se descarta lo guardado y se usa el diseño actual. */
  layoutSchema?: string;
}
