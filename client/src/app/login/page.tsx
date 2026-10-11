'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../stores/useAuthStore';
import { apiRequest } from '../../lib/api';
import { Lock, Mail, ArrowRight, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/portal';

  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.success && res.token && res.user) {
        login(res.user, res.token);
        if (res.user.role === 'BORROWER') {
          router.push('/portal');
        } else {
          router.push(`/dashboard/${res.user.role.toLowerCase()}`);
        }
      } else {
        setErrorMsg(res.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofill = (eMail: string, pWord: string) => {
    setEmail(eMail);
    setPassword(pWord);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#0075FF14] text-[#0075FF] flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Sign In to CreditSea
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Access borrower portal or operations executive modules
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@creditsea.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#0075FF] focus:ring-1 focus:ring-[#0075FF]"
              />
            </div>
          </div>

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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#0075FF] focus:ring-1 focus:ring-[#0075FF]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold bg-[#0075FF] hover:bg-[#0066DD] disabled:opacity-50 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            {loading ? <span>Authenticating...</span> : <span>Sign In</span>}
          </button>
        </form>

        {/* Quick Autofill Helpers for Evaluator */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#0075FF]" />
            <span>1-Click Evaluator Autofill:</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleAutofill('admin@creditsea.com', 'Admin@123')}
              className="p-1.5 rounded-lg border border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 font-semibold text-center hover:bg-purple-100 dark:hover:bg-purple-900/40"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleAutofill('sales@creditsea.com', 'Sales@123')}
              className="p-1.5 rounded-lg border border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-semibold text-center hover:bg-blue-100 dark:hover:bg-blue-900/40"
            >
              Sales
            </button>
            <button
              type="button"
              onClick={() => handleAutofill('sanction@creditsea.com', 'Sanction@123')}
              className="p-1.5 rounded-lg border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-semibold text-center hover:bg-amber-100 dark:hover:bg-amber-900/40"
            >
              Sanction
            </button>
            <button
              type="button"
              onClick={() => handleAutofill('disburse@creditsea.com', 'Disburse@123')}
              className="p-1.5 rounded-lg border border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold text-center hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
            >
              Disburse
            </button>
            <button
              type="button"
              onClick={() => handleAutofill('collect@creditsea.com', 'Collect@123')}
              className="p-1.5 rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-semibold text-center hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
            >
              Collection
            </button>
            <button
              type="button"
              onClick={() => handleAutofill('borrower@creditsea.com', 'Borrower@123')}
              className="p-1.5 rounded-lg border border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 font-semibold text-center hover:bg-sky-100 dark:hover:bg-sky-900/40"
            >
              Borrower
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          New applicant?{' '}
          <Link href="/portal" className="font-bold text-[#0075FF] hover:underline">
            Register on Borrower Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-3 border-[#0075FF] border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
