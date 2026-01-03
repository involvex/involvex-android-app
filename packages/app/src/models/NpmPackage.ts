/**
 * npm Package Model
 * Ported from Flutter app: lib/data/models/npm_package.dart
 * Complete model with 30+ fields and helper methods
 */

export interface NpmPackageData {
  name: string;
  version: string;
  description: string;
  npmUrl: string;
  homepage: string;
  repositoryUrl: string;
  readme: string | null;
  modified: Date;
  keywords: string[];
  downloads: number;
  stars: number;
  publisher: string;
  publisherAvatarUrl: string | null;
  maintainers: string;
  versions: string[];
  latestVersion: string | null;
  license: string | null;
  dependencies: string[];
  devDependencies: string[];
  openIssues: number;
  openPullRequests: number;
  hasSecurityVulnerabilities: boolean;
  securityPolicyUrl: string | null;
  trendingScore: number;
  trendingPeriod: 'daily' | 'weekly' | 'monthly';
  lastReleaseDate: Date | null;
  latestReleaseTag: string | null;
  latestReleaseName: string | null;
  isSubscribed: boolean;
  subscribedAt: Date;
  metrics: Record<string, any> | null;
}

export class NpmPackage implements NpmPackageData {
  name: string;
  version: string;
  description: string;
  npmUrl: string;
  homepage: string;
  repositoryUrl: string;
  readme: string | null;
  modified: Date;
  keywords: string[];
  downloads: number;
  stars: number;
  publisher: string;
  publisherAvatarUrl: string | null;
  maintainers: string;
  versions: string[];
  latestVersion: string | null;
  license: string | null;
  dependencies: string[];
  devDependencies: string[];
  openIssues: number;
  openPullRequests: number;
  hasSecurityVulnerabilities: boolean;
  securityPolicyUrl: string | null;
  trendingScore: number;
  trendingPeriod: 'daily' | 'weekly' | 'monthly';
  lastReleaseDate: Date | null;
  latestReleaseTag: string | null;
  latestReleaseName: string | null;
  isSubscribed: boolean;
  subscribedAt: Date;
  metrics: Record<string, any> | null;

  constructor(data: NpmPackageData) {
    Object.assign(this, data);
  }

  /**
   * Create from npm API JSON response
   */
  static fromJSON(json: any): NpmPackage {
    const trendingScore = NpmPackage.calculateTrendingScore(json);

    return new NpmPackage({
      name: json.name || '',
      version: json.version || '',
      description: json.description || '',
      npmUrl: `https://www.npmjs.com/package/${json.name || ''}`,
      homepage: json.homepage || '',
      repositoryUrl: json.repository?.url || '',
      readme: json.readme || null,
      modified: json.modified ? new Date(json.modified) : new Date(),
      keywords: Array.isArray(json.keywords) ? json.keywords : [],
      downloads: json.dist?.unpackedSize || 0,
      stars: json.githubStars || 0,
      publisher: json.publisher?.username || '',
      publisherAvatarUrl: json.publisher?.email || null,
      maintainers: NpmPackage.formatMaintainers(json.maintainers || []),
      versions:
        json.versions && typeof json.versions === 'object'
          ? Object.keys(json.versions)
          : [],
      latestVersion: json['dist-tags']?.latest || json.version || null,
      license: json.license || null,
      dependencies: NpmPackage.extractDependencies(
        json.versions?.latest?.dependencies,
      ),
      devDependencies: NpmPackage.extractDependencies(
        json.versions?.latest?.devDependencies,
      ),
      openIssues: 0, // Placeholder - would need GitHub API
      openPullRequests: 0, // Placeholder - would need GitHub API
      hasSecurityVulnerabilities: json.hasSecurityVulnerabilities || false,
      securityPolicyUrl: json.securityPolicy || null,
      trendingScore,
      trendingPeriod: 'daily',
      lastReleaseDate: NpmPackage.extractLatestReleaseDate(json),
      latestReleaseTag: json['dist-tags']?.latest || json.version || null,
      latestReleaseName: json.name || null,
      isSubscribed: false,
      subscribedAt: new Date(),
      metrics: json.metrics || null,
    });
  }

  /**
   * Format maintainers as string
   */
  private static formatMaintainers(maintainers: any[]): string {
    if (!maintainers || maintainers.length === 0) return 'No maintainers';
    return maintainers.map(m => m.username || m.email || 'Unknown').join(', ');
  }

  /**
   * Extract dependencies from version object
   */
  private static extractDependencies(deps?: Record<string, string>): string[] {
    if (!deps) return [];
    return Object.keys(deps);
  }

  /**
   * Extract latest release date
   */
  private static extractLatestReleaseDate(json: any): Date | null {
    const latest = json.versions?.latest;
    if (latest?.time) {
      return new Date(latest.time);
    }
    return null;
  }

  /**
   * Calculate trending score (40% downloads, 40% stars, 20% activity)
   */
  private static calculateTrendingScore(json: any): number {
    const downloads = json.dist?.unpackedSize || 0;
    const stars = json.githubStars || 0;

    const modifiedDate = json.modified ? new Date(json.modified) : new Date();
    const recentActivity = this.calculateRecentActivity(modifiedDate);

    return downloads * 0.4 + stars * 0.4 + recentActivity * 0.2;
  }

  /**
   * Calculate recent activity score
   */
  private static calculateRecentActivity(modified: Date): number {
    const now = new Date();
    const daysSinceModified = Math.floor(
      (now.getTime() - modified.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceModified <= 1) return 10.0;
    if (daysSinceModified <= 7) return 8.0;
    if (daysSinceModified <= 30) return 6.0;
    if (daysSinceModified <= 90) return 4.0;
    return 2.0;
  }

  /**
   * Get formatted downloads string
   */
  get formattedDownloads(): string {
    if (this.downloads < 1000) return this.downloads.toString();
    if (this.downloads < 1000000)
      return `${(this.downloads / 1000).toFixed(1)}K`;
    return `${(this.downloads / 1000000).toFixed(1)}M`;
  }

  /**
   * Get time ago string
   */
  get timeAgo(): string {
    const now = new Date();
    const diffMs = now.getTime() - this.modified.getTime();
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
   * Get keywords as formatted string
   */
  get keywordsString(): string {
    if (this.keywords.length === 0) return 'No keywords';
    return this.keywords.join(', ');
  }

  /**
   * Check if has recent activity (last 7 days)
   */
  get hasRecentActivity(): boolean {
    const now = new Date();
    const daysSinceModified = Math.floor(
      (now.getTime() - this.modified.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysSinceModified <= 7;
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
   * Check if package is deprecated
   */
  get isDeprecated(): boolean {
    return (
      this.version.includes('DEPRECATED') ||
      this.description.toLowerCase().includes('deprecated')
    );
  }

  /**
   * Get dependency count
   */
  get dependencyCount(): number {
    return this.dependencies.length;
  }

  /**
   * Get dev dependency count
   */
  get devDependencyCount(): number {
    return this.devDependencies.length;
  }

  /**
   * Get total dependency count
   */
  get totalDependencyCount(): number {
    return this.dependencyCount + this.devDependencyCount;
  }

  /**
   * Check if has high impact dependencies
   */
  get hasHighImpactDependencies(): boolean {
    const highImpact = ['react', 'angular', 'vue', 'webpack', 'typescript'];
    return this.dependencies.some(dep =>
      highImpact.some(impact => dep.toLowerCase().includes(impact)),
    );
  }

  /**
   * Get formatted package size
   */
  get formattedSize(): string {
    if (this.downloads < 1024) return `${this.downloads}B`;
    if (this.downloads < 1024 * 1024)
      return `${(this.downloads / 1024).toFixed(1)}KB`;
    return `${(this.downloads / (1024 * 1024)).toFixed(1)}MB`;
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      version: this.version,
      description: this.description,
      npmUrl: this.npmUrl,
      homepage: this.homepage,
      repositoryUrl: this.repositoryUrl,
      readme: this.readme,
      modified: this.modified.toISOString(),
      keywords: this.keywords,
      downloads: this.downloads,
      stars: this.stars,
      publisher: this.publisher,
      publisherAvatarUrl: this.publisherAvatarUrl,
      maintainers: this.maintainers,
      versions: this.versions,
      latestVersion: this.latestVersion,
      license: this.license,
      dependencies: this.dependencies,
      devDependencies: this.devDependencies,
      openIssues: this.openIssues,
      openPullRequests: this.openPullRequests,
      hasSecurityVulnerabilities: this.hasSecurityVulnerabilities,
      securityPolicyUrl: this.securityPolicyUrl,
      trendingScore: this.trendingScore,
      trendingPeriod: this.trendingPeriod,
      lastReleaseDate: this.lastReleaseDate?.toISOString(),
      latestReleaseTag: this.latestReleaseTag,
      latestReleaseName: this.latestReleaseName,
      isSubscribed: this.isSubscribed,
      subscribedAt: this.subscribedAt.toISOString(),
      metrics: this.metrics,
    };
  }

  /**
   * Create copy with updated fields
   */
  copyWith(updates: Partial<NpmPackageData>): NpmPackage {
    return new NpmPackage({ ...this, ...updates });
  }
}

export default NpmPackage;
