import 'package:flutter/material.dart';
import 'package:involvex_app/services/appwrite_service.dart';
import 'package:involvex_app/theme/hacker_theme.dart';

/// Connection status indicator widget
class ConnectionStatusIndicator extends StatefulWidget {
  final AppwriteService appwriteService;

  const ConnectionStatusIndicator({
    super.key,
    required this.appwriteService,
  });

  @override
  State<ConnectionStatusIndicator> createState() =>
      _ConnectionStatusIndicatorState();
}

class _ConnectionStatusIndicatorState extends State<ConnectionStatusIndicator> {
  bool _isConnected = false;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _checkConnectionStatus();
  }

  Future<void> _checkConnectionStatus() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Check if Appwrite is initialized
      if (widget.appwriteService.isInitialized) {
        // Try to get current user to test connection
        final user = await widget.appwriteService.getCurrentUser();
        setState(() {
          _isConnected = user != null;
          _isLoading = false;
        });
      } else {
        setState(() {
          _isConnected = false;
          _isLoading = false;
        });
      }
    } catch (error) {
      setState(() {
        _isConnected = false;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8.0),
      decoration: BoxDecoration(
        color: HackerTheme.darkerGreen,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: HackerTheme.primaryGreen, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _isLoading
                ? Icons.sync_rounded
                : (_isConnected ? Icons.check_circle : Icons.error),
            color: _isLoading
                ? HackerTheme.textGrey
                : (_isConnected ? Colors.green : Colors.red),
            size: 16,
          ),
          const SizedBox(width: 8),
          Text(
            _isLoading
                ? 'Checking connection...'
                : (_isConnected
                    ? 'Connected to Appwrite'
                    : 'Appwrite disconnected'),
            style: TextStyle(
              color: _isLoading
                  ? HackerTheme.textGrey
                  : (_isConnected ? Colors.green : Colors.red),
              fontSize: 12,
              fontFamily: 'Courier Prime',
            ),
          ),
          if (!_isConnected && !_isLoading) const SizedBox(width: 8),
          if (!_isConnected && !_isLoading)
            InkWell(
              onTap: _checkConnectionStatus,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: HackerTheme.primaryGreen,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text(
                  'Retry',
                  style: TextStyle(
                    color: Colors.black,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Courier Prime',
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// Connection status banner for the main app
class ConnectionStatusBanner extends StatelessWidget {
  final AppwriteService appwriteService;

  const ConnectionStatusBanner({
    super.key,
    required this.appwriteService,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8.0),
      color: HackerTheme.darkerGreen,
      child: Row(
        children: [
          const Icon(Icons.cloud, color: HackerTheme.primaryGreen, size: 16),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Appwrite Backend Service',
              style: TextStyle(
                color: HackerTheme.primaryGreen,
                fontSize: 12,
                fontFamily: 'Courier Prime',
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          ConnectionStatusIndicator(appwriteService: appwriteService),
        ],
      ),
    );
  }
}
