/**
 * Trending Store
 * Manages trending repositories and packages state
 * Uses Zustand for state management
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { TimeframeType } from '../api/github/githubClient';
import { githubService } from '../api/github/githubService';
import { npmService } from '../api/npm/npmService';
import { GitHubRepository } from '../models/GitHubRepository';
import { NpmPackage } from '../models/NpmPackage';

interface TrendingState {
  // State
  timeframe: TimeframeType;
  language: string | null;
  sortBy: 'stars' | 'forks' | 'updated' | 'best-match';
  sortOrder: 'asc' | 'desc';
  githubRepos: GitHubRepository[];
  npmPackages: NpmPackage[];
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;

  // Actions
  setTimeframe: (timeframe: TimeframeType) => void;
  setLanguage: (language: string | null) => void;
  setSortBy: (sortBy: 'stars' | 'forks' | 'updated' | 'best-match') => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  fetchGitHubTrending: () => Promise<void>;
  fetchNpmTrending: () => Promise<void>;
  refreshAll: () => Promise<void>;
  clearError: () => void;
}

export const useTrendingStore = create<TrendingState>()(
  immer((set, get) => ({
    // Initial State
    timeframe: 'daily',
    language: null,
    sortBy: 'stars',
    sortOrder: 'desc',
    githubRepos: [],
    npmPackages: [],
    loading: false,
    error: null,
    lastFetch: null,

    // Set timeframe and auto-refresh
    setTimeframe: (timeframe: TimeframeType) => {
      set(state => {
        state.timeframe = timeframe;
      });

      // Auto-refresh when timeframe changes
      get().refreshAll();
    },

    // Set language and auto-refresh
    setLanguage: (language: string | null) => {
      set(state => {
        state.language = language;
      });
      get().refreshAll();
    },

    // Set sort and auto-refresh
    setSortBy: (sortBy: 'stars' | 'forks' | 'updated' | 'best-match') => {
      set(state => {
        state.sortBy = sortBy;
      });
      get().refreshAll();
    },

    // Set sort order and auto-refresh
    setSortOrder: (sortOrder: 'asc' | 'desc') => {
      set(state => {
        state.sortOrder = sortOrder;
      });
      get().refreshAll();
    },

    // Fetch GitHub trending repositories
    fetchGitHubTrending: async () => {
      try {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        const repos = await githubService.getTrending(get().timeframe, {
          minStars: 10,
          perPage: 50,
          language: get().language || undefined,
          sort: get().sortBy,
          order: get().sortOrder,
        });

        set(state => {
          state.githubRepos = repos;
          state.loading = false;
          state.lastFetch = new Date();
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to fetch repositories';

        set(state => {
          state.loading = false;
          state.error = message;
        });

        console.error('Error fetching GitHub trending:', error);
      }
    },

    // Fetch npm trending packages
    fetchNpmTrending: async () => {
      try {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        const packages = await npmService.getTrending(get().timeframe, {
          quality: 0.8,
          popularity: 0.9,
          maintenance: 0.5,
          perPage: 50,
        });

        set(state => {
          state.npmPackages = packages;
          state.loading = false;
          state.lastFetch = new Date();
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to fetch packages';

        set(state => {
          state.loading = false;
          state.error = message;
        });

        console.error('Error fetching npm trending:', error);
      }
    },

    // Refresh both GitHub and npm
    refreshAll: async () => {
      await Promise.all([
        get().fetchGitHubTrending(),
        get().fetchNpmTrending(),
      ]);
    },

    // Clear error
    clearError: () => {
      set(state => {
        state.error = null;
      });
    },
  })),
);

export default useTrendingStore;
