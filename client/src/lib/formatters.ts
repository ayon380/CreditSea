export const formatCurrency = (amount: number = 0): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrencyWithDecimals = (amount: number = 0): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString?: string | Date): string => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Cleanly formats tenure in days to human-friendly calendar months/years.
 * Fixes naive (days / 30) bug that showed 365 days as "12.2 Months".
 */
export const formatTenureMonths = (days: number): string => {
  if (days >= 365) return '12 Months (1 Year)';
  if (days === 30) return '1 Month';
  if (days % 30 === 0) return `${days / 30} Months`;

  // Standard financial year has 365 / 12 = 30.416 days per month
  const approxMonths = Math.round(days / (365 / 12));
  if (approxMonths >= 12) return '12 Months (1 Year)';
  return `~${approxMonths} Months`;
};
