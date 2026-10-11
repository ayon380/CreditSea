'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/useAuthStore';
import { apiRequest } from '../lib/api';
import { Shield, UserCheck, Briefcase, FileCheck2, Send, Wallet, X, KeyRound, Sparkles } from 'lucide-react';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLES = [
  {
    role: 'ADMIN',
    title: 'Admin',
    email: 'admin@creditsea.com',
    password: 'Admin@123',
    icon: Shield,
    color: 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400',
    description: 'Full omni-access to all 4 modules, metrics & user management',
    targetUrl: '/dashboard/admin',
  },
  {
    role: 'SALES',
    title: 'Sales Executive',
    email: 'sales@creditsea.com',
    password: 'Sales@123',
    icon: Briefcase,
    color: 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400',
    description: 'Lead tracking for users who signed up but have not completed loan application',
    targetUrl: '/dashboard/sales',
  },
  {
    role: 'SANCTION',
    title: 'Sanction Officer',
    email: 'sanction@creditsea.com',
    password: 'Sanction@123',
    icon: FileCheck2,
    color: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    description: 'Underwrite applied loans, verify salary slips & approve/reject with reason',
    targetUrl: '/dashboard/sanction',
  },
  {
    role: 'DISBURSEMENT',
    title: 'Disbursement Manager',
    email: 'disburse@creditsea.com',
    password: 'Disburse@123',
    icon: Send,
    color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    description: 'Release funds for sanctioned loans and record bank transaction reference numbers',
    targetUrl: '/dashboard/disbursement',
  },
  {
    role: 'COLLECTION',
    title: 'Collection Executive',
    email: 'collect@creditsea.com',
    password: 'Collect@123',
    icon: Wallet,
    color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    description: 'Record borrower repayments with unique UTR number; triggers auto-closure',
    targetUrl: '/dashboard/collection',
  },
  {
    role: 'BORROWER',
    title: 'Borrower',
    email: 'borrower@creditsea.com',
    password: 'Borrower@123',
    icon: UserCheck,
    color: 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400',
    description: 'Borrower portal for applying, checking eligibility and repayment timeline',
    targetUrl: '/portal',
  },
];

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { login } = useAuthStore();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickSwitch = async (roleObj: typeof ROLES[0]) => {
    setLoadingRole(roleObj.role);
    setErrorMsg(null);

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: roleObj.email,
          password: roleObj.password,
        }),
      });

      if (res.success && res.token && res.user) {
        login(res.user, res.token);
        onClose();
        router.push(roleObj.targetUrl);
      } else {
        setErrorMsg(res.message || 'Failed to authenticate role');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error switching role');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#0075FF14] text-[#0075FF]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quick Role Switcher</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Instant evaluator tool: 1-click test any pre-seeded persona
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Roles List */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
          {ROLES.map((r) => {
            const Icon = r.icon;
            const isLoading = loadingRole === r.role;

            return (
              <button
                key={r.role}
                onClick={() => handleQuickSwitch(r)}
                disabled={Boolean(loadingRole)}
                className="flex flex-col text-left p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[#0075FF] dark:hover:border-[#0075FF] bg-gray-50/40 dark:bg-gray-800/20 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg border ${r.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-[#0075FF] transition-colors">
                        {r.title}
                      </h4>
                      <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                        {r.email}
                      </span>
                    </div>
                  </div>
                  <KeyRound className="w-4 h-4 text-gray-400 group-hover:text-[#0075FF] transition-colors" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {r.description}
                </p>
                {isLoading && (
                  <div className="mt-2 text-xs text-[#0075FF] font-medium animate-pulse">
                    Authenticating & redirecting...
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
          <span>All accounts pre-seeded with known credentials</span>
          <span className="font-mono text-gray-600 dark:text-gray-400">Password: &lt;Role&gt;@123</span>
        </div>
      </div>
    </div>
  );
};
