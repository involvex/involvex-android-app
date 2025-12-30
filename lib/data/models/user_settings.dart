
class UserSettings {
  // Theme Settings
  final bool isDarkMode;
  final bool useHackerTheme;
  final String themeColor;
  
  // Trending Settings
  final String trendingTimeframe; // 'daily', 'weekly', 'monthly'
  final bool autoRefresh;
  final int refreshInterval; // minutes
  final bool showGitHubTrending;
  final bool showNpmTrending;
  
  // Notification Settings
  final bool enablePushNotifications;
  final bool enableDailyDigest;
  final bool enableWeeklySummary;
  final bool enableNewReleaseNotifications;
  final bool enableTrendingNotifications;
  final String notificationTime; // HH:MM format
  final bool enableVibration;
  final bool enableSound;
  
  // Display Settings
  final int itemsPerPage;
  final bool compactView;
  final bool showDescriptions;
  final bool showStars;
  final bool showForks;
  final bool showLastUpdated;
  final bool showLicense;
  final bool showTopics;
  
  // Filter & Sort Settings
  final List<String> excludedLanguages;
  final List<String> excludedKeywords;
  final String sortBy; // 'stars', 'date', 'trending_score', 'name'
  final bool sortAscending;
  final int minStars;
  final bool includeForks;
  final bool includeArchived;
  
  // Privacy Settings
  final bool shareUsageData;
  final bool enableAnalytics;
  final bool showPublicProfile;
  
  // Data Management
  final bool enableOfflineMode;
  final int cacheExpiryHours;
  final bool autoDeleteOldData;
  final int maxCacheSize; // MB
  
  // Account Settings
  final String? discordUserId;
  final String? discordUsername;
  final String? discordAvatarUrl;
  final String? discordEmail;
  final bool isDiscordConnected;
  final DateTime? lastSync;
  
  // Export Settings
  final bool enableDataExport;
  final String preferredExportFormat; // 'json', 'csv', 'txt'
  final bool includeMetadata;
  
  // Advanced Settings
  final bool enableDebugMode;
  final bool enableBetaFeatures;
  final String apiEndpoint;
  final int requestTimeout; // seconds

  UserSettings({
    this.isDarkMode = true,
    this.useHackerTheme = true,
    this.themeColor = 'primary',
    this.trendingTimeframe = 'daily',
    this.autoRefresh = true,
    this.refreshInterval = 60,
    this.showGitHubTrending = true,
    this.showNpmTrending = true,
    this.enablePushNotifications = true,
    this.enableDailyDigest = true,
    this.enableWeeklySummary = true,
    this.enableNewReleaseNotifications = true,
    this.enableTrendingNotifications = true,
    this.notificationTime = '09:00',
    this.enableVibration = true,
    this.enableSound = true,
    this.itemsPerPage = 50,
    this.compactView = false,
    this.showDescriptions = true,
    this.showStars = true,
    this.showForks = true,
    this.showLastUpdated = true,
    this.showLicense = true,
    this.showTopics = true,
    this.excludedLanguages = const [],
    this.excludedKeywords = const [],
    this.sortBy = 'trending_score',
    this.sortAscending = false,
    this.minStars = 0,
    this.includeForks = false,
    this.includeArchived = false,
    this.shareUsageData = false,
    this.enableAnalytics = false,
    this.showPublicProfile = false,
    this.enableOfflineMode = true,
    this.cacheExpiryHours = 24,
    this.autoDeleteOldData = true,
    this.maxCacheSize = 100,
    this.discordUserId,
    this.discordUsername,
    this.discordAvatarUrl,
    this.discordEmail,
    this.isDiscordConnected = false,
    this.lastSync,
    this.enableDataExport = true,
    this.preferredExportFormat = 'json',
    this.includeMetadata = true,
    this.enableDebugMode = false,
    this.enableBetaFeatures = false,
    this.apiEndpoint = 'https://api.github.com',
    this.requestTimeout = 30,
  });

  // Factory constructor for JSON
  factory UserSettings.fromJson(Map<String, dynamic> json) {
    return UserSettings(
      isDarkMode: json['isDarkMode'] ?? true,
      useHackerTheme: json['useHackerTheme'] ?? true,
      themeColor: json['themeColor'] ?? 'primary',
      trendingTimeframe: json['trendingTimeframe'] ?? 'daily',
      autoRefresh: json['autoRefresh'] ?? true,
      refreshInterval: json['refreshInterval'] ?? 60,
      showGitHubTrending: json['showGitHubTrending'] ?? true,
      showNpmTrending: json['showNpmTrending'] ?? true,
      enablePushNotifications: json['enablePushNotifications'] ?? true,
      enableDailyDigest: json['enableDailyDigest'] ?? true,
      enableWeeklySummary: json['enableWeeklySummary'] ?? true,
      enableNewReleaseNotifications: json['enableNewReleaseNotifications'] ?? true,
      enableTrendingNotifications: json['enableTrendingNotifications'] ?? true,
      notificationTime: json['notificationTime'] ?? '09:00',
      enableVibration: json['enableVibration'] ?? true,
      enableSound: json['enableSound'] ?? true,
      itemsPerPage: json['itemsPerPage'] ?? 50,
      compactView: json['compactView'] ?? false,
      showDescriptions: json['showDescriptions'] ?? true,
      showStars: json['showStars'] ?? true,
      showForks: json['showForks'] ?? true,
      showLastUpdated: json['showLastUpdated'] ?? true,
      showLicense: json['showLicense'] ?? true,
      showTopics: json['showTopics'] ?? true,
      excludedLanguages: List<String>.from(json['excludedLanguages'] ?? []),
      excludedKeywords: List<String>.from(json['excludedKeywords'] ?? []),
      sortBy: json['sortBy'] ?? 'trending_score',
      sortAscending: json['sortAscending'] ?? false,
      minStars: json['minStars'] ?? 0,
      includeForks: json['includeForks'] ?? false,
      includeArchived: json['includeArchived'] ?? false,
      shareUsageData: json['shareUsageData'] ?? false,
      enableAnalytics: json['enableAnalytics'] ?? false,
      showPublicProfile: json['showPublicProfile'] ?? false,
      enableOfflineMode: json['enableOfflineMode'] ?? true,
      cacheExpiryHours: json['cacheExpiryHours'] ?? 24,
      autoDeleteOldData: json['autoDeleteOldData'] ?? true,
      maxCacheSize: json['maxCacheSize'] ?? 100,
      discordUserId: json['discordUserId'],
      discordUsername: json['discordUsername'],
      discordAvatarUrl: json['discordAvatarUrl'],
      discordEmail: json['discordEmail'],
      isDiscordConnected: json['isDiscordConnected'] ?? false,
      lastSync: json['lastSync'] != null ? DateTime.parse(json['lastSync']) : null,
      enableDataExport: json['enableDataExport'] ?? true,
      preferredExportFormat: json['preferredExportFormat'] ?? 'json',
      includeMetadata: json['includeMetadata'] ?? true,
      enableDebugMode: json['enableDebugMode'] ?? false,
      enableBetaFeatures: json['enableBetaFeatures'] ?? false,
      apiEndpoint: json['apiEndpoint'] ?? 'https://api.github.com',
      requestTimeout: json['requestTimeout'] ?? 30,
    );
  }

  // Create copy with updated fields
  UserSettings copyWith({
    bool? isDarkMode,
    bool? useHackerTheme,
    String? themeColor,
    String? trendingTimeframe,
    bool? autoRefresh,
    int? refreshInterval,
    bool? showGitHubTrending,
    bool? showNpmTrending,
    bool? enablePushNotifications,
    bool? enableDailyDigest,
    bool? enableWeeklySummary,
    bool? enableNewReleaseNotifications,
    bool? enableTrendingNotifications,
    String? notificationTime,
    bool? enableVibration,
    bool? enableSound,
    int? itemsPerPage,
    bool? compactView,
    bool? showDescriptions,
    bool? showStars,
    bool? showForks,
    bool? showLastUpdated,
    bool? showLicense,
    bool? showTopics,
    List<String>? excludedLanguages,
    List<String>? excludedKeywords,
    String? sortBy,
    bool? sortAscending,
    int? minStars,
    bool? includeForks,
    bool? includeArchived,
    bool? shareUsageData,
    bool? enableAnalytics,
    bool? showPublicProfile,
    bool? enableOfflineMode,
    int? cacheExpiryHours,
    bool? autoDeleteOldData,
    int? maxCacheSize,
    String? discordUserId,
    String? discordUsername,
    String? discordAvatarUrl,
    String? discordEmail,
    bool? isDiscordConnected,
    DateTime? lastSync,
    bool? enableDataExport,
    String? preferredExportFormat,
    bool? includeMetadata,
    bool? enableDebugMode,
    bool? enableBetaFeatures,
    String? apiEndpoint,
    int? requestTimeout,
  }) {
    return UserSettings(
      isDarkMode: isDarkMode ?? this.isDarkMode,
      useHackerTheme: useHackerTheme ?? this.useHackerTheme,
      themeColor: themeColor ?? this.themeColor,
      trendingTimeframe: trendingTimeframe ?? this.trendingTimeframe,
      autoRefresh: autoRefresh ?? this.autoRefresh,
      refreshInterval: refreshInterval ?? this.refreshInterval,
      showGitHubTrending: showGitHubTrending ?? this.showGitHubTrending,
      showNpmTrending: showNpmTrending ?? this.showNpmTrending,
      enablePushNotifications: enablePushNotifications ?? this.enablePushNotifications,
      enableDailyDigest: enableDailyDigest ?? this.enableDailyDigest,
      enableWeeklySummary: enableWeeklySummary ?? this.enableWeeklySummary,
      enableNewReleaseNotifications: enableNewReleaseNotifications ?? this.enableNewReleaseNotifications,
      enableTrendingNotifications: enableTrendingNotifications ?? this.enableTrendingNotifications,
      notificationTime: notificationTime ?? this.notificationTime,
      enableVibration: enableVibration ?? this.enableVibration,
      enableSound: enableSound ?? this.enableSound,
      itemsPerPage: itemsPerPage ?? this.itemsPerPage,
      compactView: compactView ?? this.compactView,
      showDescriptions: showDescriptions ?? this.showDescriptions,
      showStars: showStars ?? this.showStars,
      showForks: showForks ?? this.showForks,
      showLastUpdated: showLastUpdated ?? this.showLastUpdated,
      showLicense: showLicense ?? this.showLicense,
      showTopics: showTopics ?? this.showTopics,
      excludedLanguages: excludedLanguages ?? this.excludedLanguages,
      excludedKeywords: excludedKeywords ?? this.excludedKeywords,
      sortBy: sortBy ?? this.sortBy,
      sortAscending: sortAscending ?? this.sortAscending,
      minStars: minStars ?? this.minStars,
      includeForks: includeForks ?? this.includeForks,
      includeArchived: includeArchived ?? this.includeArchived,
      shareUsageData: shareUsageData ?? this.shareUsageData,
      enableAnalytics: enableAnalytics ?? this.enableAnalytics,
      showPublicProfile: showPublicProfile ?? this.showPublicProfile,
      enableOfflineMode: enableOfflineMode ?? this.enableOfflineMode,
      cacheExpiryHours: cacheExpiryHours ?? this.cacheExpiryHours,
      autoDeleteOldData: autoDeleteOldData ?? this.autoDeleteOldData,
      maxCacheSize: maxCacheSize ?? this.maxCacheSize,
      discordUserId: discordUserId ?? this.discordUserId,
      discordUsername: discordUsername ?? this.discordUsername,
      discordAvatarUrl: discordAvatarUrl ?? this.discordAvatarUrl,
      discordEmail: discordEmail ?? this.discordEmail,
      isDiscordConnected: isDiscordConnected ?? this.isDiscordConnected,
      lastSync: lastSync ?? this.lastSync,
      enableDataExport: enableDataExport ?? this.enableDataExport,
      preferredExportFormat: preferredExportFormat ?? this.preferredExportFormat,
      includeMetadata: includeMetadata ?? this.includeMetadata,
      enableDebugMode: enableDebugMode ?? this.enableDebugMode,
      enableBetaFeatures: enableBetaFeatures ?? this.enableBetaFeatures,
      apiEndpoint: apiEndpoint ?? this.apiEndpoint,
      requestTimeout: requestTimeout ?? this.requestTimeout,
    );
  }

  // JSON serialization
  Map<String, dynamic> toJson() {
    return {
      'isDarkMode': isDarkMode,
      'useHackerTheme': useHackerTheme,
      'themeColor': themeColor,
      'trendingTimeframe': trendingTimeframe,
      'autoRefresh': autoRefresh,
      'refreshInterval': refreshInterval,
      'showGitHubTrending': showGitHubTrending,
      'showNpmTrending': showNpmTrending,
      'enablePushNotifications': enablePushNotifications,
      'enableDailyDigest': enableDailyDigest,
      'enableWeeklySummary': enableWeeklySummary,
      'enableNewReleaseNotifications': enableNewReleaseNotifications,
      'enableTrendingNotifications': enableTrendingNotifications,
      'notificationTime': notificationTime,
      'enableVibration': enableVibration,
      'enableSound': enableSound,
      'itemsPerPage': itemsPerPage,
      'compactView': compactView,
      'showDescriptions': showDescriptions,
      'showStars': showStars,
      'showForks': showForks,
      'showLastUpdated': showLastUpdated,
      'showLicense': showLicense,
      'showTopics': showTopics,
      'excludedLanguages': excludedLanguages,
      'excludedKeywords': excludedKeywords,
      'sortBy': sortBy,
      'sortAscending': sortAscending,
      'minStars': minStars,
      'includeForks': includeForks,
      'includeArchived': includeArchived,
      'shareUsageData': shareUsageData,
      'enableAnalytics': enableAnalytics,
      'showPublicProfile': showPublicProfile,
      'enableOfflineMode': enableOfflineMode,
      'cacheExpiryHours': cacheExpiryHours,
      'autoDeleteOldData': autoDeleteOldData,
      'maxCacheSize': maxCacheSize,
      'discordUserId': discordUserId,
      'discordUsername': discordUsername,
      'discordAvatarUrl': discordAvatarUrl,
      'discordEmail': discordEmail,
      'isDiscordConnected': isDiscordConnected,
      'lastSync': lastSync?.toIso8601String(),
      'enableDataExport': enableDataExport,
      'preferredExportFormat': preferredExportFormat,
      'includeMetadata': includeMetadata,
      'enableDebugMode': enableDebugMode,
      'enableBetaFeatures': enableBetaFeatures,
      'apiEndpoint': apiEndpoint,
      'requestTimeout': requestTimeout,
    };
  }

  // Validate settings
  bool get isValid {
    return refreshInterval > 0 &&
           itemsPerPage > 0 &&
           cacheExpiryHours > 0 &&
           maxCacheSize > 0 &&
           requestTimeout > 0 &&
           notificationTime.split(':').length == 2;
  }

  // Get notification time components
  Map<String, int> get notificationTimeComponents {
    final parts = notificationTime.split(':');
    return {
      'hour': int.parse(parts[0]),
      'minute': int.parse(parts[1]),
    };
  }

  // Check if notifications are enabled
  bool get notificationsEnabled {
    return enablePushNotifications || enableDailyDigest || enableWeeklySummary;
  }

  // Get enabled notification types
  List<String> get enabledNotificationTypes {
    final types = <String>[];
    if (enableNewReleaseNotifications) types.add('new_releases');
    if (enableTrendingNotifications) types.add('trending');
    if (enableDailyDigest) types.add('daily_digest');
    if (enableWeeklySummary) types.add('weekly_summary');
    return types;
  }

  // Reset to defaults
  UserSettings get defaults => UserSettings();

  @override
  String toString() {
    return 'UserSettings{trendingTimeframe: $trendingTimeframe, theme: ${useHackerTheme ? 'hacker' : 'default'}}';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is UserSettings && other.toJson() == toJson();
  }

  @override
  int get hashCode => toJson().hashCode;
}