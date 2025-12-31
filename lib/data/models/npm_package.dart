class NpmPackage {
  final String name;
  final String version;
  final String description;
  final String npmUrl;
  final String homepage;
  final String repositoryUrl;
  final String? readme;
  final DateTime modified;
  final List<String> keywords;
  final int downloads;
  final int stars;
  final String publisher;
  final String? publisherAvatarUrl;
  final String maintainers;
  final List<String> versions;
  final String? latestVersion;
  final String? license;
  final List<String> dependencies;
  final List<String> devDependencies;
  final int openIssues;
  final int openPullRequests;
  final bool hasSecurityVulnerabilities;
  final String? securityPolicyUrl;
  final double trendingScore;
  final String trendingPeriod; // 'daily', 'weekly', 'monthly'
  final DateTime? lastReleaseDate;
  final String? latestReleaseTag;
  final String? latestReleaseName;
  final bool isSubscribed;
  final DateTime subscribedAt;
  final Map<String, dynamic>? metrics;

  NpmPackage({
    required this.name,
    required this.version,
    required this.description,
    required this.npmUrl,
    required this.homepage,
    required this.repositoryUrl,
    this.readme,
    required this.modified,
    required this.keywords,
    required this.downloads,
    this.stars = 0,
    required this.publisher,
    this.publisherAvatarUrl,
    required this.maintainers,
    required this.versions,
    this.latestVersion,
    this.license,
    required this.dependencies,
    required this.devDependencies,
    this.openIssues = 0,
    this.openPullRequests = 0,
    this.hasSecurityVulnerabilities = false,
    this.securityPolicyUrl,
    required this.trendingScore,
    required this.trendingPeriod,
    this.lastReleaseDate,
    this.latestReleaseTag,
    this.latestReleaseName,
    this.isSubscribed = false,
    DateTime? subscribedAt,
    this.metrics,
  }) : subscribedAt = subscribedAt ?? DateTime.now();

  // Factory constructor for API response
  factory NpmPackage.fromJson(Map<String, dynamic> json) {
    return NpmPackage(
      name: json['name'] ?? '',
      version: json['version'] ?? '',
      description: json['description'] ?? '',
      npmUrl: 'https://www.npmjs.com/package/${json['name'] ?? ''}',
      homepage: json['homepage'] ?? '',
      repositoryUrl: json['repository']?['url'] ?? '',
      readme: json['readme'],
      modified: json['modified'] != null
          ? DateTime.tryParse(json['modified']) ?? DateTime.now()
          : DateTime.now(),
      keywords: List<String>.from(json['keywords'] ?? []),
      downloads: json['dist']?['unpackedSize'] ?? 0,
      stars: json['githubStars'] ?? 0,
      publisher: json['publisher']?['username'] ?? '',
      publisherAvatarUrl: json['publisher']?['email'],
      maintainers: _formatMaintainers(json['maintainers'] ?? []),
      versions: json['versions'] != null && json['versions'] is Map
          ? List<String>.from((json['versions'] as Map<String, dynamic>).keys)
          : [],
      latestVersion: json['dist-tags']?['latest'] ?? json['version'],
      license: json['license'],
      dependencies:
          _extractDependencies(json['versions']?['latest']?['dependencies']),
      devDependencies:
          _extractDependencies(json['versions']?['latest']?['devDependencies']),
      openIssues: _extractOpenIssues(json),
      openPullRequests: _extractOpenPullRequests(json),
      hasSecurityVulnerabilities: json['hasSecurityVulnerabilities'] ?? false,
      securityPolicyUrl: json['securityPolicy'],
      trendingScore: _calculateTrendingScore(json),
      trendingPeriod: 'daily',
      lastReleaseDate: _extractLatestReleaseDate(json),
      latestReleaseTag: json['dist-tags']?['latest'] ?? json['version'],
      latestReleaseName: json['name'],
      metrics: json['metrics'],
    );
  }

  // Extract maintainers as formatted string
  static String _formatMaintainers(List<dynamic> maintainers) {
    if (maintainers.isEmpty) return 'No maintainers';
    return maintainers
        .map((m) => m['username'] ?? m['email'] ?? 'Unknown')
        .join(', ');
  }

  // Extract dependencies
  static List<String> _extractDependencies(Map<String, dynamic>? deps) {
    if (deps == null) return [];
    return deps.keys.toList();
  }

  // Extract open issues count
  static int _extractOpenIssues(Map<String, dynamic> json) {
    final repo = json['repository'];
    if (repo is String) {
      // Extract from GitHub URL
      final match = RegExp(r'github\.com/([^/]+/[^/]+)').firstMatch(repo);
      if (match != null) {
        // In a real implementation, you'd make a separate API call to GitHub
        return 0; // Placeholder
      }
    }
    return 0;
  }

  // Extract open pull requests count
  static int _extractOpenPullRequests(Map<String, dynamic> json) {
    // Similar to issues, would need GitHub API integration
    return 0; // Placeholder
  }

  // Extract latest release date
  static DateTime? _extractLatestReleaseDate(Map<String, dynamic> json) {
    final latest = json['versions']?['latest'];
    if (latest != null && latest['time'] != null) {
      return DateTime.parse(latest['time']);
    }
    return null;
  }

  // Calculate trending score
  static double _calculateTrendingScore(Map<String, dynamic> json) {
    final downloads = json['dist']?['unpackedSize'] ?? 0;
    final stars = json['githubStars'] ?? 0;

    final modifiedDate = json['modified'] != null
        ? DateTime.tryParse(json['modified']) ?? DateTime.now()
        : DateTime.now();
    final recentActivity = _calculateRecentActivity(modifiedDate);

    // Weighted scoring algorithm for npm packages
    return (downloads * 0.4) + (stars * 0.4) + (recentActivity * 0.2);
  }

  // Calculate recent activity score
  static double _calculateRecentActivity(DateTime modified) {
    final now = DateTime.now();
    final daysSinceModified = now.difference(modified).inDays;

    if (daysSinceModified <= 1) return 10.0;
    if (daysSinceModified <= 7) return 8.0;
    if (daysSinceModified <= 30) return 6.0;
    if (daysSinceModified <= 90) return 4.0;
    return 2.0;
  }

  // Create copy with updated fields
  NpmPackage copyWith({
    String? name,
    String? version,
    String? description,
    String? npmUrl,
    String? homepage,
    String? repositoryUrl,
    String? readme,
    DateTime? modified,
    List<String>? keywords,
    int? downloads,
    int? stars,
    String? publisher,
    String? publisherAvatarUrl,
    String? maintainers,
    List<String>? versions,
    String? latestVersion,
    String? license,
    List<String>? dependencies,
    List<String>? devDependencies,
    int? openIssues,
    int? openPullRequests,
    bool? hasSecurityVulnerabilities,
    String? securityPolicyUrl,
    double? trendingScore,
    String? trendingPeriod,
    DateTime? lastReleaseDate,
    String? latestReleaseTag,
    String? latestReleaseName,
    bool? isSubscribed,
    DateTime? subscribedAt,
    Map<String, dynamic>? metrics,
  }) {
    return NpmPackage(
      name: name ?? this.name,
      version: version ?? this.version,
      description: description ?? this.description,
      npmUrl: npmUrl ?? this.npmUrl,
      homepage: homepage ?? this.homepage,
      repositoryUrl: repositoryUrl ?? this.repositoryUrl,
      readme: readme ?? this.readme,
      modified: modified ?? this.modified,
      keywords: keywords ?? this.keywords,
      downloads: downloads ?? this.downloads,
      stars: stars ?? this.stars,
      publisher: publisher ?? this.publisher,
      publisherAvatarUrl: publisherAvatarUrl ?? this.publisherAvatarUrl,
      maintainers: maintainers ?? this.maintainers,
      versions: versions ?? this.versions,
      latestVersion: latestVersion ?? this.latestVersion,
      license: license ?? this.license,
      dependencies: dependencies ?? this.dependencies,
      devDependencies: devDependencies ?? this.devDependencies,
      openIssues: openIssues ?? this.openIssues,
      openPullRequests: openPullRequests ?? this.openPullRequests,
      hasSecurityVulnerabilities:
          hasSecurityVulnerabilities ?? this.hasSecurityVulnerabilities,
      securityPolicyUrl: securityPolicyUrl ?? this.securityPolicyUrl,
      trendingScore: trendingScore ?? this.trendingScore,
      trendingPeriod: trendingPeriod ?? this.trendingPeriod,
      lastReleaseDate: lastReleaseDate ?? this.lastReleaseDate,
      latestReleaseTag: latestReleaseTag ?? this.latestReleaseTag,
      latestReleaseName: latestReleaseName ?? this.latestReleaseName,
      isSubscribed: isSubscribed ?? this.isSubscribed,
      subscribedAt: subscribedAt ?? this.subscribedAt,
      metrics: metrics ?? this.metrics,
    );
  }

  // Get formatted downloads string
  String get formattedDownloads {
    if (downloads < 1000) return downloads.toString();
    if (downloads < 1000000) return '${(downloads / 1000).toStringAsFixed(1)}K';
    return '${(downloads / 1000000).toStringAsFixed(1)}M';
  }

  // Get time ago string
  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(modified);

    if (difference.inDays > 365) {
      return '${difference.inDays ~/ 365} years ago';
    } else if (difference.inDays > 30) {
      return '${difference.inDays ~/ 30} months ago';
    } else if (difference.inDays > 0) {
      return '${difference.inDays} days ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hours ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} minutes ago';
    } else {
      return 'Just now';
    }
  }

  // Get keywords as formatted string
  String get keywordsString {
    if (keywords.isEmpty) return 'No keywords';
    return keywords.join(', ');
  }

  // Check if has recent activity
  bool get hasRecentActivity {
    final now = DateTime.now();
    final daysSinceModified = now.difference(modified).inDays;
    return daysSinceModified <= 7; // Active in last week
  }

  // Get release info summary
  String get releaseInfo {
    if (latestReleaseTag == null) return 'No releases';
    if (latestReleaseName == null) return 'v$latestReleaseTag';
    return '$latestReleaseTag - $latestReleaseName';
  }

  // Check if package is deprecated
  bool get isDeprecated {
    return version.contains('DEPRECATED') || description.contains('deprecated');
  }

  // Get dependency count
  int get dependencyCount => dependencies.length;

  // Get dev dependency count
  int get devDependencyCount => devDependencies.length;

  // Get total dependency count
  int get totalDependencyCount => dependencyCount + devDependencyCount;

  // Check if has high impact dependencies
  bool get hasHighImpactDependencies {
    final highImpact = ['react', 'angular', 'vue', 'webpack', 'typescript'];
    return dependencies.any((dep) =>
        highImpact.any((impact) => dep.toLowerCase().contains(impact)));
  }

  // Get package size in bytes
  int get packageSize => downloads;

  // Get formatted package size
  String get formattedSize {
    if (downloads < 1024) return '${downloads}B';
    if (downloads < 1024 * 1024) {
      return '${(downloads / 1024).toStringAsFixed(1)}KB';
    }
    return '${(downloads / (1024 * 1024)).toStringAsFixed(1)}MB';
  }

  // JSON serialization
  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'version': version,
      'description': description,
      'npmUrl': npmUrl,
      'homepage': homepage,
      'repositoryUrl': repositoryUrl,
      'readme': readme,
      'modified': modified.toIso8601String(),
      'keywords': keywords,
      'downloads': downloads,
      'stars': stars,
      'publisher': publisher,
      'publisherAvatarUrl': publisherAvatarUrl,
      'maintainers': maintainers,
      'versions': versions,
      'latestVersion': latestVersion,
      'license': license,
      'dependencies': dependencies,
      'devDependencies': devDependencies,
      'openIssues': openIssues,
      'openPullRequests': openPullRequests,
      'hasSecurityVulnerabilities': hasSecurityVulnerabilities,
      'securityPolicyUrl': securityPolicyUrl,
      'trendingScore': trendingScore,
      'trendingPeriod': trendingPeriod,
      'lastReleaseDate': lastReleaseDate?.toIso8601String(),
      'latestReleaseTag': latestReleaseTag,
      'latestReleaseName': latestReleaseName,
      'isSubscribed': isSubscribed,
      'subscribedAt': subscribedAt.toIso8601String(),
      'metrics': metrics,
    };
  }

  @override
  String toString() {
    return 'NpmPackage{name: $name, version: $version, downloads: $downloads}';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is NpmPackage && other.name == name;
  }

  @override
  int get hashCode => name.hashCode;
}
