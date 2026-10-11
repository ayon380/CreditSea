# CreditSea Loan Management System (LMS)
### Production-Grade Full-Stack Lending Platform (MERN • Next.js • TypeScript)

[![Next.js](https://img.shields.io/badge/Next.js-15%20(App%20Router)-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4%20(CreditSea%20Theme)-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange)](https://github.com/pmndrs/zustand)
[![Express](https://img.shields.io/badge/Express-TypeScript-green?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20Cluster-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Storage-Cloudinary%20API-3448C5?logo=cloudinary)](https://cloudinary.com/)

---

## 🚀 Live Deployments & Demo Video

| Resource | Link | Details |
|---|---|---|
| **🌐 Live Frontend App** | [https://credit-sea-kk9c.vercel.app](https://credit-sea-kk9c.vercel.app) | Deployed on **Vercel** |
| **⚡ Live Backend API** | [https://creditsea-1-zx6w.onrender.com](https://creditsea-1-zx6w.onrender.com) | Deployed on **Render** (Node.js + Express + MongoDB Atlas) |
| **🎥 Video Demonstration** | [Google Drive Video Walkthrough](https://drive.google.com/file/d/1qzyZaL4s-AEfbGryk1MX8RCnpU-rgwYD/view?usp=sharing) | Complete Lifecycle Walkthrough & 4 Operations Modules |

---

## 1. Project Overview

CreditSea LMS is a production-ready lending platform architected according to the official CreditSea fintech design system (`https://www.creditsea.com`). It delivers:
1. **Borrower Portal**: A multi-step application journey:
   - **Step 1: Authentication**: JWT auth with bcrypt salt rounds 10.
   - **Step 2: Personal Details + Eligibility**: Automated Business Rule Engine (BRE) evaluating age, salary, PAN, and employment.
   - **Step 3: Document Upload**: Salary slip document upload (PDF/PNG/JPG, $\le 5$MB) streamed to Cloudinary with secure local fallback.
   - **Step 4: Loan Terms & Calculations**: Sliders for Loan Amount (₹50K – ₹5L) and Tenure (30 – 365 days) with live Simple Interest formula at fixed 12% p.a.
   - **Lifecycle Tracker**: Detailed loan status tracking, outstanding balance, and repayment installment ledger.
2. **Operations Dashboard**: Internal console with 4 stage-specific modules guarded by **Role-Based Access Control (RBAC)**:
   - **Sales Module**: Pre-application leads tracking for drop-offs at Steps 1, 2, and 3.
   - **Sanction Module**: Underwriter review of applied loans, document verification, and approve/reject with mandatory reason.
   - **Disbursement Module**: Fund releases for sanctioned loans, recording bank NEFT transaction references.
   - **Collection Module**: Active loan servicing, recording payments with **globally unique UTR numbers**, balance decrement, and **automatic loan closure** when balance reaches zero.
   - **Admin Module**: Omni-access command center with portfolio metrics (total disbursed, outstanding book value, collected capital) and full pipeline access.
3. **Instant Evaluator Persona Switcher**: A 1-click modal to test each role instantly without retyping credentials.
4. **Theme Engine**: Instant **Light / Dark Mode** toggle with system preference detection and zero-flash CSS class synchronization.

---

## 2. Pre-Seeded Evaluator Accounts & Test Credentials

Run `npm run seed` in the `server` directory to pre-seed all accounts and populated sample loans:

| Role | Email | Password | Module Access Permitted |
|---|---|---|---|
| **Admin** | `admin@creditsea.com` | `Admin@123` | **All Modules** (Sales, Sanction, Disburse, Collect, Admin) |
| **Sales Executive** | `sales@creditsea.com` | `Sales@123` | **Sales Module Only** (Pre-application leads) |
| **Sanction Officer** | `sanction@creditsea.com` | `Sanction@123` | **Sanction Module Only** (Underwriting reviews) |
| **Disbursement Manager** | `disburse@creditsea.com` | `Disburse@123` | **Disbursement Module Only** (Fund releases) |
| **Collection Officer** | `collect@creditsea.com` | `Collect@123` | **Collection Module Only** (UTR recording & closure) |
| **Borrower** | `borrower@creditsea.com` | `Borrower@123` | **Borrower Portal Only** (Apply & loan ledger) |

---

## 3. Quick Start & Setup Instructions

### Prerequisites
- Node.js `v18+` (Tested on `v26.10.0`)
- npm `v9+`

### 1. Clone & Install
```bash
git clone https://github.com/ayon380/CreditSea.git
cd CreditSea

# Install Backend dependencies
cd server
npm install

# Install Frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env` and `client/.env.local`:
```bash
# In server/
cp ../.env.example .env

# In client/
echo "NEXT_PUBLIC_API_URL=http://localhost:5001/api" > .env.local
```

### 3. Seed Database with Known Accounts & Sample Loans
```bash
cd server
npm run seed
```
*(Pre-creates all 6 personas and populates real loans in APPLIED, SANCTIONED, DISBURSED, and CLOSED states).*

### 4. Run Both Servers Locally
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
# Server starts on http://localhost:5001
```

**Terminal 2 (Next.js Frontend):**
```bash
cd client
npm run dev
# App opens on http://localhost:3000
```

### 5. Run Automated E2E Test Suite (Playwright)
Run all 18 automated tests across all 6 personas, BRE rules, lending lifecycle, and RBAC security:
```bash
cd client
npm run test:e2e
```
*(Runs 18/18 sequential tests verifying all assignment workflows in ~16 seconds).*

---

## 4. Key Architectural Decisions (Assignment Conceptual Q&A)

### Q1: What is the correct PAN regex? Should BRE live on the client, server, or both? Why?
- **PAN Regex**: `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`
  - 5 uppercase alphabetic characters (e.g. 4th letter 'P' indicates Individual, 5th is surname initial), followed by 4 numeric digits, followed by 1 alphabetic check character.
- **Client vs Server BRE**:
  - **Both!**
  - **Client-Side**: Executes in real-time as users type to provide immediate UX diagnostics (instant green/red feedback badges without waiting for a server roundtrip).
  - **Server-Side**: **Authoritative and mandatory barrier**. Client-side checks can be bypassed via direct API calls (cURL / Postman / DevTools). The server BRE verifies every submission before saving to ensure regulatory compliance and database integrity.

### Q2: What status transitions happen in Sanction?
- State transition from `APPLIED` to either:
  - **`SANCTIONED`**: Underwriter approves the loan after inspecting stated income against the salary slip.
  - **`REJECTED`**: Underwriter declines the loan. A **mandatory rejection reason string** is enforced by both API and UI schema.

### Q3: What should the next status be in Disbursement?
- State transition from `SANCTIONED` to **`DISBURSED`**.
- The executive enters the bank transaction reference (e.g. `NEFT-AXIS-2026-XXXX`). Funds are marked released and the loan is now active.

### Q4: How do you track outstanding balance? What validations on payment amount?
- **Balance Tracking Formula**:
  $$\text{Outstanding Balance} = \text{Total Repayment Amount} - \sum (\text{Recorded Payments})$$
- **Payment Validations**:
  1. **Positive Amount**: Amount must be $> 0$.
  2. **Overpayment Guard**: Amount cannot exceed `outstandingBalance`. Any attempt to overpay returns a clear error (`400 Bad Request`).
  3. **Global UTR Uniqueness**: UTR number must be unique across the entire database (guaranteed via MongoDB unique index `utrNumber: 1` and server pre-validation returning `409 Conflict`).
  4. **Auto-Closure**: When `outstandingBalance == 0`, loan status transitions automatically to **`CLOSED`** with a completion timestamp `closedAt`.

### Q5: How are roles stored and checked? What HTTP status codes for unauthorized access?
- Roles are stored as an enum field on the `User` document: `['BORROWER', 'SALES', 'SANCTION', 'DISBURSEMENT', 'COLLECTION', 'ADMIN']`.
- **JWT payload** encodes `{ userId, email, role, name }`.
- **Middleware Pipeline**:
  - `authenticateToken`: Returns **`401 Unauthorized`** if token is absent, expired, or forged.
  - `authorizeRoles('SANCTION', 'ADMIN')`: Returns **`403 Forbidden`** (`{ success: false, message: "Forbidden: Access restricted. Your role is not authorized." }`) if authenticated user does not have permission.
- **Frontend Route Protection**: Next.js dashboard layout checks `user.role` from Zustand. Unauthorized visits are blocked with a clear 403 screen and button to return to their assigned module.

---

## 5. Walkthrough Script for Submission Video (3–5 min)

When recording your demonstration screen recording:

1. **Brand & Theme Overview (0:00 - 0:45)**:
   - Open `http://localhost:3000`. Show the CreditSea official brand styling (`#0075FF` electric blue, clean fintech typography).
   - Click the **Light / Dark Mode toggle** in the navbar to demonstrate instant, seamless theme switching.
   - Adjust the homepage loan sliders to demonstrate live Simple Interest calculation.

2. **Borrower Flow: BRE Rejection & Passing (0:45 - 2:00)**:
   - Click "Apply for Loan" or navigate to `/portal`.
   - **Step 1**: Register as a new borrower or sign in.
   - **Step 2**: Enter intentionally failing data (Age 19, Monthly Salary ₹15,000, Unemployed). Show how the live BRE highlights failures and the server blocks progression.
   - Now change to valid data (Age 30, Salary ₹65,000, PAN `ABCDE1234F`, Salaried) $\rightarrow$ all 4 checks turn green. Click "Verify & Proceed".
   - **Step 3**: Upload a salary slip (PDF/PNG/JPG). Show the verified document card.
   - **Step 4**: Set Loan Amount (e.g. ₹1,00,000) and Tenure (90 Days). Show the live calculation panel ($SI = ₹2,958.90$, Total = $₹1,02,958.90$).
   - Click "Apply for Loan" $\rightarrow$ confetti celebration triggers, redirecting to `/portal/my-loans` with the newly assigned Loan ID in `APPLIED` status.

3. **Operations: Sanction & Disbursement (2:00 - 3:15)**:
   - Click the navbar **"Switch Role"** button and select **Sanction Officer** (`sanction@creditsea.com`).
   - Notice the dashboard shows *only* the Sanction queue.
   - Review the applied loan, click "View Doc", and click **"Approve"**. Status becomes `SANCTIONED`.
   - Switch role to **Disbursement Manager** (`disburse@creditsea.com`).
   - Notice the loan is now in the Disbursement queue. Enter a bank NEFT reference number (e.g. `NEFT-2026-9901`) and click **"Disburse Funds"**. Status becomes `DISBURSED`.

4. **Operations: Collection, UTR Ledger & Auto-Closure (3:15 - 4:30)**:
   - Switch role to **Collection Executive** (`collect@creditsea.com`).
   - Notice the active loan with its outstanding balance.
   - Click **"Record UTR"**. Enter a unique UTR (e.g. `UTR99887766`), choose full payment, and submit.
   - Show the success celebration: remaining balance becomes ₹0 and loan status **AUTO-CLOSES**!
   - Switch to **Admin** to show global portfolio metrics updating across all pipelines.

---

## 6. Project Directory Structure

```
CreditSea/
├── client/                                 # Next.js 15 (App Router) Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/login/page.tsx       # Sign In with 1-click evaluator autofill
│   │   │   ├── portal/
│   │   │   │   ├── page.tsx                # Borrower 4-step wizard
│   │   │   │   └── my-loans/page.tsx       # Loan lifecycle status & payment ledger
│   │   │   ├── dashboard/
│   │   │   │   ├── layout.tsx              # Role-based layout guard & navigation
│   │   │   │   ├── admin/page.tsx          # Portfolio analytics & omni-queue
│   │   │   │   ├── sales/page.tsx          # Pre-application lead tracking module
│   │   │   │   ├── sanction/page.tsx       # Underwriting approval/rejection module
│   │   │   │   ├── disbursement/page.tsx   # Fund release & NEFT reference module
│   │   │   │   └── collection/page.tsx     # Payment recording & auto-closure module
│   │   │   ├── globals.css                 # CreditSea brand tokens & dark mode variant
│   │   │   ├── layout.tsx                  # Root layout with theme script
│   │   │   └── page.tsx                    # CreditSea official homepage
│   │   ├── components/
│   │   │   ├── Navbar.tsx                  # Branded header with role badges
│   │   │   ├── ThemeToggle.tsx             # Light / Dark mode button
│   │   │   ├── RoleSwitcherModal.tsx       # 1-Click evaluator persona switcher
│   │   │   └── portal/                     # Step1Auth, Step2PersonalBRE, Step3UploadSlip, Step4LoanConfig
│   │   ├── stores/                         # Zustand: useAuthStore, useThemeStore, useBorrowerStore
│   │   ├── lib/                            # API client, BRE rules, math calculation, formatters
│   │   └── types/                          # Shared TypeScript definitions
│   ├── package.json
│   └── tsconfig.json
│
├── server/                                 # Express.js + TypeScript Backend
│   ├── src/
│   │   ├── config/db.ts                    # MongoDB connection
│   │   ├── controllers/                    # Auth, BRE, Loan, Upload, Operations controllers
│   │   ├── middlewares/                    # authMiddleware, rbacMiddleware, uploadMiddleware, errorHandler
│   │   ├── models/                         # Mongoose schemas: User, Loan, Payment, AuditLog
│   │   ├── routes/                         # Express REST route declarations
│   │   ├── services/                       # breService, loanCalculationService, cloudinaryService
│   │   ├── scripts/seed.ts                 # Database seed script for 6 roles & loan fixtures
│   │   └── server.ts                       # Express server entrypoint
│   ├── uploads/                            # Secure local document storage fallback
│   ├── package.json
│   └── tsconfig.json
│
├── SYSTEM_DESIGN.md                        # Master Architecture Specification
├── .env.example
├── .gitignore
└── README.md
```

---

## 7. License

Built for the CreditSea Full-Stack Engineering Evaluation. All rights reserved.
