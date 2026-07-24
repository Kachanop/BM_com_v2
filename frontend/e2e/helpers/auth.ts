import { Page } from '@playwright/test';

export async function openAuthModal(page: Page) {
  await page.getByRole('button', { name: /เข้าสู่ระบบ/ }).first().click();
  await page.waitForSelector('h2:has-text("เข้าสู่ระบบ")');
}

export async function login(page: Page, email: string, password: string) {
  await openAuthModal(page);
  // Make sure we're on login tab
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).nth(1).click();
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder('••••••••').fill(password);
  await page.locator('form').getByRole('button', { name: /เข้าสู่ระบบ/ }).click();
  // Wait for modal to close (login success)
  await page.waitForSelector('h2:has-text("เข้าสู่ระบบ")', { state: 'hidden', timeout: 15000 });
}

export async function logout(page: Page) {
  // Click logout button (LogOut icon button)
  await page.locator('button[title="ออกจากระบบ"]').click();
}
