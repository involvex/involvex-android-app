/**
 * HomeScreen
 * Displays trending GitHub repos and npm packages with dual tabs
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
  ToastAndroid,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { HackerTheme } from "../theme/colors";
import { Typography } from "../theme/typography";
import { Spacing } from "../theme/spacing";
import { useTrendingStore } from "../store/trendingStore";
import { useSubscriptionsStore } from "../store/subscriptionsStore";
import { TimeframeType } from "../api/github/githubClient";
import { GitHubRepository } from "../models/GitHubRepository";
import { NpmPackage } from "../models/NpmPackage";

type TabType = "github" | "npm";

export const HomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("github");
  const {
    timeframe,
    githubRepos,
    npmPackages,
    loading,
    error,
    setTimeframe,
    refreshAll,
  } = useTrendingStore();

  const starredIds = useSubscriptionsStore((state) => state.starredIds);
  const toggleStar = useSubscriptionsStore((state) => state.toggle);

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
      {(["daily", "weekly", "monthly"] as TimeframeType[]).map((tf) => (
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
          GitHub ({githubRepos.length})
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
          npm ({npmPackages.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const handleOpenUrl = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert("Error", "Could not open link");
      });
    }
  };

  const renderGitHubItem = ({ item }: { item: GitHubRepository }) => {
    const starred = starredIds.has(`repository:${item.id}`);
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
    const starred = starredIds.has(`package:${item.name}`);
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
      <Text style={styles.emptyText}>
        {loading ? "Loading..." : "No data available"}
      </Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const data = activeTab === "github" ? githubRepos : npmPackages;

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
            activeTab === "github"
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
    flexDirection: "row",
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
    alignItems: "center",
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
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
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
  listContent: {
    padding: Spacing.md,
  },
  card: {
    backgroundColor: HackerTheme.darkGreen,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: HackerTheme.mediumGrey,
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
    padding: Spacing.xl,
  },
  emptyText: {
    ...Typography.bodyText,
    color: HackerTheme.lightGrey,
    textAlign: "center",
  },
  errorText: {
    ...Typography.captionText,
    color: HackerTheme.errorRed,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
});

export default HomeScreen;
