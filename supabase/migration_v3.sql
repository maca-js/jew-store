-- ============================================================
-- Legacy Jewelry Store — Migration v3
-- Adds source field to orders (website vs instagram)
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'website'
    CHECK (source IN ('website', 'instagram'));
