'use client';

import React, { useState, useEffect } from 'react';
import { useBorrowerStore, getDefaultDob } from '../../stores/useBorrowerStore';
import { apiRequest } from '../../lib/api';
import { evaluateClientBRE } from '../../lib/bre';
import { DatePicker } from '../ui/DatePicker';
import {
  User,
  CreditCard,
  Calendar,
  IndianRupee,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  XCircle,
  X,
  RotateCcw,
} from 'lucide-react';

export const Step2PersonalBRE: React.FC = () => {
  const {
    personalDetails,
    setPersonalDetails,
    setBREResult,
    nextStep,
    prevStep,
  } = useBorrowerStore();

  const [loading, setLoading] = useState(false);
  const [rejectionReasons, setRejectionReasons] = useState<string[] | null>(null);

  // Default DOB to 23 years ago if empty
  useEffect(() => {
    if (!personalDetails.dob) {
      setPersonalDetails({ dob: getDefaultDob() });
    }
  }, [personalDetails.dob, setPersonalDetails]);

  const handleServerBRESubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRejectionReasons(null);

    try {
      const res = await apiRequest('/bre/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          fullName: personalDetails.fullName,
          pan: personalDetails.pan.toUpperCase().trim(),
          dob: personalDetails.dob || getDefaultDob(),
          monthlySalary: Number(personalDetails.monthlySalary),
          employmentMode: personalDetails.employmentMode,
          phone: personalDetails.phone,
        }),
      });

      if (res.success && res.breResult?.passed) {
        setBREResult(res.breResult);
        nextStep();
      } else {
        // Fallback to client-side BRE evaluation if specific reasons were not in server response
        const clientBre = evaluateClientBRE(
          personalDetails.dob || getDefaultDob(),
          Number(personalDetails.monthlySalary),
          personalDetails.pan,
          personalDetails.employmentMode
        );

        const failureList =
          res.breResult?.failureReasons && res.breResult.failureReasons.length > 0
            ? res.breResult.failureReasons
            : clientBre.failureReasons.length > 0
            ? clientBre.failureReasons
            : [
                res.message ||
                  "Unfortunately, we couldn't offer you a loan at this time based on our underwriting criteria.",
              ];
        setRejectionReasons(failureList);
      }
    } catch (err: any) {
      setRejectionReasons([
        err.message || 'Unable to connect to credit decision engine. Please try again.',
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="pb-6 mb-6 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Personal & Employment Details
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Step 2 of 4: Enter your basic profile details for automated identity and credit verification
        </p>
      </div>

      <form onSubmit={handleServerBRESubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Full Legal Name (as per PAN)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Arjun Sharma"
                value={personalDetails.fullName}
                onChange={(e) => setPersonalDetails({ fullName: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#0075FF] focus:ring-1 focus:ring-[#0075FF] transition-all"
              />
            </div>
          </div>

          {/* PAN Card */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              PAN Card Number
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                maxLength={10}
                placeholder="ABCDE1234F"
                value={personalDetails.pan}
                onChange={(e) => setPersonalDetails({ pan: e.target.value.toUpperCase() })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent font-mono text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#0075FF] focus:ring-1 focus:ring-[#0075FF] transition-all uppercase"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <DatePicker
                value={personalDetails.dob || getDefaultDob()}
                onChange={(dob) => setPersonalDetails({ dob })}
              />
            </div>
          </div>

          {/* Monthly Net Salary */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Monthly Net Salary (₹)
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                required
                min={0}
                step={1000}
                placeholder="e.g. 50,000"
                value={personalDetails.monthlySalary || ''}
                onChange={(e) => setPersonalDetails({ monthlySalary: Number(e.target.value) })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#0075FF] focus:ring-1 focus:ring-[#0075FF] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Employment Mode */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
            Employment Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'SALARIED', label: 'Salaried', desc: 'Working at a registered company' },
              { id: 'SELF_EMPLOYED', label: 'Self-Employed', desc: 'Business or freelance profession' },
              { id: 'UNEMPLOYED', label: 'Unemployed', desc: 'Currently looking for opportunities' },
            ].map((mode) => {
              const isSelected = personalDetails.employmentMode === mode.id;

              return (
                <button
                  type="button"
                  key={mode.id}
                  onClick={() => setPersonalDetails({ employmentMode: mode.id as any })}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#0075FF] bg-blue-50/50 dark:bg-blue-950/30 text-gray-900 dark:text-white shadow-sm ring-1 ring-[#0075FF]'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-600 dark:text-gray-400 bg-transparent'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">{mode.label}</div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight block">
                    {mode.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-[#0075FF] hover:bg-[#0066DD] disabled:opacity-50 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            {loading ? (
              <span>Verifying Eligibility...</span>
            ) : (
              <>
                <span>Verify & Proceed to Upload</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Post-Verification Rejection Modal */}
      {rejectionReasons && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleIn">
            {/* Close button in top-right */}
            <button
              type="button"
              onClick={() => setRejectionReasons(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 text-center">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/20 shadow-sm">
                <XCircle className="w-9 h-9 stroke-[2]" />
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Unfortunately, We Couldn&apos;t Offer You a Loan at This Time
              </h3>

              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 mb-6 leading-relaxed">
                Thank you for applying with CreditSea. Our automated Business Rule Engine (BRE) evaluated your profile, and we are unable to approve your application at this time due to the following reason(s):
              </p>

              {/* Reasons List */}
              <div className="text-left bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-2xl p-4 sm:p-5 mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-red-700 dark:text-red-400 tracking-wider">
                    Policy Assessment Reasons:
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
                    {rejectionReasons.length} {rejectionReasons.length === 1 ? 'Rule Failed' : 'Rules Failed'}
                  </span>
                </div>

                <div className="space-y-2">
                  {rejectionReasons.map((reason, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-red-900 dark:text-red-200 font-medium bg-white/70 dark:bg-gray-900/50 p-3 rounded-xl border border-red-100 dark:border-red-900/40 shadow-xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA button */}
              <button
                type="button"
                onClick={() => setRejectionReasons(null)}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 transition-all text-sm shadow-md cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Review & Edit Details</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
