/**
 * Trending Hub App
 * React Native app for discovering trending GitHub repos and npm packages
 */

import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { updateService } from './src/api/github/updateService';
import AIChatBottomSheet from './src/components/AIChat/AIChatBottomSheet';
import { InfoCardModal } from './src/components/InfoCard';
import { Database } from './src/database/schema';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/authStore';
import { useSettingsStore } from './src/store/settingsStore';
import { HackerTheme } from './src/theme/colors';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const initializeAuth = useAuthStore(state => state.initialize);
  const loadSettings = useSettingsStore(state => state.loadSettings);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        await Database.init();

        // Initialize auth state
        await initializeAuth();

        // Load user settings
        await loadSettings();

        // Check for updates if enabled
        const settings = useSettingsStore.getState().settings;
        if (settings.autoCheckForUpdates) {
          updateService.checkForUpdates();
        }

        // Clean expired cache
        await Database.cleanExpiredCache();

        setIsInitialized(true);
      } catch (error) {
        console.error('App initialization error:', error);
        // Show alert but allow app to start (UI will handle missing DB)
        Alert.alert(
          'Database Error',
          'Failed to initialize local database. Some features may be unavailable.',
          [{ text: 'OK' }],
        );
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

        {/* AI Chat Bottom Sheet - renders on top of everything */}
        <AIChatBottomSheet />

        {/* Info Card Modal - WebView browser for repos/packages */}
        <InfoCardModal />
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
