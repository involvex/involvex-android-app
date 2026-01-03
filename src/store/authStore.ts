/**
 * Auth Store
 * Manages authentication state (Discord OAuth)
 * Uses Zustand for state management
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@auth:token';
const AUTH_USER_KEY = '@auth:user';
const GUEST_MODE_KEY = '@auth:guest';

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  user: DiscordUser | null;
  accessToken: string | null;
  loading: boolean;

  // Actions
  initialize: () => Promise<void>;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
  enableGuestMode: () => Promise<void>;
  setUser: (user: DiscordUser, token: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  immer(set => ({
    // Initial State
    isAuthenticated: false,
    isGuest: false,
    user: null,
    accessToken: null,
    loading: false,

    // Initialize auth state from storage
    initialize: async () => {
      try {
        set(state => {
          state.loading = true;
        });

        const [token, userJson, isGuest] = await Promise.all([
          AsyncStorage.getItem(AUTH_TOKEN_KEY),
          AsyncStorage.getItem(AUTH_USER_KEY),
          AsyncStorage.getItem(GUEST_MODE_KEY),
        ]);

        if (isGuest === 'true') {
          set(state => {
            state.isGuest = true;
            state.loading = false;
          });
        } else if (token && userJson) {
          const user = JSON.parse(userJson) as DiscordUser;

          set(state => {
            state.isAuthenticated = true;
            state.user = user;
            state.accessToken = token;
            state.loading = false;
          });

          console.log('User authenticated:', user.username);
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
    // TODO: Implement with react-native-app-auth
    signInWithDiscord: async () => {
      try {
        set(state => {
          state.loading = true;
        });

        // Placeholder - will be implemented with react-native-app-auth
        console.warn('Discord OAuth not yet implemented');

        set(state => {
          state.loading = false;
        });
      } catch (error) {
        console.error('Error signing in with Discord:', error);

        set(state => {
          state.loading = false;
        });

        throw error;
      }
    },

    // Sign out
    signOut: async () => {
      try {
        await Promise.all([
          AsyncStorage.removeItem(AUTH_TOKEN_KEY),
          AsyncStorage.removeItem(AUTH_USER_KEY),
          AsyncStorage.removeItem(GUEST_MODE_KEY),
        ]);

        set(state => {
          state.isAuthenticated = false;
          state.isGuest = false;
          state.user = null;
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
    setUser: async (user: DiscordUser, token: string) => {
      try {
        await Promise.all([
          AsyncStorage.setItem(AUTH_TOKEN_KEY, token),
          AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user)),
          AsyncStorage.removeItem(GUEST_MODE_KEY),
        ]);

        set(state => {
          state.isAuthenticated = true;
          state.isGuest = false;
          state.user = user;
          state.accessToken = token;
        });

        console.log('User set:', user.username);
      } catch (error) {
        console.error('Error setting user:', error);
        throw error;
      }
    },
  })),
);

export default useAuthStore;
