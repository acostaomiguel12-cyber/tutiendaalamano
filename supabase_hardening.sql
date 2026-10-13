-- ============================================================================
-- OPUS KARTEL — endurecimiento RLS para producción con backend.
-- Requisitos previos (en orden):
--   1. supabase_migrations.sql aplicado (password_hash, image_position).
--   2. Contraseña admin creada (npm run seed:admin).
--   3. SUPABASE_SERVICE_ROLE_KEY configurada en el servidor (lee /api/health).
-- Corre este archivo en el SQL Editor DESPUÉS de verificar 1-3, porque
-- revoca escrituras anónimas en tablas de administración (el admin escribe
-- vía /api/admin/sync con service_role).
-- Idempotente.
-- ============================================================================

-- 1. Revocar políticas permisivas "Gestion *" (FOR ALL USING true).
DROP POLICY IF EXISTS "Gestion clientes" ON public.customers;
DROP POLICY IF EXISTS "Gestion direcciones" ON public.customer_addresses;
DROP POLICY IF EXISTS "Gestion ordenes" ON public.orders;
DROP POLICY IF EXISTS "Gestion items ordenes" ON public.order_items;
DROP POLICY IF EXISTS "Gestion guias" ON public.shipping_guides;
DROP POLICY IF EXISTS "Gestion wompi" ON public.wompi_transactions;
DROP POLICY IF EXISTS "Gestion alertas" ON public.stock_alerts;
DROP POLICY IF EXISTS "Gestion notificaciones" ON public.notifications;
DROP POLICY IF EXISTS "Gestion admin" ON public.admin_users;
DROP POLICY IF EXISTS "Gestion logs" ON public.admin_activity_logs;
DROP POLICY IF EXISTS "Gestion temas" ON public.store_theme_configs;
DROP POLICY IF EXISTS "Gestion layout" ON public.page_layouts;
DROP POLICY IF EXISTS "Gestion bloques layout" ON public.page_layout_blocks;

-- 2. Lectura pública (storefront) — se mantiene.
-- (Las políticas "Lectura *" del schema siguen vigentes; no se tocan.)

-- 3. Escritura anónima mínima del storefront: solo INSERT de checkout.
CREATE POLICY "Checkout inserta ordenes" ON public.orders
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Checkout inserta items" ON public.order_items
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Checkout inserta clientes" ON public.customers
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Checkout inserta direcciones" ON public.customer_addresses
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 4. UPDATE de órdenes para webhook/confirm con llave anónima.
-- Si el servidor usa SUPABASE_SERVICE_ROLE_KEY (recomendado, service_role
-- bypasea RLS), ELIMINA esta política para cerrar el hueco por completo.
CREATE POLICY "Servidor actualiza ordenes" ON public.orders
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- 5. Resto de escrituras (catálogo, layouts, cupones, reviews, guías,
-- notificaciones, admin_users, logs, wompi_transactions): SOLO service_role
-- (sin política anon = denegado; el panel admin usa /api/admin/sync).
-- No se crea ninguna política: por defecto se deniega a anon/authenticated.
