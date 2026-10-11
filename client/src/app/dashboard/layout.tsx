'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/useAuthStore';
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  Send,
  Wallet,
  Shield,
  ShieldAlert,
  ArrowRight,
  LogOut,
} from 'lucide-react';

const MODULES = [
  {
    id: 'admin',
    name: 'Admin Overview',
    href: '/dashboard/admin',
    icon: Shield,
    allowedRoles: ['ADMIN'],
  },
  {
    id: 'sales',
    name: 'Sales (Leads)',
    href: '/dashboard/sales',
    icon: Users,
    allowedRoles: ['SALES', 'ADMIN'],
  },
  {
    id: 'sanction',
    name: 'Sanction (Underwriting)',
    href: '/dashboard/sanction',
    icon: FileCheck2,
    allowedRoles: ['SANCTION', 'ADMIN'],
  },
  {
    id: 'disbursement',
    name: 'Disbursement (Operations)',
    href: '/dashboard/disbursement',
    icon: Send,
    allowedRoles: ['DISBURSEMENT', 'ADMIN'],
  },
  {
    id: 'collection',
    name: 'Collection (Ledger)',
    href: '/dashboard/collection',
    icon: Wallet,
    allowedRoles: ['COLLECTION', 'ADMIN'],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push('/login?redirect=' + encodeURIComponent(pathname));
      } else if (user.role === 'BORROWER') {
        router.push('/portal');
      }
    }
  }, [isAuthenticated, user, isLoading, router, pathname]);

  const allowedModules = user
    ? MODULES.filter((m) => m.allowedRoles.includes(user.role))
    : MODULES;

  const currentModule = MODULES.find((m) => pathname.startsWith(m.href));
  const isCurrentRouteAuthorized =
    !user || !currentModule || currentModule.allowedRoles.includes(user.role);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-gray-900 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 p-3 sm:p-4 flex flex-col justify-between shrink-0">
        <div>
          <div className="px-3 py-2 sm:py-3 mb-3 md:mb-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                Active Executive Role
              </span>
              <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate block">
                {user?.name || 'Executive Portal'}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#0075FF14] text-[#0075FF] shrink-0">
              {user?.role || 'OPS'}
            </span>
          </div>

          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1 md:px-3 mb-2">
            Operations Modules
          </div>

          <nav className="flex md:flex-col gap-1.5 md:gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0 scrollbar-none">
            {allowedModules.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-2 md:gap-3 px-3 md:px-3.5 py-2 md:py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 md:shrink transition-all ${
                    isActive
                      ? 'bg-[#0075FF] text-white shadow-md shadow-blue-500/20'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden md:block pt-4 border-t border-gray-200 dark:border-gray-800 text-[11px] text-gray-400">
          <p className="leading-tight">
            Role-Based Access Guarded. Internal CreditSea Operations console.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {!isCurrentRouteAuthorized && user && (
          <div className="max-w-md mx-auto my-20 p-8 rounded-2xl bg-white dark:bg-gray-900 border border-red-500/30 text-center shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              403 Forbidden: Access Restricted
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Your role <span className="font-bold text-red-500">[{user.role}]</span> is not authorized to access this module. Each role is restricted to its own domain.
            </p>
            <Link
              href={allowedModules[0]?.href || '/'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0075FF] hover:bg-[#0066DD] text-white shadow-md transition-all"
            >
              <span>Go to Your Assigned Module ({allowedModules[0]?.name})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
        <div className={!isCurrentRouteAuthorized && user ? 'hidden' : undefined}>
          {children}
        </div>
      </main>
    </div>
  );
}
