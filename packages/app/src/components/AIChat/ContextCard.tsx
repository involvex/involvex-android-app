/**
 * ContextCard Component
 * Displays the current repo/package context for the conversation
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HackerTheme } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { GitHubRepository } from '../../models/GitHubRepository';
import { NpmPackage } from '../../models/NpmPackage';

interface ContextCardProps {
  context: GitHubRepository | NpmPackage;
  onClear?: () => void;
}

export const ContextCard: React.FC<ContextCardProps> = ({
  context,
  onClear,
}) => {
  const isRepo = 'fullName' in context;

  const name = isRepo
    ? (context as GitHubRepository).fullName
    : (context as NpmPackage).name;

  const description = isRepo
    ? (context as GitHubRepository).description
    : (context as NpmPackage).description;

  const stats = isRepo
    ? `⭐ ${(context as GitHubRepository).formattedStars}`
    : `📦 ${(context as NpmPackage).formattedDownloads}`;

  const iconName = isRepo ? 'github' : 'package-variant';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name={iconName} size={20} color={HackerTheme.accent} />
        <Text style={styles.headerText}>Context</Text>
        {onClear && (
          <TouchableOpacity style={styles.clearButton} onPress={onClear}>
            <Icon name="close-circle" size={18} color={HackerTheme.lightGrey} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}
        <Text style={styles.stats}>{stats}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: HackerTheme.darkGreen,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: HackerTheme.accent + '40',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  headerText: {
    ...Typography.captionText,
    color: HackerTheme.accent,
    fontWeight: 'bold',
    flex: 1,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  content: {
    gap: Spacing.xs,
  },
  name: {
    ...Typography.bodyText,
    color: HackerTheme.primary,
    fontWeight: 'bold',
  },
  description: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey,
    lineHeight: 16,
  },
  stats: {
    ...Typography.captionText,
    color: HackerTheme.accent,
    fontFamily: 'monospace',
  },
});

export default ContextCard;
