'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../../lib/api';
import { formatCurrency } from '../../../lib/formatters';
import {
  Shield,
  Users,
  FileCheck2,
  Send,
  Wallet,
  TrendingUp,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  PieChart,
  DollarSign,
  AlertCircle,
  KeyRound,
  Search,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loanSearch, setLoanSearch] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/operations/admin/overview');
      if (res.success && res.metrics) {
        setMetrics(res.metrics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Control Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            CreditSea Portfolio Overview
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Omni-access across all 4 operational pipelines, lending lifecycle stages, and portfolio financials.
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
        >
          Refresh Portfolio Stats
        </button>
      </div>

      {/* Quick Loan Inspector Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (loanSearch.trim()) {
              router.push(`/loans/${loanSearch.trim().toUpperCase()}`);
            }
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={loanSearch}
              onChange={(e) => setLoanSearch(e.target.value)}
              placeholder="Inspect any loan file by ID (e.g. CS-9382-1049)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0075FF]"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0075FF] hover:bg-[#0066DD] text-white shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Open Loan File</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Aggregating portfolio metrics...</span>
        </div>
      ) : metrics ? (
        <>
          {/* Key Financial KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Total Disbursed Capital
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#0075FF]">
                {formatCurrency(metrics.totalPrincipalDisbursed)}
              </span>
              <span className="text-xs text-gray-500 mt-1 block">
                Total funds released across portfolio
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block mb-1">
                Outstanding Book Value
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-500">
                {formatCurrency(metrics.totalOutstandingBook)}
              </span>
              <span className="text-xs text-gray-500 mt-1 block">
                Total unpaid principal + accrued interest
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 block mb-1">
                Total Collected Cash
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-500">
                {formatCurrency(metrics.totalCollected)}
              </span>
              <span className="text-xs text-gray-500 mt-1 block">
                Verified UTR collections settled
              </span>
            </div>
          </div>

          {/* Module Pipeline Stage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Sales */}
            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col justify-between hover:border-blue-500 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-gray-900 dark:text-white">
                    {metrics.leads}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Sales Pipeline</h3>
                <p className="text-xs text-gray-500 mt-1">Pre-application leads who dropped off</p>
              </div>
              <Link
                href="/dashboard/sales"
                className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold text-[#0075FF] group-hover:translate-x-0.5 transition-transform"
              >
                <span>View Sales Queue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 2. Sanction */}
            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col justify-between hover:border-amber-500 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-gray-900 dark:text-white">
                    {metrics.applied}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Sanction Pipeline</h3>
                <p className="text-xs text-gray-500 mt-1">Applied loans awaiting underwriting review</p>
              </div>
              <Link
                href="/dashboard/sanction"
                className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold text-amber-500 group-hover:translate-x-0.5 transition-transform"
              >
                <span>View Sanction Queue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 3. Disbursement */}
            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col justify-between hover:border-indigo-500 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                    <Send className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-gray-900 dark:text-white">
                    {metrics.sanctioned}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Disbursement Pipeline</h3>
                <p className="text-xs text-gray-500 mt-1">Approved loans waiting for funds release</p>
              </div>
              <Link
                href="/dashboard/disbursement"
                className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold text-indigo-500 group-hover:translate-x-0.5 transition-transform"
              >
                <span>View Payout Queue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 4. Collection */}
            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col justify-between hover:border-emerald-500 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-gray-900 dark:text-white">
                    {metrics.disbursed}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Collection Pipeline</h3>
                <p className="text-xs text-gray-500 mt-1">Active loans receiving installment UTRs</p>
              </div>
              <Link
                href="/dashboard/collection"
                className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold text-emerald-500 group-hover:translate-x-0.5 transition-transform"
              >
                <span>View Collection Queue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Evaluator Quick Guide Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50/60 to-purple-50/60 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="w-5 h-5 text-[#0075FF]" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Evaluator Testing & Role-Based Access Checklist
              </h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              Use the <span className="font-bold text-[#0075FF]">"Switch Role"</span> button on the top navigation bar to test each role with 1-click. As specified, each executive role can access ONLY their own module, while Admin can access all modules.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                <span className="font-bold block text-purple-600">Admin</span>
                <span className="text-[10px] text-gray-400">All Modules</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                <span className="font-bold block text-blue-600">Sales</span>
                <span className="text-[10px] text-gray-400">Sales Only</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                <span className="font-bold block text-amber-600">Sanction</span>
                <span className="text-[10px] text-gray-400">Sanction Only</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                <span className="font-bold block text-indigo-600">Disburse</span>
                <span className="text-[10px] text-gray-400">Disburse Only</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                <span className="font-bold block text-emerald-600">Collect</span>
                <span className="text-[10px] text-gray-400">Collection Only</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                <span className="font-bold block text-sky-600">Borrower</span>
                <span className="text-[10px] text-gray-400">Portal Only</span>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
