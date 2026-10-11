'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Zap,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Calculator,
  Percent,
  Sparkles,
  Phone,
  FileCheck2,
  Users,
  Send,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import { calculateSimpleInterest } from '../lib/math';
import { formatCurrency, formatCurrencyWithDecimals, formatTenureMonths } from '../lib/formatters';
import { useBorrowerStore } from '../stores/useBorrowerStore';

export default function HomePage() {
  const router = useRouter();
  const { setPhone, setLoanConfig } = useBorrowerStore();
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [sliderAmount, setSliderAmount] = useState(150000);
  const [sliderTenure, setSliderTenure] = useState(90);

  const calc = calculateSimpleInterest(sliderAmount, sliderTenure, 12.0);

  const handleApplyNow = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = mobileNumber.replace(/\D/g, '');
    if (!cleanDigits) {
      setMobileError('Please enter your 10-digit mobile number to proceed.');
      return;
    }
    if (cleanDigits.length !== 10 || !/^[6-9]\d{9}$/.test(cleanDigits)) {
      setMobileError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    setMobileError(null);
    setPhone(cleanDigits);
    setLoanConfig({ principalAmount: sliderAmount, tenureDays: sliderTenure });
    router.push('/portal');
  };

  const handleProceedFromCalculator = () => {
    const cleanDigits = mobileNumber.replace(/\D/g, '');
    if (cleanDigits.length === 10 && /^[6-9]\d{9}$/.test(cleanDigits)) {
      setPhone(cleanDigits);
    }
    setLoanConfig({ principalAmount: sliderAmount, tenureDays: sliderTenure });
    router.push('/portal');
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section (Exact styling from CreditSea.com) */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0075FF14] text-[#0075FF] text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Borrowing made easy with CreditSea</span>
        </div>

        <p className="text-base sm:text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
          Facing unexpected expenses or last-minute financial needs?
        </p>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Get Personal Loans up to <span className="text-[#0075FF]">₹5 Lakhs</span>
        </h1>

        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
          RBI-compliant lending platform with automated BRE eligibility, transparent 12% p.a. simple interest, and fast disbursals.
        </p>

        {/* Hero Apply Form Box */}
        <div className="max-w-xl mx-auto mt-8">
          <form
            onSubmit={handleApplyNow}
            className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3"
          >
            <div className="relative w-full sm:flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm pointer-events-none">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="Enter 10-digit mobile number"
                value={mobileNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setMobileNumber(val);
                  if (mobileError) setMobileError(null);
                }}
                className={`w-full h-13 pl-14 pr-4 rounded-xl border ${
                  mobileError
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 dark:border-gray-700 focus:border-[#0075FF] focus:ring-[#0075FF]/20'
                } bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-base focus:outline-none focus:ring-2 shadow-sm font-medium tracking-wide`}
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto h-13 px-8 rounded-xl font-bold bg-[#0075FF] hover:bg-[#0066DD] text-white shadow-lg shadow-blue-500/25 transition-all text-base flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <span>Apply for Loan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {mobileError && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2 text-left animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{mobileError}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center items-center gap-6 mt-8 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            100% Digital Journey
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Instant BRE Decisioning
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            RBI NBFC Backed
          </span>
        </div>
      </section>

      {/* 2. Interactive Live Loan Calculator */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-gray-200 dark:border-gray-800 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0075FF] mb-1">
                <Calculator className="w-4 h-4" />
                <span>Interactive Loan Calculator</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                Calculate Your EMI & Total Repayment
              </h2>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs font-bold text-[#0075FF]">
              Fixed 12% p.a. Simple Interest
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Sliders */}
            <div className="lg:col-span-7 space-y-6">
              {/* Amount slider */}
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Loan Amount Required
                  </span>
                  <span className="text-2xl font-black text-[#0075FF]">
                    {formatCurrency(sliderAmount)}
                  </span>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={500000}
                  step={5000}
                  value={sliderAmount}
                  onChange={(e) => setSliderAmount(Number(e.target.value))}
                  className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0075FF]"
                />
                <div className="flex justify-between text-[11px] text-gray-400 font-semibold mt-2">
                  <span>₹50,000</span>
                  <span>₹5,00,000</span>
                </div>
              </div>

              {/* Tenure slider */}
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Repayment Tenure
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#0075FF]">
                      {sliderTenure} Days
                    </span>
                    <span className="text-xs text-gray-400 block font-normal">
                      {formatTenureMonths(sliderTenure)}
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={30}
                  max={365}
                  step={5}
                  value={sliderTenure}
                  onChange={(e) => setSliderTenure(Number(e.target.value))}
                  className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0075FF]"
                />
                <div className="flex justify-between text-[11px] text-gray-400 font-semibold mt-2">
                  <span>30 Days (1 Month)</span>
                  <span>365 Days (1 Year)</span>
                </div>
              </div>
            </div>

            {/* Calculations Card */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent border-2 border-blue-500/20 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                  Repayment Summary
                </span>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Principal</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(calc.principalAmount)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tenure</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {calc.tenureDays} Days ({formatTenureMonths(calc.tenureDays)})
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Interest (12% p.a.)</span>
                  <span className="font-bold text-[#0075FF]">
                    + {formatCurrencyWithDecimals(calc.interestAmount)}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-bold uppercase text-gray-500 block">Total Due</span>
                    <span className="text-[10px] text-gray-400 font-mono">Principal + SI</span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                    {formatCurrencyWithDecimals(calc.totalRepaymentAmount)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedFromCalculator}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold bg-[#0075FF] hover:bg-[#0066DD] text-white shadow-md shadow-blue-500/20 transition-all text-sm cursor-pointer"
              >
                <span>Proceed to Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "Why Choose CreditSea?" (From CreditSea.com) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Why Choose CreditSea?
          </h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-2">
            Because getting a personal loan shouldn’t feel complicated.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-start space-y-4">
            <div className="p-3.5 rounded-xl bg-[#0075FF14] text-[#0075FF]">
              <CheckCircle2 className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Quick Approval</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                No long waits, just instant decisions backed by our automated Business Rule Engine.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-start space-y-4">
            <div className="p-3.5 rounded-xl bg-[#0075FF14] text-[#0075FF]">
              <Zap className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Instant Disbursal</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Get funds released directly to your account minutes after underwriting sanction.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-start space-y-4">
            <div className="p-3.5 rounded-xl bg-[#0075FF14] text-[#0075FF]">
              <RotateCcw className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Flexible Repayment</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Choose flexible tenures between 30 to 365 days with zero hidden compound penalties.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-start space-y-4">
            <div className="p-3.5 rounded-xl bg-[#0075FF14] text-[#0075FF]">
              <ShieldCheck className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Trusted & Secure</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Backed by RBI-Licensed NBFC partners with bank-grade encryption protocols.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Operations Dashboard Showcase for Evaluators */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-gray-900 to-blue-950 text-white shadow-xl">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0075FF] block mb-2">
              Internal Operations Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
              Role-Guarded Operations Console
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mb-6 leading-relaxed">
              Explore the 4 specialized executive workflows (Sales lead tracker, Sanction underwriter, Disbursement finance ops, and Collection UTR ledger). Test any persona with our 1-click switcher.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/admin"
                className="px-5 py-2.5 rounded-xl font-bold bg-[#0075FF] hover:bg-[#0066DD] text-white text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Launch Operations Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/portal"
                className="px-5 py-2.5 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
              >
                Test Borrower Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (CreditSea Style) */}
      <footer className="border-t border-gray-200 dark:border-gray-800 pt-10 text-center text-xs text-gray-500 dark:text-gray-400">
        <div className="max-w-6xl mx-auto px-4">
          <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">
            CreditSea Financial Technologies Private Limited
          </p>
          <p className="max-w-2xl mx-auto text-[11px] leading-relaxed">
            CreditSea is a financial technology platform operating in partnership with RBI-registered NBFCs. All loan approvals and interest calculations are subject to credit verification and BRE policies.
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400">
            © 2026 CreditSea LMS. Full-Stack Production Assignment. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
