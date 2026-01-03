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
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HackerTheme } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { useTrendingStore } from '../store/trendingStore';
import { TimeframeType } from '../api/github/githubClient';
import { GitHubRepository } from '../models/GitHubRepository';
import { NpmPackage } from '../models/NpmPackage';
import { subscriptionsRepository } from '../database/repositories/subscriptionsRepository';

type TabType = 'github' | 'npm';

export const HomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('github');
  const [showFilters, setShowFilters] = useState(false);
  const [subscribedItems, setSubscribedItems] = useState<Set<string>>(new Set());

  const {
    timeframe,
    language,
    sortBy,
    sortOrder,
    githubRepos,
    npmPackages,
    loading,
    error,
    setTimeframe,
    setLanguage,
    setSortBy,
    setSortOrder,
    refreshAll,
  } = useTrendingStore();

  useEffect(() => {
    // Initial data fetch
    refreshAll();
    loadSubscriptions();
  }, [refreshAll]);

  const loadSubscriptions = async () => {
    try {
      const subs = await subscriptionsRepository.getAll();
      setSubscribedItems(new Set(subs.map(s => s.itemId)));
    } catch (loadError) {
      console.error('Failed to load subscriptions:', loadError);
    }
  };

  const handleRefresh = () => {
    refreshAll();
    loadSubscriptions();
  };

  const handleToggleSubscription = async (item: GitHubRepository | NpmPackage, type: 'github' | 'npm') => {
    const itemId = type === 'github' ? String((item as GitHubRepository).id) : (item as NpmPackage).name;
    const isSubscribed = subscribedItems.has(itemId);

    try {
      if (isSubscribed) {
        await subscriptionsRepository.removeByItemId(itemId);
        setSubscribedItems(prev => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      } else {
        await subscriptionsRepository.add({
          id: Math.random().toString(36).substring(7),
          type: type === 'github' ? 'repository' : 'package',
          itemId,
          name: item.name,
          fullName: type === 'github' ? (item as GitHubRepository).fullName : undefined,
          data: JSON.stringify(item),
          subscribedAt: Date.now(),
          isActive: true,
        });
        setSubscribedItems(prev => new Set(prev).add(itemId));
        Alert.alert('Subscribed', `${item.name} added to your personal subscriptions.`);
      }
    } catch (toggleError) {
      console.error('Subscription toggle error:', toggleError);
      Alert.alert('Error', 'Failed to update subscription.');
    }
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

  const renderFilterOptions = () => {
    if (!showFilters) return null;

    return (
      <View style={styles.filtersPanel}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Language</Text>
          <TextInput
            style={styles.filterInput}
            value={language || ''}
            onChangeText={setLanguage}
            placeholder="All Languages"
            placeholderTextColor={HackerTheme.lightGrey}
          />
        </View>

        {activeTab === 'github' && (
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Sort By</Text>
            <View style={styles.sortButtons}>
              {(['stars', 'forks', 'updated'] as const).map(sort => (
                <TouchableOpacity
                  key={sort}
                  style={[
                    styles.sortButton,
                    sortBy === sort && styles.sortButtonActive,
                  ]}
                  onPress={() => setSortBy(sort)}
                >
                  <Text
                    style={[
                      styles.sortButtonText,
                      sortBy === sort && styles.sortButtonTextActive,
                    ]}
                  >
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Order</Text>
          <View style={styles.sortButtons}>
            {(['desc', 'asc'] as const).map(order => (
              <TouchableOpacity
                key={order}
                style={[
                  styles.sortButton,
                  sortOrder === order && styles.sortButtonActive,
                ]}
                onPress={() => setSortOrder(order)}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    sortOrder === order && styles.sortButtonTextActive,
                  ]}
                >
                  {order === 'desc' ? 'Most' : 'Least'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>TRENDING_DATA</Text>
        <TouchableOpacity 
          style={styles.filterToggleButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Icon 
            name={showFilters ? "filter-remove" : "filter-variant"} 
            size={24} 
            color={showFilters ? HackerTheme.primary : HackerTheme.lightGrey} 
          />
        </TouchableOpacity>
      </View>
      {renderTimeframeSelector()}
      {renderFilterOptions()}
      {renderTabSelector()}
    </View>
  );

  const renderGitHubItem = ({ item }: { item: GitHubRepository }) => {
    const isSubscribed = subscribedItems.has(String(item.id));
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TouchableOpacity 
            style={styles.cardHeaderTitle}
            onPress={() => item.htmlUrl && Linking.openURL(item.htmlUrl)}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.fullName}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleToggleSubscription(item, 'github')}>
            <Icon 
              name={isSubscribed ? "star" : "star-outline"} 
              size={28} 
              color={isSubscribed ? HackerTheme.secondary : HackerTheme.lightGrey} 
            />
          </TouchableOpacity>
        </View>
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
  };

  const renderNpmItem = ({ item }: { item: NpmPackage }) => {
    const isSubscribed = subscribedItems.has(item.name);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TouchableOpacity 
            style={styles.cardHeaderTitle}
            onPress={() => item.npmUrl && Linking.openURL(item.npmUrl)}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>v{item.version}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleToggleSubscription(item, 'npm')}>
            <Icon 
              name={isSubscribed ? "star" : "star-outline"} 
              size={28} 
              color={isSubscribed ? HackerTheme.secondary : HackerTheme.lightGrey} 
            />
          </TouchableOpacity>
        </View>
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
  };

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
      {renderHeader()}

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
          keyExtractor={(item: any) => item.id?.toString() || item.name}
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
  header: {
    backgroundColor: HackerTheme.darkerGreen,
    borderBottomWidth: 1,
    borderBottomColor: HackerTheme.darkGreen,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  headerTitle: {
    ...Typography.heading3,
    color: HackerTheme.primary,
    letterSpacing: 2,
  },
  filterToggleButton: {
    padding: Spacing.xs,
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
  filtersPanel: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  filterLabel: {
    ...Typography.captionText,
    color: HackerTheme.primary,
    width: 80,
  },
  filterInput: {
    flex: 1,
    ...Typography.bodyText,
    color: HackerTheme.lightOnPrimary,
    backgroundColor: HackerTheme.darkGreen,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: HackerTheme.primary + '20',
  },
  sortButtons: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: HackerTheme.darkGreen,
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: HackerTheme.primary + '20',
    borderColor: HackerTheme.primary,
  },
  sortButtonText: {
    fontSize: 10,
    color: HackerTheme.lightGrey,
  },
  sortButtonTextActive: {
    color: HackerTheme.primary,
    fontWeight: 'bold',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  cardHeaderTitle: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.heading3,
    color: HackerTheme.primary,
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
    ...Typography.bodyText,
    color: HackerTheme.darkGrey,
    fontWeight: '800',
    fontFamily: 'monospace'
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
    color: HackerTheme.darkGrey,
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
