-- Migration: Add `stock` column to products
-- วันที่: 2026-07-23

BEGIN;

-- เพิ่มคอลัมน์ stock ถ้ายังไม่มี พร้อมค่าเริ่มต้นเป็น 0
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock integer NOT NULL DEFAULT 0;

-- (เลือก) ถ้ามีคอลัมน์อื่นเป็นตัวแทนสต็อกเดิม เช่น `quantity`, สามารถย้ายค่าไปยัง `stock` ได้
-- UPDATE public.products SET stock = COALESCE(quantity, 0) WHERE stock = 0;

COMMIT;
