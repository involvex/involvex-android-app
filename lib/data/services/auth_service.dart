import 'package:appwrite/appwrite.dart';
import 'package:appwrite/enums.dart';
import 'dart:io' show Platform;
import '../../config/environment.dart';
import 'settings_service.dart';

class AuthService {
  late final Account _account;
  late final Databases _database;
  final String _databaseId = Environment.appwriteDatabaseId;
  final SettingsService _settingsService = SettingsService();

  // Collections
  static const String _usersCollectionId = 'users';
  static const String _subscriptionsCollectionId = 'subscriptions';
  static const String _settingsCollectionId = 'user_settings';

  AuthService() {
    final client = Client()
        .setEndpoint(Environment.appwriteEndpoint)
        .setProject(Environment.appwriteProjectId);

    _account = Account(client);
    _database = Databases(client);
  }

  // Get platform-specific OAuth redirect URLs
  String _getOAuthSuccessUrl() {
    if (Platform.isAndroid || Platform.isIOS) {
      return '${Environment.appUrl}/callback';
    } else {
      // For desktop/web, use Appwrite's default success URL
      return 'https://fra.cloud.appwrite.io/v1/account/sessions/oauth2/success';
    }
  }

  String _getOAuthFailureUrl() {
    if (Platform.isAndroid || Platform.isIOS) {
      return '${Environment.appUrl}/failure';
    } else {
      // For desktop/web, use Appwrite's default failure URL
      return 'https://fra.cloud.appwrite.io/v1/account/sessions/oauth2/failure';
    }
  }

  // Discord OAuth2 Authentication
  Future<dynamic> signInWithDiscord() async {
    try {
      // Start Discord OAuth2 flow
      await _account.createOAuth2Session(
        provider: OAuthProvider.discord,
        success: _getOAuthSuccessUrl(),
        failure: _getOAuthFailureUrl(),
      );

      // Get user information
      final user = await _account.get();

      // Save session to local storage
      await _settingsService.saveSession({
        'userId': user.$id,
        'email': user.email,
        'name': user.name,
        'provider': 'discord',
        'timestamp': DateTime.now().toIso8601String(),
      });

      await _settingsService.setGuestMode(false);
      return user;
    } catch (e) {
      print('Discord sign in error: $e');
      return null;
    }
  }

  // Email/Password authentication (fallback)
  Future<dynamic> signInWithEmail(String email, String password) async {
    try {
      await _account.createEmailPasswordSession(
        email: email,
        password: password,
      );

      final user = await _account.get();

      // Save session to local storage
      await _settingsService.saveSession({
        'userId': user.$id,
        'email': user.email,
        'name': user.name,
        'provider': 'email',
        'timestamp': DateTime.now().toIso8601String(),
      });

      await _settingsService.setGuestMode(false);
      return user;
    } catch (e) {
      print('Email sign in error: $e');
      return null;
    }
  }

  // Sign up with email
  Future<dynamic> signUpWithEmail(String email, String password,
      {String? name}) async {
    try {
      final user = await _account.create(
        userId: ID.unique(),
        email: email,
        password: password,
        name: name ?? '',
      );

      // Create session
      await _account.createEmailPasswordSession(
        email: email,
        password: password,
      );

      return user;
    } catch (e) {
      print('Sign up error: $e');
      return null;
    }
  }

  // Sign out
  Future<void> signOut() async {
    try {
      await _account.deleteSession(sessionId: 'current');
      await _settingsService.clearSession();
    } catch (e) {
      print('Sign out error: $e');
      await _settingsService.clearSession();
    }
  }

  // Get current user
  Future<dynamic> getCurrentUser() async {
    try {
      final user = await _account.get();
      return user;
    } catch (e) {
      return null;
    }
  }

  // Check if user is authenticated
  Future<bool> isAuthenticated() async {
    final user = await getCurrentUser();
    return user != null;
  }

  // User Management
  Future<Map<String, dynamic>?> getUserData(String userId) async {
    try {
      final response = await _database.getDocument(
        databaseId: _databaseId,
        collectionId: _usersCollectionId,
        documentId: userId,
      );
      return response.data;
    } catch (e) {
      print('Get user data error: $e');
      return null;
    }
  }

  Future<void> createUserProfile(
      String userId, Map<String, dynamic> userData) async {
    try {
      await _database.createDocument(
        databaseId: _databaseId,
        collectionId: _usersCollectionId,
        documentId: userId,
        data: {
          ...userData,
          'createdAt': DateTime.now().toIso8601String(),
          'updatedAt': DateTime.now().toIso8601String(),
        },
      );
    } catch (e) {
      print('Create user profile error: $e');
    }
  }

  Future<void> updateUserProfile(
      String userId, Map<String, dynamic> updates) async {
    try {
      await _database.updateDocument(
        databaseId: _databaseId,
        collectionId: _usersCollectionId,
        documentId: userId,
        data: {
          ...updates,
          'updatedAt': DateTime.now().toIso8601String(),
        },
      );
    } catch (e) {
      print('Update user profile error: $e');
    }
  }

  // Repository Management
  Future<void> starRepository(
      String userId, Map<String, dynamic> repoData) async {
    try {
      await _database.createDocument(
        databaseId: _databaseId,
        collectionId: _subscriptionsCollectionId,
        documentId: ID.unique(),
        data: {
          'userId': userId,
          'type': 'repository',
          'data': repoData,
          'starredAt': DateTime.now().toIso8601String(),
          'isActive': true,
        },
      );
    } catch (e) {
      print('Star repository error: $e');
    }
  }

  Future<void> unstarRepository(String userId, String repoId) async {
    try {
      final response = await _database.listDocuments(
        databaseId: _databaseId,
        collectionId: _subscriptionsCollectionId,
        queries: [
          Query.equal('userId', userId),
          Query.equal('data.id', repoId),
          Query.equal('type', 'repository'),
        ],
      );

      for (final doc in response.documents) {
        await _database.updateDocument(
          databaseId: _databaseId,
          collectionId: _subscriptionsCollectionId,
          documentId: doc.$id,
          data: {'isActive': false},
        );
      }
    } catch (e) {
      print('Unstar repository error: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getStarredRepositories(
      String userId) async {
    try {
      final response = await _database.listDocuments(
        databaseId: _databaseId,
        collectionId: _subscriptionsCollectionId,
        queries: [
          Query.equal('userId', userId),
          Query.equal('type', 'repository'),
          Query.equal('isActive', true),
        ],
      );

      return response.documents.map((doc) => doc.data).toList();
    } catch (e) {
      print('Get starred repositories error: $e');
      return [];
    }
  }

  // Package Management
  Future<void> starPackage(
      String userId, Map<String, dynamic> packageData) async {
    try {
      await _database.createDocument(
        databaseId: _databaseId,
        collectionId: _subscriptionsCollectionId,
        documentId: ID.unique(),
        data: {
          'userId': userId,
          'type': 'package',
          'data': packageData,
          'starredAt': DateTime.now().toIso8601String(),
          'isActive': true,
        },
      );
    } catch (e) {
      print('Star package error: $e');
    }
  }

  Future<void> unstarPackage(String userId, String packageName) async {
    try {
      final response = await _database.listDocuments(
        databaseId: _databaseId,
        collectionId: _subscriptionsCollectionId,
        queries: [
          Query.equal('userId', userId),
          Query.equal('data.name', packageName),
          Query.equal('type', 'package'),
        ],
      );

      for (final doc in response.documents) {
        await _database.updateDocument(
          databaseId: _databaseId,
          collectionId: _subscriptionsCollectionId,
          documentId: doc.$id,
          data: {'isActive': false},
        );
      }
    } catch (e) {
      print('Unstar package error: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getStarredPackages(String userId) async {
    try {
      final response = await _database.listDocuments(
        databaseId: _databaseId,
        collectionId: _subscriptionsCollectionId,
        queries: [
          Query.equal('userId', userId),
          Query.equal('type', 'package'),
          Query.equal('isActive', true),
        ],
      );

      return response.documents.map((doc) => doc.data).toList();
    } catch (e) {
      print('Get starred packages error: $e');
      return [];
    }
  }

  // User Settings
  Future<Map<String, dynamic>?> getUserSettings(String userId) async {
    try {
      final response = await _database.listDocuments(
        databaseId: _databaseId,
        collectionId: _settingsCollectionId,
        queries: [
          Query.equal('userId', userId),
        ],
      );

      if (response.documents.isNotEmpty) {
        return response.documents.first.data;
      }

      return null;
    } catch (e) {
      print('Get user settings error: $e');
      return null;
    }
  }

  Future<void> saveUserSettings(
      String userId, Map<String, dynamic> settings) async {
    try {
      final existingSettings = await getUserSettings(userId);

      if (existingSettings != null) {
        await _database.updateDocument(
          databaseId: _databaseId,
          collectionId: _settingsCollectionId,
          documentId: existingSettings['\$id'],
          data: {
            ...settings,
            'updatedAt': DateTime.now().toIso8601String(),
          },
        );
      } else {
        await _database.createDocument(
          databaseId: _databaseId,
          collectionId: _settingsCollectionId,
          documentId: ID.unique(),
          data: {
            'userId': userId,
            ...settings,
            'createdAt': DateTime.now().toIso8601String(),
            'updatedAt': DateTime.now().toIso8601String(),
          },
        );
      }
    } catch (e) {
      print('Save user settings error: $e');
    }
  }

  // Enable guest mode
  Future<void> enableGuestMode({String? githubToken, String? npmToken}) async {
    await _settingsService.setGuestMode(true);
    await _settingsService.saveGuestTokens(
        githubToken: githubToken, npmToken: npmToken);
  }

  // Check if guest mode
  Future<bool> isGuestMode() async {
    return await _settingsService.isGuestMode();
  }

  // Get guest tokens
  Future<Map<String, String?>> getGuestTokens() async {
    return await _settingsService.getGuestTokens();
  }

  // Restore session from local storage
  Future<dynamic> restoreSession() async {
    final sessionData = await _settingsService.getSession();
    if (sessionData == null) return null;

    try {
      final user = await _account.get();
      return user;
    } catch (e) {
      await _settingsService.clearSession();
      return null;
    }
  }
}
