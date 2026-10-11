import { test, expect } from '@playwright/test';

test.describe('Automated Business Rule Engine (BRE) & Rejection Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Start with a clean borrower session
    await page.goto('/login');
    await page.fill('input[type="email"]', 'borrower@creditsea.com');
    await page.fill('input[type="password"]', 'Borrower@123');
    await page.click('button[type="submit"]:has-text("Sign In")');
    await page.waitForURL('**/portal', { timeout: 10000 });

    // Ensure on Step 2 (if on Step 1, click Continue)
    const continueBtn = page.locator('button:has-text("Continue to Personal Details")');
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
    }
    await expect(page.locator('text=Personal & Employment Details')).toBeVisible();
  });

  test('01. Underage applicant (< 23) receives clear rejection modal with reason', async ({ page }) => {
    // Fill basic details
    await page.fill('input[placeholder="e.g. Arjun Sharma"]', 'Underage Applicant');
    await page.fill('input[placeholder="ABCDE1234F"]', 'ABCDE1234F');
    await page.fill('input[placeholder="e.g. 50,000"]', '50000');

    // Click DatePicker trigger to open calendar popover
    const datePickerBtn = page.locator('button:has-text("yrs")').first();
    await datePickerBtn.click();

    // Click year button in popover header to open YEARS selector
    const currentYearBtn = page.locator('div.animate-fadeIn button:has-text("20")').last();
    await currentYearBtn.click();

    // Select year 2008 (age 18 years, under 23)
    const year2008 = page.locator('button:has-text("2008")');
    if (await year2008.isVisible()) {
      await year2008.click();
      // Select month Jan
      await page.locator('button:has-text("Jan")').click();
      // Select day 15
      await page.locator('div.animate-fadeIn button:has-text("15")').first().click();
    }

    // Submit for verification
    await page.click('button[type="submit"]:has-text("Verify & Proceed to Upload")');

    // Verify rejection modal pops up
    const modal = page.locator('text=Unfortunately, We Couldn\'t Offer You a Loan at This Time');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Verify clear reason is shown
    await expect(page.locator('text=Applicant age must be between 23 and 50 years')).toBeVisible();

    // Verify modal dismiss button
    const reviewBtn = page.locator('button:has-text("Review & Edit Details")');
    await expect(reviewBtn).toBeVisible();
    await reviewBtn.click();
    await expect(modal).not.toBeVisible();
  });

  test('02. Salary below ₹25,000 receives clear rejection modal with reason', async ({ page }) => {
    await page.fill('input[placeholder="e.g. Arjun Sharma"]', 'Low Income Applicant');
    await page.fill('input[placeholder="ABCDE1234F"]', 'ABCDE1234F');
    // Set salary to ₹15,000 (below threshold)
    await page.fill('input[placeholder="e.g. 50,000"]', '15000');

    // Click Salaried
    await page.click('button:has-text("Salaried")');

    // Submit for verification
    await page.click('button[type="submit"]:has-text("Verify & Proceed to Upload")');

    // Verify rejection modal
    await expect(page.locator('text=Unfortunately, We Couldn\'t Offer You a Loan at This Time')).toBeVisible();
    await expect(page.locator('text=Monthly salary must be at least ₹25,000')).toBeVisible();

    // Dismiss modal
    await page.click('button[aria-label="Close modal"], button:has-text("Review & Edit Details")');
  });

  test('03. Employment status Unemployed receives clear rejection modal with reason', async ({ page }) => {
    await page.fill('input[placeholder="e.g. Arjun Sharma"]', 'Unemployed Applicant');
    await page.fill('input[placeholder="ABCDE1234F"]', 'ABCDE1234F');
    await page.fill('input[placeholder="e.g. 50,000"]', '60000');

    // Select Unemployed
    await page.click('button:has-text("Unemployed")');

    // Submit for verification
    await page.click('button[type="submit"]:has-text("Verify & Proceed to Upload")');

    // Verify rejection modal
    await expect(page.locator('text=Unfortunately, We Couldn\'t Offer You a Loan at This Time')).toBeVisible();
    await expect(page.locator('text=Applicants with employment status "Unemployed" are not eligible')).toBeVisible();

    // Dismiss modal
    await page.click('button:has-text("Review & Edit Details")');
  });

  test('04. Invalid PAN format receives clear rejection modal with reason', async ({ page }) => {
    await page.fill('input[placeholder="e.g. Arjun Sharma"]', 'Invalid PAN Applicant');
    await page.fill('input[placeholder="ABCDE1234F"]', 'ABCDE12345');
    await page.fill('input[placeholder="e.g. 50,000"]', '60000');
    await page.click('button:has-text("Salaried")');

    // Submit for verification
    await page.click('button[type="submit"]:has-text("Verify & Proceed to Upload")');

    // Verify rejection modal
    await expect(page.locator('text=Unfortunately, We Couldn\'t Offer You a Loan at This Time')).toBeVisible();
    await expect(page.locator('text=Invalid PAN format')).toBeVisible();

    // Dismiss modal
    await page.click('button:has-text("Review & Edit Details")');
  });

  test('05. Fully eligible applicant passes BRE and proceeds directly to Step 3', async ({ page }) => {
    await page.fill('input[placeholder="e.g. Arjun Sharma"]', 'Eligible Applicant');
    await page.fill('input[placeholder="ABCDE1234F"]', 'ABCDE1234F');
    await page.fill('input[placeholder="e.g. 50,000"]', '75000');

    // Ensure Salaried mode is selected
    await page.click('button:has-text("Salaried")');

    // Submit
    await page.click('button[type="submit"]:has-text("Verify & Proceed to Upload")');

    // Should NOT show rejection modal; instead proceeds directly to Step 3
    await expect(page.locator('text=Upload Salary Slip')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Step 3 of 4')).toBeVisible();
  });
});
