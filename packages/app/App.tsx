/**
 * Trending Hub App
 * React Native app for discovering trending GitHub repos and npm packages
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { Database } from './src/database/schema';
import { useAuthStore } from './src/store/authStore';
import { useSettingsStore } from './src/store/settingsStore';
import { HackerTheme } from './src/theme/colors';
import { updateService } from './src/api/github/updateService';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const initializeAuth = useAuthStore(state => state.initialize);
  const loadSettings = useSettingsStore(state => state.loadSettings);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');

        // Initialize database
        await Database.init();
        console.log('Database initialized');

        // Initialize auth state
        await initializeAuth();
        console.log('Auth initialized');

        // Load user settings
        await loadSettings();
        console.log('Settings loaded');

        // Check for updates if enabled
        const settings = useSettingsStore.getState().settings;
        if (settings.autoCheckForUpdates) {
          updateService.checkForUpdates();
        }

        // Clean expired cache
        await Database.cleanExpiredCache();
        console.log('Cache cleaned');

        setIsInitialized(true);
        console.log('App initialization complete');
      } catch (error) {
        console.error('App initialization error:', error);
        // Still allow app to run even if initialization fails
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [initializeAuth, loadSettings]);

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={HackerTheme.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={HackerTheme.darkerGreen}
        />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: HackerTheme.darkerGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
