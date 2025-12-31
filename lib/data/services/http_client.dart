import 'package:dio/dio.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';
import '../../config/environment.dart';

/// HTTP Client Factory for creating configured Dio instances
class HttpClient {
  /// Create a Dio instance configured for GitHub API
  static Dio createGitHubClient() {
    final dio = Dio(
      BaseOptions(
        baseUrl: Environment.githubApiBaseUrl,
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          // Token added from user settings if configured
          if (Environment.githubToken.isNotEmpty)
            'Authorization': 'token ${Environment.githubToken}',
        },
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        validateStatus: (status) {
          // Accept all status codes < 500 for custom error handling
          return status != null && status < 500;
        },
      ),
    );

    // Add logging interceptor in debug mode
    dio.interceptors.add(
      PrettyDioLogger(
        requestHeader: true,
        requestBody: true,
        responseBody: false, // Too verbose for large responses
        error: true,
        compact: false,
      ),
    );

    return dio;
  }

  /// Create a Dio instance configured for npm registry API
  static Dio createNpmClient() {
    final dio = Dio(
      BaseOptions(
        baseUrl: Environment.npmApiBaseUrl,
        headers: {
          'Accept': 'application/json',
        },
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        validateStatus: (status) {
          return status != null && status < 500;
        },
      ),
    );

    // Add logging interceptor
    dio.interceptors.add(
      PrettyDioLogger(
        requestHeader: true,
        requestBody: true,
        responseBody: false,
        error: true,
        compact: false,
      ),
    );

    return dio;
  }

  /// Create a generic Dio instance with basic configuration
  static Dio createGenericClient({
    String? baseUrl,
    Map<String, String>? headers,
    Duration? timeout,
  }) {
    final dio = Dio(
      BaseOptions(
        baseUrl: baseUrl ?? '',
        headers: headers ?? {},
        connectTimeout: timeout ?? const Duration(seconds: 30),
        receiveTimeout: timeout ?? const Duration(seconds: 30),
      ),
    );

    dio.interceptors.add(
      PrettyDioLogger(
        requestHeader: true,
        requestBody: true,
        responseBody: false,
        error: true,
        compact: false,
      ),
    );

    return dio;
  }
}
