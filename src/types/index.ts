// Common TypeScript types for the application

// Product related types
export interface Product {
  id: string;
  asin: string;
  title: string;
  price: number;
  currency: string;
  image_url: string;
  link: string;
  seller: string;
  region: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface MonitoredProduct {
  id: string;
  asin: string;
  title: string;
  current_price: number;
  previous_price: number;
  price_change: number;
  price_change_percent: number;
  current_seller: string;
  has_buybox: boolean;
  total_offers: number;
  region: string;
  status: boolean;
  scrape_interval: number;
  alert_threshold: number;
  next_scrape: string;
  last_scraped: string;
  created_at: string;
  updated_at: string;
}

export interface PriceHistory {
  id: string;
  asin: string;
  price: number;
  seller: string;
  has_buybox: boolean;
  scraped_at: string;
  region: string;
}

export interface SellerInfo {
  id: string;
  asin: string;
  seller_name: string;
  has_buybox: boolean;
  total_offers: number;
  scraped_at: string;
  region: string;
}

// Scraping related types
export interface ScrapingResult {
  success: boolean;
  data?: Product;
  error?: string;
  asin: string;
  region: string;
  timestamp: string;
}

export interface ScrapingHistory {
  id: string;
  asin: string;
  title: string;
  price: number;
  seller: string;
  has_buybox: boolean;
  total_offers: number;
  region: string;
  status: 'success' | 'error';
  error_message?: string;
  scraped_at: string;
}

// Analytics types
export interface AnalyticsData {
  totalScrapes: number;
  successfulScrapes: number;
  successRate: number;
  dailyStats: DailyStats[];
  dataSourceStats: DataSourceStats;
  errorAnalysis: ErrorAnalysis;
  period: string;
}

export interface DailyStats {
  date: string;
  totalScrapes: number;
  successfulScrapes: number;
  successRate: number;
}

export interface DataSourceStats {
  amazon: number;
  noon: number;
  other: number;
}

export interface ErrorAnalysis {
  totalErrors: number;
  errorTypes: Record<string, number>;
  mostCommonError: string;
}

// User related types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

// Telegram types
export interface TelegramConfig {
  id: string;
  bot_token: string;
  chat_id: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface TelegramNotification {
  id: string;
  type: 'price_change' | 'buybox_change' | 'system' | 'error';
  message: string;
  priority: 'low' | 'medium' | 'high';
  sent_at: string;
  status: 'sent' | 'failed' | 'pending';
}

// Settings types
export interface AppSettings {
  enableNotifications: boolean;
  enableErrorReporting: boolean;
  enableSounds: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'ar';
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form types
export interface FormData {
  [key: string]: unknown;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Toast types
export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  duration?: number;
}

// Context types
export interface AppState {
  user: User | null;
  settings: AppSettings;
  notifications: ToastMessage[];
  errors: string[];
  loading: boolean;
}

export interface AppAction {
  type: string;
  payload?: unknown;
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export interface FilterConfig {
  field: string;
  value: unknown;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'in';
} 