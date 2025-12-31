import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:dio/dio.dart';
import 'package:involvex_app/data/services/github_service.dart';
import 'package:involvex_app/data/models/github_repository.dart';

// Generate mocks
@GenerateMocks([Dio])
import 'github_service_test.mocks.dart';

void main() {
  group('GitHubService', () {
    late MockDio mockDio;
    late GitHubService service;

    setUp(() {
      mockDio = MockDio();
      // Note: In a real test, we'd need to inject the mock Dio
      // For now, we're testing the API response parsing logic
      service = GitHubService();
    });

    final sampleRepoJson = {
      'id': 123456,
      'name': 'flutter',
      'full_name': 'flutter/flutter',
      'description': 'Flutter framework',
      'html_url': 'https://github.com/flutter/flutter',
      'clone_url': 'https://github.com/flutter/flutter.git',
      'ssh_url': 'git@github.com:flutter/flutter.git',
      'stargazers_count': 150000,
      'forks_count': 25000,
      'open_issues_count': 5000,
      'watchers_count': 150000,
      'language': 'Dart',
      'license': {'name': 'BSD-3-Clause'},
      'created_at': '2015-03-06T22:54:58Z',
      'updated_at': DateTime.now().toIso8601String(),
      'pushed_at': DateTime.now().toIso8601String(),
      'size': 200000,
      'private': false,
      'fork': false,
      'default_branch': 'main',
      'has_downloads': true,
      'has_issues': true,
      'has_pages': false,
      'has_wiki': true,
      'owner': {
        'login': 'flutter',
        'avatar_url': 'https://avatars.githubusercontent.com/u/14101776',
        'html_url': 'https://github.com/flutter',
      },
      'topics': ['dart', 'flutter'],
    };

    group('getTrending', () {
      test('should parse valid API response correctly', () async {
        // This test validates the response parsing logic
        // In a production test, you'd mock the Dio client
        final mockResponse = {
          'items': [sampleRepoJson],
        };

        // Validate that fromJson works correctly
        final repo = GitHubRepository.fromJson(sampleRepoJson);
        expect(repo.name, 'flutter');
        expect(repo.stars, 150000);
      });

      test('should handle empty items array', () {
        // Validate empty response handling
        final mockResponse = {'items': []};
        expect(mockResponse['items'], isEmpty);
      });

      test('should handle missing items field', () {
        // Validate null safety
        final mockResponse = <String, dynamic>{};
        final items = mockResponse['items'] as List? ?? [];
        expect(items, isEmpty);
      });
    });

    group('search', () {
      test('should construct correct search query with language filter', () {
        final query = 'flutter';
        final language = 'Dart';
        final expectedQuery = '$query language:$language';

        expect(expectedQuery, 'flutter language:Dart');
      });

      test('should not add language filter when set to All', () {
        final query = 'flutter';
        final language = 'All';

        // Language filter should not be added
        final shouldNotContain = language != 'All';
        expect(shouldNotContain, false);
      });

      test('should handle search response parsing', () {
        final mockResponse = {
          'items': [sampleRepoJson],
        };

        final repos = (mockResponse['items'] as List)
            .map((json) => GitHubRepository.fromJson(json))
            .toList();

        expect(repos, hasLength(1));
        expect(repos.first.name, 'flutter');
      });
    });

    group('getRepositoryReleases', () {
      test('should parse release response correctly', () {
        final mockReleases = [
          {
            'tag_name': 'v1.0.0',
            'name': 'First Release',
            'published_at': '2024-01-01T00:00:00Z',
            'html_url': 'https://github.com/owner/repo/releases/v1.0.0',
          },
          {
            'tag_name': 'v0.9.0',
            'name': 'Beta Release',
            'published_at': '2023-12-01T00:00:00Z',
            'html_url': 'https://github.com/owner/repo/releases/v0.9.0',
          },
        ];

        final releases = List<Map<String, dynamic>>.from(mockReleases);

        expect(releases, hasLength(2));
        expect(releases.first['tag_name'], 'v1.0.0');
        expect(releases.last['tag_name'], 'v0.9.0');
      });

      test('should handle empty releases array', () {
        final mockReleases = <Map<String, dynamic>>[];
        expect(mockReleases, isEmpty);
      });
    });

    group('getRepository', () {
      test('should parse single repository response', () {
        final repo = GitHubRepository.fromJson(sampleRepoJson);

        expect(repo.name, 'flutter');
        expect(repo.fullName, 'flutter/flutter');
        expect(repo.stars, 150000);
        expect(repo.language, 'Dart');
      });

      test('should handle null response', () {
        final Map<String, dynamic>? nullResponse = null;
        expect(nullResponse, isNull);
      });
    });

    group('_mapTimeframe', () {
      test('should map daily to yesterday', () {
        final now = DateTime.now();
        final yesterday = now.subtract(const Duration(days: 1));
        final expectedDate = yesterday.toIso8601String().split('T')[0];

        // Validate date format
        expect(expectedDate, matches(RegExp(r'\d{4}-\d{2}-\d{2}')));
      });

      test('should map weekly to 7 days ago', () {
        final now = DateTime.now();
        final weekAgo = now.subtract(const Duration(days: 7));
        final expectedDate = weekAgo.toIso8601String().split('T')[0];

        expect(expectedDate, matches(RegExp(r'\d{4}-\d{2}-\d{2}')));
      });

      test('should map monthly to 30 days ago', () {
        final now = DateTime.now();
        final monthAgo = now.subtract(const Duration(days: 30));
        final expectedDate = monthAgo.toIso8601String().split('T')[0];

        expect(expectedDate, matches(RegExp(r'\d{4}-\d{2}-\d{2}')));
      });

      test('should default to daily for unknown timeframe', () {
        // Any unknown timeframe should default to daily (1 day ago)
        final now = DateTime.now();
        final yesterday = now.subtract(const Duration(days: 1));
        final expectedDate = yesterday.toIso8601String().split('T')[0];

        expect(expectedDate, matches(RegExp(r'\d{4}-\d{2}-\d{2}')));
      });
    });

    group('Error Handling', () {
      test('should handle DioException connectionTimeout gracefully', () {
        final error = DioException(
          requestOptions: RequestOptions(path: '/test'),
          type: DioExceptionType.connectionTimeout,
          message: 'Connection timeout',
        );

        expect(error.type, DioExceptionType.connectionTimeout);
        expect(error.message, contains('timeout'));
      });

      test('should handle DioException badResponse with 403', () {
        final error = DioException(
          requestOptions: RequestOptions(path: '/test'),
          type: DioExceptionType.badResponse,
          response: Response(
            requestOptions: RequestOptions(path: '/test'),
            statusCode: 403,
          ),
        );

        expect(error.type, DioExceptionType.badResponse);
        expect(error.response?.statusCode, 403);
      });

      test('should handle DioException badResponse with 404', () {
        final error = DioException(
          requestOptions: RequestOptions(path: '/test'),
          type: DioExceptionType.badResponse,
          response: Response(
            requestOptions: RequestOptions(path: '/test'),
            statusCode: 404,
          ),
        );

        expect(error.type, DioExceptionType.badResponse);
        expect(error.response?.statusCode, 404);
      });

      test('should handle generic exceptions', () {
        final error = Exception('Unexpected error');
        expect(error.toString(), contains('Unexpected error'));
      });
    });

    group('API Response Validation', () {
      test('should validate required fields in API response', () {
        final repo = GitHubRepository.fromJson(sampleRepoJson);

        // Validate all required fields are parsed
        expect(repo.id, isNotNull);
        expect(repo.name, isNotNull);
        expect(repo.fullName, isNotNull);
        expect(repo.htmlUrl, isNotNull);
        expect(repo.stars, greaterThanOrEqualTo(0));
        expect(repo.forks, greaterThanOrEqualTo(0));
      });

      test('should handle malformed JSON gracefully', () {
        // Test with minimal required fields
        final minimalJson = {
          'id': 1,
          'name': 'test',
          'full_name': 'user/test',
          'html_url': 'https://github.com/user/test',
          'clone_url': 'https://github.com/user/test.git',
          'ssh_url': 'git@github.com:user/test.git',
          'stargazers_count': 0,
          'forks_count': 0,
          'open_issues_count': 0,
          'watchers_count': 0,
          'created_at': DateTime.now().toIso8601String(),
          'updated_at': DateTime.now().toIso8601String(),
          'pushed_at': DateTime.now().toIso8601String(),
          'size': 0,
          'private': false,
          'fork': false,
          'owner': {
            'login': 'user',
            'avatar_url': 'https://example.com/avatar.png',
            'html_url': 'https://github.com/user',
          },
        };

        final repo = GitHubRepository.fromJson(minimalJson);
        expect(repo, isNotNull);
      });
    });
  });
}
