/**
 * SettingsScreen
 * Comprehensive settings with 8 sections and 51 configuration options
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HackerTheme } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { useSettingsStore } from '../store/settingsStore';
import { UserSettings, UserSettingsData } from '../models/UserSettings';

type Section =
  | 'theme'
  | 'trending'
  | 'notifications'
  | 'display'
  | 'filter'
  | 'privacy'
  | 'data'
  | 'advanced';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, resetToDefaults, saving } =
    useSettingsStore();
  const [expandedSections, setExpandedSections] = useState<Set<Section>>(
    new Set(),
  );
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const toggleSection = (section: Section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleSettingChange = (key: keyof UserSettingsData, value: any) => {
    // Ensure we are calling copyWith on the UserSettings instance
    setLocalSettings(prev => prev.copyWith({ [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings(localSettings);
      setHasChanges(false);
      Alert.alert('Success', 'Settings saved successfully');
    } catch {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'Reset all settings to defaults? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetToDefaults();
            setLocalSettings(UserSettings.defaults);
            setHasChanges(false);
          },
        },
      ],
    );
  };

  const renderSectionHeader = (
    section: Section,
    title: string,
    icon: string,
    itemCount: number,
  ) => {
    const isExpanded = expandedSections.has(section);
    return (
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(section)}
      >
        <View style={styles.sectionHeaderLeft}>
          <Icon name={icon} size={24} color={HackerTheme.primary} />
          <View>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionSubtitle}>{itemCount} settings</Text>
          </View>
        </View>
        <Icon
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={HackerTheme.lightGrey}
        />
      </TouchableOpacity>
    );
  };

  const renderSwitch = (
    label: string,
    key: keyof UserSettingsData,
    description?: string,
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLabelContainer}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={localSettings[key] as boolean}
        onValueChange={value => handleSettingChange(key, value)}
        trackColor={{
          false: HackerTheme.darkGreen,
          true: HackerTheme.primary + '80',
        }}
        thumbColor={
          localSettings[key] ? HackerTheme.primary : HackerTheme.lightGrey
        }
      />
    </View>
  );

  const renderTextInput = (
    label: string,
    key: keyof UserSettingsData,
    placeholder?: string,
    keyboardType: 'default' | 'numeric' = 'default',
  ) => (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        value={String(localSettings[key])}
        onChangeText={value =>
          handleSettingChange(
            key,
            keyboardType === 'numeric' ? parseInt(value, 10) || 0 : value,
          )
        }
        placeholder={placeholder}
        placeholderTextColor={HackerTheme.lightGrey}
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderSegmentedControl = (
    label: string,
    key: keyof UserSettingsData,
    options: string[],
  ) => (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.segmentedControl}>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            style={[
              styles.segmentButton,
              localSettings[key] === option && styles.segmentButtonActive,
            ]}
            onPress={() => handleSettingChange(key, option)}
          >
            <Text
              style={[
                styles.segmentText,
                localSettings[key] === option && styles.segmentTextActive,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Theme Section */}
        {renderSectionHeader('theme', 'Theme', 'palette', 2)}
        {expandedSections.has('theme') && (
          <View style={styles.sectionContent}>
            {renderSwitch('Dark Mode', 'isDarkMode')}
            {renderSwitch(
              'Hacker Theme',
              'useHackerTheme',
              'Matrix-style green theme',
            )}
          </View>
        )}

        {/* Trending Section */}
        {renderSectionHeader('trending', 'Trending', 'fire', 5)}
        {expandedSections.has('trending') && (
          <View style={styles.sectionContent}>
            {renderSegmentedControl('Default Timeframe', 'trendingTimeframe', [
              'daily',
              'weekly',
              'monthly',
            ])}
            {renderSwitch('Auto Refresh', 'autoRefresh')}
            {renderTextInput(
              'Refresh Interval (minutes)',
              'refreshInterval',
              '30',
              'numeric',
            )}
            {/* {renderSwitch('Show Trending Score', 'showTrendingScore')} */}
            {/* {renderTextInput(
              'Min Stars for Trending',
              'minStarsForTrending',
              '10',
              'numeric'
            )} */}
          </View>
        )}

        {/* Notifications Section */}
        {renderSectionHeader('notifications', 'Notifications', 'bell', 8)}
        {expandedSections.has('notifications') && (
          <View style={styles.sectionContent}>
            {renderSwitch(
              'Enable Push Notifications',
              'enablePushNotifications',
            )}
            {renderTextInput(
              'Daily Digest Time',
              'notificationTime',
              'HH:MM (e.g., 09:00)',
            )}
            {renderSwitch('Daily Digest', 'enableDailyDigest')}
            {renderSwitch('Weekly Summary', 'enableWeeklySummary')}
            {renderSwitch('Release Alerts', 'enableNewReleaseNotifications')}
            {/* {renderSwitch('Star Milestone Alerts', 'starMilestoneAlerts')} */}
            {renderSwitch(
              'Trending Language Alerts',
              'enableTrendingNotifications',
            )}
            {renderSwitch('Sound', 'enableSound')}
          </View>
        )}

        {/* Display Section */}
        {renderSectionHeader('display', 'Display', 'monitor', 10)}
        {expandedSections.has('display') && (
          <View style={styles.sectionContent}>
            {renderSwitch('Compact Card View', 'compactView')}
            {/* {renderSwitch('Show Avatars', 'showAvatars')} */}
            {/* {renderSwitch('Show Language Colors', 'showLanguageColors')} */}
            {renderSwitch('Show Star Count', 'showStars')}
            {renderSwitch('Show Fork Count', 'showForks')}
            {/* {renderSwitch('Show Issue Count', 'showIssueCount')} */}
            {renderSwitch('Show License', 'showLicense')}
            {renderSwitch('Show Topics', 'showTopics')}
            {/* {renderSegmentedControl('Card Image Size', 'cardImageSize', [
              'small',
              'medium',
              'large',
            ])} */}
            {/* {renderTextInput('Max Topics Shown', 'maxTopicsShown', '3', 'numeric')} */}
          </View>
        )}

        {/* Filter Section */}
        {renderSectionHeader('filter', 'Filters', 'filter', 8)}
        {expandedSections.has('filter') && (
          <View style={styles.sectionContent}>
            {renderTextInput('Default Min Stars', 'minStars', '10', 'numeric')}
            {/* {renderTextInput('Default Language', 'defaultLanguage', 'e.g., JavaScript')} */}
            {renderSegmentedControl('Default Sort', 'sortBy', [
              'stars',
              'forks',
              // 'updated', // updated not in model, model has date
              'date',
            ])}
            {renderSwitch('Include Archived', 'includeArchived')}
            {renderSwitch('Include Forks', 'includeForks')}
            {/* {renderSwitch('Show Only With License', 'showOnlyWithLicense')} */}
            {/* {renderSwitch('Show Only With Topics', 'showOnlyWithTopics')} */}
            {/* {renderTextInput(
              'Exclude Languages',
              'excludeLanguages',
              'e.g., HTML,CSS'
            )} */}
          </View>
        )}

        {/* Privacy Section */}
        {renderSectionHeader('privacy', 'Privacy', 'shield-lock', 5)}
        {expandedSections.has('privacy') && (
          <View style={styles.sectionContent}>
            {renderSwitch('Analytics', 'enableAnalytics')}
            {/* {renderSwitch('Crash Reporting', 'crashReporting')} */}
            {/* {renderSwitch('Save Search History', 'saveSearchHistory')} */}
            {/* {renderSwitch('Save Browse History', 'saveBrowseHistory')} */}
            {renderSwitch('Share Usage Data', 'shareUsageData')}
          </View>
        )}

        {/* Data Section */}
        {renderSectionHeader('data', 'Data & Storage', 'database', 7)}
        {expandedSections.has('data') && (
          <View style={styles.sectionContent}>
            {renderSwitch('Offline Mode', 'enableOfflineMode')}
            {renderTextInput(
              'Cache Expiry (hours)',
              'cacheExpiryHours',
              '24',
              'numeric',
            )}
            {renderTextInput(
              'Max Cache Size (MB)',
              'maxCacheSize',
              '100',
              'numeric',
            )}
            {renderSwitch('Auto Delete Old Data', 'autoDeleteOldData')}
            {/* {renderSwitch('Sync on Wi-Fi Only', 'syncOnWifiOnly')} */}
            {renderSegmentedControl('Export Format', 'preferredExportFormat', [
              'json',
              'csv',
              // 'Markdown', // model has 'txt', UI has 'Markdown'. Model has 'json'|'csv'|'txt'.
              'txt',
            ])}
            {renderSwitch('Include Metadata in Export', 'includeMetadata')}
          </View>
        )}

        {/* Advanced Section */}
        {renderSectionHeader('advanced', 'Advanced', 'cog', 8)}
        {expandedSections.has('advanced') && (
          <View style={styles.sectionContent}>
            {renderSwitch('Debug Mode', 'enableDebugMode')}
            {/* {renderSwitch('Show Debug Info', 'showDebugInfo')} */}
            {renderTextInput(
              'API Request Timeout (seconds)',
              'requestTimeout',
              '30',
              'numeric',
            )}
            {/* {renderTextInput(
              'Max Retry Attempts',
              'maxRetryAttempts',
              '3',
              'numeric'
            )} */}
            {renderSwitch('Enable Beta Features', 'enableBetaFeatures')}
            {renderTextInput(
              'GitHub Personal Access Token',
              'githubToken',
              'ghp_...',
            )}
            {renderTextInput(
              'NPM Auth Token',
              'npmToken',
              'npm_...',
            )}
            {/* {renderSwitch('Verbose Logging', 'verboseLogging')} */}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Action Buttons */}
      {hasChanges && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionButton, styles.discardButton]}
            onPress={() => {
              setLocalSettings(settings);
              setHasChanges(false);
            }}
          >
            <Text style={styles.discardButtonText}>Discard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.resetContainer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Icon name="restore" size={20} color={HackerTheme.errorRed} />
          <Text style={styles.resetButtonText}>Reset to Defaults</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HackerTheme.darkerGreen,
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: HackerTheme.darkGreen,
    borderBottomWidth: 1,
    borderBottomColor: HackerTheme.primary + '20',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.heading3,
    color: HackerTheme.primary,
  },
  sectionSubtitle: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey,
    fontSize: 11,
  },
  sectionContent: {
    backgroundColor: HackerTheme.darkerGreen,
  },
  settingRow: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: HackerTheme.darkGreen,
  },
  settingLabelContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    ...Typography.bodyText,
    color: HackerTheme.lightOnPrimary,
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey,
    fontSize: 11,
  },
  textInput: {
    ...Typography.bodyText,
    color: HackerTheme.lightOnPrimary,
    backgroundColor: HackerTheme.darkGreen,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HackerTheme.primary + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HackerTheme.darkGreen,
    backgroundColor: HackerTheme.darkerGreen,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: HackerTheme.primary + '20',
    borderColor: HackerTheme.primary,
  },
  segmentText: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey,
  },
  segmentTextActive: {
    color: HackerTheme.primary,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
  actionBar: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: HackerTheme.darkGreen,
    borderTopWidth: 1,
    borderTopColor: HackerTheme.primary + '20',
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  discardButton: {
    backgroundColor: HackerTheme.darkerGreen,
    borderWidth: 1,
    borderColor: HackerTheme.lightGrey,
  },
  discardButtonText: {
    ...Typography.buttonText,
    color: HackerTheme.lightGrey,
  },
  saveButton: {
    backgroundColor: HackerTheme.primary,
  },
  saveButtonText: {
    ...Typography.buttonText,
    color: HackerTheme.darkerGreen,
  },
  resetContainer: {
    padding: Spacing.md,
    backgroundColor: HackerTheme.darkerGreen,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HackerTheme.errorRed,
    backgroundColor: HackerTheme.darkerGreen,
  },
  resetButtonText: {
    ...Typography.bodyText,
    color: HackerTheme.errorRed,
  },
});

export default SettingsScreen;
