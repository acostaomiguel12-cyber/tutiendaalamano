import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialized Supabase client
let supabaseInstance: SupabaseClient | null = null;

export const cleanSupabaseUrl = (rawUrl: string): string => {
  if (!rawUrl) return '';
  let cleaned = rawUrl.trim();
  // Eliminar /rest/v1 o /rest/v1/ si el usuario lo copió desde la documentación o API docs
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, '');
  // Quitar slash final si existe
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
};

// Sin proyecto por defecto: modo 100% local. Solo se conecta si el admin
// configura credenciales (variables VITE_* o panel de administración).
const DEFAULT_SUPABASE_URL = '';
const DEFAULT_SUPABASE_KEY = '';

export const getSupabaseConfig = () => {
  let url = (import.meta as any).env?.VITE_SUPABASE_URL;
  let key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (typeof window !== 'undefined') {
    try {
      if (!url) url = localStorage.getItem('opus_supabase_url') || '';
      if (!key) key = localStorage.getItem('opus_supabase_anon_key') || '';
    } catch {
      // storage bloqueado (iframe): se usan env/defaults
    }
  }

  // Si no está definido en env o storage, usar las llaves oficiales del proyecto de Supabase
  if (!url) {
    url = DEFAULT_SUPABASE_URL;
  }
  if (!key) {
    key = DEFAULT_SUPABASE_KEY;
  }

  return { url: cleanSupabaseUrl(url), key: key.trim() };
};

export const setSupabaseCredentials = (url: string, key: string) => {
  const cleanedUrl = cleanSupabaseUrl(url);
  const cleanedKey = (key || '').trim();
  if (typeof window !== 'undefined') {
    try {
      if (cleanedUrl) localStorage.setItem('opus_supabase_url', cleanedUrl);
      if (cleanedKey) localStorage.setItem('opus_supabase_anon_key', cleanedKey);
    } catch {
      // ignore
    }
  }
  supabaseInstance = null; // Reiniciar instancia para tomar la nueva config
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const { url, key } = getSupabaseConfig();

  if (url && key && url.startsWith('http')) {
    try {
      supabaseInstance = createClient(url, key);
      return supabaseInstance;
    } catch (e) {
      console.warn('Error al inicializar Supabase:', e);
      return null;
    }
  }

  return null;
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key && url.startsWith('http'));
};

const ADMIN_SYNC_TABLES = new Set([
  'products',
  'product_variants',
  'page_layouts',
  'page_layout_blocks',
  'coupons',
  'store_theme_configs',
]);

function getAdminToken(): string | null {
  try {
    return (
      sessionStorage.getItem('opus_admin_token') ||
      localStorage.getItem('opus_admin_token') ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * Sync vía backend autenticado (service_role). true = lo tomó el servidor,
 * false = sin backend/sesión → el llamador usa escritura directa (modo dev/estático).
 */
export async function adminSync(
  table: string,
  rows?: any[],
  opts?: { onConflict?: string; deleteIds?: string[] },
  replaceLayoutId?: string
): Promise<boolean> {
  if (!ADMIN_SYNC_TABLES.has(table)) return false;
  const token = getAdminToken();
  if (!token) return false;
  try {
    const res = await fetch('/api/admin/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ table, rows, onConflict: opts?.onConflict, deleteIds: opts?.deleteIds, replaceLayoutId }),
    });
    // Solo vale si el backend respondió JSON (el hosting estático devuelve index.html).
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Guarda una orden en la tabla `orders` de Supabase PostgreSQL
 */
export const syncOrderToSupabase = async (order: any): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('orders').upsert({
      id: order.id,
      reference: order.reference,
      customer_id: order.customerId || null,
      coupon_id: order.couponId || null,
      customer: order.customer,
      items: order.items,
      subtotal_in_cents: order.subtotalInCents,
      discount_in_cents: order.discountInCents || 0,
      shipping_in_cents: order.shippingInCents || 0,
      tax_in_cents: order.taxInCents || 0,
      total_amount_in_cents: order.totalAmountInCents,
      currency: order.currency || 'COP',
      status: order.status,
      shipping_status: order.shippingStatus,
      tracking_number: order.trackingNumber || null,
      carrier: order.carrier || null,
      notes: order.notes || null,
      wompi_transaction: order.wompiTransaction || null,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
    });

    if (error) {
      console.error('Error al sincronizar orden con Supabase:', error.message);
      return false;
    }

    // Sincronizar en la tabla relacional order_items
    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      const orderItemsToInsert = order.items.map((it: any) => ({
        order_id: order.id,
        product_id: it.productId || null,
        variant_id: it.variantId || null,
        product_title: it.title || it.productTitle || 'Producto de Tu Tienda a la Mano',
        sku: it.sku || null,
        size: it.size || 'M',
        color: it.color || 'Onyx Black',
        quantity: it.quantity || 1,
        unit_price_in_cents: it.unitPriceInCents || it.priceInCents || 0,
        total_price_in_cents: (it.unitPriceInCents || it.priceInCents || 0) * (it.quantity || 1),
      }));

      await supabase.from('order_items').insert(orderItemsToInsert);
    }

    // Sincronizar en la tabla relacional wompi_transactions si existe transacción
    if (order.wompiTransaction && order.wompiTransaction.id) {
      await supabase.from('wompi_transactions').upsert(
        {
          order_id: order.id,
          customer_id: order.customerId || null,
          wompi_transaction_id: order.wompiTransaction.id,
          amount_in_cents: order.wompiTransaction.amountInCents || order.totalAmountInCents,
          currency: order.currency || 'COP',
          status: order.wompiTransaction.status || order.status,
          payment_method_type: order.wompiTransaction.paymentMethod || 'BANCOLOMBIA_TRANSFER',
          signature: order.wompiTransaction.signature || null,
          reference: order.reference,
          raw_payload: order.wompiTransaction,
        },
        { onConflict: 'wompi_transaction_id' }
      );
    }
    return true;
  } catch (err) {
    console.error('Excepción al sincronizar orden con Supabase:', err);
    return false;
  }
};

/**
 * Guarda o actualiza un cliente en la tabla `customers` de Supabase PostgreSQL
 */
export const syncCustomerToSupabase = async (customer: any): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('customers').upsert(
      {
        id: customer.id,
        full_name: customer.fullName,
        email: customer.email.toLowerCase(),
        phone: customer.phone,
        department: customer.department,
        city: customer.city,
        total_orders: customer.totalOrders || 0,
        ltv_in_cents: customer.ltvInCents || 0,
        last_order_date: customer.lastOrderDate ? new Date(customer.lastOrderDate).toISOString() : null,
        tier: customer.tier || 'NUEVO',
        vip_points: customer.vipPoints || 0,
        avatar_url: customer.avatarUrl || null,
      },
      { onConflict: 'email' }
    );

    if (error) {
      console.error('Error al sincronizar cliente con Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Excepción al sincronizar cliente con Supabase:', err);
    return false;
  }
};

/**
 * Carga productos desde la tabla `products` de Supabase PostgreSQL
 */
export const fetchProductsFromSupabase = async (): Promise<any[] | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*)')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return null;
    }

    return data.map((item: any) => {
      const rawVariants = Array.isArray(item.product_variants) && item.product_variants.length > 0
        ? item.product_variants
        : (Array.isArray(item.variants) && item.variants.length > 0 ? item.variants : []);

      const mappedVariants = rawVariants.map((v: any) => ({
        id: v.id || `var-${item.id}-${Math.random().toString(36).substring(2, 6)}`,
        sku: v.sku || item.reference || 'SKU-OPUS',
        colorName: v.color_name || v.colorName || 'Onyx Black',
        colorHex: v.color_hex || v.colorHex || '#121214',
        size: v.size || 'M',
        priceInCents: Number(v.price_in_cents || v.priceInCents || 17990000),
        originalPriceInCents: v.original_price_in_cents
          ? Number(v.original_price_in_cents)
          : (v.originalPriceInCents ? Number(v.originalPriceInCents) : undefined),
        stock: Number(v.stock ?? 10),
        stockReserved: Number(v.stock_reserved ?? v.stockReserved ?? 0),
        images: Array.isArray(v.images) && v.images.length > 0 ? v.images : [item.main_image || ''],
      }));

      // Fallback si no hay variantes en la base de datos
      const finalVariants = mappedVariants.length > 0
        ? mappedVariants
        : [
            {
              id: `var-${item.id}-default`,
              sku: item.reference || 'OPUS-DEF-M',
              colorName: 'Onyx Black',
              colorHex: '#121214',
              size: 'M',
              priceInCents: 17990000,
              stock: 10,
              stockReserved: 0,
              images: [item.main_image || ''],
            },
          ];

      return {
        id: item.id,
        title: item.title || 'Producto de Tu Tienda a la Mano',
        slug: item.slug || 'producto-tienda',
        reference: item.reference || 'OPUS-REF',
        category: item.category || item.category_name || 'General',
        subcategory: item.subcategory || '',
        badge: item.badge || '',
        discountPercentage: item.discount_percentage ? Number(item.discount_percentage) : 0,
        rating: Number(item.rating || 5.0),
        reviewsCount: Number(item.reviews_count || 0),
        salesLast24h: Number(item.sales_last_24h || 0),
        description: item.description || '',
        features: Array.isArray(item.features) ? item.features : [],
        materials: item.materials || '',
        shippingInfo: item.shipping_info || '',
        returnPolicy: item.return_policy || '',
        active: item.active !== false,
        availableSizes: Array.isArray(item.available_sizes) ? item.available_sizes : ['S', 'M', 'L', 'XL'],
        availableColors: Array.isArray(item.available_colors) ? item.available_colors : [{ name: 'Onyx Black', hex: '#121214' }],
        mainImage: item.main_image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
        thumbnailImages: Array.isArray(item.thumbnail_images) ? item.thumbnail_images : [],
        imagePosition: item.image_position || item.imagePosition || 'center',
        showcasePinned: !!item.showcase_pinned,
        variants: finalVariants,
      };
    });
  } catch (err) {
    console.warn('No se pudieron cargar productos de Supabase:', err);
    return null;
  }
};

/**
 * Carga órdenes desde la tabla `orders` de Supabase PostgreSQL
 */
export const fetchOrdersFromSupabase = async (): Promise<any[] | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return null;
    }

    return data.map((item: any) => ({
      id: item.id,
      reference: item.reference,
      customerId: item.customer_id,
      customer: item.customer,
      items: item.items,
      subtotalInCents: Number(item.subtotal_in_cents),
      discountInCents: Number(item.discount_in_cents),
      shippingInCents: Number(item.shipping_in_cents),
      taxInCents: Number(item.tax_in_cents),
      totalAmountInCents: Number(item.total_amount_in_cents),
      currency: item.currency,
      status: item.status,
      shippingStatus: item.shipping_status,
      trackingNumber: item.tracking_number,
      carrier: item.carrier,
      notes: item.notes,
      wompiTransaction: item.wompi_transaction,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch (err) {
    console.warn('No se pudieron cargar órdenes de Supabase:', err);
    return null;
  }
};

/**
 * Guarda o actualiza el diseño visual (page_layouts) y sus bloques normalizados (page_layout_blocks)
 */
export const syncPageLayoutToSupabase = async (layout: any): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const layoutRow = {
      id: layout.id || 'layout-official',
      name: layout.name || 'Diseño Gutenberg Drag & Drop Oficial',
      enabled_in_storefront: !!layout.enabledInStorefront,
      blocks: layout.blocks || [],
      updated_at: new Date().toISOString(),
    };
    // 1. Guardar o actualizar el layout principal
    const viaServer = await adminSync('page_layouts', [layoutRow], { onConflict: 'id' });
    if (!viaServer) {
      const { error: layoutError } = await supabase.from('page_layouts').upsert(layoutRow, { onConflict: 'id' });

      if (layoutError) {
        console.error('Error al sincronizar page_layouts con Supabase:', layoutError.message);
        return false;
      }
    }

    // 2. Normalizar y guardar los bloques en page_layout_blocks
    if (layout.blocks && Array.isArray(layout.blocks) && layout.blocks.length > 0) {
      const flattenedBlocks: any[] = [];

      const processBlock = (blk: any, index: number, parentId: string | null = null, col: number = 1) => {
        flattenedBlocks.push({
          id: blk.id || `blk-${Date.now()}-${index}`,
          layout_id: layout.id || 'layout-official',
          parent_block_id: parentId,
          category_id: blk.categoryFilter && blk.categoryFilter !== 'all' ? blk.categoryFilter : null,
          featured_product_id: blk.productId || null,
          block_type: blk.type || 'container',
          display_order: index,
          target_column: col,
          enabled: blk.enabled !== false,
          title: blk.title || null,
          content: blk.content || null,
          subcontent: blk.subcontent || null,
          media_type: blk.mediaType || 'image',
          media_url: blk.videoUrl || blk.imageUrl || null,
          button_text: blk.buttonText || null,
          button_link: blk.buttonLink || null,
          button_variant: blk.buttonVariant || null,
          heading_level: blk.headingLevel || null,
          category_filter: blk.categoryFilter || null,
          styles: blk.styles || {},
          config: {
            aspectRatio: blk.aspectRatio,
            productsLimit: blk.productsLimit,
            productsColumns: blk.productsColumns,
            productCardStyle: blk.productCardStyle,
            spacerHeight: blk.spacerHeight,
            bannerHeight: blk.bannerHeight,
            overlayOpacity: blk.overlayOpacity,
            videoAutoplay: blk.videoAutoplay,
            videoMuted: blk.videoMuted,
            videoLoop: blk.videoLoop,
            showcaseCount: blk.showcaseCount,
            showcaseIntervalSec: blk.showcaseIntervalSec,
            showCategoryNav: blk.showCategoryNav,
            showSearch: blk.showSearch,
            showSort: blk.showSort,
          },
        });

        if (blk.children && Array.isArray(blk.children)) {
          blk.children.forEach((child: any, cIdx: number) => processBlock(child, cIdx, blk.id, 1));
        }
        if (blk.childrenColumn2 && Array.isArray(blk.childrenColumn2)) {
          blk.childrenColumn2.forEach((child: any, cIdx: number) => processBlock(child, cIdx, blk.id, 2));
        }
      };

      layout.blocks.forEach((blk: any, idx: number) => processBlock(blk, idx, null, 1));

      // Limpiar bloques antiguos y reinsertar normalizados
      const layoutId = layout.id || 'layout-official';
      const blocksViaServer = await adminSync('page_layout_blocks', flattenedBlocks, { onConflict: 'id' }, layoutId);
      if (!blocksViaServer) {
        const { error: delError } = await supabase.from('page_layout_blocks').delete().eq('layout_id', layoutId);
        if (delError) {
          console.error('Error al limpiar bloques antiguos en Supabase:', delError.message);
          return false;
        }
        const { error: insError } = await supabase.from('page_layout_blocks').insert(flattenedBlocks);
        if (insError) {
          console.error('Error al guardar bloques en Supabase:', insError.message);
          return false;
        }
      }
    }

    return true;
  } catch (err) {
    console.error('Excepción al sincronizar page_layouts con Supabase:', err);
    return false;
  }
};

/**
 * Carga el diseño de página desde Supabase
 */
export const fetchPageLayoutFromSupabase = async (): Promise<any | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('page_layouts')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      enabledInStorefront: data.enabled_in_storefront,
      blocks: data.blocks,
      updatedAt: data.updated_at,
    };
  } catch (err) {
    console.warn('No se pudo cargar page_layout desde Supabase:', err);
    return null;
  }
};

const THEME_ROW_ID = 'theme-active';

/**
 * Guarda el tema activo en Supabase (store_theme_configs) para que el diseño
 * aplique en todos los dispositivos y contextos (admin, tienda, AI Studio).
 * Vía backend autenticado si hay sesión; si no, escritura directa.
 */
export const syncThemeToSupabase = async (theme: any): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const row = {
      id: THEME_ROW_ID,
      name: theme.name || 'Tema activo Tu Tienda a la Mano',
      preset: theme.preset || 'custom',
      mode: theme.mode || 'dark',
      config: theme,
      is_active: true,
      updated_at: new Date().toISOString(),
    };
    const viaServer = await adminSync('store_theme_configs', [row], { onConflict: 'id' });
    if (viaServer) return true;
    const { error } = await supabase.from('store_theme_configs').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('No se pudo sincronizar el tema:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Excepción al sincronizar tema:', err);
    return false;
  }
};

/** Carga el tema activo desde Supabase. null = no hay o sin conexión. */
export const fetchThemeFromSupabase = async (): Promise<{ theme: any; updatedAt: string } | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('store_theme_configs')
      .select('*')
      .eq('id', THEME_ROW_ID)
      .maybeSingle();
    if (error || !data?.config) return null;
    return { theme: data.config, updatedAt: data.updated_at };
  } catch (err) {
    console.warn('No se pudo cargar el tema desde Supabase:', err);
    return null;
  }
};

/**
 * Guarda o actualiza un producto y sus variantes en Supabase PostgreSQL
 */
export const syncProductToSupabase = async (product: any): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const productRow = {
      id: product.id,
      title: product.title,
      slug: product.slug,
      reference: product.reference,
      category_name: product.category,
      subcategory: product.subcategory || null,
      badge: product.badge || null,
      discount_percentage: product.discountPercentage || 0,
      rating: product.rating || 5.0,
      reviews_count: product.reviewsCount || 0,
      sales_last_24h: product.salesLast24h || 0,
      description: product.description || '',
      features: product.features || [],
      materials: product.materials || '',
      shipping_info: product.shippingInfo || '',
      return_policy: product.returnPolicy || '',
      active: product.active !== false,
      available_sizes: product.availableSizes || [],
      available_colors: product.availableColors || [],
      main_image: product.mainImage,
      thumbnail_images: product.thumbnailImages || [product.mainImage],
      image_position: product.imagePosition || 'center',
        showcase_pinned: !!product.showcasePinned,
      variants: product.variants || [],
      updated_at: new Date().toISOString(),
    };
    // 1. Guardar producto principal (vía backend autenticado si hay sesión)
    const viaServer = await adminSync('products', [productRow], { onConflict: 'id' });
    if (!viaServer) {
      const { error: prodError } = await supabase.from('products').upsert(productRow, { onConflict: 'id' });

      if (prodError) {
        console.warn('Advertencia al sincronizar producto con Supabase:', prodError.message);
        return false;
      }
    }

    // 2. Sincronizar variantes en la tabla relacional product_variants
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      const variantsToUpsert = product.variants.map((v: any, index: number) => ({
        id: v.id || `var-${product.id}-${index}`,
        product_id: product.id,
        sku: v.sku || `${product.reference}-${v.size}-${index}`,
        color_name: v.colorName || 'Onyx Black',
        color_hex: v.colorHex || '#121214',
        size: v.size || 'M',
        price_in_cents: v.priceInCents || 17990000,
        original_price_in_cents: v.originalPriceInCents || null,
        stock: v.stock ?? 10,
        stock_reserved: v.stockReserved ?? 0,
        images: v.images && v.images.length > 0 ? v.images : [product.mainImage],
        updated_at: new Date().toISOString(),
      }));

      const variantsViaServer = await adminSync('product_variants', variantsToUpsert, { onConflict: 'id' });
      if (!variantsViaServer) {
        await supabase.from('product_variants').upsert(variantsToUpsert, { onConflict: 'id' });
      }
    }

    return true;
  } catch (err) {
    console.warn('Excepción al sincronizar producto con Supabase:', err);
    return false;
  }
};

/**
 * Elimina un producto de Supabase PostgreSQL
 */
export const deleteProductFromSupabase = async (productId: string): Promise<boolean> => {
  // Vía backend autenticado si hay sesión (borra variantes + producto).
  const variantIds = await fetchVariantIds(productId);
  const viaServer = await adminSync('product_variants', undefined, { deleteIds: variantIds })
    .then(async (ok) => ok && (await adminSync('products', undefined, { deleteIds: [productId] })));
  if (viaServer) return true;

  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    await supabase.from('product_variants').delete().eq('product_id', productId);
    const { error } = await supabase.from('products').delete().eq('id', productId);
    return !error;
  } catch {
    return false;
  }
};

async function fetchVariantIds(productId: string): Promise<string[]> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data } = await supabase.from('product_variants').select('id').eq('product_id', productId);
    return (data || []).map((v: any) => v.id);
  } catch {
    return [];
  }
}

/**
 * Sincroniza todos los productos locales hacia Supabase PostgreSQL
 */
export const syncAllProductsToSupabase = async (products: any[]): Promise<number> => {
  let count = 0;
  for (const p of products) {
    const ok = await syncProductToSupabase(p);
    if (ok) count++;
  }
  return count;
};

/**
 * Prueba la conectividad real con la base de datos Supabase PostgreSQL
 */
export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string; latencyMs: number }> => {
  const startTime = performance.now();
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      message: 'Cliente Supabase no configurado o credenciales inválidas.',
      latencyMs: 0,
    };
  }

  try {
    const { error } = await supabase.from('products').select('id').limit(1);
    const latencyMs = Math.max(12, Math.round(performance.now() - startTime));

    if (error) {
      return {
        success: false,
        message: `Respuesta de Supabase: ${error.message}`,
        latencyMs,
      };
    }

    return {
      success: true,
      message: `Conexión a Supabase Cloud PostgreSQL verificada exitosamente en ${latencyMs}ms.`,
      latencyMs,
    };
  } catch (err: any) {
    const latencyMs = Math.max(15, Math.round(performance.now() - startTime));
    return {
      success: false,
      message: `Fallo de red al conectar con Supabase: ${err?.message || String(err)}`,
      latencyMs,
    };
  }
};
