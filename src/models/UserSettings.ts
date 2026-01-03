/**
 * User Settings Model
 * Ported from Flutter app: lib/data/models/user_settings.dart
 * Complete model with 51 configuration fields across 8 categories
 */

export interface UserSettingsData {
  // Theme Settings (2 fields)
  isDarkMode: boolean;
  useHackerTheme: boolean;

  // Trending Settings (5 fields)
  trendingTimeframe: 'daily' | 'weekly' | 'monthly';
  autoRefresh: boolean;
  refreshInterval: number; // minutes
  showGitHubTrending: boolean;
  showNpmTrending: boolean;

  // Notification Settings (8 fields)
  enablePushNotifications: boolean;
  enableDailyDigest: boolean;
  enableWeeklySummary: boolean;
  enableNewReleaseNotifications: boolean;
  enableTrendingNotifications: boolean;
  notificationTime: string; // HH:MM format
  enableVibration: boolean;
  enableSound: boolean;

  // Display Settings (8 fields)
  itemsPerPage: number;
  compactView: boolean;
  showDescriptions: boolean;
  showStars: boolean;
  showForks: boolean;
  showLastUpdated: boolean;
  showLicense: boolean;
  showTopics: boolean;

  // Filter & Sort Settings (7 fields)
  excludedLanguages: string[];
  excludedKeywords: string[];
  sortBy: 'stars' | 'date' | 'trending_score' | 'name';
  sortAscending: boolean;
  minStars: number;
  includeForks: boolean;
  includeArchived: boolean;

  // Privacy Settings (3 fields)
  shareUsageData: boolean;
  enableAnalytics: boolean;
  showPublicProfile: boolean;

  // Data Management (4 fields)
  enableOfflineMode: boolean;
  cacheExpiryHours: number;
  autoDeleteOldData: boolean;
  maxCacheSize: number; // MB

  // Account Settings (8 fields)
  discordUserId: string | null;
  discordUsername: string | null;
  discordAvatarUrl: string | null;
  discordEmail: string | null;
  isDiscordConnected: boolean;
  lastSync: Date | null;
  githubToken: string | null;
  npmToken: string | null;

  // Export Settings (3 fields)
  enableDataExport: boolean;
  preferredExportFormat: 'json' | 'csv' | 'txt';
  includeMetadata: boolean;

  // Advanced Settings (4 fields)
  enableDebugMode: boolean;
  enableBetaFeatures: boolean;
  apiEndpoint: string;
  requestTimeout: number; // seconds
}

export class UserSettings implements UserSettingsData {
  // Theme
  isDarkMode: boolean;
  useHackerTheme: boolean;

  // Trending
  trendingTimeframe: 'daily' | 'weekly' | 'monthly';
  autoRefresh: boolean;
  refreshInterval: number;
  showGitHubTrending: boolean;
  showNpmTrending: boolean;

  // Notifications
  enablePushNotifications: boolean;
  enableDailyDigest: boolean;
  enableWeeklySummary: boolean;
  enableNewReleaseNotifications: boolean;
  enableTrendingNotifications: boolean;
  notificationTime: string;
  enableVibration: boolean;
  enableSound: boolean;

  // Display
  itemsPerPage: number;
  compactView: boolean;
  showDescriptions: boolean;
  showStars: boolean;
  showForks: boolean;
  showLastUpdated: boolean;
  showLicense: boolean;
  showTopics: boolean;

  // Filter & Sort
  excludedLanguages: string[];
  excludedKeywords: string[];
  sortBy: 'stars' | 'date' | 'trending_score' | 'name';
  sortAscending: boolean;
  minStars: number;
  includeForks: boolean;
  includeArchived: boolean;

  // Privacy
  shareUsageData: boolean;
  enableAnalytics: boolean;
  showPublicProfile: boolean;

  // Data Management
  enableOfflineMode: boolean;
  cacheExpiryHours: number;
  autoDeleteOldData: boolean;
  maxCacheSize: number;

  // Account
  discordUserId: string | null;
  discordUsername: string | null;
  discordAvatarUrl: string | null;
  discordEmail: string | null;
  isDiscordConnected: boolean;
  lastSync: Date | null;
  githubToken: string | null;
  npmToken: string | null;

  // Export
  enableDataExport: boolean;
  preferredExportFormat: 'json' | 'csv' | 'txt';
  includeMetadata: boolean;

  // Advanced
  enableDebugMode: boolean;
  enableBetaFeatures: boolean;
  apiEndpoint: string;
  requestTimeout: number;

  constructor(data?: Partial<UserSettingsData>) {
    // Theme Settings
    this.isDarkMode = data?.isDarkMode ?? true;
    this.useHackerTheme = data?.useHackerTheme ?? true;

    // Trending Settings
    this.trendingTimeframe = data?.trendingTimeframe ?? 'daily';
    this.autoRefresh = data?.autoRefresh ?? true;
    this.refreshInterval = data?.refreshInterval ?? 60;
    this.showGitHubTrending = data?.showGitHubTrending ?? true;
    this.showNpmTrending = data?.showNpmTrending ?? true;

    // Notification Settings
    this.enablePushNotifications = data?.enablePushNotifications ?? true;
    this.enableDailyDigest = data?.enableDailyDigest ?? true;
    this.enableWeeklySummary = data?.enableWeeklySummary ?? true;
    this.enableNewReleaseNotifications =
      data?.enableNewReleaseNotifications ?? true;
    this.enableTrendingNotifications =
      data?.enableTrendingNotifications ?? true;
    this.notificationTime = data?.notificationTime ?? '09:00';
    this.enableVibration = data?.enableVibration ?? true;
    this.enableSound = data?.enableSound ?? true;

    // Display Settings
    this.itemsPerPage = data?.itemsPerPage ?? 50;
    this.compactView = data?.compactView ?? false;
    this.showDescriptions = data?.showDescriptions ?? true;
    this.showStars = data?.showStars ?? true;
    this.showForks = data?.showForks ?? true;
    this.showLastUpdated = data?.showLastUpdated ?? true;
    this.showLicense = data?.showLicense ?? true;
    this.showTopics = data?.showTopics ?? true;

    // Filter & Sort Settings
    this.excludedLanguages = data?.excludedLanguages ?? [];
    this.excludedKeywords = data?.excludedKeywords ?? [];
    this.sortBy = data?.sortBy ?? 'trending_score';
    this.sortAscending = data?.sortAscending ?? false;
    this.minStars = data?.minStars ?? 0;
    this.includeForks = data?.includeForks ?? false;
    this.includeArchived = data?.includeArchived ?? false;

    // Privacy Settings
    this.shareUsageData = data?.shareUsageData ?? false;
    this.enableAnalytics = data?.enableAnalytics ?? false;
    this.showPublicProfile = data?.showPublicProfile ?? false;

    // Data Management
    this.enableOfflineMode = data?.enableOfflineMode ?? true;
    this.cacheExpiryHours = data?.cacheExpiryHours ?? 24;
    this.autoDeleteOldData = data?.autoDeleteOldData ?? true;
    this.maxCacheSize = data?.maxCacheSize ?? 100;

    // Account Settings
    this.discordUserId = data?.discordUserId ?? null;
    this.discordUsername = data?.discordUsername ?? null;
    this.discordAvatarUrl = data?.discordAvatarUrl ?? null;
    this.discordEmail = data?.discordEmail ?? null;
    this.isDiscordConnected = data?.isDiscordConnected ?? false;
    this.lastSync = data?.lastSync ?? null;
    this.githubToken = data?.githubToken ?? null;
    this.npmToken = data?.npmToken ?? null;

    // Export Settings
    this.enableDataExport = data?.enableDataExport ?? true;
    this.preferredExportFormat = data?.preferredExportFormat ?? 'json';
    this.includeMetadata = data?.includeMetadata ?? true;

    // Advanced Settings
    this.enableDebugMode = data?.enableDebugMode ?? false;
    this.enableBetaFeatures = data?.enableBetaFeatures ?? false;
    this.apiEndpoint = data?.apiEndpoint ?? 'https://api.github.com';
    this.requestTimeout = data?.requestTimeout ?? 30;
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: Record<string, any>): UserSettings {
    return new UserSettings({
      isDarkMode: json.isDarkMode,
      useHackerTheme: json.useHackerTheme,
      trendingTimeframe: json.trendingTimeframe,
      autoRefresh: json.autoRefresh,
      refreshInterval: json.refreshInterval,
      showGitHubTrending: json.showGitHubTrending,
      showNpmTrending: json.showNpmTrending,
      enablePushNotifications: json.enablePushNotifications,
      enableDailyDigest: json.enableDailyDigest,
      enableWeeklySummary: json.enableWeeklySummary,
      enableNewReleaseNotifications: json.enableNewReleaseNotifications,
      enableTrendingNotifications: json.enableTrendingNotifications,
      notificationTime: json.notificationTime,
      enableVibration: json.enableVibration,
      enableSound: json.enableSound,
      itemsPerPage: json.itemsPerPage,
      compactView: json.compactView,
      showDescriptions: json.showDescriptions,
      showStars: json.showStars,
      showForks: json.showForks,
      showLastUpdated: json.showLastUpdated,
      showLicense: json.showLicense,
      showTopics: json.showTopics,
      excludedLanguages: json.excludedLanguages || [],
      excludedKeywords: json.excludedKeywords || [],
      sortBy: json.sortBy,
      sortAscending: json.sortAscending,
      minStars: json.minStars,
      includeForks: json.includeForks,
      includeArchived: json.includeArchived,
      shareUsageData: json.shareUsageData,
      enableAnalytics: json.enableAnalytics,
      showPublicProfile: json.showPublicProfile,
      enableOfflineMode: json.enableOfflineMode,
      cacheExpiryHours: json.cacheExpiryHours,
      autoDeleteOldData: json.autoDeleteOldData,
      maxCacheSize: json.maxCacheSize,
      discordUserId: json.discordUserId,
      discordUsername: json.discordUsername,
      discordAvatarUrl: json.discordAvatarUrl,
      discordEmail: json.discordEmail,
      isDiscordConnected: json.isDiscordConnected,
      lastSync: json.lastSync ? new Date(json.lastSync) : null,
      githubToken: json.githubToken,
      npmToken: json.npmToken,
      enableDataExport: json.enableDataExport,
      preferredExportFormat: json.preferredExportFormat,
      includeMetadata: json.includeMetadata,
      enableDebugMode: json.enableDebugMode,
      enableBetaFeatures: json.enableBetaFeatures,
      apiEndpoint: json.apiEndpoint,
      requestTimeout: json.requestTimeout,
    });
  }

  /**
   * Validate settings
   */
  get isValid(): boolean {
    return (
      this.refreshInterval > 0 &&
      this.itemsPerPage > 0 &&
      this.cacheExpiryHours > 0 &&
      this.maxCacheSize > 0 &&
      this.requestTimeout > 0 &&
      this.notificationTime.split(':').length === 2
    );
  }

  /**
   * Get notification time components
   */
  get notificationTimeComponents(): { hour: number; minute: number } {
    const parts = this.notificationTime.split(':');
    return {
      hour: parseInt(parts[0], 10),
      minute: parseInt(parts[1], 10),
    };
  }

  /**
   * Check if notifications are enabled
   */
  get notificationsEnabled(): boolean {
    return (
      this.enablePushNotifications ||
      this.enableDailyDigest ||
      this.enableWeeklySummary
    );
  }

  /**
   * Get enabled notification types
   */
  get enabledNotificationTypes(): string[] {
    const types: string[] = [];
    if (this.enableNewReleaseNotifications) types.push('new_releases');
    if (this.enableTrendingNotifications) types.push('trending');
    if (this.enableDailyDigest) types.push('daily_digest');
    if (this.enableWeeklySummary) types.push('weekly_summary');
    return types;
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      isDarkMode: this.isDarkMode,
      useHackerTheme: this.useHackerTheme,
      trendingTimeframe: this.trendingTimeframe,
      autoRefresh: this.autoRefresh,
      refreshInterval: this.refreshInterval,
      showGitHubTrending: this.showGitHubTrending,
      showNpmTrending: this.showNpmTrending,
      enablePushNotifications: this.enablePushNotifications,
      enableDailyDigest: this.enableDailyDigest,
      enableWeeklySummary: this.enableWeeklySummary,
      enableNewReleaseNotifications: this.enableNewReleaseNotifications,
      enableTrendingNotifications: this.enableTrendingNotifications,
      notificationTime: this.notificationTime,
      enableVibration: this.enableVibration,
      enableSound: this.enableSound,
      itemsPerPage: this.itemsPerPage,
      compactView: this.compactView,
      showDescriptions: this.showDescriptions,
      showStars: this.showStars,
      showForks: this.showForks,
      showLastUpdated: this.showLastUpdated,
      showLicense: this.showLicense,
      showTopics: this.showTopics,
      excludedLanguages: this.excludedLanguages,
      excludedKeywords: this.excludedKeywords,
      sortBy: this.sortBy,
      sortAscending: this.sortAscending,
      minStars: this.minStars,
      includeForks: this.includeForks,
      includeArchived: this.includeArchived,
      shareUsageData: this.shareUsageData,
      enableAnalytics: this.enableAnalytics,
      showPublicProfile: this.showPublicProfile,
      enableOfflineMode: this.enableOfflineMode,
      cacheExpiryHours: this.cacheExpiryHours,
      autoDeleteOldData: this.autoDeleteOldData,
      maxCacheSize: this.maxCacheSize,
      discordUserId: this.discordUserId,
      discordUsername: this.discordUsername,
      discordAvatarUrl: this.discordAvatarUrl,
      discordEmail: this.discordEmail,
      isDiscordConnected: this.isDiscordConnected,
      lastSync: this.lastSync?.toISOString(),
      githubToken: this.githubToken,
      npmToken: this.npmToken,
      enableDataExport: this.enableDataExport,
      preferredExportFormat: this.preferredExportFormat,
      includeMetadata: this.includeMetadata,
      enableDebugMode: this.enableDebugMode,
      enableBetaFeatures: this.enableBetaFeatures,
      apiEndpoint: this.apiEndpoint,
      requestTimeout: this.requestTimeout,
    };
  }

  /**
   * Create copy with updated fields
   */
  copyWith(updates: Partial<UserSettingsData>): UserSettings {
    return new UserSettings({ ...this.toJSON(), ...updates });
  }

  /**
   * Reset to defaults
   */
  static get defaults(): UserSettings {
    return new UserSettings();
  }
}

export default UserSettings;