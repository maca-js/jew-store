-- ============================================================
-- Legacy Jewelry Store — Migration v2
-- Adds delivery + payment fields to orders, plus admin fields
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_service  text NOT NULL DEFAULT 'nova_post',
  ADD COLUMN IF NOT EXISTS delivery_city     text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS delivery_branch   text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS payment_method    text NOT NULL DEFAULT 'invoice'
    CHECK (payment_method IN ('invoice', 'liqpay')),
  ADD COLUMN IF NOT EXISTS tracking_number   text,
  ADD COLUMN IF NOT EXISTS admin_notes       text;
