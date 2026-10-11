'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '../../../lib/api';
import { formatCurrency, formatDate } from '../../../lib/formatters';
import { ILoan, IPayment } from '../../../types';
import { useAuthStore } from '../../../stores/useAuthStore';
import {
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
  Receipt,
  FileCheck2,
  Calendar,
  Sparkles,
  Shield,
} from 'lucide-react';

function MyLoansContent() {
  const searchParams = useSearchParams();
  const successLoanId = searchParams.get('success');
  const { user } = useAuthStore();

  const [loans, setLoans] = useState<ILoan[]>([]);
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLoans = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/loans/my-applications');
      if (res.success) {
        setLoans(res.loans || []);
        setPayments(res.payments || []);
      } else {
        setErrorMsg(res.message || 'Failed to load loans');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error loading loan applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role === 'BORROWER') {
      fetchLoans();
    }
  }, [user, fetchLoans]);

  if (user && user.role !== 'BORROWER') {
    return (
      <div className="min-h-screen py-16 px-4 max-w-2xl mx-auto text-center">
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl space-y-4 animate-scaleIn">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto border border-purple-500/20">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            Executive Officer Account Active ({user.role})
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            &apos;My Loans&apos; is reserved for personal borrower accounts. As an internal {user.role} officer, you can monitor and manage all loans across the portfolio from the Operations Dashboard.
          </p>
          <div className="pt-2">
            <Link
              href={`/dashboard/${user.role.toLowerCase()}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-[#0075FF] text-white hover:bg-[#0066DD] transition-all text-sm shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <span>Go to {user.role} Operations Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return {
          label: 'Applied / In Review',
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
          icon: Clock,
        };
      case 'SANCTIONED':
        return {
          label: 'Sanctioned / Approved',
          color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
          icon: FileCheck2,
        };
      case 'DISBURSED':
        return {
          label: 'Disbursed (Active)',
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          icon: TrendingUp,
        };
      case 'CLOSED':
        return {
          label: 'Fully Paid & Closed',
          color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
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
          icon: Clock,
        };
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Success Notification Banner */}
      {successLoanId && (
        <div className="mb-8 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Application Successfully Submitted!
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Loan Application ID <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{successLoanId}</span> is now under Sanction review.
              </p>
            </div>
          </div>
          <Link
            href="/portal"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            New Application
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            My Loan Applications & Repayment Ledger
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Track your application lifecycle, disbursement details, and installment payments in real time.
          </p>
        </div>
        <Link
          href="/portal"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#0075FF] hover:bg-[#0066DD] text-white shadow-sm transition-all"
        >
          <span>Apply for New Loan</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          <div className="w-10 h-10 border-3 border-[#0075FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading your loan records...</p>
        </div>
      ) : loans.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            No Loan Applications Yet
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
            You have not applied for any loans yet. Complete our quick 4-step wizard to apply.
          </p>
          <Link
            href="/portal"
            className="px-5 py-2.5 rounded-xl font-bold bg-[#0075FF] hover:bg-[#0066DD] text-white text-sm shadow-md transition-all"
          >
            Start Loan Application
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {loans.map((loan) => {
            const badge = getStatusBadge(loan.status);
            const BadgeIcon = badge.icon;
            const progressPercent = Math.min(
              100,
              Math.round(
                ((loan.financials.totalAmountPaid || 0) /
                  (loan.financials.totalRepaymentAmount || 1)) *
                  100
              )
            );
            const loanPayments = payments.filter((p) => p.loanId === loan._id);

            return (
              <div
                key={loan._id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/loans/${loan.loanId}`}
                        className="font-mono text-lg font-black text-gray-900 dark:text-white hover:text-[#0075FF] transition-colors underline decoration-dotted underline-offset-4 cursor-pointer"
                        title="Click to view full loan details and repayment status"
                      >
                        {loan.loanId}
                      </Link>
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold border ${badge.color}`}
                      >
                        <BadgeIcon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Applied: {formatDate(loan.createdAt)}</span>
                      <span>•</span>
                      <span>Tenure: {loan.financials.tenureDays} Days</span>
                      <span>•</span>
                      <span>Rate: 12% p.a.</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1.5">
                    <div className="text-right">
                      <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                        Principal Loan Amount
                      </div>
                      <div className="text-2xl font-black text-[#0075FF]">
                        {formatCurrency(loan.financials.principalAmount)}
                      </div>
                    </div>
                    <Link
                      href={`/loans/${loan.loanId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0075FF] hover:text-[#0066DD] transition-colors cursor-pointer"
                    >
                      <span>View Full Loan File</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Financial overview cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
                    <span className="text-xs text-gray-500 font-semibold block mb-1">
                      Total Repayment Obligation
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(loan.financials.totalRepaymentAmount)}
                    </span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      Principal + ₹{loan.financials.interestAmount} Simple Interest
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block mb-1">
                      Total Amount Repaid
                    </span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(loan.financials.totalAmountPaid)}
                    </span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      {progressPercent}% Settled
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold block mb-1">
                      Remaining Outstanding Balance
                    </span>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      {formatCurrency(loan.financials.outstandingBalance)}
                    </span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      {loan.status === 'CLOSED' ? 'Settled in full' : 'Due for repayment'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-semibold mb-1.5 text-gray-500">
                    <span>Repayment Progress</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#0075FF] to-emerald-500 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Stage Details (Sanction, Disbursement, Rejection) */}
                {loan.status === 'REJECTED' && loan.sanctionDetails?.rejectionReason && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm mb-6">
                    <span className="font-bold">Sanction Rejection Reason: </span>
                    <span>{loan.sanctionDetails.rejectionReason}</span>
                  </div>
                )}

                {loan.disbursementDetails && (
                  <div className="p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-500/20 text-xs text-gray-600 dark:text-gray-300 flex flex-wrap gap-4 items-center mb-6">
                    <div>
                      <span className="text-gray-400 block">Bank Reference / NEFT:</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">
                        {loan.disbursementDetails.referenceNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Disbursed Date:</span>
                      <span className="font-semibold">
                        {formatDate(loan.disbursementDetails.disbursedAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Payment Mode:</span>
                      <span className="font-semibold">
                        {loan.disbursementDetails.paymentMode}
                      </span>
                    </div>
                  </div>
                )}

                {/* Payment Ledger Table */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Receipt className="w-4 h-4 text-[#0075FF]" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Payment Transactions Ledger ({loanPayments.length})
                    </h4>
                  </div>

                  {loanPayments.length === 0 ? (
                    <div className="text-xs text-gray-400 italic p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
                      No payments recorded yet. Payments recorded by the Collection department will appear here with unique UTR tracking.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase font-bold tracking-wider">
                          <tr>
                            <th className="p-3">Date</th>
                            <th className="p-3">UTR Number</th>
                            <th className="p-3">Amount Paid</th>
                            <th className="p-3">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                          {loanPayments.map((p) => (
                            <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                              <td className="p-3 font-medium">{formatDate(p.paymentDate)}</td>
                              <td className="p-3 font-mono font-bold text-[#0075FF]">{p.utrNumber}</td>
                              <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(p.amount)}
                              </td>
                              <td className="p-3 text-gray-500">{p.notes || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MyLoansPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#0075FF] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MyLoansContent />
    </Suspense>
  );
}

