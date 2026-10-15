/**
 * SearchScreen
 * Advanced search for GitHub repos and npm packages with filters
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  Alert,
  Linking,
  TouchableWithoutFeedback,
  ToastAndroid,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSubscriptionsStore } from "../store/subscriptionsStore";
import { HackerTheme } from "../theme/colors";
import { Typography } from "../theme/typography";
import { Spacing } from "../theme/spacing";
import { githubService } from "../api/github/githubService";
import { npmService } from "../api/npm/npmService";
import { GitHubRepository } from "../models/GitHubRepository";
import { NpmPackage } from "../models/NpmPackage";

type TabType = "github" | "npm";
type SortType = "stars" | "forks" | "updated" | "downloads";

const QUICK_FILTERS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "React",
  "Node.js",
  "Vue",
];

/**
 * npm ecosystem categories. Each maps to npm search qualifiers so results are
 * actually scoped to the category rather than just matching free text.
 */
const NPM_CATEGORIES: { label: string; query: string }[] = [
  { label: "All", query: "" },
  { label: "Front-end", query: "keywords:frontend" },
  { label: "Back-end", query: "keywords:backend" },
  { label: "CLI", query: "keywords:cli" },
  { label: "Docs", query: "keywords:documentation" },
  { label: "CSS", query: "keywords:css" },
  { label: "Testing", query: "keywords:testing" },
  { label: "IoT", query: "keywords:iot" },
  { label: "Coverage", query: "keywords:coverage" },
  { label: "Mobile", query: "keywords:mobile" },
  { label: "Frameworks", query: "keywords:framework" },
  { label: "Robotics", query: "keywords:robotics" },
  { label: "Math", query: "keywords:math" },
  { label: "Agents", query: "keywords:agent" },
  { label: "Create", query: "keywords:create" },
  { label: "Build", query: "keywords:build" },
  { label: "Parser", query: "keywords:parser" },
  { label: "Lint", query: "keywords:lint" },
];

export const SearchScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("github");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [githubResults, setGithubResults] = useState<GitHubRepository[]>([]);
  const [npmResults, setNpmResults] = useState<NpmPackage[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [minStars, setMinStars] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortType>("stars");
  const [npmCategory, setNpmCategory] = useState<string>("");

  const starredIds = useSubscriptionsStore((state) => state.starredIds);
  const toggleStar = useSubscriptionsStore((state) => state.toggle);

  const isStarred = (itemId: string, type: "repository" | "package") =>
    starredIds.has(`${type}:${itemId}`);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      if (activeTab === "github") {
        const results = await githubService.search(searchQuery, {
          language: selectedLanguage || undefined,
          minStars,
          sort: sortBy === "downloads" ? "stars" : sortBy,
          perPage: 50,
        });
        setGithubResults(results);
      } else {
        const category = NPM_CATEGORIES.find((c) => c.label === npmCategory);
        // Combine the user's text with the category qualifier so both apply.
        const text = [npmCategory === "All" ? "" : category?.query, searchQuery]
          .filter(Boolean)
          .join(" ");

        const results = await npmService.search(text, {
          quality: 0.8,
          popularity: 0.9,
          maintenance: 0.5,
        });
        setNpmResults(results);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeTab, selectedLanguage, minStars, sortBy, npmCategory]);

  const handleQuickFilter = (filter: string) => {
    setSelectedLanguage(filter);
    setSearchQuery(filter);
    setTimeout(() => handleSearch(), 100);
  };

  const handleNpmCategory = (label: string) => {
    setNpmCategory(label);
    // Categories are a browsing aid, so re-run using the current query if any.
    if (searchQuery.trim()) {
      setTimeout(() => handleSearch(), 100);
    }
  };

  const handleOpenUrl = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert("Error", "Could not open link");
      });
    }
  };

  const handleToggleStar = async (
    item: GitHubRepository | NpmPackage,
    type: "repository" | "package",
  ) => {
    try {
      const nowStarred = await toggleStar(item, type);
      ToastAndroid.show(
        nowStarred ? "Added to Subs" : "Removed from Subs",
        ToastAndroid.SHORT,
      );
    } catch {
      Alert.alert("Error", "Could not update subscription");
    }
  };

  const renderTabSelector = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "github" && styles.tabButtonActive,
        ]}
        onPress={() => setActiveTab("github")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "github" && styles.tabTextActive,
          ]}
        >
          GitHub ({githubResults.length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "npm" && styles.tabButtonActive,
        ]}
        onPress={() => setActiveTab("npm")}
      >
        <Text
          style={[styles.tabText, activeTab === "npm" && styles.tabTextActive]}
        >
          npm ({npmResults.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Icon name="magnify" size={18} color={HackerTheme.lightGrey} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search ${activeTab}...`}
          placeholderTextColor={HackerTheme.lightGrey}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Icon name="close-circle" size={18} color={HackerTheme.lightGrey} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Icon
          name={showFilters ? "filter-off" : "filter"}
          size={20}
          color={showFilters ? HackerTheme.primary : HackerTheme.lightGrey}
        />
      </TouchableOpacity>
    </View>
  );

  const renderQuickFilters = () => {
    // The npm tab has no "language" concept, so show the ecosystem category
    // picker there instead of the GitHub language chips.
    const isNpm = activeTab === "npm";

    if (isNpm) {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickFiltersContainer}
          contentContainerStyle={styles.quickFiltersContent}
        >
          {NPM_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.label}
              style={[
                styles.quickFilterChip,
                npmCategory === category.label && styles.quickFilterChipActive,
              ]}
              onPress={() => handleNpmCategory(category.label)}
            >
              <Text
                style={[
                  styles.quickFilterText,
                  npmCategory === category.label &&
                    styles.quickFilterTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickFiltersContainer}
        contentContainerStyle={styles.quickFiltersContent}
      >
        {QUICK_FILTERS.map((filter) => (
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

        {activeTab === "github" && (
          <>
            <Text style={styles.filterLabel}>Minimum Stars</Text>
            <TextInput
              style={styles.filterInput}
              value={minStars.toString()}
              onChangeText={(text) => setMinStars(parseInt(text, 10) || 0)}
              placeholder="0"
              placeholderTextColor={HackerTheme.lightGrey}
              keyboardType="numeric"
            />

            <Text style={styles.filterLabel}>Sort By</Text>
            <View style={styles.sortButtons}>
              {(["stars", "forks", "updated"] as SortType[]).map((sort) => (
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
    const starred = isStarred(String(item.id), "repository");
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={styles.cardHeaderMain}
            onPress={() => handleOpenUrl(item.htmlUrl)}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.fullName}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.starButton, starred && styles.starButtonActive]}
            onPress={() => handleToggleStar(item, "repository")}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            accessibilityRole="button"
            accessibilityLabel={
              starred ? `Unstar ${item.fullName}` : `Star ${item.fullName}`
            }
          >
            <Icon
              name={starred ? "star" : "star-outline"}
              size={20}
              color={
                starred ? HackerTheme.warningOrange : HackerTheme.lightGrey
              }
            />
          </TouchableOpacity>
        </View>

        {item.description && (
          <TouchableOpacity onPress={() => handleOpenUrl(item.htmlUrl)}>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </TouchableOpacity>
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
    const starred = isStarred(String(item.name), "package");
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={styles.cardHeaderMain}
            onPress={() => handleOpenUrl(item.npmUrl)}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>v{item.version}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.starButton, starred && styles.starButtonActive]}
            onPress={() => handleToggleStar(item, "package")}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            accessibilityRole="button"
            accessibilityLabel={
              starred ? `Unstar ${item.name}` : `Star ${item.name}`
            }
          >
            <Icon
              name={starred ? "star" : "star-outline"}
              size={20}
              color={
                starred ? HackerTheme.warningOrange : HackerTheme.lightGrey
              }
            />
          </TouchableOpacity>
        </View>

        {item.description && (
          <TouchableOpacity onPress={() => handleOpenUrl(item.npmUrl)}>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </TouchableOpacity>
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
          ? "No results found"
          : "Search for repositories and packages"}
      </Text>
    </View>
  );

  const results = activeTab === "github" ? githubResults : npmResults;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
          <View style={styles.listWrapper}>
            <FlashList
              data={results as any}
              renderItem={
                activeTab === "github"
                  ? (renderGitHubItem as any)
                  : (renderNpmItem as any)
              }
              // @ts-ignore
              estimatedItemSize={150}
              keyExtractor={(item: any) => item.id || item.name}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={renderEmptyState}
            />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HackerTheme.darkerGreen,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HackerTheme.darkGreen,
    backgroundColor: HackerTheme.darkerGreen,
    alignItems: "center",
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
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: HackerTheme.darkGreen,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HackerTheme.primary + "20",
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xs,
    // minHeight instead of height: honours OS font scaling without clipping
    minHeight: 40,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyText,
    fontSize: 14,
    // lineHeight must be removed so the OS font scale can grow the row
    lineHeight: undefined,
    paddingVertical: 0,
    margin: 0,
    color: HackerTheme.lightOnPrimary,
  },
  filterButton: {
    flexShrink: 0,
    width: 40,
    height: 40,
    backgroundColor: HackerTheme.darkGreen,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HackerTheme.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  quickFiltersContainer: {
    marginTop: Spacing.sm,
    // A horizontal ScrollView defaults to flexGrow:1, which makes it soak up
    // all leftover vertical space in this column and stretch its chips.
    flexGrow: 0,
    flexShrink: 0,
  },
  quickFiltersContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    // stops chips stretching to the full height of the row
    alignItems: "center",
  },
  quickFilterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: HackerTheme.darkGreen,
    backgroundColor: HackerTheme.darkerGreen,
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
    fontWeight: "600",
  },
  filtersPanel: {
    backgroundColor: HackerTheme.darkGreen,
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HackerTheme.primary + "20",
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
    borderColor: HackerTheme.primary + "20",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sortButtons: {
    flexDirection: "row",
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
    alignItems: "center",
  },
  sortButtonActive: {
    backgroundColor: HackerTheme.primary + "20",
    borderColor: HackerTheme.primary,
  },
  sortButtonText: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey,
  },
  sortButtonTextActive: {
    color: HackerTheme.primary,
    fontWeight: "600",
  },
  applyButton: {
    backgroundColor: HackerTheme.primary,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  applyButtonText: {
    ...Typography.buttonText,
    color: HackerTheme.darkerGreen,
  },
  listWrapper: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  cardHeaderMain: {
    flex: 1,
  },
  starButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: HackerTheme.darkerGreen,
    borderWidth: 1,
    borderColor: HackerTheme.mediumGrey,
  },
  starButtonActive: {
    backgroundColor: HackerTheme.darkGrey,
    borderColor: HackerTheme.warningOrange,
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
    borderColor: HackerTheme.primary + "20",
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
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flexWrap: "wrap",
  },
  statText: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey,
  },
  languageBadge: {
    flexDirection: "row",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...Typography.bodyText,
    color: HackerTheme.primary,
    marginTop: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    ...Typography.bodyText,
    color: HackerTheme.lightGrey,
    marginTop: Spacing.md,
    textAlign: "center",
  },
});

export default SearchScreen;
