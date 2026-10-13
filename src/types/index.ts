export type PaymentMethod = 'CARD' | 'PSE' | 'NEQUI' | 'BANCOLOMBIA' | 'EFECTY';

export type PaymentStatus = 'APPROVED' | 'PENDING' | 'DECLINED' | 'VOIDED' | 'ERROR';

export type ShippingStatus = 'UNFULFILLED' | 'FULFILLED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface ProductVariant {
  id: string;
  sku: string;
  colorName: string;
  colorHex: string;
  size: string;
  priceInCents: number;
  originalPriceInCents?: number;
  stock: number;
  stockReserved: number;
  images: string[];
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  reference: string;
  category: string;
  subcategory?: string;
  badge?: string;
  discountPercentage?: number;
  rating: number;
  reviewsCount: number;
  description: string;
  features: string[];
  materials: string;
  shippingInfo: string;
  returnPolicy: string;
  active: boolean;
  variants: ProductVariant[];
  availableSizes: string[];
  availableColors: { name: string; hex: string }[];
  mainImage: string;
  thumbnailImages: string[];
  imagePosition?: string; // CSS object-position for product framing, e.g., 'center', '50% 20%', 'top', 'bottom'
  salesLast24h?: number;
  /** Fijado en la vitrina principal (no rota). Se administra en Catálogo. */
  showcasePinned?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  selectedColor: string;
  selectedSize: string;
  priceInCents: number;
  originalPriceInCents?: number;
  quantity: number;
  image: string;
  sku: string;
  product?: Product;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  productTitle: string;
  variantSku: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  unitPriceInCents: number;
  totalPriceInCents: number;
  image: string;
}

export interface CustomerInfo {
  email: string;
  fullName: string;
  phone: string;
  department: string;
  city: string;
  address: string;
  neighborhood: string;
  extraInfo?: string;
  wantsMarketingNewsletter?: boolean;
  createAccountAfterOrder?: boolean;
}

export interface WompiTransactionRecord {
  id: string;
  orderId: string;
  transactionId: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  amountInCents: number;
  currency: string;
  customerEmail: string;
  signature: string;
  rawPayload: Record<string, any>;
  processedAt: string;
  createdAt: string;
  paymentDetails?: {
    cardBrand?: string;
    lastFour?: string;
    installments?: number;
    pseBank?: string;
    nequiPhone?: string;
    efectyPin?: string;
    efectyAgreement?: string;
  };
}

export interface Order {
  id: string;
  reference: string; // e.g., #ORD-2026-0891
  customerId?: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotalInCents: number;
  discountInCents: number;
  shippingInCents: number;
  taxInCents: number;
  totalAmountInCents: number;
  currency: string;
  status: PaymentStatus;
  shippingStatus: ShippingStatus;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  wompiTransaction?: WompiTransactionRecord;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  city: string;
  totalOrders: number;
  ltvInCents: number;
  lastOrderDate: string;
  tier: 'VIP' | 'REGULAR' | 'NUEVO';
  avatarUrl?: string;
  vipPoints?: number;
  newsletterOptIn?: boolean;
  registeredAccount?: boolean;
}

export interface CustomerAddress {
  id: string;
  label: string; // e.g. 'Casa', 'Oficina', 'Apartamento'
  recipientName: string;
  phone: string;
  department: string;
  city: string;
  address: string;
  neighborhood: string;
  extraDetails?: string;
  isDefault: boolean;
}

export interface StockAlert {
  id: string;
  productId: string;
  productTitle: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
  image: string;
}

export interface ViralLook {
  id: string;
  creatorHandle: string;
  creatorAvatar: string;
  image: string;
  itemsCount: number;
  totalPriceInCents: number;
  itemsDescription: string;
  likesCount: number;
  products: {
    productId: string;
    title: string;
    size: string;
    color: string;
    priceInCents: number;
  }[];
}

export interface NotificationLog {
  id: string;
  type: 'PAYMENT_CONFIRMATION' | 'NEW_ORDER_ALERT' | 'SHIPMENT_UPDATE' | 'STOCK_WARNING' | 'WHATSAPP' | 'EMAIL' | 'SYSTEM';
  channel?: 'EMAIL' | 'WHATSAPP' | 'SYSTEM' | 'PUSH';
  recipient: string;
  subject: string;
  status: 'SENT' | 'FAILED' | 'RETRYING';
  read?: boolean;
  sentAt: string;
  orderReference?: string;
  orderId?: string;
  amountInCents?: number;
  customerName?: string;
  paymentMethod?: string;
  previewText: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number; // percentage e.g. 15 or fixed COP e.g. 30000
  minPurchaseInCents?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  active: boolean;
  description: string;
  createdAt?: string;
}

export interface ShippingGuide {
  id: string;
  orderId: string;
  orderReference: string;
  trackingNumber: string;
  carrier: 'COORDINADORA' | 'SERVIENTREGA' | 'ENVIA' | 'INTERRAPIDISIMO';
  originCity: string;
  destinationCity: string;
  destinationDepartment: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  declaredValueInCents: number;
  weightKg: number;
  itemsCount: number;
  status: 'GENERATED' | 'COLLECTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED';
  createdAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  productTitle?: string;
  authorName?: string;
  customerName?: string;
  authorCity?: string;
  city?: string;
  rating: number;
  title: string;
  comment: string;
  sizeBought?: string;
  verifiedPurchase: boolean;
  createdAt: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface AbandonedCheckout {
  id: string;
  cartToken: string;
  customer: {
    fullName?: string;
    email?: string;
    phone?: string;
    department?: string;
    city?: string;
    address?: string;
    neighborhood?: string;
  };
  items: CartItem[];
  subtotalInCents: number;
  discountInCents: number;
  shippingInCents: number;
  totalAmountInCents: number;
  currency: string;
  abandonedStage: 'cart' | 'customer_info' | 'shipping' | 'payment_gateway';
  lastActivityAt: string;
  status: 'ABANDONED' | 'CONTACTED' | 'RECOVERED' | 'ARCHIVED';
  recoveryCount: number;
  lastContactedAt?: string;
  recoveryNotes?: string;
  appliedCouponCode?: string;
  suggestedRecoveryCoupon?: string;
}

export type PolicyModalTab = 'terminos' | 'privacidad' | 'envios' | 'garantias' | 'tallas';

export interface StorePreferences {
  storeLegalName: string;
  storeBrandName: string;
  nitRUT: string;
  city: string;
  department: string;
  address: string;
  supportPhoneWhatsApp: string;
  supportEmail: string;
  instagramHandle: string;
  metaPixelId: string;
  googleAnalyticsId: string;
  tiktokPixelId: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  productionMode: boolean;
  currency: 'COP';
  freeShippingThresholdCOP: number;
  wompiPublicKey?: string;
  wompiPrivateKey?: string;
  wompiIntegritySecret?: string;
  wompiEventsSecret?: string;
  wompiEnvMode?: 'production' | 'sandbox';
  customDomain?: string;
  showTopTrustNotice?: boolean;
  showVerifiedBusinessBadge?: boolean;
  storeLogoUrl?: string;
  storeLogoHeight?: number;
}

export type AdminTab =
  | 'dashboard'
  | 'database-sync'
  | 'help-center'
  | 'domain-trust'
  | 'production-launch'
  | 'orders'
  | 'abandoned-checkouts'
  | 'catalog'
  | 'coupons'
  | 'shipping'
  | 'customers'
  | 'reviews'
  | 'wompi-reconciliation'
  | 'reports'
  | 'notifications'
  | 'whatsapp-business'
  | 'settings'
  | 'theme-builder'
  | 'music-player'
  | 'system-testing'
  | 'employees'
  | 'store-preview';

export interface WhatsAppBusinessConfig {
  enabled: boolean;
  provider: 'meta_cloud_api' | 'direct_gateway';
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  apiVersion: string;
  senderPhoneNumber: string;
  autoSendOnShipped: boolean;
  autoSendOnDelivered: boolean;
  autoSendOnApprovedPayment: boolean;
  templateShippedName: string;
  templateDeliveredName: string;
  customMessageShippedTemplate: string;
  customMessageDeliveredTemplate: string;
}

export interface WhatsAppMessageLog {
  id: string;
  orderId: string;
  orderReference: string;
  recipientPhone: string;
  recipientName: string;
  eventType: 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'ORDER_APPROVED' | 'ABANDONED_RECOVERY' | 'CUSTOM_NOTIFICATION';
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'SIMULATED';
  messageText: string;
  providerResponse?: {
    wamid?: string;
    error?: string;
  };
  sentAt: string;
}

export interface StoreMusicConfig {
  enabled: boolean;
  title: string;
  artist: string;
  genre: string;
  sourceType: 'preset' | 'custom_url' | 'synth_808';
  audioUrl: string;
  volume: number; // 0.0 - 1.0 (default 0.28)
  autoplayOnInteraction: boolean;
  loop: boolean;
  stealthMode: boolean; // Enables spy/stealth button mode on the customer storefront
}

export type ThemePresetKey = 'minimal' | 'luxury' | 'streetwear' | 'pastel' | 'cyber';

export interface NavCategoryLink {
  id: string;
  name: string;
  filter: string | null; // null means 'Novedades / Todo el catálogo'
  enabled?: boolean;
  badge?: string; // Optional chip like 'HOT', 'NEW', '450 GSM'
  icon?: string;
  customUrl?: string;
}

export interface StoreThemeConfig {
  id: string;
  name: string;
  preset: ThemePresetKey;
  description: string;
  author: string;
  version: string;
  /** Sello de migración: los guardados sin este valor se descartan y se usa el tema de marca actual. */
  themeSchema?: string;
  mode: 'light' | 'dark' | 'warm';
  fontFamily: 'sans' | 'serif' | 'mono';
  headingWeight: 'normal' | 'semibold' | 'bold' | 'black';
  borderRadius: 'none' | 'sm' | 'md' | 'full';
  primaryColor: string;
  primaryHover: string;
  backgroundColor: string;
  cardBackgroundColor: string;
  textColor: string;
  textMutedColor: string;
  accentColor: string;
  borderColor: string;
  headerStyle: 'minimal' | 'floating' | 'classic';
  // Navbar Category Links Management
  navCategoryLinks?: NavCategoryLink[];
  navbarMode?: 'custom' | 'auto';
  // Logo & Branding
  logoUrl?: string;
  logoHeight?: number; // Height in px (e.g. 24 - 80, default 36)
  showLogoImage?: boolean;
  /** Alias del panel (LogoCustomizer): mostrar nombre junto al logo. */
  showBrandNameWithLogo?: boolean;
  footerLogoUrl?: string;

  showAnnouncementBar: boolean;
  announcementText: string;
  heroStyle: 'minimal-split' | 'editorial-clean' | 'centered-spacious' | 'full-bleed';
  heroHeadline: string;
  heroSubheadline: string;
  heroTagline: string;
  heroSecondaryBadge?: string; // e.g. 'DROP EXCLUSIVO COLOMBIA'
  heroButtonText: string;
  heroSecondaryButtonText?: string; // e.g. 'Ver Hoodies Pesados'
  heroImageUrl: string;
  heroMediaType?: 'image' | 'video';
  /** Contenedor (una foto) o carrusel (galería rotativa). */
  heroDisplayMode?: 'container' | 'carousel';
  heroGalleryUrls?: string[];
  heroCarouselIntervalSec?: number;
  heroVideoUrl?: string;
  heroVideoPoster?: string;
  heroVideoFit?: 'contain' | 'cover' | 'fill' | 'auto'; // 'contain' displays entire video with 0 cropping
  heroVideoPosition?: 'center' | 'top' | 'bottom' | string;
  heroVideoPositionX?: number; // 0% to 100% horizontal focal point
  heroVideoPositionY?: number; // 0% to 100% vertical focal point
  heroVideoScale?: number; // 75% to 150% zoom scale
  heroVideoMobileFit?: 'contain' | 'cover' | 'auto';
  heroVideoAspectRatio?: 'auto' | '16/9' | '9/16' | '4/3' | '21/9';
  heroVideoSizeMB?: number;
  // Banner Image Framing & Sizing Controls (Prevent unwanted cropping on Desktop)
  heroBannerHeightDesktop?: 'compact' | 'medium' | 'large' | 'full' | 'custom';
  heroBannerCustomHeightDesktop?: number; // Custom height in px (e.g. 350 - 850)
  bannerDesktopHeight?: number; // Alias for direct px height
  heroImageFit?: 'cover' | 'contain' | 'auto';
  bannerImageFit?: 'cover' | 'contain' | 'auto';
  heroImagePositionX?: number; // 0% to 100% horizontal focal point
  heroImagePositionY?: number; // 0% to 100% vertical focal point
  bannerImagePosX?: number; // Alias for horizontal focal point
  bannerImagePosY?: number; // Alias for vertical focal point
  heroImageZoom?: number; // 75% to 200% zoom scale
  bannerImageZoom?: number; // Alias for zoom scale
  heroOverlayOpacity?: number; // 0% to 90% dark overlay opacity
  bannerOverlayOpacity?: number; // Alias for dark overlay opacity
  // Hero 3 Trust Badges
  heroTrust1Title?: string;
  heroTrust1Desc?: string;
  heroTrust2Title?: string;
  heroTrust2Desc?: string;
  heroTrust3Title?: string;
  heroTrust3Desc?: string;

  showHero: boolean;
  /** Mostrar/ocultar los textos sobre el banner (titular, subtítulo, etiquetas). */
  showHeroTexts?: boolean;
  /** Visibilidad granular por pieza (default visible). */
  showHeroTagline?: boolean;
  showHeroHeadline?: boolean;
  showHeroSubheadline?: boolean;
  showHeroButtons?: boolean;
  showHeroBadge?: boolean;
  showHeroTrust?: boolean;
  showCategories: boolean;
  categoriesStyle: 'pill-tabs' | 'minimal-grid' | 'dropdown';
  categoriesBadge?: string;
  categoriesTitle?: string;
  categoriesSubtitle?: string;

  showCatalog: boolean;
  catalogBadge?: string;
  catalogTitle: string;
  catalogSubtitle: string;
  productsPerRow: 2 | 3 | 4;
  productCardStyle: 'borderless-clean' | 'bordered' | 'card-elevated';
  showQuickViewBtn: boolean;
  showQuickAddSizes: boolean;
  /** Vitrina principal: fijos (pin) + rotación temporizada del resto. */
  showcaseEnabled?: boolean;
  showcaseTitle?: string;
  showcaseSubtitle?: string;
  showcaseRotateCount?: number;
  showcaseIntervalSec?: number;
  /** Orden manual de fijados (IDs). Los nuevos van primeros salvo este orden. */
  showcasePinnedIds?: string[];
  /** Nuevos primero en la rotación (default true). Si false: por ventas. */
  showcaseNewFirst?: boolean;

  showTrustBadges: boolean;
  trustSectionBadge?: string;
  trustSectionTitle?: string;
  trustSectionSubtitle?: string;
  trustFeature1Title?: string;
  trustFeature1Desc?: string;
  trustFeature2Title?: string;
  trustFeature2Desc?: string;
  trustFeature3Title?: string;
  trustFeature3Desc?: string;
  trustFeature4Title?: string;
  trustFeature4Desc?: string;

  showCommunityLooks: boolean;
  communityBadge?: string;
  communitySectionTitle?: string;
  communitySectionSubtitle?: string;
  communityInstagramMention?: string;

  showReviews?: boolean;
  reviewsBadge?: string;
  reviewsTitle?: string;
  reviewsSubtitle?: string;

  showNewsletter: boolean;
  newsletterTitle?: string;
  newsletterSubtitle?: string;
  footerStyle: 'minimal-columns' | 'compact-centered';
  footerBrandDescription?: string;
  footerLegalText?: string;
  footerCopyrightText?: string;
  footerInstagramUrl?: string;
  footerWhatsAppUrl?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'LOGISTICS_MANAGER' | 'FINANCE_MANAGER' | 'SALES_MANAGER' | 'CUSTOM';
  roleTitle: string;
  avatarInitials: string;
  lastLogin: string;
  pinCode?: string;
  phone?: string;
  department?: 'Logística' | 'Ventas' | 'Diseño' | 'Finanzas' | 'Soporte' | 'Administración';
  status?: 'active' | 'inactive';
  assignedModules?: AdminTab[];
}

