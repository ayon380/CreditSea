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
  Sparkles,
  Menu,
  X,
  Home,
  Shield,
  FileText,
  ArrowRight,
  LogIn,
  ChevronRight,
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

  // Close mobile menu on pathname change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
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
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* CreditSea Official Logo Brand */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#0075FF] to-blue-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center text-lg sm:text-xl font-black tracking-tight leading-none">
                <span className="text-gray-900 dark:text-white">Credit</span>
                <span className="text-[#0075FF]">Sea</span>
              </div>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
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
                  ? 'text-[#0075FF] bg-[#0075FF14] dark:bg-blue-950/40 font-semibold'
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
                    ? 'text-[#0075FF] bg-[#0075FF14] dark:bg-blue-950/40 font-semibold'
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
                    ? 'text-[#0075FF] bg-[#0075FF14] dark:bg-blue-950/40 font-semibold'
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
                    ? 'text-[#0075FF] bg-[#0075FF14] dark:bg-blue-950/40 font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Operations Dashboard
              </Link>
            )}
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Quick Evaluator Role Switcher (Compact & always accessible) */}
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-[#0075FF] border border-blue-200 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-xs shrink-0"
              title="Switch role for quick testing"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline sm:inline">Switch</span>
              <span>Role</span>
            </button>

            {/* Dark/Light Mode Toggle */}
            <ThemeToggle />

            {/* Desktop User Session / Auth Buttons */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden lg:flex flex-col items-end">
                    <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight max-w-[120px] truncate">
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
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-900 dark:text-white" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 top-16 bg-black/40 backdrop-blur-xs z-30 md:hidden animate-fadeIn"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Drawer Dropdown */}
        {isMobileMenuOpen && (
          <div className="relative z-40 md:hidden border-t border-gray-200 dark:border-gray-800 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl shadow-2xl px-4 py-5 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Authenticated User Snapshot Card */}
            {isAuthenticated && user ? (
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0075FF] to-blue-400 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {user.name}
                      </span>
                      <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold shrink-0 ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsRoleModalOpen(true);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-gray-800 text-[#0075FF] border border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Switch Role</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Unauthenticated Quick Action Buttons */
              <div className="grid grid-cols-2 gap-2.5 pb-2 border-b border-gray-200 dark:border-gray-800">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center"
                >
                  <LogIn className="w-4 h-4 text-gray-500" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/portal"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-bold text-white bg-[#0075FF] hover:bg-[#0066DD] shadow-md shadow-blue-500/20 transition-all text-center"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Navigation Links List */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-3 block mb-1">
                Navigation
              </span>

              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/'
                    ? 'text-[#0075FF] bg-blue-50 dark:bg-blue-950/40 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Home className="w-4 h-4 text-gray-500" />
                  <span>Home</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              {!isExecutive && (
                <Link
                  href="/portal"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    pathname.startsWith('/portal') && pathname !== '/portal/my-loans'
                      ? 'text-[#0075FF] bg-blue-50 dark:bg-blue-950/40 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>Borrower Portal</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              )}

              {isAuthenticated && isBorrower && (
                <Link
                  href="/portal/my-loans"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    pathname === '/portal/my-loans'
                      ? 'text-[#0075FF] bg-blue-50 dark:bg-blue-950/40 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span>My Loans</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              )}

              {isExecutive && (
                <Link
                  href={`/dashboard/${user?.role?.toLowerCase() || 'admin'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    pathname.startsWith('/dashboard')
                      ? 'text-[#0075FF] bg-blue-50 dark:bg-blue-950/40 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span>Operations Dashboard</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${getRoleBadgeColor(
                      user?.role
                    )}`}
                  >
                    {user?.role}
                  </span>
                </Link>
              )}
            </div>
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
