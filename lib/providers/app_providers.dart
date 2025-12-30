import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../data/models/github_repository.dart';
import '../data/models/npm_package.dart';
import '../data/models/user_settings.dart';

// App State Manager
class AppStateManager extends ChangeNotifier {
  // Current view
  AppView _currentView = AppView.home;
  AppView get currentView => _currentView;

  // Loading state
  bool _isLoading = false;
  bool get isLoading => _isLoading;

  // Error state
  String? _error;
  String? get error => _error;

  // Settings
  UserSettings _settings = UserSettings();
  UserSettings get settings => _settings;

  // Trending data
  List<GitHubRepository> _trendingRepositories = [];
  List<GitHubRepository> get trendingRepositories => _trendingRepositories;

  List<NpmPackage> _trendingPackages = [];
  List<NpmPackage> get trendingPackages => _trendingPackages;

  // Subscriptions
  List<dynamic> _subscriptions = [];
  List<dynamic> get subscriptions => _subscriptions;

  // Search results
  List<dynamic> _searchResults = [];
  List<dynamic> get searchResults => _searchResults;

  // Methods
  void updateCurrentView(AppView view) {
    _currentView = view;
    notifyListeners();
  }

  void updateIsLoading(bool isLoading) {
    _isLoading = isLoading;
    notifyListeners();
  }

  void updateError(String? error) {
    _error = error;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void updateSettings(UserSettings settings) {
    _settings = settings;
    _saveSettings();
    notifyListeners();
  }

  Future<void> _saveSettings() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_settings', _settings.toJson().toString());
    } catch (e) {
      debugPrint('Error saving settings: $e');
    }
  }

  Future<void> loadSettings() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final settingsJson = prefs.getString('user_settings');
      
      if (settingsJson != null) {
        // In a real app, you'd parse the JSON here
        // For now, we'll keep the default settings
        _settings = UserSettings();
      }
    } catch (e) {
      debugPrint('Error loading settings: $e');
    }
    notifyListeners();
  }

  // Trending Repositories Methods
  void setTrendingRepositories(List<GitHubRepository> repos) {
    _trendingRepositories = repos;
    notifyListeners();
  }

  void addTrendingRepositories(List<GitHubRepository> repos) {
    _trendingRepositories.addAll(repos);
    notifyListeners();
  }

  // Trending Packages Methods
  void setTrendingPackages(List<NpmPackage> packages) {
    _trendingPackages = packages;
    notifyListeners();
  }

  void addTrendingPackages(List<NpmPackage> packages) {
    _trendingPackages.addAll(packages);
    notifyListeners();
  }

  // Subscriptions Methods
  void setSubscriptions(List<dynamic> subs) {
    _subscriptions = subs;
    notifyListeners();
  }

  void addSubscription(dynamic item) {
    _subscriptions.add(item);
    notifyListeners();
  }

  void removeSubscription(String id) {
    _subscriptions.removeWhere((item) => 
        (item is GitHubRepository && item.id == id) ||
        (item is NpmPackage && item.name == id));
    notifyListeners();
  }

  // Search Methods
  void setSearchResults(List<dynamic> results) {
    _searchResults = results;
    notifyListeners();
  }

  void clearSearchResults() {
    _searchResults.clear();
    notifyListeners();
  }

  // Utility Methods
  bool isSubscribed(String id) {
    return _subscriptions.any((item) => 
        (item is GitHubRepository && item.id == id) ||
        (item is NpmPackage && item.name == id));
  }

  // Mock data generation for demo
  void generateMockData() {
    _trendingRepositories = _generateMockRepositories();
    _trendingPackages = _generateMockPackages();
    notifyListeners();
  }

  List<GitHubRepository> _generateMockRepositories() {
    return List.generate(50, (index) {
      return GitHubRepository(
        id: 'repo_$index',
        name: 'awesome-project-$index',
        fullName: 'user/awesome-project-$index',
        description: 'A fantastic project that does amazing things with technology.',
        htmlUrl: 'https://github.com/user/awesome-project-$index',
        cloneUrl: 'https://github.com/user/awesome-project-$index.git',
        sshUrl: 'git@github.com:user/awesome-project-$index.git',
        stars: 1000 + index * 10,
        forks: 100 + index * 5,
        issues: index % 10,
        watchers: 50 + index * 2,
        language: index % 5 == 0 ? 'JavaScript' : 
                 index % 4 == 0 ? 'Python' :
                 index % 3 == 0 ? 'TypeScript' : 'Java',
        license: index % 3 == 0 ? 'MIT' : index % 2 == 0 ? 'Apache-2.0' : null,
        createdAt: DateTime.now().subtract(Duration(days: index * 30)),
        updatedAt: DateTime.now().subtract(Duration(days: index % 7)),
        pushedAt: DateTime.now().subtract(Duration(days: index % 3)),
        size: 1000 + index * 100,
        isPrivate: false,
        isFork: index % 8 == 0,
        defaultBranch: 'main',
        openIssuesCount: index % 5,
        hasDownloads: true,
        hasIssues: true,
        hasPages: false,
        hasWiki: true,
        ownerLogin: 'user$index',
        ownerAvatarUrl: 'https://github.com/user$index.png',
        ownerHtmlUrl: 'https://github.com/user$index',
        topics: 'awesome,technology,innovation',
        trendingScore: 1000.0 + index * 50.0,
        trendingPeriod: 'daily',
      );
    });
  }

  List<NpmPackage> _generateMockPackages() {
    return List.generate(50, (index) {
      return NpmPackage(
        name: 'awesome-package-$index',
        version: '1.${index % 10}.${index % 5}',
        description: 'An amazing npm package that provides incredible functionality for developers.',
        npmUrl: 'https://www.npmjs.com/package/awesome-package-$index',
        homepage: 'https://awesome-package-$index.com',
        repositoryUrl: 'https://github.com/user/awesome-package-$index',
        modified: DateTime.now().subtract(Duration(days: index * 7)),
        keywords: ['awesome', 'package', 'javascript', 'npm'],
        downloads: 10000 + index * 1000,
        stars: 500 + index * 25,
        publisher: 'publisher$index',
        maintainers: 'publisher$index, helper$index, contributor$index',
        versions: ['1.0.0', '1.1.0', '1.2.0', '1.3.0'],
        latestVersion: '1.${index % 10}.${index % 5}',
        license: index % 3 == 0 ? 'MIT' : 'ISC',
        dependencies: ['react', 'lodash', 'moment'],
        devDependencies: ['jest', 'webpack', 'typescript'],
        trendingScore: 500.0 + index * 25.0,
        trendingPeriod: 'daily',
        metrics: {
          'monthlyDownloads': 100000 + index * 5000,
          'weeklyDownloads': 25000 + index * 1000,
        },
      );
    });
  }
}

// App View Enum
enum AppView {
  home,
  subscriptions,
  search,
  settings,
  repositoryDetail,
  packageDetail,
}

// Global app state manager instance
final appStateManager = AppStateManager();