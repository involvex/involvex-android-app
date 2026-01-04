/**
 * GitHub Repository Model
 * Ported from Flutter app: lib/data/models/github_repository.dart
 * Complete model with 40+ fields and helper methods
 */

import { getLanguageColor } from '../theme/colors';
import {
  getString,
  getStringOrNull,
  getNumber,
  getBoolean,
  getDate,
  getNestedString,
  getStringArrayJoined,
} from '../utils/typeGuards';

export interface GitHubRepositoryData {
  id: string;
  name: string;
  fullName: string;
  description: string;
  htmlUrl: string;
  cloneUrl: string;
  sshUrl: string;
  stars: number;
  forks: number;
  issues: number;
  watchers: number;
  language: string;
  license: string | null;
  createdAt: Date;
  updatedAt: Date;
  pushedAt: Date;
  size: number;
  isPrivate: boolean;
  isFork: boolean;
  defaultBranch: string | null;
  openIssuesCount: number;
  hasDownloads: boolean;
  hasIssues: boolean;
  hasPages: boolean;
  hasWiki: boolean;
  ownerLogin: string;
  ownerAvatarUrl: string;
  ownerHtmlUrl: string;
  topics: string | null;
  homepage: string | null;
  trendingScore: number;
  trendingPeriod: 'daily' | 'weekly' | 'monthly';
  lastReleaseDate: Date | null;
  latestReleaseTag: string | null;
  latestReleaseName: string | null;
  isSubscribed: boolean;
  subscribedAt: Date;
}

export class GitHubRepository implements GitHubRepositoryData {
  id: string;
  name: string;
  fullName: string;
  description: string;
  htmlUrl: string;
  cloneUrl: string;
  sshUrl: string;
  stars: number;
  forks: number;
  issues: number;
  watchers: number;
  language: string;
  license: string | null;
  createdAt: Date;
  updatedAt: Date;
  pushedAt: Date;
  size: number;
  isPrivate: boolean;
  isFork: boolean;
  defaultBranch: string | null;
  openIssuesCount: number;
  hasDownloads: boolean;
  hasIssues: boolean;
  hasPages: boolean;
  hasWiki: boolean;
  ownerLogin: string;
  ownerAvatarUrl: string;
  ownerHtmlUrl: string;
  topics: string | null;
  homepage: string | null;
  trendingScore: number;
  trendingPeriod: 'daily' | 'weekly' | 'monthly';
  lastReleaseDate: Date | null;
  latestReleaseTag: string | null;
  latestReleaseName: string | null;
  isSubscribed: boolean;
  subscribedAt: Date;

  constructor(data: GitHubRepositoryData) {
    this.id = data.id;
    this.name = data.name;
    this.fullName = data.fullName;
    this.description = data.description;
    this.htmlUrl = data.htmlUrl;
    this.cloneUrl = data.cloneUrl;
    this.sshUrl = data.sshUrl;
    this.stars = data.stars;
    this.forks = data.forks;
    this.issues = data.issues;
    this.watchers = data.watchers;
    this.language = data.language;
    this.license = data.license;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.pushedAt = data.pushedAt;
    this.size = data.size;
    this.isPrivate = data.isPrivate;
    this.isFork = data.isFork;
    this.defaultBranch = data.defaultBranch;
    this.openIssuesCount = data.openIssuesCount;
    this.hasDownloads = data.hasDownloads;
    this.hasIssues = data.hasIssues;
    this.hasPages = data.hasPages;
    this.hasWiki = data.hasWiki;
    this.ownerLogin = data.ownerLogin;
    this.ownerAvatarUrl = data.ownerAvatarUrl;
    this.ownerHtmlUrl = data.ownerHtmlUrl;
    this.topics = data.topics;
    this.homepage = data.homepage;
    this.trendingScore = data.trendingScore;
    this.trendingPeriod = data.trendingPeriod;
    this.lastReleaseDate = data.lastReleaseDate;
    this.latestReleaseTag = data.latestReleaseTag;
    this.latestReleaseName = data.latestReleaseName;
    this.isSubscribed = data.isSubscribed;
    this.subscribedAt = data.subscribedAt;
  }

  /**
   * Create from GitHub API JSON response
   */
  static fromJSON(json: Record<string, unknown>): GitHubRepository {
    const trendingScore = GitHubRepository.calculateTrendingScore(json);

    return new GitHubRepository({
      id: getString(json, 'id'),
      name: getString(json, 'name'),
      fullName: getString(json, 'full_name'),
      description: getString(json, 'description'),
      htmlUrl: getString(json, 'html_url'),
      cloneUrl: getString(json, 'clone_url'),
      sshUrl: getString(json, 'ssh_url'),
      stars: getNumber(json, 'stargazers_count'),
      forks: getNumber(json, 'forks_count'),
      issues: getNumber(json, 'open_issues_count'),
      watchers: getNumber(json, 'watchers_count'),
      language: getString(json, 'language', 'Unknown'),
      license: getNestedString(json, 'license', 'name') || null,
      createdAt: getDate(json, 'created_at'),
      updatedAt: getDate(json, 'updated_at'),
      pushedAt: getDate(json, 'pushed_at'),
      size: getNumber(json, 'size'),
      isPrivate: getBoolean(json, 'private'),
      isFork: getBoolean(json, 'fork'),
      defaultBranch: getStringOrNull(json, 'default_branch'),
      openIssuesCount: getNumber(json, 'open_issues_count'),
      hasDownloads: getBoolean(json, 'has_downloads'),
      hasIssues: getBoolean(json, 'has_issues'),
      hasPages: getBoolean(json, 'has_pages'),
      hasWiki: getBoolean(json, 'has_wiki'),
      ownerLogin: getNestedString(json, 'owner', 'login'),
      ownerAvatarUrl: getNestedString(json, 'owner', 'avatar_url'),
      ownerHtmlUrl: getNestedString(json, 'owner', 'html_url'),
      topics: getStringArrayJoined(json, 'topics'),
      homepage:
        getStringOrNull(json, 'homepage') || getStringOrNull(json, 'html_url'),
      trendingScore,
      trendingPeriod: 'daily',
      lastReleaseDate: null,
      latestReleaseTag: null,
      latestReleaseName: null,
      isSubscribed: false,
      subscribedAt: new Date(),
    });
  }

  /**
   * Calculate trending score based on stars, forks, and recent activity
   */
  private static calculateTrendingScore(json: Record<string, unknown>): number {
    const stars = getNumber(json, 'stargazers_count');
    const forks = getNumber(json, 'forks_count');
    const pushedAt = getStringOrNull(json, 'pushed_at');
    const recentActivity = this.calculateRecentActivity(pushedAt || undefined);

    // Weighted scoring algorithm (60% stars, 30% forks, 10% activity)
    return stars * 0.6 + forks * 0.3 + recentActivity * 0.1;
  }

  /**
   * Calculate recent activity score based on last push
   */
  private static calculateRecentActivity(pushedAt?: string): number {
    if (!pushedAt) return 0;

    const lastPush = new Date(pushedAt);
    const now = new Date();
    const daysSincePush = Math.floor(
      (now.getTime() - lastPush.getTime()) / (1000 * 60 * 60 * 24),
    );

    // More recent activity gets higher score
    if (daysSincePush <= 1) return 10.0;
    if (daysSincePush <= 7) return 8.0;
    if (daysSincePush <= 30) return 6.0;
    if (daysSincePush <= 90) return 4.0;
    return 2.0;
  }

  /**
   * Get formatted stars count
   */
  get formattedStars(): string {
    if (this.stars < 1000) return this.stars.toString();
    if (this.stars < 1000000) return `${(this.stars / 1000).toFixed(1)}K`;
    return `${(this.stars / 1000000).toFixed(1)}M`;
  }

  /**
   * Get formatted forks count
   */
  get formattedForks(): string {
    if (this.forks < 1000) return this.forks.toString();
    if (this.forks < 1000000) return `${(this.forks / 1000).toFixed(1)}K`;
    return `${(this.forks / 1000000).toFixed(1)}M`;
  }

  /**
   * Get formatted size string
   */
  get formattedSize(): string {
    if (this.size < 1024) return `${this.size}KB`;
    if (this.size < 1024 * 1024) return `${(this.size / 1024).toFixed(1)}MB`;
    return `${(this.size / (1024 * 1024)).toFixed(1)}GB`;
  }

  /**
   * Get time ago string
   */
  get timeAgo(): string {
    const now = new Date();
    const diffMs = now.getTime() - this.updatedAt.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 365) {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    } else if (diffDays > 30) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  /**
   * Get language color
   */
  get languageColor(): string {
    return getLanguageColor(this.language);
  }

  /**
   * Check if has recent activity (last 7 days)
   */
  get hasRecentActivity(): boolean {
    const now = new Date();
    const daysSincePush = Math.floor(
      (now.getTime() - this.pushedAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysSincePush <= 7;
  }

  /**
   * Get release info summary
   */
  get releaseInfo(): string {
    if (!this.latestReleaseTag) return 'No releases';
    if (!this.latestReleaseName) return `v${this.latestReleaseTag}`;
    return `${this.latestReleaseTag} - ${this.latestReleaseName}`;
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      fullName: this.fullName,
      description: this.description,
      htmlUrl: this.htmlUrl,
      cloneUrl: this.cloneUrl,
      sshUrl: this.sshUrl,
      stars: this.stars,
      forks: this.forks,
      issues: this.issues,
      watchers: this.watchers,
      language: this.language,
      license: this.license,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      pushedAt: this.pushedAt.toISOString(),
      size: this.size,
      isPrivate: this.isPrivate,
      isFork: this.isFork,
      defaultBranch: this.defaultBranch,
      openIssuesCount: this.openIssuesCount,
      hasDownloads: this.hasDownloads,
      hasIssues: this.hasIssues,
      hasPages: this.hasPages,
      hasWiki: this.hasWiki,
      ownerHtmlUrl: this.ownerHtmlUrl,
      topics: this.topics,
      homepage: this.homepage,
      trendingScore: this.trendingScore,
      trendingPeriod: this.trendingPeriod,
      lastReleaseDate: this.lastReleaseDate?.toISOString(),
      latestReleaseTag: this.latestReleaseTag,
      latestReleaseName: this.latestReleaseName,
      isSubscribed: this.isSubscribed,
      subscribedAt: this.subscribedAt.toISOString(),
    };
  }

  /**
   * Create copy with updated fields
   */
  copyWith(updates: Partial<GitHubRepositoryData>): GitHubRepository {
    return new GitHubRepository({ ...this, ...updates });
  }
}

export default GitHubRepository;
