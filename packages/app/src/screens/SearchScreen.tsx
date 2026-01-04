/**
 * SearchScreen
 * Advanced search for GitHub repos and npm packages with filters
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HackerTheme } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { githubService } from '../api/github/githubService';
import { npmService } from '../api/npm/npmService';
import { GitHubRepository } from '../models/GitHubRepository';
import { NpmPackage } from '../models/NpmPackage';
import { subscriptionsRepository } from '../database/repositories/subscriptionsRepository';

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
  { id: 'docs', label: 'Documentation', keywords: 'documentation docs markdown' },
  { id: 'css', label: 'CSS', keywords: 'css styles tailwind sass' },
  { id: 'testing', label: 'Testing', keywords: 'test jest mocha vitest' },
  { id: 'iot', label: 'IoT', keywords: 'iot arduino raspberry-pi mqtt' },
  { id: 'coverage', label: 'Coverage', keywords: 'coverage istanbul nyc' },
  { id: 'mobile', label: 'Mobile', keywords: 'mobile ios android react-native' },
  { id: 'frameworks', label: 'Frameworks', keywords: 'framework next nuxt remix' },
  { id: 'robotics', label: 'Robotics', keywords: 'robotics robot automation' },
  { id: 'math', label: 'Math', keywords: 'math mathematics algebra' },
];

export const SearchScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('github');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    if (activeTab === 'npm' && recentlyUpdated.length === 0) {
      loadRecentlyUpdated();
    }
  }, [activeTab]);

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
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeTab, selectedLanguage, minStars, sortBy]);

  const handleQuickFilter = (filter: string) => {
    setSelectedLanguage(filter);
    setSearchQuery(filter);
    setTimeout(handleSearch, 100);
  };

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
      </TouchableOpacity>
    </View>
  );

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
                  selectedCategory === category.id ? null : category.id
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
            >
              <Icon name="npm" size={24} color={HackerTheme.primary} />
              <Text style={styles.recentlyUpdatedName} numberOfLines={1}>
                {pkg.name}
              </Text>
              <Text style={styles.recentlyUpdatedVersion}>v{pkg.version}</Text>
              <Text style={styles.recentlyUpdatedDownloads}>
                {pkg.formattedDownloads}
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
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="magnify" size={64} color={HackerTheme.darkGreen} />
      <Text style={styles.emptyText}>
        {searchQuery.trim()
          ? 'No results found'
          : 'Search for repositories and packages'}
      </Text>
    </View>
  );

  const results = activeTab === 'github' ? githubResults : npmResults;

  return (
    <View style={styles.container}>
      {renderTabSelector()}
      {renderSearchBar()}
      {renderQuickFilters()}
      {renderNpmCategoryFilters()}
      {renderRecentlyUpdated()}
      {renderAdvancedFilters()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={HackerTheme.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <FlashList
          data={results as any}
          renderItem={
            activeTab === 'github'
              ? (renderGitHubItem as any)
              : (renderNpmItem as any)
          }
          // @ts-ignore
          estimatedItemSize={150}
          keyExtractor={(item: any) => item.id || item.name}
          contentContainerStyle={styles.listContent}
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
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    ...Typography.bodyText,
    color: HackerTheme.lightGrey,
    marginTop: Spacing.md,
    textAlign: 'center',
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
    width: 140,
    backgroundColor: HackerTheme.darkGreen,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: HackerTheme.primary + '40',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  recentlyUpdatedName: {
    ...Typography.bodyText,
    color: HackerTheme.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  recentlyUpdatedVersion: {
    ...Typography.captionText,
    color: HackerTheme.accent,
  },
  recentlyUpdatedDownloads: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey,
  },
});

export default SearchScreen;
