import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  Product,
  CartItem,
  Order,
  Customer,
  CustomerAddress,
  StockAlert,
  NotificationLog,
  PaymentMethod,
  PaymentStatus,
  ShippingStatus,
  WompiTransactionRecord,
  CustomerInfo,
  ViralLook,
  Coupon,
  ShippingGuide,
  ProductReview,
  AdminTab,
  AdminUser,
  StoreThemeConfig,
  AbandonedCheckout,
  PolicyModalTab,
  StorePreferences,
  StoreMusicConfig,
  WhatsAppBusinessConfig,
  WhatsAppMessageLog,
} from '../types';
import { BuilderBlock, PageLayout } from '../types/builder';
import { DEFAULT_BUILDER_BLOCKS, BUILDER_TEMPLATES } from '../data/builderTemplates';
import { DEFAULT_MUSIC_CONFIG } from '../data/musicPresets';
import {
  DEFAULT_WHATSAPP_CONFIG,
  sendWhatsAppOrderNotification as sendWhatsAppOrderNotificationApi,
  SendWhatsAppResult,
  buildWhatsAppDirectUrl,
} from '../lib/whatsappBusiness';

export type {
  AdminTab,
  AdminUser,
  StoreThemeConfig,
  BuilderBlock,
  PageLayout,
  AbandonedCheckout,
  PolicyModalTab,
  StorePreferences,
  StoreMusicConfig,
  WhatsAppBusinessConfig,
  WhatsAppMessageLog,
};
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_STOCK_ALERTS,
  INITIAL_NOTIFICATIONS,
  COMMUNITY_LOOKS,
  INITIAL_COUPONS,
  INITIAL_SHIPPING_GUIDES,
  INITIAL_REVIEWS,
  INITIAL_ADMIN_USERS,
  INITIAL_ABANDONED_CHECKOUTS,
} from '../data/mockDatabase';
import { PRESET_THEMES, DEFAULT_THEME, THEME_SCHEMA, LAYOUT_SCHEMA } from '../data/themes';
import { STRIKING_HERO_IMAGE } from '../data/heroAssets';
import { generateWompiIntegritySignature } from '../lib/wompi';
import { playOrderAlertSound } from '../lib/sound';
import {
  isSupabaseConfigured,
  syncOrderToSupabase,
  syncCustomerToSupabase,
  syncProductToSupabase,
  deleteProductFromSupabase,
  fetchProductsFromSupabase,
  fetchOrdersFromSupabase,
  syncPageLayoutToSupabase,
  fetchPageLayoutFromSupabase,
  syncThemeToSupabase,
  fetchThemeFromSupabase,
} from '../lib/supabase';
import { safeGet, safeSet } from '../lib/safeStorage';

export type ActiveView = 'login' | 'home' | 'product-detail' | 'checkout' | 'admin';

/**
 * IDs fijados en orden manual + rezagados con flag pero fuera de la lista.
 * Fuente única de orden para la vitrina.
 */
export function orderedShowcasePinnedIds(
  theme: Pick<StoreThemeConfig, 'showcasePinnedIds'> | null | undefined,
  products: Pick<Product, 'id' | 'active' | 'showcasePinned'>[]
): string[] {
  const valid = new Set(products.filter((p) => p.active !== false).map((p) => p.id));
  const ordered = (theme?.showcasePinnedIds || []).filter((id) => valid.has(id));
  const flagged = products
    .filter((p) => p.active !== false && p.showcasePinned && !ordered.includes(p.id))
    .map((p) => p.id);
  return [...ordered, ...flagged];
}

export interface AdminAnalytics {
  totalRevenueInCents: number;
  totalOrders: number;
  averageTicketInCents: number;
  conversionRate: number;
  growthRate: number;
  dailyRevenue: { day: string; revenue: number }[];
  paymentBreakdown: { name: string; value: number; color: string; amountInCents: number }[];
  todayRevenueInCents: number;
  todayOrdersCount: number;
  pendingOrdersCount: number;
  wompiSuccessRate: number;
}

interface StoreContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView, persist?: boolean) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  products: Product[];
  selectedProduct: Product;
  setSelectedProduct: (product: Product) => void;
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  openProductDetail: (product: Product) => void;
  /** IDs vistos recientemente (para el rail de retención). */
  recentlyViewedIds: string[];
  recordProductView: (productId: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updated: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  duplicateProduct: (productId: string) => void;
  setShowcasePinned: (productId: string, pinned: boolean) => void;
  moveShowcasePinned: (productId: string, dir: 1 | -1) => void;
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, qty: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  orders: Order[];
  createOrder: (
    customer: CustomerInfo,
    paymentMethod: PaymentMethod,
    paymentDetails?: any,
    couponCode?: string,
    initialStatus?: PaymentStatus
  ) => Promise<{ order: Order; transaction: WompiTransactionRecord }>;
  updateOrderStatus: (orderId: string, status: PaymentStatus, shippingStatus?: ShippingStatus) => void;
  updateShippingStatus: (orderId: string, shippingStatus: ShippingStatus, trackingNumber?: string) => void;
  selectedOrderForDetail: Order | null;
  setSelectedOrderForDetail: (order: Order | null) => void;
  customers: Customer[];
  stockAlerts: StockAlert[];
  notifications: NotificationLog[];
  unreadNotificationsCount: number;
  addNotification: (notif: Omit<NotificationLog, 'id' | 'sentAt'>) => void;
  markNotificationAsRead: (notifId: string) => void;
  markAllNotificationsAsRead: () => void;
  testAudioSound: () => void;
  coupons: Coupon[];
  appliedCoupon: string | null;
  setAppliedCoupon: (code: string | null) => void;
  applyCouponByCode: (code: string) => { success: boolean; message: string };
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (couponId: string, updated: Partial<Coupon>) => void;
  deleteCoupon: (couponId: string) => void;
  toggleCoupon: (couponId: string) => void;
  couponDiscountInCents: number;
  cartTotalInCents: number;
  cartSubtotalInCents: number;
  cartCount: number;
  shippingGuides: ShippingGuide[];
  generateShippingGuide: (
    orderId: string,
    carrier?: 'COORDINADORA' | 'SERVIENTREGA' | 'ENVIA' | 'INTERRAPIDISIMO'
  ) => ShippingGuide;
  updateShippingGuideStatus: (guideId: string, status: ShippingGuide['status']) => void;
  reviews: ProductReview[];
  addProductReview: (review: Omit<ProductReview, 'id' | 'createdAt'>) => void;
  updateReviewStatus: (reviewId: string, status: ProductReview['status']) => void;
  deleteReview: (reviewId: string) => void;
  activeCategoryFilter: string | null;
  setActiveCategoryFilter: (category: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  adminSearchQuery: string;
  setAdminSearchQuery: (q: string) => void;
  latestCompletedOrder: Order | null;
  setLatestCompletedOrder: (order: Order | null) => void;
  latestLiveAlertOrder: Order | null;
  dismissLiveAlert: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  simulateLiveOrder: () => void;
  webhookEventsCount: number;
  triggerSimulatedWebhook: (orderId: string, targetStatus: PaymentStatus) => void;
  processWompiWebhook: (payload: any) => void;
  updateProductStock: (productId: string, newStock: number) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  analytics: AdminAnalytics;
  looks: ViralLook[];
  adminUsers: AdminUser[];
  currentAdminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  /** 'server' = sesión verificada por backend; 'local' = modo estático sin backend. */
  adminAuthMode: 'server' | 'local' | null;
  adminLogin: (email: string, password?: string, pin?: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
  switchAdminUser: (userId: string) => void;
  addAdminUser: (userData: Omit<AdminUser, 'id' | 'lastLogin'>) => void;
  updateAdminUser: (userId: string, updates: Partial<AdminUser>) => void;
  deleteAdminUser: (userId: string) => void;
  hasModulePermission: (tab: AdminTab) => boolean;
  adminSidebarMobileOpen: boolean;
  setAdminSidebarMobileOpen: (open: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  // Theme Builder / WordPress-style Customizer
  themeConfig: StoreThemeConfig;
  setThemeConfig: (config: StoreThemeConfig) => void;
  updateThemeConfig: (partial: Partial<StoreThemeConfig>) => void;
  /** Publica el tema activo en Supabase (diseño global). */
  saveThemeToCloud: () => Promise<boolean>;
  availableThemes: StoreThemeConfig[];
  applyThemePreset: (presetId: string) => void;
  importThemeFromJson: (jsonString: string) => boolean;
  exportThemeJson: () => string;
  resetThemeToDefault: () => void;
  // Hero Image Position & Size Editor Modal
  isHeroImageEditorOpen: boolean;
  setIsHeroImageEditorOpen: (open: boolean) => void;
  openHeroImageEditor: () => void;
  closeHeroImageEditor: () => void;
  // Drag & Drop WordPress Visual Page Builder
  pageLayout: PageLayout;
  setPageLayout: (layout: PageLayout) => void;
  setPageBlocks: (blocks: BuilderBlock[]) => void;
  addBlock: (block: BuilderBlock, targetIndex?: number, parentId?: string, targetColumn?: 1 | 2) => void;
  updateBlock: (blockId: string, updates: Partial<BuilderBlock>) => void;
  deleteBlock: (blockId: string) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  duplicateBlock: (blockId: string) => void;
  applyBuilderTemplate: (templateId: string) => void;
  toggleStorefrontLayoutMode: (enabled?: boolean) => void;
  resetBuilderToDefault: () => void;
  // Customer Profile & Account Portal
  currentCustomer: Customer | null;
  isCustomerLoggedIn: boolean;
  customerLogin: (email: string, fullName?: string, phone?: string, city?: string) => void;
  customerLogout: () => void;
  customerAddresses: CustomerAddress[];
  addCustomerAddress: (address: Omit<CustomerAddress, 'id'>) => void;
  deleteCustomerAddress: (id: string) => void;
  setDefaultCustomerAddress: (id: string) => void;
  isCustomerProfileOpen: boolean;
  setIsCustomerProfileOpen: (open: boolean) => void;
  customerOrders: Order[];
  // Order Tracking for Customers (Direct Public Lookup - Zero Registration Required)
  isOrderTrackingOpen: boolean;
  setIsOrderTrackingOpen: (open: boolean) => void;
  trackingQuery: string;
  setTrackingQuery: (query: string) => void;
  openOrderTracking: (queryOrRef?: string) => void;
  // Abandoned Checkouts & Recovery
  abandonedCheckouts: AbandonedCheckout[];
  saveAbandonedCheckout: (data: Partial<AbandonedCheckout> & { cartToken?: string; customer?: any; items?: CartItem[] }) => void;
  markAbandonedCheckoutContacted: (id: string, channel?: 'WHATSAPP' | 'EMAIL', notes?: string) => void;
  markAbandonedCheckoutRecovered: (id: string) => void;
  deleteAbandonedCheckout: (id: string) => void;
  restoreAbandonedCart: (id: string) => void;
  simulateAbandonedCheckout: () => void;
  sendAbandonedRecoveryWhatsApp: (checkout: AbandonedCheckout, couponCode?: string, customMessage?: string) => string;
  // Store Legal Policies Modal
  policyModalState: { isOpen: boolean; activeTab: PolicyModalTab };
  openPolicyModal: (tab?: PolicyModalTab) => void;
  closePolicyModal: () => void;
  // Contextual Admin Help Assistant & Drawer
  adminHelpDrawerOpen: boolean;
  setAdminHelpDrawerOpen: (open: boolean) => void;
  adminHelpTopic: string;
  setAdminHelpTopic: (topic: string) => void;
  openAdminHelp: (topic?: string) => void;
  // System Video Tutorials & Screencast Player
  systemVideoTutorialOpen: boolean;
  setSystemVideoTutorialOpen: (open: boolean) => void;
  activeSystemVideoId: string;
  setActiveSystemVideoId: (id: string) => void;
  openSystemVideoTutorial: (videoId?: string) => void;
  closeSystemVideoTutorial: () => void;
  // Printable Commercial Invoice & Packing Slip
  printableInvoiceOrder: Order | null;
  setPrintableInvoiceOrder: (order: Order | null) => void;
  // Store Preferences (SEO, Pixels, Business Tax Info)
  storePreferences: StorePreferences;
  updateStorePreferences: (partial: Partial<StorePreferences>) => void;
  // Store Music & Soundtrack Engine
  musicConfig: StoreMusicConfig;
  setMusicConfig: (config: StoreMusicConfig) => void;
  updateMusicConfig: (partial: Partial<StoreMusicConfig>) => void;
  isMusicPlaying: boolean;
  setIsMusicPlaying: (playing: boolean) => void;
  toggleMusicPlayback: () => void;
  stopMusicPlayback: () => void;
  musicVolume: number;
  setMusicVolume: (vol: number) => void;
  // WhatsApp Business Cloud API Integration Service
  whatsappConfig: WhatsAppBusinessConfig;
  setWhatsAppConfig: (config: WhatsAppBusinessConfig) => void;
  updateWhatsAppConfig: (partial: Partial<WhatsAppBusinessConfig>) => void;
  whatsappLogs: WhatsAppMessageLog[];
  sendOrderWhatsAppNotification: (
    orderId: string,
    eventType: 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'ORDER_APPROVED',
    customCarrier?: string,
    customTracking?: string
  ) => Promise<SendWhatsAppResult | null>;
  testWhatsAppMessage: (phone: string, text: string) => Promise<boolean>;
  // Database & System Maintenance
  clearDatabase: () => void;
  resetSystemToDemo: () => void;
}

const DEFAULT_STORE_PREFERENCES: StorePreferences = {
  storeLegalName: 'TU TIENDA A LA MANO S.A.S.',
  storeBrandName: 'TU TIENDA A LA MANO',
  nitRUT: 'NIT 901.834.129-4',
  city: 'Medellín',
  department: 'Antioquia',
  address: 'Cra 35 # 8A-42, El Poblado',
  supportPhoneWhatsApp: '+57 300 987 6543',
  supportEmail: 'contacto@tutiendaalamano.co',
  instagramHandle: '@tutiendaalamano',
  metaPixelId: '948271039481729',
  googleAnalyticsId: 'G-MANO2026',
  tiktokPixelId: 'TT-MANO-COL',
  seoTitle: 'TU TIENDA A LA MANO | Compra fácil y pago seguro en Colombia',
  seoDescription: 'Tu Tienda a la Mano en Colombia: catálogo con precios claros, compra en pocos clics y pagos seguros con Wompi, Nequi y PSE. Envíos a todo el país.',
  seoKeywords: 'tienda online colombia, comprar por internet colombia, pago wompi, nequi, pse, envíos nacionales',
  productionMode: true,
  currency: 'COP',
  freeShippingThresholdCOP: 200000,
  wompiPublicKey: 'pub_prod_hlVp9WgGN0kWFjDJjNx4wQbDxq1RF0Gw',
  // Los secretos (privada, integridad, eventos) viven SOLO en el servidor.
  // Estos campos quedan para compatibilidad y deben permanecer vacíos.
  wompiPrivateKey: '',
  wompiIntegritySecret: '',
  wompiEventsSecret: '',
  wompiEnvMode: 'production',
  customDomain: 'tutiendaalamano.com',
  showTopTrustNotice: true,
  showVerifiedBusinessBadge: true,
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Store Legal Policies Modal State
  const [policyModalState, setPolicyModalState] = useState<{
    isOpen: boolean;
    activeTab: PolicyModalTab;
  }>({
    isOpen: false,
    activeTab: 'terminos',
  });

  const openPolicyModal = (tab: PolicyModalTab = 'terminos') => {
    setPolicyModalState({ isOpen: true, activeTab: tab });
  };

  const closePolicyModal = () => {
    setPolicyModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // Printable Invoice & Remisión State
  const [printableInvoiceOrder, setPrintableInvoiceOrder] = useState<Order | null>(null);

  // Store Preferences (SEO, Pixels, Legal Data) with localStorage persistence
  const [storePreferences, setStorePreferences] = useState<StorePreferences>(() => {
    try {
      const saved = localStorage.getItem('opus_store_preferences_v1');
      if (saved) {
        const merged = { ...DEFAULT_STORE_PREFERENCES, ...JSON.parse(saved) };
        // Migración de rebrand: si lo guardado trae la marca anterior, se
        // actualizan solo los campos de marca y se conserva el resto.
        const brandFields: (keyof StorePreferences)[] = [
          'storeLegalName',
          'storeBrandName',
          'supportEmail',
          'instagramHandle',
          'googleAnalyticsId',
          'tiktokPixelId',
          'seoTitle',
          'seoDescription',
          'seoKeywords',
          'customDomain',
        ];
        for (const field of brandFields) {
          const current = String((merged as any)[field] || '');
          if (/opus/i.test(current)) {
            (merged as any)[field] = (DEFAULT_STORE_PREFERENCES as any)[field];
          }
        }
        return merged;
      }
    } catch {
      // ignore
    }
    return DEFAULT_STORE_PREFERENCES;
  });

  const updateStorePreferences = (partial: Partial<StorePreferences>) => {
    setStorePreferences((prev) => {
      const updated = { ...prev, ...partial };
      try {
        localStorage.setItem('opus_store_preferences_v1', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const [activeView, setActiveViewState] = useState<ActiveView>(() => {
    try {
      if (typeof window !== 'undefined') {
        const search = window.location.search.toLowerCase();
        const hash = window.location.hash.toLowerCase();

        // 1. If link is explicitly shared for clients / customers
        if (
          hash === '#store' ||
          hash === '#tienda' ||
          hash === '#catalogo' ||
          hash === '#home' ||
          hash.startsWith('#rastreo') ||
          hash.startsWith('#pedido') ||
          search.includes('view=store') ||
          search.includes('store=1') ||
          search.includes('client=1') ||
          search.includes('ref=client') ||
          search.includes('ref=store') ||
          search.includes('coupon=')
        ) {
          return 'home';
        }

        // 2. Checkout link
        if (hash === '#checkout' || search.includes('view=checkout')) {
          return 'checkout';
        }

        // 3. Admin route: la sesión se valida async contra el backend;
        // por defecto se pide login y el usuario entra tras autenticarse.
        if (hash === '#admin' || hash === '#/admin' || search.includes('admin=1') || search.includes('admin=true')) {
          return 'admin';
        }

        // 4. Sin ruta conocida: restaura la última vista (recargar no saca
        // de la tienda ni del checkout; admin requiere sesión válida).
        const last = sessionStorage.getItem('opus_last_view');
        if (last === 'home' || last === 'product-detail' || last === 'checkout' || last === 'admin') {
          return last;
        }

        // 5. Default: First entry always goes to Login Gateway
        return 'login';
      }
    } catch {
      // fallback
    }
    // Default entry to the system: Login Gateway
    return 'login';
  });

  const setActiveView = (view: ActiveView, persist: boolean = true) => {
    setActiveViewState(view);
    if (!persist) return;
    try {
      sessionStorage.setItem('opus_last_view', view);
    } catch {
      // ignore
    }
  };
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [products, setProductsState] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('opus_products_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_PRODUCTS;
  });

  const productsRef = useRef<Product[]>([]);
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  const setProducts = (value: Product[] | ((prev: Product[]) => Product[])) => {
    setProductsState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      try {
        localStorage.setItem('opus_products_v2', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const [selectedProduct, setSelectedProduct] = useState<Product>(() => {
    try {
      const saved = localStorage.getItem('opus_products_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_PRODUCTS[0];
  });
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Theme configuration state with localStorage persistence
  const [availableThemes, setAvailableThemes] = useState<StoreThemeConfig[]>(() => {
    try {
      const savedCustom = localStorage.getItem('opus_custom_themes');
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = [...PRESET_THEMES];
          parsed.forEach((t: StoreThemeConfig) => {
            if (!merged.some((m) => m.id === t.id)) {
              merged.push(t);
            }
          });
          return merged;
        }
      }
    } catch {
      // ignore parse error
    }
    return PRESET_THEMES;
  });

  const [themeConfig, setThemeConfigState] = useState<StoreThemeConfig>(() => {    try {
      const saved = localStorage.getItem('opus_active_theme_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migración de rebrand: sin el sello de marca actual se descarta lo
        // guardado y se aplica el tema nuevo (las claves opus_* se conservan).
        if (parsed && typeof parsed === 'object' && parsed.themeSchema === THEME_SCHEMA) {
          return { ...DEFAULT_THEME, ...parsed };
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_THEME;
  });

  const themeConfigRef = useRef<StoreThemeConfig | null>(null);
  useEffect(() => {
    themeConfigRef.current = themeConfig;
  }, [themeConfig]);

  useEffect(() => {
    if (themeConfig.mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeConfig.mode]);

  const setThemeConfig = (newConfig: StoreThemeConfig) => {
    // Merge with DEFAULT_THEME to make sure all properties exist cleanly
    const fullConfig: StoreThemeConfig = { ...DEFAULT_THEME, ...newConfig, themeSchema: THEME_SCHEMA };
    setThemeConfigState(fullConfig);

    try {
      localStorage.setItem('opus_active_theme_config', JSON.stringify(fullConfig));
      localStorage.setItem('opus_theme_saved_at', new Date().toISOString());
    } catch {
      // ignore
    }

    // Sync Page Builder blocks if pageLayout is active.
    // Solo se sincroniza la imagen de portada: los textos y botones del bloque
    // son independientes para que no se borren ni queden estáticos al cambiar de tema.
    const newImg = fullConfig.heroImageUrl || STRIKING_HERO_IMAGE;
    setPageLayoutState((currentLayout) => {
      if (!currentLayout || !currentLayout.blocks) return currentLayout;
      const updatedBlocks = currentLayout.blocks.map((blk) => {
        if (blk.id === 'block-banner-1' || blk.type === 'banner') {
          return {
            ...blk,
            imageUrl: newImg,
          };
        }
        return blk;
      });
      const nextLayout = { ...currentLayout, blocks: updatedBlocks, updatedAt: new Date().toISOString() };
      try {
        localStorage.setItem('opus_page_layout_v1', JSON.stringify(nextLayout));
      } catch {
        // ignore
      }
      if (isSupabaseConfigured()) {
        syncPageLayoutToSupabase(nextLayout);
      }
      return nextLayout;
    });

    if (isSupabaseConfigured()) {
      syncThemeToSupabase(fullConfig).catch(() => undefined);
    }

    showToast(`🎨 Tema "${fullConfig.name}" aplicado e instalado con éxito.`);
  };

  const updateThemeConfig = (partial: Partial<StoreThemeConfig>) => {
    setThemeConfigState((prev) => {
      const updated = { ...prev, ...partial, themeSchema: THEME_SCHEMA };
      try {
        localStorage.setItem('opus_active_theme_config', JSON.stringify(updated));
        localStorage.setItem('opus_theme_saved_at', new Date().toISOString());
      } catch {
        // ignore
      }

      // Sincronizar en tiempo real solo la imagen del banner del Page Builder.
      // Los títulos, subtítulos y botones del bloque no se tocan: son
      // independientes del hero para que sigan funcionales al cambiar de tema.
      if (partial.heroImageUrl || partial.bannerDesktopHeight) {
        setPageLayoutState((currentLayout) => {
          if (!currentLayout || !currentLayout.blocks) return currentLayout;
          const updatedBlocks = currentLayout.blocks.map((blk) => {
            if (blk.id === 'block-banner-1' || blk.type === 'banner') {
              return {
                ...blk,
                imageUrl: partial.heroImageUrl || blk.imageUrl,
              };
            }
            return blk;
          });
          const nextLayout = { ...currentLayout, blocks: updatedBlocks, updatedAt: new Date().toISOString() };
          try {
            localStorage.setItem('opus_page_layout_v1', JSON.stringify(nextLayout));
          } catch {
            // ignore
          }
          if (isSupabaseConfigured()) {
            syncPageLayoutToSupabase(nextLayout);
          }
          return nextLayout;
        });
      }

      // Sincronizar con Supabase en segundo plano si está configurado
      if (isSupabaseConfigured()) {
        syncThemeToSupabase(updated).catch((err) => {
          console.warn('Error al auto-sincronizar tema con Supabase:', err);
        });
      }

      return updated;
    });
    showToast(`✨ Cambios visuales guardados y aplicados.`);
  };

  const saveThemeToCloud = async (): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      showToast('⚠️ Sin Supabase: el diseño solo queda en este navegador.');
      return false;
    }
    try {
      // localStorage tiene lo más fresco (updateThemeConfig persiste sincrónico).
      let current: StoreThemeConfig = themeConfig;
      try {
        const raw = localStorage.getItem('opus_active_theme_config');
        if (raw) current = { ...themeConfig, ...JSON.parse(raw) };
      } catch {
        // usa el estado
      }
      const ok = await syncThemeToSupabase({ ...current, themeSchema: THEME_SCHEMA });
      showToast(ok ? '☁️ Diseño publicado en la nube.' : '⚠️ No se pudo publicar el diseño.');
      return ok;
    } catch {
      showToast('⚠️ No se pudo publicar el diseño.');
      return false;
    }
  };

  const applyThemePreset = (presetId: string) => {
    const found = availableThemes.find((t) => t.id === presetId) || PRESET_THEMES.find((t) => t.id === presetId);
    if (found) {
      setThemeConfig(found);
    }
  };

  const importThemeFromJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString) as StoreThemeConfig;
      if (!parsed.id || !parsed.name || !parsed.primaryColor) {
        showToast(`❌ El archivo JSON no tiene el formato de tema válido.`);
        return false;
      }
      // Ensure unique id
      const uniqueId = `theme-imported-${Date.now()}`;
      const newTheme: StoreThemeConfig = {
        ...parsed,
        id: uniqueId,
        name: parsed.name.includes('(Importado)') ? parsed.name : `${parsed.name} (Importado)`,
      };

      const updatedThemes = [...availableThemes, newTheme];
      setAvailableThemes(updatedThemes);
      setThemeConfig(newTheme);

      try {
        localStorage.setItem('opus_custom_themes', JSON.stringify(updatedThemes));
      } catch {
        // ignore
      }
      showToast(`🚀 ¡Tema "${newTheme.name}" importado y activado con éxito!`);
      return true;
    } catch (e: any) {
      showToast(`❌ Error al importar tema: Formato JSON inválido.`);
      return false;
    }
  };

  const exportThemeJson = (): string => {
    return JSON.stringify(themeConfig, null, 2);
  };

  const resetThemeToDefault = () => {
    setThemeConfig(DEFAULT_THEME);
    showToast(`🔄 Restaurado al tema Tu Tienda a la Mano por defecto.`);
  };

  // Store Music & Soundtrack State
  const [musicConfig, setMusicConfigState] = useState<StoreMusicConfig>(() => {
    try {
      const saved = localStorage.getItem('opus_music_config_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.enabled === 'boolean') {
          return { ...DEFAULT_MUSIC_CONFIG, ...parsed };
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_MUSIC_CONFIG;
  });

  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolumeState] = useState<number>(() => musicConfig.volume ?? 0.28);

  const setMusicConfig = (newConfig: StoreMusicConfig) => {
    setMusicConfigState(newConfig);
    try {
      localStorage.setItem('opus_music_config_v1', JSON.stringify(newConfig));
    } catch {
      // ignore
    }
    showToast(`🎵 Banda sonora actualizada: "${newConfig.title}".`);
  };

  const updateMusicConfig = (partial: Partial<StoreMusicConfig>) => {
    setMusicConfigState((prev) => {
      const updated = { ...prev, ...partial };
      try {
        localStorage.setItem('opus_music_config_v1', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const setMusicVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setMusicVolumeState(clamped);
    updateMusicConfig({ volume: clamped });
  };

  const toggleMusicPlayback = () => {
    setIsMusicPlaying((prev) => !prev);
  };

  const stopMusicPlayback = () => {
    setIsMusicPlaying(false);
  };

  // WhatsApp Business Cloud API Integration State
  const [whatsappConfig, setWhatsAppConfigState] = useState<WhatsAppBusinessConfig>(() => {
    try {
      const saved = localStorage.getItem('opus_whatsapp_config_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.enabled === 'boolean') {
          return { ...DEFAULT_WHATSAPP_CONFIG, ...parsed };
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_WHATSAPP_CONFIG;
  });

  const [whatsappLogs, setWhatsAppLogs] = useState<WhatsAppMessageLog[]>(() => {
    try {
      const saved = localStorage.getItem('opus_whatsapp_logs_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [
      {
        id: 'wlog-init-1',
        orderId: 'ord-101',
        orderReference: 'OPUS-2026-8941',
        recipientPhone: '573001234567',
        recipientName: 'Mateo Restrepo',
        eventType: 'ORDER_SHIPPED',
        status: 'DELIVERED',
        messageText: '🔥 ¡Hola Mateo! Tu pedido de TU TIENDA A LA MANO (OPUS-2026-8941) ya va en camino hacia Medellín por Coordinadora...',
        providerResponse: { wamid: 'wamid.HBgLMjAyNjA5MTYwODAwMTE' },
        sentAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'wlog-init-2',
        orderId: 'ord-102',
        orderReference: 'OPUS-2026-8942',
        recipientPhone: '573159876543',
        recipientName: 'Valentina Gómez',
        eventType: 'ORDER_DELIVERED',
        status: 'READ',
        messageText: '🎉 ¡Hola Valentina! Tu pedido OPUS-2026-8942 de TU TIENDA A LA MANO ha sido ENTREGADO en Bogotá D.C...',
        providerResponse: { wamid: 'wamid.HBgLMjAyNjA5MTYwODAwMTI' },
        sentAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      },
    ];
  });

  const setWhatsAppConfig = (newConfig: WhatsAppBusinessConfig) => {
    setWhatsAppConfigState(newConfig);
    try {
      localStorage.setItem('opus_whatsapp_config_v1', JSON.stringify(newConfig));
    } catch {}
    showToast('⚙️ Configuración de WhatsApp Business API guardada.');
  };

  const updateWhatsAppConfig = (partial: Partial<WhatsAppBusinessConfig>) => {
    setWhatsAppConfigState((prev) => {
      const updated = { ...prev, ...partial };
      try {
        localStorage.setItem('opus_whatsapp_config_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const addWhatsAppLog = (log: Omit<WhatsAppMessageLog, 'id'>) => {
    const newEntry: WhatsAppMessageLog = {
      ...log,
      id: `wlog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setWhatsAppLogs((prev) => {
      const updated = [newEntry, ...prev.slice(0, 99)];
      try {
        localStorage.setItem('opus_whatsapp_logs_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const sendOrderWhatsAppNotification = async (
    orderId: string,
    eventType: 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'ORDER_APPROVED',
    customCarrier?: string,
    customTracking?: string
  ): Promise<SendWhatsAppResult | null> => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) {
      showToast('⚠️ No se encontró la orden para enviar notificación WhatsApp.');
      return null;
    }

    try {
      const result = await sendWhatsAppOrderNotificationApi(
        targetOrder,
        eventType,
        whatsappConfig,
        customCarrier,
        customTracking
      );

      // Register in WhatsApp Logs
      addWhatsAppLog({
        orderId: targetOrder.id,
        orderReference: targetOrder.reference,
        recipientPhone: targetOrder.customer.phone,
        recipientName: targetOrder.customer.fullName,
        eventType,
        status: result.status,
        messageText: result.formattedText,
        providerResponse: {
          wamid: result.wamid,
          error: result.error,
        },
        sentAt: new Date().toISOString(),
      });

      // Register in Audit Notification Center
      addNotification({
        type: 'WHATSAPP',
        channel: 'WHATSAPP',
        recipient: targetOrder.customer.phone,
        subject: `WhatsApp Business: ${
          eventType === 'ORDER_SHIPPED' ? 'Despacho enviado' : 'Confirmación de entrega'
        } (${targetOrder.reference})`,
        status: 'SENT',
        read: false,
        orderId: targetOrder.id,
        orderReference: targetOrder.reference,
        amountInCents: targetOrder.totalAmountInCents,
        customerName: targetOrder.customer.fullName,
        previewText: result.formattedText.slice(0, 110) + '...',
      });

      return result;
    } catch (err: any) {
      console.error('Error sending WhatsApp order notification:', err);
      return null;
    }
  };

  const testWhatsAppMessage = async (phone: string, text: string): Promise<boolean> => {
    try {
      const directUrl = buildWhatsAppDirectUrl(phone, text);
      addWhatsAppLog({
        orderId: 'TEST-MSG',
        orderReference: 'TEST-MANUAL',
        recipientPhone: phone,
        recipientName: 'Prueba Manual',
        eventType: 'CUSTOM_NOTIFICATION',
        status: 'SENT',
        messageText: text,
        providerResponse: { wamid: `wamid.TEST_${Date.now()}` },
        sentAt: new Date().toISOString(),
      });
      showToast('📲 Mensaje de prueba generado y registrado en auditoría.');
      return true;
    } catch {
      return false;
    }
  };

  // WordPress Drag & Drop Page Builder Layout State
  // Aviso único de fallo de sincronización del maquetador (evita spam por tecla).
  const layoutSyncFailedRef = useRef(false);

  const [pageLayout, setPageLayoutState] = useState<PageLayout>(() => {
    try {
      const saved = localStorage.getItem('opus_page_layout_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migración de rebrand: sin el sello se descarta el diseño viejo
        // (bloques con textos/colores de la marca anterior).
        if (parsed && Array.isArray(parsed.blocks) && parsed.blocks.length > 0 && parsed.layoutSchema === LAYOUT_SCHEMA) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return {
      id: 'layout-official',
      name: 'Diseño Gutenberg Drag & Drop Oficial',
      enabledInStorefront: false,
      blocks: DEFAULT_BUILDER_BLOCKS,
      updatedAt: new Date().toISOString(),
      layoutSchema: LAYOUT_SCHEMA,
    };
  });

  const savePageLayoutToStorage = (updated: PageLayout) => {
    const stamped = { ...updated, layoutSchema: LAYOUT_SCHEMA };
    setPageLayoutState(stamped);
    try {
      localStorage.setItem('opus_page_layout_v1', JSON.stringify(stamped));
    } catch {
      // ignore
    }
    if (isSupabaseConfigured()) {
      // No se espera: el guardado local ya quedó. Si la nube falla se avisa
      // una sola vez (sin spam por cada tecla) para no perder el diseño.
      syncPageLayoutToSupabase(stamped).then((ok) => {
        if (!ok && !layoutSyncFailedRef.current) {
          layoutSyncFailedRef.current = true;
          showToast('⚠️ Diseño guardado en este equipo; la nube no respondió. Revisa conexión o permisos.');
        } else if (ok && layoutSyncFailedRef.current) {
          layoutSyncFailedRef.current = false;
        }
      });
    }
  };

  // Cargar layout, productos y pedidos desde Supabase al iniciar si existe
  useEffect(() => {
    if (isSupabaseConfigured()) {
      // Tema: la nube manda si es más nueva (diseño global entre dispositivos).
      // Solo se acepta si trae el sello de marca actual (migración de rebrand).
      fetchThemeFromSupabase().then((remote) => {
        if (remote && remote.theme && typeof remote.theme === 'object' && (remote.theme as any).themeSchema === THEME_SCHEMA) {
          try {
            const localSavedAt = localStorage.getItem('opus_theme_saved_at') || '';
            if (!localSavedAt || remote.updatedAt > localSavedAt) {
              setThemeConfigState((prev) => ({ ...prev, ...remote.theme }));
              localStorage.setItem(
                'opus_active_theme_config',
                JSON.stringify({ ...DEFAULT_THEME, ...remote.theme })
              );
              localStorage.setItem('opus_theme_saved_at', remote.updatedAt);
            }
          } catch {
            // ignore
          }
        }
      });

      fetchPageLayoutFromSupabase().then((remoteLayout) => {
        if (remoteLayout && Array.isArray(remoteLayout.blocks) && remoteLayout.blocks.length > 0) {
          try {
            // La copia local manda si es más nueva: evita que la nube añeja
            // borre ediciones del maquetador al recargar (igual que el tema).
            const saved = localStorage.getItem('opus_page_layout_v1');
            const localUpdatedAt = saved ? (JSON.parse(saved).updatedAt || '') : '';
            if (!localUpdatedAt || (remoteLayout.updatedAt || '') > localUpdatedAt) {
              setPageLayoutState(remoteLayout);
              localStorage.setItem('opus_page_layout_v1', JSON.stringify(remoteLayout));
            }
          } catch {
            setPageLayoutState(remoteLayout);
          }
        }
      });

      fetchProductsFromSupabase().then((remoteProducts) => {
        if (remoteProducts && Array.isArray(remoteProducts) && remoteProducts.length > 0) {
          setProducts((currentLocal) => {
            if (!currentLocal || currentLocal.length === 0) {
              return remoteProducts;
            }
            const map = new Map<string, Product>();
            // Agregar remotos primero
            remoteProducts.forEach((rp: Product) => map.set(rp.id, rp));
            // Superponer locales para no perder ediciones del usuario
            currentLocal.forEach((lp: Product) => map.set(lp.id, lp));
            return Array.from(map.values());
          });
        }
      });

      fetchOrdersFromSupabase().then((remoteOrders) => {
        if (remoteOrders && Array.isArray(remoteOrders) && remoteOrders.length > 0) {
          setOrders(remoteOrders);
        }
      });
    }
  }, []);

  const setPageLayout = (layout: PageLayout) => {
    savePageLayoutToStorage(layout);
  };

  const setPageBlocks = (blocks: BuilderBlock[]) => {
    savePageLayoutToStorage({
      ...pageLayout,
      blocks,
      updatedAt: new Date().toISOString(),
    });
  };

  const addBlock = (
    newBlock: BuilderBlock,
    targetIndex?: number,
    parentId?: string,
    targetColumn?: 1 | 2
  ) => {
    const blockWithId: BuilderBlock = {
      ...newBlock,
      id: newBlock.id || `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    if (parentId) {
      const addToParent = (blocks: BuilderBlock[]): BuilderBlock[] => {
        return blocks.map((b) => {
          if (b.id === parentId) {
            if (targetColumn === 2) {
              const currentCol2 = b.childrenColumn2 || [];
              const idx = typeof targetIndex === 'number' ? targetIndex : currentCol2.length;
              const nextCol2 = [...currentCol2];
              nextCol2.splice(idx, 0, blockWithId);
              return { ...b, childrenColumn2: nextCol2 };
            } else {
              const currentKids = b.children || [];
              const idx = typeof targetIndex === 'number' ? targetIndex : currentKids.length;
              const nextKids = [...currentKids];
              nextKids.splice(idx, 0, blockWithId);
              return { ...b, children: nextKids };
            }
          }
          return {
            ...b,
            children: b.children ? addToParent(b.children) : undefined,
            childrenColumn2: b.childrenColumn2 ? addToParent(b.childrenColumn2) : undefined,
          };
        });
      };
      setPageBlocks(addToParent(pageLayout.blocks));
    } else {
      const current = [...pageLayout.blocks];
      const idx = typeof targetIndex === 'number' ? targetIndex : current.length;
      current.splice(idx, 0, blockWithId);
      setPageBlocks(current);
    }
    showToast(`🧩 Bloque "${newBlock.type}" añadido.`);
  };

  const updateBlock = (blockId: string, updates: Partial<BuilderBlock>) => {
    const updateRecursively = (blocks: BuilderBlock[]): BuilderBlock[] => {
      return blocks.map((b) => {
        if (b.id === blockId) {
          return { ...b, ...updates };
        }
        return {
          ...b,
          children: b.children ? updateRecursively(b.children) : undefined,
          childrenColumn2: b.childrenColumn2 ? updateRecursively(b.childrenColumn2) : undefined,
        };
      });
    };
    setPageBlocks(updateRecursively(pageLayout.blocks));
  };

  const deleteBlock = (blockId: string) => {
    const deleteRecursively = (blocks: BuilderBlock[]): BuilderBlock[] => {
      return blocks
        .filter((b) => b.id !== blockId)
        .map((b) => ({
          ...b,
          children: b.children ? deleteRecursively(b.children) : undefined,
          childrenColumn2: b.childrenColumn2 ? deleteRecursively(b.childrenColumn2) : undefined,
        }));
    };
    setPageBlocks(deleteRecursively(pageLayout.blocks));
    showToast(`🗑️ Bloque eliminado.`);
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= pageLayout.blocks.length ||
      toIndex >= pageLayout.blocks.length
    ) {
      return;
    }
    const next = [...pageLayout.blocks];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setPageBlocks(next);
  };

  const duplicateBlock = (blockId: string) => {
    const cloneBlock = (b: BuilderBlock): BuilderBlock => ({
      ...b,
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      children: b.children ? b.children.map(cloneBlock) : undefined,
      childrenColumn2: b.childrenColumn2 ? b.childrenColumn2.map(cloneBlock) : undefined,
    });

    const duplicateInArray = (blocks: BuilderBlock[]): BuilderBlock[] => {
      const idx = blocks.findIndex((b) => b.id === blockId);
      if (idx !== -1) {
        const cloned = cloneBlock(blocks[idx]);
        const next = [...blocks];
        next.splice(idx + 1, 0, cloned);
        return next;
      }
      return blocks.map((b) => ({
        ...b,
        children: b.children ? duplicateInArray(b.children) : undefined,
        childrenColumn2: b.childrenColumn2 ? duplicateInArray(b.childrenColumn2) : undefined,
      }));
    };

    setPageBlocks(duplicateInArray(pageLayout.blocks));
    showToast(`📋 Bloque duplicado.`);
  };

  const applyBuilderTemplate = (templateId: string) => {
    const found = BUILDER_TEMPLATES.find((t) => t.id === templateId);
    if (found) {
      const clonedBlocks = JSON.parse(JSON.stringify(found.blocks));
      savePageLayoutToStorage({
        ...pageLayout,
        name: found.name,
        blocks: clonedBlocks,
        updatedAt: new Date().toISOString(),
      });
      showToast(`✨ Plantilla "${found.name}" aplicada correctamente.`);
    }
  };

  const toggleStorefrontLayoutMode = (enabled?: boolean) => {
    const nextVal = typeof enabled === 'boolean' ? enabled : !pageLayout.enabledInStorefront;
    savePageLayoutToStorage({
      ...pageLayout,
      enabledInStorefront: nextVal,
      updatedAt: new Date().toISOString(),
    });
    showToast(
      nextVal
        ? `🚀 ¡Diseño Drag & Drop activado en la tienda pública!`
        : `🔄 Tienda pública en modo estándar.`
    );
  };

  const resetBuilderToDefault = () => {
    savePageLayoutToStorage({
      id: 'layout-official',
      name: 'Diseño Gutenberg Drag & Drop Oficial',
      enabledInStorefront: pageLayout.enabledInStorefront,
      blocks: DEFAULT_BUILDER_BLOCKS,
      updatedAt: new Date().toISOString(),
    });
    showToast(`🔄 Bloques restaurados a la configuración inicial.`);
  };

  const exportPageLayoutJson = (): string => {
    return JSON.stringify(pageLayout, null, 2);
  };

  const importPageLayoutJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || !Array.isArray(parsed.blocks)) {
        showToast(`❌ El archivo no contiene bloques válidos.`);
        return false;
      }
      savePageLayoutToStorage({
        id: `layout-${Date.now()}`,
        name: parsed.name || 'Diseño Importado',
        enabledInStorefront: !!parsed.enabledInStorefront,
        blocks: parsed.blocks,
        updatedAt: new Date().toISOString(),
      });
      showToast(`🚀 ¡Diseño de página importado con éxito!`);
      return true;
    } catch {
      showToast(`❌ Error: formato JSON no válido.`);
      return false;
    }
  };
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('opus_wishlist_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((id): id is string => typeof id === 'string');
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const wishlistRef = useRef<string[]>(wishlist);
  useEffect(() => {
    wishlistRef.current = wishlist;
    try {
      localStorage.setItem('opus_wishlist_v1', JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  // Poda IDs huérfanos cuando el catálogo cambia (ej. IDs demo viejos).
  useEffect(() => {
    if (products.length === 0) return;
    const valid = new Set(products.map((p) => p.id));
    setWishlist((prev) => {
      if (prev.every((id) => valid.has(id))) return prev;
      return prev.filter((id) => valid.has(id));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);
  const [looks, setLooks] = useState<ViralLook[]>(COMMUNITY_LOOKS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>(INITIAL_STOCK_ALERTS);
  const [notifications, setNotifications] = useState<NotificationLog[]>(INITIAL_NOTIFICATIONS);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [shippingGuides, setShippingGuides] = useState<ShippingGuide[]>(INITIAL_SHIPPING_GUIDES);
  const [reviews, setReviews] = useState<ProductReview[]>(INITIAL_REVIEWS);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('MANO10');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [latestCompletedOrder, setLatestCompletedOrder] = useState<Order | null>(null);
  const [latestLiveAlertOrder, setLatestLiveAlertOrder] = useState<Order | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [webhookEventsCount, setWebhookEventsCount] = useState(3842);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    // Fusiona guardados con oficiales: garantiza super admin + operativo,
    // conserva ediciones (PIN, nombre) y empleados personalizados.
    const mergeWithInitial = (saved: AdminUser[]): AdminUser[] => {
      const byId = new Map(
        saved.filter((u) => u && typeof u.id === 'string').map((u) => [u.id, u])
      );
      const merged: AdminUser[] = INITIAL_ADMIN_USERS.map((init) => ({
        ...init,
        ...(byId.get(init.id) || {}),
        id: init.id,
      }));
      for (const u of byId.values()) {
        if (INITIAL_ADMIN_USERS.some((i) => i.id === u.id)) continue;
        // Demos retiradas sin modificar no se rescatan.
        if (
          (u.id === 'admin-2' || u.id === 'admin-3') &&
          /@(opuscartel|opuskartel)\.co$/i.test(u.email || '')
        ) {
          continue;
        }
        merged.push(u);
      }
      return merged;
    };
    try {
      const saved = localStorage.getItem('opus_admin_users_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return mergeWithInitial(parsed);
      }
    } catch {
      // storage bloqueado o corrupto
    }
    return INITIAL_ADMIN_USERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('opus_admin_users_v2', JSON.stringify(adminUsers));
    } catch {
      // ignore
    }
  }, [adminUsers]);
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminAuthMode, setAdminAuthMode] = useState<'server' | 'local' | null>(null);

  const readAdminToken = (): string | null => {
    try {
      return sessionStorage.getItem('opus_admin_token') || localStorage.getItem('opus_admin_token');
    } catch {
      return null;
    }
  };

  const storeAdminToken = (token: string, remember: boolean) => {
    try {
      if (remember) localStorage.setItem('opus_admin_token', token);
      else sessionStorage.setItem('opus_admin_token', token);
    } catch {
      // ignore
    }
  };

  // Valida la sesión guardada contra el backend al arrancar.
  useEffect(() => {
    const token = readAdminToken();
    if (!token) return;
    fetch('/api/admin/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          setCurrentAdminUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            roleTitle: data.user.role === 'SUPER_ADMIN' ? 'Super Admin' : data.user.role,
            avatarInitials: data.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
            lastLogin: new Date().toISOString(),
          } as AdminUser);
          setIsAdminAuthenticated(true);
          setAdminAuthMode('server');
          // Si recargó estando en admin, el guard lo mandó a login: devuélvelo.
          try {
            if (sessionStorage.getItem('opus_last_view') === 'admin') {
              setActiveViewState('admin');
            }
          } catch {
            // ignore
          }
        }
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [adminSidebarMobileOpen, setAdminSidebarMobileOpen] = useState(false);
  // Bloqueo por inactividad: 2 min sin actividad cierra la sesión admin.
  // Solo aplica al panel (la tienda nunca expulsa al comprador).
  const lastActivityRef = useRef<number>(Date.now());
  const idleWarnedRef = useRef<boolean>(false);
  useEffect(() => {
    if (!isAdminAuthenticated) return;
    lastActivityRef.current = Date.now();
    idleWarnedRef.current = false;
    const bump = () => {
      lastActivityRef.current = Date.now();
      idleWarnedRef.current = false;
    };
    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((ev) => window.addEventListener(ev, bump, { passive: true }));
    const timer = setInterval(() => {
      const idleSec = (Date.now() - lastActivityRef.current) / 1000;
      if (idleSec >= 120) {
        adminLogout();
        showToast('🔒 Sesión cerrada por 2 minutos de inactividad.');
      } else if (idleSec >= 90 && !idleWarnedRef.current) {
        idleWarnedRef.current = true;
        showToast('⚠️ Tu sesión se cerrará en 30 segundos por inactividad. Toca algo para seguir.');
      }
    }, 5000);
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, bump));
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminAuthenticated]);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Customer Profile & Authentication State
  const [isCustomerProfileOpen, setIsCustomerProfileOpen] = useState(false);
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('opus_customer_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(() => {
    try {
      const saved = localStorage.getItem('opus_current_customer');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return null;
  });

  const [customerAddresses, setCustomerAddresses] = useState<CustomerAddress[]>(() => {
    try {
      const saved = localStorage.getItem('opus_customer_addresses');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return [];
  });

  // Order Tracking for Direct Customer Queries (Zero Registration Required)
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [trackingQuery, setTrackingQuery] = useState('');

  const openOrderTracking = (queryOrRef?: string) => {
    if (queryOrRef) {
      setTrackingQuery(queryOrRef);
    }
    setIsOrderTrackingOpen(true);
  };

  // Contextual Admin Help Assistant & Drawer
  const [adminHelpDrawerOpen, setAdminHelpDrawerOpen] = useState(false);
  const [adminHelpTopic, setAdminHelpTopic] = useState('');

  const openAdminHelp = (topic?: string) => {
    if (topic) {
      setAdminHelpTopic(topic);
    }
    setAdminHelpDrawerOpen(true);
  };

  // System Video Tutorials & Screencast Player
  const [systemVideoTutorialOpen, setSystemVideoTutorialOpen] = useState(false);
  const [activeSystemVideoId, setActiveSystemVideoId] = useState('orders');

  const openSystemVideoTutorial = (videoId?: string) => {
    if (videoId) {
      setActiveSystemVideoId(videoId);
    }
    setSystemVideoTutorialOpen(true);
  };

  const closeSystemVideoTutorial = () => {
    setSystemVideoTutorialOpen(false);
  };

  // Hero Image Position & Size Editor Modal State
  const [isHeroImageEditorOpen, setIsHeroImageEditorOpen] = useState(false);
  const openHeroImageEditor = () => setIsHeroImageEditorOpen(true);
  const closeHeroImageEditor = () => setIsHeroImageEditorOpen(false);

  const customerOrders = useMemo(() => {
    if (!currentCustomer?.email) return [];
    const email = currentCustomer.email.toLowerCase();
    return orders.filter(
      (o) =>
        o.customer?.email?.toLowerCase() === email ||
        (o.customerId != null && o.customerId === currentCustomer.id)
    );
  }, [orders, currentCustomer]);

  // Auto-sync with Supabase PostgreSQL if configured
  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchProductsFromSupabase().then((supaProducts) => {
        if (supaProducts && supaProducts.length > 0) {
          setProducts(supaProducts);
        }
      });
      fetchOrdersFromSupabase().then((supaOrders) => {
        if (supaOrders && supaOrders.length > 0) {
          setOrders(supaOrders);
        }
      });
    }
  }, []);

  // Handle URL deep links & parameters seamlessly (coupons, recovery links, products)
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);

      // Auto-apply coupon from URL link (e.g. ?coupon=MANO10 or ?coupon=BLACKVIP)
      const urlCoupon = params.get('coupon');
      if (urlCoupon) {
        const found = coupons.find((c) => c.code.toUpperCase() === urlCoupon.trim().toUpperCase());
        if (found && found.active) {
          setAppliedCoupon(found.code);
          showToast(`🎟️ Cupón de descuento "${found.code}" activado con éxito.`);
        }
      }

      // Recover abandoned cart via direct link (e.g. ?recover=tok_cart_...)
      const recoverToken = params.get('recover');
      if (recoverToken) {
        const target = abandonedCheckouts.find(
          (c) => c.cartToken === recoverToken || c.id === recoverToken
        );
        if (target && target.items.length > 0) {
          setCart(target.items);
          if (target.appliedCouponCode) {
            setAppliedCoupon(target.appliedCouponCode);
          }
          setActiveView('checkout');
          showToast(`🛒 Carrito recuperado con éxito.`);
        }
      }

      // Deep link to a specific product (e.g. ?product=slug)
      const productSlug = params.get('product');
      if (productSlug) {
        const foundProduct = products.find(
          (p) => p.slug === productSlug || p.id === productSlug
        );
        if (foundProduct) {
          setSelectedProduct(foundProduct);
          setActiveView('product-detail');
        }
      }

      // Deep link to a category (e.g. ?category=Hoodies)
      const categoryParam = params.get('category');
      if (categoryParam) {
        setActiveCategoryFilter(categoryParam);
      }

      // Order tracking deep link (e.g. ?rastreo=ORD-2026-1001 or #rastreo=ORD-2026-1001)
      const parseTrackingHash = () => {
        const hash = window.location.hash;
        const currentParams = new URLSearchParams(window.location.search);
        let trackParam = currentParams.get('rastreo') || currentParams.get('pedido') || currentParams.get('order');

        if (!trackParam && hash) {
          if (hash.startsWith('#rastreo=')) {
            trackParam = decodeURIComponent(hash.replace('#rastreo=', ''));
          } else if (hash.startsWith('#pedido=')) {
            trackParam = decodeURIComponent(hash.replace('#pedido=', ''));
          } else if (hash.startsWith('#order=')) {
            trackParam = decodeURIComponent(hash.replace('#order=', ''));
          } else if (hash === '#rastreo' || hash === '#/rastreo' || hash === '#pedidos') {
            trackParam = '';
          }
        }

        if (trackParam !== null && trackParam !== undefined) {
          setTrackingQuery(trackParam);
          setIsOrderTrackingOpen(true);
        }
      };

      parseTrackingHash();
      window.addEventListener('hashchange', parseTrackingHash);
      return () => {
        window.removeEventListener('hashchange', parseTrackingHash);
      };
    } catch {
      // safe fallback
    }
  }, []);

  const customerLogin = (email: string, fullName?: string, phone?: string, city?: string) => {
    const existing = customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
    let customerToSet: Customer;
    if (existing) {
      customerToSet = {
        ...existing,
        vipPoints: existing.vipPoints || 850,
      };
    } else {
      customerToSet = {
        id: `cust-${Date.now()}`,
        fullName: fullName || email.split('@')[0].toUpperCase(),
        email: email.toLowerCase(),
        phone: phone || '+57 300 000 0000',
        department: 'Antioquia',
        city: city || 'Medellín',
        totalOrders: 0,
        ltvInCents: 0,
        lastOrderDate: new Date().toISOString().split('T')[0],
        tier: 'NUEVO',
        vipPoints: 100,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      };
      setCustomers((prev) => [customerToSet, ...prev]);
    }
    setCurrentCustomer(customerToSet);
    setIsCustomerLoggedIn(true);
    try {
      localStorage.setItem('opus_current_customer', JSON.stringify(customerToSet));
      localStorage.setItem('opus_customer_logged_in', 'true');
    } catch {}
    showToast(`👋 ¡Bienvenido, ${customerToSet.fullName}!`);
  };

  const customerLogout = () => {
    setIsCustomerLoggedIn(false);
    try {
      localStorage.setItem('opus_customer_logged_in', 'false');
      sessionStorage.removeItem('opus_store_link_granted');
    } catch {}
    setActiveView('home');
    showToast('Sesión de cliente cerrada exitosamente.');
  };

  const addCustomerAddress = (newAddr: Omit<CustomerAddress, 'id'>) => {
    const addr: CustomerAddress = {
      ...newAddr,
      id: `addr-${Date.now()}`,
    };
    const updated = newAddr.isDefault
      ? [addr, ...customerAddresses.map((a) => ({ ...a, isDefault: false }))]
      : [addr, ...customerAddresses];
    setCustomerAddresses(updated);
    try {
      localStorage.setItem('opus_customer_addresses', JSON.stringify(updated));
    } catch {}
    showToast('📍 Dirección guardada exitosamente.');
  };

  const deleteCustomerAddress = (id: string) => {
    const updated = customerAddresses.filter((a) => a.id !== id);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    setCustomerAddresses(updated);
    try {
      localStorage.setItem('opus_customer_addresses', JSON.stringify(updated));
    } catch {}
    showToast('🗑️ Dirección eliminada.');
  };

  const setDefaultCustomerAddress = (id: string) => {
    const updated = customerAddresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setCustomerAddresses(updated);
    try {
      localStorage.setItem('opus_customer_addresses', JSON.stringify(updated));
    } catch {}
    showToast('⭐ Dirección principal actualizada.');
  };

  // Initial cart preloaded
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('apex_cart_items_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('apex_cart_items_v2', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Abandoned Checkouts Management & Recovery State
  const [abandonedCheckouts, setAbandonedCheckouts] = useState<AbandonedCheckout[]>(() => {
    try {
      const saved = localStorage.getItem('opus_abandoned_checkouts_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_ABANDONED_CHECKOUTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('opus_abandoned_checkouts_v1', JSON.stringify(abandonedCheckouts));
    } catch {}
  }, [abandonedCheckouts]);

  const saveAbandonedCheckout = (data: Partial<AbandonedCheckout> & { cartToken?: string; customer?: any; items?: CartItem[] }) => {
    if (!data.items || data.items.length === 0) return;
    const token = data.cartToken || 'tok_cart_current';

    setAbandonedCheckouts((prev) => {
      const existingIdx = prev.findIndex(
        (c) => c.cartToken === token || (c.customer?.email && data.customer?.email && c.customer.email.toLowerCase() === data.customer.email.toLowerCase())
      );
      const subtotal = data.items!.reduce((acc, item) => acc + item.priceInCents * item.quantity, 0);
      const discount = data.discountInCents || 0;
      const shipping = data.shippingInCents || (subtotal > 20000000 ? 0 : 1500000);
      const total = Math.max(0, subtotal - discount + shipping);

      const updatedRecord: AbandonedCheckout = {
        id: existingIdx >= 0 ? prev[existingIdx].id : `abnd-${Date.now()}`,
        cartToken: token,
        customer: {
          ...(existingIdx >= 0 ? prev[existingIdx].customer : {}),
          ...(data.customer || {}),
        },
        items: data.items!,
        subtotalInCents: subtotal,
        discountInCents: discount,
        shippingInCents: shipping,
        totalAmountInCents: total,
        currency: 'COP',
        abandonedStage: data.abandonedStage || (existingIdx >= 0 ? prev[existingIdx].abandonedStage : 'cart'),
        lastActivityAt: new Date().toISOString(),
        status: existingIdx >= 0 ? prev[existingIdx].status : 'ABANDONED',
        recoveryCount: existingIdx >= 0 ? prev[existingIdx].recoveryCount : 0,
        lastContactedAt: existingIdx >= 0 ? prev[existingIdx].lastContactedAt : undefined,
        recoveryNotes: data.recoveryNotes || (existingIdx >= 0 ? prev[existingIdx].recoveryNotes : undefined),
        appliedCouponCode: data.appliedCouponCode,
        suggestedRecoveryCoupon: data.suggestedRecoveryCoupon || 'RECOVERY10',
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = updatedRecord;
        return copy;
      } else {
        return [updatedRecord, ...prev];
      }
    });
  };

  const markAbandonedCheckoutContacted = (id: string, channel: 'WHATSAPP' | 'EMAIL' = 'WHATSAPP', notes?: string) => {
    setAbandonedCheckouts((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: 'CONTACTED',
            recoveryCount: (c.recoveryCount || 0) + 1,
            lastContactedAt: new Date().toISOString(),
            recoveryNotes: notes || `Contactado vía ${channel} el ${new Date().toLocaleDateString('es-CO')}`,
          };
        }
        return c;
      })
    );
    showToast(`📲 Carrito marcado como contactado.`);
  };

  const markAbandonedCheckoutRecovered = (id: string) => {
    setAbandonedCheckouts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'RECOVERED' } : c))
    );
    showToast(`🎉 ¡Carrito marcado como RECUPERADO exitosamente!`);
  };

  const deleteAbandonedCheckout = (id: string) => {
    setAbandonedCheckouts((prev) => prev.filter((c) => c.id !== id));
    showToast(`🗑️ Registro de carrito abandonado eliminado.`);
  };

  const restoreAbandonedCart = (id: string) => {
    const found = abandonedCheckouts.find((c) => c.id === id);
    if (!found || found.items.length === 0) {
      showToast('❌ Carrito no encontrado o sin artículos.');
      return;
    }
    setCart(found.items);
    if (found.appliedCouponCode) {
      setAppliedCoupon(found.appliedCouponCode);
    }
    setActiveView('checkout');
    setIsCartOpen(false);
    showToast(`🛒 Carrito de ${found.customer.fullName || 'Cliente'} restaurado.`);
  };

  const sendAbandonedRecoveryWhatsApp = (
    checkout: AbandonedCheckout,
    couponCode: string = 'RECOVERY10',
    customMessage?: string
  ): string => {
    const rawPhone = (checkout.customer.phone || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.startsWith('57') ? rawPhone : `57${rawPhone || '3000000000'}`;
    const name = checkout.customer.fullName ? checkout.customer.fullName.split(' ')[0] : 'Parcero/a';
    const firstItem = checkout.items[0]?.title || checkout.items[0]?.product?.title || 'productos destacados';
    const totalFormatted = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(checkout.totalAmountInCents / 100);

    const defaultMsg = `¡Hola ${name}! 👋 Vimos que dejaste pendiente tu pedido de *${firstItem}* (${totalFormatted}) en *TU TIENDA A LA MANO* 🛍️.\n\nPara ayudarte a estrenar hoy, te activamos el cupón especial *${couponCode}* con un beneficio exclusivo.\n\n👉 Retoma tu pedido directamente aquí: https://tutiendaalamano.co/checkout?recover=${checkout.cartToken}\n\n¿Tienes alguna duda con tu talla o pago por Nequi/PSE? ¡Escríbenos y te asesoramos de inmediato!`;

    const finalMsg = customMessage || defaultMsg;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(finalMsg)}`;

    markAbandonedCheckoutContacted(
      checkout.id,
      'WHATSAPP',
      `Mensaje WhatsApp enviado con cupón ${couponCode} (${new Date().toLocaleDateString('es-CO')})`
    );
    return url;
  };

  const simulateAbandonedCheckout = () => {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomCity = ['Medellín', 'Bogotá D.C.', 'Cali', 'Bucaramanga', 'Cartagena', 'Pereira'][
      Math.floor(Math.random() * 6)
    ];
    const names = ['Camilo Restrepo', 'Juliana Arango', 'Mateo Henao', 'Estefanía Quintero', 'Felipe Londoño', 'Manuela Echeverri'];
    const selectedName = names[Math.floor(Math.random() * names.length)];
    const randomPhone = `3${Math.floor(10 + Math.random() * 19)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}`;
    const stages: AbandonedCheckout['abandonedStage'][] = ['cart', 'customer_info', 'shipping', 'payment_gateway'];
    const chosenStage = stages[Math.floor(Math.random() * stages.length)];

    const newAbnd: AbandonedCheckout = {
      id: `abnd-${Date.now()}`,
      cartToken: `tok_cart_${Math.random().toString(36).substring(2, 8)}`,
      customer: {
        fullName: selectedName,
        email: `${selectedName.toLowerCase().replace(' ', '.')}@gmail.com`,
        phone: randomPhone,
        city: randomCity,
        department: randomCity === 'Medellín' ? 'Antioquia' : randomCity === 'Bogotá D.C.' ? 'Cundinamarca' : 'Colombia',
        address: 'Calle 10 # 43E - 20',
      },
      items: [
        {
          id: `cart-sim-${Date.now()}`,
          productId: randomProduct.id,
          variantId: randomProduct.variants[0]?.id || 'var-sim-1',
          title: randomProduct.title,
          image: randomProduct.images[0] || '',
          sku: randomProduct.sku || 'OPUS-SIM-1',
          product: randomProduct,
          quantity: 1,
          selectedSize: randomProduct.availableSizes[0] || 'L',
          selectedColor: randomProduct.availableColors[0]?.name || 'Black',
          priceInCents: randomProduct.priceInCents,
        },
      ],
      subtotalInCents: randomProduct.priceInCents,
      discountInCents: 0,
      shippingInCents: 0,
      totalAmountInCents: randomProduct.priceInCents,
      currency: 'COP',
      abandonedStage: chosenStage,
      lastActivityAt: new Date().toISOString(),
      status: 'ABANDONED',
      recoveryCount: 0,
      suggestedRecoveryCoupon: 'RECOVERY10',
      recoveryNotes: `Simulado automáticamente en etapa: ${chosenStage}`,
    };

    setAbandonedCheckouts((prev) => [newAbnd, ...prev]);
    addNotification({
      type: 'SYSTEM',
      channel: 'SYSTEM',
      recipient: 'admin@tutiendaalamano.co',
      subject: `🚨 Carrito Abandonado Detectado: ${selectedName}`,
      previewText: `Nuevo carrito abandonado de $${(randomProduct.priceInCents / 100).toLocaleString()} COP en ${randomCity}.`,
      status: 'SENT',
      customerName: selectedName,
      amountInCents: randomProduct.priceInCents,
    });
    showToast(`🚨 Nuevo carrito abandonado simulado (${selectedName}).`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      showToast(next ? '🔊 Alertas de audio activadas' : '🔇 Alertas de audio silenciadas');
      return next;
    });
  };

  const dismissLiveAlert = () => {
    setLatestLiveAlertOrder(null);
  };

  const openQuickView = (product: Product) => {
    setQuickViewProduct(product);
    recordProductView(product.id);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setQuickViewProduct(null);
    setActiveView('product-detail');
    recordProductView(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Vistos recientemente: alimenta el rail de retención del home.
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('opus_recently_viewed_v1');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string').slice(0, 12) : [];
    } catch {
      return [];
    }
  });

  const recordProductView = (productId: string) => {
    if (!productId) return;
    setRecentlyViewedIds((prev) => {
      const next = [productId, ...prev.filter((id) => id !== productId)].slice(0, 12);
      try {
        localStorage.setItem('opus_recently_viewed_v1', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Product CRUD Operations
  const addProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
    if (isSupabaseConfigured()) {
      syncProductToSupabase(newProd);
    }
    showToast(`✅ Producto "${newProd.title}" creado y publicado en el catálogo.`);
  };

  /** Fija/suelta un producto en la vitrina manteniendo el orden manual. */
  const setShowcasePinned = (productId: string, pinned: boolean) => {
    updateProduct(productId, { showcasePinned: pinned });
    const current = themeConfigRef.current?.showcasePinnedIds || [];
    const next = pinned
      ? [...current.filter((id) => id !== productId), productId]
      : current.filter((id) => id !== productId);
    updateThemeConfig({ showcasePinnedIds: next });
  };

  /** Mueve un fijado dentro del orden manual de la vitrina. */
  const moveShowcasePinned = (productId: string, dir: 1 | -1) => {
    const ids = orderedShowcasePinnedIds(themeConfigRef.current, productsRef.current);
    const idx = ids.indexOf(productId);
    const swapIdx = idx + dir;
    if (idx < 0 || swapIdx < 0 || swapIdx >= ids.length) return;
    const next = [...ids];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    updateThemeConfig({ showcasePinnedIds: next });
  };

  const updateProduct = (productId: string, updated: Partial<Product>) => {
    let savedMerged: Product | null = null;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const merged = { ...p, ...updated };
          savedMerged = merged;
          if (selectedProduct?.id === productId) {
            setSelectedProduct(merged);
          }
          return merged;
        }
        return p;
      })
    );
    if (savedMerged && isSupabaseConfigured()) {
      syncProductToSupabase(savedMerged);
    }
    showToast(`✨ Producto actualizado correctamente.`);
  };

  const deleteProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (isSupabaseConfigured()) {
      deleteProductFromSupabase(productId);
    }
    showToast(`🗑️ Producto "${target?.title || productId}" eliminado.`);
  };

  const duplicateProduct = (productId: string) => {
    const original = products.find((p) => p.id === productId);
    if (!original) return;
    const newId = `prod-${Date.now()}`;
    const duplicated: Product = {
      ...original,
      id: newId,
      title: `${original.title} (Copia)`,
      reference: `${original.reference}-COPY`,
      slug: `${original.slug}-copia-${Math.floor(100 + Math.random() * 900)}`,
      variants: original.variants.map((v, i) => ({
        ...v,
        id: `var-${newId}-${i + 1}`,
        sku: `${v.sku}-CP`,
      })),
    };
    setProducts((prev) => [duplicated, ...prev]);
    if (isSupabaseConfigured()) {
      syncProductToSupabase(duplicated);
    }
    showToast(`📋 Copia creada: "${duplicated.title}".`);
  };

  const addToCart = (product: Product, size: string, color: string, quantity = 1) => {
    const variant = product.variants?.find(
      (v) => (v.size === size || size === 'Ajustable' || size === 'Única') && (v.colorName.toLowerCase() === color.toLowerCase() || !color)
    ) || product.variants?.[0];

    const price = variant?.priceInCents || product.variants?.[0]?.priceInCents || 8990000;
    const existingIndex = cart.findIndex(
      (item) => item.productId === product.id && item.selectedSize === size && item.selectedColor === color
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      setCart(updated);
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: product.id,
        variantId: variant?.id || 'var-default',
        title: product.title,
        selectedColor: color || product.availableColors?.[0]?.name || 'Standard',
        selectedSize: size || product.availableSizes?.[0] || 'M',
        priceInCents: price,
        originalPriceInCents: variant?.originalPriceInCents,
        quantity: quantity,
        image: product.mainImage,
        sku: variant?.sku || product.reference,
      };
      setCart([...cart, newItem]);
    }
    showToast(`"${product.title}" agregado a la bolsa.`);
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(cart.map((item) => (item.id === itemId ? { ...item, quantity: qty } : item)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    const added = !wishlistRef.current.includes(productId);
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
    showToast(added ? 'Guardado en tus favoritos.' : 'Eliminado de tus favoritos.');
  };

  // Coupons management
  const addCoupon = (coupon: Coupon) => {
    setCoupons((prev) => [coupon, ...prev]);
    showToast(`🎟️ Cupón de descuento "${coupon.code}" creado.`);
  };

  const updateCoupon = (couponId: string, updated: Partial<Coupon>) => {
    setCoupons((prev) => prev.map((c) => (c.id === couponId ? { ...c, ...updated } : c)));
    showToast(`🎟️ Cupón actualizado.`);
  };

  const deleteCoupon = (couponId: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
    showToast(`🗑️ Cupón eliminado.`);
  };

  const toggleCoupon = (couponId: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === couponId ? { ...c, active: !c.active } : c))
    );
  };

  const applyCouponByCode = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === clean);
    if (!found) {
      return { success: false, message: `El cupón "${code}" no es válido.` };
    }
    if (!found.active) {
      return { success: false, message: `El cupón "${code}" se encuentra inactivo.` };
    }
    if (found.minPurchaseInCents && cartSubtotalInCents < found.minPurchaseInCents) {
      const minCOP = Math.round(found.minPurchaseInCents / 100).toLocaleString('es-CO');
      return {
        success: false,
        message: `Este cupón requiere una compra mínima de $${minCOP} COP.`,
      };
    }
    setAppliedCoupon(found.code);
    return {
      success: true,
      message: `¡Cupón "${found.code}" aplicado con éxito!`,
    };
  };

  // Shipping Guides Management
  const generateShippingGuide = (
    orderId: string,
    carrier: 'COORDINADORA' | 'SERVIENTREGA' | 'ENVIA' | 'INTERRAPIDISIMO' = 'COORDINADORA'
  ): ShippingGuide => {
    const targetOrder = orders.find((o) => o.id === orderId);
    const carrierPrefix =
      carrier === 'COORDINADORA'
        ? 'COO'
        : carrier === 'SERVIENTREGA'
        ? 'SER'
        : carrier === 'ENVIA'
        ? 'ENV'
        : 'INT';
    const tracking = `${carrierPrefix}-${Math.floor(100000000 + Math.random() * 900000000)}-CO`;
    const newGuide: ShippingGuide = {
      id: `guide-${Date.now()}`,
      orderId: orderId,
      orderReference: targetOrder?.reference || `#ORD-2026-${orderId}`,
      trackingNumber: tracking,
      carrier: carrier,
      originCity: 'Medellín, Antioquia',
      destinationCity: targetOrder?.customer.city || 'Bogotá D.C.',
      destinationDepartment: targetOrder?.customer.department || 'Bogotá D.C.',
      recipientName: targetOrder?.customer.fullName || 'Cliente Apex',
      recipientPhone: targetOrder?.customer.phone || '3000000000',
      recipientAddress: targetOrder?.customer.address || 'Dirección Nacional',
      declaredValueInCents: targetOrder?.totalAmountInCents || 18990000,
      weightKg: targetOrder ? Math.max(0.5, targetOrder.items.length * 0.6) : 1.0,
      itemsCount: targetOrder?.items.reduce((acc, it) => acc + it.quantity, 0) || 1,
      status: 'GENERATED',
      createdAt: new Date().toISOString(),
    };

    setShippingGuides((prev) => [newGuide, ...prev]);
    updateShippingStatus(orderId, 'SHIPPED', tracking);
    showToast(`📦 Guía física generada con ${carrier}: ${tracking}`);
    return newGuide;
  };

  const updateShippingGuideStatus = (guideId: string, status: ShippingGuide['status']) => {
    setShippingGuides((prev) =>
      prev.map((g) => (g.id === guideId ? { ...g, status } : g))
    );
    showToast(`Estado de guía actualizado a ${status}.`);
  };

  // Product Reviews
  const addProductReview = (rev: Omit<ProductReview, 'id' | 'createdAt'>) => {
    const newRev: ProductReview = {
      ...rev,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [newRev, ...prev]);
    showToast(`⭐ ¡Gracias por tu reseña! Ha sido enviada con éxito.`);
  };

  const updateReviewStatus = (reviewId: string, status: ProductReview['status']) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
    );
    showToast(`Reseña ${status === 'APPROVED' ? 'Aprobada' : 'Rechazada'}.`);
  };

  const deleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    showToast(`Reseña eliminada.`);
  };

  // Cart calculations
  const cartSubtotalInCents = cart.reduce((acc, item) => acc + item.priceInCents * item.quantity, 0);
  
  const couponDiscountInCents = useMemo(() => {
    if (!appliedCoupon) return 0;
    const found = coupons.find(
      (c) => c.active && c.code.toUpperCase() === appliedCoupon.toUpperCase()
    );
    if (!found) {
      if (appliedCoupon === 'APEXBIENVENIDA') return 2500000;
      if (appliedCoupon === 'FLASH10') return Math.round(cartSubtotalInCents * 0.1);
      return 0;
    }
    if (found.type === 'PERCENTAGE') {
      const pct = Number(found.value);
      if (!Number.isFinite(pct)) return 0;
      return Math.round((cartSubtotalInCents * pct) / 100);
    }
    const fixed = Number(found.value);
    if (!Number.isFinite(fixed)) return 0;
    return fixed * 100; // if fixed pesos, convert to cents
  }, [appliedCoupon, coupons, cartSubtotalInCents]);

  const cartTotalInCents = Math.max(0, cartSubtotalInCents - (Number.isFinite(couponDiscountInCents) ? couponDiscountInCents : 0));
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const addNotification = (notif: Omit<NotificationLog, 'id' | 'sentAt'>) => {
    const newNotif: NotificationLog = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sentAt: new Date().toISOString(),
      read: notif.read ?? false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Todas las notificaciones marcadas como leídas.');
  };

  const testAudioSound = () => {
    playOrderAlertSound();
    showToast('🔊 Alerta sonora de pedido reproducida.');
  };

  const updateProductStock = (productId: string, newStock: number) => {
    let savedMerged: Product | null = null;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updatedVariants = p.variants?.map((v, i) =>
            i === 0 ? { ...v, stock: newStock } : v
          ) || [];
          const merged = { ...p, variants: updatedVariants };
          savedMerged = merged;
          return merged;
        }
        return p;
      })
    );
    if (savedMerged && isSupabaseConfigured()) {
      syncProductToSupabase(savedMerged);
    }
    showToast(`📦 Inventario actualizado para el producto.`);
  };

  const createOrder = async (
    customer: CustomerInfo,
    paymentMethod: PaymentMethod,
    paymentDetails?: any,
    couponCode?: string,
    initialStatus: PaymentStatus = 'APPROVED'
  ): Promise<{ order: Order; transaction: WompiTransactionRecord }> => {
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const reference = `#ORD-2026-${orderNumber}`;
    const subtotal = cartSubtotalInCents;
    const discount = couponCode === 'APEXBIENVENIDA' ? 2500000 : couponDiscountInCents;
    const total = Math.max(0, subtotal - discount);
    const tax = Math.round((total * 19) / 119); // 19% IVA included
    const now = new Date().toISOString();
    const transactionId = `tr_wompi_${Math.floor(10000 + Math.random() * 90000)}`;

    // La firma real la genera el backend (/api/wompi/checkout-session).
    // En PENDING se deja vacía hasta confirmar el pago con Wompi.
    const signature = initialStatus === 'APPROVED'
      ? await generateWompiIntegritySignature(reference, total, 'COP')
      : '';

    const wompiTx: WompiTransactionRecord = {
      id: `tx-${Date.now()}`,
      orderId: `ord-${orderNumber}`,
      transactionId: transactionId,
      status: initialStatus,
      paymentMethod: paymentMethod,
      amountInCents: total,
      currency: 'COP',
      customerEmail: customer.email,
      signature: signature,
      rawPayload: {
        id: transactionId,
        status: initialStatus,
        payment_method_type: paymentMethod,
        amount_in_cents: total,
        reference: reference,
        currency: 'COP',
        customer_email: customer.email,
        integrity_hash: signature,
        wompi_env: 'production_colombia',
        created_at: now,
      },
      processedAt: now,
      createdAt: now,
      paymentDetails: paymentDetails,
    };

    const newOrder: Order = {
      id: `ord-${orderNumber}`,
      reference: reference,
      customer: customer,
      items: cart.map((item, idx) => ({
        id: `item-${orderNumber}-${idx + 1}`,
        productId: item.productId,
        variantId: item.variantId,
        productTitle: item.title,
        variantSku: item.sku,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        quantity: item.quantity,
        unitPriceInCents: item.priceInCents,
        totalPriceInCents: item.priceInCents * item.quantity,
        image: item.image,
      })),
      subtotalInCents: subtotal,
      discountInCents: discount,
      shippingInCents: 0,
      taxInCents: tax,
      totalAmountInCents: total,
      currency: 'COP',
      status: initialStatus,
      shippingStatus: 'UNFULFILLED',
      trackingNumber: initialStatus === 'APPROVED'
        ? `CRD-${Math.floor(100000000 + Math.random() * 900000000)}-CO`
        : undefined,
      carrier: initialStatus === 'APPROVED' ? 'Coordinadora Express Asegurado' : undefined,
      createdAt: now,
      updatedAt: now,
      wompiTransaction: wompiTx,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLatestCompletedOrder(newOrder);
    setLatestLiveAlertOrder(newOrder);
    setWebhookEventsCount((prev) => prev + 1);

    if (soundEnabled) {
      playOrderAlertSound();
    }

    // Customer update
    const existingCust = customers.find((c) => c.email.toLowerCase() === customer.email.toLowerCase());
    let customerSaved: Customer;

    if (existingCust) {
      customerSaved = {
        ...existingCust,
        fullName: customer.fullName || existingCust.fullName,
        phone: customer.phone || existingCust.phone,
        department: customer.department || existingCust.department,
        city: customer.city || existingCust.city,
        totalOrders: existingCust.totalOrders + 1,
        ltvInCents: existingCust.ltvInCents + total,
        lastOrderDate: now.split('T')[0],
        newsletterOptIn: customer.wantsMarketingNewsletter !== undefined ? customer.wantsMarketingNewsletter : existingCust.newsletterOptIn,
        registeredAccount: customer.createAccountAfterOrder ? true : existingCust.registeredAccount,
      };
      setCustomers((prev) =>
        prev.map((c) => (c.id === existingCust.id ? customerSaved : c))
      );
    } else {
      customerSaved = {
        id: `cust-${Date.now()}`,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        department: customer.department,
        city: customer.city,
        totalOrders: 1,
        ltvInCents: total,
        lastOrderDate: now.split('T')[0],
        tier: total > 100000000 ? 'VIP' : 'NUEVO',
        newsletterOptIn: !!customer.wantsMarketingNewsletter,
        registeredAccount: !!customer.createAccountAfterOrder,
      };
      setCustomers((prev) => [customerSaved, ...prev]);
    }

    // Add transactional notifications for Store & Customer
    if (initialStatus === 'APPROVED') {
    addNotification({
      type: 'NEW_ORDER_ALERT',
      channel: 'SYSTEM',
      recipient: 'admin@tutiendaalamano.co',
      subject: `🔥 ¡Nueva Venta Aprobada! $${Math.round(total / 100).toLocaleString('es-CO')} COP (${reference})`,
      status: 'SENT',
      read: false,
      orderReference: reference,
      orderId: newOrder.id,
      amountInCents: total,
      customerName: customer.fullName,
      paymentMethod: paymentMethod,
      previewText: `Cliente: ${customer.fullName} • ${customer.city}, ${customer.department} • Wompi ${paymentMethod} • ${cart.length} productos.`,
    });

    addNotification({
      type: 'PAYMENT_CONFIRMATION',
      channel: 'WHATSAPP',
      recipient: customer.email,
      subject: `¡Pago confirmado por Wompi! $${Math.round(total / 100).toLocaleString('es-CO')} COP (${reference})`,
      status: 'SENT',
      read: false,
      orderReference: reference,
      orderId: newOrder.id,
      amountInCents: total,
      customerName: customer.fullName,
      paymentMethod: paymentMethod,
      previewText: `Comprador: ${customer.fullName} • Despacho Coordinadora hacia ${customer.city}, ${customer.department}.`,
    });
    } else {
      addNotification({
        type: 'NEW_ORDER_ALERT',
        channel: 'SYSTEM',
        recipient: 'admin@tutiendaalamano.co',
        subject: `⏳ Pedido pendiente de pago (${reference})`,
        status: 'SENT',
        read: false,
        orderReference: reference,
        orderId: newOrder.id,
        amountInCents: total,
        customerName: customer.fullName,
        paymentMethod: paymentMethod,
        previewText: `Cliente: ${customer.fullName} • ${customer.city}, ${customer.department} • Redirigido al checkout Wompi.`,
      });
    }

    // Auto sync with Supabase PostgreSQL if active (awaited: el checkout
    // redirige al Widget justo después y la orden debe existir ya).
    if (isSupabaseConfigured()) {
      await syncOrderToSupabase(newOrder);
      await syncCustomerToSupabase(customerSaved);
    }

    if (initialStatus === 'APPROVED') {
      clearCart();
    }
    return { order: newOrder, transaction: wompiTx };
  };

  // Function to simulate a live order for testing the order alert & real-time stats
  const simulateLiveOrder = async () => {
    const randomNames = [
      { name: 'Valentina Restrepo', city: 'Medellín', dept: 'Antioquia', phone: '300 456 7891', email: 'vale.restrepo@gmail.com' },
      { name: 'Juan Camilo Osorio', city: 'Bogotá D.C.', dept: 'Bogotá D.C.', phone: '311 234 5678', email: 'jcosorio@outlook.com' },
      { name: 'Isabella Gómez', city: 'Cali', dept: 'Valle del Cauca', phone: '315 987 6543', email: 'isa.gomez@icloud.com' },
      { name: 'Mateo Echeverry', city: 'Barranquilla', dept: 'Atlántico', phone: '320 112 3344', email: 'mateo.e@empresa.co' },
      { name: 'Camila Morales', city: 'Bucaramanga', dept: 'Santander', phone: '318 445 6677', email: 'camila.m@gmail.com' },
      { name: 'Nicolás Arango', city: 'Pereira', dept: 'Risaralda', phone: '312 889 9900', email: 'nico.arango@hotmail.com' },
    ];

    const randomMethods: PaymentMethod[] = ['PSE', 'NEQUI', 'CARD', 'BANCOLOMBIA'];
    const selectedPerson = randomNames[Math.floor(Math.random() * randomNames.length)];
    const selectedMethod = randomMethods[Math.floor(Math.random() * randomMethods.length)];

    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomVariant = randomProduct.variants[0];
    const qty = Math.floor(Math.random() * 2) + 1;
    const total = (randomVariant?.priceInCents || 18990000) * qty;

    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const reference = `#ORD-2026-${orderNumber}`;
    const now = new Date().toISOString();
    const transactionId = `tr_wompi_${Math.floor(10000 + Math.random() * 90000)}`;

    const signature = await generateWompiIntegritySignature(reference, total, 'COP');

    const wompiTx: WompiTransactionRecord = {
      id: `tx-${Date.now()}`,
      orderId: `ord-${orderNumber}`,
      transactionId: transactionId,
      status: 'APPROVED',
      paymentMethod: selectedMethod,
      amountInCents: total,
      currency: 'COP',
      customerEmail: selectedPerson.email,
      signature: signature,
      rawPayload: {
        id: transactionId,
        status: 'APPROVED',
        payment_method_type: selectedMethod,
        amount_in_cents: total,
        reference: reference,
        origin: 'Wompi Live Simulator',
      },
      processedAt: now,
      createdAt: now,
      paymentDetails: selectedMethod === 'PSE' ? { pseBank: 'Bancolombia' } : selectedMethod === 'NEQUI' ? { nequiPhone: selectedPerson.phone } : { cardBrand: 'VISA', lastFour: '8812' },
    };

    const newOrder: Order = {
      id: `ord-${orderNumber}`,
      reference: reference,
      customer: {
        fullName: selectedPerson.name,
        email: selectedPerson.email,
        phone: selectedPerson.phone,
        department: selectedPerson.dept,
        city: selectedPerson.city,
        address: 'Calle 10 # 45 - 20',
        neighborhood: 'Centro / Residencial',
      },
      items: [
        {
          id: `item-${orderNumber}-1`,
          productId: randomProduct.id,
          variantId: randomVariant?.id || 'var-1',
          productTitle: randomProduct.title,
          variantSku: randomVariant?.sku || randomProduct.reference,
          selectedSize: randomVariant?.size || 'M',
          selectedColor: randomVariant?.colorName || 'Cyber Black',
          quantity: qty,
          unitPriceInCents: randomVariant?.priceInCents || 18990000,
          totalPriceInCents: total,
          image: randomProduct.mainImage,
        },
      ],
      subtotalInCents: total,
      discountInCents: 0,
      shippingInCents: 0,
      taxInCents: Math.round((total * 19) / 119),
      totalAmountInCents: total,
      currency: 'COP',
      status: 'APPROVED',
      shippingStatus: 'UNFULFILLED',
      trackingNumber: `SER-${Math.floor(100000000 + Math.random() * 900000000)}-CO`,
      carrier: 'Servientrega Prioritario Asegurado',
      createdAt: now,
      updatedAt: now,
      wompiTransaction: wompiTx,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLatestLiveAlertOrder(newOrder);
    setWebhookEventsCount((prev) => prev + 1);

    if (soundEnabled) {
      playOrderAlertSound();
    }

    addNotification({
      type: 'NEW_ORDER_ALERT',
      channel: 'SYSTEM',
      recipient: 'admin@tutiendaalamano.co',
      subject: `⚡ ¡Nueva Venta Aprobada Wompi! $${Math.round(total / 100).toLocaleString('es-CO')} COP (${reference})`,
      status: 'SENT',
      read: false,
      orderReference: reference,
      orderId: newOrder.id,
      amountInCents: total,
      customerName: selectedPerson.name,
      paymentMethod: selectedMethod,
      previewText: `Cliente: ${selectedPerson.name} (${selectedPerson.city}) • Método Wompi: ${selectedMethod} • 1 ítem exclusivo`,
    });

    showToast(`🔔 ¡Nueva orden recibida! ${selectedPerson.name} compró $${Math.round(total / 100).toLocaleString('es-CO')} COP`);
  };

  const updateOrderStatus = (orderId: string, status: PaymentStatus, shippingStatus?: ShippingStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status,
            shippingStatus: shippingStatus || ord.shippingStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
    showToast(`Estado de la orden actualizado a ${status}.`);
  };

  const updateShippingStatus = (orderId: string, shippingStatus: ShippingStatus, trackingNumber?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated = {
            ...ord,
            shippingStatus,
            trackingNumber: trackingNumber || ord.trackingNumber,
            updatedAt: new Date().toISOString(),
          };

          // Automatic WhatsApp Notification on SHIPPED
          if (shippingStatus === 'SHIPPED') {
            if (whatsappConfig.autoSendOnShipped) {
              sendOrderWhatsAppNotification(ord.id, 'ORDER_SHIPPED', ord.carrier, updated.trackingNumber).then(
                (res) => {
                  if (res) {
                    showToast(
                      `📲 Mensaje WhatsApp Business de despacho enviado a ${ord.customer.fullName} (${ord.customer.phone}) con guía ${updated.trackingNumber || 'asignada'}.`
                    );
                  }
                }
              );
            }

            addNotification({
              type: 'SHIPMENT_UPDATE',
              channel: 'EMAIL',
              recipient: ord.customer.email,
              subject: `Tu pedido ${ord.reference} fue preparado y despachado (${ord.carrier || 'Coordinadora'})`,
              status: 'SENT',
              read: false,
              orderId: ord.id,
              orderReference: ord.reference,
              amountInCents: ord.totalAmountInCents,
              customerName: ord.customer.fullName,
              previewText: `Guía de rastreo: ${updated.trackingNumber || 'En asignación'}. Empresa: ${ord.carrier || 'Coordinadora'}.`,
            });
          }

          // Automatic WhatsApp Notification on DELIVERED
          if (shippingStatus === 'DELIVERED') {
            if (whatsappConfig.autoSendOnDelivered) {
              sendOrderWhatsAppNotification(ord.id, 'ORDER_DELIVERED', ord.carrier, updated.trackingNumber).then(
                (res) => {
                  if (res) {
                    showToast(
                      `🎉 Mensaje WhatsApp Business de confirmación de entrega enviado a ${ord.customer.fullName}.`
                    );
                  }
                }
              );
            }

            addNotification({
              type: 'SHIPMENT_UPDATE',
              channel: 'WHATSAPP',
              recipient: ord.customer.phone,
              subject: `¡Pedido ${ord.reference} entregado con éxito!`,
              status: 'SENT',
              read: false,
              orderId: ord.id,
              orderReference: ord.reference,
              amountInCents: ord.totalAmountInCents,
              customerName: ord.customer.fullName,
              previewText: `Tu pedido ha sido entregado en ${ord.customer.city}. ¡Gracias por confiar en TU TIENDA A LA MANO!`,
            });
          }

          return updated;
        }
        return ord;
      })
    );
    showToast(`Estado de despacho actualizado a ${shippingStatus}.`);
  };

  const triggerSimulatedWebhook = (orderId: string, targetStatus: PaymentStatus) => {
    setWebhookEventsCount((prev) => prev + 1);
    updateOrderStatus(orderId, targetStatus);
    showToast(`⚡ Webhook Wompi recibido: Evento 'transaction.updated' -> ${targetStatus}`);
  };

  const processWompiWebhook = (payload: any) => {
    setWebhookEventsCount((prev) => prev + 1);
    const tx = payload?.data?.transaction;
    if (tx) {
      const orderRef = tx.reference;
      const targetOrder = orders.find((o) => o.reference === orderRef || o.id === orderRef);
      if (targetOrder) {
        updateOrderStatus(targetOrder.id, tx.status);
      }
      showToast(`Webhook procesado: Transacción ${tx.id} estado ${tx.status}`);
    }
  };

  // Dynamic Analytics Calculation
  const analytics: AdminAnalytics = useMemo(() => {
    const approvedOrders = orders.filter((o) => o.status === 'APPROVED');
    const isCleanSlate = orders.length === 0;
    const totalRev = approvedOrders.reduce((acc, o) => acc + o.totalAmountInCents, 0) + (isCleanSlate ? 0 : 18500000000);
    const totalCount = orders.length + (isCleanSlate ? 0 : 1280);
    const aov = totalCount > 0 ? Math.round(totalRev / totalCount) : 0;

    const todayDate = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayDate));
    const todayRev = todayOrders.reduce((acc, o) => acc + o.totalAmountInCents, 0) + (isCleanSlate ? 0 : 2489000000);

    const pendingCount = orders.filter((o) => o.status === 'PENDING' || o.shippingStatus === 'UNFULFILLED').length;

    return {
      totalRevenueInCents: totalRev,
      totalOrders: totalCount,
      averageTicketInCents: aov,
      conversionRate: isCleanSlate ? 0 : 3.8,
      growthRate: isCleanSlate ? 0 : 24.8,
      dailyRevenue: isCleanSlate
        ? [
            { day: 'Lun', revenue: 0 },
            { day: 'Mar', revenue: 0 },
            { day: 'Mié', revenue: 0 },
            { day: 'Jue', revenue: 0 },
            { day: 'Vie', revenue: 0 },
            { day: 'Sáb', revenue: 0 },
            { day: 'Dom', revenue: 0 },
          ]
        : [
            { day: 'Lun', revenue: 14200000 },
            { day: 'Mar', revenue: 19800000 },
            { day: 'Mié', revenue: 17400000 },
            { day: 'Jue', revenue: 26500000 },
            { day: 'Vie', revenue: 31200000 },
            { day: 'Sáb', revenue: 42800000 },
            { day: 'Dom', revenue: 38900000 },
          ],
      paymentBreakdown: isCleanSlate
        ? [
            { name: 'PSE Bancos', value: 0, color: '#2b47e5', amountInCents: 0 },
            { name: 'Nequi Push', value: 0, color: '#f43f5e', amountInCents: 0 },
            { name: 'Tarjetas Crédito/Débito', value: 0, color: '#10b981', amountInCents: 0 },
            { name: 'Botón Bancolombia', value: 0, color: '#f59e0b', amountInCents: 0 },
          ]
        : [
            { name: 'PSE Bancos', value: 42, color: '#2b47e5', amountInCents: 9466800000 },
            { name: 'Nequi Push', value: 28, color: '#f43f5e', amountInCents: 6311200000 },
            { name: 'Tarjetas Crédito/Débito', value: 22, color: '#10b981', amountInCents: 4958800000 },
            { name: 'Botón Bancolombia', value: 8, color: '#f59e0b', amountInCents: 1803200000 },
          ],
      todayRevenueInCents: todayRev,
      todayOrdersCount: todayOrders.length,
      pendingOrdersCount: pendingCount,
      wompiSuccessRate: isCleanSlate ? 100 : 98.4,
    };
  }, [orders]);

  // Puerta local: hashes bcrypt por correo (nunca texto plano en el repo).
  // Solo se instalan para correos SIN contraseña guardada; jamás sobrescriben.
  const SEEDED_ADMIN_PASSWORDS: Record<string, string> = {
    'admin@tutiendaalamano.co': '$2b$10$vYUh3pTN7N8a5ypUTRmdh.V7l6ArtqYHwElPb9s9vLlRkvaziQjIC',
    'tienda@tutiendaalamano.co': '$2b$10$F4CM4S0LnA7Kx8OWVCCgXO0ivWOZ3wV6/bHGp8Fzx6KWPEfON3wp2',
  };
  const ADMIN_HASHES_KEY = 'opus_admin_local_hashes';
  const readAdminHashMap = (): Record<string, string> => {
    try {
      const parsed = JSON.parse(safeGet(ADMIN_HASHES_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  };
  const ensureSeededAdminPasswords = (): void => {
    try {
      const map = readAdminHashMap();
      let changed = false;
      for (const [email, hash] of Object.entries(SEEDED_ADMIN_PASSWORDS)) {
        if (!map[email]) {
          map[email] = hash;
          changed = true;
        }
      }
      if (changed) safeSet(ADMIN_HASHES_KEY, JSON.stringify(map));
    } catch {
      // ignore
    }
  };

  const adminLogin = async (
    email: string,
    password?: string,
    _pin?: string,
    remember: boolean = true
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const pass = password || '';
    if (!cleanEmail.includes('@') || pass.length < 4) {
      return { success: false, error: 'Ingresa un correo válido y tu contraseña.' };
    }

    // 1) Backend real (producción): verifica hash bcrypt en Supabase.
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: pass }),
      });
      // Sin backend (hosting estático o proxy caído), la respuesta no es JSON
      // del backend: se usa la puerta local abajo. Solo un JSON con error
      // cuenta como "credenciales inválidas" reales.
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('no-backend');
      }
      const data = (await res.json().catch(() => ({}))) as any;
      if (!res.ok) {
        // El backend respondió JSON pero la red falló a nivel proxy (ej. 500
        // del proxy Vite sin backend): tratar como sin backend.
        if (res.status >= 500 && !data?.error) {
          throw new Error('no-backend');
        }
        return { success: false, error: data?.error || 'Credenciales inválidas.' };
      }
      if (res.ok && data?.token && data?.user) {
        storeAdminToken(data.token, remember);
        setCurrentAdminUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          roleTitle: data.user.roleTitle || data.user.role,
          avatarInitials: data.user.avatarInitials || data.user.name.slice(0, 2).toUpperCase(),
          lastLogin: new Date().toISOString(),
        } as AdminUser);
        setIsAdminAuthenticated(true);
        setAdminAuthMode('server');
        try {
          localStorage.removeItem('opus_admin_auth_v1');
          localStorage.removeItem('opus_admin_user_v1');
        } catch {
          // ignore
        }
        showToast('¡Bienvenido al Panel de Administración!');
        return { success: true };
      }
      // El backend respondió JSON sin token: credenciales malas o bloqueo. No hay fallback.
      return { success: false, error: data?.error || 'Credenciales inválidas.' };
    } catch {
      // Sin backend (modo estático/dev): sigue al gate local abajo.
    }

    // 2) Gate local multi-usuario (SOLO sin backend). Cada correo tiene su
    // propia contraseña (mín. 10 la primera vez). Es disuasorio, no barrera real.
    let bcryptLocal: { hash: (p: string, r: number) => Promise<string>; compare: (p: string, h: string) => Promise<boolean> };
    try {
      const mod = await import('bcryptjs');
      bcryptLocal = mod.default || mod;
    } catch {
      return { success: false, error: 'No se pudo cargar el verificador. Recarga la página (Ctrl+Shift+R) e intenta de nuevo.' };
    }
    // Instala las contraseñas iniciales del equipo (solo faltantes).
    ensureSeededAdminPasswords();
    const HASHES_KEY = ADMIN_HASHES_KEY;
    const readHashMap = readAdminHashMap;
    // Migra la puerta de un solo correo (versiones anteriores).
    try {
      const legacyHash = safeGet('opus_admin_local_hash');
      const legacyEmail = (safeGet('opus_admin_local_email') || '').trim().toLowerCase();
      if (legacyHash && legacyEmail) {
        const migrated = readHashMap();
        if (!migrated[legacyEmail]) {
          migrated[legacyEmail] = legacyHash;
          safeSet(HASHES_KEY, JSON.stringify(migrated));
        }
        try {
          localStorage.removeItem('opus_admin_local_hash');
          localStorage.removeItem('opus_admin_local_email');
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }
    try {
      const hashes = readHashMap();
      const storedHash = hashes[cleanEmail];
      if (!storedHash) {
        if (pass.length < 10) {
          return { success: false, error: 'Primera vez con este correo: crea una contraseña local de mínimo 10 caracteres.' };
        }
        const hash = await bcryptLocal.hash(pass, 10);
        hashes[cleanEmail] = hash;
        if (!safeSet(HASHES_KEY, JSON.stringify(hashes))) {
          return { success: false, error: 'No se pudo guardar la contraseña en este navegador.' };
        }
      } else {
        const ok = await bcryptLocal.compare(pass, storedHash);
        if (!ok) return { success: false, error: 'Credenciales inválidas.' };
      }
      const localUser = adminUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!localUser) {
        return { success: false, error: 'Ese correo no es miembro del equipo. Pídele acceso al Super Administrador.' };
      }
      setCurrentAdminUser({ ...localUser, lastLogin: new Date().toISOString() });
      setIsAdminAuthenticated(true);
      setAdminAuthMode('local');
      showToast('¡Bienvenido! (modo local sin backend)');
      return { success: true };
    } catch {
      return { success: false, error: 'No se pudo iniciar sesión.' };
    }
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminAuthMode(null);
    setCurrentAdminUser(null);
    try {
      const token =
        sessionStorage.getItem('opus_admin_token') || localStorage.getItem('opus_admin_token');
      if (token) {
        // Revoca en el servidor (best-effort, no bloquea el logout local).
        fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => undefined);
      }
      sessionStorage.removeItem('opus_admin_token');
      localStorage.removeItem('opus_admin_token');
      localStorage.removeItem('opus_admin_auth_v1');
      localStorage.removeItem('opus_admin_user_v1');
    } catch {
      // ignore
    }
    setActiveView('home');
    showToast('Sesión de administración cerrada de forma segura.');
  };

  const switchAdminUser = (userId: string) => {
    // En modo servidor el rol lo define el backend: no se permite suplantar
    // otro usuario desde el cliente.
    if (adminAuthMode === 'server') {
      showToast('⚠️ Con sesión de servidor no se puede cambiar de usuario. Cierra sesión e ingresa con la otra cuenta.');
      return;
    }
    // Solo el Super Administrador puede suplantar (ej. probar vistas).
    if (currentAdminUser && currentAdminUser.role !== 'SUPER_ADMIN') {
      showToast('⛔ Solo el Super Administrador puede cambiar de usuario.');
      return;
    }
    const target = adminUsers.find((u) => u.id === userId);
    if (target) {
      const updated = { ...target, lastLogin: new Date().toISOString() };
      setCurrentAdminUser(updated);
      showToast(`Rol cambiado a: ${target.name} (${target.roleTitle})`);
    }
  };

  // La gestión del equipo es administrativa: solo Super Administrador.
  const requireSuperAdmin = (): boolean => {
    if (currentAdminUser && currentAdminUser.role !== 'SUPER_ADMIN') {
      showToast('⛔ Solo el Super Administrador puede gestionar empleados.');
      return false;
    }
    return true;
  };

  const addAdminUser = (userData: Omit<AdminUser, 'id' | 'lastLogin'>) => {
    if (!requireSuperAdmin()) return;
    const newId = 'admin-' + Date.now();
    const initials =
      userData.avatarInitials ||
      userData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() ||
      'EM';

    const newUser: AdminUser = {
      ...userData,
      id: newId,
      avatarInitials: initials,
      lastLogin: new Date().toISOString(),
      status: userData.status || 'active',
      assignedModules: userData.assignedModules || ['orders', 'shipping', 'help-center'],
    };

    setAdminUsers((prev) => [...prev, newUser]);
    showToast(`Empleado ${newUser.name} creado exitosamente.`);
  };

  const updateAdminUser = (userId: string, updates: Partial<AdminUser>) => {
    if (!requireSuperAdmin()) return;
    setAdminUsers((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          const updated = { ...user, ...updates };
          if (updates.name && !updates.avatarInitials) {
            updated.avatarInitials = updates.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();
          }
          return updated;
        }
        return user;
      })
    );

    if (currentAdminUser?.id === userId) {
      setCurrentAdminUser((prev) => (prev ? { ...prev, ...updates } : null));
    }
    showToast('Permisos de empleado actualizados.');
  };

  const deleteAdminUser = (userId: string) => {
    if (!requireSuperAdmin()) return;
    if (userId === 'admin-1') {
      showToast('No se puede eliminar la cuenta del Administrador Principal.');
      return;
    }
    setAdminUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentAdminUser?.id === userId) {
      setCurrentAdminUser(adminUsers[0]);
    }
    showToast('Empleado eliminado del sistema.');
  };

  const hasModulePermission = (tab: AdminTab): boolean => {
    if (!currentAdminUser) return true;
    if (currentAdminUser.role === 'SUPER_ADMIN') return true;
    if (!currentAdminUser.assignedModules || currentAdminUser.assignedModules.length === 0) {
      // Role default fallback (vale también para sesiones de servidor sin módulos).
      // CUSTOM = operativo de negocio: sin nada administrativo o importante.
      if (currentAdminUser.role === 'CUSTOM') {
        return [
          'dashboard', 'catalog', 'orders', 'shipping', 'customers',
          'abandoned-checkouts', 'coupons', 'reviews', 'whatsapp-business',
          'notifications', 'help-center', 'store-preview',
        ].includes(tab);
      }
      if (currentAdminUser.role === 'LOGISTICS_MANAGER') {
        return ['dashboard', 'orders', 'shipping', 'customers', 'notifications', 'help-center', 'store-preview'].includes(tab);
      }
      if (currentAdminUser.role === 'FINANCE_MANAGER') {
        return ['dashboard', 'orders', 'wompi-reconciliation', 'reports', 'notifications', 'help-center', 'store-preview'].includes(tab);
      }
      if (currentAdminUser.role === 'SALES_MANAGER') {
        return ['dashboard', 'orders', 'abandoned-checkouts', 'customers', 'coupons', 'reviews', 'whatsapp-business', 'help-center', 'store-preview'].includes(tab);
      }
      // Rol desconocido sin módulos: denegar por defecto (menor privilegio).
      return false;
    }
    return currentAdminUser.assignedModules.includes(tab);
  };

  // Clean Database: wipes all mock products, orders, customers, coupons, reviews, abandoned checkouts, and carts
  const clearDatabase = () => {
    setProducts([]);
    setOrders([]);
    setCustomers([]);
    setCoupons([]);
    setReviews([]);
    setShippingGuides([]);
    setAbandonedCheckouts([]);
    setCart([]);
    setWishlist([]);
    setNotifications([]);
    setAppliedCoupon(null);
    setLatestCompletedOrder(null);
    setLatestLiveAlertOrder(null);
    setSelectedOrderForDetail(null);
    setQuickViewProduct(null);

    // Clear local storage keys to ensure fresh slate
    try {
      localStorage.removeItem('apex_cart_items_v2');
      localStorage.removeItem('opus_abandoned_checkouts_v1');
      localStorage.removeItem('opus_customer_addresses');
      localStorage.removeItem('opus_customer_profile_v1');
    } catch (e) {
      console.error('Error clearing localStorage keys:', e);
    }

    showToast('✨ Base de datos limpiada completamente. El sistema está en blanco para producción.');
  };

  // Reset to initial demo data (if user ever needs to preview demo catalogue again)
  const resetSystemToDemo = () => {
    setProducts(INITIAL_PRODUCTS);
    setSelectedProduct(INITIAL_PRODUCTS[0]);
    setOrders(INITIAL_ORDERS);
    setCustomers(INITIAL_CUSTOMERS);
    setCoupons(INITIAL_COUPONS);
    setReviews(INITIAL_REVIEWS);
    setShippingGuides(INITIAL_SHIPPING_GUIDES);
    setAbandonedCheckouts(INITIAL_ABANDONED_CHECKOUTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAppliedCoupon('MANO10');
    showToast('🔄 Datos de demostración restablecidos con éxito.');
  };

  return (
    <StoreContext.Provider
      value={{
        activeView,
        setActiveView,
        adminTab,
        setAdminTab,
        products,
        selectedProduct,
        setSelectedProduct,
        quickViewProduct,
        openQuickView,
        closeQuickView,
        openProductDetail,
        recentlyViewedIds,
        recordProductView,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        setShowcasePinned,
        moveShowcasePinned,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        openWishlist,
        closeWishlist,
        wishlist,
        toggleWishlist,
        orders,
        createOrder,
        updateOrderStatus,
        updateShippingStatus,
        selectedOrderForDetail,
        setSelectedOrderForDetail,
        customers,
        stockAlerts,
        notifications,
        unreadNotificationsCount,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        testAudioSound,
        coupons,
        appliedCoupon,
        setAppliedCoupon,
        applyCouponByCode,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCoupon,
        couponDiscountInCents,
        cartTotalInCents,
        cartSubtotalInCents,
        cartCount,
        shippingGuides,
        generateShippingGuide,
        updateShippingGuideStatus,
        reviews,
        addProductReview,
        updateReviewStatus,
        deleteReview,
        activeCategoryFilter,
        setActiveCategoryFilter,
        searchQuery,
        setSearchQuery,
        adminSearchQuery,
        setAdminSearchQuery,
        latestCompletedOrder,
        setLatestCompletedOrder,
        latestLiveAlertOrder,
        dismissLiveAlert,
        soundEnabled,
        toggleSound,
        simulateLiveOrder,
        webhookEventsCount,
        triggerSimulatedWebhook,
        processWompiWebhook,
        updateProductStock,
        toastMessage,
        showToast,
        analytics,
        looks,
        adminUsers,
        currentAdminUser,
        isAdminAuthenticated,
        adminAuthMode,
        adminLogin,
        adminLogout,
        switchAdminUser,
        addAdminUser,
        updateAdminUser,
        deleteAdminUser,
        hasModulePermission,
        adminSidebarMobileOpen,
        setAdminSidebarMobileOpen,
        commandPaletteOpen,
        setCommandPaletteOpen,
        themeConfig,
        setThemeConfig,
        updateThemeConfig,
        saveThemeToCloud,
        availableThemes,
        applyThemePreset,
        importThemeFromJson,
        exportThemeJson,
        resetThemeToDefault,
        pageLayout,
        setPageLayout,
        setPageBlocks,
        addBlock,
        updateBlock,
        deleteBlock,
        moveBlock,
        duplicateBlock,
        applyBuilderTemplate,
        toggleStorefrontLayoutMode,
        resetBuilderToDefault,
        exportPageLayoutJson,
        importPageLayoutJson,
        // Customer Profile & Account Portal
        currentCustomer,
        isCustomerLoggedIn,
        customerLogin,
        customerLogout,
        customerAddresses,
        addCustomerAddress,
        deleteCustomerAddress,
        setDefaultCustomerAddress,
        isCustomerProfileOpen,
        setIsCustomerProfileOpen,
        customerOrders,
        // Order Tracking for Customers (Zero Registration)
        isOrderTrackingOpen,
        setIsOrderTrackingOpen,
        trackingQuery,
        setTrackingQuery,
        openOrderTracking,
        // Abandoned Checkouts & Recovery
        abandonedCheckouts,
        saveAbandonedCheckout,
        markAbandonedCheckoutContacted,
        markAbandonedCheckoutRecovered,
        deleteAbandonedCheckout,
        restoreAbandonedCart,
        simulateAbandonedCheckout,
        sendAbandonedRecoveryWhatsApp,
        // Store Legal Policies Modal
        policyModalState,
        openPolicyModal,
        closePolicyModal,
        // Contextual Admin Help Assistant & Drawer
        adminHelpDrawerOpen,
        setAdminHelpDrawerOpen,
        adminHelpTopic,
        setAdminHelpTopic,
        openAdminHelp,
        // System Video Tutorials & Screencast Player
        systemVideoTutorialOpen,
        setSystemVideoTutorialOpen,
        activeSystemVideoId,
        setActiveSystemVideoId,
        openSystemVideoTutorial,
        closeSystemVideoTutorial,
        // Hero Image Position & Size Editor Modal
        isHeroImageEditorOpen,
        setIsHeroImageEditorOpen,
        openHeroImageEditor,
        closeHeroImageEditor,
        // Printable Commercial Invoice & Packing Slip
        printableInvoiceOrder,
        setPrintableInvoiceOrder,
        // Store Preferences & Marketing
        storePreferences,
        updateStorePreferences,
        // Store Music & Soundtrack Engine
        musicConfig,
        setMusicConfig,
        updateMusicConfig,
        isMusicPlaying,
        setIsMusicPlaying,
        toggleMusicPlayback,
        stopMusicPlayback,
        musicVolume,
        setMusicVolume,
        // WhatsApp Business Cloud API Integration Service
        whatsappConfig,
        setWhatsAppConfig,
        updateWhatsAppConfig,
        whatsappLogs,
        sendOrderWhatsAppNotification,
        testWhatsAppMessage,
        // Database & System Maintenance
        clearDatabase,
        resetSystemToDemo,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
