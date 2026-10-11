import { test, expect } from '@playwright/test';

test.describe('Borrower 4-Step Application Journey & Loan Submission', () => {
  test('Completes full end-to-end loan application through all 4 steps', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `journey_${timestamp}@creditsea-test.com`;

    // Clear session for fresh test run
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/portal');

    const signUpTab = page.locator('button:has-text("Sign Up")');
    if (await signUpTab.isVisible()) {
      await signUpTab.click();
    }

    await page.locator('form input[type="text"]').first().fill('Vikas Malhotra');
    await page.locator('form input[type="email"]').first().fill(testEmail);
    await page.locator('form input[type="tel"]').first().fill('9876543210');
    await page.locator('form input[type="password"]').first().fill('Borrower@123');
    await page.click('button[type="submit"]:has-text("Register & Continue")');

    // Step 2: Personal Details
    await expect(page.locator('text=Personal & Employment Details')).toBeVisible({ timeout: 10000 });
    await page.fill('input[placeholder="ABCDE1234F"]', 'ABCDE1234F');
    await page.fill('input[placeholder="e.g. 50,000"]', '65000');
    await page.click('button:has-text("Salaried")');

    await page.click('button[type="submit"]:has-text("Verify & Proceed to Upload")');

    // Step 3: Document Upload
    await expect(page.locator('text=Upload Salary Slip')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Step 3 of 4')).toBeVisible();

    // Upload dummy salary slip PDF
    const dummyPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000108 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n165\n%%EOF');
    await page.locator('input[type="file"]').setInputFiles({
      name: 'SalarySlip_Nov2026.pdf',
      mimeType: 'application/pdf',
      buffer: dummyPdfBuffer,
    });

    // Verify document uploaded preview card
    await expect(page.locator('text=SalarySlip_Nov2026.pdf')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Verified & Linked')).toBeVisible();

    // Proceed to Step 4
    await page.click('button:has-text("Configure Loan Terms")');

    // Step 4: Loan Configuration
    await expect(page.locator('text=Loan Configuration & Live Repayment Calculator')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Step 4 of 4')).toBeVisible();

    // Verify Interest Rate and math summary
    await expect(page.locator('text=12% p.a.').first()).toBeVisible();
    await expect(page.locator('text=Principal Amount').first()).toBeVisible();
    await expect(page.locator('text=Total Repayment').first()).toBeVisible();

    // Submit loan application
    await page.click('button:has-text("Apply for Loan")');

    // Should redirect to /portal/my-loans with success param
    await page.waitForURL('**/portal/my-loans?success=*', { timeout: 15000 });

    // Verify confirmation and loan listing
    await expect(page.locator('text=Application Successfully Submitted!')).toBeVisible();
    await expect(page.locator('h1:has-text("My Loan Applications & Repayment Ledger")')).toBeVisible();
    await expect(page.locator('text=Applied / In Review')).toBeVisible();
  });
});
