-- ============================================================================
-- OPUS KARTEL — migraciones para bases YA creadas (no re-ejecutar el schema
-- completo: contiene DROP TABLE. Corre este archivo en el SQL Editor).
-- Idempotente: puedes ejecutarlo varias veces sin daño.
-- ============================================================================

ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_position TEXT DEFAULT 'center';

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS showcase_pinned BOOLEAN DEFAULT false;

-- Visibilidad por bloque del maquetador (apagado en inspector).
ALTER TABLE public.page_layout_blocks
  ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT true;
