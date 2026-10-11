'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBorrowerStore } from '../../stores/useBorrowerStore';
import { calculateSimpleInterest } from '../../lib/math';
import { formatCurrency, formatCurrencyWithDecimals, formatTenureMonths } from '../../lib/formatters';
import { apiRequest } from '../../lib/api';
import confetti from 'canvas-confetti';
import {
  IndianRupee,
  Clock,
  Percent,
  Calculator,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const Step4LoanConfig: React.FC = () => {
  const router = useRouter();
  const {
    personalDetails,
    salarySlip,
    loanConfig,
    setLoanConfig,
    prevStep,
    resetForm,
  } = useBorrowerStore();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live Simple Interest math calculations
  const calc = calculateSimpleInterest(loanConfig.principalAmount, loanConfig.tenureDays, 12.0);

  const handleApply = async () => {
    if (!salarySlip) {
      setErrorMsg('Salary slip document is required. Please go back to Step 3.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await apiRequest('/loans/apply', {
        method: 'POST',
        body: JSON.stringify({
          applicantSnapshot: {
            fullName: personalDetails.fullName,
            pan: personalDetails.pan,
            dob: personalDetails.dob,
            monthlySalary: personalDetails.monthlySalary,
            employmentMode: personalDetails.employmentMode,
            phone: personalDetails.phone,
          },
          salarySlip: {
            publicId: salarySlip.publicId,
            secureUrl: salarySlip.secureUrl,
            fileName: salarySlip.fileName,
            fileSize: salarySlip.fileSize,
            mimeType: salarySlip.mimeType,
          },
          principalAmount: loanConfig.principalAmount,
          tenureDays: loanConfig.tenureDays,
        }),
      });

      if (res.success && res.loan) {
        // Confetti celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0075FF', '#10B981', '#6366F1', '#F59E0B'],
        });

        resetForm();
        router.push(`/portal/my-loans?success=${res.loan.loanId}`);
      } else {
        setErrorMsg(res.message || 'Loan submission failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while applying for loan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="pb-6 mb-6 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Loan Configuration & Live Repayment Calculator
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Step 4 of 4: Adjust loan amount and tenure sliders. Interest rate is locked at 12% p.a.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Sliders */}
        <div className="lg:col-span-7 space-y-6">
          {/* Slider 1: Loan Amount */}
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Loan Amount
              </span>
              <span className="text-xl font-black text-[#0075FF]">
                {formatCurrency(loanConfig.principalAmount)}
              </span>
            </div>

            <input
              type="range"
              min={50000}
              max={500000}
              step={5000}
              value={loanConfig.principalAmount}
              onChange={(e) => setLoanConfig({ principalAmount: Number(e.target.value) })}
              className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0075FF]"
            />

            <div className="flex justify-between text-[11px] text-gray-400 font-semibold mt-2">
              <span>Min: ₹50,000</span>
              <span>Max: ₹5,00,000</span>
            </div>
          </div>

          {/* Slider 2: Tenure in Days */}
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Tenure Period
              </span>
              <div className="text-right">
                <span className="text-xl font-black text-[#0075FF]">
                  {loanConfig.tenureDays} Days
                </span>
                <span className="text-xs text-gray-400 block font-normal">
                  {formatTenureMonths(loanConfig.tenureDays)}
                </span>
              </div>
            </div>

            <input
              type="range"
              min={30}
              max={365}
              step={5}
              value={loanConfig.tenureDays}
              onChange={(e) => setLoanConfig({ tenureDays: Number(e.target.value) })}
              className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0075FF]"
            />

            <div className="flex justify-between text-[11px] text-gray-400 font-semibold mt-2">
              <span>Min: 30 Days</span>
              <span>Max: 365 Days</span>
            </div>
          </div>

          {/* Fixed Interest Rate Pill */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-blue-500/20 bg-blue-50/30 dark:bg-blue-950/20">
            <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300">
              <Percent className="w-4 h-4 text-[#0075FF]" />
              <span className="font-semibold">Annual Interest Rate</span>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              12.0% p.a. (Fixed)
            </span>
          </div>
        </div>

        {/* Right: Live Calculation Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl border-2 border-blue-500/30 bg-gradient-to-b from-blue-50/40 to-transparent dark:from-blue-950/20 dark:to-transparent">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-[#0075FF]" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                Live Repayment Breakdown
              </h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Principal Amount</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(calc.principalAmount)}
                </span>
              </div>

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tenure Duration</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {calc.tenureDays} Days ({formatTenureMonths(calc.tenureDays)})
                </span>
              </div>

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Simple Interest (12% p.a.)</span>
                <span className="font-semibold text-[#0075FF]">
                  + {formatCurrencyWithDecimals(calc.interestAmount)}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-between items-baseline">
                <div>
                  <span className="block text-xs uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                    Total Repayment
                  </span>
                  <span className="text-[11px] text-gray-400">Principal + Simple Interest</span>
                </div>
                <span className="text-2xl font-black text-gray-900 dark:text-white">
                  {formatCurrencyWithDecimals(calc.totalRepaymentAmount)}
                </span>
              </div>
            </div>

            {/* Formula footnote */}
            <div className="mt-5 p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-[11px] text-gray-500 font-mono">
              SI = (P × 12 × {calc.tenureDays}) / (365 × 100)
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleApply}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold bg-[#0075FF] hover:bg-[#0066DD] disabled:opacity-50 text-white shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              {loading ? (
                <span>Submitting Loan Application...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Apply for Loan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200 dark:border-gray-800">
        <button
          type="button"
          onClick={prevStep}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Upload</span>
        </button>
      </div>
    </div>
  );
};
