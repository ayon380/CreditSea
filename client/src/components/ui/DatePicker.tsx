'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  className?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value or fallback to 23 years ago
  const parseDate = (valStr: string) => {
    if (!valStr) {
      const today = new Date();
      return new Date(today.getFullYear() - 23, today.getMonth(), today.getDate());
    }
    const [y, m, d] = valStr.split('-').map(Number);
    if (!y || !m || !d) {
      const today = new Date();
      return new Date(today.getFullYear() - 23, today.getMonth(), today.getDate());
    }
    return new Date(y, m - 1, d);
  };

  const currentDate = parseDate(value);
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());
  const [viewMode, setViewMode] = useState<'DAYS' | 'MONTHS' | 'YEARS'>('DAYS');

  // Synchronize view state when value changes externally
  useEffect(() => {
    const parsed = parseDate(value);
    setViewYear(parsed.getFullYear());
    setViewMonth(parsed.getMonth());
  }, [value]);

  // Click outside to close popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setViewMode('DAYS');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDateOutput = (y: number, m: number, d: number): string => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const handleSelectDay = (day: number) => {
    const newDateStr = formatDateOutput(viewYear, viewMonth, day);
    onChange(newDateStr);
    setIsOpen(false);
    setViewMode('DAYS');
  };

  const handleSelectMonth = (monthIndex: number) => {
    setViewMonth(monthIndex);
    setViewMode('DAYS');
  };

  const handleSelectYear = (year: number) => {
    setViewYear(year);
    setViewMode('MONTHS');
  };

  // Days in month logic
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // Calculate age from current value
  const calculateAge = () => {
    if (!value) return null;
    const birthDate = parseDate(value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const currentAge = calculateAge();

  // Generate Year Range (from 1960 to current year)
  const todayYear = new Date().getFullYear();
  const yearsList: number[] = [];
  for (let y = todayYear - 15; y >= todayYear - 65; y--) {
    yearsList.push(y);
  }

  const formattedDisplay = value
    ? parseDate(value).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Select Date of Birth';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white text-sm hover:border-[#0075FF] dark:hover:border-[#0075FF] focus:outline-none focus:border-[#0075FF] focus:ring-1 focus:ring-[#0075FF] transition-all text-left shadow-sm"
      >
        <span className="font-medium">{formattedDisplay}</span>

        <div className="flex items-center gap-2">
          {currentAge !== null && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              {currentAge} yrs
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 w-full sm:w-[350px] p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl backdrop-blur-md animate-fadeIn">
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'MONTHS' ? 'DAYS' : 'MONTHS')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {MONTHS[viewMonth]}
              </button>
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'YEARS' ? 'DAYS' : 'YEARS')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#0075FF] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
              >
                {viewYear}
              </button>
            </div>

            {viewMode === 'DAYS' && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (viewMonth === 0) {
                      setViewMonth(11);
                      setViewYear(viewYear - 1);
                    } else {
                      setViewMonth(viewMonth - 1);
                    }
                  }}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (viewMonth === 11) {
                      setViewMonth(0);
                      setViewYear(viewYear + 1);
                    } else {
                      setViewMonth(viewMonth + 1);
                    }
                  }}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* VIEW: Days Grid */}
          {viewMode === 'DAYS' && (
            <div>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {DAYS_SHORT.map((d) => (
                  <span key={d} className="text-[11px] font-bold text-gray-400">
                    {d}
                  </span>
                ))}
              </div>

              {/* Day Buttons */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected =
                    currentDate.getFullYear() === viewYear &&
                    currentDate.getMonth() === viewMonth &&
                    currentDate.getDate() === day;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={`h-8 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#0075FF] text-white shadow-md shadow-blue-500/20 font-bold'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: Months Selector */}
          {viewMode === 'MONTHS' && (
            <div className="grid grid-cols-3 gap-2 py-2">
              {MONTHS.map((m, idx) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSelectMonth(idx)}
                  className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                    viewMonth === idx
                      ? 'bg-[#0075FF] text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
          )}

          {/* VIEW: Years Selector */}
          {viewMode === 'YEARS' && (
            <div className="max-h-56 overflow-y-auto grid grid-cols-3 gap-2 py-2 pr-1">
              {yearsList.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => handleSelectYear(y)}
                  className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                    viewYear === y
                      ? 'bg-[#0075FF] text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
