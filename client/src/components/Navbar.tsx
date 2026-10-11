'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/useAuthStore';
import { ThemeToggle } from './ThemeToggle';
import { RoleSwitcherModal } from './RoleSwitcherModal';
import {
  CreditCard,
  User,
  LogOut,
  ShieldAlert,
  Sparkles,
  Menu,
  X,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, initAuth } = useAuthStore();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'SALES':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'SANCTION':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'DISBURSEMENT':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
      case 'COLLECTION':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'BORROWER':
      default:
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30';
    }
  };

  const isExecutive = user && ['ADMIN', 'SALES', 'SANCTION', 'DISBURSEMENT', 'COLLECTION'].includes(user.role);
  const isBorrower = user?.role === 'BORROWER';

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* CreditSea Official Logo Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0075FF] to-blue-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center text-xl font-black tracking-tight">
                <span className="text-gray-900 dark:text-white">Credit</span>
                <span className="text-[#0075FF]">Sea</span>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-500 dark:text-gray-400 -mt-1">
                LMS Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'text-[#0075FF] bg-[#0075FF14] dark:bg-blue-950/40'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Home
            </Link>

            {!isExecutive && (
              <Link
                href="/portal"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/portal') && pathname !== '/portal/my-loans'
                    ? 'text-[#0075FF] bg-[#0075FF14] dark:bg-blue-950/40'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Borrower Portal
              </Link>
            )}

            {isAuthenticated && isBorrower && (
              <Link
                href="/portal/my-loans"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/portal/my-loans'
                    ? 'text-[#0075FF] bg-[#0075FF14] dark:bg-blue-950/40'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                My Loans
              </Link>
            )}

            {isExecutive && (
              <Link
                href={`/dashboard/${user?.role?.toLowerCase() || 'admin'}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/dashboard')
                    ? 'text-[#0075FF] bg-[#0075FF14] dark:bg-blue-950/40'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Operations Dashboard
              </Link>
            )}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Evaluator Role Switcher */}
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-[#0075FF] border border-blue-200 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-sm"
              title="Switch role for quick testing"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Switch</span> Role
            </button>

            {/* Dark/Light Mode Toggle */}
            <ThemeToggle />

            {/* User Session Info or Sign In */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                    {user.name}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border font-mono font-medium ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/portal"
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-[#0075FF] hover:bg-[#0066DD] text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-blue-500/30 whitespace-nowrap"
                >
                  Apply Now
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 space-y-2">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Home
            </Link>
            {!isExecutive && (
              <Link
                href="/portal"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Borrower Portal
              </Link>
            )}
            {isAuthenticated && isBorrower && (
              <Link
                href="/portal/my-loans"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                My Loans
              </Link>
            )}
            {isExecutive && (
              <Link
                href={`/dashboard/${user?.role?.toLowerCase() || 'admin'}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Operations Dashboard ({user?.role})
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />
    </>
  );
};
