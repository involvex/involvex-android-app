/**
 * Shared TypeScript types for Involvex
 * Used by mobile app, web app, and API
 */

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  license: {
    key: string;
    name: string;
  } | null;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface NpmPackage {
  name: string;
  version: string;
  description: string;
  keywords: string[];
  author: {
    name: string;
    email?: string;
  };
  repository: {
    type: string;
    url: string;
  };
  downloads: number;
  stars: number;
}

export interface UserSettings {
  isDarkMode: boolean;
  useHackerTheme: boolean;
  trendingTimeframe: 'daily' | 'weekly' | 'monthly';
  autoRefresh: boolean;
  refreshInterval: number;
  enablePushNotifications: boolean;
  enableDailyDigest: boolean;
  enableWeeklySummary: boolean;
  enableNewReleaseNotifications: boolean;
  enableTrendingNotifications: boolean;
  enableSound: boolean;
  compactView: boolean;
  showStars: boolean;
  showForks: boolean;
  showLicense: boolean;
  showTopics: boolean;
  minStars: number;
  sortBy: 'stars' | 'forks' | 'date';
  includeArchived: boolean;
  includeForks: boolean;
  enableAnalytics: boolean;
  shareUsageData: boolean;
  enableOfflineMode: boolean;
  cacheExpiryHours: number;
  maxCacheSize: number;
  autoDeleteOldData: boolean;
  preferredExportFormat: 'json' | 'csv' | 'txt';
  includeMetadata: boolean;
  enableDebugMode: boolean;
  requestTimeout: number;
  enableBetaFeatures: boolean;
  githubToken?: string;
  npmToken?: string;
  notificationTime: string;
}

export interface Subscription {
  id: string;
  type: 'github' | 'npm';
  item_id: string;
  name: string;
  full_name?: string;
  data: string;
  subscribed_at: number;
  is_active: boolean;
  created_at: number;
  updated_at: number;
}

export interface Release {
  id: string;
  subscription_id: string;
  tag_name: string;
  name: string | null;
  body: string | null;
  published_at: number;
  is_read: boolean;
  created_at: number;
}

export interface Notification {
  id: string;
  type: 'release' | 'trending' | 'milestone';
  title: string;
  body: string;
  data?: string;
  is_read: boolean;
  scheduled_for?: number;
  delivered_at?: number;
  created_at: number;
}

export interface CacheEntry {
  key: string;
  value: string;
  expires_at: number;
  created_at: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TrendingQueryParams {
  timeframe?: 'daily' | 'weekly' | 'monthly';
  language?: string;
  min_stars?: number;
  limit?: number;
}
