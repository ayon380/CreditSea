import mongoose from 'mongoose';
import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Loan } from '../models/Loan';
import { User } from '../models/User';
import { Payment } from '../models/Payment';
import { AuditLog } from '../models/AuditLog';
import { roundToTwoDecimals } from '../services/loanCalculationService';

const findLoanByIdOrCustomId = async (id: string) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const loan = await Loan.findById(id);
    if (loan) return loan;
  }
  return Loan.findOne({ loanId: id.toUpperCase().trim() });
};

// ==========================================
// 1. SALES MODULE: Pre-Application Leads
// ==========================================
export const getSalesLeads = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Borrowers who haven't completed a loan application or have applicationStep < 4
    const appliedBorrowerIds = await Loan.distinct('borrowerId');

    const leads = await User.find({
      role: 'BORROWER',
      _id: { $nin: appliedBorrowerIds },
    })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      leads: leads.map((lead) => ({
        id: lead._id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone || 'N/A',
        applicationStep: lead.applicationStep || 1,
        registeredAt: lead.createdAt,
        monthlySalary: lead.monthlySalary,
        employmentMode: lead.employmentMode,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. SANCTION MODULE: Review & Decision
// ==========================================
export const getSanctionQueue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const queue = await Loan.find({ status: 'APPLIED' })
      .populate('borrowerId', 'name email phone')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: queue.length,
      loans: queue,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const decideSanction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;
    const { decision, rejectionReason, remarks } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      res.status(400).json({
        success: false,
        message: "Decision must be either 'APPROVED' or 'REJECTED'.",
      });
      return;
    }

    if (decision === 'REJECTED' && (!rejectionReason || !rejectionReason.trim())) {
      res.status(400).json({
        success: false,
        message: 'A rejection reason is mandatory when rejecting a loan application.',
      });
      return;
    }

    const loan = await findLoanByIdOrCustomId(loanId);
    if (!loan) {
      res.status(404).json({ success: false, message: 'Loan record not found.' });
      return;
    }

    if (loan.status !== 'APPLIED') {
      res.status(400).json({
        success: false,
        message: `Invalid state transition. Loan is currently '${loan.status}', not 'APPLIED'.`,
      });
      return;
    }

    const nextStatus = decision === 'APPROVED' ? 'SANCTIONED' : 'REJECTED';

    loan.status = nextStatus;
    loan.sanctionDetails = {
      reviewedBy: req.user!.userId as any,
      reviewedAt: new Date(),
      decision,
      rejectionReason: decision === 'REJECTED' ? rejectionReason.trim() : undefined,
      remarks: remarks?.trim(),
    };

    await loan.save();

    await AuditLog.create({
      loanId: loan._id,
      actorId: req.user!.userId,
      action: decision === 'APPROVED' ? 'SANCTION_APPROVED' : 'SANCTION_REJECTED',
      fromStatus: 'APPLIED',
      toStatus: nextStatus,
      metadata: { decision, rejectionReason, remarks },
    });

    res.status(200).json({
      success: true,
      message: `Loan application successfully ${decision === 'APPROVED' ? 'sanctioned' : 'rejected'}.`,
      loan,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. DISBURSEMENT MODULE: Release Funds
// ==========================================
export const getDisbursementQueue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const queue = await Loan.find({ status: 'SANCTIONED' })
      .populate('borrowerId', 'name email phone')
      .sort({ updatedAt: 1 });

    res.status(200).json({
      success: true,
      count: queue.length,
      loans: queue,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const disburseLoan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;
    const { referenceNumber, paymentMode } = req.body;

    if (!referenceNumber || !referenceNumber.trim()) {
      res.status(400).json({
        success: false,
        message: 'Bank reference / NEFT number is required to confirm disbursement.',
      });
      return;
    }

    const loan = await findLoanByIdOrCustomId(loanId);
    if (!loan) {
      res.status(404).json({ success: false, message: 'Loan not found.' });
      return;
    }

    if (loan.status !== 'SANCTIONED') {
      res.status(400).json({
        success: false,
        message: `Cannot disburse. Loan status is '${loan.status}', expected 'SANCTIONED'.`,
      });
      return;
    }

    loan.status = 'DISBURSED';
    loan.disbursementDetails = {
      disbursedBy: req.user!.userId as any,
      disbursedAt: new Date(),
      referenceNumber: referenceNumber.trim().toUpperCase(),
      paymentMode: paymentMode || 'NEFT/RTGS',
      disbursedAmount: loan.financials.principalAmount,
    };

    await loan.save();

    await AuditLog.create({
      loanId: loan._id,
      actorId: req.user!.userId,
      action: 'LOAN_DISBURSED',
      fromStatus: 'SANCTIONED',
      toStatus: 'DISBURSED',
      metadata: {
        referenceNumber: referenceNumber.trim().toUpperCase(),
        disbursedAmount: loan.financials.principalAmount,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Loan marked as disbursed. Funds have been released to the borrower.',
      loan,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. COLLECTION MODULE: Record Payments
// ==========================================
export const getCollectionLoans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { includeClosed } = req.query;
    const filter: any = includeClosed === 'true'
      ? { status: { $in: ['DISBURSED', 'CLOSED'] } }
      : { status: 'DISBURSED' };

    const loans = await Loan.find(filter)
      .populate('borrowerId', 'name email phone')
      .sort({ updatedAt: -1 });

    const loanIds = loans.map((l) => l._id);
    const payments = await Payment.find({ loanId: { $in: loanIds } }).sort({ paymentDate: -1 });

    res.status(200).json({
      success: true,
      count: loans.length,
      loans,
      payments,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recordPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;
    const { utrNumber, amount, paymentDate, notes } = req.body;

    if (!utrNumber || !utrNumber.trim()) {
      res.status(400).json({
        success: false,
        message: 'UTR Number is mandatory.',
      });
      return;
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Payment amount must be a positive number greater than zero.',
      });
      return;
    }

    // Check UTR uniqueness across the entire system
    const normalizedUTR = utrNumber.trim().toUpperCase();
    const existingPayment = await Payment.findOne({ utrNumber: normalizedUTR });
    if (existingPayment) {
      res.status(409).json({
        success: false,
        message: `Duplicate UTR! Payment with UTR '${normalizedUTR}' is already recorded in the system.`,
      });
      return;
    }

    const loan = await findLoanByIdOrCustomId(loanId);
    if (!loan) {
      res.status(404).json({ success: false, message: 'Loan not found.' });
      return;
    }

    if (loan.status !== 'DISBURSED') {
      res.status(400).json({
        success: false,
        message: `Cannot record payment. Loan is in '${loan.status}' status, not active 'DISBURSED'.`,
      });
      return;
    }

    // Validate that payment does not exceed current outstanding balance
    const currentOutstanding = loan.financials.outstandingBalance;
    if (roundToTwoDecimals(parsedAmount) > roundToTwoDecimals(currentOutstanding)) {
      res.status(400).json({
        success: false,
        message: `Payment amount ₹${parsedAmount.toLocaleString('en-IN')} exceeds the outstanding balance of ₹${currentOutstanding.toLocaleString('en-IN')}.`,
      });
      return;
    }

    // Record payment
    const payment = await Payment.create({
      loanId: loan._id,
      borrowerId: loan.borrowerId,
      recordedBy: req.user!.userId,
      utrNumber: normalizedUTR,
      amount: roundToTwoDecimals(parsedAmount),
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      notes: notes?.trim(),
    });

    // Update loan financials
    const newTotalPaid = roundToTwoDecimals(loan.financials.totalAmountPaid + parsedAmount);
    const newOutstanding = roundToTwoDecimals(loan.financials.totalRepaymentAmount - newTotalPaid);

    loan.financials.totalAmountPaid = newTotalPaid;
    loan.financials.outstandingBalance = Math.max(0, newOutstanding);

    let isAutoClosed = false;
    if (loan.financials.outstandingBalance <= 0) {
      loan.status = 'CLOSED';
      loan.closedAt = new Date();
      isAutoClosed = true;
    }

    await loan.save();

    await AuditLog.create({
      loanId: loan._id,
      actorId: req.user!.userId,
      action: isAutoClosed ? 'PAYMENT_RECORDED_AND_LOAN_CLOSED' : 'PAYMENT_RECORDED',
      fromStatus: 'DISBURSED',
      toStatus: loan.status,
      metadata: {
        utrNumber: normalizedUTR,
        amount: parsedAmount,
        remainingBalance: loan.financials.outstandingBalance,
      },
    });

    res.status(201).json({
      success: true,
      message: isAutoClosed
        ? 'Payment recorded successfully! Total repayment reached — Loan is now AUTO-CLOSED.'
        : `Payment of ₹${parsedAmount.toLocaleString('en-IN')} recorded successfully.`,
      payment,
      loan,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. ADMIN MODULE: Global Overview & Metrics
// ==========================================
export const getAdminOverview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [leadsCount, appliedCount, sanctionedCount, disbursedLoans, closedLoans, totalUsers] = await Promise.all([
      User.countDocuments({ role: 'BORROWER', applicationStep: { $lt: 4 } }),
      Loan.countDocuments({ status: 'APPLIED' }),
      Loan.countDocuments({ status: 'SANCTIONED' }),
      Loan.find({ status: 'DISBURSED' }),
      Loan.find({ status: 'CLOSED' }),
      User.countDocuments(),
    ]);

    let totalPrincipalDisbursed = 0;
    let totalOutstandingBook = 0;
    let totalCollected = 0;

    disbursedLoans.forEach((loan) => {
      totalPrincipalDisbursed += loan.financials.principalAmount;
      totalOutstandingBook += loan.financials.outstandingBalance;
      totalCollected += loan.financials.totalAmountPaid;
    });

    closedLoans.forEach((loan) => {
      totalPrincipalDisbursed += loan.financials.principalAmount;
      totalCollected += loan.financials.totalAmountPaid;
    });

    res.status(200).json({
      success: true,
      metrics: {
        leads: leadsCount,
        applied: appliedCount,
        sanctioned: sanctionedCount,
        disbursed: disbursedLoans.length,
        closed: closedLoans.length,
        totalUsers,
        totalPrincipalDisbursed: roundToTwoDecimals(totalPrincipalDisbursed),
        totalOutstandingBook: roundToTwoDecimals(totalOutstandingBook),
        totalCollected: roundToTwoDecimals(totalCollected),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
