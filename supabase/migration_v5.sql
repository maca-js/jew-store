-- ============================================================
-- v0.10 — Inventory tracking
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock integer DEFAULT NULL CHECK (stock IS NULL OR stock >= 0);

CREATE OR REPLACE FUNCTION decrement_stock(p_product_id uuid, p_quantity integer)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE products
  SET stock = GREATEST(0, stock - p_quantity)
  WHERE id = p_product_id AND stock IS NOT NULL;
$$;
