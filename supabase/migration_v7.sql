-- Add courier delivery support to orders

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_type TEXT NOT NULL DEFAULT 'branch'
    CHECK (delivery_type IN ('branch', 'courier'));

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_street TEXT;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_house TEXT;
