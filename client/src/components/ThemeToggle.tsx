'use client';

import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../stores/useThemeStore';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, initTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initTheme();
    setMounted(true);
  }, [initTheme]);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 opacity-50" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      id="theme-toggle-btn"
      aria-label="Toggle dark/light theme"
      className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors shadow-sm"
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-gray-700 transition-transform hover:rotate-12" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
      )}
    </button>
  );
};
