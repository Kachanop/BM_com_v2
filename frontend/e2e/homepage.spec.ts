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

async function mockProducts(page, products = []) {
  await page.route('**/rest/v1/products**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(products),
    });
  });
}

const SAMPLE_PRODUCTS = [
  {
    id: 'p1',
    name: 'BM Gaming i5',
    price: 25900,
    description: 'เซ็ตเล่นเกม ราคาสุดคุ้ม',
    image_url: 'https://placehold.co/400x300/png',
    category: 'gaming',
    stock: 10,
  },
  {
    id: 'p2',
    name: 'BM Office i3',
    price: 14900,
    description: 'เซ็ตทำงานออฟฟิศ',
    image_url: 'https://placehold.co/400x300/png',
    category: 'office',
    stock: 5,
  },
];

test.describe('Homepage', () => {
  test('loads successfully and shows hero', async ({ page }) => {
    await mockNoSession(page);
    await mockProducts(page, SAMPLE_PRODUCTS);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Hero should be visible
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByText('ดูสินค้าทั้งหมด')).toBeVisible();
  });

  test('navigation links are visible', async ({ page }) => {
    await mockNoSession(page);
    await mockProducts(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('link', { name: 'หน้าหลัก' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'ประวัติคำสั่งซื้อ' })).toBeVisible();
  });

  test('shows login button when not logged in', async ({ page }) => {
    await mockNoSession(page);
    await mockProducts(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: 'เข้าสู่ระบบ' })).toBeVisible();
  });

  test('cart icon is in header', async ({ page }) => {
    await mockNoSession(page);
    await mockProducts(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('header a[href="/cart"]').first()).toBeVisible();
  });

  test('products render from API', async ({ page }) => {
    await mockNoSession(page);
    await mockProducts(page, SAMPLE_PRODUCTS);

    await page.goto('/');
    await page.waitForSelector('text=BM Gaming i5', { timeout: 8000 });

    await expect(page.getByText('BM Gaming i5')).toBeVisible();
    await expect(page.getByText('BM Office i3')).toBeVisible();
  });

  test('search filters products', async ({ page }) => {
    await mockNoSession(page);
    await mockProducts(page, SAMPLE_PRODUCTS);

    await page.goto('/');
    await page.waitForSelector('text=BM Gaming i5', { timeout: 8000 });

    const searchInput = page.getByPlaceholder('ค้นหาสินค้า...');
    await searchInput.fill('Gaming');

    // Should show gaming product
    await expect(page.getByText('BM Gaming i5')).toBeVisible();
    // Should hide office product
    await expect(page.getByText('BM Office i3')).not.toBeVisible();
  });

  test('category filter buttons are rendered', async ({ page }) => {
    await mockNoSession(page);
    await mockProducts(page, SAMPLE_PRODUCTS);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: 'ทั้งหมด' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'เกมมิ่ง' })).toBeVisible();
  });

  test('category filter changes active style', async ({ page }) => {
    await mockNoSession(page);
    await mockProducts(page, SAMPLE_PRODUCTS);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const allBtn = page.getByRole('button', { name: 'ทั้งหมด' });
    // "ทั้งหมด" should be active initially (has blue bg)
    await expect(allBtn).toHaveClass(/bg-blue-600/);

    const gamingBtn = page.getByRole('button', { name: 'เกมมิ่ง' });
    await gamingBtn.click();
    await expect(gamingBtn).toHaveClass(/bg-blue-600/);
    await expect(allBtn).not.toHaveClass(/bg-blue-600/);
  });

  test('footer is rendered', async ({ page }) => {
    await mockNoSession(page);
    await mockProducts(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('footer')).toBeVisible();
    await expect(page.getByText(/BM Computer/)).toBeVisible();
  });

  test('add to cart button adds item', async ({ page }) => {
    await mockNoSession(page);
    await mockProducts(page, SAMPLE_PRODUCTS);

    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('bm_cart'));
    await page.waitForSelector('text=BM Gaming i5', { timeout: 8000 });

    // Cart badge should not be visible initially
    const cartBadge = page.locator('header span.bg-blue-600');
    await expect(cartBadge).not.toBeVisible();

    // Add to cart
    await page.getByRole('button', { name: 'ใส่ตะกร้า' }).first().click();

    // Cart badge should now show "1"
    await expect(cartBadge).toBeVisible({ timeout: 3000 });
    await expect(cartBadge).toHaveText('1');
  });
});
