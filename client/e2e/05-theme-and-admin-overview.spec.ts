import { test, expect } from '@playwright/test';

test.describe('Admin Portfolio Overview, RBAC Guards & Theme Toggling', () => {
  test('01. Admin Portfolio Overview displays accurate KPIs and pipeline cards', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@creditsea.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]:has-text("Sign In")');
    await page.waitForURL('**/dashboard/admin', { timeout: 10000 });

    // Verify Financial KPIs
    await expect(page.locator('text=Total Disbursed Capital')).toBeVisible();
    await expect(page.locator('text=Outstanding Book Value')).toBeVisible();
    await expect(page.locator('text=Total Collected Cash')).toBeVisible();

    // Verify Pipeline Overview cards
    await expect(page.locator('text=Sales Pipeline')).toBeVisible();
    await expect(page.locator('text=Sanction Pipeline')).toBeVisible();
    await expect(page.locator('text=Disbursement Pipeline')).toBeVisible();
    await expect(page.locator('text=Collection Pipeline')).toBeVisible();
  });

  test('02. RBAC Guard displays 403 Forbidden when unauthorized module is accessed', async ({ page }) => {
    // Log in as Sales executive
    await page.goto('/login');
    await page.fill('input[type="email"]', 'sales@creditsea.com');
    await page.fill('input[type="password"]', 'Sales@123');
    await page.click('button[type="submit"]:has-text("Sign In")');
    await page.waitForURL('**/dashboard/sales', { timeout: 10000 });

    // Directly navigate to Sanction Underwriting module (which Sales is NOT authorized to access)
    await page.goto('/dashboard/sanction');

    // Verify 403 Forbidden Access Restricted banner
    await expect(page.locator('text=403 Forbidden: Access Restricted')).toBeVisible();
    await expect(page.locator('text=[SALES] is not authorized to access this module')).toBeVisible();
    await expect(page.locator('text=Go to Your Assigned Module (Sales (Leads))')).toBeVisible();
  });

  test('03. Instant Dark Mode / Light Mode Theme Toggle', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const themeBtn = page.locator('button[title*="mode"], button[aria-label*="mode"], button:has(svg.lucide-sun), button:has(svg.lucide-moon)').first();

    const initialIsDark = await html.evaluate((el) => el.classList.contains('dark'));

    // Toggle theme
    await themeBtn.click();
    const afterClickDark = await html.evaluate((el) => el.classList.contains('dark'));
    expect(afterClickDark).toBe(!initialIsDark);

    // Reload page to verify persistence without flash
    await page.reload();
    const reloadedDark = await html.evaluate((el) => el.classList.contains('dark'));
    expect(reloadedDark).toBe(afterClickDark);
  });
});
