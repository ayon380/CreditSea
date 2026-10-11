import { test, expect } from '@playwright/test';

test.describe('Lending Lifecycle E2E: APPLIED -> SANCTIONED -> DISBURSED -> CLOSED', () => {
  test('01. Complete happy-path traversal: Apply -> Sanction -> Disburse -> Settle & Auto-Close', async ({ page }) => {
    const timestamp = Date.now();
    const borrowerEmail = `lifecycle_${timestamp}@creditsea-test.com`;

    // -------------------------------------------------------------
    // PHASE 1: Borrower Submits Loan Application
    // -------------------------------------------------------------
    // Clear session for fresh test run
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/portal');

    // Sign up new borrower
    const signUpTab = page.locator('button:has-text("Sign Up")');
    if (await signUpTab.isVisible()) {
      await signUpTab.click();
    }
    await page.locator('form input[type="text"]').first().fill('Kavita Iyer');
    await page.locator('form input[type="email"]').first().fill(borrowerEmail);
    await page.locator('form input[type="tel"]').first().fill('9876501234');
    await page.locator('form input[type="password"]').first().fill('Borrower@123');
    await page.click('button[type="submit"]:has-text("Register & Continue")');

    // Step 2: Personal details
    await expect(page.locator('text=Personal & Employment Details')).toBeVisible({ timeout: 10000 });
    await page.fill('input[placeholder="ABCDE1234F"]', 'ABCDE1234F');
    await page.fill('input[placeholder="e.g. 50,000"]', '85000');
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

    // Capture Loan ID from success query param
    await page.waitForURL('**/portal/my-loans?success=*', { timeout: 15000 });
    const url = new URL(page.url());
    const loanId = url.searchParams.get('success');
    expect(loanId).toBeTruthy();
    expect(loanId).toMatch(/^CS-\d{4}-\d+$/);

    // Verify loan in borrower portal
    await expect(page.locator(`text=${loanId}`)).toBeVisible();
    await expect(page.locator('text=Applied / In Review')).toBeVisible();

    const switchRoleBtn = page.locator('button:has-text("Switch Role"), button:has-text("Role")').first();

    // -------------------------------------------------------------
    // PHASE 2: Sanction Officer Underwrites & Approves Loan
    // -------------------------------------------------------------
    await switchRoleBtn.click();
    await page.locator('button:has-text("Sanction Officer"):has-text("sanction@creditsea.com")').click();
    await page.waitForURL('**/dashboard/sanction', { timeout: 10000 });

    // Locate the newly created loan in queue
    const sanctionRow = page.locator(`tr:has-text("${loanId}")`);
    await expect(sanctionRow).toBeVisible({ timeout: 10000 });

    // Click Approve on this specific loan
    await sanctionRow.locator('button:has-text("Approve")').click();
    await expect(page.locator('text=Confirm Sanction Approval')).toBeVisible();

    // Confirm sanction
    await page.click('button:has-text("Confirm Sanction")');
    await expect(page.locator(`text=successfully Sanctioned`)).toBeVisible({ timeout: 10000 });

    // -------------------------------------------------------------
    // PHASE 3: Disbursement Manager Releases Funds & Records UTR
    // -------------------------------------------------------------
    await switchRoleBtn.click();
    await page.locator('button:has-text("Disbursement Manager"):has-text("disburse@creditsea.com")').click();
    await page.waitForURL('**/dashboard/disbursement', { timeout: 10000 });

    // Locate the sanctioned loan
    const disburseRow = page.locator(`tr:has-text("${loanId}")`);
    await expect(disburseRow).toBeVisible({ timeout: 10000 });
    await expect(disburseRow.locator('text=SANCTIONED')).toBeVisible();

    // Initiate Payout
    await disburseRow.locator('button:has-text("Disburse Funds")').click();
    await expect(page.locator('text=Confirm Fund Disbursement')).toBeVisible();

    // Fill payout details with unique UTR
    const disbUtr = `NEFT-${timestamp}`;
    await page.fill('input[placeholder="e.g. NEFT-AXIS-20260210-9988"]', disbUtr);
    await page.click('button:has-text("Confirm & Mark as Disbursed")');

    await expect(page.locator(`text=Loan ${loanId} successfully disbursed`)).toBeVisible({ timeout: 10000 });

    // -------------------------------------------------------------
    // PHASE 4: Collection Officer Records Full Repayment -> AUTO-CLOSED
    // -------------------------------------------------------------
    await switchRoleBtn.click();
    await page.locator('button:has-text("Collection Executive"):has-text("collect@creditsea.com")').click();
    await page.waitForURL('**/dashboard/collection', { timeout: 10000 });

    // Locate disbursed loan in active collection queue
    const collectRow = page.locator(`tr:has-text("${loanId}")`);
    await expect(collectRow).toBeVisible({ timeout: 10000 });

    // Click Record UTR
    await collectRow.locator('button:has-text("Record UTR")').click();
    await expect(page.locator('text=Record Borrower Installment Payment')).toBeVisible();

    // Enter installment repayment
    const payUtr = `UTR-${timestamp}`;
    await page.fill('input[placeholder="e.g. UTR202602109988"]', payUtr);
    await page.fill('input[placeholder="Amount received"]', '10000');
    await page.click('button:has-text("Record Payment & Settle")');

    await expect(page.locator('text=Payment of ')).toBeVisible({ timeout: 10000 });

    // -------------------------------------------------------------
    // PHASE 5: Borrower Logs Back In & Verifies Repayment Ledger
    // -------------------------------------------------------------
    const signOutBtn = page.locator('button[title="Sign Out"]');
    if (await signOutBtn.isVisible()) {
      await signOutBtn.click();
    }
    await page.goto('/login');
    await page.fill('input[type="email"]', borrowerEmail);
    await page.fill('input[type="password"]', 'Borrower@123');
    await page.click('button[type="submit"]:has-text("Sign In")');
    await page.waitForURL('**/portal', { timeout: 10000 });

    await page.goto('/portal/my-loans');
    await expect(page.locator(`text=${loanId}`)).toBeVisible();
    await expect(page.locator('text=Disbursed (Active)')).toBeVisible();

    // Verify disbursement UTR and repayment installment are displayed in ledger
    await expect(page.locator(`text=${disbUtr}`)).toBeVisible();
    await expect(page.locator(`text=${payUtr}`)).toBeVisible();
  });

  test('02. Sanction Underwriter reviews applied loan and rejects it with mandatory reason', async ({ page }) => {
    const timestamp = Date.now();
    const rejectEmail = `reject_${timestamp}@creditsea-test.com`;

    // 1. Borrower submits loan application
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/portal');

    const signUpTab = page.locator('button:has-text("Sign Up")');
    if (await signUpTab.isVisible()) {
      await signUpTab.click();
    }
    await page.locator('form input[type="text"]').first().fill('Ramesh Kumar');
    await page.locator('form input[type="email"]').first().fill(rejectEmail);
    await page.locator('form input[type="tel"]').first().fill('9876509999');
    await page.locator('form input[type="password"]').first().fill('Borrower@123');
    await page.click('button[type="submit"]:has-text("Register & Continue")');

    await expect(page.locator('text=Personal & Employment Details')).toBeVisible({ timeout: 10000 });
    await page.fill('input[placeholder="ABCDE1234F"]', 'ABCDE1234F');
    await page.fill('input[placeholder="e.g. 50,000"]', '45000');
    await page.click('button:has-text("Salaried")');
    await page.click('button[type="submit"]:has-text("Verify & Proceed to Upload")');

    await expect(page.locator('text=Upload Salary Slip')).toBeVisible({ timeout: 10000 });
    const dummyPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\nxref\n0 2\n0000000000 65535 f \ntrailer<</Size 2/Root 1 0 R>>\nstartxref\n50\n%%EOF');
    await page.locator('input[type="file"]').setInputFiles({
      name: 'SalarySlip_Reject.pdf',
      mimeType: 'application/pdf',
      buffer: dummyPdfBuffer,
    });
    await expect(page.locator('text=SalarySlip_Reject.pdf')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("Configure Loan Terms")');

    await expect(page.locator('text=Loan Configuration & Live Repayment Calculator')).toBeVisible({ timeout: 10000 });
    await page.click('button:has-text("Apply for Loan")');

    await page.waitForURL('**/portal/my-loans?success=*', { timeout: 15000 });
    const url = new URL(page.url());
    const loanId = url.searchParams.get('success');

    // 2. Sanction Officer rejects application
    const switchRoleBtn = page.locator('button:has-text("Switch Role"), button:has-text("Role")').first();
    await switchRoleBtn.click();
    await page.locator('button:has-text("Sanction Officer"):has-text("sanction@creditsea.com")').click();
    await page.waitForURL('**/dashboard/sanction', { timeout: 10000 });

    const sanctionRow = page.locator(`tr:has-text("${loanId}")`);
    await expect(sanctionRow).toBeVisible({ timeout: 10000 });

    await sanctionRow.locator('button:has-text("Reject")').click();
    await expect(page.locator('text=Reject Loan Application')).toBeVisible();

    const rejectionReasonText = 'Salary credit inconsistent with bank statements';
    await page.fill('textarea[placeholder*="Provide specific reason"]', rejectionReasonText);
    await page.click('button:has-text("Confirm Rejection")');

    await expect(page.locator(`text=Loan ${loanId} successfully Rejected`)).toBeVisible({ timeout: 10000 });

    // 3. Borrower logs back in & verifies rejection status and reason
    const signOutBtn = page.locator('button[title="Sign Out"]');
    if (await signOutBtn.isVisible()) {
      await signOutBtn.click();
    }
    await page.goto('/login');
    await page.fill('input[type="email"]', rejectEmail);
    await page.fill('input[type="password"]', 'Borrower@123');
    await page.click('button[type="submit"]:has-text("Sign In")');
    await page.waitForURL('**/portal', { timeout: 10000 });

    await page.goto('/portal/my-loans');
    await expect(page.locator(`text=${loanId}`)).toBeVisible();
    await expect(page.locator('text=Rejected').first()).toBeVisible();
    await expect(page.locator(`text=${rejectionReasonText}`)).toBeVisible();
  });
});
