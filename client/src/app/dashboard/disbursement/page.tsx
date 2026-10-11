'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '../../../lib/api';
import { formatDate, formatCurrency } from '../../../lib/formatters';
import { ILoan } from '../../../types';
import {
  Send,
  CheckCircle2,
  Calendar,
  CreditCard,
  Building,
  X,
  FileCheck2,
  ArrowRight,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';

export default function DisbursementDashboardPage() {
  const [loans, setLoans] = useState<ILoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLoan, setActiveLoan] = useState<ILoan | null>(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentMode, setPaymentMode] = useState('NEFT/RTGS');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchDisbursementQueue();
  }, []);

  const fetchDisbursementQueue = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/operations/disbursement/queue');
      if (res.success && res.loans) {
        setLoans(res.loans);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisbursementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLoan) return;

    if (!referenceNumber.trim()) {
      setMessage({ type: 'error', text: 'Bank Reference / NEFT Number is mandatory.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await apiRequest(`/operations/disbursement/${activeLoan._id}/disburse`, {
        method: 'POST',
        body: JSON.stringify({
          referenceNumber: referenceNumber.trim().toUpperCase(),
          paymentMode,
        }),
      });

      if (res.success) {
        setMessage({
          type: 'success',
          text: `Loan ${activeLoan.loanId} successfully disbursed! Funds released and loan is now ACTIVE.`,
        });
        setActiveLoan(null);
        setReferenceNumber('');
        fetchDisbursementQueue();
      } else {
        setMessage({ type: 'error', text: res.message || 'Disbursement failed.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-500 mb-1">
            <Send className="w-4 h-4" />
            <span>Disbursement Operations Module</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Fund Release & Payout Queue
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Sanctioned loans waiting for bank transfer execution. Disbursing moves loan status to DISBURSED.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Pending Payout</span>
            <span className="text-xl font-black text-indigo-500">{loans.length}</span>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Disbursement Queue Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading disbursement queue...</span>
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Send className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">All Approved Loans Disbursed</p>
            <p className="text-xs text-gray-400">There are no loans in 'SANCTIONED' status waiting for payout.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-bold tracking-wider border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="p-4">Loan ID & Applicant</th>
                  <th className="p-4">Sanction Details</th>
                  <th className="p-4">Disbursal Amount</th>
                  <th className="p-4">Tenure & Terms</th>
                  <th className="p-4 text-right">Fund Release</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <Link
                          href={`/loans/${loan.loanId}`}
                          className="font-mono font-bold text-sm text-[#0075FF] hover:underline hover:text-[#0055CC] inline-flex items-center gap-1 group cursor-pointer"
                          title="Click to view full loan file and disbursement details"
                        >
                          <span>{loan.loanId}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white mt-0.5">
                        {loan.applicantSnapshot.fullName}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        PAN: {loan.applicantSnapshot.pan}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[11px]">
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>SANCTIONED</span>
                      </span>
                      <div className="text-[11px] text-gray-400 mt-1">
                        Reviewed: {formatDate(loan.sanctionDetails?.reviewedAt || loan.updatedAt)}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(loan.financials.principalAmount)}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Principal to transfer
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        {loan.financials.tenureDays} Days Tenure
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Total Repayment: {formatCurrency(loan.financials.totalRepaymentAmount)}
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setActiveLoan(loan);
                          setReferenceNumber(`NEFT-${Date.now().toString().slice(-6)}`);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Disburse Funds</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Disbursement Action Modal */}
      {activeLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Confirm Fund Disbursement
              </h3>
              <button onClick={() => setActiveLoan(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDisbursementSubmit}>
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 text-xs">
                  <div className="flex justify-between font-bold text-sm text-gray-900 dark:text-white mb-1">
                    <span>Disbursing to: {activeLoan.applicantSnapshot.fullName}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 text-base font-black">
                      {formatCurrency(activeLoan.financials.principalAmount)}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    Loan ID: {activeLoan.loanId} • PAN: {activeLoan.applicantSnapshot.pan}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Bank Reference / NEFT UTR Number*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NEFT-AXIS-20260210-9988"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent font-mono uppercase text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Recorded in the disbursement audit ledger.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Payout Transfer Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="NEFT/RTGS">NEFT / RTGS Bank Transfer</option>
                    <option value="IMPS">IMPS Instant Payout</option>
                    <option value="UPI">UPI Auto-Disburse</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveLoan(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all cursor-pointer"
                >
                  {submitting ? 'Executing Payout...' : 'Confirm & Mark as Disbursed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
