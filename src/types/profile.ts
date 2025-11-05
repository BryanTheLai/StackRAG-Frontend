/**
 * User profile and settings type definitions
 */

export interface AppSettings {
  // Display preferences
  theme?: 'light' | 'dark' | 'auto';
  currency?: string;
  dateFormat?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  language?: string;
  
  // Notification preferences
  emailNotifications?: boolean;
  processingNotifications?: boolean;
  
  // Dashboard preferences
  defaultDashboardView?: 'monthly' | 'quarterly' | 'yearly';
  chartType?: 'bar' | 'line';
  
  // Other flexible settings
  [key: string]: any;
}

export interface Profile {
  full_name: string | null;
  company_name: string | null;
  role_in_company: string | null;
  app_settings: AppSettings;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'auto',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  language: 'en',
  emailNotifications: true,
  processingNotifications: true,
  defaultDashboardView: 'monthly',
  chartType: 'bar',
};
