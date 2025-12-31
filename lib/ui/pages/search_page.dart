import 'package:involvex_app/data/models/github_repository.dart';
import 'package:involvex_app/data/models/npm_package.dart';
import 'package:involvex_app/theme/hacker_theme.dart';
import 'package:flutter/material.dart';

class SearchPage extends StatefulWidget {
  const SearchPage({super.key});

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage>
    with TickerProviderStateMixin, AutomaticKeepAliveClientMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _minStarsController = TextEditingController();

  bool _isSearching = false;
  String _searchQuery = '';
  String _selectedLanguage = 'All';
  String _selectedSort = 'best-match';
  int _minStars = 0;

  @override
  bool get wantKeepAlive => true;

  List<GitHubRepository> _searchResultsRepositories = [];
  List<NpmPackage> _searchResultsPackages = [];

  final List<String> _languages = [
    'All',
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'C++',
    'C#',
    'PHP',
    'Ruby',
    'Go',
    'Rust',
    'Swift',
    'Kotlin',
    'Dart',
    'Shell',
    'HTML',
    'CSS'
  ];

  final List<String> _sortOptions = [
    'best-match',
    'stars',
    'forks',
    'updated',
    'name'
  ];

  @override
  void initState() {
    super.initState();
    // Restore saved tab index from PageStorage
    final savedIndex = PageStorage.of(context).readState(
          context,
          identifier: const ValueKey('search_tab_index'),
        ) as int? ??
        0;

    _tabController = TabController(
      length: 2,
      vsync: this,
      initialIndex: savedIndex,
    );

    // Save tab index whenever it changes
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        PageStorage.of(context).writeState(
          context,
          _tabController.index,
          identifier: const ValueKey('search_tab_index'),
        );
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    _minStarsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context); // Required for AutomaticKeepAliveClientMixin
    return Scaffold(
      backgroundColor: HackerTheme.darkerGreen,
      appBar: AppBar(
        title: const Text('Search'),
        elevation: 0,
        backgroundColor: HackerTheme.darkerGreen,
        foregroundColor: HackerTheme.primaryGreen,
        bottom: TabBar(
          controller: _tabController,
          labelColor: HackerTheme.primaryGreen,
          unselectedLabelColor: HackerTheme.textGrey,
          indicatorColor: HackerTheme.primaryGreen,
          tabs: const [
            Tab(text: 'Repositories', icon: Icon(Icons.code)),
            Tab(text: 'Packages', icon: Icon(Icons.inventory_2)),
          ],
        ),
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          _buildFilters(),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildRepositoriesSearchResults(),
                _buildPackagesSearchResults(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: HackerTheme.darkGrey,
        border: Border(
          bottom: BorderSide(color: HackerTheme.lightGrey, width: 1),
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _searchController,
                  style: HackerTheme.bodyText(),
                  decoration: InputDecoration(
                    hintText: 'Search repositories and packages...',
                    hintStyle: HackerTheme.captionText().copyWith(
                      color: HackerTheme.textGrey.withOpacity(0.5),
                    ),
                    prefixIcon:
                        Icon(Icons.search, color: HackerTheme.primaryGreen),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: HackerTheme.lightGrey),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide:
                          BorderSide(color: HackerTheme.primaryGreen, width: 2),
                    ),
                    filled: true,
                    fillColor: HackerTheme.mediumGrey,
                  ),
                  onSubmitted: (_) => _performSearch(),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: _isSearching ? null : _performSearch,
                style: ElevatedButton.styleFrom(
                  backgroundColor: HackerTheme.primaryGreen,
                  foregroundColor: HackerTheme.darkerGreen,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
                child: _isSearching
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.black),
                        ),
                      )
                    : const Text('Search'),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Text(
                'Quick filters:',
                style: HackerTheme.captionText().copyWith(
                  color: HackerTheme.secondaryGreen,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(width: 8),
              Wrap(
                spacing: 4,
                runSpacing: 4,
                children: [
                  _buildQuickFilterChip('JavaScript'),
                  _buildQuickFilterChip('Python'),
                  _buildQuickFilterChip('React'),
                  _buildQuickFilterChip('Node.js'),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Filters',
            style: HackerTheme.heading3(),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              // Language Filter
              Expanded(
                child: DropdownButtonFormField<String>(
                  initialValue: _selectedLanguage,
                  decoration: InputDecoration(
                    labelText: 'Language',
                    labelStyle: HackerTheme.captionText(),
                    border: OutlineInputBorder(
                      borderSide: BorderSide(color: HackerTheme.lightGrey),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderSide: BorderSide(color: HackerTheme.primaryGreen),
                    ),
                    filled: true,
                    fillColor: HackerTheme.mediumGrey,
                  ),
                  style: HackerTheme.bodyText(),
                  dropdownColor: HackerTheme.darkGrey,
                  items: _languages.map((language) {
                    return DropdownMenuItem(
                      value: language,
                      child: Text(language),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedLanguage = value!;
                    });
                  },
                ),
              ),
              const SizedBox(width: 12),
              // Sort Filter
              Expanded(
                child: DropdownButtonFormField<String>(
                  initialValue: _selectedSort,
                  decoration: InputDecoration(
                    labelText: 'Sort by',
                    labelStyle: HackerTheme.captionText(),
                    border: OutlineInputBorder(
                      borderSide: BorderSide(color: HackerTheme.lightGrey),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderSide: BorderSide(color: HackerTheme.primaryGreen),
                    ),
                    filled: true,
                    fillColor: HackerTheme.mediumGrey,
                  ),
                  style: HackerTheme.bodyText(),
                  dropdownColor: HackerTheme.darkGrey,
                  items: _sortOptions.map((sort) {
                    return DropdownMenuItem(
                      value: sort,
                      child: Text(_formatSortOption(sort)),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedSort = value!;
                    });
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              // Min Stars Filter
              Expanded(
                child: TextField(
                  controller: _minStarsController,
                  keyboardType: TextInputType.number,
                  style: HackerTheme.bodyText(),
                  decoration: InputDecoration(
                    labelText: 'Min Stars',
                    labelStyle: HackerTheme.captionText(),
                    border: OutlineInputBorder(
                      borderSide: BorderSide(color: HackerTheme.lightGrey),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderSide: BorderSide(color: HackerTheme.primaryGreen),
                    ),
                    filled: true,
                    fillColor: HackerTheme.mediumGrey,
                  ),
                  onChanged: (value) {
                    setState(() {
                      _minStars = int.tryParse(value) ?? 0;
                    });
                  },
                ),
              ),
              const SizedBox(width: 12),
              // Clear Filters Button
              ElevatedButton(
                onPressed: _clearFilters,
                style: ElevatedButton.styleFrom(
                  backgroundColor: HackerTheme.mediumGrey,
                  foregroundColor: HackerTheme.textGrey,
                  side: BorderSide(color: HackerTheme.lightGrey),
                ),
                child: const Text('Clear'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickFilterChip(String filter) {
    final isSelected =
        _searchController.text.toLowerCase().contains(filter.toLowerCase());

    return FilterChip(
      label: Text(filter),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          _searchController.text = filter;
          _performSearch();
        }
      },
      backgroundColor: HackerTheme.mediumGrey,
      selectedColor: HackerTheme.primaryGreen.withOpacity(0.3),
      checkmarkColor: HackerTheme.primaryGreen,
      labelStyle: HackerTheme.captionText(),
      side: BorderSide(color: HackerTheme.lightGrey),
    );
  }

  Widget _buildRepositoriesSearchResults() {
    if (_searchQuery.isEmpty) {
      return _buildEmptySearchState(
        icon: Icons.code,
        title: 'Search GitHub Repositories',
        subtitle: 'Find amazing open source projects',
      );
    }

    if (_searchResultsRepositories.isEmpty) {
      return const Center(
        child: Text(
          'No repositories found',
          style: TextStyle(
            color: HackerTheme.textGrey,
            fontSize: 16,
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _performSearch,
      color: HackerTheme.primaryGreen,
      backgroundColor: HackerTheme.darkerGreen,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _searchResultsRepositories.length,
        itemBuilder: (context, index) {
          return _buildRepositorySearchCard(_searchResultsRepositories[index]);
        },
      ),
    );
  }

  Widget _buildPackagesSearchResults() {
    if (_searchQuery.isEmpty) {
      return _buildEmptySearchState(
        icon: Icons.inventory_2,
        title: 'Search NPM Packages',
        subtitle: 'Discover useful npm packages',
      );
    }

    if (_searchResultsPackages.isEmpty) {
      return const Center(
        child: Text(
          'No packages found',
          style: TextStyle(
            color: HackerTheme.textGrey,
            fontSize: 16,
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _performSearch,
      color: HackerTheme.primaryGreen,
      backgroundColor: HackerTheme.darkerGreen,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _searchResultsPackages.length,
        itemBuilder: (context, index) {
          return _buildPackageSearchCard(_searchResultsPackages[index]);
        },
      ),
    );
  }

  Widget _buildEmptySearchState({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 64,
              color: HackerTheme.textGrey.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: HackerTheme.heading3().copyWith(
                color: HackerTheme.textGrey.withOpacity(0.7),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              style: HackerTheme.bodyText().copyWith(
                color: HackerTheme.textGrey.withOpacity(0.5),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Text(
              'Use the search bar above to find repositories and packages',
              style: HackerTheme.captionText().copyWith(
                color: HackerTheme.textGrey.withOpacity(0.4),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRepositorySearchCard(GitHubRepository repo) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        repo.name,
                        style: HackerTheme.heading3(),
                      ),
                      Text(
                        repo.fullName,
                        style: HackerTheme.captionText().copyWith(
                          color: HackerTheme.textGrey.withOpacity(0.7),
                        ),
                      ),
                    ],
                  ),
                ),
                PopupMenuButton<String>(
                  icon: Icon(Icons.more_vert, color: HackerTheme.textGrey),
                  onSelected: (value) {
                    switch (value) {
                      case 'open':
                        // Open in browser
                        break;
                      case 'subscribe':
                        _subscribeToRepository(repo);
                        break;
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'open',
                      child: Text('Open Repository'),
                    ),
                    const PopupMenuItem(
                      value: 'subscribe',
                      child: Text('Subscribe'),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Description
            if (repo.description.isNotEmpty) ...[
              Text(
                repo.description,
                style: HackerTheme.bodyText(),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
            ],

            // Stats
            Row(
              children: [
                _buildStatChip(Icons.star, repo.stars.toString()),
                const SizedBox(width: 8),
                _buildStatChip(Icons.call_split, repo.forks.toString()),
                const SizedBox(width: 8),
                if (repo.language != 'Unknown') ...[
                  Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: _getLanguageColor(repo.language),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    repo.language,
                    style: HackerTheme.captionText(),
                  ),
                ],
                const Spacer(),
                Text(
                  repo.timeAgo,
                  style: HackerTheme.captionText(),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Actions
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton.icon(
                  onPressed: () => _subscribeToRepository(repo),
                  icon: const Icon(Icons.bookmark_border, size: 16),
                  label: const Text('Subscribe'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: HackerTheme.primaryGreen,
                    side: BorderSide(color: HackerTheme.primaryGreen),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton.icon(
                  onPressed: () {
                    // Open in browser
                  },
                  icon: const Icon(Icons.open_in_new, size: 16),
                  label: const Text('View'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: HackerTheme.primaryGreen,
                    foregroundColor: HackerTheme.darkerGreen,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPackageSearchCard(NpmPackage package) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        package.name,
                        style: HackerTheme.heading3(),
                      ),
                      Text(
                        'v${package.version}',
                        style: HackerTheme.captionText().copyWith(
                          color: HackerTheme.textGrey.withOpacity(0.7),
                        ),
                      ),
                    ],
                  ),
                ),
                PopupMenuButton<String>(
                  icon: Icon(Icons.more_vert, color: HackerTheme.textGrey),
                  onSelected: (value) {
                    switch (value) {
                      case 'open':
                        // Open in browser
                        break;
                      case 'subscribe':
                        _subscribeToPackage(package);
                        break;
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'open',
                      child: Text('Open Package'),
                    ),
                    const PopupMenuItem(
                      value: 'subscribe',
                      child: Text('Subscribe'),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Description
            if (package.description.isNotEmpty) ...[
              Text(
                package.description,
                style: HackerTheme.bodyText(),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
            ],

            // Stats
            Row(
              children: [
                _buildStatChip(Icons.download, package.formattedDownloads),
                const SizedBox(width: 8),
                _buildStatChip(Icons.star, package.stars.toString()),
                const SizedBox(width: 8),
                _buildStatChip(
                    Icons.inventory_2, package.versions.length.toString()),
                const Spacer(),
                Text(
                  package.timeAgo,
                  style: HackerTheme.captionText(),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Keywords
            if (package.keywords.isNotEmpty) ...[
              Wrap(
                spacing: 4,
                runSpacing: 4,
                children: package.keywords.take(3).map((keyword) {
                  return Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: HackerTheme.mediumGrey,
                      borderRadius: BorderRadius.circular(3),
                    ),
                    child: Text(
                      keyword,
                      style: HackerTheme.captionText().copyWith(
                        color: HackerTheme.secondaryGreen,
                        fontSize: 9,
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 8),
            ],

            // Actions
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton.icon(
                  onPressed: () => _subscribeToPackage(package),
                  icon: const Icon(Icons.bookmark_border, size: 16),
                  label: const Text('Subscribe'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: HackerTheme.primaryGreen,
                    side: BorderSide(color: HackerTheme.primaryGreen),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton.icon(
                  onPressed: () {
                    // Open in browser
                  },
                  icon: const Icon(Icons.open_in_new, size: 16),
                  label: const Text('View'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: HackerTheme.primaryGreen,
                    foregroundColor: HackerTheme.darkerGreen,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatChip(IconData icon, String value) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          size: 14,
          color: HackerTheme.textGrey.withOpacity(0.7),
        ),
        const SizedBox(width: 4),
        Text(
          value,
          style: HackerTheme.captionText(),
        ),
      ],
    );
  }

  Color _getLanguageColor(String language) {
    final colors = {
      'JavaScript': const Color(0xFFF1E05A),
      'TypeScript': const Color(0xFF2B7489),
      'Python': const Color(0xFF3572A5),
      'Java': const Color(0xFFB07219),
      'C++': const Color(0xFFF34B7D),
      'C': const Color(0xFF555555),
      'C#': const Color(0xFF178600),
      'PHP': const Color(0xFF4F5D95),
      'Ruby': const Color(0xFF701516),
      'Go': const Color(0xFF00ADD8),
      'Rust': const Color(0xFFDEA584),
      'Swift': const Color(0xFFFFAC45),
      'Kotlin': const Color(0xFFF18E33),
      'Dart': const Color(0xFF00B4AB),
      'Shell': const Color(0xFF89E051),
      'HTML': const Color(0xFFE34C26),
      'CSS': const Color(0xFF563D7C),
    };

    return colors[language] ?? const Color(0xFFCCCCCC);
  }

  Future<void> _performSearch() async {
    final query = _searchController.text.trim();
    if (query.isEmpty) return;

    setState(() {
      _isSearching = true;
      _searchQuery = query;
    });

    try {
      // Simulate API search
      await Future.delayed(const Duration(seconds: 1));

      if (_tabController.index == 0) {
        // Search repositories
        _searchResultsRepositories = _generateMockSearchResults(query);
      } else {
        // Search packages
        _searchResultsPackages = _generateMockPackageSearchResults(query);
      }
    } catch (e) {
      _showSnackBar('Search failed: ${e.toString()}');
    } finally {
      setState(() {
        _isSearching = false;
      });
    }
  }

  void _clearFilters() {
    setState(() {
      _selectedLanguage = 'All';
      _selectedSort = 'best-match';
      _minStars = 0;
      _minStarsController.clear();
    });

    if (_searchQuery.isNotEmpty) {
      _performSearch();
    }
  }

  void _subscribeToRepository(GitHubRepository repo) {
    _showSnackBar('Subscribed to ${repo.name}');
  }

  void _subscribeToPackage(NpmPackage package) {
    _showSnackBar('Subscribed to ${package.name}');
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: HackerTheme.primaryGreen,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  String _formatSortOption(String option) {
    switch (option) {
      case 'best-match':
        return 'Best Match';
      case 'stars':
        return 'Most Stars';
      case 'forks':
        return 'Most Forks';
      case 'updated':
        return 'Recently Updated';
      case 'name':
        return 'Name';
      default:
        return option;
    }
  }

  // Mock search results
  List<GitHubRepository> _generateMockSearchResults(String query) {
    return List.generate(15, (index) {
      return GitHubRepository(
        id: 'search_repo_$index',
        name: '${query.toLowerCase()}-result-$index',
        fullName: 'user/${query.toLowerCase()}-result-$index',
        description:
            'A search result for "$query" with amazing functionality and features.',
        htmlUrl: 'https://github.com/user/${query.toLowerCase()}-result-$index',
        cloneUrl:
            'https://github.com/user/${query.toLowerCase()}-result-$index.git',
        sshUrl: 'git@github.com:user/${query.toLowerCase()}-result-$index.git',
        stars: 100 + index * 20,
        forks: 20 + index * 5,
        issues: index % 3,
        watchers: 30 + index * 3,
        language: _selectedLanguage == 'All'
            ? (index % 3 == 0
                ? 'JavaScript'
                : index % 2 == 0
                    ? 'Python'
                    : 'TypeScript')
            : _selectedLanguage,
        createdAt: DateTime.now().subtract(Duration(days: index * 20)),
        updatedAt: DateTime.now().subtract(Duration(days: index % 7)),
        pushedAt: DateTime.now().subtract(Duration(days: index % 3)),
        size: 500 + index * 50,
        isPrivate: false,
        isFork: false,
        defaultBranch: 'main',
        openIssuesCount: index % 2,
        hasDownloads: true,
        hasIssues: true,
        hasPages: false,
        hasWiki: false,
        ownerLogin: 'searchuser$index',
        ownerAvatarUrl: 'https://github.com/searchuser$index.png',
        ownerHtmlUrl: 'https://github.com/searchuser$index',
        topics: 'search,result,$query',
        trendingScore: 100.0 + index * 10.0,
        trendingPeriod: 'daily',
      );
    }).where((repo) {
      // Apply filters
      if (_selectedLanguage != 'All' && repo.language != _selectedLanguage) {
        return false;
      }
      if (repo.stars < _minStars) {
        return false;
      }
      return true;
    }).toList();
  }

  List<NpmPackage> _generateMockPackageSearchResults(String query) {
    return List.generate(15, (index) {
      return NpmPackage(
        name: '${query.toLowerCase()}-pkg-$index',
        version: '1.0.$index',
        description:
            'NPM package for "$query" with powerful features and excellent performance.',
        npmUrl:
            'https://www.npmjs.com/package/${query.toLowerCase()}-pkg-$index',
        homepage: 'https://${query.toLowerCase()}-pkg-$index.com',
        repositoryUrl:
            'https://github.com/user/${query.toLowerCase()}-pkg-$index',
        modified: DateTime.now().subtract(Duration(days: index * 10)),
        keywords: [query.toLowerCase(), 'search', 'result', 'package'],
        downloads: 5000 + index * 500,
        stars: 50 + index * 10,
        publisher: 'pkgpublisher$index',
        maintainers: 'pkgpublisher$index, helper$index',
        versions: ['1.0.0', '1.0.1', '1.0.2'],
        latestVersion: '1.0.$index',
        license: 'MIT',
        dependencies: ['lodash', 'moment'],
        devDependencies: ['jest'],
        trendingScore: 50.0 + index * 5.0,
        trendingPeriod: 'daily',
      );
    }).where((package) {
      // Apply filters
      if (package.stars < _minStars) {
        return false;
      }
      return true;
    }).toList();
  }
}
