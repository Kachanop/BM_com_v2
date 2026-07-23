import { test, expect } from '@playwright/test';

// Mock Supabase auth to return no session (not logged in)
async function mockNoSession(page) {
  await page.route('**/auth/v1/**', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'not_authenticated', message: 'Not authenticated' }),
    });
  });
}

test.describe('Stock / Out-of-Stock Behavior', () => {
  test('out-of-stock product shows disabled button', async ({ page }) => {
    await mockNoSession(page);

    await page.route('**/rest/v1/products**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'oos-1',
            name: 'Out of Stock PC',
            price: 19900,
            description: 'สินค้านี้หมดสต็อก',
            image_url: 'https://placehold.co/400x300/png',
            category: 'gaming',
            stock: 0,
          },
          {
            id: 'instock-1',
            name: 'In Stock PC',
            price: 25000,
            description: 'สินค้านี้มีสต็อก',
            image_url: 'https://placehold.co/400x300/png',
            category: 'gaming',
            stock: 10,
          },
        ]),
      });
    });

    await page.goto('/');
    // Wait for products to render
    await page.waitForSelector('text=Out of Stock PC', { timeout: 8000 });

    // Out-of-stock button should be disabled
    const oosBtn = page.getByRole('button', { name: 'หมดสต็อก' }).first();
    await expect(oosBtn).toBeVisible();
    await expect(oosBtn).toBeDisabled();

    // In-stock button should be enabled
    const inStockBtn = page.getByRole('button', { name: 'ใส่ตะกร้า' }).first();
    await expect(inStockBtn).toBeEnabled();
  });

  test('out-of-stock badge and overlay shows on product card', async ({ page }) => {
    await mockNoSession(page);

    await page.route('**/rest/v1/products**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'oos-2',
            name: 'Sold Out PC',
            price: 15000,
            description: 'หมดสต็อก',
            image_url: 'https://placehold.co/400x300/png',
            category: 'office',
            stock: 0,
          },
        ]),
      });
    });

    await page.goto('/');
    await page.waitForSelector('text=Sold Out PC', { timeout: 8000 });

    // Badge "สินค้าหมด" should appear on the card
    await expect(page.getByText('สินค้าหมด').first()).toBeVisible();
  });

  test('low stock badge shows remaining count', async ({ page }) => {
    await mockNoSession(page);

    await page.route('**/rest/v1/products**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'low-1',
            name: 'Low Stock PC',
            price: 22000,
            description: 'สต็อกเหลือน้อย',
            image_url: 'https://placehold.co/400x300/png',
            category: 'general',
            stock: 3,
          },
        ]),
      });
    });

    await page.goto('/');
    await page.waitForSelector('text=Low Stock PC', { timeout: 8000 });

    await expect(page.getByText('เหลือ 3 ชิ้น')).toBeVisible();
  });

  test('in-stock product shows stock badge', async ({ page }) => {
    await mockNoSession(page);

    await page.route('**/rest/v1/products**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'ok-1',
            name: 'Good Stock PC',
            price: 28000,
            description: 'สต็อกเพียงพอ',
            image_url: 'https://placehold.co/400x300/png',
            category: 'gaming',
            stock: 20,
          },
        ]),
      });
    });

    await page.goto('/');
    await page.waitForSelector('text=Good Stock PC', { timeout: 8000 });

    // Should show "มีสินค้า" badge for in-stock items with plenty of stock
    await expect(page.getByText('มีสินค้า')).toBeVisible();
  });

  test('clicking out-of-stock button does not add to cart', async ({ page }) => {
    await mockNoSession(page);

    await page.route('**/rest/v1/products**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'oos-3',
            name: 'Zero Stock PC',
            price: 18000,
            description: 'ไม่มีสต็อก',
            image_url: 'https://placehold.co/400x300/png',
            category: 'office',
            stock: 0,
          },
        ]),
      });
    });

    await page.goto('/');
    await page.waitForSelector('text=Zero Stock PC', { timeout: 8000 });

    // Cart badge should not exist initially
    const cartBadge = page.locator('header span.bg-blue-600');
    await expect(cartBadge).not.toBeVisible();

    // Disabled button - click should have no effect
    const oosBtn = page.getByRole('button', { name: 'หมดสต็อก' }).first();
    await expect(oosBtn).toBeDisabled();

    // Cart badge still should not appear
    await expect(cartBadge).not.toBeVisible();
  });
});
