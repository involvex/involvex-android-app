/**
 * SubscriptionsScreen
 * Manages user subscriptions with SQLite persistence
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';
import { encode } from 'base-64';
import { HackerTheme } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { subscriptionsRepository } from '../database/repositories/subscriptionsRepository';
import { Subscription } from '../models';

type TabType = 'repository' | 'package';

export const SubscriptionsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('repository');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSubscriptions = useCallback(async () => {
    try {
      const subs = await subscriptionsRepository.getByType(activeTab);
      setSubscriptions(subs);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadSubscriptions();
  };

  const handleUnsubscribe = async (subscription: Subscription) => {
    Alert.alert(
      'Unsubscribe',
      `Remove ${subscription.name} from subscriptions?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await subscriptionsRepository.remove(subscription.id);
              await loadSubscriptions();
            } catch (error) {
              console.error('Error removing subscription:', error);
              Alert.alert('Error', 'Failed to remove subscription');
            }
          },
        },
      ],
    );
  };

  const handleExport = async () => {
    try {
      const json = await subscriptionsRepository.exportToJSON();
      const count = await subscriptionsRepository.getCount();

      await Share.open({
        title: 'Export Subscriptions',
        message: `Trending Hub Subscriptions (${count} items)`,
        url: `data:application/json;base64,${encode(json)}`,
        filename: `trending-hub-subscriptions-${Date.now()}.json`,
        type: 'application/json',
      });
    } catch (error) {
      if (error instanceof Error && error.message !== 'User did not share') {
        console.error('Export error:', error);
        Alert.alert('Error', 'Failed to export subscriptions');
      }
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Subscriptions',
      `Remove all ${subscriptions.length} subscriptions? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await subscriptionsRepository.clearAll();
              await loadSubscriptions();
            } catch (error) {
              console.error('Error clearing subscriptions:', error);
              Alert.alert('Error', 'Failed to clear subscriptions');
            }
          },
        },
      ],
    );
  };

  const renderTabSelector = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'repository' && styles.tabButtonActive,
        ]}
        onPress={() => setActiveTab('repository')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'repository' && styles.tabTextActive,
          ]}
        >
          Repositories ({subscriptions.length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'package' && styles.tabButtonActive,
        ]}
        onPress={() => setActiveTab('package')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'package' && styles.tabTextActive,
          ]}
        >
          Packages ({subscriptions.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionContainer}>
      <TouchableOpacity style={styles.actionButton} onPress={handleExport}>
        <Icon name="export" size={20} color={HackerTheme.primary} />
        <Text style={styles.actionText}>Export</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleClearAll}
        disabled={subscriptions.length === 0}
      >
        <Icon
          name="delete-sweep"
          size={20}
          color={
            subscriptions.length === 0
              ? HackerTheme.lightGrey
              : HackerTheme.errorRed
          }
        />
        <Text
          style={[
            styles.actionText,
            subscriptions.length === 0
              ? styles.actionTextDisabled
              : { color: HackerTheme.errorRed },
          ]}
        >
          Clear All
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSubscriptionItem = ({ item }: { item: Subscription }) => {
    const data = JSON.parse(item.data);
    const isRepository = item.type === 'repository';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            {item.fullName && (
              <Text style={styles.cardSubtitle}>{item.fullName}</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => handleUnsubscribe(item)}>
            <Icon name="star" size={24} color={HackerTheme.primary} />
          </TouchableOpacity>
        </View>

        {data.description && (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {data.description}
          </Text>
        )}

        <View style={styles.statsRow}>
          {isRepository ? (
            <>
              <Text style={styles.statText}>⭐ {data.stars || 0}</Text>
              <Text style={styles.statText}>🍴 {data.forks || 0}</Text>
              {data.language && (
                <View style={styles.languageBadge}>
                  <Text style={styles.languageText}>{data.language}</Text>
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={styles.statText}>📦 {data.downloads || 0}</Text>
              <Text style={styles.statText}>v{data.version || '1.0.0'}</Text>
            </>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>
            Subscribed {new Date(item.subscribedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="star-outline" size={64} color={HackerTheme.darkGreen} />
      <Text style={styles.emptyTitle}>No Subscriptions</Text>
      <Text style={styles.emptyText}>
        Star repositories and packages from the Home or Search screen to track
        them here
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={HackerTheme.primary} />
        <Text style={styles.loadingText}>Loading subscriptions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderTabSelector()}
      {renderActionButtons()}

      <FlashList
        data={subscriptions}
        renderItem={renderSubscriptionItem}
        // @ts-ignore
        estimatedItemSize={150}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
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
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HackerTheme.darkGreen,
    backgroundColor: HackerTheme.darkerGreen,
  },
  actionText: {
    ...Typography.bodyText,
    color: HackerTheme.primary,
  },
  actionTextDisabled: {
    color: HackerTheme.lightGrey,
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
    marginBottom: Spacing.sm,
  },
  cardTitleContainer: {
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
    marginBottom: Spacing.sm,
  },
  statText: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey,
  },
  languageBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
    backgroundColor: HackerTheme.primary + '20',
  },
  languageText: {
    ...Typography.captionText,
    color: HackerTheme.primary,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: HackerTheme.primary + '10',
    paddingTop: Spacing.sm,
  },
  footerText: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey,
    fontSize: 11,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: HackerTheme.darkerGreen,
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
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.bodyText,
    color: HackerTheme.lightGrey,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default SubscriptionsScreen;
