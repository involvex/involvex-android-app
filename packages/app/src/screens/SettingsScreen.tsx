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
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HackerTheme } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { useSettingsStore } from '../store/settingsStore';
import { useAuthStore, DiscordUser, GitHubUser } from '../store/authStore';
import { UserSettings, UserSettingsData } from '../models/UserSettings';
import pkg from '../../package.json';
import A from 'react-native-a';
import { updateService } from '../api/github/updateService';

type Section =
  | 'account'
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
  const { 
    signInWithDiscord, 
    signInWithGitHub, 
    linkDiscordAccount,
    linkGitHubAccount,
    signOut, 
    isAuthenticated, 
    activeUser, 
    discordUser,
    githubUser,
    provider, 
    loading: authLoading 
  } = useAuthStore();

  const [expandedSections, setExpandedSections] = useState<Set<Section>>(
    new Set(['account']),
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

  const handleDiscordLogin = async () => {
    try {
      await signInWithDiscord();
    } catch {
      Alert.alert('Login Error', 'Failed to sign in with Discord');
    }
  };

  const handleGitHubLogin = async () => {
    try {
      await signInWithGitHub();
    } catch {
      Alert.alert('Login Error', 'Failed to sign in with GitHub');
    }
  };

  const handleLinkDiscord = async () => {
    try {
      await linkDiscordAccount();
      Alert.alert('Success', 'Discord account linked successfully!');
    } catch {
      Alert.alert('Link Error', 'Failed to link Discord account');
    }
  };

  const handleLinkGitHub = async () => {
    try {
      await linkGitHubAccount();
      Alert.alert('Success', 'GitHub account linked successfully!');
    } catch {
      Alert.alert('Link Error', 'Failed to link GitHub account');
    }
  };


  const renderSectionHeader = (
    section: Section,
    title: string,
    icon: string,
    itemCount: number | null,
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
            {itemCount !== null && (
              <Text style={styles.sectionSubtitle}>{itemCount} settings</Text>
            )}
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

  const renderAccountInfo = (user: DiscordUser | GitHubUser, providerName: string, showUnlink = false) => {
    const username = 'username' in user ? user.username : user.login;
    const avatarUrl = 'avatar' in user 
      ? user.avatar 
      : 'avatar_url' in user 
        ? user.avatar_url 
        : null;

    return (
      <View style={styles.linkedAccountRow}>
        <View style={styles.userInfo}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarSmall} />
          ) : (
            <View style={styles.avatarPlaceholderSmall}>
              <Icon name="account" size={20} color={HackerTheme.darkerGreen} />
            </View>
          )}
          <View>
            <Text style={styles.linkedAccountName}>{username}</Text>
            <Text style={styles.linkedAccountProvider}>{providerName}</Text>
          </View>
        </View>
        {showUnlink && (
          <TouchableOpacity style={styles.unlinkButton} onPress={() => Alert.alert('Unlink', `Unlink ${providerName} account?`)}>
            <Text style={styles.unlinkButtonText}>Unlink</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderAccountSection = () => {
    if (authLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={HackerTheme.primary} />
        </View>
      );
    }

    if (!isAuthenticated) {
      return (
        <View style={styles.accountButtons}>
          <TouchableOpacity 
            style={[styles.loginButton, styles.discordButton]} 
            onPress={handleDiscordLogin}
          >
            <Icon name="discord" size={20} color="#FFFFFF" />
            <Text style={styles.loginButtonText}>Sign in with Discord</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.loginButton, styles.githubButton]} 
            onPress={handleGitHubLogin}
          >
            <Icon name="github" size={20} color="#FFFFFF" />
            <Text style={styles.loginButtonText}>Sign in with GitHub</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // User is authenticated
    return (
      <View style={styles.accountContainer}>
        {activeUser && (
          <View style={styles.activeUserSection}>
            <Text style={styles.sectionSubTitle}>Currently Logged In</Text>
            {renderAccountInfo(activeUser, provider === 'discord' ? 'Discord' : 'GitHub')}
            <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
              <Text style={styles.signOutText}>Sign Out All Accounts</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.linkedAccountsSection}>
          <Text style={styles.sectionSubTitle}>Linked Accounts</Text>
          {discordUser ? (
            renderAccountInfo(discordUser, 'Discord', true)
          ) : (
            <TouchableOpacity 
              style={[styles.linkButton, styles.discordButton]} 
              onPress={handleLinkDiscord}
            >
              <Icon name="link" size={20} color="#FFFFFF" />
              <Text style={styles.linkButtonText}>Link Discord Account</Text>
            </TouchableOpacity>
          )}

          {githubUser ? (
            renderAccountInfo(githubUser, 'GitHub', true)
          ) : (
            <TouchableOpacity 
              style={[styles.linkButton, styles.githubButton]} 
              onPress={handleLinkGitHub}
            >
              <Icon name="link" size={20} color="#FFFFFF" />
              <Text style={styles.linkButtonText}>Link GitHub Account</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
        value={String(localSettings[key] || '')}
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
        {/* Account Section */}
        {renderSectionHeader('account', '👤 Account & Identity', 'account', null)}
        {expandedSections.has('account') && (
          <View style={styles.sectionContent}>
            {renderAccountSection()}
          </View>
        )}

        {/* Theme Section */}
        {renderSectionHeader('theme', '🎨 Visual Appearance', 'palette', 2)}
        {expandedSections.has('theme') && (
          <View style={styles.sectionContent}>
            {renderSwitch('Dark Mode 🌙', 'isDarkMode')}
            {renderSwitch(
              'Hacker Theme 📟',
              'useHackerTheme',
              'Matrix-style green terminal aesthetic',
            )}
          </View>
        )}

        {/* Trending Section */}
        {renderSectionHeader('trending', '🔥 Trending Engine', 'fire', 5)}
        {expandedSections.has('trending') && (
          <View style={styles.sectionContent}>
            {renderSegmentedControl('Default Timeframe ⏳', 'trendingTimeframe', [
              'daily',
              'weekly',
              'monthly',
            ])}
            {renderSwitch('Auto Refresh 🔄', 'autoRefresh')}
            {renderTextInput(
              'Refresh Interval (minutes) ⏱️',
              'refreshInterval',
              '30',
              'numeric',
            )}
          </View>
        )}

        {/* Notifications Section */}
        {renderSectionHeader('notifications', '🔔 System Alerts', 'bell', 8)}
        {expandedSections.has('notifications') && (
          <View style={styles.sectionContent}>
            {renderSwitch(
              'Push Notifications 🔔',
              'enablePushNotifications',
            )}
            {renderTextInput(
              'Daily Digest Time 🕤',
              'notificationTime',
              'HH:MM (e.g., 09:00)',
            )}
            {renderSwitch('Daily Digest 📰', 'enableDailyDigest')}
            {renderSwitch('Weekly Summary 📊', 'enableWeeklySummary')}
            {renderSwitch('New Release Alerts 🚀', 'enableNewReleaseNotifications')}
            {renderSwitch(
              'Trending Language Alerts 💡',
              'enableTrendingNotifications',
            )}
            {renderSwitch('System Sound 🔈', 'enableSound')}
          </View>
        )}

        {/* Display Section */}
        {renderSectionHeader('display', '🖥️ Interface Layout', 'monitor', 10)}
        {expandedSections.has('display') && (
          <View style={styles.sectionContent}>
            {renderSwitch('Compact Card View 📱', 'compactView')}
            {renderSwitch('Show Star Count ⭐', 'showStars')}
            {renderSwitch('Show Fork Count 🍴', 'showForks')}
            {renderSwitch('Show License 📜', 'showLicense')}
            {renderSwitch('Show Topics 🏷️', 'showTopics')}
          </View>
        )}

        {/* Filter Section */}
        {renderSectionHeader('filter', '🔍 Discovery Filters', 'filter', 8)}
        {expandedSections.has('filter') && (
          <View style={styles.sectionContent}>
            {renderTextInput('Default Min Stars ⭐', 'minStars', '10', 'numeric')}
            {renderSegmentedControl('Default Sort 🔀', 'sortBy', [
              'stars',
              'forks',
              'date',
            ])}
            {renderSwitch('Include Archived 🗄️', 'includeArchived')}
            {renderSwitch('Include Forks 🌿', 'includeForks')}
          </View>
        )}

        {/* Privacy Section */}
        {renderSectionHeader('privacy', '🔒 Privacy & Security', 'shield-lock', 5)}
        {expandedSections.has('privacy') && (
          <View style={styles.sectionContent}>
            {renderSwitch('Usage Analytics 📈', 'enableAnalytics')}
            {renderSwitch('Share Usage Data 🤝', 'shareUsageData')}
          </View>
        )}

        {/* Data Section */}
        {renderSectionHeader('data', '💾 Memory & Storage', 'database', 7)}
        {expandedSections.has('data') && (
          <View style={styles.sectionContent}>
            {renderSwitch('Offline Mode 🔌', 'enableOfflineMode')}
            {renderTextInput(
              'Cache Expiry (hours) ⌛',
              'cacheExpiryHours',
              '24',
              'numeric',
            )}
            {renderTextInput(
              'Max Cache Size (MB) 💾',
              'maxCacheSize',
              '100',
              'numeric',
            )}
            {renderSwitch('Auto Delete Old Data 🧹', 'autoDeleteOldData')}
            {renderSegmentedControl('Export Format 📄', 'preferredExportFormat', [
              'json',
              'csv',
              'txt',
            ])}
            {renderSwitch('Include Metadata in Export 📑', 'includeMetadata')}
          </View>
        )}

        {/* Advanced Section */}
        {renderSectionHeader('advanced', '⚙️ Advanced Protocols', 'cog', 9)}
        {expandedSections.has('advanced') && (
          <View style={styles.sectionContent}>
            {renderSwitch('Auto Check for Updates 🔄', 'autoCheckForUpdates')}
            {renderSwitch('Debug Mode 🛠️', 'enableDebugMode')}
            {renderTextInput(
              'API Request Timeout (sec) 📡',
              'requestTimeout',
              '30',
              'numeric',
            )}
            {renderSwitch('Beta Features 🧪', 'enableBetaFeatures')}
            {renderTextInput(
              'GitHub Personal Access Token 🔑',
              'githubToken',
              'ghp_...',
            )}
            {renderTextInput(
              'NPM Auth Token 🔑',
              'npmToken',
              'npm_...',
            )}
            <TouchableOpacity 
              style={styles.updateButton} 
              onPress={() => updateService.checkForUpdates(true)}
            >
              <Icon name="update" size={20} color={HackerTheme.primary} />
              <Text style={styles.updateButtonText}>Check for Updates Now</Text>
            </TouchableOpacity>
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
        
        <View style={styles.authorContainer}>
        <Text style={styles.author}>Author: {pkg.author.name}</Text>
        <A style={styles.authorLink} href={pkg.author.url}>{pkg.author.url}</A>
        </View>

        <View style={styles.repositoryContainer}>
          <Text style={styles.versionInfo}>App version: {pkg.version}</Text>
        <Text style={styles.repositorylabel}>Repository: </Text>
        <A style={styles.repository} href={pkg.repository}>{pkg.repository}</A>
        </View>
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
  loadingContainer: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  accountContainer: {
    paddingHorizontal: Spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: Spacing.md,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: HackerTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: Spacing.sm,
  },
  avatarPlaceholderSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: HackerTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  userName: {
    ...Typography.heading3,
    color: HackerTheme.primary,
  },
  userProvider: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey,
  },
  accountButtons: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: 8,
    gap: Spacing.sm,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: 8,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  discordButton: {
    backgroundColor: '#5865F2',
  },
  githubButton: {
    backgroundColor: '#24292e',
  },
  loginButtonText: {
    ...Typography.buttonText,
    color: '#FFFFFF',
  },
  linkButtonText: {
    ...Typography.buttonText,
    color: '#FFFFFF',
  },
  signOutButton: {
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HackerTheme.errorRed,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  signOutText: {
    ...Typography.buttonText,
    color: HackerTheme.errorRed,
  },
  activeUserSection: {
    marginBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: HackerTheme.darkGreen,
    paddingBottom: Spacing.md,
  },
  linkedAccountsSection: {
    marginTop: Spacing.md,
  },
  sectionSubTitle: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey,
    marginBottom: Spacing.sm,
  },
  linkedAccountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: HackerTheme.darkGreen,
    marginBottom: Spacing.sm,
  },
  linkedAccountName: {
    ...Typography.bodyText,
    color: HackerTheme.lightOnPrimary,
  },
  linkedAccountProvider: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey,
    fontSize: 10,
  },
  unlinkButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 5,
    backgroundColor: HackerTheme.errorRed + '40',
  },
  unlinkButtonText: {
    ...Typography.captionText,
    color: HackerTheme.errorRed,
  },
  versionInfo: {
    ...Typography.captionText,
    color: HackerTheme.textGrey,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  versionInfoLink: {
    color: HackerTheme.primary,
  },
  authorContainer: {
    alignItems: 'center',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: HackerTheme.accentGreen,
    backgroundColor: HackerTheme.darkerGreen,

    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    borderRadius: '5%',
  },
  author: {
    ...Typography.captionText,
    color: HackerTheme.textGrey,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  authorLink: {
    color: HackerTheme.primary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    textDecorationLine: 'underline',
  },
  repository: {
    color: HackerTheme.secondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    textDecorationLine: 'underline',
  },
  repositorylabel: {
    ...Typography.captionText,
    color: HackerTheme.textGrey,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  repositoryContainer: {
    alignItems: 'center',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: HackerTheme.accentGreen,
    backgroundColor: HackerTheme.darkerGreen,
    marginTop: Spacing.sm,
    borderRadius: '5%',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HackerTheme.primary,
    backgroundColor: HackerTheme.darkGreen,
  },
  updateButtonText: {
    ...Typography.bodyText,
    color: HackerTheme.primary,
    fontWeight: 'bold',
  }
});

export default SettingsScreen;
