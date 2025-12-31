import 'package:appwrite/appwrite.dart';
import 'package:involvex_app/config/environment.dart';
import 'package:involvex_app/appwrite/appwrite_client.dart';
import 'package:logger/logger.dart';

/// Appwrite Service for managing database operations and authentication
class AppwriteService {
  final Logger _logger = Logger();
  bool _isInitialized = false;

  /// Initialize Appwrite client and verify connection
  Future<void> initialize() async {
    try {
      _logger.i('Initializing Appwrite client...');

      // Initialize the Appwrite client
      await AppwriteClient.initialize(
        endpoint: Environment.appwriteEndpoint,
        projectId: Environment.appwriteProjectId,
        selfSigned: false, // Set to true if using self-signed certificates
      );

      _isInitialized = true;
      _logger.i('Appwrite client initialized successfully');

      // Test the connection
      await _testConnection();
    } catch (error, stackTrace) {
      _logger.e('Failed to initialize Appwrite client: $error');
      _logger.e('Stack trace: $stackTrace');
      _isInitialized = false;
      rethrow;
    }
  }

  /// Test the Appwrite connection
  Future<void> _testConnection() async {
    try {
      _logger.i('Testing Appwrite connection...');

      // Try to get the current user to test the connection
      final account = AppwriteClient.account;
      final user = await account.get();

      _logger.i('Appwrite connection successful. User: ${user.name}');
    } catch (error) {
      _logger.w(
          'Appwrite connection test failed (this is expected for unauthenticated users): $error');
      // This is expected for unauthenticated users, so we don't rethrow
    }
  }

  /// Check if Appwrite is initialized
  bool get isInitialized => _isInitialized;

  /// Get current user information
  Future<Map<String, dynamic>?> getCurrentUser() async {
    try {
      if (!_isInitialized) {
        throw Exception('Appwrite not initialized. Call initialize() first.');
      }

      final account = AppwriteClient.account;
      final user = await account.get();

      return {
        'id': user.$id,
        'name': user.name,
        'email': user.email,
        'status': user.status,
        'emailVerified': user.emailVerification,
      };
    } catch (error) {
      _logger.e('Failed to get current user: $error');
      return null;
    }
  }

  /// Create a new user account
  Future<Map<String, dynamic>> createUser({
    required String email,
    required String password,
    required String name,
  }) async {
    try {
      if (!_isInitialized) {
        throw Exception('Appwrite not initialized. Call initialize() first.');
      }

      final account = AppwriteClient.account;
      final user = await account.create(
        userId: 'unique()',
        email: email,
        password: password,
        name: name,
      );

      _logger.i('User created successfully: ${user.name}');
      return {
        'id': user.$id,
        'name': user.name,
        'email': user.email,
      };
    } catch (error) {
      _logger.e('Failed to create user: $error');
      rethrow;
    }
  }

  /// Login user with email and password
  Future<Map<String, dynamic>> loginUser({
    required String email,
    required String password,
  }) async {
    try {
      if (!_isInitialized) {
        throw Exception('Appwrite not initialized. Call initialize() first.');
      }

      final account = AppwriteClient.account;
      final session = await account.create(
        userId: 'unique()',
        email: email,
        password: password,
      );

      _logger.i('User logged in successfully');
      return {
        'userId': session.$id,
        'name': session.name,
        'email': session.email,
      };
    } catch (error) {
      _logger.e('Failed to login user: $error');
      rethrow;
    }
  }

  /// Logout current user
  Future<void> logoutUser() async {
    try {
      if (!_isInitialized) {
        throw Exception('Appwrite not initialized. Call initialize() first.');
      }

      final account = AppwriteClient.account;
      await account.deleteSession(sessionId: 'current');

      _logger.i('User logged out successfully');
    } catch (error) {
      _logger.e('Failed to logout user: $error');
      rethrow;
    }
  }

  /// Check if user is currently logged in
  Future<bool> isUserLoggedIn() async {
    try {
      if (!_isInitialized) {
        return false;
      }

      final account = AppwriteClient.account;
      final user = await account.get();

      return user.$id.isNotEmpty;
    } catch (error) {
      _logger.w('User not logged in: $error');
      return false;
    }
  }

  /// Get database instance
  Databases getDatabase() {
    if (!_isInitialized) {
      throw Exception('Appwrite not initialized. Call initialize() first.');
    }
    return AppwriteClient.databases;
  }

  /// Get storage instance
  Storage getStorage() {
    if (!_isInitialized) {
      throw Exception('Appwrite not initialized. Call initialize() first.');
    }
    return AppwriteClient.storage;
  }

  /// Get account instance
  Account getAccount() {
    if (!_isInitialized) {
      throw Exception('Appwrite not initialized. Call initialize() first.');
    }
    return AppwriteClient.account;
  }

  /// Get client instance
  Client getClient() {
    if (!_isInitialized) {
      throw Exception('Appwrite not initialized. Call initialize() first.');
    }
    return AppwriteClient.client;
  }
}
