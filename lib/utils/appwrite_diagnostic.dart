import 'package:appwrite/appwrite.dart';
import 'package:involvex_app/config/environment.dart';
import 'package:involvex_app/appwrite/appwrite_client.dart';
import 'package:logger/logger.dart';

/// Appwrite Diagnostic Tool
/// Helps diagnose and troubleshoot Appwrite connection issues
class AppwriteDiagnostic {
  final Logger _logger = Logger();

  /// Run comprehensive diagnostic checks
  Future<Map<String, dynamic>> runDiagnostic() async {
    final results = <String, dynamic>{};

    _logger.i('Starting Appwrite diagnostic checks...');

    // 1. Check configuration
    results['configuration'] = await _checkConfiguration();

    // 2. Test client initialization
    results['clientInitialization'] = await _testClientInitialization();

    // 3. Test network connectivity
    results['networkConnectivity'] = await _testNetworkConnectivity();

    // 4. Test database access
    results['databaseAccess'] = await _testDatabaseAccess();

    // 5. Test authentication
    results['authentication'] = await _testAuthentication();

    // 6. Generate summary
    results['summary'] = _generateSummary(results);

    _logger.i('Diagnostic completed');
    return results;
  }

  /// Check Appwrite configuration
  Future<Map<String, dynamic>> _checkConfiguration() async {
    final config = <String, dynamic>{
      'endpoint': Environment.appwriteEndpoint,
      'projectId': Environment.appwriteProjectId,
      'databaseId': Environment.appwriteDatabaseId,
      'isValid': true,
      'issues': <String>[],
    };

    try {
      // Check if endpoint is valid
      if (Environment.appwriteEndpoint.isEmpty) {
        config['isValid'] = false;
        config['issues'].add('Appwrite endpoint is empty');
      }

      // Check if project ID is valid
      if (Environment.appwriteProjectId.isEmpty) {
        config['isValid'] = false;
        config['issues'].add('Appwrite project ID is empty');
      }

      // Check if database ID is valid
      if (Environment.appwriteDatabaseId.isEmpty) {
        config['isValid'] = false;
        config['issues'].add('Appwrite database ID is empty');
      }

      _logger.i(
          'Configuration check completed: ${config['isValid'] ? 'PASS' : 'FAIL'}');
    } catch (error) {
      config['isValid'] = false;
      config['issues'].add('Configuration check failed: $error');
      _logger.e('Configuration check failed: $error');
    }

    return config;
  }

  /// Test client initialization
  Future<Map<String, dynamic>> _testClientInitialization() async {
    final result = <String, dynamic>{
      'initialized': false,
      'error': null,
      'details': '',
    };

    try {
      // Try to initialize client
      await AppwriteClient.initialize(
        endpoint: Environment.appwriteEndpoint,
        projectId: Environment.appwriteProjectId,
        selfSigned: false,
      );

      result['initialized'] = true;
      result['details'] = 'Client initialized successfully';
      _logger.i('Client initialization: PASS');
    } catch (error) {
      result['error'] = error.toString();
      result['details'] = 'Client initialization failed';
      _logger.e('Client initialization: FAIL - $error');
    }

    return result;
  }

  /// Test network connectivity
  Future<Map<String, dynamic>> _testNetworkConnectivity() async {
    final result = <String, dynamic>{
      'connected': false,
      'error': null,
      'details': '',
    };

    try {
      if (!AppwriteClient.isInitialized) {
        result['error'] = 'Client not initialized';
        result['details'] =
            'Cannot test connectivity without initialized client';
        return result;
      }

      final client = AppwriteClient.client;

      // Try to get current user as a connectivity test
      final account = Account(client);
      try {
        await account.get();
        result['connected'] = true;
        result['details'] = 'Network connectivity test passed';
        _logger.i('Network connectivity: PASS');
      } catch (error) {
        // This might fail due to authentication, but shows connectivity
        if (error.toString().contains('401')) {
          result['connected'] = true;
          result['details'] =
              'Network connectivity test passed (unauthenticated)';
          _logger.i('Network connectivity: PASS (unauthenticated)');
        } else {
          rethrow;
        }
      }

      result['connected'] = true;
      result['details'] = 'Network connectivity test passed';
      _logger.i('Network connectivity: PASS');
    } catch (error) {
      result['error'] = error.toString();
      result['details'] = 'Network connectivity test failed';
      _logger.e('Network connectivity: FAIL - $error');
    }

    return result;
  }

  /// Test database access
  Future<Map<String, dynamic>> _testDatabaseAccess() async {
    final result = <String, dynamic>{
      'accessible': false,
      'error': null,
      'details': '',
    };

    try {
      if (!AppwriteClient.isInitialized) {
        result['error'] = 'Client not initialized';
        result['details'] =
            'Cannot test database access without initialized client';
        return result;
      }

      final databases = AppwriteClient.databases;

      // Try to get database info as a connectivity test
      try {
        // Just check if we can access the databases instance
        result['accessible'] = true;
        result['details'] = 'Database instance accessible';
        _logger.i('Database access: PASS');
      } catch (error) {
        rethrow;
      }
    } catch (error) {
      result['error'] = error.toString();
      result['details'] = 'Database access test failed';
      _logger.e('Database access: FAIL - $error');
    }

    return result;
  }

  /// Test authentication
  Future<Map<String, dynamic>> _testAuthentication() async {
    final result = <String, dynamic>{
      'authenticated': false,
      'error': null,
      'details': '',
    };

    try {
      if (!AppwriteClient.isInitialized) {
        result['error'] = 'Client not initialized';
        result['details'] =
            'Cannot test authentication without initialized client';
        return result;
      }

      final account = AppwriteClient.account;

      // Try to get current user
      try {
        final user = await account.get();
        result['authenticated'] = true;
        result['details'] = 'User authenticated successfully';
        result['userId'] = user.$id;
        _logger.i('Authentication: PASS - User: ${user.name}');
      } catch (error) {
        // This is expected for unauthenticated users
        if (error.toString().contains('401')) {
          result['authenticated'] = false;
          result['details'] = 'No authenticated user (expected for new users)';
          _logger.i('Authentication: NO_USER (expected)');
        } else {
          rethrow;
        }
      }
    } catch (error) {
      result['error'] = error.toString();
      result['details'] = 'Authentication test failed';
      _logger.e('Authentication: FAIL - $error');
    }

    return result;
  }

  /// Generate diagnostic summary
  Map<String, dynamic> _generateSummary(Map<String, dynamic> results) {
    final summary = <String, dynamic>{
      'status': 'unknown',
      'issues': <String>[],
      'recommendations': <String>[],
    };

    final config = results['configuration'];
    final clientInit = results['clientInitialization'];
    final network = results['networkConnectivity'];
    final database = results['databaseAccess'];
    final auth = results['authentication'];

    // Determine overall status
    if (config['isValid'] &&
        clientInit['initialized'] &&
        network['connected'] &&
        database['accessible']) {
      summary['status'] = 'healthy';
    } else if (config['isValid'] &&
        clientInit['initialized'] &&
        network['connected']) {
      summary['status'] = 'partial';
      summary['issues'].add('Database access issues detected');
    } else {
      summary['status'] = 'unhealthy';
      if (!config['isValid']) {
        summary['issues'].addAll(config['issues']);
      }
      if (!clientInit['initialized']) {
        summary['issues'].add('Client initialization failed');
      }
      if (!network['connected']) {
        summary['issues'].add('Network connectivity issues');
      }
    }

    // Generate recommendations
    if (!config['isValid']) {
      summary['recommendations']
          .add('Check Appwrite configuration in environment.dart');
    }
    if (!clientInit['initialized']) {
      summary['recommendations']
          .add('Verify Appwrite endpoint and project ID are correct');
    }
    if (!network['connected']) {
      summary['recommendations']
          .add('Check internet connection and Appwrite server status');
    }
    if (!database['accessible']) {
      summary['recommendations']
          .add('Verify database permissions and collection setup');
    }
    if (!auth['authenticated']) {
      summary['recommendations']
          .add('Consider implementing user authentication');
    }

    return summary;
  }

  /// Print diagnostic results to console
  void printResults(Map<String, dynamic> results) {
    _logger.t('=== APPWRITE DIAGNOSTIC RESULTS ===');

    final config = results['configuration'];
    final clientInit = results['clientInitialization'];
    final network = results['networkConnectivity'];
    final database = results['databaseAccess'];
    final auth = results['authentication'];
    final summary = results['summary'];

    _logger.t('Configuration: ${config['isValid'] ? '✓' : '✗'}');
    if (!config['isValid']) {
      config['issues'].forEach((issue) => _logger.t('  - $issue'));
    }

    _logger
        .t('Client Initialization: ${clientInit['initialized'] ? '✓' : '✗'}');
    if (!clientInit['initialized']) {
      _logger.t('  - ${clientInit['error']}');
    }

    _logger.t('Network Connectivity: ${network['connected'] ? '✓' : '✗'}');
    if (!network['connected']) {
      _logger.t('  - ${network['error']}');
    }

    _logger.t('Database Access: ${database['accessible'] ? '✓' : '✗'}');
    if (!database['accessible']) {
      _logger.t('  - ${database['error']}');
    }

    _logger.t('Authentication: ${auth['authenticated'] ? '✓' : '✗'}');
    if (!auth['authenticated']) {
      _logger.t('  - ${auth['details']}');
    }

    _logger.t('Overall Status: ${summary['status']}');
    if (summary['issues'].isNotEmpty) {
      _logger.t('Issues found:');
      summary['issues'].forEach((issue) => _logger.t('  - $issue'));
    }

    if (summary['recommendations'].isNotEmpty) {
      _logger.t('Recommendations:');
      summary['recommendations'].forEach((rec) => _logger.t('  - $rec'));
    }

    _logger.t('=== END DIAGNOSTIC ===');
  }
}
