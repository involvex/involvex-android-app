import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../data/models/github_repository.dart';
import '../data/models/npm_package.dart';
import '../data/services/github_service.dart';
import '../data/services/npm_service.dart';

part 'trending_provider.g.dart';

/// Trending timeframe enum
enum TrendingTimeframe { daily, weekly, monthly }

/// GitHub Service Provider
@riverpod
GitHubService githubService(GithubServiceRef ref) {
  return GitHubService();
}

/// npm Service Provider
@riverpod
NpmService npmService(NpmServiceRef ref) {
  return NpmService();
}

/// GitHub trending repositories provider
@riverpod
class TrendingRepositories extends _$TrendingRepositories {
  @override
  Future<List<GitHubRepository>> build(TrendingTimeframe timeframe) async {
    final service = ref.watch(githubServiceProvider);
    final timeframeString = timeframeToString(timeframe);
    return await service.getTrending(timeframeString);
  }

  /// Refresh trending repositories
  Future<void> refresh(TrendingTimeframe timeframe) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => build(timeframe));
  }
}

/// npm trending packages provider
@riverpod
class TrendingPackages extends _$TrendingPackages {
  @override
  Future<List<NpmPackage>> build(TrendingTimeframe timeframe) async {
    final service = ref.watch(npmServiceProvider);
    final timeframeString = timeframeToString(timeframe);
    return await service.getTrending(timeframeString);
  }

  /// Refresh trending packages
  Future<void> refresh(TrendingTimeframe timeframe) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => build(timeframe));
  }
}

/// Selected timeframe state provider
@riverpod
class SelectedTimeframe extends _$SelectedTimeframe {
  @override
  TrendingTimeframe build() {
    return TrendingTimeframe.daily;
  }

  void setTimeframe(TrendingTimeframe timeframe) {
    state = timeframe;
  }
}

/// Convert string to TrendingTimeframe
TrendingTimeframe stringToTimeframe(String value) {
  switch (value.toLowerCase()) {
    case 'daily':
      return TrendingTimeframe.daily;
    case 'weekly':
      return TrendingTimeframe.weekly;
    case 'monthly':
      return TrendingTimeframe.monthly;
    default:
      return TrendingTimeframe.daily;
  }
}

/// Convert TrendingTimeframe to string
String timeframeToString(TrendingTimeframe timeframe) {
  switch (timeframe) {
    case TrendingTimeframe.daily:
      return 'daily';
    case TrendingTimeframe.weekly:
      return 'weekly';
    case TrendingTimeframe.monthly:
      return 'monthly';
  }
}
