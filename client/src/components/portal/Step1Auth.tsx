'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useBorrowerStore } from '../../stores/useBorrowerStore';
import { apiRequest } from '../../lib/api';
import { Lock, Mail, User, Phone, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Step1Auth: React.FC = () => {
  const { user, isAuthenticated, login } = useAuthStore();
  const { phone: storePhone, setPhone: setStorePhone, nextStep, setPersonalDetails } = useBorrowerStore();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('REGISTER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(storePhone || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (storePhone && !phone) {
      setPhone(storePhone);
    }
  }, [storePhone, phone]);

  // If already authenticated as a borrower, allow quick continuation
  if (isAuthenticated && user) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 mb-6">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-bold">Signed in as {user.name}</span> ({user.email})
            <div className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
              Role: <span className="font-mono uppercase font-semibold">{user.role}</span>
            </div>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          Your account is verified. You can proceed directly to Personal Details & Eligibility Verification.
        </p>

        <button
          onClick={() => {
            setPersonalDetails({ fullName: user.name, phone: user.phone || storePhone });
            nextStep();
          }}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold bg-[#0075FF] hover:bg-[#0066DD] text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <span>Continue to Personal Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (mode === 'REGISTER') {
      if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
        setErrorMsg('Please provide a valid 10-digit Indian mobile number (e.g. 9876543210).');
        setLoading(false);
        return;
      }
    }

    const endpoint = mode === 'REGISTER' ? '/auth/register' : '/auth/login';
    const payload = mode === 'REGISTER'
      ? { name, email, password, phone: cleanPhone, role: 'BORROWER' }
      : { email, password };

    try {
      const res = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success && res.token && res.user) {
        login(res.user, res.token);
        if (cleanPhone) setStorePhone(cleanPhone);
        setPersonalDetails({ fullName: res.user.name, phone: res.user.phone || cleanPhone });
        nextStep();
      } else {
        setErrorMsg(res.message || 'Authentication failed. Please check credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {mode === 'REGISTER' ? 'Create Borrower Account' : 'Sign In to Apply'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Step 1 of 4: Secure authentication to safeguard your loan records
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setErrorMsg(null);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              mode === 'REGISTER'
                ? 'bg-white dark:bg-gray-700 text-[#0075FF] shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setErrorMsg(null);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              mode === 'LOGIN'
                ? 'bg-white dark:bg-gray-700 text-[#0075FF] shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'REGISTER' && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#0075FF] focus:ring-1 focus:ring-[#0075FF] transition-all"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="e.g. rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#0075FF] focus:ring-1 focus:ring-[#0075FF] transition-all"
            />
          </div>
        </div>

        {mode === 'REGISTER' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Mobile Number
              </label>
              {storePhone && storePhone.length === 10 && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Pre-filled from Home</span>
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs pointer-events-none">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                required
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(val);
                  setStorePhone(val);
                }}
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#0075FF] focus:ring-1 focus:ring-[#0075FF] transition-all font-medium"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#0075FF] focus:ring-1 focus:ring-[#0075FF] transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold bg-[#0075FF] hover:bg-[#0066DD] disabled:opacity-50 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          {loading ? (
            <span>Processing...</span>
          ) : (
            <>
              <span>{mode === 'REGISTER' ? 'Register & Continue' : 'Sign In & Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <ShieldCheck className="w-4 h-4 text-[#0075FF]" />
        <span>256-bit encrypted. Passwords hashed with bcrypt.</span>
      </div>
    </div>
  );
};
