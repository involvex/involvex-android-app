class GitHubRepository {
  final String id;
  final String name;
  final String fullName;
  final String description;
  final String htmlUrl;
  final String cloneUrl;
  final String sshUrl;
  final int stars;
  final int forks;
  final int issues;
  final int watchers;
  final String language;
  final String? license;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime pushedAt;
  final int size;
  final bool isPrivate;
  final bool isFork;
  final String? defaultBranch;
  final int openIssuesCount;
  final bool hasDownloads;
  final bool hasIssues;
  final bool hasPages;
  final bool hasWiki;
  final String ownerLogin;
  final String ownerAvatarUrl;
  final String ownerHtmlUrl;
  final String? topics;
  final double trendingScore;
  final String trendingPeriod; // 'daily', 'weekly', 'monthly'
  final DateTime? lastReleaseDate;
  final String? latestReleaseTag;
  final String? latestReleaseName;
  final bool isSubscribed;
  final DateTime subscribedAt;

  GitHubRepository({
    required this.id,
    required this.name,
    required this.fullName,
    required this.description,
    required this.htmlUrl,
    required this.cloneUrl,
    required this.sshUrl,
    required this.stars,
    required this.forks,
    required this.issues,
    required this.watchers,
    required this.language,
    this.license,
    required this.createdAt,
    required this.updatedAt,
    required this.pushedAt,
    required this.size,
    required this.isPrivate,
    required this.isFork,
    this.defaultBranch,
    required this.openIssuesCount,
    required this.hasDownloads,
    required this.hasIssues,
    required this.hasPages,
    required this.hasWiki,
    required this.ownerLogin,
    required this.ownerAvatarUrl,
    required this.ownerHtmlUrl,
    this.topics,
    required this.trendingScore,
    required this.trendingPeriod,
    this.lastReleaseDate,
    this.latestReleaseTag,
    this.latestReleaseName,
    this.isSubscribed = false,
    DateTime? subscribedAt,
  }) : subscribedAt = subscribedAt ?? DateTime.now();

  // Factory constructor for API response
  factory GitHubRepository.fromJson(Map<String, dynamic> json) {
    return GitHubRepository(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      fullName: json['full_name'] ?? '',
      description: json['description'] ?? '',
      htmlUrl: json['html_url'] ?? '',
      cloneUrl: json['clone_url'] ?? '',
      sshUrl: json['ssh_url'] ?? '',
      stars: json['stargazers_count'] ?? 0,
      forks: json['forks_count'] ?? 0,
      issues: json['open_issues_count'] ?? 0,
      watchers: json['watchers_count'] ?? 0,
      language: json['language'] ?? 'Unknown',
      license: json['license']?['name'],
      createdAt: DateTime.parse(
          json['created_at'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(
          json['updated_at'] ?? DateTime.now().toIso8601String()),
      pushedAt:
          DateTime.parse(json['pushed_at'] ?? DateTime.now().toIso8601String()),
      size: json['size'] ?? 0,
      isPrivate: json['private'] ?? false,
      isFork: json['fork'] ?? false,
      defaultBranch: json['default_branch'],
      openIssuesCount: json['open_issues_count'] ?? 0,
      hasDownloads: json['has_downloads'] ?? false,
      hasIssues: json['has_issues'] ?? false,
      hasPages: json['has_pages'] ?? false,
      hasWiki: json['has_wiki'] ?? false,
      ownerLogin: json['owner']?['login'] ?? '',
      ownerAvatarUrl: json['owner']?['avatar_url'] ?? '',
      ownerHtmlUrl: json['owner']?['html_url'] ?? '',
      topics: json['topics']?.join(','),
      trendingScore: _calculateTrendingScore(json),
      trendingPeriod: 'daily', // Default, will be updated based on API call
    );
  }

  // Calculate trending score based on stars, forks, and recent activity
  static double _calculateTrendingScore(Map<String, dynamic> json) {
    final stars = json['stargazers_count'] ?? 0;
    final forks = json['forks_count'] ?? 0;
    final recentActivity = _calculateRecentActivity(json['pushed_at']);

    // Weighted scoring algorithm
    return (stars * 0.6) + (forks * 0.3) + (recentActivity * 0.1);
  }

  // Calculate recent activity score based on last push
  static double _calculateRecentActivity(String? pushedAt) {
    if (pushedAt == null) return 0.0;

    final lastPush = DateTime.parse(pushedAt);
    final now = DateTime.now();
    final daysSincePush = now.difference(lastPush).inDays;

    // More recent activity gets higher score
    if (daysSincePush <= 1) return 10.0;
    if (daysSincePush <= 7) return 8.0;
    if (daysSincePush <= 30) return 6.0;
    if (daysSincePush <= 90) return 4.0;
    return 2.0;
  }

  // Create copy with updated fields
  GitHubRepository copyWith({
    String? id,
    String? name,
    String? fullName,
    String? description,
    String? htmlUrl,
    String? cloneUrl,
    String? sshUrl,
    int? stars,
    int? forks,
    int? issues,
    int? watchers,
    String? language,
    String? license,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? pushedAt,
    int? size,
    bool? isPrivate,
    bool? isFork,
    String? defaultBranch,
    int? openIssuesCount,
    bool? hasDownloads,
    bool? hasIssues,
    bool? hasPages,
    bool? hasWiki,
    String? ownerLogin,
    String? ownerAvatarUrl,
    String? ownerHtmlUrl,
    String? topics,
    double? trendingScore,
    String? trendingPeriod,
    DateTime? lastReleaseDate,
    String? latestReleaseTag,
    String? latestReleaseName,
    bool? isSubscribed,
    DateTime? subscribedAt,
  }) {
    return GitHubRepository(
      id: id ?? this.id,
      name: name ?? this.name,
      fullName: fullName ?? this.fullName,
      description: description ?? this.description,
      htmlUrl: htmlUrl ?? this.htmlUrl,
      cloneUrl: cloneUrl ?? this.cloneUrl,
      sshUrl: sshUrl ?? this.sshUrl,
      stars: stars ?? this.stars,
      forks: forks ?? this.forks,
      issues: issues ?? this.issues,
      watchers: watchers ?? this.watchers,
      language: language ?? this.language,
      license: license ?? this.license,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      pushedAt: pushedAt ?? this.pushedAt,
      size: size ?? this.size,
      isPrivate: isPrivate ?? this.isPrivate,
      isFork: isFork ?? this.isFork,
      defaultBranch: defaultBranch ?? this.defaultBranch,
      openIssuesCount: openIssuesCount ?? this.openIssuesCount,
      hasDownloads: hasDownloads ?? this.hasDownloads,
      hasIssues: hasIssues ?? this.hasIssues,
      hasPages: hasPages ?? this.hasPages,
      hasWiki: hasWiki ?? this.hasWiki,
      ownerLogin: ownerLogin ?? this.ownerLogin,
      ownerAvatarUrl: ownerAvatarUrl ?? this.ownerAvatarUrl,
      ownerHtmlUrl: ownerHtmlUrl ?? this.ownerHtmlUrl,
      topics: topics ?? this.topics,
      trendingScore: trendingScore ?? this.trendingScore,
      trendingPeriod: trendingPeriod ?? this.trendingPeriod,
      lastReleaseDate: lastReleaseDate ?? this.lastReleaseDate,
      latestReleaseTag: latestReleaseTag ?? this.latestReleaseTag,
      latestReleaseName: latestReleaseName ?? this.latestReleaseName,
      isSubscribed: isSubscribed ?? this.isSubscribed,
      subscribedAt: subscribedAt ?? this.subscribedAt,
    );
  }

  // Get formatted size string
  String get formattedSize {
    if (size < 1024) return '${size}KB';
    if (size < 1024 * 1024) return '${(size / 1024).toStringAsFixed(1)}MB';
    return '${(size / (1024 * 1024)).toStringAsFixed(1)}GB';
  }

  // Get time ago string
  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(updatedAt);

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

  // Get language color (simplified)
  String get languageColor {
    final colors = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#2b7489',
      'Python': '#3572A5',
      'Java': '#b07219',
      'C++': '#f34b7d',
      'C': '#555555',
      'C#': '#178600',
      'PHP': '#4F5D95',
      'Ruby': '#701516',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'Swift': '#ffac45',
      'Kotlin': '#F18E33',
      'Dart': '#00B4AB',
      'Shell': '#89e051',
      'HTML': '#e34c26',
      'CSS': '#563d7c',
      'Vue': '#4FC08D',
      'React': '#61DAFB',
      'Angular': '#DD0031',
      'Docker': '#384d54',
      'YAML': '#cb171e',
      'JSON': '#292929',
    };

    return colors[language] ?? '#cccccc';
  }

  // Check if has recent activity
  bool get hasRecentActivity {
    final now = DateTime.now();
    final daysSincePush = now.difference(pushedAt).inDays;
    return daysSincePush <= 7; // Active in last week
  }

  // Get release info summary
  String get releaseInfo {
    if (latestReleaseTag == null) return 'No releases';
    if (latestReleaseName == null) return 'v$latestReleaseTag';
    return '$latestReleaseTag - $latestReleaseName';
  }

  // JSON serialization
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'fullName': fullName,
      'description': description,
      'htmlUrl': htmlUrl,
      'cloneUrl': cloneUrl,
      'sshUrl': sshUrl,
      'stars': stars,
      'forks': forks,
      'issues': issues,
      'watchers': watchers,
      'language': language,
      'license': license,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'pushedAt': pushedAt.toIso8601String(),
      'size': size,
      'isPrivate': isPrivate,
      'isFork': isFork,
      'defaultBranch': defaultBranch,
      'openIssuesCount': openIssuesCount,
      'hasDownloads': hasDownloads,
      'hasIssues': hasIssues,
      'hasPages': hasPages,
      'hasWiki': hasWiki,
      'ownerLogin': ownerLogin,
      'ownerAvatarUrl': ownerAvatarUrl,
      'ownerHtmlUrl': ownerHtmlUrl,
      'topics': topics,
      'trendingScore': trendingScore,
      'trendingPeriod': trendingPeriod,
      'lastReleaseDate': lastReleaseDate?.toIso8601String(),
      'latestReleaseTag': latestReleaseTag,
      'latestReleaseName': latestReleaseName,
      'isSubscribed': isSubscribed,
      'subscribedAt': subscribedAt.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'GitHubRepository{name: $name, stars: $stars, language: $language}';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is GitHubRepository && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
