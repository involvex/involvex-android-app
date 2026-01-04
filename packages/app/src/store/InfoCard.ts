/**
 * InfoCard Store
 * Zustand store for managing InfoCard modal state
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { GitHubRepository } from '../models/GitHubRepository';
import { NpmPackage } from '../models/NpmPackage';

type InfoCardItem = GitHubRepository | NpmPackage;
type ItemType = 'github' | 'npm';

interface InfoCardState {
  // UI State
  isOpen: boolean;
  showWebView: boolean; // Track if WebView should be shown
  loading: boolean;
  error: string | null;

  // Content
  currentItem: InfoCardItem | null;
  itemType: ItemType | null;
  currentUrl: string | null;

  // WebView State
  canGoBack: boolean;
  canGoForward: boolean;
  loadingProgress: number; // 0-1

  // Actions
  openInfoCard: (item: InfoCardItem) => void;
  closeInfoCard: () => void;
  openWebView: () => void; // Open WebView from preview
  setWebViewNavigation: (canGoBack: boolean, canGoForward: boolean) => void;
  setLoadingProgress: (progress: number) => void;
  setError: (error: string | null) => void;
}

export const useInfoCard = create<InfoCardState>()(
  immer(set => ({
    // Initial state
    isOpen: false,
    showWebView: false,
    loading: false,
    error: null,
    currentItem: null,
    itemType: null,
    currentUrl: null,
    canGoBack: false,
    canGoForward: false,
    loadingProgress: 0,

    /**
     * Open InfoCard with GitHub repo or npm package (preview mode)
     */
    openInfoCard: (item: InfoCardItem) => {
      set(state => {
        const isGitHub = 'fullName' in item;
        state.isOpen = true;
        state.showWebView = false; // Start in preview mode
        state.currentItem = item;
        state.itemType = isGitHub ? 'github' : 'npm';
        state.currentUrl = isGitHub
          ? (item as GitHubRepository).htmlUrl
          : (item as NpmPackage).npmUrl;
        state.error = null;
        state.loading = false;
        state.loadingProgress = 0;
      });
    },

    /**
     * Open WebView from preview
     */
    openWebView: () => {
      set(state => {
        state.showWebView = true;
        state.loading = true;
        state.loadingProgress = 0;
      });
    },

    /**
     * Close InfoCard modal
     */
    closeInfoCard: () => {
      set(state => {
        state.isOpen = false;
        state.showWebView = false;
        state.currentItem = null;
        state.itemType = null;
        state.currentUrl = null;
        state.error = null;
        state.loading = false;
        state.canGoBack = false;
        state.canGoForward = false;
        state.loadingProgress = 0;
      });
    },

    /**
     * Update WebView navigation state
     */
    setWebViewNavigation: (canGoBack: boolean, canGoForward: boolean) => {
      set(state => {
        state.canGoBack = canGoBack;
        state.canGoForward = canGoForward;
      });
    },

    /**
     * Update loading progress (0-1)
     */
    setLoadingProgress: (progress: number) => {
      set(state => {
        state.loadingProgress = progress;
        state.loading = progress < 1;
      });
    },

    /**
     * Set error message
     */
    setError: (error: string | null) => {
      set(state => {
        state.error = error;
        state.loading = false;
      });
    },
  })),
);

export default useInfoCard;
