/**
 * Settings Store
 * Manages user settings with AsyncStorage persistence
 * Uses Zustand for state management
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings } from '../models/UserSettings';

const SETTINGS_KEY = '@settings:user';

interface SettingsState {
  settings: UserSettings;
  loaded: boolean;
  saving: boolean;

  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  ClearCache: () => Promise<void>;
  getSetting: <K extends keyof UserSettings>(key: K) => UserSettings[K];
}

export const useSettingsStore = create<SettingsState>()(
  immer((set, get) => ({
    // Initial State
    settings: new UserSettings(),
    loaded: false,
    saving: false,

    // Load settings from AsyncStorage
    loadSettings: async () => {
      try {
        const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);

        if (settingsJson) {
          const settings = UserSettings.fromJSON(JSON.parse(settingsJson));

          set(state => {
            state.settings = settings;
            state.loaded = true;
          });

          console.log('Settings loaded from storage');
        } else {
          // First time - use defaults
          const defaultSettings = new UserSettings();
          await AsyncStorage.setItem(
            SETTINGS_KEY,
            JSON.stringify(defaultSettings.toJSON()),
          );

          set(state => {
            state.settings = defaultSettings;
            state.loaded = true;
          });

          console.log('Default settings initialized');
        }
      } catch (error) {
        console.error('Error loading settings:', error);

        // Use defaults on error
        set(state => {
          state.settings = new UserSettings();
          state.loaded = true;
        });
      }
    },

    // Update settings and persist
    updateSettings: async (updates: Partial<UserSettings>) => {
      try {
        set(state => {
          state.saving = true;
        });

        const newSettings = get().settings.copyWith(updates);

        // Validate settings
        if (!newSettings.isValid) {
          throw new Error('Invalid settings');
        }

        // Persist to AsyncStorage
        await AsyncStorage.setItem(
          SETTINGS_KEY,
          JSON.stringify(newSettings.toJSON()),
        );

        set(state => {
          state.settings = newSettings;
          state.saving = false;
        });

        console.log('Settings updated and saved');
      } catch (error) {
        console.error('Error updating settings:', error);

        set(state => {
          state.saving = false;
        });

        throw error;
      }
    },

    // Reset to default settings
    resetToDefaults: async () => {
      try {
        const defaultSettings = UserSettings.defaults;

        await AsyncStorage.setItem(
          SETTINGS_KEY,
          JSON.stringify(defaultSettings.toJSON()),
        );

        set(state => {
          state.settings = defaultSettings;
        });

        console.log('Settings reset to defaults');
      } catch (error) {
        console.error('Error resetting settings:', error);
        throw error;
      }
    },
    ClearCache: async () => {
      try {
        await AsyncStorage.removeItem(SETTINGS_KEY);
        set(state => {
          state.settings = new UserSettings();
        });
        console.log('Cache cleared');
      } catch (error) {
        console.error('Error clearing cache:', error);
        throw error;
      }
    },

    // Get a specific setting value
    getSetting: <K extends keyof UserSettings>(key: K): UserSettings[K] => {
      return get().settings[key];
    },
  })),
);

export default useSettingsStore;
