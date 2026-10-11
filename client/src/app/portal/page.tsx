'use client';

import React from 'react';
import { useBorrowerStore } from '../../stores/useBorrowerStore';
import { Step1Auth } from '../../components/portal/Step1Auth';
import { Step2PersonalBRE } from '../../components/portal/Step2PersonalBRE';
import { Step3UploadSlip } from '../../components/portal/Step3UploadSlip';
import { Step4LoanConfig } from '../../components/portal/Step4LoanConfig';
import { Check, ShieldCheck } from 'lucide-react';

const STEPS = [
  { step: 1, title: 'Authentication', desc: 'Sign up / Login' },
  { step: 2, title: 'Eligibility', desc: 'BRE checks' },
  { step: 3, title: 'Document', desc: 'Salary slip' },
  { step: 4, title: 'Configure', desc: 'Amount & Apply' },
];

export default function BorrowerPortalPage() {
  const { currentStep } = useBorrowerStore();

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Title & Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0075FF14] text-[#0075FF] text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Borrower Application Journey</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Apply for Instant Personal Loan
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-lg mx-auto">
          Complete our simple 4-step digital onboarding to get loan approval with instant BRE eligibility scoring.
        </p>
      </div>

      {/* Stepper Progress Indicator */}
      <div className="mb-10">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
          {STEPS.map((s) => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;

            return (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-[#0075FF] text-white ring-4 ring-blue-500/20 shadow-md shadow-blue-500/30'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : s.step}
                </div>
                <div className="mt-2 hidden sm:block">
                  <div
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-[#0075FF]'
                        : isCompleted
                        ? 'text-gray-800 dark:text-gray-200'
                        : 'text-gray-400'
                    }`}
                  >
                    {s.title}
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium">
                    {s.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Wizard Container */}
      <div className="transition-all duration-300">
        {currentStep === 1 && <Step1Auth />}
        {currentStep === 2 && <Step2PersonalBRE />}
        {currentStep === 3 && <Step3UploadSlip />}
        {currentStep === 4 && <Step4LoanConfig />}
      </div>
    </div>
  );
}
