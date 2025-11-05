/**
 * Formatting utilities for consistent display across the app
 */

import type { AppSettings } from '@/types/profile';

/**
 * Format a date according to user preference
 */
export function formatDate(
  date: Date | string,
  format: AppSettings['dateFormat'] = 'MM/DD/YYYY'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  
  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'MM/DD/YYYY':
    default:
      return `${month}/${day}/${year}`;
  }
}

/**
 * Format a date with time according to user preference
 */
export function formatDateTime(
  date: Date | string,
  format: AppSettings['dateFormat'] = 'MM/DD/YYYY'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  const dateStr = formatDate(d, format);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${dateStr} ${hours}:${minutes}`;
}

/**
 * Format currency according to user preference
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'USD',
  signDisplay: 'auto' | 'always' | 'never' | 'exceptZero' = 'auto'
): string {
  if (amount === null || amount === undefined) return 'N/A';
  
  try {
    return amount.toLocaleString(undefined, {
      style: 'currency',
      currency,
      signDisplay,
    });
  } catch (e) {
    // Fallback if currency code is invalid
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Format number with locale-specific separators
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return 'N/A';
  return num.toLocaleString(undefined);
}
