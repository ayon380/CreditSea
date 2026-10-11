import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { Navbar } from '../components/Navbar';

export const metadata: Metadata = {
  title: 'CreditSea - Instant Personal Loan Online | RBI-Approved NBFC',
  description:
    'CreditSea Loan Management System (LMS) - Full-Stack Borrower Portal & Multi-Module Operations Dashboard with Role-Based Access Control.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('creditsea_theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 antialiased transition-colors">
        <Suspense fallback={<header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
