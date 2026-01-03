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

const AUTH_ACTIVE_USER_KEY = '@auth:active_user';
const AUTH_DISCORD_USER_KEY = '@auth:discord_user';
const AUTH_GITHUB_USER_KEY = '@auth:github_user';
const GUEST_MODE_KEY = '@auth:guest';
const AUTH_PROVIDER_KEY = '@auth:provider'; // Stores the provider of the activeUser

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
  activeUser: DiscordUser | GitHubUser | null;
  discordUser: DiscordUser | null;
  githubUser: GitHubUser | null;
  provider: AuthProvider | null; // Provider of the activeUser
  accessToken: string | null; // Access token of the activeUser
  loading: boolean;

  // Actions
  initialize: () => Promise<void>;
  signInWithDiscord: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  linkDiscordAccount: () => Promise<void>;
  linkGitHubAccount: () => Promise<void>;
  signOut: () => Promise<void>;
  enableGuestMode: () => Promise<void>;
  setActiveUser: (user: DiscordUser | GitHubUser, token: string, provider: AuthProvider) => Promise<void>;
  setDiscordUser: (user: DiscordUser | null) => Promise<void>;
  setGitHubUser: (user: GitHubUser | null) => Promise<void>;
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
    activeUser: null,
    discordUser: null,
    githubUser: null,
    provider: null,
    accessToken: null,
    loading: false,

    // Initialize auth state from storage
    initialize: async () => {
      try {
        set(state => {
          state.loading = true;
        });

        const [activeUserJson, discordUserJson, githubUserJson, isGuest, provider, accessToken] = await Promise.all([
          AsyncStorage.getItem(AUTH_ACTIVE_USER_KEY),
          AsyncStorage.getItem(AUTH_DISCORD_USER_KEY),
          AsyncStorage.getItem(AUTH_GITHUB_USER_KEY),
          AsyncStorage.getItem(GUEST_MODE_KEY),
          AsyncStorage.getItem(AUTH_PROVIDER_KEY),
          AsyncStorage.getItem(AUTH_TOKEN_KEY),
        ]);

        if (isGuest === 'true') {
          set(state => {
            state.isGuest = true;
            state.loading = false;
          });
        } else if (activeUserJson && provider && accessToken) {
          const activeUser = JSON.parse(activeUserJson);
          const discordUser = discordUserJson ? JSON.parse(discordUserJson) : null;
          const githubUser = githubUserJson ? JSON.parse(githubUserJson) : null;

          set(state => {
            state.isAuthenticated = true;
            state.activeUser = activeUser;
            state.discordUser = discordUser;
            state.githubUser = githubUser;
            state.provider = provider as AuthProvider;
            state.accessToken = accessToken;
            state.loading = false;
          });

          console.log('Active user authenticated:', 'username' in activeUser ? activeUser.username : activeUser.login);
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
        const userResponse = await fetch('https://discord.com/api/users/@me', {
          headers: { Authorization: `Bearer ${result.accessToken}` },
        });
        const discordUser = await userResponse.json();

        const user: DiscordUser = {
          id: discordUser.id,
          username: discordUser.username,
          discriminator: discordUser.discriminator,
          avatar: discordUser.avatar 
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : null,
          email: discordUser.email,
        };

        await useAuthStore.getState().setActiveUser(user, result.accessToken, 'discord');
        await useAuthStore.getState().setDiscordUser(user);
        
      } catch (error) {
        console.error('Error signing in with Discord:', error);
        set(state => { state.loading = false; });
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
        const userResponse = await fetch('https://api.github.com/user', {
          headers: { Authorization: `Bearer ${result.accessToken}` },
        });
        const githubUser = await userResponse.json();

        const user: GitHubUser = {
          id: githubUser.id,
          login: githubUser.login,
          name: githubUser.name,
          avatar_url: githubUser.avatar_url,
          email: githubUser.email,
        };

        await useAuthStore.getState().setActiveUser(user, result.accessToken, 'github');
        await useAuthStore.getState().setGitHubUser(user);

      } catch (error) {
        console.error('Error signing in with GitHub:', error);
        set(state => { state.loading = false; });
        throw error;
      }
    },

    // Link Discord Account
    linkDiscordAccount: async () => {
      try {
        const result = await authorize(discordConfig);
        const userResponse = await fetch('https://discord.com/api/users/@me', {
          headers: { Authorization: `Bearer ${result.accessToken}` },
        });
        const discordUser = await userResponse.json();

        const user: DiscordUser = {
          id: discordUser.id,
          username: discordUser.username,
          discriminator: discordUser.discriminator,
          avatar: discordUser.avatar 
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : null,
          email: discordUser.email,
        };
        
        await useAuthStore.getState().setDiscordUser(user);

      } catch (error) {
        console.error('Error linking Discord account:', error);
        throw error;
      }
    },

    // Link GitHub Account
    linkGitHubAccount: async () => {
      try {
        const result = await authorize(githubConfig);
        const userResponse = await fetch('https://api.github.com/user', {
          headers: { Authorization: `Bearer ${result.accessToken}` },
        });
        const githubUser = await userResponse.json();

        const user: GitHubUser = {
          id: githubUser.id,
          login: githubUser.login,
          name: githubUser.name,
          avatar_url: githubUser.avatar_url,
          email: githubUser.email,
        };
        
        await useAuthStore.getState().setGitHubUser(user);

      } catch (error) {
        console.error('Error linking GitHub account:', error);
        throw error;
      }
    },

    // Sign out
    signOut: async () => {
      try {
        await Promise.all([
          AsyncStorage.removeItem(AUTH_ACTIVE_USER_KEY),
          AsyncStorage.removeItem(AUTH_DISCORD_USER_KEY),
          AsyncStorage.removeItem(AUTH_GITHUB_USER_KEY),
          AsyncStorage.removeItem(GUEST_MODE_KEY),
          AsyncStorage.removeItem(AUTH_PROVIDER_KEY),
          AsyncStorage.removeItem(AUTH_TOKEN_KEY),
        ]);

        set(state => {
          state.isAuthenticated = false;
          state.isGuest = false;
          state.activeUser = null;
          state.discordUser = null;
          state.githubUser = null;
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
          state.activeUser = null;
          state.discordUser = null;
          state.githubUser = null;
          state.provider = null;
          state.accessToken = null;
        });

        console.log('Guest mode enabled');
      } catch (error) {
        console.error('Error enabling guest mode:', error);
        throw error;
      }
    },

    // Set active user (for initial login)
    setActiveUser: async (user: DiscordUser | GitHubUser, token: string, provider: AuthProvider) => {
      try {
        await Promise.all([
          AsyncStorage.setItem(AUTH_ACTIVE_USER_KEY, JSON.stringify(user)),
          AsyncStorage.setItem(AUTH_TOKEN_KEY, token),
          AsyncStorage.setItem(AUTH_PROVIDER_KEY, provider),
          AsyncStorage.removeItem(GUEST_MODE_KEY),
        ]);

        set(state => {
          state.isAuthenticated = true;
          state.isGuest = false;
          state.activeUser = user;
          state.provider = provider;
          state.accessToken = token;
          state.loading = false;
        });

        console.log('Active user set:', 'username' in user ? user.username : user.login);
      } catch (error) {
        console.error('Error setting active user:', error);
        throw error;
      }
    },

    // Set Discord user (for linking)
    setDiscordUser: async (user: DiscordUser | null) => {
        try {
            if (user) {
                await AsyncStorage.setItem(AUTH_DISCORD_USER_KEY, JSON.stringify(user));
            } else {
                await AsyncStorage.removeItem(AUTH_DISCORD_USER_KEY);
            }
            set(state => { state.discordUser = user; });
        } catch (error) {
            console.error('Error setting Discord user:', error);
            throw error;
        }
    },

    // Set GitHub user (for linking)
    setGitHubUser: async (user: GitHubUser | null) => {
        try {
            if (user) {
                await AsyncStorage.setItem(AUTH_GITHUB_USER_KEY, JSON.stringify(user));
            } else {
                await AsyncStorage.removeItem(AUTH_GITHUB_USER_KEY);
            }
            set(state => { state.githubUser = user; });
        } catch (error) {
            console.error('Error setting GitHub user:', error);
            throw error;
        }
    },
  })),
);

export default useAuthStore;