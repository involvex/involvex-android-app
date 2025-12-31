import 'package:appwrite/appwrite.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/user_settings.dart';
import '../../appwrite/appwrite_client.dart';
import '../cache/cache_manager.dart';

/// Service for managing user settings persistence
class SettingsService {
  final Databases _db = AppwriteClient.databases;
  final String _databaseId = '6953b5970031f6fc49c0';
  final String _collectionId = 'user_settings';

  /// Get user settings from Appwrite or cache
  Future<UserSettings> getUserSettings(String userId) async {
    try {
      // Try to get from Appwrite first
      final docs = await _db.listDocuments(
        databaseId: _databaseId,
        collectionId: _collectionId,
        queries: [Query.equal('userId', userId)],
      );

      if (docs.documents.isNotEmpty) {
        final settings = UserSettings.fromJson(docs.documents.first.data);
        // Cache the settings
        await CacheManager.cacheUserSettings(settings.toJson());
        return settings;
      }

      // If not found in Appwrite, try cache
      final cachedSettings = CacheManager.getCachedUserSettings();
      if (cachedSettings != null) {
        return UserSettings.fromJson(cachedSettings);
      }

      // Return default settings
      return UserSettings();
    } catch (e) {
      print('Error getting user settings: $e');

      // Try to return from cache on error
      final cachedSettings = CacheManager.getCachedUserSettings();
      if (cachedSettings != null) {
        return UserSettings.fromJson(cachedSettings);
      }

      // Fallback to defaults
      return UserSettings();
    }
  }

  /// Save user settings to Appwrite and cache
  Future<void> saveUserSettings(String userId, UserSettings settings) async {
    try {
      // Check if settings document exists
      final existing = await _db.listDocuments(
        databaseId: _databaseId,
        collectionId: _collectionId,
        queries: [Query.equal('userId', userId)],
      );

      final data = {
        ...settings.toJson(),
        'userId': userId,
        'updatedAt': DateTime.now().toIso8601String(),
      };

      if (existing.documents.isEmpty) {
        // Create new settings document
        await _db.createDocument(
          databaseId: _databaseId,
          collectionId: _collectionId,
          documentId: ID.unique(),
          data: {...data, 'createdAt': DateTime.now().toIso8601String()},
        );
      } else {
        // Update existing settings document
        await _db.updateDocument(
          databaseId: _databaseId,
          collectionId: _collectionId,
          documentId: existing.documents.first.$id,
          data: data,
        );
      }

      // Cache the settings
      await CacheManager.cacheUserSettings(settings.toJson());
    } catch (e) {
      print('Error saving user settings: $e');
      // Still cache locally even if Appwrite save fails
      await CacheManager.cacheUserSettings(settings.toJson());
      rethrow;
    }
  }

  /// Delete user settings
  Future<void> deleteUserSettings(String userId) async {
    try {
      final docs = await _db.listDocuments(
        databaseId: _databaseId,
        collectionId: _collectionId,
        queries: [Query.equal('userId', userId)],
      );

      for (final doc in docs.documents) {
        await _db.deleteDocument(
          databaseId: _databaseId,
          collectionId: _collectionId,
          documentId: doc.$id,
        );
      }

      // Clear cache
      await CacheManager.cacheUserSettings({});
    } catch (e) {
      print('Error deleting user settings: $e');
      rethrow;
    }
  }

  /// Reset settings to defaults
  Future<void> resetToDefaults(String userId) async {
    final defaultSettings = UserSettings();
    await saveUserSettings(userId, defaultSettings);
  }

  /// Export settings as JSON
  Map<String, dynamic> exportSettings(UserSettings settings) {
    return settings.toJson();
  }

  /// Import settings from JSON
  UserSettings importSettings(Map<String, dynamic> json) {
    try {
      return UserSettings.fromJson(json);
    } catch (e) {
      print('Error importing settings: $e');
      return UserSettings();
    }
  }

  /// Sync settings between local cache and Appwrite
  Future<void> syncSettings(String userId) async {
    try {
      final remoteSettings = await getUserSettings(userId);
      await CacheManager.cacheUserSettings(remoteSettings.toJson());
    } catch (e) {
      print('Error syncing settings: $e');
    }
  }

  // Session Management Methods

  static const String _keyUserSession = 'user_session';
  static const String _keyGuestMode = 'guest_mode';
  static const String _keyGithubToken = 'github_token_guest';
  static const String _keyNpmToken = 'npm_token_guest';

  /// Save user session data to local storage
  Future<void> saveSession(Map<String, dynamic> sessionData) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUserSession, jsonEncode(sessionData));
  }

  /// Get saved session data from local storage
  Future<Map<String, dynamic>?> getSession() async {
    final prefs = await SharedPreferences.getInstance();
    final sessionJson = prefs.getString(_keyUserSession);
    if (sessionJson != null) {
      return jsonDecode(sessionJson) as Map<String, dynamic>;
    }
    return null;
  }

  /// Clear session data from local storage
  Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyUserSession);
  }

  /// Set guest mode enabled/disabled
  Future<void> setGuestMode(bool isGuest) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyGuestMode, isGuest);
  }

  /// Check if app is in guest mode
  Future<bool> isGuestMode() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_keyGuestMode) ?? false;
  }

  /// Save guest tokens (GitHub, npm) to local storage
  Future<void> saveGuestTokens({
    String? githubToken,
    String? npmToken,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    if (githubToken != null) {
      await prefs.setString(_keyGithubToken, githubToken);
    }
    if (npmToken != null) {
      await prefs.setString(_keyNpmToken, npmToken);
    }
  }

  /// Get saved guest tokens from local storage
  Future<Map<String, String?>> getGuestTokens() async {
    final prefs = await SharedPreferences.getInstance();
    return {
      'github': prefs.getString(_keyGithubToken),
      'npm': prefs.getString(_keyNpmToken),
    };
  }

  /// Clear guest tokens from local storage
  Future<void> clearGuestTokens() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyGithubToken);
    await prefs.remove(_keyNpmToken);
  }
}
