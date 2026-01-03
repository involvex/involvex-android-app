/**
 * Models Index
 * Export all data models
 */

export { GitHubRepository } from './GitHubRepository';
export { NpmPackage } from './NpmPackage';
export { UserSettings } from './UserSettings';

// Simple types for database models
export interface Subscription {
  id: string;
  type: 'repository' | 'package';
  itemId: string;
  name: string;
  fullName?: string;
  data: string; // JSON blob
  subscribedAt: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Release {
  id: string;
  subscriptionId: string;
  tagName: string;
  name: string | null;
  body: string | null;
  publishedAt: number;
  isRead: boolean;
  createdAt: number;
}

export interface Notification {
  id: string;
  type: 'new_release' | 'trending' | 'daily_digest' | 'weekly_summary';
  title: string;
  body: string;
  data: string | null; // JSON blob
  isRead: boolean;
  scheduledFor: number | null;
  deliveredAt: number | null;
  createdAt: number;
}

export interface CacheEntry {
  key: string;
  value: string; // JSON blob
  expiresAt: number;
  createdAt: number;
}
