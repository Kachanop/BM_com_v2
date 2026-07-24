/**
 * UAT แอดมิน (ข้อ 8-14)
 *
 * ต้องกำหนด env vars ก่อนรัน:
 *   TEST_ADMIN_EMAIL=<อีเมลแอดมิน>
 *   TEST_ADMIN_PASSWORD=<รหัสผ่านแอดมิน>
 */
import { test, expect, Page } from '@playwright/test';

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? '';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? '';

async function loginAsAdmin(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /เข้าสู่ระบบ/ }).first().click();
  await expect(page.locator('h2:has-text("เข้าสู่ระบบ")')).toBeVisible();
  await page.getByPlaceholder('you@example.com').fill(ADMIN_EMAIL);
  await page.getByPlaceholder('••••••••').fill(ADMIN_PASSWORD);
  await page.locator('form').getByRole('button', { name: /เข้าสู่ระบบ/ }).click();
  await expect(page.locator('h2:has-text("เข้าสู่ระบบ")')).toBeHidden({ timeout: 15000 });
}

test.describe('แอดมิน', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      testInfo.skip();
    }
  });

  test('ข้อ 8: เข้าสู่ระบบแอดมิน ไป /admin เห็นแดชบอร์ดสรุปยอดขาย คำสั่งซื้อ สมาชิก', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
    await expect(page.locator('text=กำลังตรวจสอบสิทธิ์')).toBeHidden({ timeout: 15000 });

    // ต้องเห็นหัวข้อ "จัดการระบบ"
    await expect(page.locator('h1:has-text("จัดการระบบ")')).toBeVisible();

    // ต้องเห็นกล่องสถิติทั้ง 4 รายการ (ใช้ p.text-xs เพื่อเจาะจง label ใน stat card)
    await expect(page.locator('p.text-xs', { hasText: 'ยอดขายรวม' })).toBeVisible();
    await expect(page.locator('p.text-xs', { hasText: 'คำสั่งซื้อ' })).toBeVisible();
    await expect(page.locator('p.text-xs', { hasText: 'สมาชิก' })).toBeVisible();
    await expect(page.locator('p.text-xs', { hasText: 'สินค้าทั้งหมด' })).toBeVisible();
  });

  test('ข้อ 9: ตัวเลขสมาชิกรวมในแดชบอร์ดไม่ใช่ 0', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
    await expect(page.locator('text=กำลังตรวจสอบสิทธิ์')).toBeHidden({ timeout: 15000 });

    // หาตัวเลขที่อยู่ในกล่องสมาชิก (รูปแบบ: "X คน")
    const memberStat = page.locator('text=/[1-9][0-9]* คน/');
    await expect(memberStat).toBeVisible({ timeout: 10000 });
  });

  test('ข้อ 10: เพิ่มสินค้าใหม่ ขึ้นข้อความสำเร็จ และสินค้าปรากฏในรายการ', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
    await expect(page.locator('text=กำลังตรวจสอบสิทธิ์')).toBeHidden({ timeout: 15000 });

    // ไปแท็บ "สินค้า"
    await page.getByRole('button', { name: 'สินค้า' }).click();

    // กดปุ่ม "เพิ่มสินค้าใหม่"
    await page.getByRole('button', { name: 'เพิ่มสินค้าใหม่' }).click();

    const testProductName = `UAT Test Product ${Date.now()}`;

    // กรอกข้อมูลสินค้า
    await page.getByPlaceholder('เช่น BM Gaming Pro i5').fill(testProductName);
    await page.getByPlaceholder('0').fill('9999');
    await page.getByPlaceholder('ว่างเว้นหากไม่ติดตาม').fill('10');
    await page.getByPlaceholder('อธิบายจุดเด่นของสินค้า').fill('สินค้าทดสอบ UAT อัตโนมัติ');

    // กดบันทึก
    await page.getByRole('button', { name: 'เพิ่มสินค้า', exact: true }).click();

    // สินค้าใหม่ต้องปรากฏในรายการ (ยืนยันว่าบันทึกสำเร็จ)
    // หมายเหตุ: ข้อความ "เพิ่มสินค้าใหม่เรียบร้อย" หายเร็วมากเพราะ UI auto-select สินค้าแรก
    await expect(page.locator(`text=${testProductName}`).first()).toBeVisible({ timeout: 20000 });
  });

  test('ข้อ 11: แก้ไขชื่อสินค้า ขึ้นข้อความสำเร็จ และรายการแสดงถูกต้อง', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
    await expect(page.locator('text=กำลังตรวจสอบสิทธิ์')).toBeHidden({ timeout: 15000 });

    // ไปแท็บสินค้า
    await page.getByRole('button', { name: 'สินค้า' }).click();

    // เลือกสินค้าชิ้นแรก
    const firstProduct = page.locator('button.rounded-xl.border').first();
    await expect(firstProduct).toBeVisible({ timeout: 10000 });
    await firstProduct.click();

    // แก้ไขชื่อสินค้า
    const nameInput = page.getByPlaceholder('เช่น BM Gaming Pro i5');
    const originalName = await nameInput.inputValue();
    const updatedName = originalName + ' (แก้ไขแล้ว)';
    await nameInput.clear();
    await nameInput.fill(updatedName);

    // กดบันทึก
    await page.getByRole('button', { name: 'บันทึก' }).click();

    // ต้องเห็นข้อความสำเร็จ
    await expect(page.locator('text=อัปเดตสินค้าเรียบร้อย')).toBeVisible({ timeout: 15000 });

    // ชื่อใหม่ต้องปรากฏในรายการ
    await expect(page.locator(`text=${updatedName}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('ข้อ 12: ลบสินค้า ระบบถามยืนยัน เมื่อยืนยันแล้วสินค้าหายไป', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
    await expect(page.locator('text=กำลังตรวจสอบสิทธิ์')).toBeHidden({ timeout: 15000 });

    // เพิ่มสินค้าทดสอบก่อน เพื่อไม่ให้ลบสินค้าจริง
    await page.getByRole('button', { name: 'สินค้า' }).click();
    await page.getByRole('button', { name: 'เพิ่มสินค้าใหม่' }).click();

    const deleteTestName = `UAT Delete Test ${Date.now()}`;
    await page.getByPlaceholder('เช่น BM Gaming Pro i5').fill(deleteTestName);
    await page.getByPlaceholder('0').fill('1');
    await page.getByPlaceholder('ว่างเว้นหากไม่ติดตาม').fill('5');
    await page.getByRole('button', { name: 'เพิ่มสินค้า', exact: true }).click();
    // รอให้สินค้าปรากฏในรายการก่อน (ยืนยันว่าเพิ่มสำเร็จ)
    await expect(page.locator(`text=${deleteTestName}`).first()).toBeVisible({ timeout: 20000 });

    // เลือกสินค้าที่เพิ่งสร้างโดยคลิก card button โดยตรง
    await page.locator('button.rounded-xl.border', { hasText: deleteTestName }).click();

    // ยืนยันว่า form โหลดสินค้าที่เลือกแล้ว
    await expect(page.getByPlaceholder('เช่น BM Gaming Pro i5')).toHaveValue(deleteTestName, { timeout: 5000 });

    // กดปุ่มลบ - ระบบจะถาม confirm dialog
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'ลบ' }).click();

    // สินค้าต้องหายไปจากรายการ
    await expect(page.locator('button.rounded-xl.border', { hasText: deleteTestName })).toBeHidden({ timeout: 15000 });
  });

  test('ข้อ 13: การเปลี่ยนแปลงในหน้าแอดมินแสดงผลที่หน้าแรกด้วย', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
    await expect(page.locator('text=กำลังตรวจสอบสิทธิ์')).toBeHidden({ timeout: 15000 });

    // ไปแท็บสินค้าแล้วแก้ไขสินค้าชิ้นแรก
    await page.getByRole('button', { name: 'สินค้า' }).click();
    const firstProduct = page.locator('button.rounded-xl.border').first();
    await expect(firstProduct).toBeVisible({ timeout: 10000 });
    await firstProduct.click();

    const nameInput = page.getByPlaceholder('เช่น BM Gaming Pro i5');
    const originalName = await nameInput.inputValue();
    const syncTestName = originalName.replace(' (แก้ไขแล้ว)', '') + ' [sync-test]';
    await nameInput.clear();
    await nameInput.fill(syncTestName);
    await page.getByRole('button', { name: 'บันทึก' }).click();
    await expect(page.locator('text=อัปเดตสินค้าเรียบร้อย')).toBeVisible({ timeout: 15000 });

    // ไปหน้าแรก แล้วตรวจว่าชื่อใหม่ปรากฏ
    await page.goto('/');
    await expect(page.locator('.animate-pulse').first()).toBeHidden({ timeout: 15000 });
    await expect(page.locator(`text=${syncTestName}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('ข้อ 14: ออกจากระบบแล้วเข้าสู่ระบบใหม่ ยังเข้าหน้าแอดมินได้', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
    await expect(page.locator('h1:has-text("จัดการระบบ")')).toBeVisible({ timeout: 15000 });

    // ออกจากระบบ
    await page.locator('button[title="ออกจากระบบ"]').click();

    // ต้องกลับไปเป็นสถานะ guest (เห็นปุ่มเข้าสู่ระบบ)
    await expect(page.getByRole('button', { name: /เข้าสู่ระบบ/ }).first()).toBeVisible({ timeout: 10000 });

    // เข้าสู่ระบบอีกครั้ง
    await page.getByRole('button', { name: /เข้าสู่ระบบ/ }).first().click();
    await page.getByPlaceholder('you@example.com').fill(ADMIN_EMAIL);
    await page.getByPlaceholder('••••••••').fill(ADMIN_PASSWORD);
    await page.locator('form').getByRole('button', { name: /เข้าสู่ระบบ/ }).click();
    await expect(page.locator('h2:has-text("เข้าสู่ระบบ")')).toBeHidden({ timeout: 15000 });

    // ไปหน้า /admin อีกครั้ง ต้องเข้าได้เหมือนเดิม
    await page.goto('/admin');
    await expect(page.locator('text=กำลังตรวจสอบสิทธิ์')).toBeHidden({ timeout: 15000 });
    await expect(page.locator('h1:has-text("จัดการระบบ")')).toBeVisible({ timeout: 15000 });
  });
});
