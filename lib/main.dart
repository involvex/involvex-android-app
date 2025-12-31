import 'dart:async';
import 'package:involvex_app/app.dart';
import 'package:involvex_app/services/appwrite_service.dart';
import 'package:involvex_app/utils/app_initializer.dart';
import 'package:involvex_app/data/cache/cache_manager.dart';
import 'package:involvex_app/utils/error_handler.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logger/logger.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize global error handling
  ErrorHandler.initialize();

  final logger = Logger();

  // Run app in error zone to catch all uncaught errors
  runZonedGuarded(
    () async {
      try {
        await AppInitializer.initialize();

        // Initialize offline cache with Hive
        await CacheManager.initialize();
        logger.i('Cache manager initialized');

        // Initialize Appwrite service
        final appwriteService = AppwriteService();
        await appwriteService.initialize();

        logger.i('Appwrite initialization successful');

        // Wrap app with ProviderScope for Riverpod
        runApp(const ProviderScope(child: AppwriteApp()));
      } catch (error, stackTrace) {
        logger.e('Failed to initialize app: $error');
        logger.e('Stack trace: $stackTrace');

        // Show error to user and exit gracefully
        runApp(const ProviderScope(
            child: ErrorApp(error: 'Failed to initialize')));
      }
    },
    (error, stackTrace) {
      // Catch all uncaught errors in the app
      ErrorHandler.handleError(error, stackTrace);
    },
  );
}

class ErrorApp extends StatelessWidget {
  final String error;

  const ErrorApp({super.key, required this.error});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: const Text('App Initialization Error'),
          backgroundColor: Colors.red,
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error, size: 64, color: Colors.red),
                const SizedBox(height: 16),
                const Text(
                  'Failed to initialize Appwrite',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                Text(
                  'Error: $error',
                  style: const TextStyle(fontSize: 14),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                const Text(
                  'Please check your Appwrite configuration and try again.',
                  style: TextStyle(fontSize: 14, color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
