import 'package:appwrite/appwrite.dart';

class AppwriteConfig {
  // Replace with your actual Appwrite endpoint and project details
  static const String endpoint = 'https://your-appwrite-project.com/v1';
  static const String projectId = 'your-project-id';

  // Database Collections
  static const String usersCollection = 'users';
  static const String subscriptionsCollection = 'subscriptions';
  static const String releasesCollection = 'releases';
  static const String notificationsCollection = 'notifications';

  // Storage Buckets
  static const String exportsBucket = 'exports';

  static Client createClient() {
    return Client().setEndpoint(endpoint).setProject(projectId);
  }

  static Databases createDatabases(Client client) {
    return Databases(client);
  }

  static Account createAccount(Client client) {
    return Account(client);
  }

  static Storage createStorage(Client client) {
    return Storage(client);
  }

  static Functions createFunctions(Client client) {
    return Functions(client);
  }
}

// Database Schema Templates
class DatabaseSchema {
  // Users Collection Schema
  static final Map<String, dynamic> usersSchema = {
    'name': 'users',
    'type': 'document',
    'permissions': [
      'read(user)',
      'write(user)',
    ],
    'name': 'users',
    'type': 'document',
    'attributes': [
      {
        'key': 'email',
        'type': 'email',
        'required': true,
      },
      {
        'key': 'discordId',
        'type': 'string',
        'required': false,
      },
      {
        'key': 'username',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'avatarUrl',
        'type': 'string',
        'required': false,
      },
      {
        'key': 'settings',
        'type': 'object',
        'required': true,
        'default': {},
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
    'indexes': [
      {
        'key': 'email',
        'type': 'unique',
        'orders': ['ASC']
      },
      {
        'key': 'discordId',
        'type': 'unique',
        'orders': ['ASC']
      },
    ],
  };

  // Subscriptions Collection Schema
  static final Map<String, dynamic> subscriptionsSchema = {
    'name': 'subscriptions',
    'type': 'document',
    'permissions': [
      'read(user)',
      'write(user)',
    ],
    'name': 'subscriptions',
    'type': 'document',
    'attributes': [
      {
        'key': 'userId',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'itemId',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'itemName',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'itemType',
        'type': 'string',
        'required': true,
        'enum': ['github', 'npm'],
      },
      {
        'key': 'itemUrl',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'currentVersion',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'lastChecked',
        'type': 'datetime',
        'required': true,
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
    'indexes': [
      {
        'key': 'userId',
        'type': 'key',
        'orders': ['ASC']
      },
      {
        'key': 'itemType',
        'type': 'key',
        'orders': ['ASC']
      },
      {
        'key': 'itemId',
        'type': 'key',
        'orders': ['ASC']
      },
    ],
  };

  // Releases Collection Schema
  static final Map<String, dynamic> releasesSchema = {
    'name': 'releases',
    'type': 'document',
    'permissions': [
      'read(user)',
      'write(user)',
    ],
    'name': 'releases',
    'type': 'document',
    'attributes': [
      {
        'key': 'itemId',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'itemType',
        'type': 'string',
        'required': true,
        'enum': ['github', 'npm'],
      },
      {
        'key': 'version',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'title',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'description',
        'type': 'text',
        'required': false,
      },
      {
        'key': 'publishedAt',
        'type': 'datetime',
        'required': true,
      },
      {
        'key': 'prerelease',
        'type': 'boolean',
        'required': false,
        'default': false,
      },
      {
        'key': 'tagName',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'downloadUrl',
        'type': 'string',
        'required': false,
      },
      {
        'key': 'createdAt',
        'type': 'datetime',
        'required': true,
      },
    ],
    'indexes': [
      {
        'key': 'itemId',
        'type': 'key',
        'orders': ['ASC']
      },
      {
        'key': 'publishedAt',
        'type': 'key',
        'orders': ['DESC']
      },
    ],
  };

  // Notifications Collection Schema
  static final Map<String, dynamic> notificationsSchema = {
    'name': 'notifications',
    'type': 'document',
    'permissions': [
      'read(user)',
      'write(user)',
    ],
    'name': 'notifications',
    'type': 'document',
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
        'enum': ['new_release', 'daily_digest', 'weekly_summary'],
      },
      {
        'key': 'title',
        'type': 'string',
        'required': true,
      },
      {
        'key': 'message',
        'type': 'text',
        'required': true,
      },
      {
        'key': 'data',
        'type': 'object',
        'required': false,
        'default': {},
      },
      {
        'key': 'read',
        'type': 'boolean',
        'required': true,
        'default': false,
      },
      {
        'key': 'createdAt',
        'type': 'datetime',
        'required': true,
      },
    ],
    'indexes': [
      {
        'key': 'userId',
        'type': 'key',
        'orders': ['ASC']
      },
      {
        'key': 'read',
        'type': 'key',
        'orders': ['ASC']
      },
      {
        'key': 'createdAt',
        'type': 'key',
        'orders': ['DESC']
      },
    ],
  };
}
