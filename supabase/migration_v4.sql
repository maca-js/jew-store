-- ============================================================
-- Legacy Jewelry Store — Migration v4
-- Adds auto-incrementing 6-digit order_number to orders
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- Create sequence starting at 100000 (6-digit range: 100000–999999)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 100000;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_number integer UNIQUE DEFAULT nextval('order_number_seq');

-- Backfill existing rows that have no order_number yet
UPDATE orders SET order_number = nextval('order_number_seq') WHERE order_number IS NULL;

-- Make non-nullable after backfill
ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL;
