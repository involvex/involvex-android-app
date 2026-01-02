
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { useTheme } from '../services/themeService';

const SettingsScreen = () => {
  const { theme, isDark, setTheme } = useTheme();

  const handleClearCache = () => {
    Alert.alert('Cache Cleared', 'The application cache has been cleared.');
  };

  const handleLogout = () => {
    Alert.alert('Logged Out', 'You have been successfully logged out.');
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Dark Mode</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleClearCache}>
        <Text style={styles.buttonText}>Clear Cache</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: theme.colors.card,
    padding: 15,
    borderRadius: 5,
  },
  settingText: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: theme.colors.card,
    fontFamily: theme.typography.fontFamily,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SettingsScreen;
