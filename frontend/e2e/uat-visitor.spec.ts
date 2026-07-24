/**
 * UAT ผู้เยี่ยมชมทั่วไป (ข้อ 1-4)
 * ทดสอบโดยไม่ต้องเข้าสู่ระบบ
 */
import { test, expect } from '@playwright/test';

test.describe('ผู้เยี่ยมชมทั่วไป', () => {
  test('ข้อ 1: หน้าแรกแสดงรายการสินค้าพร้อมรูปภาพ ชื่อ และราคา', async ({ page }) => {
    await page.goto('/');

    // รอให้สินค้าโหลดเสร็จ (skeleton หาย)
    await expect(page.locator('.grid .animate-pulse').first()).toBeHidden({ timeout: 15000 });

    // ต้องเห็นชื่อสินค้าอย่างน้อย 1 รายการ
    const productName = page.locator('h3').first();
    await expect(productName).toBeVisible();

    // ต้องเห็นราคา (มีสัญลักษณ์ ฿)
    await expect(page.locator('text=/฿[0-9,]+/').first()).toBeVisible();

    // ต้องเห็นรูปภาพสินค้า
    const productImage = page.locator('img[alt]').first();
    await expect(productImage).toBeVisible();
  });

  test('ข้อ 2: กดปุ่ม "ใส่ตะกร้า" ตัวเลขที่ไอคอนตะกร้าเพิ่มขึ้น', async ({ page }) => {
    await page.goto('/');

    // รอให้สินค้าโหลด
    await expect(page.locator('.animate-pulse').first()).toBeHidden({ timeout: 15000 });

    // ก่อนกด: ตะกร้าต้องยังไม่มีตัวเลขแสดง
    await expect(page.locator('header span.bg-blue-600')).toBeHidden();

    // กดปุ่มใส่ตะกร้าสินค้าชิ้นแรกที่ไม่หมด
    await page.locator('button:has-text("ใส่ตะกร้า")').first().click();

    // หลังกด: ตัวเลขที่ไอคอนตะกร้าต้องขึ้นเป็น 1
    await expect(page.locator('header span.bg-blue-600')).toHaveText('1');
  });

  test('ข้อ 3: หน้าตะกร้าแสดงสินค้า พร้อมปุ่มปรับจำนวนและปุ่มลบ', async ({ page }) => {
    await page.goto('/');

    // รอให้สินค้าโหลด แล้วใส่ตะกร้า
    await expect(page.locator('.animate-pulse').first()).toBeHidden({ timeout: 15000 });
    await page.locator('button:has-text("ใส่ตะกร้า")').first().click();

    // รอให้ badge ขึ้น แล้วคลิก cart icon (soft navigation - ไม่ reload ให้ state คงอยู่)
    await expect(page.locator('header span.bg-blue-600')).toBeVisible();
    await page.locator('header a[href="/cart"]').click();

    // ต้องเห็นชื่อสินค้าในตะกร้า
    await expect(page.locator('h3').first()).toBeVisible();

    // ต้องมีปุ่ม - และ + (ปรับจำนวน) — class w-8 h-8 เป็น selector ของปุ่มใน cart
    const qtyButtons = page.locator('button.w-8.h-8');
    await expect(qtyButtons.first()).toBeVisible();
    await expect(qtyButtons).toHaveCount(2);

    // ต้องมีปุ่มลบสินค้า (Trash icon — มี class hover:bg-red-50 ด้วย)
    await expect(page.locator('button.hover\\:bg-red-50')).toBeVisible();
  });

  test('ข้อ 4: เข้า /admin โดยไม่เข้าสู่ระบบ เห็นข้อความสงวนสิทธิ์', async ({ page }) => {
    await page.goto('/admin');

    // รอให้ระบบตรวจสอบสิทธิ์เสร็จ
    await expect(page.locator('text=กำลังตรวจสอบสิทธิ์')).toBeHidden({ timeout: 15000 });

    // ต้องเห็นข้อความ "กรุณาเข้าสู่ระบบ"
    await expect(page.locator('h1:has-text("กรุณาเข้าสู่ระบบ")')).toBeVisible();
  });
});
