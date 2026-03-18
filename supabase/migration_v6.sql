-- Add 'cod' as a valid payment method

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_payment_method_check
    CHECK (payment_method IN ('invoice', 'liqpay', 'cod'));
