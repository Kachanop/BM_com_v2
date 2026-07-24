/**
 * UAT สมาชิกทั่วไป (ข้อ 5-7)
 *
 * ข้อ 5: ทดสอบสมัครสมาชิกใหม่ด้วยอีเมลชั่วคราว (timestamp-based)
 * ข้อ 6-7: ต้องกำหนด env vars ก่อนรัน:
 *   TEST_MEMBER_EMAIL=<อีเมลสมาชิกทั่วไป>
 *   TEST_MEMBER_PASSWORD=<รหัสผ่าน>
 */
import { test, expect } from '@playwright/test';

test.describe('สมาชิกทั่วไป', () => {
  test('ข้อ 5: สมัครสมาชิกใหม่ ขึ้นข้อความสมัครสำเร็จ', async ({ page }) => {
    const uniqueEmail = `uat-test-${Date.now()}@mailtest.invalid`;
    const password = 'Test@1234';
    const fullName = 'ผู้ทดสอบ UAT';

    await page.goto('/');

    // เปิด Modal เข้าสู่ระบบ
    await page.getByRole('button', { name: /เข้าสู่ระบบ/ }).first().click();
    await expect(page.locator('h2:has-text("เข้าสู่ระบบ")')).toBeVisible();

    // กดแท็บ "สมัครสมาชิกใหม่"
    await page.getByRole('button', { name: 'สมัครสมาชิกใหม่' }).click();

    // กรอกข้อมูล
    await page.getByPlaceholder('สมชาย ใจดี').fill(fullName);
    await page.getByPlaceholder('you@example.com').fill(uniqueEmail);
    await page.getByPlaceholder('••••••••').fill(password);

    // กดสมัคร
    await page.getByRole('button', { name: /^สมัครสมาชิก$/ }).click();

    // ต้องเห็นข้อความสมัครสมาชิกสำเร็จ
    await expect(page.locator('text=สมัครสมาชิกสำเร็จ')).toBeVisible({ timeout: 15000 });
  });

  test('ข้อ 6: เข้าสู่ระบบสำเร็จ เห็นชื่อผู้ใช้ที่มุมขวาบน', async ({ page }) => {
    const email = process.env.TEST_MEMBER_EMAIL;
    const password = process.env.TEST_MEMBER_PASSWORD;

    if (!email || !password) {
      test.skip(true, 'ต้องกำหนด TEST_MEMBER_EMAIL และ TEST_MEMBER_PASSWORD');
      return;
    }

    await page.goto('/');

    // เปิด Modal แล้ว Login
    await page.getByRole('button', { name: /เข้าสู่ระบบ/ }).first().click();
    await expect(page.locator('h2:has-text("เข้าสู่ระบบ")')).toBeVisible();

    await page.getByPlaceholder('you@example.com').fill(email);
    await page.getByPlaceholder('••••••••').fill(password);
    await page.locator('form').getByRole('button', { name: /เข้าสู่ระบบ/ }).click();

    // Modal ต้องปิด (เข้าสู่ระบบสำเร็จ)
    await expect(page.locator('h2:has-text("เข้าสู่ระบบ")')).toBeHidden({ timeout: 15000 });

    // ต้องเห็นชื่อผู้ใช้หรืออีเมลที่ header
    await expect(page.locator('header button').filter({ hasText: /@|\./ }).or(
      page.locator('header span').filter({ hasText: /[ก-๙a-z]/i })
    ).first()).toBeVisible({ timeout: 10000 });
  });

  test('ข้อ 7: สมาชิกทั่วไปเข้า /admin เห็นข้อความไม่มีสิทธิ์', async ({ page }) => {
    const email = process.env.TEST_MEMBER_EMAIL;
    const password = process.env.TEST_MEMBER_PASSWORD;

    if (!email || !password) {
      test.skip(true, 'ต้องกำหนด TEST_MEMBER_EMAIL และ TEST_MEMBER_PASSWORD');
      return;
    }

    await page.goto('/');

    // Login เป็นสมาชิกทั่วไปก่อน
    await page.getByRole('button', { name: /เข้าสู่ระบบ/ }).first().click();
    await page.getByPlaceholder('you@example.com').fill(email);
    await page.getByPlaceholder('••••••••').fill(password);
    await page.locator('form').getByRole('button', { name: /เข้าสู่ระบบ/ }).click();
    await expect(page.locator('h2:has-text("เข้าสู่ระบบ")')).toBeHidden({ timeout: 15000 });

    // ไปที่ /admin
    await page.goto('/admin');
    await expect(page.locator('text=กำลังตรวจสอบสิทธิ์')).toBeHidden({ timeout: 15000 });

    // ต้องเห็นข้อความ "ไม่มีสิทธิ์เข้าถึง"
    await expect(page.locator('h1:has-text("ไม่มีสิทธิ์เข้าถึง")')).toBeVisible();
  });
});
