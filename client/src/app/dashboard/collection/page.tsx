'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '../../../lib/api';
import { formatDate, formatCurrency } from '../../../lib/formatters';
import { ILoan, IPayment } from '../../../types';
import confetti from 'canvas-confetti';
import {
  Wallet,
  CheckCircle2,
  Receipt,
  PlusCircle,
  TrendingUp,
  X,
  AlertCircle,
  Calendar,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Check,
  ExternalLink,
} from 'lucide-react';

export default function CollectionDashboardPage() {
  const [loans, setLoans] = useState<ILoan[]>([]);
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClosed, setShowClosed] = useState(false);

  // Payment Recording Modal State
  const [selectedLoan, setSelectedLoan] = useState<ILoan | null>(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentDate, setPaymentDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setPaymentDate(new Date().toISOString().split('T')[0]);
  }, []);

  const fetchCollectionLoans = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest(`/operations/collection/queue?includeClosed=${showClosed}`);
      if (res.success && res.loans) {
        setLoans(res.loans);
        setPayments(res.payments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [showClosed]);

  useEffect(() => {
    fetchCollectionLoans();
  }, [fetchCollectionLoans]);

  const handleOpenPaymentModal = (loan: ILoan) => {
    setSelectedLoan(loan);
    setUtrNumber(`UTR${Date.now().toString().slice(-8)}`);
    // Default to the full remaining outstanding balance
    setPaymentAmount(loan.financials.outstandingBalance);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setModalError(null);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    if (!utrNumber.trim()) {
      setModalError('UTR Number is required.');
      return;
    }

    const numAmount = Number(paymentAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setModalError('Payment amount must be greater than zero.');
      return;
    }

    if (numAmount > selectedLoan.financials.outstandingBalance) {
      setModalError(
        `Payment amount (${formatCurrency(numAmount)}) cannot exceed outstanding balance of ${formatCurrency(
          selectedLoan.financials.outstandingBalance
        )}.`
      );
      return;
    }

    setSubmitting(true);
    setModalError(null);

    try {
      const res = await apiRequest(`/operations/collection/${selectedLoan._id}/payment`, {
        method: 'POST',
        body: JSON.stringify({
          utrNumber: utrNumber.trim().toUpperCase(),
          amount: numAmount,
          paymentDate,
          notes: notes.trim(),
        }),
      });

      if (res.success) {
        const isClosed = res.loan?.status === 'CLOSED';
        if (isClosed) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        }

        setBannerMessage({
          type: 'success',
          text: isClosed
            ? `Payment recorded! Loan ${selectedLoan.loanId} balance is fully cleared and has been AUTO-CLOSED!`
            : `Payment of ${formatCurrency(numAmount)} recorded with UTR ${utrNumber.toUpperCase()}.`,
        });

        setSelectedLoan(null);
        fetchCollectionLoans();
      } else {
        setModalError(res.message || 'Payment recording failed.');
      }
    } catch (err: any) {
      setModalError(err.message || 'Network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1">
            <Wallet className="w-4 h-4" />
            <span>Collection & Loan Servicing Console</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Active Disbursed Loans & Repayments
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Track borrower repayments with globally unique UTR numbers. Full repayments trigger automatic closure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showClosed}
              onChange={(e) => setShowClosed(e.target.checked)}
              className="rounded accent-[#0075FF]"
            />
            <span>Include Closed Loans</span>
          </label>
        </div>
      </div>

      {bannerMessage && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{bannerMessage.text}</span>
          </div>
          <button onClick={() => setBannerMessage(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Collection Loans Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading active collection portfolio...</span>
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Wallet className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">No Loans in Collection Queue</p>
            <p className="text-xs text-gray-400">Disbursed loans ready for collection will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-bold tracking-wider border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="p-4">Loan ID & Borrower</th>
                  <th className="p-4">Total Repayment</th>
                  <th className="p-4">Total Paid</th>
                  <th className="p-4">Outstanding Balance</th>
                  <th className="p-4">Settlement Progress</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ledger Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loans.map((loan) => {
                  const percent = Math.min(
                    100,
                    Math.round(
                      ((loan.financials.totalAmountPaid || 0) /
                        (loan.financials.totalRepaymentAmount || 1)) *
                        100
                    )
                  );
                  const isClosed = loan.status === 'CLOSED';

                  return (
                    <tr key={loan._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="p-4">
                        <div>
                          <Link
                            href={`/loans/${loan.loanId}`}
                            className="font-mono font-bold text-sm text-[#0075FF] hover:underline hover:text-[#0055CC] inline-flex items-center gap-1 group cursor-pointer"
                            title="Click to view full loan file, repayment status and ledger"
                          >
                            <span>{loan.loanId}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white mt-0.5">
                          {loan.applicantSnapshot.fullName}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          Principal: {formatCurrency(loan.financials.principalAmount)}
                        </div>
                      </td>

                      <td className="p-4 font-bold text-sm text-gray-900 dark:text-white">
                        {formatCurrency(loan.financials.totalRepaymentAmount)}
                      </td>

                      <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(loan.financials.totalAmountPaid)}
                      </td>

                      <td className="p-4 font-bold text-amber-600 dark:text-amber-400 text-sm">
                        {formatCurrency(loan.financials.outstandingBalance)}
                      </td>

                      <td className="p-4 w-44">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-1">
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isClosed ? 'bg-purple-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold border text-[10px] ${
                            isClosed
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {isClosed ? <CheckCircle2 className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                          <span>{isClosed ? 'CLOSED' : 'ACTIVE'}</span>
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        {!isClosed ? (
                          <button
                            onClick={() => handleOpenPaymentModal(loan)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all whitespace-nowrap"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Record UTR</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">Fully Paid</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Record Borrower Installment Payment
              </h3>
              <button onClick={() => setSelectedLoan(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment}>
              <div className="p-6 space-y-4">
                {modalError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-sm text-gray-900 dark:text-white">
                    <span>Borrower: {selectedLoan.applicantSnapshot.fullName}</span>
                    <span className="font-mono text-[#0075FF]">{selectedLoan.loanId}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400 pt-1 border-t border-emerald-500/10">
                    <span>Current Outstanding Balance:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                      {formatCurrency(selectedLoan.financials.outstandingBalance)}
                    </span>
                  </div>
                </div>

                {/* UTR Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Unique UTR Number*
                    </label>
                    <span className="text-[11px] text-gray-400">Must be unique across system</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UTR202602109988"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent font-mono text-sm uppercase text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Amount Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Payment Amount (₹)*
                    </label>
                    <button
                      type="button"
                      onClick={() => setPaymentAmount(selectedLoan.financials.outstandingBalance)}
                      className="text-[11px] font-bold text-[#0075FF] hover:underline"
                    >
                      Pay Full ({formatCurrency(selectedLoan.financials.outstandingBalance)})
                    </button>
                  </div>
                  <input
                    type="number"
                    required
                    min={1}
                    max={selectedLoan.financials.outstandingBalance}
                    placeholder="Amount received"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Payment Date */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Transaction Remarks / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Received via NetBanking IMPS"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLoan(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all cursor-pointer"
                >
                  {submitting ? 'Recording Payment...' : 'Record Payment & Settle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
