// Sube el catálogo local (mock rebrandeado) a Supabase. Uso: npx tsx scripts/push-catalog.ts
// Lee URL/KEY de .env.local (no imprime secretos).
import 'dotenv/config';
import { config as dotenvConfig } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_PRODUCTS, INITIAL_COUPONS } from '../src/data/mockDatabase.ts';

dotenvConfig({ path: '.env.local' });

const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

if (!url || !key) {
  console.error('Falta URL/KEY de Supabase en .env.local');
  process.exit(1);
}

const sb = createClient(url, key);

const CATEGORIES = [
  { id: 'cat-ropa', name: 'Ropa', slug: 'ropa', description: 'Ropa para todos.', display_order: 1 },
  { id: 'cat-hogar', name: 'Hogar', slug: 'hogar', description: 'Hogar y decoración.', display_order: 2 },
  { id: 'cat-mascotas', name: 'Mascotas', slug: 'mascotas', description: 'Mascotas felices.', display_order: 3 },
  { id: 'cat-cafe', name: 'Café e Infusiones', slug: 'cafe-infusiones', description: 'Café de origen e infusiones.', display_order: 4 },
  { id: 'cat-accesorios', name: 'Accesorios', slug: 'accesorios', description: 'Accesorios top.', display_order: 5 },
];
const catIdByName = new Map(CATEGORIES.map((c) => [c.name, c.id]));

async function main(): Promise<void> {
  const { error: catErr } = await sb.from('categories').upsert(CATEGORIES, { onConflict: 'id' });
  if (catErr) throw new Error('categories: ' + catErr.message);
  console.log(`categorías: ${CATEGORIES.length}`);

  let products = 0;
  let variants = 0;
  for (const product of INITIAL_PRODUCTS as any[]) {
    const row = {
      id: product.id,
      category_id: catIdByName.get(product.category) || null,
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
    const { error: prodErr } = await sb.from('products').upsert(row, { onConflict: 'id' });
    if (prodErr) throw new Error(`products ${product.id}: ` + prodErr.message);
    products++;

    const vars = (product.variants || []).map((v: any, index: number) => ({
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
    if (vars.length > 0) {
      const { error: varErr } = await sb.from('product_variants').upsert(vars, { onConflict: 'id' });
      if (varErr) throw new Error(`variants ${product.id}: ` + varErr.message);
      variants += vars.length;
    }
  }
  console.log(`productos: ${products}, variantes: ${variants}`);

  const couponRows = (INITIAL_COUPONS as any[]).map((c) => ({
    id: c.id,
    code: c.code,
    discount_type: c.type === 'FIXED' ? 'FIXED_AMOUNT' : 'PERCENTAGE',
    value: c.value,
    min_order_amount_in_cents: c.minPurchaseInCents || 0,
    max_discount_in_cents: null,
    active: c.active !== false,
    usage_count: c.usedCount || 0,
    usage_limit: c.maxUses || null,
    expires_at: c.expiresAt ? new Date(c.expiresAt).toISOString() : null,
  }));
  const { error: coupErr } = await sb.from('coupons').upsert(couponRows, { onConflict: 'id' });
  if (coupErr) throw new Error('coupons: ' + coupErr.message);
  console.log(`cupones: ${couponRows.length}`);
}

main().then(
  () => console.log('OK catálogo en la nube'),
  (err) => {
    console.error('FALLO:', err?.message || err);
    process.exit(1);
  }
);
