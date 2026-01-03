/**
 * HomeScreen
 * Displays trending GitHub repos and npm packages with dual tabs
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { HackerTheme } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { useTrendingStore } from '../store/trendingStore';
import { TimeframeType } from '../api/github/githubClient';
import { GitHubRepository } from '../models/GitHubRepository';
import { NpmPackage } from '../models/NpmPackage';

type TabType = 'github' | 'npm';

export const HomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('github');
  const {
    timeframe,
    githubRepos,
    npmPackages,
    loading,
    error,
    setTimeframe,
    refreshAll,
  } = useTrendingStore();

  useEffect(() => {
    // Initial data fetch
    refreshAll();
  }, [refreshAll]);

  const handleRefresh = () => {
    refreshAll();
  };

  const handleTimeframeChange = (newTimeframe: TimeframeType) => {
    setTimeframe(newTimeframe);
  };

  const renderTimeframeSelector = () => (
    <View style={styles.timeframeContainer}>
      {(['daily', 'weekly', 'monthly'] as TimeframeType[]).map(tf => (
        <TouchableOpacity
          key={tf}
          style={[
            styles.timeframeButton,
            timeframe === tf && styles.timeframeButtonActive,
          ]}
          onPress={() => handleTimeframeChange(tf)}
        >
          <Text
            style={[
              styles.timeframeText,
              timeframe === tf && styles.timeframeTextActive,
            ]}
          >
            {tf.charAt(0).toUpperCase() + tf.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTabSelector = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'github' && styles.tabButtonActive,
        ]}
        onPress={() => setActiveTab('github')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'github' && styles.tabTextActive,
          ]}
        >
          GitHub ({githubRepos.length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'npm' && styles.tabButtonActive,
        ]}
        onPress={() => setActiveTab('npm')}
      >
        <Text
          style={[styles.tabText, activeTab === 'npm' && styles.tabTextActive]}
        >
          npm ({npmPackages.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderGitHubItem = ({ item }: { item: GitHubRepository }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardSubtitle}>{item.fullName}</Text>
      {item.description && (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      <View style={styles.statsRow}>
        <Text style={styles.statText}>⭐ {item.formattedStars}</Text>
        <Text style={styles.statText}>🍴 {item.formattedForks}</Text>
        {item.language && (
          <View style={styles.languageBadge}>
            <View
              style={[
                styles.languageDot,
                { backgroundColor: item.languageColor },
              ]}
            />
            <Text style={styles.languageText}>{item.language}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderNpmItem = ({ item }: { item: NpmPackage }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardSubtitle}>v{item.version}</Text>
      {item.description && (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      <View style={styles.statsRow}>
        <Text style={styles.statText}>📦 {item.formattedDownloads}</Text>
        {item.stars > 0 && <Text style={styles.statText}>⭐ {item.stars}</Text>}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {loading ? 'Loading...' : 'No data available'}
      </Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const data = activeTab === 'github' ? githubRepos : npmPackages;

  return (
    <View style={styles.container}>
      {renderTimeframeSelector()}
      {renderTabSelector()}

      {loading && data.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={HackerTheme.primary} />
          <Text style={styles.loadingText}>
            Loading trending {activeTab}...
          </Text>
        </View>
      ) : (
        <FlashList
          data={data as any}
          renderItem={
            activeTab === 'github'
              ? (renderGitHubItem as any)
              : (renderNpmItem as any)
          }
          // @ts-ignore
          estimatedItemSize={150}
          keyExtractor={(item: any) => item.id || item.name}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              tintColor={HackerTheme.primary}
              colors={[HackerTheme.primary]}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HackerTheme.darkerGreen,
  },
  timeframeContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HackerTheme.darkGreen,
    backgroundColor: HackerTheme.darkerGreen,
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: HackerTheme.darkGreen,
    borderColor: HackerTheme.primary,
  },
  timeframeText: {
    ...Typography.bodyText,
    color: HackerTheme.lightGrey,
  },
  timeframeTextActive: {
    color: HackerTheme.primary,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HackerTheme.darkGreen,
    backgroundColor: HackerTheme.darkerGreen,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: HackerTheme.darkGreen,
    borderColor: HackerTheme.primary,
  },
  tabText: {
    ...Typography.bodyText,
    color: HackerTheme.lightGrey,
  },
  tabTextActive: {
    color: HackerTheme.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.md,
  },
  card: {
    backgroundColor: HackerTheme.darkGreen,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: HackerTheme.primary + '20',
  },
  cardTitle: {
    ...Typography.heading3,
    color: HackerTheme.primary,
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey,
    marginBottom: Spacing.sm,
  },
  cardDescription: {
    ...Typography.bodyText,
    color: HackerTheme.lightOnPrimary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  statText: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey,
  },
  languageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  languageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  languageText: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.bodyText,
    color: HackerTheme.primary,
    marginTop: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    ...Typography.bodyText,
    color: HackerTheme.lightGrey,
    textAlign: 'center',
  },
  errorText: {
    ...Typography.captionText,
    color: HackerTheme.errorRed,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});

export default HomeScreen;
