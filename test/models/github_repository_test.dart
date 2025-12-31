import 'package:flutter_test/flutter_test.dart';
import 'package:involvex_app/data/models/github_repository.dart';

void main() {
  group('GitHubRepository', () {
    final now = DateTime.now();
    final yesterday = now.subtract(const Duration(days: 1));

    final sampleJson = {
      'id': 123456,
      'name': 'flutter',
      'full_name': 'flutter/flutter',
      'description': 'Flutter makes it easy to build beautiful apps',
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
      'updated_at': now.toIso8601String(),
      'pushed_at': yesterday.toIso8601String(),
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
      'topics': ['dart', 'flutter', 'mobile', 'android', 'ios'],
    };

    group('fromJson', () {
      test('should parse valid JSON correctly', () {
        final repo = GitHubRepository.fromJson(sampleJson);

        expect(repo.id, '123456');
        expect(repo.name, 'flutter');
        expect(repo.fullName, 'flutter/flutter');
        expect(repo.description, 'Flutter makes it easy to build beautiful apps');
        expect(repo.htmlUrl, 'https://github.com/flutter/flutter');
        expect(repo.stars, 150000);
        expect(repo.forks, 25000);
        expect(repo.issues, 5000);
        expect(repo.watchers, 150000);
        expect(repo.language, 'Dart');
        expect(repo.license, 'BSD-3-Clause');
        expect(repo.isPrivate, false);
        expect(repo.isFork, false);
        expect(repo.ownerLogin, 'flutter');
        expect(repo.topics, 'dart,flutter,mobile,android,ios');
      });

      test('should handle missing optional fields', () {
        final minimalJson = {
          'id': 1,
          'name': 'test',
          'full_name': 'user/test',
          'description': null,
          'html_url': 'https://github.com/user/test',
          'clone_url': 'https://github.com/user/test.git',
          'ssh_url': 'git@github.com:user/test.git',
          'stargazers_count': 10,
          'forks_count': 2,
          'open_issues_count': 1,
          'watchers_count': 10,
          'language': null,
          'license': null,
          'created_at': now.toIso8601String(),
          'updated_at': now.toIso8601String(),
          'pushed_at': now.toIso8601String(),
          'size': 100,
          'private': false,
          'fork': false,
          'owner': {
            'login': 'user',
            'avatar_url': 'https://example.com/avatar.png',
            'html_url': 'https://github.com/user',
          },
        };

        final repo = GitHubRepository.fromJson(minimalJson);

        expect(repo.description, '');
        expect(repo.language, 'Unknown');
        expect(repo.license, null);
        expect(repo.topics, null);
      });

      test('should handle null values gracefully', () {
        final jsonWithNulls = {
          ...sampleJson,
          'description': null,
          'language': null,
          'license': null,
          'topics': null,
        };

        final repo = GitHubRepository.fromJson(jsonWithNulls);

        expect(repo.description, '');
        expect(repo.language, 'Unknown');
        expect(repo.license, null);
        expect(repo.topics, null);
      });
    });

    group('_calculateTrendingScore', () {
      test('should calculate score based on stars, forks, and activity', () {
        final json = {
          ...sampleJson,
          'stargazers_count': 1000,
          'forks_count': 200,
          'pushed_at': now.subtract(const Duration(hours: 12)).toIso8601String(),
        };

        final repo = GitHubRepository.fromJson(json);

        // Expected: (1000 * 0.6) + (200 * 0.3) + (10.0 * 0.1) = 600 + 60 + 1 = 661
        expect(repo.trendingScore, 661.0);
      });

      test('should give higher score for more recent activity', () {
        final recentJson = {
          ...sampleJson,
          'stargazers_count': 100,
          'forks_count': 10,
          'pushed_at': now.toIso8601String(), // Today
        };

        final oldJson = {
          ...sampleJson,
          'stargazers_count': 100,
          'forks_count': 10,
          'pushed_at': now.subtract(const Duration(days: 100)).toIso8601String(),
        };

        final recentRepo = GitHubRepository.fromJson(recentJson);
        final oldRepo = GitHubRepository.fromJson(oldJson);

        expect(recentRepo.trendingScore > oldRepo.trendingScore, true);
      });
    });

    group('_calculateRecentActivity', () {
      test('should return 10.0 for activity within 1 day', () {
        final json = {
          ...sampleJson,
          'pushed_at': now.toIso8601String(),
        };

        final repo = GitHubRepository.fromJson(json);
        // Score formula: (stars * 0.6) + (forks * 0.3) + (activity * 0.1)
        // Activity should be 10.0
        final expectedBase = (150000 * 0.6) + (25000 * 0.3) + (10.0 * 0.1);
        expect(repo.trendingScore, expectedBase);
      });

      test('should return 8.0 for activity within 7 days', () {
        final json = {
          ...sampleJson,
          'pushed_at': now.subtract(const Duration(days: 5)).toIso8601String(),
        };

        final repo = GitHubRepository.fromJson(json);
        final expectedBase = (150000 * 0.6) + (25000 * 0.3) + (8.0 * 0.1);
        expect(repo.trendingScore, expectedBase);
      });

      test('should return 0.0 for null pushed_at', () {
        final json = {
          ...sampleJson,
          'pushed_at': null,
        };

        final repo = GitHubRepository.fromJson(json);
        // Activity should be 0.0
        final expectedBase = (150000 * 0.6) + (25000 * 0.3) + (0.0 * 0.1);
        expect(repo.trendingScore, expectedBase);
      });
    });

    group('copyWith', () {
      test('should create a copy with updated fields', () {
        final original = GitHubRepository.fromJson(sampleJson);
        final copy = original.copyWith(
          stars: 200000,
          isSubscribed: true,
        );

        expect(copy.stars, 200000);
        expect(copy.isSubscribed, true);
        expect(copy.name, original.name); // Unchanged
        expect(copy.fullName, original.fullName); // Unchanged
      });

      test('should return identical copy when no fields updated', () {
        final original = GitHubRepository.fromJson(sampleJson);
        final copy = original.copyWith();

        expect(copy.id, original.id);
        expect(copy.name, original.name);
        expect(copy.stars, original.stars);
      });
    });

    group('Getters', () {
      test('formattedSize should format bytes correctly', () {
        final repoKB = GitHubRepository.fromJson({...sampleJson, 'size': 500});
        final repoMB = GitHubRepository.fromJson({...sampleJson, 'size': 2048});
        final repoGB =
            GitHubRepository.fromJson({...sampleJson, 'size': 2097152});

        expect(repoKB.formattedSize, '500KB');
        expect(repoMB.formattedSize, '2.0MB');
        expect(repoGB.formattedSize, '2.0GB');
      });

      test('timeAgo should return correct relative time', () {
        final justNow = GitHubRepository.fromJson({
          ...sampleJson,
          'updated_at': now.toIso8601String(),
        });

        final hoursAgo = GitHubRepository.fromJson({
          ...sampleJson,
          'updated_at': now.subtract(const Duration(hours: 5)).toIso8601String(),
        });

        final daysAgo = GitHubRepository.fromJson({
          ...sampleJson,
          'updated_at': now.subtract(const Duration(days: 10)).toIso8601String(),
        });

        expect(justNow.timeAgo, 'Just now');
        expect(hoursAgo.timeAgo, '5 hours ago');
        expect(daysAgo.timeAgo, '10 days ago');
      });

      test('languageColor should return correct hex color', () {
        final dartRepo =
            GitHubRepository.fromJson({...sampleJson, 'language': 'Dart'});
        final pythonRepo =
            GitHubRepository.fromJson({...sampleJson, 'language': 'Python'});
        final unknownRepo =
            GitHubRepository.fromJson({...sampleJson, 'language': 'Unknown'});

        expect(dartRepo.languageColor, '#00B4AB');
        expect(pythonRepo.languageColor, '#3572A5');
        expect(unknownRepo.languageColor, '#cccccc');
      });

      test('hasRecentActivity should check last 7 days', () {
        final recent = GitHubRepository.fromJson({
          ...sampleJson,
          'pushed_at': now.subtract(const Duration(days: 3)).toIso8601String(),
        });

        final old = GitHubRepository.fromJson({
          ...sampleJson,
          'pushed_at': now.subtract(const Duration(days: 30)).toIso8601String(),
        });

        expect(recent.hasRecentActivity, true);
        expect(old.hasRecentActivity, false);
      });

      test('releaseInfo should return formatted release info', () {
        final noRelease = GitHubRepository.fromJson(sampleJson);
        final tagOnly = noRelease.copyWith(latestReleaseTag: 'v1.0.0');
        final withName = tagOnly.copyWith(latestReleaseName: 'First Release');

        expect(noRelease.releaseInfo, 'No releases');
        expect(tagOnly.releaseInfo, 'vv1.0.0');
        expect(withName.releaseInfo, 'v1.0.0 - First Release');
      });
    });

    group('Serialization', () {
      test('toJson should serialize all fields', () {
        final repo = GitHubRepository.fromJson(sampleJson);
        final json = repo.toJson();

        expect(json['id'], '123456');
        expect(json['name'], 'flutter');
        expect(json['stars'], 150000);
        expect(json['language'], 'Dart');
        expect(json['isSubscribed'], false);
      });

      test('should handle round-trip serialization', () {
        final original = GitHubRepository.fromJson(sampleJson);
        final json = original.toJson();

        expect(json['id'], original.id);
        expect(json['name'], original.name);
        expect(json['stars'], original.stars);
      });
    });

    group('Equality', () {
      test('should be equal if IDs match', () {
        final repo1 = GitHubRepository.fromJson(sampleJson);
        final repo2 = GitHubRepository.fromJson(sampleJson);

        expect(repo1 == repo2, true);
        expect(repo1.hashCode, repo2.hashCode);
      });

      test('should not be equal if IDs differ', () {
        final repo1 = GitHubRepository.fromJson(sampleJson);
        final repo2 = GitHubRepository.fromJson({...sampleJson, 'id': 999});

        expect(repo1 == repo2, false);
      });
    });
  });
}
