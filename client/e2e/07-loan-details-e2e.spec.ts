import { test, expect } from '@playwright/test';

test.describe('Dedicated Loan Details Page (/loans/[id]) E2E Tests', () => {
  test('01. Clickable loan navigation, comprehensive financial breakdown, KYC snapshot, and role actions', async ({ page }) => {
    const timestamp = Date.now();
    const borrowerEmail = `loandetails_${timestamp}@creditsea-test.com`;

    // -------------------------------------------------------------
    // PHASE 1: Borrower Submits Loan Application
    // -------------------------------------------------------------
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/portal');

    const signUpTab = page.locator('button:has-text("Sign Up")');
    if (await signUpTab.isVisible()) {
      await signUpTab.click();
    }
    await page.locator('form input[type="text"]').first().fill('Rohit Sharma');
    await page.locator('form input[type="email"]').first().fill(borrowerEmail);
    await page.locator('form input[type="tel"]').first().fill('9876543210');
    await page.locator('form input[type="password"]').first().fill('Borrower@123');
    await page.click('button[type="submit"]:has-text("Register & Continue")');

    // Step 2: Personal details
    await expect(page.locator('text=Personal & Employment Details')).toBeVisible({ timeout: 10000 });
    await page.fill('input[placeholder="ABCDE1234F"]', 'ABCDE1234F');
    await page.fill('input[placeholder="e.g. 50,000"]', '75000');
    await page.click('button:has-text("Salaried")');
    await page.click('button[type="submit"]:has-text("Verify & Proceed to Upload")');

    // Step 3: Salary slip upload
    await expect(page.locator('text=Upload Salary Slip')).toBeVisible({ timeout: 10000 });
    const dummyPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\nxref\n0 2\n0000000000 65535 f \ntrailer<</Size 2/Root 1 0 R>>\nstartxref\n50\n%%EOF');
    await page.locator('input[type="file"]').setInputFiles({
      name: 'SalarySlip_Nov.pdf',
      mimeType: 'application/pdf',
      buffer: dummyPdfBuffer,
    });
    await expect(page.locator('text=SalarySlip_Nov.pdf')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("Configure Loan Terms")');

    // Step 4: Loan Config
    await expect(page.locator('text=Loan Configuration & Live Repayment Calculator')).toBeVisible({ timeout: 10000 });
    await page.click('button:has-text("Apply for Loan")');

    // Wait for redirect to /portal/my-loans?success=CS-XXXX-XXXX
    await page.waitForURL('**/portal/my-loans?success=*', { timeout: 15000 });
    const url = new URL(page.url());
    const loanId = url.searchParams.get('success');
    expect(loanId).toBeTruthy();

    // -------------------------------------------------------------
    // PHASE 2: Borrower clicks Loan ID to open Dedicated Page
    // -------------------------------------------------------------
    // Click the loan link
    const loanLink = page.locator(`a[href="/loans/${loanId}"]`).first();
    await expect(loanLink).toBeVisible();
    await loanLink.click();

    // Verify URL is /loans/[loanId]
    await page.waitForURL(`**/loans/${loanId}`, { timeout: 10000 });

    // Verify key sections on the Dedicated Loan Details Page
    // 1. Header with Loan ID and Status
    await expect(page.locator(`text=${loanId}`).first()).toBeVisible();
    await expect(page.locator('text=Applied / In Underwriting')).toBeVisible();

    // 2. Financial Breakdown & Repayment Calculations (User requirement)
    await expect(page.locator('text=Repayment & Settlement Status').first()).toBeVisible();
    await expect(page.locator('text=Repayment Ledger & Live Balance').first()).toBeVisible();
    await expect(page.locator('text=Sanctioned Principal').first()).toBeVisible();
    await expect(page.locator('text=Total Repayment Obligation').first()).toBeVisible();
    await expect(page.locator('text=Total Amount Repaid').first()).toBeVisible();
    await expect(page.locator('text=Outstanding Balance').first()).toBeVisible();
    await expect(page.locator('text=Settlement Progress:').first()).toBeVisible();

    // 3. KYC Snapshot
    await expect(page.locator('text=Borrower KYC & Underwriting File')).toBeVisible();
    await expect(page.locator('text=Rohit Sharma').first()).toBeVisible();
    await expect(page.locator('text=ABCDE1234F').first()).toBeVisible();
    await expect(page.locator('text=BRE Engine Decision')).toBeVisible();
    await expect(page.locator('text=PASSED').first()).toBeVisible();

    // 4. Payment Ledger Table
    await expect(page.locator('text=Verified Repayment Ledger')).toBeVisible();
    await expect(page.locator('text=No Repayments Recorded Yet')).toBeVisible();

    // -------------------------------------------------------------
    // PHASE 3: Sanction Officer views loan & Approves via Role Action Bar
    // -------------------------------------------------------------
    const switchRoleBtn = page.locator('button:has-text("Switch Role"), button:has-text("Role")').first();
    await switchRoleBtn.click();
    await page.locator('button:has-text("Sanction Officer"):has-text("sanction@creditsea.com")').click();
    await page.waitForTimeout(500);

    // Refresh the loan page as Sanction Officer
    await page.goto(`/loans/${loanId}`);
    await expect(page.locator('text=Approve & Sanction')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Reject')).toBeVisible();

    // Click Approve & Sanction
    await page.click('button:has-text("Approve & Sanction")');
    await expect(page.locator('text=Approve Loan Sanction')).toBeVisible();
    await page.click('button:has-text("Confirm Approval")');

    // Verify Status changed to SANCTIONED
    await expect(page.locator('text=Sanctioned / Ready to Disburse')).toBeVisible({ timeout: 10000 });

    // -------------------------------------------------------------
    // PHASE 4: Disbursement Officer Disburses via Role Action Bar
    // -------------------------------------------------------------
    await switchRoleBtn.click();
    await page.locator('button:has-text("Disbursement Manager"):has-text("disburse@creditsea.com")').click();
    await page.waitForTimeout(500);

    await page.goto(`/loans/${loanId}`);
    await expect(page.locator('button:has-text("Disburse Principal")')).toBeVisible({ timeout: 10000 });

    await page.click('button:has-text("Disburse Principal")');
    await expect(page.locator('text=Release Loan Funds')).toBeVisible();
    await page.fill('input[placeholder="e.g. HDFC9876543210"]', 'NEFT-TEST-889900');
    await page.click('button:has-text("Confirm Disbursement")');

    // Verify Status changed to DISBURSED
    await expect(page.locator('text=Disbursed / Active Collection')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=NEFT-TEST-889900')).toBeVisible();

    // -------------------------------------------------------------
    // PHASE 5: Collection Officer Records Repayment via Role Action Bar
    // -------------------------------------------------------------
    await switchRoleBtn.click();
    await page.locator('button:has-text("Collection Executive"):has-text("collect@creditsea.com")').click();
    await page.waitForTimeout(500);

    await page.goto(`/loans/${loanId}`);
    await expect(page.locator('button:has-text("Record Repayment UTR")')).toBeVisible({ timeout: 10000 });

    await page.click('button:has-text("Record Repayment UTR")');
    await expect(page.locator('h3:has-text("Record Repayment")')).toBeVisible();
    await page.fill('input[placeholder="e.g. UTR-2026-990011"]', `UTR-COLL-${timestamp}`);
    await page.fill('input[placeholder*="Up to"]', '10000');
    await page.click('button:has-text("Record Payment")');

    // Verify repayment reflects in ledger and live balance
    await expect(page.locator(`text=UTR-COLL-${timestamp}`).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=₹10,000').first()).toBeVisible();
    await expect(page.locator('text=1 verified payment receipt(s)')).toBeVisible();
  });
});
