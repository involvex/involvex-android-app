// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'trending_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$githubServiceHash() => r'ab2eaf530c965db80626d2bc06744296a0dc62c4';

/// GitHub Service Provider
///
/// Copied from [githubService].
@ProviderFor(githubService)
final githubServiceProvider = AutoDisposeProvider<GitHubService>.internal(
  githubService,
  name: r'githubServiceProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$githubServiceHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

typedef GithubServiceRef = AutoDisposeProviderRef<GitHubService>;
String _$npmServiceHash() => r'd4076008f2ac2bf4dc9eb75de5f8266caa9e3272';

/// npm Service Provider
///
/// Copied from [npmService].
@ProviderFor(npmService)
final npmServiceProvider = AutoDisposeProvider<NpmService>.internal(
  npmService,
  name: r'npmServiceProvider',
  debugGetCreateSourceHash:
      const bool.fromEnvironment('dart.vm.product') ? null : _$npmServiceHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

typedef NpmServiceRef = AutoDisposeProviderRef<NpmService>;
String _$trendingRepositoriesHash() =>
    r'9a4484bcb3e85f211002936152492f31841d14eb';

/// Copied from Dart SDK
class _SystemHash {
  _SystemHash._();

  static int combine(int hash, int value) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + value);
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x0007ffff & hash) << 10));
    return hash ^ (hash >> 6);
  }

  static int finish(int hash) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x03ffffff & hash) << 3));
    // ignore: parameter_assignments
    hash = hash ^ (hash >> 11);
    return 0x1fffffff & (hash + ((0x00003fff & hash) << 15));
  }
}

abstract class _$TrendingRepositories
    extends BuildlessAutoDisposeAsyncNotifier<List<GitHubRepository>> {
  late final TrendingTimeframe timeframe;

  FutureOr<List<GitHubRepository>> build(
    TrendingTimeframe timeframe,
  );
}

/// GitHub trending repositories provider
///
/// Copied from [TrendingRepositories].
@ProviderFor(TrendingRepositories)
const trendingRepositoriesProvider = TrendingRepositoriesFamily();

/// GitHub trending repositories provider
///
/// Copied from [TrendingRepositories].
class TrendingRepositoriesFamily
    extends Family<AsyncValue<List<GitHubRepository>>> {
  /// GitHub trending repositories provider
  ///
  /// Copied from [TrendingRepositories].
  const TrendingRepositoriesFamily();

  /// GitHub trending repositories provider
  ///
  /// Copied from [TrendingRepositories].
  TrendingRepositoriesProvider call(
    TrendingTimeframe timeframe,
  ) {
    return TrendingRepositoriesProvider(
      timeframe,
    );
  }

  @override
  TrendingRepositoriesProvider getProviderOverride(
    covariant TrendingRepositoriesProvider provider,
  ) {
    return call(
      provider.timeframe,
    );
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'trendingRepositoriesProvider';
}

/// GitHub trending repositories provider
///
/// Copied from [TrendingRepositories].
class TrendingRepositoriesProvider extends AutoDisposeAsyncNotifierProviderImpl<
    TrendingRepositories, List<GitHubRepository>> {
  /// GitHub trending repositories provider
  ///
  /// Copied from [TrendingRepositories].
  TrendingRepositoriesProvider(
    TrendingTimeframe timeframe,
  ) : this._internal(
          () => TrendingRepositories()..timeframe = timeframe,
          from: trendingRepositoriesProvider,
          name: r'trendingRepositoriesProvider',
          debugGetCreateSourceHash:
              const bool.fromEnvironment('dart.vm.product')
                  ? null
                  : _$trendingRepositoriesHash,
          dependencies: TrendingRepositoriesFamily._dependencies,
          allTransitiveDependencies:
              TrendingRepositoriesFamily._allTransitiveDependencies,
          timeframe: timeframe,
        );

  TrendingRepositoriesProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.timeframe,
  }) : super.internal();

  final TrendingTimeframe timeframe;

  @override
  FutureOr<List<GitHubRepository>> runNotifierBuild(
    covariant TrendingRepositories notifier,
  ) {
    return notifier.build(
      timeframe,
    );
  }

  @override
  Override overrideWith(TrendingRepositories Function() create) {
    return ProviderOverride(
      origin: this,
      override: TrendingRepositoriesProvider._internal(
        () => create()..timeframe = timeframe,
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        timeframe: timeframe,
      ),
    );
  }

  @override
  AutoDisposeAsyncNotifierProviderElement<TrendingRepositories,
      List<GitHubRepository>> createElement() {
    return _TrendingRepositoriesProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is TrendingRepositoriesProvider &&
        other.timeframe == timeframe;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, timeframe.hashCode);

    return _SystemHash.finish(hash);
  }
}

mixin TrendingRepositoriesRef
    on AutoDisposeAsyncNotifierProviderRef<List<GitHubRepository>> {
  /// The parameter `timeframe` of this provider.
  TrendingTimeframe get timeframe;
}

class _TrendingRepositoriesProviderElement
    extends AutoDisposeAsyncNotifierProviderElement<TrendingRepositories,
        List<GitHubRepository>> with TrendingRepositoriesRef {
  _TrendingRepositoriesProviderElement(super.provider);

  @override
  TrendingTimeframe get timeframe =>
      (origin as TrendingRepositoriesProvider).timeframe;
}

String _$trendingPackagesHash() => r'10a994a9b3985e4bd3ed9993db4db0bf3ac91cf5';

abstract class _$TrendingPackages
    extends BuildlessAutoDisposeAsyncNotifier<List<NpmPackage>> {
  late final TrendingTimeframe timeframe;

  FutureOr<List<NpmPackage>> build(
    TrendingTimeframe timeframe,
  );
}

/// npm trending packages provider
///
/// Copied from [TrendingPackages].
@ProviderFor(TrendingPackages)
const trendingPackagesProvider = TrendingPackagesFamily();

/// npm trending packages provider
///
/// Copied from [TrendingPackages].
class TrendingPackagesFamily extends Family<AsyncValue<List<NpmPackage>>> {
  /// npm trending packages provider
  ///
  /// Copied from [TrendingPackages].
  const TrendingPackagesFamily();

  /// npm trending packages provider
  ///
  /// Copied from [TrendingPackages].
  TrendingPackagesProvider call(
    TrendingTimeframe timeframe,
  ) {
    return TrendingPackagesProvider(
      timeframe,
    );
  }

  @override
  TrendingPackagesProvider getProviderOverride(
    covariant TrendingPackagesProvider provider,
  ) {
    return call(
      provider.timeframe,
    );
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'trendingPackagesProvider';
}

/// npm trending packages provider
///
/// Copied from [TrendingPackages].
class TrendingPackagesProvider extends AutoDisposeAsyncNotifierProviderImpl<
    TrendingPackages, List<NpmPackage>> {
  /// npm trending packages provider
  ///
  /// Copied from [TrendingPackages].
  TrendingPackagesProvider(
    TrendingTimeframe timeframe,
  ) : this._internal(
          () => TrendingPackages()..timeframe = timeframe,
          from: trendingPackagesProvider,
          name: r'trendingPackagesProvider',
          debugGetCreateSourceHash:
              const bool.fromEnvironment('dart.vm.product')
                  ? null
                  : _$trendingPackagesHash,
          dependencies: TrendingPackagesFamily._dependencies,
          allTransitiveDependencies:
              TrendingPackagesFamily._allTransitiveDependencies,
          timeframe: timeframe,
        );

  TrendingPackagesProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.timeframe,
  }) : super.internal();

  final TrendingTimeframe timeframe;

  @override
  FutureOr<List<NpmPackage>> runNotifierBuild(
    covariant TrendingPackages notifier,
  ) {
    return notifier.build(
      timeframe,
    );
  }

  @override
  Override overrideWith(TrendingPackages Function() create) {
    return ProviderOverride(
      origin: this,
      override: TrendingPackagesProvider._internal(
        () => create()..timeframe = timeframe,
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        timeframe: timeframe,
      ),
    );
  }

  @override
  AutoDisposeAsyncNotifierProviderElement<TrendingPackages, List<NpmPackage>>
      createElement() {
    return _TrendingPackagesProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is TrendingPackagesProvider && other.timeframe == timeframe;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, timeframe.hashCode);

    return _SystemHash.finish(hash);
  }
}

mixin TrendingPackagesRef
    on AutoDisposeAsyncNotifierProviderRef<List<NpmPackage>> {
  /// The parameter `timeframe` of this provider.
  TrendingTimeframe get timeframe;
}

class _TrendingPackagesProviderElement
    extends AutoDisposeAsyncNotifierProviderElement<TrendingPackages,
        List<NpmPackage>> with TrendingPackagesRef {
  _TrendingPackagesProviderElement(super.provider);

  @override
  TrendingTimeframe get timeframe =>
      (origin as TrendingPackagesProvider).timeframe;
}

String _$selectedTimeframeHash() => r'9b5a070cc71d9c9a1cfb21b97646197c4c253dab';

/// Selected timeframe state provider
///
/// Copied from [SelectedTimeframe].
@ProviderFor(SelectedTimeframe)
final selectedTimeframeProvider =
    AutoDisposeNotifierProvider<SelectedTimeframe, TrendingTimeframe>.internal(
  SelectedTimeframe.new,
  name: r'selectedTimeframeProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$selectedTimeframeHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

typedef _$SelectedTimeframe = AutoDisposeNotifier<TrendingTimeframe>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member
