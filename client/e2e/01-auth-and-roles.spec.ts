import { test, expect } from '@playwright/test';

test.describe('Authentication & Evaluator Role Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('01. Home page loads with CreditSea branding and loan calculator', async ({ page }) => {
    await page.goto('/');

    // Verify brand title and hero text
    await expect(page.locator('header').locator('text=Credit').first()).toBeVisible();
    await expect(page.locator('header').locator('text=Sea').first()).toBeVisible();
    await expect(page.locator('text=Borrowing made easy with CreditSea')).toBeVisible();
    await expect(page.locator('text=Get Personal Loans up to')).toBeVisible();

    // Verify home page interactive calculator
    await expect(page.locator('text=Interactive Loan Calculator')).toBeVisible();
    await expect(page.locator('text=Calculate Your EMI & Total Repayment')).toBeVisible();
    await expect(page.locator('form button:has-text("Apply for Loan")')).toBeVisible();

    // Verify phone validation error when submitting invalid phone
    const phoneInput = page.locator('form input[type="tel"]').first();
    await phoneInput.fill('12345');
    await page.click('form button:has-text("Apply for Loan")');
    await expect(page.locator('text=Please enter a valid 10-digit Indian mobile number')).toBeVisible();

    // Fill valid phone number and verify it carries over to the borrower portal
    await phoneInput.fill('9876543210');
    await page.click('form button:has-text("Apply for Loan")');
    await expect(page).toHaveURL(/\/portal/);
    await expect(page.locator('text=Pre-filled from Home')).toBeVisible();
    await expect(page.getByPlaceholder('98765 43210')).toHaveValue('9876543210');

    // Return to home page to complete remaining checks
    await page.goto('/');

    // Verify operations dashboard / switch role button is accessible
    await expect(page.locator('button:has-text("Switch Role"), button:has-text("Role")').first()).toBeVisible();
  });

  test('02. Borrower Registration & Login via Portal', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `borrower_${timestamp}@testcreditsea.com`;
    const testName = `Test Borrower ${timestamp}`;

    await page.goto('/portal');

    // Switch to Sign Up tab if on Sign In
    const signUpTab = page.locator('button:has-text("Sign Up")');
    if (await signUpTab.isVisible()) {
      await signUpTab.click();
    }

    // Fill registration form
    await page.locator('form input[type="text"]').first().fill(testName);
    await page.locator('form input[type="email"]').first().fill(testEmail);
    await page.locator('form input[type="tel"]').first().fill('9876543210');
    await page.locator('form input[type="password"]').first().fill('TestPass@123');

    // Submit registration
    await page.click('button[type="submit"]:has-text("Register & Continue")');

    // Should proceed to Step 2: Personal & Employment Details
    await expect(page.locator('text=Personal & Employment Details')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Step 2 of 4')).toBeVisible();
  });

  test('03. Evaluator Role Switcher Modal switches across all 6 roles', async ({ page }) => {
    await page.goto('/');

    // 1. Open Switch Role Modal
    const switchRoleBtn = page.locator('button:has-text("Switch Role"), button:has-text("Role")').first();
    await switchRoleBtn.click();
    await expect(page.locator('text=Quick Role Switcher')).toBeVisible();

    // 2. Switch to Admin
    await page.locator('button:has-text("Admin"):has-text("admin@creditsea.com")').click();
    await page.waitForURL('**/dashboard/admin', { timeout: 10000 });
    await expect(page.locator('text=Administrator Control Console')).toBeVisible();
    await expect(page.locator('text=ADMIN').first()).toBeVisible();

    // 3. Switch to Sales
    await switchRoleBtn.click();
    await page.locator('button:has-text("Sales Executive"):has-text("sales@creditsea.com")').click();
    await page.waitForURL('**/dashboard/sales', { timeout: 10000 });
    await expect(page.locator('text=Sales & Pre-Application Lead Tracking')).toBeVisible();
    await expect(page.locator('text=SALES').first()).toBeVisible();

    // 4. Switch to Sanction
    await switchRoleBtn.click();
    await page.locator('button:has-text("Sanction Officer"):has-text("sanction@creditsea.com")').click();
    await page.waitForURL('**/dashboard/sanction', { timeout: 10000 });
    await expect(page.locator('text=Sanction & Credit Underwriting Console')).toBeVisible();
    await expect(page.locator('text=SANCTION').first()).toBeVisible();

    // 5. Switch to Disbursement
    await switchRoleBtn.click();
    await page.locator('button:has-text("Disbursement Manager"):has-text("disburse@creditsea.com")').click();
    await page.waitForURL('**/dashboard/disbursement', { timeout: 10000 });
    await expect(page.locator('text=Disbursement Operations Module')).toBeVisible();
    await expect(page.locator('text=DISBURSEMENT').first()).toBeVisible();

    // 6. Switch to Collection
    await switchRoleBtn.click();
    await page.locator('button:has-text("Collection Executive"):has-text("collect@creditsea.com")').click();
    await page.waitForURL('**/dashboard/collection', { timeout: 10000 });
    await expect(page.locator('text=Collection & Loan Servicing Console')).toBeVisible();
    await expect(page.locator('text=COLLECTION').first()).toBeVisible();

    // 7. Switch to Borrower
    await switchRoleBtn.click();
    await page.locator('button:has-text("Borrower"):has-text("borrower@creditsea.com")').click();
    await page.waitForURL('**/portal', { timeout: 10000 });
    await expect(page.locator('text=Apply for Instant Personal Loan')).toBeVisible();
  });

  test('04. RBAC Check: My Loans and Borrower Portal are hidden from Admin navigation', async ({ page }) => {
    await page.goto('/login');

    // Login as Admin
    await page.fill('input[type="email"]', 'admin@creditsea.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]:has-text("Sign In")');

    await page.waitForURL('**/dashboard/admin', { timeout: 10000 });

    // Header nav links check: Admin MUST NOT have "My Loans"
    const navBar = page.locator('nav');
    await expect(navBar.locator('text=My Loans')).toHaveCount(0);
    await expect(navBar.locator('text=Borrower Portal')).toHaveCount(0);
    await expect(navBar.locator('text=Operations Dashboard')).toBeVisible();
  });
});
