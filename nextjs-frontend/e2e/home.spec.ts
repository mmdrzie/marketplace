import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads and shows the main heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('navigates to login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
  });

  test('shows categories section', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    const categoryLinks = page.locator('a[href*="/categories/"]');
    const count = await categoryLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});
