/**
 * Auth Store
 * Manages authentication state (Discord OAuth)
 * Uses Zustand for state management
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authorize } from 'react-native-app-auth';
import { ENV } from '../config/env';

const AUTH_TOKEN_KEY = '@auth:token';
const AUTH_USER_KEY = '@auth:user';
const GUEST_MODE_KEY = '@auth:guest';
const AUTH_PROVIDER_KEY = '@auth:provider';

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email: string | null;
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  email: string | null;
}

export type AuthProvider = 'discord' | 'github';

interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  user: DiscordUser | GitHubUser | null;
  provider: AuthProvider | null;
  accessToken: string | null;
  loading: boolean;

  // Actions
  initialize: () => Promise<void>;
  signInWithDiscord: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  enableGuestMode: () => Promise<void>;
  setUser: (user: DiscordUser | GitHubUser, token: string, provider: AuthProvider) => Promise<void>;
}

const discordConfig = {
  clientId: ENV.DISCORD_CLIENT_ID,
  clientSecret: ENV.DISCORD_CLIENT_SECRET,
  redirectUrl: ENV.DISCORD_OAUTH_CALLBACK,
  scopes: ['identify', 'email'],
  serviceConfiguration: {
    authorizationEndpoint: 'https://discord.com/api/oauth2/authorize',
    tokenEndpoint: 'https://discord.com/api/oauth2/token',
    revocationEndpoint: 'https://discord.com/api/oauth2/token/revoke',
  },
};

const githubConfig = {
  clientId: ENV.GITHUB_OAUTH_CLIENT_ID,
  clientSecret: ENV.GITHUB_OAUTH_CLIENT_SECRET,
  redirectUrl: ENV.GITHUB_OAUTH_CALLBACK,
  scopes: ['read:user', 'user:email'],
  serviceConfiguration: {
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    revocationEndpoint: 'https://github.com/settings/connections/applications/' + ENV.GITHUB_OAUTH_CLIENT_ID,
  },
};

export const useAuthStore = create<AuthState>()(
  immer(set => ({
    // Initial State
    isAuthenticated: false,
    isGuest: false,
    user: null,
    provider: null,
    accessToken: null,
    loading: false,

    // Initialize auth state from storage
    initialize: async () => {
      try {
        set(state => {
          state.loading = true;
        });

        const [token, userJson, isGuest, provider] = await Promise.all([
          AsyncStorage.getItem(AUTH_TOKEN_KEY),
          AsyncStorage.getItem(AUTH_USER_KEY),
          AsyncStorage.getItem(GUEST_MODE_KEY),
          AsyncStorage.getItem(AUTH_PROVIDER_KEY),
        ]);

        if (isGuest === 'true') {
          set(state => {
            state.isGuest = true;
            state.loading = false;
          });
        } else if (token && userJson && provider) {
          const user = JSON.parse(userJson);

          set(state => {
            state.isAuthenticated = true;
            state.user = user;
            state.provider = provider as AuthProvider;
            state.accessToken = token;
            state.loading = false;
          });

          console.log('User authenticated:', user.username || user.login);
        } else {
          set(state => {
            state.loading = false;
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);

        set(state => {
          state.loading = false;
        });
      }
    },

    // Sign in with Discord OAuth
    signInWithDiscord: async () => {
      try {
        set(state => {
          state.loading = true;
        });

        const result = await authorize(discordConfig);
        console.log('Discord OAuth result:', result);
        // Fetch user info
        const userResponse = await fetch('https://discord.com/api/users/@me', {
          headers: {
            Authorization: `Bearer ${result.accessToken}`,
          },
        });
        console.log('Discord user info:', userResponse);
        const discordUser = await userResponse.json();
        console.log('Discord user info:', discordUser);

        const user: DiscordUser = {
          id: discordUser.id,
          username: discordUser.username,
          discriminator: discordUser.discriminator,
          avatar: discordUser.avatar 
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : null,
          email: discordUser.email,
        };

        await useAuthStore.getState().setUser(user, result.accessToken, 'discord');
      } catch (error) {
        console.error('Error signing in with Discord:', error);
        set(state => {
          state.loading = false;
        });
        throw error;
      }
    },

    // Sign in with GitHub OAuth
    signInWithGitHub: async () => {
      try {
        set(state => {
          state.loading = true;
        });

        const result = await authorize(githubConfig);
        console.log('GitHub OAuth result:', result);
        // Fetch user info
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${result.accessToken}`,
          },
        });
        console.log('GitHub user info:', userResponse);
        const githubUser = await userResponse.json();
        console.log('GitHub user info:', githubUser);

        const user: GitHubUser = {
          id: githubUser.id,
          login: githubUser.login,
          name: githubUser.name,
          avatar_url: githubUser.avatar_url,
          email: githubUser.email,
        };

        await useAuthStore.getState().setUser(user, result.accessToken, 'github');
      } catch (error) {
        console.error('Error signing in with GitHub:', error);
        set(state => {
          state.loading = false;
        });
        throw error;
      }
    },

    // Sign out
    signOut: async () => {
      try {
        // Clear storage
        await Promise.all([
          AsyncStorage.removeItem(AUTH_TOKEN_KEY),
          AsyncStorage.removeItem(AUTH_USER_KEY),
          AsyncStorage.removeItem(GUEST_MODE_KEY),
          AsyncStorage.removeItem(AUTH_PROVIDER_KEY),
        ]);

        set(state => {
          state.isAuthenticated = false;
          state.isGuest = false;
          state.user = null;
          state.provider = null;
          state.accessToken = null;
        });

        console.log('User signed out');
      } catch (error) {
        console.error('Error signing out:', error);
        throw error;
      }
    },

    // Enable guest mode (no auth)
    enableGuestMode: async () => {
      try {
        await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');

        set(state => {
          state.isGuest = true;
          state.isAuthenticated = false;
          state.user = null;
          state.accessToken = null;
        });

        console.log('Guest mode enabled');
      } catch (error) {
        console.error('Error enabling guest mode:', error);
        throw error;
      }
    },

    // Set user and token (called after OAuth success)
    setUser: async (user: DiscordUser | GitHubUser, token: string, provider: AuthProvider) => {
      try {
        await Promise.all([
          AsyncStorage.setItem(AUTH_TOKEN_KEY, token),
          AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user)),
          AsyncStorage.setItem(AUTH_PROVIDER_KEY, provider),
          AsyncStorage.removeItem(GUEST_MODE_KEY),
        ]);

        set(state => {
          state.isAuthenticated = true;
          state.isGuest = false;
          state.user = user;
          state.provider = provider;
          state.accessToken = token;
          state.loading = false;
        });

        console.log('User set:', 'username' in user ? user.username : user.login);
      } catch (error) {
        console.error('Error setting user:', error);
        throw error;
      }
    },
  })),
);

export default useAuthStore;
