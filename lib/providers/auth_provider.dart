import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:appwrite/models.dart' as models;
import '../data/services/auth_service.dart';

part 'auth_provider.g.dart';

/// Authentication state notifier
@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  Future<models.User?> build() async {
    final authService = ref.watch(authServiceProvider);
    try {
      // Try to restore session from local storage first
      final restoredUser = await authService.restoreSession();
      if (restoredUser != null) {
        return restoredUser;
      }

      return await authService.getCurrentUser();
    } catch (e) {
      return null;
    }
  }

  /// Sign in with Discord OAuth
  Future<void> signInWithDiscord() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final authService = ref.read(authServiceProvider);
      return await authService.signInWithDiscord();
    });
  }

  /// Sign in with email and password
  Future<void> signInWithEmail(String email, String password) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final authService = ref.read(authServiceProvider);
      return await authService.signInWithEmail(email, password);
    });
  }

  /// Sign up with email and password
  Future<void> signUpWithEmail(
    String email,
    String password,
    String name,
  ) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final authService = ref.read(authServiceProvider);
      return await authService.signUpWithEmail(email, password, name: name);
    });
  }

  /// Sign out
  Future<void> signOut() async {
    final authService = ref.read(authServiceProvider);
    await authService.signOut();
    state = const AsyncValue.data(null);
  }

  /// Refresh current user
  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final authService = ref.read(authServiceProvider);
      return await authService.getCurrentUser();
    });
  }

  /// Enable guest mode
  Future<void> enableGuestMode({String? githubToken, String? npmToken}) async {
    final authService = ref.read(authServiceProvider);
    await authService.enableGuestMode(
        githubToken: githubToken, npmToken: npmToken);
    state = const AsyncValue.data(null);
  }

  /// Check guest mode
  Future<bool> isGuestMode() async {
    final authService = ref.read(authServiceProvider);
    return await authService.isGuestMode();
  }
}

/// Auth service provider
@riverpod
AuthService authService(AuthServiceRef ref) {
  return AuthService();
}

/// Check if user is authenticated
@riverpod
bool isAuthenticated(IsAuthenticatedRef ref) {
  final authState = ref.watch(authNotifierProvider);
  return authState.maybeWhen(
    data: (user) => user != null,
    orElse: () => false,
  );
}
