import { test, expect } from '@playwright/test';

async function mockNoSession(page) {
  await page.route('**/auth/v1/**', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'not_authenticated', message: 'Not authenticated' }),
    });
  });
}

async function mockSingleProduct(page) {
  await page.route('**/rest/v1/products**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'prod-1',
          name: 'Gaming PC Test',
          price: 25000,
          description: 'สินค้าทดสอบ',
          image_url: 'https://placehold.co/400x300/png',
          category: 'gaming',
          stock: 10,
        },
      ]),
    });
  });
}

// Helper: add item to cart from homepage then navigate to cart
async function addToCartAndOpen(page) {
  await mockNoSession(page);
  await mockSingleProduct(page);
  await page.goto('/');
  await page.waitForSelector('text=Gaming PC Test', { timeout: 8000 });
  await page.getByRole('button', { name: 'ใส่ตะกร้า' }).first().click();
  // Navigate to cart
  await page.locator('header a[href="/cart"]').first().click();
  await page.waitForURL('/cart');
  await expect(page.getByText('Gaming PC Test')).toBeVisible({ timeout: 5000 });
}

test.describe('Cart Page', () => {
  test('shows empty cart state when no items', async ({ page }) => {
    await mockNoSession(page);
    await mockSingleProduct(page);
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('bm_cart'));
    await page.goto('/cart');

    await expect(page.getByText('ตะกร้าว่างเปล่า')).toBeVisible({ timeout: 5000 });
  });

  test('empty cart shows link back to shop', async ({ page }) => {
    await mockNoSession(page);
    await mockSingleProduct(page);
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('bm_cart'));
    await page.goto('/cart');

    await expect(page.getByRole('link', { name: 'เลือกซื้อสินค้า' })).toBeVisible({ timeout: 5000 });
  });

  test('cart icon in header links to /cart', async ({ page }) => {
    await mockNoSession(page);
    await mockSingleProduct(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cartLink = page.locator('header a[href="/cart"]').first();
    await expect(cartLink).toBeVisible({ timeout: 10000 });
    await cartLink.click();
    await expect(page).toHaveURL('/cart');
  });

  test('cart displays added items', async ({ page }) => {
    await addToCartAndOpen(page);
    await expect(page.getByText('฿25,000 / ชิ้น')).toBeVisible();
  });

  test('confirm order requires login', async ({ page }) => {
    await addToCartAndOpen(page);

    const confirmBtn = page.getByRole('button', { name: 'ยืนยันคำสั่งซื้อ' });
    await confirmBtn.click();

    await expect(page.getByText('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ')).toBeVisible({ timeout: 5000 });
  });

  test('quantity increase button adds more', async ({ page }) => {
    await addToCartAndOpen(page);

    // Initial quantity should be 1 — shown in the w-8 text-center span
    const qtySpan = page.locator('span.text-center').first();
    await expect(qtySpan).toHaveText('1', { timeout: 3000 });

    // The + button is the second button in the quantity row (Minus, qty, Plus)
    // Find all buttons in the cart item area and click the + (Plus) button
    const plusBtn = page.locator('button').filter({ has: page.locator('.lucide-plus') }).first();
    await plusBtn.click();

    await expect(qtySpan).toHaveText('2', { timeout: 3000 });
  });

  test('clear cart button empties cart', async ({ page }) => {
    await addToCartAndOpen(page);

    await page.getByRole('button', { name: 'ล้างตะกร้า' }).click();
    await expect(page.getByText('ตะกร้าว่างเปล่า')).toBeVisible({ timeout: 3000 });
  });

  test('shows total amount correctly', async ({ page }) => {
    await mockNoSession(page);
    await mockSingleProduct(page);
    await page.goto('/');
    await page.waitForSelector('text=Gaming PC Test', { timeout: 8000 });

    // Add item twice to get quantity 2
    await page.getByRole('button', { name: 'ใส่ตะกร้า' }).first().click();
    await page.getByRole('button', { name: 'ใส่ตะกร้า' }).first().click();

    await page.locator('header a[href="/cart"]').first().click();
    await page.waitForURL('/cart');

    // 2 x 25000 = 50000 — check the total display specifically
    await expect(page.locator('p.text-2xl').filter({ hasText: '฿50,000' })).toBeVisible({ timeout: 5000 });
  });
});
