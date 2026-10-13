-- ==============================================================================
-- TU TIENDA A LA MANO // ESQUEMA RELACIONAL COMPLETO PARA SUPABASE (POSTGRESQL)
-- Versión: 3.0 (Relaciones Completas para Page Layouts, Theme Builder & Catalog)
-- ==============================================================================

-- 1. EXTENSIONES DE POSTGRESQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Limpieza preventiva ordenada con eliminación en cascada si ya existían tablas
DROP TABLE IF EXISTS public.page_layout_blocks CASCADE;
DROP TABLE IF EXISTS public.page_layouts CASCADE;
DROP TABLE IF EXISTS public.store_theme_configs CASCADE;
DROP TABLE IF EXISTS public.admin_activity_logs CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.stock_alerts CASCADE;
DROP TABLE IF EXISTS public.product_reviews CASCADE;
DROP TABLE IF EXISTS public.wompi_transactions CASCADE;
DROP TABLE IF EXISTS public.shipping_guides CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.customer_addresses CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.product_variants CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- ==============================================================================
-- 2. TABLA: ADMIN_USERS (EQUIPO ADMINISTRATIVO & ROLES RBAC)
-- ==============================================================================
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'SUPER_ADMIN', -- 'SUPER_ADMIN', 'LOGISTICS_MANAGER', 'FINANCE_MANAGER'
  role_title TEXT NOT NULL DEFAULT 'Super Admin',
  avatar_initials TEXT DEFAULT 'SA',
  last_login TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 3. TABLA: CATEGORIES (CATEGORÍAS DE PRODUCTOS)
-- ==============================================================================
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 4. TABLA: PRODUCTS (CATÁLOGO PRINCIPAL DE PRODUCTOS)
-- Relación 1: Pertenece a una Categoría (FK -> categories.id)
-- ==============================================================================
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  reference TEXT NOT NULL UNIQUE,
  category_name TEXT NOT NULL,
  subcategory TEXT,
  badge TEXT,
  discount_percentage INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  sales_last_24h INTEGER DEFAULT 0,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  materials TEXT,
  shipping_info TEXT,
  return_policy TEXT,
  active BOOLEAN DEFAULT true,
  available_sizes JSONB DEFAULT '[]'::jsonb,
  available_colors JSONB DEFAULT '[]'::jsonb,
  main_image TEXT NOT NULL,
  thumbnail_images JSONB DEFAULT '[]'::jsonb,
  variants JSONB DEFAULT '[]'::jsonb,
  image_position TEXT DEFAULT 'center',
  showcase_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_active ON public.products(active);
CREATE INDEX idx_products_slug ON public.products(slug);

-- ==============================================================================
-- 5. TABLA: PRODUCT_VARIANTS (VARIANTES DE PRODUCTO: TALLAS, COLORES, SKUS Y STOCK)
-- Relación: Cada variante pertenece estrictamente a un Producto (FK -> products.id)
-- ==============================================================================
CREATE TABLE public.product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  color_name TEXT NOT NULL,
  color_hex TEXT,
  size TEXT NOT NULL,
  price_in_cents BIGINT NOT NULL,
  original_price_in_cents BIGINT,
  stock INTEGER NOT NULL DEFAULT 0,
  stock_reserved INTEGER NOT NULL DEFAULT 0,
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON public.product_variants(sku);

-- ==============================================================================
-- 6. TABLA: CUSTOMERS (CLIENTES DE LA TIENDA & MÉTRICAS LTV)
-- ==============================================================================
CREATE TABLE public.customers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  department TEXT,
  city TEXT,
  total_orders INTEGER DEFAULT 0,
  ltv_in_cents BIGINT DEFAULT 0,
  last_order_date TIMESTAMPTZ,
  tier TEXT DEFAULT 'NUEVO',
  vip_points INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_customers_email ON public.customers(email);

-- ==============================================================================
-- 7. TABLA: CUSTOMER_ADDRESSES (LIBRETA DE DIRECCIONES)
-- Relación: Pertenece a un Cliente (FK -> customers.id)
-- ==============================================================================
CREATE TABLE public.customer_addresses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Casa',
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  department TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  neighborhood TEXT,
  extra_details TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_customer_addresses_customer_id ON public.customer_addresses(customer_id);

-- ==============================================================================
-- 8. TABLA: COUPONS (CUPONES DE DESCUENTO)
-- ==============================================================================
CREATE TABLE public.coupons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'PERCENTAGE',
  value NUMERIC NOT NULL,
  min_order_amount_in_cents BIGINT DEFAULT 0,
  max_discount_in_cents BIGINT,
  active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  usage_limit INTEGER,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_coupons_code ON public.coupons(code);

-- ==============================================================================
-- 9. TABLA: ORDERS (PEDIDOS & TRANSACCIONES WOMPI)
-- Relación 1: Pertenece a un Cliente (FK -> customers.id)
-- Relación 2: Puede haber utilizado un Cupón (FK -> coupons.id)
-- ==============================================================================
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reference TEXT NOT NULL UNIQUE,
  customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
  coupon_id TEXT REFERENCES public.coupons(id) ON DELETE SET NULL,
  customer JSONB NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal_in_cents BIGINT NOT NULL,
  discount_in_cents BIGINT DEFAULT 0,
  shipping_in_cents BIGINT DEFAULT 0,
  tax_in_cents BIGINT DEFAULT 0,
  total_amount_in_cents BIGINT NOT NULL,
  currency TEXT DEFAULT 'COP',
  status TEXT DEFAULT 'PENDING',
  shipping_status TEXT DEFAULT 'UNFULFILLED',
  tracking_number TEXT,
  carrier TEXT,
  notes TEXT,
  wompi_transaction JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_coupon_id ON public.orders(coupon_id);
CREATE INDEX idx_orders_reference ON public.orders(reference);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- ==============================================================================
-- 10. TABLA: ORDER_ITEMS (DETALLE DE ÍTEMS / LÍNEAS DE CADA PEDIDO)
-- Relación 1: Pertenece a un Pedido (FK -> orders.id)
-- Relación 2: Apunta al Producto original (FK -> products.id)
-- Relación 3: Apunta a la Variante/SKU exacto (FK -> product_variants.id)
-- ==============================================================================
CREATE TABLE public.order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id TEXT REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  sku TEXT,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_in_cents BIGINT NOT NULL,
  total_price_in_cents BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX idx_order_items_variant_id ON public.order_items(variant_id);

-- ==============================================================================
-- 11. TABLA: SHIPPING_GUIDES (GUÍAS DE TRANSPORTE Y LOGÍSTICA NACIONAL)
-- Relación 1: Pertenece a un Pedido (FK -> orders.id)
-- Relación 2: Pertenece a un Cliente (FK -> customers.id)
-- ==============================================================================
CREATE TABLE public.shipping_guides (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
  order_reference TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  carrier TEXT NOT NULL DEFAULT 'Coordinadora',
  tracking_number TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'GENERATED',
  shipping_cost_in_cents BIGINT DEFAULT 0,
  estimated_delivery TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_shipping_guides_order_id ON public.shipping_guides(order_id);
CREATE INDEX idx_shipping_guides_customer_id ON public.shipping_guides(customer_id);

-- ==============================================================================
-- 12. TABLA: WOMPI_TRANSACTIONS (AUDITORÍA & CONCILIACIÓN DE PAGOS WOMPI)
-- Relación 1: Pertenece a un Pedido (FK -> orders.id)
-- Relación 2: Pertenece a un Cliente (FK -> customers.id)
-- ==============================================================================
CREATE TABLE public.wompi_transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
  wompi_transaction_id TEXT NOT NULL UNIQUE,
  amount_in_cents BIGINT NOT NULL,
  currency TEXT DEFAULT 'COP',
  status TEXT NOT NULL,
  payment_method_type TEXT NOT NULL,
  signature TEXT,
  reference TEXT NOT NULL,
  raw_payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_wompi_transactions_order_id ON public.wompi_transactions(order_id);
CREATE INDEX idx_wompi_transactions_customer_id ON public.wompi_transactions(customer_id);

-- ==============================================================================
-- 13. TABLA: PRODUCT_REVIEWS (RESEÑAS & SOCIAL PROOF)
-- Relación 1: Pertenece a un Producto (FK -> products.id)
-- Relación 2: Opcionalmente asociada a un Cliente verificado (FK -> customers.id)
-- ==============================================================================
CREATE TABLE public.product_reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'APPROVED',
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_reviews_customer_id ON public.product_reviews(customer_id);

-- ==============================================================================
-- 14. TABLA: STOCK_ALERTS (ALERTAS DE INVENTARIO CRÍTICO)
-- Relación 1: Pertenece a un Producto (FK -> products.id)
-- Relación 2: Pertenece a una Variante específica (FK -> product_variants.id)
-- ==============================================================================
CREATE TABLE public.stock_alerts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id TEXT REFERENCES public.product_variants(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  current_stock INTEGER NOT NULL,
  threshold INTEGER NOT NULL DEFAULT 5,
  severity TEXT DEFAULT 'MEDIUM',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_stock_alerts_product_id ON public.stock_alerts(product_id);
CREATE INDEX idx_stock_alerts_variant_id ON public.stock_alerts(variant_id);

-- ==============================================================================
-- 15. TABLA: NOTIFICATIONS (NOTIFICACIONES DEL SISTEMA Y EVENTOS DE VENTAS)
-- Relación: Opcionalmente ligada a un Pedido (FK -> orders.id)
-- ==============================================================================
CREATE TABLE public.notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'SYSTEM',
  read BOOLEAN DEFAULT false,
  order_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_order_id ON public.notifications(order_id);

-- ==============================================================================
-- 16. TABLA: ADMIN_ACTIVITY_LOGS (AUDITORÍA DE ACCIONES ADMINISTRATIVAS)
-- Relación 1: Administrador que ejecutó la acción (FK -> admin_users.id)
-- Relación 2: Pedido involucrado en la acción (FK -> orders.id)
-- ==============================================================================
CREATE TABLE public.admin_activity_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  admin_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activity_logs_admin_id ON public.admin_activity_logs(admin_id);
CREATE INDEX idx_activity_logs_order_id ON public.admin_activity_logs(order_id);

-- ==============================================================================
-- 17. TABLA: STORE_THEME_CONFIGS (TEMAS VISUALES & PALETA DEL STOREFRONT)
-- Relación: Administrador que creó o editó el tema (FK -> admin_users.id)
-- ==============================================================================
CREATE TABLE public.store_theme_configs (
  id TEXT PRIMARY KEY,
  created_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  preset TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'dark',
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_store_theme_configs_created_by ON public.store_theme_configs(created_by);

-- ==============================================================================
-- 18. TABLA: PAGE_LAYOUTS (DISEÑOS DE PÁGINA DRAG & DROP / WORDPRESS BUILDER)
-- Relación 1: Pertenece a una Configuración de Tema (FK -> store_theme_configs.id)
-- Relación 2: Administrador que creó o editó el diseño (FK -> admin_users.id)
-- Relación 3: Opcionalmente asignado como diseño para una Categoría (FK -> categories.id)
-- Relación 4: Opcionalmente asignado como landing para un Producto (FK -> products.id)
-- ==============================================================================
CREATE TABLE public.page_layouts (
  id TEXT PRIMARY KEY DEFAULT 'layout-official',
  theme_id TEXT REFERENCES public.store_theme_configs(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT 'Diseño Gutenberg Drag & Drop Oficial',
  slug TEXT NOT NULL DEFAULT 'home',
  enabled_in_storefront BOOLEAN DEFAULT false,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_page_layouts_theme_id ON public.page_layouts(theme_id);
CREATE INDEX idx_page_layouts_created_by ON public.page_layouts(created_by);
CREATE INDEX idx_page_layouts_category_id ON public.page_layouts(category_id);
CREATE INDEX idx_page_layouts_product_id ON public.page_layouts(product_id);

-- ==============================================================================
-- 19. TABLA: PAGE_LAYOUT_BLOCKS (BLOQUES INDIVIDUALES DEL BUILDER NORMALIZADOS)
-- Relación 1: Pertenece a un Layout (FK -> page_layouts.id)
-- Relación 2: Bloque anidado dentro de un contenedor/columna (FK -> page_layout_blocks.id)
-- Relación 3: Si el bloque filtra por categoría (FK -> categories.id)
-- Relación 4: Si el bloque destaca un producto o banner de prenda (FK -> products.id)
-- ==============================================================================
CREATE TABLE public.page_layout_blocks (
  id TEXT PRIMARY KEY,
  layout_id TEXT NOT NULL REFERENCES public.page_layouts(id) ON DELETE CASCADE,
  parent_block_id TEXT REFERENCES public.page_layout_blocks(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  featured_product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  block_type TEXT NOT NULL, -- 'container', 'columns-2', 'heading', 'product-grid', 'banner', 'trust-badges'
  display_order INTEGER NOT NULL DEFAULT 0,
  target_column INTEGER DEFAULT 1,
  enabled BOOLEAN DEFAULT true,
  title TEXT,
  content TEXT,
  subcontent TEXT,
  media_type TEXT DEFAULT 'image',
  media_url TEXT,
  button_text TEXT,
  button_link TEXT,
  button_variant TEXT,
  heading_level TEXT,
  category_filter TEXT,
  styles JSONB DEFAULT '{}'::jsonb,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_page_layout_blocks_layout_id ON public.page_layout_blocks(layout_id);
CREATE INDEX idx_page_layout_blocks_category_id ON public.page_layout_blocks(category_id);
CREATE INDEX idx_page_layout_blocks_featured_product_id ON public.page_layout_blocks(featured_product_id);
CREATE INDEX idx_page_layout_blocks_parent_id ON public.page_layout_blocks(parent_block_id);

-- ==============================================================================
-- 20. CLAVES FORÁNEAS CRUZADAS EN CATEGORIES Y PRODUCTS HACIA PAGE_LAYOUTS
-- Permite que categorías y productos apunten a su layout personalizado
-- ==============================================================================
ALTER TABLE public.categories 
  ADD COLUMN IF NOT EXISTS custom_layout_id TEXT REFERENCES public.page_layouts(id) ON DELETE SET NULL;

ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS custom_layout_id TEXT REFERENCES public.page_layouts(id) ON DELETE SET NULL;

-- Columna usada por el storefront (posición del punto focal de la imagen).
-- Añadida después del esquema inicial; IF NOT EXISTS la hace idempotente
-- tanto en instalaciones frescas como en bases ya creadas.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_position TEXT DEFAULT 'center';

CREATE INDEX idx_categories_custom_layout_id ON public.categories(custom_layout_id);
CREATE INDEX idx_products_custom_layout_id ON public.products(custom_layout_id);

-- ==============================================================================
-- 21. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wompi_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_theme_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_layout_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura categorias" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Lectura productos" ON public.products FOR SELECT USING (true);
CREATE POLICY "Lectura variantes" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Lectura resenas" ON public.product_reviews FOR SELECT USING (status = 'APPROVED');
CREATE POLICY "Lectura cupones" ON public.coupons FOR SELECT USING (active = true);
CREATE POLICY "Lectura temas" ON public.store_theme_configs FOR SELECT USING (true);
CREATE POLICY "Lectura layout" ON public.page_layouts FOR SELECT USING (true);
CREATE POLICY "Lectura bloques layout" ON public.page_layout_blocks FOR SELECT USING (true);

CREATE POLICY "Gestion clientes" ON public.customers FOR ALL USING (true);
CREATE POLICY "Gestion direcciones" ON public.customer_addresses FOR ALL USING (true);
CREATE POLICY "Gestion ordenes" ON public.orders FOR ALL USING (true);
CREATE POLICY "Gestion items ordenes" ON public.order_items FOR ALL USING (true);
CREATE POLICY "Gestion guias" ON public.shipping_guides FOR ALL USING (true);
CREATE POLICY "Gestion wompi" ON public.wompi_transactions FOR ALL USING (true);
CREATE POLICY "Gestion alertas" ON public.stock_alerts FOR ALL USING (true);
CREATE POLICY "Gestion notificaciones" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Gestion admin" ON public.admin_users FOR ALL USING (true);
CREATE POLICY "Gestion logs" ON public.admin_activity_logs FOR ALL USING (true);
CREATE POLICY "Gestion temas" ON public.store_theme_configs FOR ALL USING (true);
CREATE POLICY "Gestion layout" ON public.page_layouts FOR ALL USING (true);
CREATE POLICY "Gestion bloques layout" ON public.page_layout_blocks FOR ALL USING (true);

-- ==============================================================================
-- 22. SEED DATA RELACIONAL INICIAL
-- ==============================================================================

-- 22.1 Administradores
INSERT INTO public.admin_users (id, name, email, role, role_title, avatar_initials)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'Carlos Mendoza', 'admin@tutiendaalamano.co', 'SUPER_ADMIN', 'Chief Executive & Founder', 'CM'),
  ('a0000000-0000-0000-0000-000000000002', 'Operaciones & Logística', 'operaciones@tutiendaalamano.co', 'LOGISTICS_MANAGER', 'Director de Despachos', 'OL'),
  ('a0000000-0000-0000-0000-000000000003', 'Finanzas & Wompi', 'finanzas@tutiendaalamano.co', 'FINANCE_MANAGER', 'Controller Financiero', 'FW')
ON CONFLICT (email) DO NOTHING;

-- 22.2 Categorías
INSERT INTO public.categories (id, name, slug, description, display_order)
VALUES
  ('cat-hoodies', 'Hoodies & Buzos', 'hoodies-y-buzos', 'Buzos heavyweight con algodón peinado de alto gramaje.', 1),
  ('cat-chaquetas', 'Chaquetas & Abrigos', 'chaquetas-y-abrigos', 'Outerwear táctico y bombers impermeables.', 2),
  ('cat-camisetas', 'Camisetas & Tops', 'camisetas-y-tops', 'Camisetas Boxy Fit y siluetas streetwear.', 3),
  ('cat-pantalones', 'Pantalones & Cargo', 'pantalones-y-cargo', 'Pantalones utilitarios con bolsillos modulares.', 4)
ON CONFLICT (id) DO NOTHING;

-- 22.3 Cupones de descuento
INSERT INTO public.coupons (id, code, discount_type, value, min_order_amount_in_cents, max_discount_in_cents, active, usage_count, usage_limit)
VALUES
  ('coup-mano-10', 'MANO10', 'PERCENTAGE', 10, 10000000, 5000000, true, 42, 500),
  ('coup-black-20', 'BLACKDROP20', 'PERCENTAGE', 20, 20000000, 10000000, true, 18, 100),
  ('coup-vip-50', 'VIPCLIENT50', 'FIXED_AMOUNT', 5000000, 25000000, NULL, true, 7, 50)
ON CONFLICT (id) DO NOTHING;

-- 22.4 Temas visuales (FK -> admin_users.id)
INSERT INTO public.store_theme_configs (id, created_by, name, preset, mode, config, is_active)
VALUES
  (
    'theme-minimal',
    'a0000000-0000-0000-0000-000000000001',
    'Minimalist Clean Drop',
    'minimal',
    'dark',
    '{"primaryColor": "#18181b", "primaryHover": "#27272a", "backgroundColor": "#09090b", "borderRadius": "none", "headerStyle": "minimal", "productsPerRow": 4}'::jsonb,
    true
  ),
  (
    'theme-cyber',
    'a0000000-0000-0000-0000-000000000001',
    'Street Cyberpunk V3',
    'cyber',
    'dark',
    '{"primaryColor": "#22c55e", "primaryHover": "#16a34a", "backgroundColor": "#030712", "borderRadius": "sm", "headerStyle": "floating", "productsPerRow": 3}'::jsonb,
    false
  )
ON CONFLICT (id) DO NOTHING;

-- 22.5 Catálogo de Productos (FK -> categories.id)
INSERT INTO public.products (
  id, category_id, title, slug, reference, category_name, subcategory, badge, discount_percentage, rating, reviews_count, sales_last_24h,
  description, features, materials, shipping_info, return_policy, active, available_sizes, available_colors,
  main_image, thumbnail_images
)
VALUES
(
  'prod-hoodie-nocturnal-01',
  'cat-hoodies',
  'Hoodie Oversized Heavyweight 450g "Nocturnal Drop"',
  'hoodie-oversized-heavyweight-450g-nocturnal',
  'OPUS-450-HOD',
  'Hoodies & Buzos',
  'Heavyweight Fleece',
  'NEW DROP // LIMITED',
  20,
  4.9,
  842,
  96,
  'Silueta oversized insigne de TU TIENDA A LA MANO. Confeccionado en Medellín con 100% algodón peinado de 450 GSM.',
  '["Algodón Peinado 100% Heavyweight 450 GSM de origen nacional.", "Capucha anatómica de doble capa con caída pesada sin cordones.", "Corte Boxy Drop Shoulder con costuras reforzadas en cuello y sisas."]'::jsonb,
  '100% Algodón Peinado Colombiano 450 GSM (French Terry Pesado).',
  'Despacho prioritario 24-48h a Medellín, Bogotá y Cali. Envíos nacionales con Coordinadora y Servientrega.',
  '30 días de garantía. Primer cambio de talla 100% gratis a domicilio.',
  true,
  '["S", "M", "L", "XL", "XXL"]'::jsonb,
  '[{"name": "Onyx Black", "hex": "#121214"}, {"name": "Washed Charcoal", "hex": "#27272a"}, {"name": "Bone White", "hex": "#f4f4f5"}]'::jsonb,
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
  '["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80"]'::jsonb
),
(
  'prod-bomber-apex-01',
  'cat-chaquetas',
  'Chaqueta Bomber Táctica Impermeable "Apex Void"',
  'chaqueta-bomber-tactica-impermeable-apex-void',
  'OPUS-BMB-01',
  'Chaquetas & Abrigos',
  'Outerwear Táctico',
  'BEST SELLER // RESTOCK',
  0,
  4.95,
  1280,
  142,
  'Outerwear de vanguardia con membrana técnica hidrorepelente DWR grado 4. Cremalleras termoselladas YKK reversibles.',
  '["Nylon Ripstop balístico con tratamiento DWR hidrorepelente.", "Cremalleras YKK Aquaguard con tiradores reflectivos personalizados.", "Tres bolsillos externos tácticos y dos internos ocultos para documentos."]'::jsonb,
  'Exterior 100% Nylon Ripstop Militar 240T. Forro 100% Poliéster Acolchado.',
  'Envío express gratis a toda Colombia. Despacho mismo día hábil.',
  'Garantía total de 90 días por cierres y costuras.',
  true,
  '["S", "M", "L", "XL"]'::jsonb,
  '[{"name": "Shadow Black", "hex": "#09090b"}, {"name": "Military Sage", "hex": "#3f4739"}]'::jsonb,
  'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1000&q=80',
  '["https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 22.6 Variantes de Productos Relacionadas (FK -> products.id)
INSERT INTO public.product_variants (id, product_id, sku, color_name, color_hex, size, price_in_cents, original_price_in_cents, stock, stock_reserved, images)
VALUES
  ('var-hod-blk-m', 'prod-hoodie-nocturnal-01', 'OPUS-450-HOD-BLK-M', 'Onyx Black', '#121214', 'M', 17990000, 22490000, 8, 1, '["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80"]'::jsonb),
  ('var-hod-blk-l', 'prod-hoodie-nocturnal-01', 'OPUS-450-HOD-BLK-L', 'Onyx Black', '#121214', 'L', 17990000, 22490000, 12, 2, '["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80"]'::jsonb),
  ('var-hod-blk-xl', 'prod-hoodie-nocturnal-01', 'OPUS-450-HOD-BLK-XL', 'Onyx Black', '#121214', 'XL', 17990000, 22490000, 6, 0, '["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80"]'::jsonb),
  ('var-bmb-blk-m', 'prod-bomber-apex-01', 'OPUS-BMB-BLK-M', 'Shadow Black', '#09090b', 'M', 28990000, 28990000, 4, 1, '["https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1000&q=80"]'::jsonb),
  ('var-bmb-blk-l', 'prod-bomber-apex-01', 'OPUS-BMB-BLK-L', 'Shadow Black', '#09090b', 'L', 28990000, 28990000, 7, 0, '["https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1000&q=80"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 22.7 Diseños de Página (FK -> store_theme_configs.id, FK -> admin_users.id)
INSERT INTO public.page_layouts (
  id, theme_id, created_by, name, slug, enabled_in_storefront, blocks
)
VALUES
(
  'layout-official',
  'theme-minimal',
  'a0000000-0000-0000-0000-000000000001',
  'Diseño Gutenberg Drag & Drop Oficial',
  'home',
  false,
  '[
    {
      "id": "blk-banner-hero",
      "type": "banner",
      "title": "NUEVO DROP NOCTURNAL // EDICIÓN LIMITADA",
      "subcontent": "Prendas confeccionadas con algodón pesado de 450 GSM.",
      "buttonText": "Comprar Colección",
      "buttonLink": "#catalog",
      "imageUrl": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80"
    },
    {
      "id": "blk-grid-hoodies",
      "type": "product-grid",
      "title": "Hoodies & Buzos Heavyweight",
      "categoryFilter": "cat-hoodies",
      "productsColumns": 3
    }
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 22.8 Bloques de Página Normalizados (FK -> page_layouts.id, FK -> categories.id, FK -> products.id)
INSERT INTO public.page_layout_blocks (
  id, layout_id, category_id, featured_product_id, block_type, display_order, title, subcontent, button_text, button_link, media_url
)
VALUES
(
  'blk-banner-hero',
  'layout-official',
  NULL,
  'prod-hoodie-nocturnal-01',
  'banner',
  0,
  'NUEVO DROP NOCTURNAL // EDICIÓN LIMITADA',
  'Prendas confeccionadas con algodón pesado de 450 GSM en Medellín.',
  'Comprar Colección',
  '#catalog',
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80'
),
(
  'blk-grid-hoodies',
  'layout-official',
  'cat-hoodies',
  NULL,
  'product-grid',
  1,
  'Hoodies & Buzos Heavyweight',
  'Explora los cortes Boxy Fit con caída estructurada.',
  'Ver Todos',
  '#catalog',
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- 22.9 Reseñas Relacionadas (FK -> products.id)
INSERT INTO public.product_reviews (id, product_id, author_name, rating, comment, verified_purchase, status, helpful_count)
VALUES
  ('rev-1', 'prod-hoodie-nocturnal-01', 'Mateo Valencia', 5, 'El gramaje de 450g es de otro nivel. La capucha tiene una estructura perfecta.', true, 'APPROVED', 28),
  ('rev-2', 'prod-hoodie-nocturnal-01', 'Valentina Restrepo', 5, 'El color Onyx Black no destiñe y la caída es espectacular. Súper recomendado.', true, 'APPROVED', 14),
  ('rev-3', 'prod-bomber-apex-01', 'Santiago Gomez', 5, 'Impermeabilidad comprobada bajo lluvia en Bogotá. Cremalleras YKK excelentes.', true, 'APPROVED', 19)
ON CONFLICT (id) DO NOTHING;

-- 22.10 Alertas de Stock Relacionadas (FK -> products.id, FK -> product_variants.id)
INSERT INTO public.stock_alerts (id, product_id, variant_id, product_name, sku, current_stock, threshold, severity)
VALUES
  ('alt-1', 'prod-bomber-apex-01', 'var-bmb-blk-m', 'Chaqueta Bomber Táctica "Apex Void"', 'OPUS-BMB-BLK-M', 4, 5, 'CRITICAL')
ON CONFLICT (id) DO NOTHING;
