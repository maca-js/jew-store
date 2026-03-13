-- ============================================================
-- Legacy Jewelry Store — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_uk     text NOT NULL,
  name_en     text NOT NULL,
  slug        text UNIQUE NOT NULL,
  image_url   text,
  created_at  timestamptz DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id      uuid REFERENCES categories(id) ON DELETE SET NULL,
  name_uk          text NOT NULL,
  name_en          text NOT NULL,
  description_uk   text DEFAULT '',
  description_en   text DEFAULT '',
  price            numeric NOT NULL CHECK (price >= 0),
  images           text[]  DEFAULT '{}',
  available_sizes  text[]  DEFAULT '{}',
  badge            text CHECK (badge IN ('new', 'sale', 'bestseller')),
  is_featured      boolean DEFAULT false,
  in_stock         boolean DEFAULT true,
  slug             text UNIQUE NOT NULL,
  created_at       timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name    text NOT NULL,
  email            text NOT NULL,
  phone            text NOT NULL,
  delivery_address text NOT NULL,
  items            jsonb NOT NULL DEFAULT '[]',
  total            numeric NOT NULL CHECK (total >= 0),
  status           text NOT NULL DEFAULT 'new'
                     CHECK (status IN ('new','paid','processing','shipped','delivered')),
  liqpay_order_id  text,
  created_at       timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug        ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at    ON orders(created_at DESC);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;

-- Public read on categories and products
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (true);
CREATE POLICY "public_read_products"   ON products   FOR SELECT USING (true);

-- Anyone can insert an order (checkout)
CREATE POLICY "public_insert_orders" ON orders FOR INSERT WITH CHECK (true);

-- Service role bypasses RLS (admin panel, webhooks use service role key)

-- ============================================================
-- Storage bucket
-- ============================================================
-- Run in Supabase Dashboard → Storage → New Bucket:
-- Name: product-images  |  Public: true
-- Or via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_read_product_images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "auth_upload_product_images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "auth_update_product_images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images');

CREATE POLICY "auth_delete_product_images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images');
