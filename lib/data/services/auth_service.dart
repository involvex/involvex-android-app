import 'package:appwrite/appwrite.dart';
import '../../config/environment.dart';

class AuthService {
  late final Account _account;
  late final Databases _database;
  final String _databaseId = Environment.appwriteDatabaseId;
  
  // Collections
  static const String _usersCollectionId = 'users';
  static const String _repositoriesCollectionId = 'repositories';
  static const String _packagesCollectionId = 'packages';
  static const String _subscriptionsCollectionId = 'subscriptions';
  static const String _settingsCollectionId = 'user_settings';
  
  AuthService() {
    final client = Client()
        .setEndpoint(Environment.appwriteEndpoint)
        .setProject(Environment.appwriteProjectId);
    
    _account = Account(client);
    _database = Databases(client);
  }

  // Discord OAuth2 Authentication
  Future<dynamic> signInWithDiscord() async {
    try {
      // Start Discord OAuth2 flow
      final session = await _account.createOAuth2Session(
        provider: 'discord',
        success: '${Environment.appUrl}/auth/callback',
        failure: '${Environment.appUrl}/auth/failure',
      );
      
      // Get user information
      final user = await _account.get();
      return user;
    } catch (e) {
      print('Discord sign in error: $e');
      return null;
    }
  }

  // Email/Password authentication (fallback)
  Future<dynamic> signInWithEmail(String email, String password) async {
    try {
      final session = await _account.createEmailPasswordSession(
        email: email,
        password: password,
      );
      
      final user = await _account.get();
      return user;
    } catch (e) {
      print('Email sign in error: $e');
      return null;
    }
  }

  // Sign up with email
  Future<dynamic> signUpWithEmail(String email, String password, {String? name}) async {
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
    } catch (e) {
      print('Sign out error: $e');
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

  Future<void> createUserProfile(String userId, Map<String, dynamic> userData) async {
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

  Future<void> updateUserProfile(String userId, Map<String, dynamic> updates) async {
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
  Future<void> starRepository(String userId, Map<String, dynamic> repoData) async {
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

  Future<List<Map<String, dynamic>>> getStarredRepositories(String userId) async {
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
  Future<void> starPackage(String userId, Map<String, dynamic> packageData) async {
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

  Future<void> saveUserSettings(String userId, Map<String, dynamic> settings) async {
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
}