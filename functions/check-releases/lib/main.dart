import 'dart:async';
import 'package:dart_appwrite/dart_appwrite.dart';
import 'package:dio/dio.dart';

/// Release notification checker cloud function
/// Checks subscribed repositories and packages for new releases
/// Runs every 30 minutes via scheduled execution
Future<dynamic> main(final context) async {
  final logger = context.log;

  try {
    // Initialize Appwrite client with function environment
    final client = Client()
        .setEndpoint(context.req.env['APPWRITE_FUNCTION_API_ENDPOINT'] ?? '')
        .setProject(context.req.env['APPWRITE_FUNCTION_PROJECT_ID'] ?? '')
        .setKey(context.req.env['APPWRITE_API_KEY'] ?? '');

    final databases = Databases(client);
    final databaseId = '6953b5970031f6fc49c0';

    logger('Starting release check...');

    // Get all active subscriptions
    final subscriptions = await databases.listDocuments(
      databaseId: databaseId,
      collectionId: 'subscriptions',
      queries: [
        Query.equal('isActive', true),
      ],
    );

    logger('Found ${subscriptions.documents.length} active subscriptions');

    int newReleasesFound = 0;
    int errorsEncountered = 0;

    // Process each subscription
    for (final subscription in subscriptions.documents) {
      try {
        final data = subscription.data;
        final type = data['type'] as String; // 'github' or 'npm'
        final itemId = data['itemId'] as String;
        final userId = data['userId'] as String;

        logger('Checking $type: $itemId');

        List<Map<String, dynamic>> releases = [];

        if (type == 'github') {
          // GitHub repository format: "owner/repo"
          releases = await _checkGitHubReleases(itemId, logger);
        } else if (type == 'npm') {
          // npm package format: "package-name"
          releases = await _checkNpmReleases(itemId, logger);
        }

        // Check for new releases not in release_history
        for (final release in releases) {
          final releaseVersion = release['version'] as String;

          // Check if this release already exists in history
          final existing = await databases.listDocuments(
            databaseId: databaseId,
            collectionId: 'release_history',
            queries: [
              Query.equal('itemId', itemId),
              Query.equal('version', releaseVersion),
            ],
          );

          if (existing.documents.isEmpty) {
            // New release found! Create notification and history entry
            logger('New release found: $itemId@$releaseVersion');

            // Create notification
            await databases.createDocument(
              databaseId: databaseId,
              collectionId: 'notifications',
              documentId: ID.unique(),
              data: {
                'userId': userId,
                'type': 'release',
                'title': 'New $type release: $itemId',
                'message': 'Version $releaseVersion has been released',
                'itemId': itemId,
                'version': releaseVersion,
                'releaseUrl': release['url'],
                'releaseDate': release['publishedAt'],
                'isRead': false,
                'createdAt': DateTime.now().toIso8601String(),
              },
            );

            // Create release history entry
            await databases.createDocument(
              databaseId: databaseId,
              collectionId: 'release_history',
              documentId: ID.unique(),
              data: {
                'itemId': itemId,
                'type': type,
                'version': releaseVersion,
                'releaseDate': release['publishedAt'],
                'releaseUrl': release['url'],
                'createdAt': DateTime.now().toIso8601String(),
              },
            );

            newReleasesFound++;
          }
        }
      } catch (e) {
        logger('Error processing subscription ${subscription.$id}: $e');
        errorsEncountered++;
      }
    }

    logger('Release check completed. New releases: $newReleasesFound, Errors: $errorsEncountered');

    return context.res.json({
      'success': true,
      'subscriptionsChecked': subscriptions.documents.length,
      'newReleasesFound': newReleasesFound,
      'errors': errorsEncountered,
    });
  } catch (e, stackTrace) {
    logger('Fatal error in release checker: $e');
    logger('Stack trace: $stackTrace');

    return context.res.json({
      'success': false,
      'error': e.toString(),
    }, statusCode: 500);
  }
}

/// Check GitHub repository for releases
Future<List<Map<String, dynamic>>> _checkGitHubReleases(
  String repoFullName,
  Function logger,
) async {
  try {
    final dio = Dio(BaseOptions(
      baseUrl: 'https://api.github.com',
      headers: {'Accept': 'application/vnd.github.v3+json'},
    ));

    // Get latest 5 releases
    final response = await dio.get('/repos/$repoFullName/releases',
      queryParameters: {'per_page': 5},
    );

    final releases = response.data as List;

    return releases.map((release) {
      return {
        'version': release['tag_name'] as String,
        'url': release['html_url'] as String,
        'publishedAt': release['published_at'] as String,
      };
    }).toList();
  } catch (e) {
    logger('Error fetching GitHub releases for $repoFullName: $e');
    return [];
  }
}

/// Check npm package for releases
Future<List<Map<String, dynamic>>> _checkNpmReleases(
  String packageName,
  Function logger,
) async {
  try {
    final dio = Dio(BaseOptions(baseUrl: 'https://registry.npmjs.org'));

    // Get package metadata
    final response = await dio.get('/$packageName');
    final packageData = response.data as Map<String, dynamic>;

    // Get latest 5 versions sorted by time
    final time = packageData['time'] as Map<String, dynamic>;
    final versions = time.entries
        .where((e) => e.key != 'created' && e.key != 'modified')
        .map((e) => {
              'version': e.key,
              'publishedAt': e.value as String,
            })
        .toList();

    // Sort by date descending
    versions.sort((a, b) =>
      DateTime.parse(b['publishedAt'] as String)
        .compareTo(DateTime.parse(a['publishedAt'] as String))
    );

    // Take latest 5 and add URLs
    return versions.take(5).map((v) {
      return {
        'version': v['version'] as String,
        'url': 'https://www.npmjs.com/package/$packageName/v/${v['version']}',
        'publishedAt': v['publishedAt'] as String,
      };
    }).toList();
  } catch (e) {
    logger('Error fetching npm releases for $packageName: $e');
    return [];
  }
}
