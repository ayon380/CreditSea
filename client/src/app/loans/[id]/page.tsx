'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '../../../lib/api';
import { formatCurrency, formatDate, formatTenureMonths } from '../../../lib/formatters';
import { ILoan, IPayment, IAuditLog } from '../../../types';
import { useAuthStore } from '../../../stores/useAuthStore';
import {
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowLeft,
  FileCheck2,
  Send,
  Wallet,
  Receipt,
  FileText,
  User,
  Shield,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
  Percent,
  Banknote,
  DollarSign,
  Info,
  Sparkles,
  X,
  History,
} from 'lucide-react';

function LoanDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const loanParam = params?.id as string;
  const { user } = useAuthStore();

  const [loan, setLoan] = useState<ILoan | null>(null);
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [auditLogs, setAuditLogs] = useState<IAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals for Role Actions
  const [showSanctionApproveModal, setShowSanctionApproveModal] = useState(false);
  const [showSanctionRejectModal, setShowSanctionRejectModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Form states
  const [sanctionRemarks, setSanctionRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [disburseReference, setDisburseReference] = useState('');
  const [disbursePaymentMode, setDisbursePaymentMode] = useState('NEFT/RTGS');
  const [payUtr, setPayUtr] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const fetchLoanDetails = useCallback(async () => {
    if (!loanParam) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiRequest(`/loans/${loanParam}`);
      if (res.success && res.loan) {
        setLoan(res.loan);
        setPayments(res.payments || []);
        setAuditLogs(res.auditLogs || []);
      } else {
        setErrorMsg(res.message || 'Loan record could not be found.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch loan details.');
    } finally {
      setLoading(false);
    }
  }, [loanParam]);

  useEffect(() => {
    fetchLoanDetails();
  }, [fetchLoanDetails]);

  const handleCopyLoanId = () => {
    if (!loan) return;
    navigator.clipboard.writeText(loan.loanId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return {
          label: 'Applied / In Underwriting',
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
          icon: Clock,
        };
      case 'SANCTIONED':
        return {
          label: 'Sanctioned / Ready to Disburse',
          color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
          icon: FileCheck2,
        };
      case 'DISBURSED':
        return {
          label: 'Disbursed / Active Collection',
          color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
          icon: Send,
        };
      case 'CLOSED':
        return {
          label: 'Closed / Fully Repaid',
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          icon: CheckCircle2,
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
          icon: XCircle,
        };
      default:
        return {
          label: status,
          color: 'bg-gray-500/10 text-gray-600 border-gray-500/30',
          icon: Info,
        };
    }
  };

  const getBackUrl = () => {
    if (!user) return '/portal/my-loans';
    switch (user.role) {
      case 'ADMIN':
        return '/dashboard/admin';
      case 'SANCTION':
        return '/dashboard/sanction';
      case 'DISBURSEMENT':
        return '/dashboard/disbursement';
      case 'COLLECTION':
        return '/dashboard/collection';
      case 'SALES':
        return '/dashboard/sales';
      case 'BORROWER':
      default:
        return '/portal/my-loans';
    }
  };

  // Role Action Handlers
  const handleSanctionSubmit = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!loan) return;
    setActionSubmitting(true);
    setBannerMessage(null);

    const body: any = {
      decision,
      remarks: decision === 'APPROVED' ? sanctionRemarks : rejectionRemarks,
    };
    if (decision === 'REJECTED') {
      if (!rejectionReason.trim()) {
        setBannerMessage({ type: 'error', text: 'Please specify a rejection reason.' });
        setActionSubmitting(false);
        return;
      }
      body.rejectionReason = rejectionReason.trim();
    }

    try {
      const res = await apiRequest(`/operations/sanction/${loan.loanId}/decide`, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (res.success) {
        setBannerMessage({
          type: 'success',
          text: `Loan application ${decision === 'APPROVED' ? 'sanctioned and approved' : 'rejected'} successfully!`,
        });
        setShowSanctionApproveModal(false);
        setShowSanctionRejectModal(false);
        setSanctionRemarks('');
        setRejectionReason('');
        setRejectionRemarks('');
        await fetchLoanDetails();
      } else {
        setBannerMessage({ type: 'error', text: res.message || 'Operation failed.' });
      }
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Error occurred.' });
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleDisburseSubmit = async () => {
    if (!loan) return;
    if (!disburseReference.trim()) {
      setBannerMessage({ type: 'error', text: 'Bank reference / NEFT number is required.' });
      return;
    }

    setActionSubmitting(true);
    setBannerMessage(null);

    try {
      const res = await apiRequest(`/operations/disbursement/${loan.loanId}/disburse`, {
        method: 'POST',
        body: JSON.stringify({
          referenceNumber: disburseReference.trim(),
          paymentMode: disbursePaymentMode,
        }),
      });

      if (res.success) {
        setBannerMessage({
          type: 'success',
          text: 'Loan marked as Disbursed. Funds released to the borrower successfully!',
        });
        setShowDisburseModal(false);
        setDisburseReference('');
        await fetchLoanDetails();
      } else {
        setBannerMessage({ type: 'error', text: res.message || 'Disbursement failed.' });
      }
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Error occurred.' });
    } finally {
      setActionSubmitting(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!loan) return;
    const numAmount = parseFloat(payAmount);
    if (!payUtr.trim()) {
      setBannerMessage({ type: 'error', text: 'UTR Number is mandatory.' });
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setBannerMessage({ type: 'error', text: 'Please enter a valid positive payment amount.' });
      return;
    }
    if (numAmount > loan.financials.outstandingBalance) {
      setBannerMessage({
        type: 'error',
        text: `Amount exceeds current outstanding balance of ${formatCurrency(loan.financials.outstandingBalance)}.`,
      });
      return;
    }

    setActionSubmitting(true);
    setBannerMessage(null);

    try {
      const res = await apiRequest(`/operations/collection/${loan.loanId}/payment`, {
        method: 'POST',
        body: JSON.stringify({
          utrNumber: payUtr.trim(),
          amount: numAmount,
          paymentDate: payDate,
          notes: payNotes.trim(),
        }),
      });

      if (res.success) {
        setBannerMessage({
          type: 'success',
          text: `Payment of ${formatCurrency(numAmount)} recorded successfully with UTR ${payUtr.toUpperCase()}!`,
        });
        setShowPaymentModal(false);
        setPayUtr('');
        setPayAmount('');
        setPayNotes('');
        await fetchLoanDetails();
      } else {
        setBannerMessage({ type: 'error', text: res.message || 'Payment recording failed.' });
      }
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Error recording payment.' });
    } finally {
      setActionSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 px-4 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-3 border-[#0075FF] border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">
          Fetching Loan File...
        </h3>
        <p className="text-xs text-gray-400 mt-1">Retrieving financial ledger, applicant KYC and audit history</p>
      </div>
    );
  }

  if (errorMsg || !loan) {
    return (
      <div className="min-h-screen py-20 px-4 max-w-xl mx-auto text-center">
        <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Loan Record Not Found</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {errorMsg || 'The requested loan ID does not exist or you do not have permission to view this file.'}
          </p>
          <div className="pt-2">
            <Link
              href={getBackUrl()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-[#0075FF] text-white hover:bg-[#0066DD] transition-all text-sm cursor-pointer shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const badge = getStatusBadge(loan.status);
  const BadgeIcon = badge.icon;
  const progressPercent = Math.min(
    100,
    Math.round(
      ((loan.financials.totalAmountPaid || 0) / (loan.financials.totalRepaymentAmount || 1)) * 100
    )
  );

  const canSanction = (user?.role === 'SANCTION' || user?.role === 'ADMIN') && loan.status === 'APPLIED';
  const canDisburse = (user?.role === 'DISBURSEMENT' || user?.role === 'ADMIN') && loan.status === 'SANCTIONED';
  const canCollect = (user?.role === 'COLLECTION' || user?.role === 'ADMIN') && loan.status === 'DISBURSED';

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Back Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href={getBackUrl()}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[#0075FF] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to {user?.role === 'BORROWER' ? 'My Loans' : `${user?.role || 'Console'} Overview`}</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Loans</span>
          <span>/</span>
          <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">{loan.loanId}</span>
        </div>
      </div>

      {/* Banner Notifications */}
      {bannerMessage && (
        <div
          className={`p-4 rounded-2xl text-sm flex items-center justify-between border shadow-sm animate-scaleIn ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="font-medium">{bannerMessage.text}</span>
          </div>
          <button onClick={() => setBannerMessage(null)} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Loan Header Banner */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                {loan.loanId}
              </span>
              <button
                onClick={handleCopyLoanId}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                title="Copy Loan ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold border ${badge.color}`}>
                <BadgeIcon className="w-3.5 h-3.5" />
                <span>{badge.label}</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>Applicant: <strong className="text-gray-900 dark:text-white">{loan.applicantSnapshot.fullName}</strong></span>
              <span>•</span>
              <span>Applied: {formatDate(loan.createdAt)}</span>
              <span>•</span>
              <span>Tenure: {loan.financials.tenureDays} Days ({formatTenureMonths(loan.financials.tenureDays)})</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            {/* Contextual Role Actions at the Top */}
            {canSanction && (
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => setShowSanctionApproveModal(true)}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Approve & Sanction</span>
                </button>
                <button
                  onClick={() => setShowSanctionRejectModal(true)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            )}

            {canDisburse && (
              <button
                onClick={() => setShowDisburseModal(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Disburse Principal ({formatCurrency(loan.financials.principalAmount)})</span>
              </button>
            )}

            {canCollect && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                <span>Record Repayment UTR</span>
              </button>
            )}

            {loan.status === 'CLOSED' && (
              <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Loan Account Fully Settled & Closed</span>
              </div>
            )}
          </div>
        </div>

        {/* Highlighted Role Action Notice if actionable */}
        {(canSanction || canDisburse || canCollect) && (
          <div className="mt-4 p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-500/20 flex items-center gap-3 text-xs text-blue-700 dark:text-blue-300">
            <Shield className="w-4 h-4 shrink-0 text-[#0075FF]" />
            <span>
              <strong>Executive Privilege Active ({user?.role}):</strong> You have underwriting and execution authority to take action on this loan file.
            </span>
          </div>
        )}
      </div>

      {/* Repayment Status & Financial Calculations (Core user request) */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0075FF] mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Repayment & Settlement Status</span>
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              Repayment Ledger & Live Balance
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500">Settlement Progress:</span>
            <span className="text-sm font-black text-[#0075FF]">{progressPercent}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#0075FF] via-indigo-500 to-emerald-500 transition-all duration-700 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-semibold text-gray-400">
            <span>Repaid: {formatCurrency(loan.financials.totalAmountPaid || 0)}</span>
            <span>Target: {formatCurrency(loan.financials.totalRepaymentAmount)}</span>
          </div>
        </div>

        {/* 4 Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Principal */}
          <div className="p-5 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Sanctioned Principal</span>
              <Banknote className="w-4 h-4 text-[#0075FF]" />
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {formatCurrency(loan.financials.principalAmount)}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              Interest Rate: 12% p.a. fixed
            </div>
          </div>

          {/* 2. Total Repayment */}
          <div className="p-5 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Repayment Obligation</span>
              <DollarSign className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {formatCurrency(loan.financials.totalRepaymentAmount)}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              Includes {formatCurrency(loan.financials.interestAmount)} interest
            </div>
          </div>

          {/* 3. Total Repaid (How much is repaid) */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Amount Repaid</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(loan.financials.totalAmountPaid || 0)}
            </div>
            <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
              {payments.length} verified payment receipt(s)
            </div>
          </div>

          {/* 4. Outstanding Balance */}
          <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Outstanding Balance</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {formatCurrency(loan.financials.outstandingBalance)}
            </div>
            <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">
              {loan.status === 'CLOSED' ? 'Cleared & fully resolved' : 'Remaining to be recovered'}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Applicant KYC Snapshot & Execution Lifecycle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Applicant Snapshot & Documents */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0075FF]">
            <User className="w-4 h-4" />
            <span>Borrower KYC & Underwriting File</span>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs sm:text-sm">
            <div className="py-3 flex justify-between items-center">
              <span className="text-gray-400">Borrower Full Name</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {loan.applicantSnapshot.fullName}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-gray-400">PAN Card Number</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  {loan.applicantSnapshot.pan}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Check className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-gray-400">Date of Birth / Age</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatDate(loan.applicantSnapshot.dob)} ({loan.applicantSnapshot.ageAtApplication} years)
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-gray-400">Monthly In-Hand Salary</span>
              <span className="font-bold text-[#0075FF]">
                {formatCurrency(loan.applicantSnapshot.monthlySalary)} / month
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-gray-400">Employment Mode</span>
              <span className="font-semibold text-gray-900 dark:text-white uppercase text-xs">
                {loan.applicantSnapshot.employmentMode}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-gray-400">BRE Engine Decision</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{loan.breResult.status}</span>
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-gray-400">Salary Slip Document</span>
              {loan.salarySlip?.secureUrl ? (
                <a
                  href={loan.salarySlip.secureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/30 text-[#0075FF] hover:bg-blue-100 transition-colors border border-blue-500/20"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{loan.salarySlip.fileName || 'View Salary Slip'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-xs text-gray-400 italic">No document attached</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Execution Stage Details */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <Shield className="w-4 h-4" />
            <span>Execution Milestones & Disbursal</span>
          </div>

          <div className="space-y-4">
            {/* Sanction Details */}
            <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700 dark:text-gray-300">Sanction Review Decision</span>
                <span className="font-semibold text-gray-500">
                  {loan.sanctionDetails?.reviewedAt ? formatDate(loan.sanctionDetails.reviewedAt) : 'Pending'}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Status:{' '}
                <strong className={loan.sanctionDetails?.decision === 'REJECTED' ? 'text-red-500' : 'text-emerald-500'}>
                  {loan.sanctionDetails?.decision || (loan.status === 'APPLIED' ? 'Under Review' : 'Approved')}
                </strong>
              </div>
              {loan.sanctionDetails?.rejectionReason && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
                  <strong>Rejection Reason:</strong> {loan.sanctionDetails.rejectionReason}
                </div>
              )}
              {loan.sanctionDetails?.remarks && (
                <div className="text-xs text-gray-500 italic">
                  Remarks: {loan.sanctionDetails.remarks}
                </div>
              )}
            </div>

            {/* Disbursement Details */}
            <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700 dark:text-gray-300">Disbursement Release Record</span>
                <span className="font-semibold text-gray-500">
                  {loan.disbursementDetails?.disbursedAt ? formatDate(loan.disbursementDetails.disbursedAt) : 'Pending'}
                </span>
              </div>
              {loan.disbursementDetails ? (
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-gray-400 block text-[11px]">NEFT / Bank Reference</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {loan.disbursementDetails.referenceNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Mode</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {loan.disbursementDetails.paymentMode}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Amount Released</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(loan.disbursementDetails.disbursedAmount)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">
                  Funds have not been disbursed yet. Disbursed loans will display transaction reference here.
                </p>
              )}
            </div>

            {/* Closure Record */}
            {loan.status === 'CLOSED' && (
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Account Settlement Completed</span>
                </div>
                <p className="text-emerald-700 dark:text-emerald-300">
                  Total outstanding balance has reached ₹0. Loan closed on {formatDate(loan.closedAt || loan.updatedAt)}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Repayment Transactions Ledger Table (Detailed user requirement) */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0075FF] mb-1">
              <Receipt className="w-4 h-4" />
              <span>Verified Repayment Ledger</span>
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              Installment Payments Recorded ({payments.length})
            </h3>
          </div>

          {canCollect && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Record New Payment</span>
            </button>
          )}
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <Receipt className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-60" />
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">No Repayments Recorded Yet</h4>
            <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
              When the borrower submits repayment UTR numbers and the Collection department verifies them, transactions will be permanently recorded in this ledger.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/70 text-gray-500 uppercase font-bold tracking-wider border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="p-4">Payment Date</th>
                  <th className="p-4">UTR Number</th>
                  <th className="p-4">Amount Paid</th>
                  <th className="p-4">Recorded By</th>
                  <th className="p-4">Notes / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 font-semibold text-gray-900 dark:text-white">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#0075FF]">
                      {p.utrNumber}
                    </td>
                    <td className="p-4 font-black text-sm text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {p.recordedBy?.name || 'Collection Officer'}
                    </td>
                    <td className="p-4 text-gray-500">
                      {p.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Log Trail */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
          <History className="w-4 h-4 text-[#0075FF]" />
          <span>Complete Audit Trail & Stage Transitions ({auditLogs.length})</span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No audit log records found for this loan.</p>
        ) : (
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log._id}
                className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#0075FF] mt-1.5 sm:mt-0 shrink-0" />
                  <div>
                    <span className="font-mono font-bold text-gray-900 dark:text-white mr-2">
                      {log.action}
                    </span>
                    {log.fromStatus && log.toStatus && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold mr-2">
                        {log.fromStatus} → {log.toStatus}
                      </span>
                    )}
                    <span className="text-gray-500">
                      by {log.actorId?.name || 'System'} ({log.actorId?.role || 'AUTO'})
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 shrink-0">
                  {new Date(log.timestamp).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* ACTION MODALS                                             */}
      {/* ======================================================== */}

      {/* 1. Sanction Approve Modal */}
      {showSanctionApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 text-emerald-600">
                <FileCheck2 className="w-5 h-5" />
                <h3 className="font-black text-lg text-gray-900 dark:text-white">Approve Loan Sanction</h3>
              </div>
              <button
                onClick={() => setShowSanctionApproveModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Confirm sanction approval for <strong>{loan.applicantSnapshot.fullName}</strong> ({loan.loanId}) for principal amount of <strong>{formatCurrency(loan.financials.principalAmount)}</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Underwriter Remarks (Optional)
              </label>
              <textarea
                value={sanctionRemarks}
                onChange={(e) => setSanctionRemarks(e.target.value)}
                rows={3}
                placeholder="e.g., Verified salary slip and PAN KYC. Approved standard terms."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0075FF]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSanctionApproveModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionSubmitting}
                onClick={() => handleSanctionSubmit('APPROVED')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {actionSubmitting ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Sanction Reject Modal */}
      {showSanctionRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <h3 className="font-black text-lg text-gray-900 dark:text-white">Reject Loan Application</h3>
              </div>
              <button
                onClick={() => setShowSanctionRejectModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Reject application for <strong>{loan.applicantSnapshot.fullName}</strong>. A clear rejection reason is mandatory for regulatory audit compliance.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Mandatory Rejection Reason *
              </label>
              <input
                type="text"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Inconsistent salary documentation or high debt ratio"
                className="w-full px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-800 bg-white dark:bg-gray-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Internal Remarks (Optional)
              </label>
              <textarea
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)}
                rows={2}
                placeholder="Additional internal underwriter notes"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0075FF]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSanctionRejectModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionSubmitting || !rejectionReason.trim()}
                onClick={() => handleSanctionSubmit('REJECTED')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {actionSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Disbursement Modal */}
      {showDisburseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 text-indigo-600">
                <Send className="w-5 h-5" />
                <h3 className="font-black text-lg text-gray-900 dark:text-white">Release Loan Funds</h3>
              </div>
              <button
                onClick={() => setShowDisburseModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Disburse <strong>{formatCurrency(loan.financials.principalAmount)}</strong> to borrower <strong>{loan.applicantSnapshot.fullName}</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Bank Reference / NEFT UTR *
              </label>
              <input
                type="text"
                value={disburseReference}
                onChange={(e) => setDisburseReference(e.target.value.toUpperCase())}
                placeholder="e.g. HDFC9876543210"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Payment Mode
              </label>
              <select
                value={disbursePaymentMode}
                onChange={(e) => setDisbursePaymentMode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="NEFT/RTGS">NEFT / RTGS</option>
                <option value="IMPS">IMPS Immediate Transfer</option>
                <option value="UPI">Direct Bank UPI</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDisburseModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionSubmitting || !disburseReference.trim()}
                onClick={handleDisburseSubmit}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {actionSubmitting ? 'Disbursing...' : 'Confirm Disbursement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Collection / Repayment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 text-emerald-600">
                <Wallet className="w-5 h-5" />
                <h3 className="font-black text-lg text-gray-900 dark:text-white">Record Repayment</h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
              Current Outstanding Balance: <strong>{formatCurrency(loan.financials.outstandingBalance)}</strong>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Bank UTR Number * (Globally Unique)
              </label>
              <input
                type="text"
                value={payUtr}
                onChange={(e) => setPayUtr(e.target.value.toUpperCase())}
                placeholder="e.g. UTR-2026-990011"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Amount Paid (₹) *
              </label>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder={`Up to ${loan.financials.outstandingBalance}`}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Payment Date
              </label>
              <input
                type="date"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Payment Notes / Remarks (Optional)
              </label>
              <input
                type="text"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="e.g. Full settlement via UPI"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionSubmitting || !payUtr.trim() || !payAmount}
                onClick={handlePaymentSubmit}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {actionSubmitting ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoanDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-24 px-4 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-3 border-[#0075FF] border-t-transparent rounded-full animate-spin mb-4" />
          <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">Loading Loan File...</h3>
        </div>
      }
    >
      <LoanDetailsContent />
    </Suspense>
  );
}
