-- Migration: Add shipping address fields to orders table
-- วันที่: 2026-07-23

BEGIN;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_name    text,
  ADD COLUMN IF NOT EXISTS shipping_phone   text,
  ADD COLUMN IF NOT EXISTS shipping_address text;

COMMIT;
