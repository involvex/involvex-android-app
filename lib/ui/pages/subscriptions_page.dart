import 'package:involvex_app/data/models/github_repository.dart';
import 'package:involvex_app/data/models/npm_package.dart';
import 'package:involvex_app/theme/hacker_theme.dart';
import 'package:flutter/material.dart';

class SubscriptionsPage extends StatefulWidget {
  const SubscriptionsPage({super.key});

  @override
  State<SubscriptionsPage> createState() => _SubscriptionsPageState();
}

class _SubscriptionsPageState extends State<SubscriptionsPage>
    with TickerProviderStateMixin, AutomaticKeepAliveClientMixin {
  late TabController _tabController;
  List<GitHubRepository> _subscribedRepositories = [];
  List<NpmPackage> _subscribedPackages = [];
  bool _isLoading = false;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadSubscriptions();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadSubscriptions() async {
    setState(() {
      _isLoading = true;
    });

    // Simulate loading from Appwrite
    await Future.delayed(const Duration(seconds: 1));

    // For demo, add some mock subscribed items
    _subscribedRepositories = _generateMockSubscribedRepositories();
    _subscribedPackages = _generateMockSubscribedPackages();

    setState(() {
      _isLoading = false;
    });
  }

  Future<void> _refreshSubscriptions() async {
    await _loadSubscriptions();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context); // Required for AutomaticKeepAliveClientMixin
    return Scaffold(
      backgroundColor: HackerTheme.darkerGreen,
      appBar: AppBar(
        title: const Text('Subscriptions'),
        elevation: 0,
        backgroundColor: HackerTheme.darkerGreen,
        foregroundColor: HackerTheme.primaryGreen,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _isLoading ? null : _refreshSubscriptions,
            color: HackerTheme.primaryGreen,
          ),
          PopupMenuButton<String>(
            icon: Icon(Icons.more_vert, color: HackerTheme.primaryGreen),
            onSelected: (value) {
              switch (value) {
                case 'export':
                  _exportSubscriptions();
                  break;
                case 'clear_all':
                  _showClearAllDialog();
                  break;
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'export',
                child: Text('Export Data'),
              ),
              const PopupMenuItem(
                value: 'clear_all',
                child: Text('Clear All'),
              ),
            ],
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: HackerTheme.primaryGreen,
          unselectedLabelColor: HackerTheme.textGrey,
          indicatorColor: HackerTheme.primaryGreen,
          tabs: [
            Tab(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.code, size: 16),
                  const SizedBox(width: 4),
                  Flexible(
                    child: Text(
                      'Repositories (${_subscribedRepositories.length})',
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
            Tab(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.inventory_2, size: 16),
                  const SizedBox(width: 4),
                  Flexible(
                    child: Text(
                      'Packages (${_subscribedPackages.length})',
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
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
                _buildRepositoriesTab(),
                _buildPackagesTab(),
              ],
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Quick add subscription
          _showAddSubscriptionDialog();
        },
        backgroundColor: HackerTheme.primaryGreen,
        child: Icon(
          Icons.add,
          color: HackerTheme.darkerGreen,
        ),
      ),
    );
  }

  Widget _buildRepositoriesTab() {
    if (_subscribedRepositories.isEmpty) {
      return _buildEmptyState(
        icon: Icons.bookmark_border,
        title: 'No Subscribed Repositories',
        subtitle: 'Star repositories to see them here',
        actionText: 'Browse Trending',
        onAction: () {
          // Navigate to home
          Navigator.of(context).pop();
        },
      );
    }

    return RefreshIndicator(
      onRefresh: _refreshSubscriptions,
      color: HackerTheme.primaryGreen,
      backgroundColor: HackerTheme.darkerGreen,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _subscribedRepositories.length,
        itemBuilder: (context, index) {
          return _buildSubscribedRepositoryCard(
              _subscribedRepositories[index], index);
        },
      ),
    );
  }

  Widget _buildPackagesTab() {
    if (_subscribedPackages.isEmpty) {
      return _buildEmptyState(
        icon: Icons.inventory_2_outlined,
        title: 'No Subscribed Packages',
        subtitle: 'Follow packages to see them here',
        actionText: 'Browse Trending',
        onAction: () {
          // Navigate to home
          Navigator.of(context).pop();
        },
      );
    }

    return RefreshIndicator(
      onRefresh: _refreshSubscriptions,
      color: HackerTheme.primaryGreen,
      backgroundColor: HackerTheme.darkerGreen,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _subscribedPackages.length,
        itemBuilder: (context, index) {
          return _buildSubscribedPackageCard(_subscribedPackages[index], index);
        },
      ),
    );
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
    required String actionText,
    required VoidCallback onAction,
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
            ElevatedButton(
              onPressed: onAction,
              style: ElevatedButton.styleFrom(
                backgroundColor: HackerTheme.primaryGreen,
                foregroundColor: HackerTheme.darkerGreen,
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
              child: Text(actionText),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubscribedRepositoryCard(GitHubRepository repo, int index) {
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
                IconButton(
                  icon: const Icon(Icons.bookmark),
                  onPressed: () => _unsubscribeRepository(index),
                  color: HackerTheme.primaryGreen,
                ),
                PopupMenuButton<String>(
                  icon: Icon(Icons.more_vert, color: HackerTheme.textGrey),
                  onSelected: (value) {
                    switch (value) {
                      case 'open':
                        // Open in browser
                        break;
                      case 'unsubscribe':
                        _unsubscribeRepository(index);
                        break;
                      case 'details':
                        // Show details
                        break;
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'open',
                      child: Text('Open Repository'),
                    ),
                    const PopupMenuItem(
                      value: 'details',
                      child: Text('View Details'),
                    ),
                    const PopupMenuItem(
                      value: 'unsubscribe',
                      child: Text('Unsubscribe'),
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

            // Stats and info
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
                _buildNewReleaseIndicator(repo),
              ],
            ),
            const SizedBox(height: 8),

            // Subscription info
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: HackerTheme.accentGreen.withOpacity(0.2),
                borderRadius: BorderRadius.circular(4),
                border: Border.all(color: HackerTheme.accentGreen),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.notifications_active,
                    size: 12,
                    color: HackerTheme.accentGreen,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Notifications enabled',
                    style: HackerTheme.captionText().copyWith(
                      color: HackerTheme.accentGreen,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubscribedPackageCard(NpmPackage package, int index) {
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
                IconButton(
                  icon: const Icon(Icons.bookmark),
                  onPressed: () => _unsubscribePackage(index),
                  color: HackerTheme.primaryGreen,
                ),
                PopupMenuButton<String>(
                  icon: Icon(Icons.more_vert, color: HackerTheme.textGrey),
                  onSelected: (value) {
                    switch (value) {
                      case 'open':
                        // Open in browser
                        break;
                      case 'unsubscribe':
                        _unsubscribePackage(index);
                        break;
                      case 'details':
                        // Show details
                        break;
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'open',
                      child: Text('Open Package'),
                    ),
                    const PopupMenuItem(
                      value: 'details',
                      child: Text('View Details'),
                    ),
                    const PopupMenuItem(
                      value: 'unsubscribe',
                      child: Text('Unsubscribe'),
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

            // Stats and info
            Row(
              children: [
                _buildStatChip(Icons.download, package.formattedDownloads),
                const SizedBox(width: 8),
                _buildStatChip(Icons.star, package.stars.toString()),
                const SizedBox(width: 8),
                _buildStatChip(
                    Icons.inventory_2, package.versions.length.toString()),
                const Spacer(),
                _buildNewReleaseIndicator(package),
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

            // Subscription info
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: HackerTheme.accentGreen.withOpacity(0.2),
                borderRadius: BorderRadius.circular(4),
                border: Border.all(color: HackerTheme.accentGreen),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.notifications_active,
                    size: 12,
                    color: HackerTheme.accentGreen,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Release notifications ON',
                    style: HackerTheme.captionText().copyWith(
                      color: HackerTheme.accentGreen,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
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

  Widget _buildNewReleaseIndicator(dynamic item) {
    // Check if there's a new release (simulate)
    final hasNewRelease = DateTime.now()
            .difference(
                item is GitHubRepository ? item.updatedAt : item.modified)
            .inDays <=
        7;

    if (!hasNewRelease) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: HackerTheme.warningOrange.withOpacity(0.2),
        borderRadius: BorderRadius.circular(3),
        border: Border.all(color: HackerTheme.warningOrange),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.fiber_new,
            size: 10,
            color: HackerTheme.warningOrange,
          ),
          const SizedBox(width: 2),
          Text(
            'New',
            style: HackerTheme.captionText().copyWith(
              color: HackerTheme.warningOrange,
              fontSize: 9,
            ),
          ),
        ],
      ),
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

  void _unsubscribeRepository(int index) {
    setState(() {
      _subscribedRepositories.removeAt(index);
    });
    _showSnackBar('Repository unsubscribed');
  }

  void _unsubscribePackage(int index) {
    setState(() {
      _subscribedPackages.removeAt(index);
    });
    _showSnackBar('Package unsubscribed');
  }

  void _showAddSubscriptionDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: HackerTheme.darkGrey,
        title: Text(
          'Add Subscription',
          style: HackerTheme.heading3(),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: Icon(Icons.code, color: HackerTheme.primaryGreen),
              title: Text('GitHub Repository', style: HackerTheme.bodyText()),
              onTap: () {
                Navigator.pop(context);
                _showAddRepositoryDialog();
              },
            ),
            ListTile(
              leading: Icon(Icons.inventory_2, color: HackerTheme.primaryGreen),
              title: Text('NPM Package', style: HackerTheme.bodyText()),
              onTap: () {
                Navigator.pop(context);
                _showAddPackageDialog();
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showAddRepositoryDialog() {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: HackerTheme.darkGrey,
        title: Text(
          'Add GitHub Repository',
          style: HackerTheme.heading3(),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: controller,
              style: HackerTheme.bodyText(),
              decoration: InputDecoration(
                labelText: 'Repository URL or Name',
                labelStyle: HackerTheme.captionText(),
                border: OutlineInputBorder(
                  borderSide: BorderSide(color: HackerTheme.lightGrey),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: HackerTheme.primaryGreen),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text('Cancel', style: HackerTheme.bodyText()),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: () {
                    // Add repository logic here
                    Navigator.pop(context);
                    _showSnackBar('Repository added to subscriptions');
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: HackerTheme.primaryGreen,
                    foregroundColor: HackerTheme.darkerGreen,
                  ),
                  child: Text('Add'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showAddPackageDialog() {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: HackerTheme.darkGrey,
        title: Text(
          'Add NPM Package',
          style: HackerTheme.heading3(),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: controller,
              style: HackerTheme.bodyText(),
              decoration: InputDecoration(
                labelText: 'Package Name',
                labelStyle: HackerTheme.captionText(),
                border: OutlineInputBorder(
                  borderSide: BorderSide(color: HackerTheme.lightGrey),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: HackerTheme.primaryGreen),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text('Cancel', style: HackerTheme.bodyText()),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: () {
                    // Add package logic here
                    Navigator.pop(context);
                    _showSnackBar('Package added to subscriptions');
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: HackerTheme.primaryGreen,
                    foregroundColor: HackerTheme.darkerGreen,
                  ),
                  child: Text('Add'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _exportSubscriptions() {
    // Export functionality
    _showSnackBar('Subscriptions exported successfully');
  }

  void _showClearAllDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: HackerTheme.darkGrey,
        title: Text(
          'Clear All Subscriptions',
          style: HackerTheme.heading3(),
        ),
        content: Text(
          'Are you sure you want to remove all subscriptions? This action cannot be undone.',
          style: HackerTheme.bodyText(),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel', style: HackerTheme.bodyText()),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _subscribedRepositories.clear();
                _subscribedPackages.clear();
              });
              Navigator.pop(context);
              _showSnackBar('All subscriptions cleared');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: HackerTheme.errorRed,
              foregroundColor: Colors.white,
            ),
            child: Text('Clear All'),
          ),
        ],
      ),
    );
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
  List<GitHubRepository> _generateMockSubscribedRepositories() {
    return List.generate(8, (index) {
      return GitHubRepository(
        id: 'sub_repo_$index',
        name: 'subscribed-project-$index',
        fullName: 'user/subscribed-project-$index',
        description:
            'A subscribed repository that provides great functionality.',
        htmlUrl: 'https://github.com/user/subscribed-project-$index',
        cloneUrl: 'https://github.com/user/subscribed-project-$index.git',
        sshUrl: 'git@github.com:user/subscribed-project-$index.git',
        stars: 500 + index * 50,
        forks: 50 + index * 10,
        issues: index % 5,
        watchers: 30 + index * 5,
        language: index % 3 == 0
            ? 'JavaScript'
            : index % 2 == 0
                ? 'Python'
                : 'TypeScript',
        license: index % 2 == 0 ? 'MIT' : 'Apache-2.0',
        createdAt: DateTime.now().subtract(Duration(days: index * 60)),
        updatedAt: DateTime.now().subtract(Duration(days: index % 3)),
        pushedAt: DateTime.now().subtract(Duration(days: index % 2)),
        size: 800 + index * 200,
        isPrivate: false,
        isFork: false,
        defaultBranch: 'main',
        openIssuesCount: index % 3,
        hasDownloads: true,
        hasIssues: true,
        hasPages: index % 4 == 0,
        hasWiki: true,
        ownerLogin: 'subscribeduser$index',
        ownerAvatarUrl: 'https://github.com/subscribeduser$index.png',
        ownerHtmlUrl: 'https://github.com/subscribeduser$index',
        topics: 'subscribed,awesome,technology',
        trendingScore: 500.0 + index * 25.0,
        trendingPeriod: 'daily',
        isSubscribed: true,
      );
    });
  }

  List<NpmPackage> _generateMockSubscribedPackages() {
    return List.generate(6, (index) {
      return NpmPackage(
        name: 'subscribed-pkg-$index',
        version: '2.${index % 5}.${index % 3}',
        description: 'A subscribed npm package with excellent functionality.',
        npmUrl: 'https://www.npmjs.com/package/subscribed-pkg-$index',
        homepage: 'https://subscribed-pkg-$index.com',
        repositoryUrl: 'https://github.com/user/subscribed-pkg-$index',
        modified: DateTime.now().subtract(Duration(days: index * 14)),
        keywords: ['subscribed', 'package', 'awesome'],
        downloads: 5000 + index * 500,
        stars: 200 + index * 25,
        publisher: 'subscribedpub$index',
        maintainers: 'subscribedpub$index, helper$index',
        versions: ['1.0.0', '1.1.0', '2.0.0', '2.1.0'],
        latestVersion: '2.${index % 5}.${index % 3}',
        license: 'MIT',
        dependencies: ['lodash', 'moment'],
        devDependencies: ['jest'],
        trendingScore: 200.0 + index * 20.0,
        trendingPeriod: 'daily',
        isSubscribed: true,
        metrics: {
          'monthlyDownloads': 50000 + index * 2500,
          'weeklyDownloads': 12500 + index * 500,
        },
      );
    });
  }
}
