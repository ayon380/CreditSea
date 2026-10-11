'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '../../../lib/api';
import { formatDate, formatCurrency } from '../../../lib/formatters';
import { ILoan } from '../../../types';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Calendar,
  X,
  CreditCard,
  User,
} from 'lucide-react';

export default function SanctionDashboardPage() {
  const [loans, setLoans] = useState<ILoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLoan, setActiveLoan] = useState<ILoan | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSanctionQueue();
  }, []);

  const fetchSanctionQueue = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/operations/sanction/queue');
      if (res.success && res.loans) {
        setLoans(res.loans);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecisionSubmit = async () => {
    if (!activeLoan || !actionType) return;

    if (actionType === 'REJECT' && !rejectionReason.trim()) {
      setMessage({ type: 'error', text: 'A rejection reason is mandatory when declining an application.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await apiRequest(`/operations/sanction/${activeLoan._id}/decide`, {
        method: 'POST',
        body: JSON.stringify({
          decision: actionType === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          rejectionReason: actionType === 'REJECT' ? rejectionReason.trim() : undefined,
          remarks: remarks.trim(),
        }),
      });

      if (res.success) {
        setMessage({
          type: 'success',
          text: `Loan ${activeLoan.loanId} successfully ${actionType === 'APPROVE' ? 'Sanctioned' : 'Rejected'}.`,
        });
        setActiveLoan(null);
        setActionType(null);
        setRejectionReason('');
        setRemarks('');
        fetchSanctionQueue();
      } else {
        setMessage({ type: 'error', text: res.message || 'Decision submission failed.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error communicating with server.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
            <FileCheck2 className="w-4 h-4" />
            <span>Sanction & Credit Underwriting Console</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Applied Loans Underwriting Queue
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Review applicant snapshots, verified salary slips, and approve (transition to SANCTIONED) or reject with mandatory reasons.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Pending Underwriting</span>
            <span className="text-xl font-black text-amber-500">{loans.length}</span>
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

      {/* Sanction Queue Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading pending underwriting queue...</span>
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileCheck2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Sanction Queue is Clear</p>
            <p className="text-xs text-gray-400">There are no loans in 'APPLIED' status waiting for review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-bold tracking-wider border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="p-4">Loan ID & Applicant</th>
                  <th className="p-4">Income & PAN</th>
                  <th className="p-4">Requested Terms</th>
                  <th className="p-4">BRE Evaluation</th>
                  <th className="p-4">Salary Slip</th>
                  <th className="p-4 text-right">Underwriting Action</th>
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
                          title="Click to view full loan file and underwriting details"
                        >
                          <span>{loan.loanId}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white mt-0.5">
                        {loan.applicantSnapshot.fullName}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Age: {loan.applicantSnapshot.ageAtApplication} yrs • {formatDate(loan.createdAt)}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(loan.applicantSnapshot.monthlySalary)} / mo
                      </div>
                      <div className="font-mono text-gray-500 mt-0.5">
                        PAN: {loan.applicantSnapshot.pan}
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase">
                        {loan.applicantSnapshot.employmentMode}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-base text-gray-900 dark:text-white">
                        {formatCurrency(loan.financials.principalAmount)}
                      </div>
                      <div className="text-gray-500">
                        Tenure: {loan.financials.tenureDays} Days
                      </div>
                      <div className="text-[11px] text-[#0075FF] font-semibold">
                        Total Repay: {formatCurrency(loan.financials.totalRepaymentAmount)}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>BRE PASSED</span>
                      </span>
                    </td>

                    <td className="p-4">
                      <a
                        href={loan.salarySlip.secureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-[#0075FF] text-[#0075FF] transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="font-semibold">View Doc</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>

                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setActiveLoan(loan);
                          setActionType('APPROVE');
                          setRejectionReason('');
                          setRemarks('');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveLoan(loan);
                          setActionType('REJECT');
                          setRejectionReason('');
                          setRemarks('');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-sm"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {activeLoan && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {actionType === 'APPROVE' ? 'Confirm Sanction Approval' : 'Reject Loan Application'}
              </h3>
              <button
                onClick={() => {
                  setActiveLoan(null);
                  setActionType(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs">
                <div className="flex justify-between font-bold text-sm text-gray-900 dark:text-white mb-1">
                  <span>Loan ID: {activeLoan.loanId}</span>
                  <span className="text-[#0075FF]">{formatCurrency(activeLoan.financials.principalAmount)}</span>
                </div>
                <div className="text-gray-500">
                  Applicant: {activeLoan.applicantSnapshot.fullName} • PAN: {activeLoan.applicantSnapshot.pan}
                </div>
              </div>

              {actionType === 'REJECT' ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1.5">
                    Rejection Reason (Mandatory)*
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide specific reason for rejection (e.g. Inconsistent salary credit, failed document verification)..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-3 rounded-xl border border-red-300 dark:border-red-900 bg-transparent text-xs text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs">
                  Approving this loan transitions its status to <span className="font-bold">SANCTIONED</span> and moves it into the Disbursement operations queue.
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Internal Remarks / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verified with 3 months bank statement"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#0075FF]"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveLoan(null);
                  setActionType(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleDecisionSubmit}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
                  actionType === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {submitting ? 'Submitting...' : actionType === 'APPROVE' ? 'Confirm Sanction' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
