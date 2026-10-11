import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { User } from '../models/User';
import { Loan } from '../models/Loan';
import { Payment } from '../models/Payment';
import { AuditLog } from '../models/AuditLog';
import { calculateLoanMath } from '../services/loanCalculationService';

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('Connecting to MongoDB Atlas for database seeding...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas.');

    // Clear existing seed data if needed
    console.log('Clearing old collections...');
    await Promise.all([
      User.deleteMany({}),
      Loan.deleteMany({}),
      Payment.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log('Creating role accounts with standard credentials...');

    // Hash passwords
    const adminPass = await bcrypt.hash('Admin@123', 10);
    const salesPass = await bcrypt.hash('Sales@123', 10);
    const sanctionPass = await bcrypt.hash('Sanction@123', 10);
    const disbursePass = await bcrypt.hash('Disburse@123', 10);
    const collectPass = await bcrypt.hash('Collect@123', 10);
    const borrowerPass = await bcrypt.hash('Borrower@123', 10);

    // 1. Pre-seed the 6 official Role Accounts
    const adminUser = await User.create({
      name: 'CreditSea Admin',
      email: 'admin@creditsea.com',
      passwordHash: adminPass,
      role: 'ADMIN',
      phone: '+91 98765 00001',
    });

    const salesUser = await User.create({
      name: 'Rohan (Sales Lead)',
      email: 'sales@creditsea.com',
      passwordHash: salesPass,
      role: 'SALES',
      phone: '+91 98765 00002',
    });

    const sanctionUser = await User.create({
      name: 'Priya (Underwriter)',
      email: 'sanction@creditsea.com',
      passwordHash: sanctionPass,
      role: 'SANCTION',
      phone: '+91 98765 00003',
    });

    const disburseUser = await User.create({
      name: 'Amit (Finance Ops)',
      email: 'disburse@creditsea.com',
      passwordHash: disbursePass,
      role: 'DISBURSEMENT',
      phone: '+91 98765 00004',
    });

    const collectUser = await User.create({
      name: 'Sneha (Collections Officer)',
      email: 'collect@creditsea.com',
      passwordHash: collectPass,
      role: 'COLLECTION',
      phone: '+91 98765 00005',
    });

    // Primary Borrower
    const primaryBorrower = await User.create({
      name: 'Arjun Sharma',
      email: 'borrower@creditsea.com',
      passwordHash: borrowerPass,
      role: 'BORROWER',
      phone: '+91 98201 12345',
      pan: 'ABCDE1234F',
      dob: new Date('1995-05-15'),
      monthlySalary: 75000,
      employmentMode: 'SALARIED',
      applicationStep: 4,
    });

    // 2. Pre-seed Sales Leads (Borrowers who dropped off)
    const lead1 = await User.create({
      name: 'Kavita Nair',
      email: 'kavita.nair@example.com',
      passwordHash: borrowerPass,
      role: 'BORROWER',
      phone: '+91 91234 56789',
      applicationStep: 1, // Only registered
    });

    const lead2 = await User.create({
      name: 'Rajesh Verma',
      email: 'rajesh.verma@example.com',
      passwordHash: borrowerPass,
      role: 'BORROWER',
      phone: '+91 99887 76655',
      pan: 'BKRPV8921K',
      dob: new Date('1992-11-20'),
      monthlySalary: 45000,
      employmentMode: 'SALARIED',
      applicationStep: 2, // Filled details + passed BRE
    });

    const lead3 = await User.create({
      name: 'Ananya Roy',
      email: 'ananya.roy@example.com',
      passwordHash: borrowerPass,
      role: 'BORROWER',
      phone: '+91 97766 55443',
      pan: 'CRPAR3341P',
      dob: new Date('1998-03-10'),
      monthlySalary: 62000,
      employmentMode: 'SELF_EMPLOYED',
      applicationStep: 3, // Uploaded slip, hasn't applied
    });

    console.log('Seeded users and sales leads.');

    // 3. Pre-seed Sample Loans across all stages for instant review

    // A. Loan in APPLIED state (for Sanction Module)
    const appliedMath = calculateLoanMath(150000, 180, 12);
    const appliedLoan = await Loan.create({
      loanId: 'CS-2026-1001',
      borrowerId: primaryBorrower._id,
      applicantSnapshot: {
        fullName: 'Arjun Sharma',
        pan: 'ABCDE1234F',
        dob: new Date('1995-05-15'),
        ageAtApplication: 30,
        monthlySalary: 75000,
        employmentMode: 'SALARIED',
      },
      breResult: {
        status: 'PASSED',
        failureReasons: [],
        evaluatedAt: new Date(),
      },
      salarySlip: {
        publicId: 'sample_salary_slip_1',
        secureUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
        fileName: 'Arjun_SalarySlip_Jan2026.pdf',
        fileSize: 1048576,
        mimeType: 'application/pdf',
        uploadedAt: new Date(),
      },
      financials: {
        principalAmount: appliedMath.principalAmount,
        tenureDays: appliedMath.tenureDays,
        annualInterestRate: appliedMath.annualInterestRate,
        interestAmount: appliedMath.interestAmount,
        totalRepaymentAmount: appliedMath.totalRepaymentAmount,
        totalAmountPaid: 0,
        outstandingBalance: appliedMath.totalRepaymentAmount,
      },
      status: 'APPLIED',
    });

    await AuditLog.create({
      loanId: appliedLoan._id,
      actorId: primaryBorrower._id,
      action: 'APPLICATION_SUBMITTED',
      fromStatus: 'DRAFT',
      toStatus: 'APPLIED',
    });

    // B. Loan in SANCTIONED state (for Disbursement Module)
    const secondBorrower = await User.create({
      name: 'Deepak Patel',
      email: 'deepak.patel@example.com',
      passwordHash: borrowerPass,
      role: 'BORROWER',
      phone: '+91 98450 98450',
      pan: 'DPKPA9988Q',
      dob: new Date('1990-08-14'),
      monthlySalary: 90000,
      employmentMode: 'SALARIED',
      applicationStep: 4,
    });

    const sanctionedMath = calculateLoanMath(250000, 120, 12);
    const sanctionedLoan = await Loan.create({
      loanId: 'CS-2026-1002',
      borrowerId: secondBorrower._id,
      applicantSnapshot: {
        fullName: 'Deepak Patel',
        pan: 'DPKPA9988Q',
        dob: new Date('1990-08-14'),
        ageAtApplication: 35,
        monthlySalary: 90000,
        employmentMode: 'SALARIED',
      },
      breResult: {
        status: 'PASSED',
        failureReasons: [],
        evaluatedAt: new Date(),
      },
      salarySlip: {
        publicId: 'sample_salary_slip_2',
        secureUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
        fileName: 'Deepak_SalarySlip.pdf',
        fileSize: 1258291,
        mimeType: 'application/pdf',
        uploadedAt: new Date(),
      },
      financials: {
        principalAmount: sanctionedMath.principalAmount,
        tenureDays: sanctionedMath.tenureDays,
        annualInterestRate: sanctionedMath.annualInterestRate,
        interestAmount: sanctionedMath.interestAmount,
        totalRepaymentAmount: sanctionedMath.totalRepaymentAmount,
        totalAmountPaid: 0,
        outstandingBalance: sanctionedMath.totalRepaymentAmount,
      },
      status: 'SANCTIONED',
      sanctionDetails: {
        reviewedBy: sanctionUser._id as any,
        reviewedAt: new Date(),
        decision: 'APPROVED',
        remarks: 'Salary slip and income documents verified. Credit score compliant.',
      },
    });

    await AuditLog.create({
      loanId: sanctionedLoan._id,
      actorId: sanctionUser._id,
      action: 'SANCTION_APPROVED',
      fromStatus: 'APPLIED',
      toStatus: 'SANCTIONED',
    });

    // C. Loan in DISBURSED state (for Collection Module)
    const thirdBorrower = await User.create({
      name: 'Meera Iyer',
      email: 'meera.iyer@example.com',
      passwordHash: borrowerPass,
      role: 'BORROWER',
      phone: '+91 97110 11223',
      pan: 'MRYIR4455M',
      dob: new Date('1988-12-05'),
      monthlySalary: 110000,
      employmentMode: 'SALARIED',
      applicationStep: 4,
    });

    const disbursedMath = calculateLoanMath(100000, 90, 12);
    const disbursedLoan = await Loan.create({
      loanId: 'CS-2026-1003',
      borrowerId: thirdBorrower._id,
      applicantSnapshot: {
        fullName: 'Meera Iyer',
        pan: 'MRYIR4455M',
        dob: new Date('1988-12-05'),
        ageAtApplication: 37,
        monthlySalary: 110000,
        employmentMode: 'SALARIED',
      },
      breResult: {
        status: 'PASSED',
        failureReasons: [],
        evaluatedAt: new Date(),
      },
      salarySlip: {
        publicId: 'sample_salary_slip_3',
        secureUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
        fileName: 'Meera_SalarySlip.pdf',
        fileSize: 850000,
        mimeType: 'application/pdf',
        uploadedAt: new Date(),
      },
      financials: {
        principalAmount: disbursedMath.principalAmount,
        tenureDays: disbursedMath.tenureDays,
        annualInterestRate: disbursedMath.annualInterestRate,
        interestAmount: disbursedMath.interestAmount,
        totalRepaymentAmount: disbursedMath.totalRepaymentAmount,
        totalAmountPaid: 25000, // One installment already paid!
        outstandingBalance: disbursedMath.totalRepaymentAmount - 25000,
      },
      status: 'DISBURSED',
      sanctionDetails: {
        reviewedBy: sanctionUser._id as any,
        reviewedAt: new Date(Date.now() - 15 * 86400000),
        decision: 'APPROVED',
        remarks: 'Approved with standard terms.',
      },
      disbursementDetails: {
        disbursedBy: disburseUser._id as any,
        disbursedAt: new Date(Date.now() - 14 * 86400000),
        referenceNumber: 'NEFT-AXIS-20260210-9988',
        paymentMode: 'NEFT/RTGS',
        disbursedAmount: 100000,
      },
    });

    // Record an initial payment for this disbursed loan
    await Payment.create({
      loanId: disbursedLoan._id,
      borrowerId: thirdBorrower._id,
      recordedBy: collectUser._id,
      utrNumber: 'CMSUTR20260215001',
      amount: 25000,
      paymentDate: new Date(Date.now() - 7 * 86400000),
      notes: 'First installment received via NetBanking.',
    });

    // D. Loan in CLOSED state
    const fourthBorrower = await User.create({
      name: 'Vikas Gupta',
      email: 'vikas.gupta@example.com',
      passwordHash: borrowerPass,
      role: 'BORROWER',
      phone: '+91 98980 98980',
      pan: 'VKSGP1122T',
      dob: new Date('1994-04-18'),
      monthlySalary: 85000,
      employmentMode: 'SALARIED',
      applicationStep: 4,
    });

    const closedMath = calculateLoanMath(50000, 30, 12);
    const closedLoan = await Loan.create({
      loanId: 'CS-2026-1004',
      borrowerId: fourthBorrower._id,
      applicantSnapshot: {
        fullName: 'Vikas Gupta',
        pan: 'VKSGP1122T',
        dob: new Date('1994-04-18'),
        ageAtApplication: 31,
        monthlySalary: 85000,
        employmentMode: 'SALARIED',
      },
      breResult: {
        status: 'PASSED',
        failureReasons: [],
        evaluatedAt: new Date(Date.now() - 40 * 86400000),
      },
      salarySlip: {
        publicId: 'sample_salary_slip_4',
        secureUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
        fileName: 'Vikas_SalarySlip.pdf',
        fileSize: 920000,
        mimeType: 'application/pdf',
        uploadedAt: new Date(Date.now() - 40 * 86400000),
      },
      financials: {
        principalAmount: closedMath.principalAmount,
        tenureDays: closedMath.tenureDays,
        annualInterestRate: closedMath.annualInterestRate,
        interestAmount: closedMath.interestAmount,
        totalRepaymentAmount: closedMath.totalRepaymentAmount,
        totalAmountPaid: closedMath.totalRepaymentAmount,
        outstandingBalance: 0,
      },
      status: 'CLOSED',
      sanctionDetails: {
        reviewedBy: sanctionUser._id as any,
        reviewedAt: new Date(Date.now() - 38 * 86400000),
        decision: 'APPROVED',
      },
      disbursementDetails: {
        disbursedBy: disburseUser._id as any,
        disbursedAt: new Date(Date.now() - 35 * 86400000),
        referenceNumber: 'NEFT-HDFC-20260105-1234',
        paymentMode: 'NEFT/RTGS',
        disbursedAmount: 50000,
      },
      closedAt: new Date(Date.now() - 5 * 86400000),
    });

    await Payment.create({
      loanId: closedLoan._id,
      borrowerId: fourthBorrower._id,
      recordedBy: collectUser._id,
      utrNumber: 'CMSUTR20260130889',
      amount: closedMath.totalRepaymentAmount,
      paymentDate: new Date(Date.now() - 5 * 86400000),
      notes: 'Full repayment settled. Auto-closed.',
    });

    console.log('✅ Seed completed successfully!');
    console.log('\n=============================================');
    console.log('🎉 CREDENTIALS READY FOR EVALUATOR TESTING:');
    console.log('=============================================');
    console.log('1. Admin:         admin@creditsea.com       / Admin@123');
    console.log('2. Sales:         sales@creditsea.com       / Sales@123');
    console.log('3. Sanction:      sanction@creditsea.com    / Sanction@123');
    console.log('4. Disbursement:  disburse@creditsea.com    / Disburse@123');
    console.log('5. Collection:    collect@creditsea.com     / Collect@123');
    console.log('6. Borrower:      borrower@creditsea.com    / Borrower@123');
    console.log('=============================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
