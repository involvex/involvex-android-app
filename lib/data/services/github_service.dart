import 'package:dio/dio.dart';
import '../models/github_repository.dart';
import 'http_client.dart';

/// GitHub API Service for fetching repository data
class GitHubService {
  final Dio _dio = HttpClient.createGitHubClient();

  /// Fetch trending repositories from GitHub
  ///
  /// Uses GitHub search API with date filter to get trending repos
  /// [timeframe] can be 'daily', 'weekly', or 'monthly'
  /// [minStars] minimum number of stars (default: 10)
  Future<List<GitHubRepository>> getTrending(
    String timeframe, {
    int minStars = 10,
  }) async {
    try {
      final since = _mapTimeframe(timeframe);

      final response = await _dio.get(
        '/search/repositories',
        queryParameters: {
          'q': 'created:>$since stars:>$minStars',
          'sort': 'stars',
          'order': 'desc',
          'per_page': 50,
        },
      );

      if (response.statusCode == 200 && response.data != null) {
        final items = response.data['items'] as List? ?? [];
        return items
            .map((json) =>
                GitHubRepository.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      return [];
    } on DioException catch (e) {
      _handleError(e);
      return [];
    } catch (e) {
      print('Unexpected error fetching trending repos: $e');
      return [];
    }
  }

  /// Search repositories by query
  ///
  /// [query] - Search query string
  /// [language] - Optional language filter (e.g., 'JavaScript', 'Python')
  /// [sort] - Sort option ('stars', 'forks', 'updated', etc.)
  /// [perPage] - Number of results per page (default: 30)
  Future<List<GitHubRepository>> search({
    required String query,
    String? language,
    String sort = 'best-match',
    int perPage = 30,
  }) async {
    try {
      String searchQuery = query;
      if (language != null && language != 'All') {
        searchQuery += ' language:$language';
      }

      final response = await _dio.get(
        '/search/repositories',
        queryParameters: {
          'q': searchQuery,
          'sort': sort == 'best-match' ? null : sort,
          'per_page': perPage,
        },
      );

      if (response.statusCode == 200 && response.data != null) {
        final items = response.data['items'] as List? ?? [];
        return items
            .map((json) =>
                GitHubRepository.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      return [];
    } on DioException catch (e) {
      _handleError(e);
      return [];
    } catch (e) {
      print('Unexpected error searching repos: $e');
      return [];
    }
  }

  /// Get repository releases
  ///
  /// [owner] - Repository owner
  /// [repo] - Repository name
  Future<List<Map<String, dynamic>>> getRepositoryReleases(
    String owner,
    String repo,
  ) async {
    try {
      final response = await _dio.get('/repos/$owner/$repo/releases');

      if (response.statusCode == 200 && response.data != null) {
        return List<Map<String, dynamic>>.from(response.data as List);
      }

      return [];
    } on DioException catch (e) {
      _handleError(e);
      return [];
    } catch (e) {
      print('Unexpected error fetching releases: $e');
      return [];
    }
  }

  /// Get repository details
  ///
  /// [owner] - Repository owner
  /// [repo] - Repository name
  Future<GitHubRepository?> getRepository(String owner, String repo) async {
    try {
      final response = await _dio.get('/repos/$owner/$repo');

      if (response.statusCode == 200 && response.data != null) {
        return GitHubRepository.fromJson(response.data as Map<String, dynamic>);
      }

      return null;
    } on DioException catch (e) {
      _handleError(e);
      return null;
    } catch (e) {
      print('Unexpected error fetching repository: $e');
      return null;
    }
  }

  /// Map timeframe string to date string for GitHub API
  String _mapTimeframe(String timeframe) {
    final now = DateTime.now();
    switch (timeframe.toLowerCase()) {
      case 'daily':
        return now.toIso8601String().split('T')[0];
      case 'weekly':
        return now
            .subtract(const Duration(days: 7))
            .toIso8601String()
            .split('T')[0];
      case 'monthly':
        return now
            .subtract(const Duration(days: 30))
            .toIso8601String()
            .split('T')[0];
      default:
        return now.toIso8601String().split('T')[0];
    }
  }

  /// Handle Dio errors
  void _handleError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        print('GitHub API Timeout error: ${error.message}');
        break;
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        if (statusCode == 403) {
          print('GitHub API rate limit exceeded');
        } else if (statusCode == 404) {
          print('GitHub API resource not found');
        } else {
          print('GitHub API error: $statusCode - ${error.response?.data}');
        }
        break;
      case DioExceptionType.cancel:
        print('GitHub API request cancelled');
        break;
      default:
        print('GitHub API connection error: ${error.message}');
    }
  }
}
