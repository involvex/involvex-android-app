import 'package:dio/dio.dart';
import '../models/npm_package.dart';
import 'http_client.dart';

/// npm Registry API Service for fetching package data
class NpmService {
  final Dio _dio = HttpClient.createNpmClient();

  /// Fetch trending npm packages
  ///
  /// Uses npm registry search API with quality/popularity scoring
  /// [timeframe] - Not used by npm API, but kept for consistency
  Future<List<NpmPackage>> getTrending(String timeframe) async {
    try {
      final response = await _dio.get(
        '/-/v1/search',
        queryParameters: {
          'text': 'boost-exact:false',
          'size': 50,
          'quality': 0.8,
          'popularity': 0.9,
          'maintenance': 0.5,
        },
      );

      if (response.statusCode == 200 && response.data != null) {
        final results = response.data['objects'] as List? ?? [];
        return results.map((item) {
          final package = item['package'] as Map<String, dynamic>;
          return NpmPackage.fromJson(package);
        }).toList();
      }

      return [];
    } on DioException catch (e) {
      _handleError(e);
      return [];
    } catch (e) {
      print('Unexpected error fetching trending packages: $e');
      return [];
    }
  }

  /// Search npm packages
  ///
  /// [query] - Search query string
  /// [size] - Number of results (default: 30)
  Future<List<NpmPackage>> search({
    required String query,
    int size = 30,
  }) async {
    try {
      final response = await _dio.get(
        '/-/v1/search',
        queryParameters: {
          'text': query,
          'size': size,
        },
      );

      if (response.statusCode == 200 && response.data != null) {
        final results = response.data['objects'] as List? ?? [];
        return results.map((item) {
          final package = item['package'] as Map<String, dynamic>;
          return NpmPackage.fromJson(package);
        }).toList();
      }

      return [];
    } on DioException catch (e) {
      _handleError(e);
      return [];
    } catch (e) {
      print('Unexpected error searching packages: $e');
      return [];
    }
  }

  /// Get package details
  ///
  /// [packageName] - Full package name (e.g., 'react', '@angular/core')
  Future<NpmPackage?> getPackageDetails(String packageName) async {
    try {
      // URL encode the package name to handle scoped packages
      final encodedName = Uri.encodeComponent(packageName);

      final response = await _dio.get('/$encodedName');

      if (response.statusCode == 200 && response.data != null) {
        return NpmPackage.fromJson(response.data as Map<String, dynamic>);
      }

      return null;
    } on DioException catch (e) {
      _handleError(e);
      return null;
    } catch (e) {
      print('Unexpected error fetching package details: $e');
      return null;
    }
  }

  /// Get package downloads statistics
  ///
  /// [packageName] - Package name
  /// [period] - 'last-day', 'last-week', or 'last-month'
  Future<Map<String, dynamic>?> getDownloadStats(
    String packageName, {
    String period = 'last-week',
  }) async {
    try {
      final downloadsApiUrl = 'https://api.npmjs.org';
      final response = await Dio().get(
        '$downloadsApiUrl/downloads/point/$period/$packageName',
      );

      if (response.statusCode == 200 && response.data != null) {
        return response.data as Map<String, dynamic>;
      }

      return null;
    } on DioException catch (e) {
      print('Error fetching download stats: ${e.message}');
      return null;
    } catch (e) {
      print('Unexpected error fetching download stats: $e');
      return null;
    }
  }

  /// Handle Dio errors
  void _handleError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        print('npm API Timeout error: ${error.message}');
        break;
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        if (statusCode == 404) {
          print('npm package not found');
        } else {
          print('npm API error: $statusCode - ${error.response?.data}');
        }
        break;
      case DioExceptionType.cancel:
        print('npm API request cancelled');
        break;
      default:
        print('npm API connection error: ${error.message}');
    }
  }
}
