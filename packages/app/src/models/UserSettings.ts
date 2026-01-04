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

  // Advanced Settings (5 fields)
  enableDebugMode: boolean;
  enableBetaFeatures: boolean;
  apiEndpoint: string;
  requestTimeout: number; // seconds
  autoCheckForUpdates: boolean;

  // AI Assistant Settings (8 fields)
  enableAIFeatures: boolean;
  geminiModel: 'gemini-pro' | 'gemini-flash';
  ollamaModel: string | null; // e.g., 'llama2', 'mistral'
  openRouterApiKey: string | null;
  openRouterModel: string | null; // e.g., 'anthropic/claude-3-sonnet'
  preferredAIProvider: 'gemini' | 'ollama' | 'openrouter';
  aiResponseMaxTokens: number;

  // UI Features (2 fields)
  enableInfoCardPreview: boolean;
  defaultBrowserAction: 'external' | 'inapp'; // default action when tapping item
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
  autoCheckForUpdates: boolean;

  // AI Assistant
  enableAIFeatures: boolean;
  geminiModel: 'gemini-pro' | 'gemini-flash';
  ollamaModel: string | null;
  openRouterApiKey: string | null;
  openRouterModel: string | null;
  preferredAIProvider: 'gemini' | 'ollama' | 'openrouter';
  aiResponseMaxTokens: number;

  // UI Features
  enableInfoCardPreview: boolean;
  defaultBrowserAction: 'external' | 'inapp';

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
    this.autoCheckForUpdates = data?.autoCheckForUpdates ?? true;

    // AI Assistant Settings
    this.enableAIFeatures = data?.enableAIFeatures ?? false;
    this.geminiModel = data?.geminiModel ?? 'gemini-flash';
    this.ollamaModel = data?.ollamaModel ?? null;
    this.openRouterApiKey = data?.openRouterApiKey ?? null;
    this.openRouterModel =
      data?.openRouterModel ?? 'anthropic/claude-3-5-sonnet';
    this.preferredAIProvider = data?.preferredAIProvider ?? 'gemini';
    this.aiResponseMaxTokens = data?.aiResponseMaxTokens ?? 2048;

    // UI Features
    this.enableInfoCardPreview = data?.enableInfoCardPreview ?? true;
    this.defaultBrowserAction = data?.defaultBrowserAction ?? 'external';
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: Record<string, unknown>): UserSettings {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = json as Record<string, any>; // Cast to any internally to avoid casting every property
    return new UserSettings({
      isDarkMode: data.isDarkMode,
      useHackerTheme: data.useHackerTheme,
      trendingTimeframe: data.trendingTimeframe,
      autoRefresh: data.autoRefresh,
      refreshInterval: data.refreshInterval,
      showGitHubTrending: data.showGitHubTrending,
      showNpmTrending: data.showNpmTrending,
      enablePushNotifications: data.enablePushNotifications,
      enableDailyDigest: data.enableDailyDigest,
      enableWeeklySummary: data.enableWeeklySummary,
      enableNewReleaseNotifications: data.enableNewReleaseNotifications,
      enableTrendingNotifications: data.enableTrendingNotifications,
      notificationTime: data.notificationTime,
      enableVibration: data.enableVibration,
      enableSound: data.enableSound,
      itemsPerPage: data.itemsPerPage,
      compactView: data.compactView,
      showDescriptions: data.showDescriptions,
      showStars: data.showStars,
      showForks: data.showForks,
      showLastUpdated: data.showLastUpdated,
      showLicense: data.showLicense,
      showTopics: data.showTopics,
      excludedLanguages: data.excludedLanguages || [],
      excludedKeywords: data.excludedKeywords || [],
      sortBy: data.sortBy,
      sortAscending: data.sortAscending,
      minStars: data.minStars,
      includeForks: data.includeForks,
      includeArchived: data.includeArchived,
      shareUsageData: data.shareUsageData,
      enableAnalytics: data.enableAnalytics,
      showPublicProfile: data.showPublicProfile,
      enableOfflineMode: data.enableOfflineMode,
      cacheExpiryHours: data.cacheExpiryHours,
      autoDeleteOldData: data.autoDeleteOldData,
      maxCacheSize: data.maxCacheSize,
      discordUserId: data.discordUserId,
      discordUsername: data.discordUsername,
      discordAvatarUrl: data.discordAvatarUrl,
      discordEmail: data.discordEmail,
      isDiscordConnected: data.isDiscordConnected,
      lastSync: data.lastSync ? new Date(data.lastSync) : null,
      githubToken: data.githubToken,
      npmToken: data.npmToken,
      enableDataExport: data.enableDataExport,
      preferredExportFormat: data.preferredExportFormat,
      includeMetadata: data.includeMetadata,
      enableDebugMode: data.enableDebugMode,
      enableBetaFeatures: data.enableBetaFeatures,
      apiEndpoint: data.apiEndpoint,
      requestTimeout: data.requestTimeout,
      autoCheckForUpdates: data.autoCheckForUpdates,
      enableAIFeatures: data.enableAIFeatures,
      geminiModel: data.geminiModel,
      ollamaModel: data.ollamaModel,
      openRouterApiKey: data.openRouterApiKey,
      openRouterModel: data.openRouterModel,
      preferredAIProvider: data.preferredAIProvider,
      aiResponseMaxTokens: data.aiResponseMaxTokens,
      enableInfoCardPreview: data.enableInfoCardPreview,
      defaultBrowserAction: data.defaultBrowserAction,
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
  toJSON(): Record<string, unknown> {
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
      autoCheckForUpdates: this.autoCheckForUpdates,
      enableAIFeatures: this.enableAIFeatures,
      geminiModel: this.geminiModel,
      ollamaModel: this.ollamaModel,
      openRouterApiKey: this.openRouterApiKey,
      openRouterModel: this.openRouterModel,
      preferredAIProvider: this.preferredAIProvider,
      aiResponseMaxTokens: this.aiResponseMaxTokens,
      enableInfoCardPreview: this.enableInfoCardPreview,
      defaultBrowserAction: this.defaultBrowserAction,
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
