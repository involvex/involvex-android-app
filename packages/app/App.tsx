/**
 * Trending Hub App
 * React Native app for discovering trending GitHub repos and npm packages
 */

import React, { useEffect, useRef, useState } from "react";
import {
  StatusBar,
  View,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import RootNavigator from "./src/navigation/RootNavigator";
import { Database } from "./src/database/schema";
import { useAuthStore } from "./src/store/authStore";
import { useSettingsStore } from "./src/store/settingsStore";
import { HackerTheme } from "./src/theme/colors";

const linking = {
  prefixes: ["involvex://"],
  config: {
    screens: {
      MainTabs: {
        path: "main",
        parse: () => ({}),
      },
    },
  },
};

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialUrl, setInitialUrl] = useState<string | null>(null);
  const initializeAuth = useAuthStore((state) => state.initialize);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const isReadyRef = useRef(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Initializing app...");

        // Initialize database
        await Database.init();
        console.log("Database initialized");

        // Initialize auth state
        await initializeAuth();
        console.log("Auth initialized");

        // Load user settings
        await loadSettings();
        console.log("Settings loaded");

        // Clean expired cache
        await Database.cleanExpiredCache();
        console.log("Cache cleaned");

        // Get initial URL if app was opened via deep link
        const url = await Linking.getInitialURL();
        if (url) {
          console.log("Initial URL:", url);
          setInitialUrl(url);
        }

        setIsInitialized(true);
        isReadyRef.current = true;
        console.log("App initialization complete");
      } catch (error) {
        console.error("App initialization error:", error);
        setIsInitialized(true);
        isReadyRef.current = true;
      }
    };

    initializeApp();
  }, [initializeAuth, loadSettings]);

  useEffect(() => {
    if (!isReadyRef.current) return;

    const handleUrl = (url: string) => {
      console.log("Received URL:", url);
      // Handle OAuth callbacks
      if (url.startsWith("involvex://discord-oauth-redirect")) {
        // react-native-app-auth handles the callback automatically
        console.log("Discord OAuth callback received");
      } else if (url.startsWith("involvex://github-oauth-redirect")) {
        // react-native-app-auth handles the callback automatically
        console.log("GitHub OAuth callback received");
      }
    };

    // Listen for incoming links while app is running
    const subscription = Linking.addEventListener("url", ({ url }) =>
      handleUrl(url),
    );

    // Handle initial URL if we got it after initialization
    if (initialUrl) {
      handleUrl(initialUrl);
    }

    return () => subscription.remove();
  }, [initialUrl]);

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
        <NavigationContainer linking={linking}>
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
    justifyContent: "center",
    alignItems: "center",
  },
});

export default App;
