import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../types';
import { Loan } from '../models/Loan';
import { User } from '../models/User';
import { Payment } from '../models/Payment';
import { AuditLog } from '../models/AuditLog';
import { evaluateBRE } from '../services/breService';
import { calculateLoanMath } from '../services/loanCalculationService';

export const applyLoan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { applicantSnapshot, salarySlip, principalAmount, tenureDays } = req.body;

    if (!applicantSnapshot || !salarySlip || !principalAmount || !tenureDays) {
      res.status(400).json({
        success: false,
        message: 'Missing required application data: applicantSnapshot, salarySlip, principalAmount, or tenureDays.',
      });
      return;
    }

    // Backend authoritative BRE Check
    const breEvaluation = evaluateBRE({
      dob: applicantSnapshot.dob,
      monthlySalary: Number(applicantSnapshot.monthlySalary),
      pan: applicantSnapshot.pan,
      employmentMode: applicantSnapshot.employmentMode,
    });

    if (!breEvaluation.passed) {
      res.status(422).json({
        success: false,
        message: 'Application rejected by automated Business Rule Engine (BRE).',
        failureReasons: breEvaluation.failureReasons,
      });
      return;
    }

    // Calculate Loan Math
    const loanFinancials = calculateLoanMath(Number(principalAmount), Number(tenureDays), 12.0);

    // Generate unique human-readable loan ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const loanId = `CS-${new Date().getFullYear()}-${randomSuffix}`;

    const newLoan = await Loan.create({
      loanId,
      borrowerId: req.user.userId,
      applicantSnapshot: {
        fullName: applicantSnapshot.fullName,
        pan: applicantSnapshot.pan.toUpperCase().trim(),
        dob: new Date(applicantSnapshot.dob),
        ageAtApplication: breEvaluation.evaluatedAge || 25,
        monthlySalary: Number(applicantSnapshot.monthlySalary),
        employmentMode: applicantSnapshot.employmentMode,
      },
      breResult: {
        status: 'PASSED',
        failureReasons: [],
        evaluatedAt: new Date(),
      },
      salarySlip: {
        publicId: salarySlip.publicId,
        secureUrl: salarySlip.secureUrl,
        fileName: salarySlip.fileName,
        fileSize: Number(salarySlip.fileSize),
        mimeType: salarySlip.mimeType,
        uploadedAt: new Date(),
      },
      financials: {
        principalAmount: loanFinancials.principalAmount,
        tenureDays: loanFinancials.tenureDays,
        annualInterestRate: loanFinancials.annualInterestRate,
        interestAmount: loanFinancials.interestAmount,
        totalRepaymentAmount: loanFinancials.totalRepaymentAmount,
        totalAmountPaid: 0,
        outstandingBalance: loanFinancials.totalRepaymentAmount,
      },
      status: 'APPLIED',
    });

    // Update borrower application step to 4 and ensure phone is persisted
    const userUpdates: any = { applicationStep: 4 };
    if (applicantSnapshot.phone && applicantSnapshot.phone.trim()) {
      userUpdates.phone = applicantSnapshot.phone.trim();
    }
    await User.findByIdAndUpdate(req.user.userId, userUpdates);

    // Create Audit Log
    await AuditLog.create({
      loanId: newLoan._id,
      actorId: req.user.userId,
      action: 'APPLICATION_SUBMITTED',
      fromStatus: 'DRAFT',
      toStatus: 'APPLIED',
      metadata: {
        principal: loanFinancials.principalAmount,
        tenure: loanFinancials.tenureDays,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully and sent for sanction underwriting review.',
      loan: newLoan,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error occurred while submitting loan application.',
    });
  }
};

export const getMyLoans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const loans = await Loan.find({ borrowerId: req.user.userId }).sort({ createdAt: -1 });

    // Fetch payments for these loans
    const loanIds = loans.map((l) => l._id);
    const payments = await Payment.find({ loanId: { $in: loanIds } }).sort({ paymentDate: -1 });

    res.status(200).json({
      success: true,
      loans,
      payments,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLoanById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const filter = isObjectId
      ? { _id: id }
      : { loanId: id.toUpperCase().trim() };

    const loan = await Loan.findOne(filter).populate('borrowerId', 'name email phone');

    if (!loan) {
      res.status(404).json({ success: false, message: 'Loan record not found' });
      return;
    }

    // Role check: Borrower can only view their own loan
    if (req.user?.role === 'BORROWER' && loan.borrowerId && (loan.borrowerId as any)._id.toString() !== req.user.userId) {
      res.status(403).json({ success: false, message: 'Access forbidden: Not your loan record' });
      return;
    }

    const payments = await Payment.find({ loanId: loan._id }).sort({ paymentDate: -1 });
    const auditLogs = await AuditLog.find({ loanId: loan._id })
      .populate('actorId', 'name email role')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      loan,
      payments,
      auditLogs,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
