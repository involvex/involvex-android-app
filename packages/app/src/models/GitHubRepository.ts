/**
 * GitHub Repository Model
 * Ported from Flutter app: lib/data/models/github_repository.dart
 * Complete model with 40+ fields and helper methods
 */

import { getLanguageColor } from '../theme/colors';

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
  static fromJSON(json: any): GitHubRepository {
    const trendingScore = GitHubRepository.calculateTrendingScore(json);

    return new GitHubRepository({
      id: json.id?.toString() || '',
      name: json.name || '',
      fullName: json.full_name || '',
      description: json.description || '',
      htmlUrl: json.html_url || '',
      cloneUrl: json.clone_url || '',
      sshUrl: json.ssh_url || '',
      stars: json.stargazers_count || 0,
      forks: json.forks_count || 0,
      issues: json.open_issues_count || 0,
      watchers: json.watchers_count || 0,
      language: json.language || 'Unknown',
      license: json.license?.name || null,
      createdAt: new Date(json.created_at || Date.now()),
      updatedAt: new Date(json.updated_at || Date.now()),
      pushedAt: new Date(json.pushed_at || Date.now()),
      size: json.size || 0,
      isPrivate: json.private || false,
      isFork: json.fork || false,
      defaultBranch: json.default_branch || null,
      openIssuesCount: json.open_issues_count || 0,
      hasDownloads: json.has_downloads || false,
      hasIssues: json.has_issues || false,
      hasPages: json.has_pages || false,
      hasWiki: json.has_wiki || false,
      ownerLogin: json.owner?.login || '',
      ownerAvatarUrl: json.owner?.avatar_url || '',
      ownerHtmlUrl: json.owner?.html_url || '',
      topics: json.topics?.join(',') || null,
      homepage: json.homepage || json.html_url || null,
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
  private static calculateTrendingScore(json: any): number {
    const stars = json.stargazers_count || 0;
    const forks = json.forks_count || 0;
    const recentActivity = this.calculateRecentActivity(json.pushed_at);

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
  toJSON(): Record<string, any> {
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
