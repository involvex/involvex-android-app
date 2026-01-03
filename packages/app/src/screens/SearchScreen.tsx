/**
 * SearchScreen
 * Advanced search for GitHub repos and npm packages with filters
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
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

export const SearchScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('github');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [githubResults, setGithubResults] = useState<GitHubRepository[]>([]);
  const [npmResults, setNpmResults] = useState<NpmPackage[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [minStars, setMinStars] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortType>('stars');

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
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HackerTheme.darkGreen,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HackerTheme.primary + '20',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
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
    marginTop: Spacing.md,
  },
  quickFiltersContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  quickFilterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: HackerTheme.darkGreen,
    backgroundColor: HackerTheme.darkerGreen,
    marginRight: Spacing.sm,
  },
  quickFilterChipActive: {
    backgroundColor: HackerTheme.darkGreen,
    borderColor: HackerTheme.primary,
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
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HackerTheme.primary + '20',
  },
  filterLabel: {
    ...Typography.bodyText,
    color: HackerTheme.primary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
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
});

export default SearchScreen;
