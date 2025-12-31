import 'package:involvex_app/theme/hacker_theme.dart';
import 'package:involvex_app/services/appwrite_service.dart';
import 'package:flutter/material.dart';
import 'package:involvex_app/ui/pages/home_page.dart';
import 'package:involvex_app/ui/pages/subscriptions_page.dart';
import 'package:involvex_app/ui/pages/search_page.dart';
import 'package:involvex_app/ui/pages/settings_page.dart';
import 'package:involvex_app/ui/components/connection_status.dart';

class AppwriteApp extends StatelessWidget {
  const AppwriteApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Trending Hub',
      debugShowCheckedModeBanner: false,
      theme: HackerTheme.darkTheme,
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;
  final AppwriteService _appwriteService = AppwriteService();

  final List<Widget> _pages = [
    const HomePage(),
    const SubscriptionsPage(),
    const SearchPage(),
    const SettingsPage(),
  ];

  @override
  void initState() {
    super.initState();
    // Initialize Appwrite service if not already done
    if (!_appwriteService.isInitialized) {
      _initializeAppwrite();
    }
  }

  Future<void> _initializeAppwrite() async {
    try {
      await _appwriteService.initialize();
      setState(() {});
    } catch (error) {
      // Handle initialization error
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Appwrite initialization failed: $error'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Trending Hub'),
        backgroundColor: HackerTheme.darkerGreen,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(30),
          child: ConnectionStatusBanner(appwriteService: _appwriteService),
        ),
      ),
      body: _pages[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        selectedItemColor: HackerTheme.primaryGreen,
        unselectedItemColor: HackerTheme.textGrey,
        backgroundColor: HackerTheme.darkerGreen,
        elevation: 8,
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.trending_up),
            activeIcon: Icon(Icons.trending_up),
            label: 'Trending',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.bookmark),
            activeIcon: Icon(Icons.bookmark),
            label: 'Subscriptions',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.search),
            activeIcon: Icon(Icons.search),
            label: 'Search',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            activeIcon: Icon(Icons.settings),
            label: 'Settings',
          ),
        ],
      ),
    );
  }
}
