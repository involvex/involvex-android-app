import 'package:hive_flutter/hive_flutter.dart';
import '../models/github_repository.dart';
import '../models/npm_package.dart';

/// Cache Manager for offline data storage using Hive
class CacheManager {
  static const String _reposBox = 'trending_repos';
  static const String _packagesBox = 'trending_packages';
  static const String _settingsBox = 'user_settings';
  static const String _subscriptionsBox = 'subscriptions';

  /// Initialize Hive and open boxes
  static Future<void> initialize() async {
    await Hive.initFlutter();

    // Open boxes for caching
    await Hive.openBox<Map>(_reposBox);
    await Hive.openBox<Map>(_packagesBox);
    await Hive.openBox<Map>(_settingsBox);
    await Hive.openBox<Map>(_subscriptionsBox);
  }

  /// Cache trending repositories
  static Future<void> cacheTrendingRepos(
    String timeframe,
    List<GitHubRepository> repos,
  ) async {
    final box = Hive.box<Map>(_reposBox);
    await box.put(timeframe, {
      'data': repos.map((r) => r.toJson()).toList(),
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  /// Get cached trending repositories
  static List<GitHubRepository>? getCachedTrendingRepos(
    String timeframe, {
    Duration maxAge = const Duration(hours: 1),
  }) {
    final box = Hive.box<Map>(_reposBox);
    final cached = box.get(timeframe);

    if (cached == null) return null;

    final timestamp = DateTime.parse(cached['timestamp'] as String);
    if (DateTime.now().difference(timestamp) > maxAge) {
      return null; // Cache expired
    }

    final List data = cached['data'] as List;
    return data
        .map((json) => GitHubRepository.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Cache trending packages
  static Future<void> cacheTrendingPackages(
    String timeframe,
    List<NpmPackage> packages,
  ) async {
    final box = Hive.box<Map>(_packagesBox);
    await box.put(timeframe, {
      'data': packages.map((p) => p.toJson()).toList(),
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  /// Get cached trending packages
  static List<NpmPackage>? getCachedTrendingPackages(
    String timeframe, {
    Duration maxAge = const Duration(hours: 1),
  }) {
    final box = Hive.box<Map>(_packagesBox);
    final cached = box.get(timeframe);

    if (cached == null) return null;

    final timestamp = DateTime.parse(cached['timestamp'] as String);
    if (DateTime.now().difference(timestamp) > maxAge) {
      return null; // Cache expired
    }

    final List data = cached['data'] as List;
    return data
        .map((json) => NpmPackage.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Cache user settings
  static Future<void> cacheUserSettings(Map<String, dynamic> settings) async {
    final box = Hive.box<Map>(_settingsBox);
    await box.put('current_user', {
      'data': settings,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  /// Get cached user settings
  static Map<String, dynamic>? getCachedUserSettings() {
    final box = Hive.box<Map>(_settingsBox);
    final cached = box.get('current_user');

    if (cached == null) return null;

    return cached['data'] as Map<String, dynamic>;
  }

  /// Cache subscriptions
  static Future<void> cacheSubscriptions(
      List<Map<String, dynamic>> subscriptions) async {
    final box = Hive.box<Map>(_subscriptionsBox);
    await box.put('user_subscriptions', {
      'data': subscriptions,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  /// Get cached subscriptions
  static List<Map<String, dynamic>>? getCachedSubscriptions({
    Duration maxAge = const Duration(hours: 24),
  }) {
    final box = Hive.box<Map>(_subscriptionsBox);
    final cached = box.get('user_subscriptions');

    if (cached == null) return null;

    final timestamp = DateTime.parse(cached['timestamp'] as String);
    if (DateTime.now().difference(timestamp) > maxAge) {
      return null; // Cache expired
    }

    final List data = cached['data'] as List;
    return data.cast<Map<String, dynamic>>();
  }

  /// Clear all caches
  static Future<void> clearAllCaches() async {
    await Hive.box<Map>(_reposBox).clear();
    await Hive.box<Map>(_packagesBox).clear();
    await Hive.box<Map>(_settingsBox).clear();
    await Hive.box<Map>(_subscriptionsBox).clear();
  }

  /// Clear expired caches
  static Future<void> clearExpiredCaches(
      {Duration maxAge = const Duration(days: 7)}) async {
    final reposBox = Hive.box<Map>(_reposBox);
    final packagesBox = Hive.box<Map>(_packagesBox);

    final now = DateTime.now();

    // Clear expired repos
    for (var key in reposBox.keys.toList()) {
      final cached = reposBox.get(key);
      if (cached != null) {
        final timestamp = DateTime.parse(cached['timestamp'] as String);
        if (now.difference(timestamp) > maxAge) {
          await reposBox.delete(key);
        }
      }
    }

    // Clear expired packages
    for (var key in packagesBox.keys.toList()) {
      final cached = packagesBox.get(key);
      if (cached != null) {
        final timestamp = DateTime.parse(cached['timestamp'] as String);
        if (now.difference(timestamp) > maxAge) {
          await packagesBox.delete(key);
        }
      }
    }
  }

  /// Get cache size in bytes
  static Future<int> getCacheSize() async {
    int totalSize = 0;

    final reposBox = Hive.box<Map>(_reposBox);
    final packagesBox = Hive.box<Map>(_packagesBox);
    final settingsBox = Hive.box<Map>(_settingsBox);
    final subscriptionsBox = Hive.box<Map>(_subscriptionsBox);

    totalSize += reposBox.toMap().toString().length;
    totalSize += packagesBox.toMap().toString().length;
    totalSize += settingsBox.toMap().toString().length;
    totalSize += subscriptionsBox.toMap().toString().length;

    return totalSize;
  }
}
