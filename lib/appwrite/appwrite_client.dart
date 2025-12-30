import 'package:appwrite/appwrite.dart';

/// Appwrite Client Configuration
/// Manages initialization and configuration of Appwrite client
class AppwriteClient {
  static Client? _client;
  static Databases? _databases;
  static Account? _account;
  static Storage? _storage;

  /// Initialize Appwrite client with configuration
  static Future<void> initialize({
    required String endpoint,
    required String projectId,
    required bool selfSigned,
  }) async {
    _client = Client()
        .setEndpoint(endpoint)
        .setProject(projectId)
        .setSelfSigned(status: selfSigned);

    _databases = Databases(_client!);
    _account = Account(_client!);
    _storage = Storage(_client!);
  }

  /// Get Appwrite client instance
  static Client get client {
    if (_client == null) {
      throw Exception('Appwrite client not initialized. Call initialize() first.');
    }
    return _client!;
  }

  /// Get Databases instance
  static Databases get databases {
    if (_databases == null) {
      throw Exception('Appwrite databases not initialized. Call initialize() first.');
    }
    return _databases!;
  }

  /// Get Account instance
  static Account get account {
    if (_account == null) {
      throw Exception('Appwrite account not initialized. Call initialize() first.');
    }
    return _account!;
  }

  /// Get Storage instance
  static Storage get storage {
    if (_storage == null) {
      throw Exception('Appwrite storage not initialized. Call initialize() first.');
    }
    return _storage!;
  }

  /// Check if client is initialized
  static bool get isInitialized => _client != null;
}

/// Database Collection IDs
class Collections {
  static const String userSettings = 'user_settings';
  static const String subscriptions = 'subscriptions';
  static const String notifications = 'notifications';
  static const String releaseHistory = 'release_history';
}

/// Appwrite Database Configuration
class DatabaseConfig {
  /// User settings collection schema
  static Map<String, dynamic> get userSettingsSchema => {
    'name': Collections.userSettings,
    'attributes': [
      {
        'key': 'userId',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'theme',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'language',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'refreshInterval',
        'type': 'integer',
        'required': true,
      },
      {
        'key': 'notificationsEnabled',
        'type': 'boolean',
        'required': true,
      },
      {
        'key': 'dailyDigest',
        'type': 'boolean',
        'required': true,
      },
      {
        'key': 'weeklySummary',
        'type': 'boolean',
        'required': true,
      },
      {
        'key': 'pushNotifications',
        'type': 'boolean',
        'required': true,
      },
      {
        'key': 'discordId',
        'type': 'string',
        'required': false,
      },
      {
        'key': 'discordUsername',
        'type': 'string',
        'required': false,
      },
      {
        'key': 'lastSync',
        'type': 'datetime',
        'required': false,
      },
      {
        'key': 'createdAt',
        'type': 'datetime',
        'required': true,
      },
      {
        'key': 'updatedAt',
        'type': 'datetime',
        'required': true,
      },
    ],
  };

  /// Subscriptions collection schema
  static Map<String, dynamic> get subscriptionsSchema => {
    'name': Collections.subscriptions,
    'attributes': [
      {
        'key': 'userId',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'type',
        'type': 'string',
        'required': true,
        'enum': ['github', 'npmjs'],
      },
      {
        'key': 'name',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'fullName',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'description',
        'type': 'string',
        'required': false,
      },
      {
        'key': 'url',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'author',
        'type': 'string',
        'required': false,
      },
      {
        'key': 'language',
        'type': 'string',
        'required': false,
      },
      {
        'key': 'stars',
        'type': 'integer',
        'required': true,
      },
      {
        'key': 'license',
        'type': 'string',
        'required': false,
      },
      {
        'key': 'lastUpdated',
        'type': 'datetime',
        'required': true,
      },
      {
        'key': 'latestVersion',
        'type': 'string',
        'required': false,
      },
      {
        'key': 'packageManager',
        'type': 'string',
        'required': false,
      },
      {
        'key': 'tags',
        'type': 'array',
        'required': false,
      },
      {
        'key': 'createdAt',
        'type': 'datetime',
        'required': true,
      },
      {
        'key': 'updatedAt',
        'type': 'datetime',
        'required': true,
      },
    ],
  };

  /// Notifications collection schema
  static Map<String, dynamic> get notificationsSchema => {
    'name': Collections.notifications,
    'attributes': [
      {
        'key': 'userId',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'type',
        'type': 'string',
        'required': true,
        'enum': ['release', 'daily_digest', 'weekly_summary'],
      },
      {
        'key': 'title',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'message',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'data',
        'type': 'json',
        'required': false,
      },
      {
        'key': 'read',
        'type': 'boolean',
        'required': true,
      },
      {
        'key': 'createdAt',
        'type': 'datetime',
        'required': true,
      },
    ],
  };

  /// Release history collection schema
  static Map<String, dynamic> get releaseHistorySchema => {
    'name': Collections.releaseHistory,
    'attributes': [
      {
        'key': 'subscriptionId',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'version',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'releaseDate',
        'type': 'datetime',
        'required': true,
      },
      {
        'key': 'description',
        'type': 'string',
        'required': false,
      },
      {
        'key': 'url',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'changelog',
        'type': 'string',
        'required': false,
      },
      {
        'key': 'createdAt',
        'type': 'datetime',
        'required': true,
      },
    ],
  };
}

/// Database permissions configuration
class DatabasePermissions {
  /// Read permissions for all collections
  static List<String> get readPermissions => [
    'role:guests',
    'role:users',
  ];

  /// Write permissions for authenticated users only
  static List<String> get writePermissions => [
    'role:users',
  ];

  /// Create collection with permissions
  static Map<String, dynamic> createCollectionConfig({
    required String name,
    required List<Map<String, dynamic>> attributes,
    List<String>? read,
    List<String>? write,
  }) {
    return {
      'name': name,
      'attributes': attributes,
      'read': read ?? readPermissions,
      'write': write ?? writePermissions,
    };
  }
}