/**
 * SearchScreen
 * Advanced search for GitHub repos and npm packages with filters
 */

import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { githubService } from '../api/github/githubService';
import { npmService } from '../api/npm/npmService';
import { subscriptionsRepository } from '../database/repositories/subscriptionsRepository';
import { GitHubRepository } from '../models/GitHubRepository';
import { NpmPackage } from '../models/NpmPackage';
import { useAIChatStore } from '../store/aiChatStore';
import { useInfoCard } from '../store/InfoCard';
import { useSettingsStore } from '../store/settingsStore';
import { HackerTheme } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';

type TabType = 'github' | 'npm';
type SortType = 'stars' | 'forks' | 'updated' | 'downloads';

const QUICK_FILTERS = [
  'JavaScript',
  'TypeScript',
  'Python',
  'React',
  'Node.js',
  'Vue',
];

const NPM_CATEGORIES = [
  { id: 'frontend', label: 'Front-end', keywords: 'react vue angular svelte' },
  { id: 'backend', label: 'Back-end', keywords: 'express fastify koa nest' },
  { id: 'cli', label: 'CLI', keywords: 'cli command-line terminal' },
  {
    id: 'docs',
    label: 'Documentation',
    keywords: 'documentation docs markdown',
  },
  { id: 'css', label: 'CSS', keywords: 'css styles tailwind sass' },
  { id: 'testing', label: 'Testing', keywords: 'test jest mocha vitest' },
  { id: 'iot', label: 'IoT', keywords: 'iot arduino raspberry-pi mqtt' },
  { id: 'coverage', label: 'Coverage', keywords: 'coverage istanbul nyc' },
  {
    id: 'mobile',
    label: 'Mobile',
    keywords: 'mobile ios android react-native',
  },
  {
    id: 'frameworks',
    label: 'Frameworks',
    keywords: 'framework next nuxt remix',
  },
  { id: 'robotics', label: 'Robotics', keywords: 'robotics robot automation' },
  { id: 'math', label: 'Math', keywords: 'math mathematics algebra' },
];

export const SearchScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('github');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [githubResults, setGithubResults] = useState<GitHubRepository[]>([]);
  const [npmResults, setNpmResults] = useState<NpmPackage[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [subscribedItems, setSubscribedItems] = useState<Set<string>>(
    new Set(),
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recentlyUpdated, setRecentlyUpdated] = useState<NpmPackage[]>([]);

  // Filters
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [minStars, setMinStars] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortType>('stars');

  // AI Chat and Info Card integration
  const openChat = useAIChatStore(state => state.openChat);
  const openInfoCard = useInfoCard(state => state.openInfoCard);
  const enableInfoCardPreview = useSettingsStore(
    state => state.settings.enableInfoCardPreview,
  );

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    if (activeTab === 'npm' && recentlyUpdated.length === 0) {
      loadRecentlyUpdated();
    }
  }, [activeTab, recentlyUpdated.length]);

  const loadSubscriptions = async () => {
    try {
      const subs = await subscriptionsRepository.getAll();
      setSubscribedItems(new Set(subs.map(s => s.itemId)));
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    }
  };

  const loadRecentlyUpdated = async () => {
    try {
      const packages = await npmService.getRecentlyUpdated(10);
      setRecentlyUpdated(packages);
    } catch (error) {
      console.error('Failed to load recently updated packages:', error);
    }
  };

  const handleToggleSubscription = async (
    item: GitHubRepository | NpmPackage,
    type: 'github' | 'npm',
  ) => {
    const itemId =
      type === 'github'
        ? String((item as GitHubRepository).id)
        : (item as NpmPackage).name;
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
          fullName:
            type === 'github' ? (item as GitHubRepository).fullName : undefined,
          data: JSON.stringify(item),
          subscribedAt: Date.now(),
          isActive: true,
        });
        setSubscribedItems(prev => new Set(prev).add(itemId));
        Alert.alert(
          'Subscribed',
          `${item.name} added to your personal subscriptions.`,
        );
      }
    } catch (error) {
      console.error('Subscription toggle error:', error);
      Alert.alert('Error', 'Failed to update subscription.');
    }
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'github') {
        const results = await githubService.search(searchQuery, {
          language: selectedLanguage || undefined,
          minStars,
          sort: sortBy === 'downloads' ? 'stars' : sortBy,
          perPage: 50,
        });
        setGithubResults(results);
      } else {
        const results = await npmService.search(searchQuery, {
          quality: 0.8,
          popularity: 0.9,
          maintenance: 0.5,
        });
        setNpmResults(results);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to search. Please check your connection and try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeTab, selectedLanguage, minStars, sortBy]);

  const handleRefresh = () => {
    if (searchQuery.trim()) {
      void handleSearch();
    }
    void loadSubscriptions();
    if (activeTab === 'npm') {
      void loadRecentlyUpdated();
    }
  };

  const handleQuickFilter = (filter: string) => {
    setSelectedLanguage(filter);
    setSearchQuery(filter);
    setTimeout(handleSearch, 100);
  };

  const clearAllFilters = () => {
    setSelectedLanguage('');
    setMinStars(0);
    setSortBy('stars');
    setSelectedCategory(null);
  };

  const getActiveFilterCount = (): number => {
    let count = 0;
    if (selectedLanguage) count++;
    if (minStars > 0) count++;
    if (sortBy !== 'stars') count++;
    return count;
  };

  const hasActiveFilters = getActiveFilterCount() > 0;

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
          GitHub ({githubResults.length})
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
          npm ({npmResults.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Icon name="magnify" size={20} color={HackerTheme.lightGrey} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search ${activeTab}...`}
          placeholderTextColor={HackerTheme.lightGrey}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color={HackerTheme.lightGrey} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Icon
          name={showFilters ? 'filter-off' : 'filter'}
          size={20}
          color={showFilters ? HackerTheme.primary : HackerTheme.lightGrey}
        />
        {hasActiveFilters && !showFilters && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderActiveFilters = () => {
    if (!hasActiveFilters) return null;

    return (
      <View style={styles.activeFiltersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activeFiltersContent}
        >
          {selectedLanguage && (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>
                Language: {selectedLanguage}
              </Text>
              <TouchableOpacity onPress={() => setSelectedLanguage('')}>
                <Icon name="close" size={16} color={HackerTheme.primary} />
              </TouchableOpacity>
            </View>
          )}
          {minStars > 0 && (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>⭐ {minStars}+</Text>
              <TouchableOpacity onPress={() => setMinStars(0)}>
                <Icon name="close" size={16} color={HackerTheme.primary} />
              </TouchableOpacity>
            </View>
          )}
          {sortBy !== 'stars' && (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>
                Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
              </Text>
              <TouchableOpacity onPress={() => setSortBy('stars')}>
                <Icon name="close" size={16} color={HackerTheme.primary} />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        <TouchableOpacity
          style={styles.clearAllButton}
          onPress={clearAllFilters}
        >
          <Text style={styles.clearAllText}>Clear all</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderQuickFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.quickFiltersContainer}
      contentContainerStyle={styles.quickFiltersContent}
    >
      {QUICK_FILTERS.map(filter => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.quickFilterChip,
            selectedLanguage === filter && styles.quickFilterChipActive,
          ]}
          onPress={() => handleQuickFilter(filter)}
        >
          <Text
            style={[
              styles.quickFilterText,
              selectedLanguage === filter && styles.quickFilterTextActive,
            ]}
          >
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderNpmCategoryFilters = () => {
    if (activeTab !== 'npm') return null;

    return (
      <View style={styles.categoryFiltersContainer}>
        <Text style={styles.categoryTitle}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFiltersContent}
        >
          {NPM_CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => {
                setSelectedCategory(
                  selectedCategory === category.id ? null : category.id,
                );
                const selected = NPM_CATEGORIES.find(c => c.id === category.id);
                if (selected) {
                  setSearchQuery(selected.keywords);
                  setTimeout(handleSearch, 100);
                }
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderRecentlyUpdated = () => {
    if (activeTab !== 'npm' || recentlyUpdated.length === 0) return null;

    return (
      <View style={styles.recentlyUpdatedContainer}>
        <View style={styles.recentlyUpdatedHeader}>
          <Icon name="update" size={20} color={HackerTheme.primary} />
          <Text style={styles.recentlyUpdatedTitle}>Recently Updated</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentlyUpdatedContent}
        >
          {recentlyUpdated.map(pkg => (
            <TouchableOpacity
              key={pkg.name}
              style={styles.recentlyUpdatedCard}
              onPress={() => pkg.npmUrl && Linking.openURL(pkg.npmUrl)}
              activeOpacity={0.8}
            >
              <View style={styles.recentlyUpdatedIconContainer}>
                <Icon name="npm" size={32} color={HackerTheme.primary} />
              </View>
              <Text style={styles.recentlyUpdatedName} numberOfLines={2}>
                {pkg.name}
              </Text>
              <View style={styles.recentlyUpdatedVersionBadge}>
                <Text style={styles.recentlyUpdatedVersion}>v{pkg.version}</Text>
              </View>
              <Text style={styles.recentlyUpdatedDownloads}>
                📦 {pkg.formattedDownloads}
              </Text>
              <Text style={styles.recentlyUpdatedDate}>
                {new Date(pkg.lastPublish).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderAdvancedFilters = () => {
    if (!showFilters) return null;

    return (
      <View style={styles.filtersPanel}>
        <Text style={styles.filterLabel}>Language</Text>
        <TextInput
          style={styles.filterInput}
          value={selectedLanguage}
          onChangeText={setSelectedLanguage}
          placeholder="e.g., JavaScript, Python"
          placeholderTextColor={HackerTheme.lightGrey}
        />

        {activeTab === 'github' && (
          <>
            <Text style={styles.filterLabel}>Minimum Stars</Text>
            <TextInput
              style={styles.filterInput}
              value={minStars.toString()}
              onChangeText={text => setMinStars(parseInt(text, 10) || 0)}
              placeholder="0"
              placeholderTextColor={HackerTheme.lightGrey}
              keyboardType="numeric"
            />

            <Text style={styles.filterLabel}>Sort By</Text>
            <View style={styles.sortButtons}>
              {(['stars', 'forks', 'updated'] as SortType[]).map(sort => (
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
          </>
        )}

        <TouchableOpacity style={styles.applyButton} onPress={handleSearch}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderGitHubItem = ({ item }: { item: GitHubRepository }) => {
    const isSubscribed = subscribedItems.has(String(item.id));

    const handleItemPress = () => {
      if (enableInfoCardPreview) {
        openInfoCard(item);
      } else if (item.htmlUrl) {
        Linking.openURL(item.htmlUrl);
      }
    };

    return (
      <TouchableOpacity
        onPress={handleItemPress}
        onLongPress={() => openChat(item)}
        activeOpacity={0.9}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitle}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>{item.fullName}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleToggleSubscription(item, 'github')}
            >
              <Icon
                name={isSubscribed ? 'star' : 'star-outline'}
                size={28}
                color={
                  isSubscribed ? HackerTheme.secondary : HackerTheme.lightGrey
                }
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
      </TouchableOpacity>
    );
  };

  const renderNpmItem = ({ item }: { item: NpmPackage }) => {
    const isSubscribed = subscribedItems.has(item.name);

    const handleItemPress = () => {
      if (enableInfoCardPreview) {
        openInfoCard(item);
      } else if (item.npmUrl) {
        Linking.openURL(item.npmUrl);
      }
    };

    return (
      <TouchableOpacity
        onPress={handleItemPress}
        onLongPress={() => openChat(item)}
        activeOpacity={0.9}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitle}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>v{item.version}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleToggleSubscription(item, 'npm')}
            >
              <Icon
                name={isSubscribed ? 'star' : 'star-outline'}
                size={28}
                color={
                  isSubscribed ? HackerTheme.secondary : HackerTheme.lightGrey
                }
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
            {item.stars > 0 && (
              <Text style={styles.statText}>⭐ {item.stars}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="magnify" size={64} color={HackerTheme.darkGreen} />
      <Text style={styles.emptyTitle}>
        {searchQuery.trim() ? 'No results found' : 'Start searching'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery.trim()
          ? 'Try different keywords or filters'
          : 'Search for GitHub repos and npm packages'}
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Icon name="alert-circle" size={64} color={HackerTheme.error} />
      <Text style={styles.errorTitle}>Search Failed</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleSearch}>
        <Icon name="refresh" size={20} color={HackerTheme.background} />
        <Text style={styles.retryText}>Retry Search</Text>
      </TouchableOpacity>
    </View>
  );

  const results = activeTab === 'github' ? githubResults : npmResults;

  return (
    <View style={styles.container}>
      {renderTabSelector()}
      {renderSearchBar()}
      {renderActiveFilters()}
      {renderNpmCategoryFilters()}
      {renderRecentlyUpdated()}
      {renderAdvancedFilters()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={HackerTheme.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : error ? (
        renderErrorState()
      ) : (
        <FlashList
          data={results}
          renderItem={
            activeTab === 'github'
              ? (renderGitHubItem as unknown as import('@shopify/flash-list').ListRenderItem<
                  GitHubRepository | NpmPackage
                >)
              : (renderNpmItem as unknown as import('@shopify/flash-list').ListRenderItem<
                  GitHubRepository | NpmPackage
                >)
          }
          // @ts-expect-error - estimatedItemSize exists in runtime but missing from FlashList type definitions
          estimatedItemSize={150}
          keyExtractor={item =>
            activeTab === 'github'
              ? String((item as GitHubRepository).id)
              : (item as NpmPackage).name
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              tintColor={HackerTheme.primary}
              colors={[HackerTheme.primary]}
            />
          }
        />
      )}

      {/* Floating Action Button for AI Chat */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => openChat(null)}
        activeOpacity={0.9}
      >
        <Icon name="robot" size={28} color={HackerTheme.background} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HackerTheme.darkerGreen,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
    backgroundColor: HackerTheme.darkerGreen,
    borderBottomWidth: 1,
    borderBottomColor: HackerTheme.primary + '20',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HackerTheme.darkGreen,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HackerTheme.primary + '40',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
    height: 48,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyText,
    color: HackerTheme.lightOnPrimary,
    paddingVertical: Spacing.sm,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: HackerTheme.darkGreen,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HackerTheme.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: HackerTheme.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    ...Typography.captionText,
    color: HackerTheme.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: HackerTheme.darkerGreen,
    borderBottomWidth: 1,
    borderBottomColor: HackerTheme.primary + '20',
    gap: Spacing.sm,
  },
  activeFiltersContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.sm,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: HackerTheme.primary + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: HackerTheme.primary,
  },
  activeFilterText: {
    ...Typography.captionText,
    color: HackerTheme.primary,
    fontWeight: '600',
  },
  clearAllButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  clearAllText: {
    ...Typography.captionText,
    color: HackerTheme.error,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  quickFiltersContainer: {
    paddingVertical: Spacing.md,
    backgroundColor: HackerTheme.darkerGreen,
    borderBottomWidth: 1,
    borderBottomColor: HackerTheme.primary + '20',
  },
  quickFiltersContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  quickFilterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: HackerTheme.primary + '40',
    backgroundColor: HackerTheme.darkGreen,
    marginRight: Spacing.md,
  },
  quickFilterChipActive: {
    backgroundColor: HackerTheme.primary + '20',
    borderColor: HackerTheme.primary,
    borderWidth: 2,
  },
  quickFilterText: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey,
  },
  quickFilterTextActive: {
    color: HackerTheme.primary,
    fontWeight: '600',
  },
  filtersPanel: {
    backgroundColor: HackerTheme.darkGreen,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: HackerTheme.primary + '40',
    gap: Spacing.md,
  },
  filterLabel: {
    ...Typography.bodyText,
    color: HackerTheme.primary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    marginTop: 0,
  },
  filterInput: {
    ...Typography.bodyText,
    color: HackerTheme.lightOnPrimary,
    backgroundColor: HackerTheme.darkerGreen,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HackerTheme.primary + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  sortButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HackerTheme.darkGreen,
    backgroundColor: HackerTheme.darkerGreen,
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: HackerTheme.primary + '20',
    borderColor: HackerTheme.primary,
  },
  sortButtonText: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey,
  },
  sortButtonTextActive: {
    color: HackerTheme.primary,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: HackerTheme.primary,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  applyButtonText: {
    ...Typography.buttonText,
    color: HackerTheme.darkerGreen,
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
    fontSize: 14,
    color: HackerTheme.primary,
    fontFamily: 'monospace',
    fontWeight: '600',
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
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.heading2,
    color: HackerTheme.primary,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...Typography.bodyText,
    color: HackerTheme.lightGrey,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.xl,
  },
  errorTitle: {
    ...Typography.heading2,
    color: HackerTheme.error,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  errorText: {
    ...Typography.bodyText,
    color: HackerTheme.lightGrey,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: HackerTheme.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  retryText: {
    ...Typography.buttonText,
    color: HackerTheme.background,
    fontWeight: '600',
  },
  categoryFiltersContainer: {
    paddingVertical: Spacing.md,
    backgroundColor: HackerTheme.darkerGreen,
    borderBottomWidth: 1,
    borderBottomColor: HackerTheme.primary + '20',
  },
  categoryTitle: {
    ...Typography.heading3,
    color: HackerTheme.primary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  categoryFiltersContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: HackerTheme.primary + '40',
    backgroundColor: HackerTheme.darkGreen,
    marginRight: Spacing.md,
  },
  categoryChipActive: {
    backgroundColor: HackerTheme.primary + '20',
    borderColor: HackerTheme.primary,
    borderWidth: 2,
  },
  categoryText: {
    ...Typography.bodyText,
    color: HackerTheme.lightGrey,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: HackerTheme.primary,
    fontWeight: 'bold',
  },
  recentlyUpdatedContainer: {
    paddingVertical: Spacing.md,
    backgroundColor: HackerTheme.darkerGreen,
    borderBottomWidth: 1,
    borderBottomColor: HackerTheme.primary + '20',
  },
  recentlyUpdatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  recentlyUpdatedTitle: {
    ...Typography.heading3,
    color: HackerTheme.primary,
  },
  recentlyUpdatedContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  recentlyUpdatedCard: {
    width: 180,
    backgroundColor: HackerTheme.darkGreen,
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: HackerTheme.primary + '40',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  recentlyUpdatedIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: HackerTheme.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  recentlyUpdatedName: {
    ...Typography.bodyText,
    color: HackerTheme.primary,
    fontWeight: '600',
    textAlign: 'center',
    minHeight: 40,
  },
  recentlyUpdatedVersionBadge: {
    backgroundColor: HackerTheme.accent + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HackerTheme.accent + '40',
  },
  recentlyUpdatedVersion: {
    ...Typography.captionText,
    color: HackerTheme.accent,
    fontWeight: '600',
    fontSize: 11,
  },
  recentlyUpdatedDownloads: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey,
    fontWeight: '500',
  },
  recentlyUpdatedDate: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey + 'CC',
    fontSize: 10,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: HackerTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: HackerTheme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default SearchScreen;
