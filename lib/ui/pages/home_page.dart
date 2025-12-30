
import 'package:involvex_app/theme/hacker_theme.dart';
import 'package:flutter/material.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with TickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = false;
  String _selectedTimeframe = 'daily';
  final bool _showGitHub = true;
  final bool _showNpm = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
    });

    // Simulate API loading
    await Future.delayed(const Duration(seconds: 1));
    
    setState(() {
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HackerTheme.darkerGreen,
      appBar: AppBar(
        title: const Text('Trending Hub'),
        elevation: 0,
        backgroundColor: HackerTheme.darkerGreen,
        foregroundColor: HackerTheme.primaryGreen,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _isLoading ? null : _loadData,
            color: HackerTheme.primaryGreen,
          ),
          PopupMenuButton<String>(
            icon: Icon(Icons.more_vert, color: HackerTheme.primaryGreen),
            onSelected: (value) {
              setState(() {
                _selectedTimeframe = value;
              });
              _loadData();
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'daily',
                child: Text('Daily'),
              ),
              const PopupMenuItem(
                value: 'weekly',
                child: Text('Weekly'),
              ),
              const PopupMenuItem(
                value: 'monthly',
                child: Text('Monthly'),
              ),
            ],
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: HackerTheme.primaryGreen,
          unselectedLabelColor: HackerTheme.textGrey,
          indicatorColor: HackerTheme.primaryGreen,
          tabs: const [
            Tab(text: 'GitHub', icon: Icon(Icons.code)),
            Tab(text: 'npm', icon: Icon(Icons.inventory_2)),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                color: HackerTheme.primaryGreen,
              ),
            )
          : TabBarView(
              controller: _tabController,
              children: [
                _buildGitHubTab(),
                _buildNpmTab(),
              ],
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Quick toggle between GitHub and npm
          _tabController.index = _tabController.index == 0 ? 1 : 0;
        },
        backgroundColor: HackerTheme.primaryGreen,
        child: Icon(
          _tabController.index == 0 ? Icons.inventory_2 : Icons.code,
          color: HackerTheme.darkerGreen,
        ),
      ),
    );
  }

  Widget _buildGitHubTab() {
    final mockRepositories = _generateMockRepositories();
    
    return Column(
      children: [
        // Filter Bar
        _buildFilterBar(),
        // Timeframe Selector
        _buildTimeframeSelector(),
        // Repository List
        Expanded(
          child: RefreshIndicator(
            onRefresh: _loadData,
            color: HackerTheme.primaryGreen,
            backgroundColor: HackerTheme.darkerGreen,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: mockRepositories.length,
              itemBuilder: (context, index) {
                return _buildRepositoryCard(mockRepositories[index]);
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNpmTab() {
    final mockPackages = _generateMockPackages();
    
    return Column(
      children: [
        // Filter Bar
        _buildFilterBar(),
        // Timeframe Selector
        _buildTimeframeSelector(),
        // Package List
        Expanded(
          child: RefreshIndicator(
            onRefresh: _loadData,
            color: HackerTheme.primaryGreen,
            backgroundColor: HackerTheme.darkerGreen,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: mockPackages.length,
              itemBuilder: (context, index) {
                return _buildPackageCard(mockPackages[index]);
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFilterBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Text(
            'Timeframe:',
            style: HackerTheme.bodyText().copyWith(
              color: HackerTheme.secondaryGreen,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'daily', label: Text('Daily')),
                ButtonSegment(value: 'weekly', label: Text('Weekly')),
                ButtonSegment(value: 'monthly', label: Text('Monthly')),
              ],
              selected: {_selectedTimeframe},
              onSelectionChanged: (Set<String> newSelection) {
                setState(() {
                  _selectedTimeframe = newSelection.first;
                });
                _loadData();
              },
              style: SegmentedButton.styleFrom(
                backgroundColor: HackerTheme.mediumGrey,
                selectedBackgroundColor: HackerTheme.primaryGreen,
                selectedForegroundColor: HackerTheme.darkerGreen,
                foregroundColor: HackerTheme.textGrey,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimeframeSelector() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: HackerTheme.mediumGrey,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: HackerTheme.lightGrey),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Showing: ${_selectedTimeframe.characters.first.toUpperCase()}${_selectedTimeframe.substring(1)} Trending',
            style: HackerTheme.captionText().copyWith(
              color: HackerTheme.secondaryGreen,
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: HackerTheme.accentGreen.withOpacity(0.2),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              'Auto-refresh',
              style: HackerTheme.captionText().copyWith(
                color: HackerTheme.accentGreen,
                fontSize: 10,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRepositoryCard(GitHubRepository repo) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with repo name and actions
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
                IconButton(
                  icon: const Icon(Icons.bookmark_border),
                  onPressed: () {
                    // Subscribe to repository
                    _showSnackBar('Subscribed to ${repo.name}');
                  },
                  color: HackerTheme.textGrey,
                ),
                IconButton(
                  icon: const Icon(Icons.open_in_new),
                  onPressed: () {
                    // Open in browser
                  },
                  color: HackerTheme.textGrey,
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
            
            // Stats row
            Row(
              children: [
                _buildStatChip(Icons.star, repo.stars.toString()),
                const SizedBox(width: 8),
                _buildStatChip(Icons.call_split, repo.forks.toString()),
                const SizedBox(width: 8),
                _buildStatChip(Icons.warning, repo.issues.toString()),
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
            
            // License and topics
            if (repo.license != null || repo.topics != null) ...[
              Row(
                children: [
                  if (repo.license != null) ...[
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: HackerTheme.primaryGreen.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: HackerTheme.primaryGreen),
                      ),
                      child: Text(
                        repo.license!,
                        style: HackerTheme.captionText().copyWith(
                          color: HackerTheme.primaryGreen,
                          fontSize: 10,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                  ],
                  if (repo.topics != null)
                    Expanded(
                      child: Text(
                        repo.topics!,
                        style: HackerTheme.captionText().copyWith(
                          color: HackerTheme.textGrey.withOpacity(0.7),
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildPackageCard(NpmPackage package) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with package name and actions
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
                IconButton(
                  icon: const Icon(Icons.bookmark_border),
                  onPressed: () {
                    // Subscribe to package
                    _showSnackBar('Subscribed to ${package.name}');
                  },
                  color: HackerTheme.textGrey,
                ),
                IconButton(
                  icon: const Icon(Icons.open_in_new),
                  onPressed: () {
                    // Open in browser
                  },
                  color: HackerTheme.textGrey,
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
            
            // Stats row
            Row(
              children: [
                _buildStatChip(Icons.download, package.formattedDownloads),
                const SizedBox(width: 8),
                _buildStatChip(Icons.star, package.stars.toString()),
                const SizedBox(width: 8),
                _buildStatChip(Icons.inventory_2, package.versions.length.toString()),
                const SizedBox(width: 8),
                if (package.license != null) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: HackerTheme.primaryGreen.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(3),
                      border: Border.all(color: HackerTheme.primaryGreen),
                    ),
                    child: Text(
                      package.license!,
                      style: HackerTheme.captionText().copyWith(
                        color: HackerTheme.primaryGreen,
                        fontSize: 9,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                ],
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
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
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
            ],
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
      'Vue': const Color(0xFF4FC08D),
      'React': const Color(0xFF61DAFB),
      'Angular': const Color(0xFFDD0031),
      'Docker': const Color(0xFF384D54),
      'YAML': const Color(0xFFCB171E),
      'JSON': const Color(0xFF292929),
    };
    
    return colors[language] ?? const Color(0xFFCCCCCC);
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

  // Mock data generation
  List<GitHubRepository> _generateMockRepositories() {
    return List.generate(20, (index) {
      return GitHubRepository(
        id: 'repo_$index',
        name: 'awesome-project-$index',
        fullName: 'user/awesome-project-$index',
        description: 'A fantastic project that does amazing things with technology and innovation.',
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
        topics: 'awesome,technology,innovation,opensource',
        trendingScore: 1000.0 + index * 50.0,
        trendingPeriod: _selectedTimeframe,
      );
    });
  }

  List<NpmPackage> _generateMockPackages() {
    return List.generate(20, (index) {
      return NpmPackage(
        name: 'awesome-package-$index',
        version: '1.${index % 10}.${index % 5}',
        description: 'An amazing npm package that provides incredible functionality for developers worldwide.',
        npmUrl: 'https://www.npmjs.com/package/awesome-package-$index',
        homepage: 'https://awesome-package-$index.com',
        repositoryUrl: 'https://github.com/user/awesome-package-$index',
        modified: DateTime.now().subtract(Duration(days: index * 7)),
        keywords: ['awesome', 'package', 'javascript', 'npm', 'opensource'],
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
        trendingPeriod: _selectedTimeframe,
        metrics: {
          'monthlyDownloads': 100000 + index * 5000,
          'weeklyDownloads': 25000 + index * 1000,
        },
      );
    });
  }
}