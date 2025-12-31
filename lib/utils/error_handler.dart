import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:logger/logger.dart';

/// Global error handler for the application
/// Handles both Flutter framework errors and uncaught exceptions
class ErrorHandler {
  static final Logger _logger = Logger(
    printer: PrettyPrinter(
      methodCount: 2,
      errorMethodCount: 8,
      lineLength: 120,
      colors: true,
      printEmojis: true,
      printTime: true,
    ),
  );

  /// Initialize global error handling
  static void initialize() {
    // Catch Flutter framework errors
    FlutterError.onError = (FlutterErrorDetails details) {
      handleFlutterError(details);
    };

    // Catch platform dispatcher errors
    PlatformDispatcher.instance.onError = (error, stack) {
      handleError(error, stack);
      return true;
    };
  }

  /// Handle Flutter framework errors
  static void handleFlutterError(FlutterErrorDetails details) {
    _logger.e(
      'Flutter Error',
      error: details.exception,
      stackTrace: details.stack,
    );

    // In production, you might want to report to crash analytics
    if (kReleaseMode) {
      // TODO: Report to crash analytics (Firebase Crashlytics, Sentry, etc.)
      // Example: FirebaseCrashlytics.instance.recordFlutterFatalError(details);
    } else {
      // In debug mode, print to console with formatting
      FlutterError.presentError(details);
    }
  }

  /// Handle general Dart errors
  static void handleError(Object error, StackTrace stackTrace) {
    _logger.e(
      'Uncaught Error',
      error: error,
      stackTrace: stackTrace,
    );

    // In production, you might want to report to crash analytics
    if (kReleaseMode) {
      // TODO: Report to crash analytics
      // Example: FirebaseCrashlytics.instance.recordError(error, stackTrace);
    }
  }

  /// Handle network errors
  static void handleNetworkError(Object error, {String? context}) {
    _logger.w(
      'Network Error${context != null ? " ($context)" : ""}',
      error: error,
    );

    // Could implement retry logic, offline mode, etc.
  }

  /// Handle API errors
  static void handleApiError(
    int? statusCode,
    String? message, {
    String? context,
  }) {
    _logger.w(
      'API Error${context != null ? " ($context)" : ""}',
      error: 'Status: $statusCode, Message: $message',
    );

    // Could implement specific handling for different status codes
    switch (statusCode) {
      case 401:
        // Unauthorized - redirect to login
        _logger.i('User unauthorized, should redirect to login');
        break;
      case 403:
        // Forbidden - show permission error
        _logger.i('Permission denied');
        break;
      case 404:
        // Not found
        _logger.i('Resource not found');
        break;
      case 429:
        // Rate limit exceeded
        _logger.i('Rate limit exceeded');
        break;
      case 500:
      case 502:
      case 503:
        // Server errors
        _logger.i('Server error occurred');
        break;
      default:
        _logger.i('Unknown API error');
    }
  }

  /// Handle cache errors
  static void handleCacheError(Object error, {String? context}) {
    _logger.w(
      'Cache Error${context != null ? " ($context)" : ""}',
      error: error,
    );

    // Cache errors are usually non-fatal, log and continue
  }

  /// Handle authentication errors
  static void handleAuthError(Object error, {String? context}) {
    _logger.w(
      'Authentication Error${context != null ? " ($context)" : ""}',
      error: error,
    );

    // Could trigger logout, refresh token, etc.
  }

  /// Handle database errors
  static void handleDatabaseError(Object error, {String? context}) {
    _logger.e(
      'Database Error${context != null ? " ($context)" : ""}',
      error: error,
    );

    // Database errors might need data recovery or migration
  }

  /// Show error dialog to user
  static void showErrorDialog(
    BuildContext context, {
    required String title,
    required String message,
    VoidCallback? onRetry,
  }) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          if (onRetry != null)
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                onRetry();
              },
              child: const Text('Retry'),
            ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  /// Show error snackbar to user
  static void showErrorSnackbar(
    BuildContext context, {
    required String message,
    Duration duration = const Duration(seconds: 4),
    SnackBarAction? action,
  }) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: duration,
        action: action,
        backgroundColor: Colors.red[700],
      ),
    );
  }

  /// Get user-friendly error message
  static String getUserFriendlyMessage(Object error) {
    if (error is TimeoutException) {
      return 'The operation took too long. Please check your connection and try again.';
    } else if (error is FormatException) {
      return 'The data received was in an unexpected format.';
    } else if (error.toString().contains('SocketException')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.toString().contains('HandshakeException')) {
      return 'Secure connection failed. Please try again.';
    } else if (error.toString().contains('HttpException')) {
      return 'Network error occurred. Please try again.';
    } else {
      return 'An unexpected error occurred. Please try again.';
    }
  }

  /// Log debug message
  static void debug(String message, {Object? error, StackTrace? stackTrace}) {
    _logger.d(message, error: error, stackTrace: stackTrace);
  }

  /// Log info message
  static void info(String message, {Object? error, StackTrace? stackTrace}) {
    _logger.i(message, error: error, stackTrace: stackTrace);
  }

  /// Log warning message
  static void warning(String message, {Object? error, StackTrace? stackTrace}) {
    _logger.w(message, error: error, stackTrace: stackTrace);
  }

  /// Log error message
  static void error(String message, {Object? error, StackTrace? stackTrace}) {
    _logger.e(message, error: error, stackTrace: stackTrace);
  }

  /// Log fatal error message
  static void fatal(String message, {Object? error, StackTrace? stackTrace}) {
    _logger.f(message, error: error, stackTrace: stackTrace);
  }
}
