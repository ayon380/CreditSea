import { test, expect } from '@playwright/test';

test.describe('Sales Lead Tracking & Backend RBAC Security Enforcement', () => {
  test('01. Sales Executive tracks pre-application leads who dropped off at Step 1', async ({ page }) => {
    const timestamp = Date.now();
    const leadEmail = `lead_${timestamp}@creditsea-test.com`;
    const leadName = `Lead Prospect ${timestamp}`;

    // Step 1: Prospect registers an account but drops off before Step 2
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/portal');

    const signUpTab = page.locator('button:has-text("Sign Up")');
    if (await signUpTab.isVisible()) {
      await signUpTab.click();
    }
    await page.locator('form input[type="text"]').first().fill(leadName);
    await page.locator('form input[type="email"]').first().fill(leadEmail);
    await page.locator('form input[type="tel"]').first().fill('9876540001');
    await page.locator('form input[type="password"]').first().fill('Borrower@123');
    await page.click('button[type="submit"]:has-text("Register & Continue")');

    // Wait until Step 2 is reached, then prospect drops off
    await expect(page.locator('text=Personal & Employment Details')).toBeVisible({ timeout: 10000 });

    // Step 2: Sales Executive opens Sales Dashboard
    const switchRoleBtn = page.locator('button:has-text("Switch Role"), button:has-text("Role")').first();
    await switchRoleBtn.click();
    await page.locator('button:has-text("Sales Executive"):has-text("sales@creditsea.com")').click();
    await page.waitForURL('**/dashboard/sales', { timeout: 10000 });

    // Step 3: Verify the newly registered lead appears in the Pre-Application Queue
    await expect(page.locator('text=Sales & Pre-Application Lead Tracking')).toBeVisible();
    await expect(page.locator(`text=${leadEmail}`)).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=${leadName}`)).toBeVisible();
  });

  test('02. Backend API RBAC rejects unauthenticated requests with 401 and unauthorized roles with 403', async ({ request }) => {
    const API_URL = 'http://localhost:5001/api';

    // 1. Unauthenticated request to protected operations queue should return 401
    const unauthRes = await request.get(`${API_URL}/operations/sanction/queue`);
    expect(unauthRes.status()).toBe(401);
    const unauthJson = await unauthRes.json();
    expect(unauthJson.success).toBe(false);

    // 2. Obtain Borrower JWT token
    const borrowerAuthRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'borrower@creditsea.com', password: 'Borrower@123' },
    });
    expect(borrowerAuthRes.status()).toBe(200);
    const borrowerToken = (await borrowerAuthRes.json()).token;

    // 3. Borrower attempting to access internal Sanction Underwriting API returns 403 Forbidden
    const forbiddenRes = await request.get(`${API_URL}/operations/sanction/queue`, {
      headers: { Authorization: `Bearer ${borrowerToken}` },
    });
    expect(forbiddenRes.status()).toBe(403);
    const forbiddenJson = await forbiddenRes.json();
    expect(forbiddenJson.success).toBe(false);
    expect(forbiddenJson.message).toContain('Forbidden');

    // 4. Obtain Sales Executive JWT token
    const salesAuthRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'sales@creditsea.com', password: 'Sales@123' },
    });
    expect(salesAuthRes.status()).toBe(200);
    const salesToken = (await salesAuthRes.json()).token;

    // 5. Sales attempting to access Disbursement Queue API returns 403 Forbidden
    const salesForbiddenRes = await request.get(`${API_URL}/operations/disbursement/queue`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    });
    expect(salesForbiddenRes.status()).toBe(403);
  });

  test('03. Collection payment rejects duplicate UTR number across the system', async ({ request }) => {
    const API_URL = 'http://localhost:5001/api';
    const timestamp = Date.now();
    const duplicateUtr = `DUP-UTR-${timestamp}`;

    // Login as Collection Executive
    const collectAuthRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'collect@creditsea.com', password: 'Collect@123' },
    });
    expect(collectAuthRes.status()).toBe(200);
    const collectToken = (await collectAuthRes.json()).token;

    // Fetch active collection loans
    const loansRes = await request.get(`${API_URL}/operations/collection/queue`, {
      headers: { Authorization: `Bearer ${collectToken}` },
    });
    expect(loansRes.status()).toBe(200);
    const loans = (await loansRes.json()).loans;

    if (loans && loans.length > 0) {
      const targetLoan = loans[0];

      // 1. First payment with unique UTR succeeds
      const firstPaymentRes = await request.post(`${API_URL}/operations/collection/${targetLoan._id}/payment`, {
        headers: { Authorization: `Bearer ${collectToken}` },
        data: {
          utrNumber: duplicateUtr,
          amount: 100,
          paymentDate: new Date().toISOString(),
          notes: 'First payment test',
        },
      });
      expect(firstPaymentRes.status()).toBe(201);

      // 2. Second payment with identical UTR is rejected with 409 Conflict
      const secondPaymentRes = await request.post(`${API_URL}/operations/collection/${targetLoan._id}/payment`, {
        headers: { Authorization: `Bearer ${collectToken}` },
        data: {
          utrNumber: duplicateUtr,
          amount: 100,
          paymentDate: new Date().toISOString(),
          notes: 'Duplicate UTR test',
        },
      });
      expect(secondPaymentRes.status()).toBe(409);
      const secondJson = await secondPaymentRes.json();
      expect(secondJson.success).toBe(false);
      expect(secondJson.message).toContain('Duplicate UTR');
    }
  });
});
