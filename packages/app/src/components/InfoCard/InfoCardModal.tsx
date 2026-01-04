/**
 * InfoCard Modal
 * Preview card with option to open in WebView or external browser
 */

import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Share from 'react-native-share';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { GitHubRepository } from '../../models/GitHubRepository';
import { NpmPackage } from '../../models/NpmPackage';
import { useInfoCard } from '../../store/InfoCard';
import { HackerTheme } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';

export const InfoCardModal: React.FC = () => {
  const {
    isOpen,
    showWebView,
    loading,
    error,
    currentItem,
    itemType,
    currentUrl,
    canGoBack,
    canGoForward,
    loadingProgress,
    closeInfoCard,
    openWebView,
    setWebViewNavigation,
    setLoadingProgress,
    setError,
  } = useInfoCard();

  const webViewRef = useRef<WebView>(null);

  // WebView event handlers
  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setWebViewNavigation(navState.canGoBack, navState.canGoForward);
  };

  const handleLoadProgress = ({
    nativeEvent,
  }: {
    nativeEvent: { progress: number };
  }) => {
    setLoadingProgress(nativeEvent.progress);
  };

  const handleError = () => {
    setError('Failed to load page. Check your internet connection.');
  };

  // Navigation controls
  const handleGoBack = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    }
  };

  const handleGoForward = () => {
    if (canGoForward && webViewRef.current) {
      webViewRef.current.goForward();
    }
  };

  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
      setError(null);
    }
  };

  // Share functionality
  const handleShare = async () => {
    if (!currentItem || !currentUrl) return;

    const title =
      itemType === 'github'
        ? (currentItem as GitHubRepository).fullName
        : currentItem.name;

    try {
      await Share.open({
        title: `Share ${title}`,
        message: `Check out ${title}:\n${currentUrl}`,
        url: currentUrl,
      });
    } catch (error) {
      // User cancelled share - not an error
      if (error instanceof Error && error.message !== 'User did not share') {
        console.error('Share error:', error);
      }
    }
  };

  // Open in external browser
  const handleOpenExternal = () => {
    if (currentUrl) {
      Linking.openURL(currentUrl);
      closeInfoCard();
    }
  };

  if (!isOpen || !currentUrl || !currentItem) {
    return null;
  }

  const isGitHub = itemType === 'github';
  const repo = isGitHub ? (currentItem as GitHubRepository) : null;
  const pkg = !isGitHub ? (currentItem as NpmPackage) : null;

  // Render preview card
  const renderPreviewCard = () => (
    <View style={styles.previewContainer}>
      <ScrollView
        style={styles.previewScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.previewHeader}>
          <Icon
            name={isGitHub ? 'github' : 'npm'}
            size={48}
            color={HackerTheme.primary}
          />
          <Text style={styles.previewTitle}>
            {isGitHub ? repo?.fullName : pkg?.name}
          </Text>
          {!isGitHub && pkg && (
            <Text style={styles.previewVersion}>v{pkg.version}</Text>
          )}
        </View>

        {/* Description */}
        {currentItem.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {currentItem.description}
            </Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <View style={styles.statsGrid}>
            {isGitHub && repo && (
              <>
                <View style={styles.statItem}>
                  <Icon name="star" size={20} color={HackerTheme.accent} />
                  <Text style={styles.statLabel}>Stars</Text>
                  <Text style={styles.statValue}>{repo.formattedStars}</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon
                    name="source-fork"
                    size={20}
                    color={HackerTheme.accent}
                  />
                  <Text style={styles.statLabel}>Forks</Text>
                  <Text style={styles.statValue}>{repo.formattedForks}</Text>
                </View>
                {repo.language && (
                  <View style={styles.statItem}>
                    <View
                      style={[
                        styles.languageDot,
                        { backgroundColor: repo.languageColor },
                      ]}
                    />
                    <Text style={styles.statLabel}>Language</Text>
                    <Text style={styles.statValue}>{repo.language}</Text>
                  </View>
                )}
              </>
            )}
            {!isGitHub && pkg && (
              <>
                <View style={styles.statItem}>
                  <Icon name="download" size={20} color={HackerTheme.accent} />
                  <Text style={styles.statLabel}>Downloads</Text>
                  <Text style={styles.statValue}>{pkg.formattedDownloads}</Text>
                </View>
                {pkg.stars > 0 && (
                  <View style={styles.statItem}>
                    <Icon name="star" size={20} color={HackerTheme.accent} />
                    <Text style={styles.statLabel}>Stars</Text>
                    <Text style={styles.statValue}>{pkg.stars}</Text>
                  </View>
                )}
                <View style={styles.statItem}>
                  <Icon
                    name="package-variant"
                    size={20}
                    color={HackerTheme.accent}
                  />
                  <Text style={styles.statLabel}>Version</Text>
                  <Text style={styles.statValue}>v{pkg.version}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* URL */}
        <View style={styles.urlSection}>
          <Text style={styles.sectionTitle}>URL</Text>
          <Text style={styles.urlText} numberOfLines={1}>
            {currentUrl}
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleOpenExternal}
        >
          <Icon name="open-in-new" size={20} color={HackerTheme.darkerGreen} />
          <Text style={styles.primaryButtonText}>Open in Browser</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={openWebView}
          >
            <Icon name="web" size={20} color={HackerTheme.primary} />
            <Text style={styles.secondaryButtonText}>WebView</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleShare}
          >
            <Icon name="share-variant" size={20} color={HackerTheme.primary} />
            <Text style={styles.secondaryButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Render WebView mode
  const renderWebView = () => (
    <View style={styles.webViewContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            closeInfoCard();
          }}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={HackerTheme.primary} />
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          <Text style={styles.titleText} numberOfLines={1}>
            {isGitHub ? repo?.fullName : pkg?.name}
          </Text>
          <Text style={styles.subtitleText} numberOfLines={1}>
            {currentUrl}
          </Text>
        </View>

        <TouchableOpacity onPress={closeInfoCard} style={styles.closeButton}>
          <Icon name="close" size={24} color={HackerTheme.lightGrey} />
        </TouchableOpacity>
      </View>

      {/* Loading Progress Bar */}
      {loading && (
        <View style={styles.progressBarContainer}>
          <View
            style={[styles.progressBar, { width: `${loadingProgress * 100}%` }]}
          />
        </View>
      )}

      {/* Navigation Controls */}
      <View style={styles.navControls}>
        <TouchableOpacity
          onPress={handleGoBack}
          disabled={!canGoBack}
          style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
        >
          <Icon
            name="arrow-left"
            size={20}
            color={canGoBack ? HackerTheme.primary : HackerTheme.darkGrey}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleGoForward}
          disabled={!canGoForward}
          style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}
        >
          <Icon
            name="arrow-right"
            size={20}
            color={canGoForward ? HackerTheme.primary : HackerTheme.darkGrey}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRefresh} style={styles.navButton}>
          <Icon name="refresh" size={20} color={HackerTheme.primary} />
        </TouchableOpacity>

        <View style={styles.spacer} />

        <TouchableOpacity onPress={handleShare} style={styles.navButton}>
          <Icon name="share-variant" size={20} color={HackerTheme.accent} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleOpenExternal} style={styles.navButton}>
          <Icon name="open-in-new" size={20} color={HackerTheme.accent} />
        </TouchableOpacity>
      </View>

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Icon name="alert-circle" size={16} color={HackerTheme.errorRed} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleRefresh}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={styles.webView}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadProgress={handleLoadProgress}
        onError={handleError}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={HackerTheme.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scalesPageToFit
        showsHorizontalScrollIndicator
        showsVerticalScrollIndicator
      />
    </View>
  );

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      onRequestClose={closeInfoCard}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {!showWebView && (
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={closeInfoCard}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color={HackerTheme.lightGrey} />
            </TouchableOpacity>
          </View>
        )}
        {showWebView ? renderWebView() : renderPreviewCard()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HackerTheme.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
    backgroundColor: HackerTheme.darkerGreen,
  },
  previewContainer: {
    flex: 1,
  },
  previewScroll: {
    flex: 1,
    padding: Spacing.lg,
  },
  previewHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  previewTitle: {
    ...Typography.heading2,
    color: HackerTheme.primary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  previewVersion: {
    ...Typography.bodyText,
    color: HackerTheme.accent,
    marginTop: Spacing.xs,
  },
  descriptionSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.heading3,
    color: HackerTheme.primary,
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    ...Typography.bodyText,
    color: HackerTheme.lightOnPrimary,
    lineHeight: 22,
  },
  statsSection: {
    marginBottom: Spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: HackerTheme.darkGreen,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HackerTheme.primary + '20',
    alignItems: 'center',
  },
  statLabel: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey,
    marginTop: Spacing.xs,
  },
  statValue: {
    ...Typography.bodyText,
    color: HackerTheme.primary,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  languageDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  urlSection: {
    marginBottom: Spacing.xl,
  },
  urlText: {
    ...Typography.captionText,
    color: HackerTheme.accent,
    fontFamily: 'monospace',
  },
  actionsContainer: {
    padding: Spacing.lg,
    backgroundColor: HackerTheme.darkerGreen,
    borderTopWidth: 1,
    borderTopColor: HackerTheme.primary + '20',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  primaryButton: {
    backgroundColor: HackerTheme.primary,
    marginBottom: Spacing.md,
  },
  primaryButtonText: {
    ...Typography.buttonText,
    color: HackerTheme.darkerGreen,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: HackerTheme.darkGreen,
    borderWidth: 1,
    borderColor: HackerTheme.primary + '40',
  },
  secondaryButtonText: {
    ...Typography.bodyText,
    color: HackerTheme.primary,
    fontWeight: '600',
  },
  webViewContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingTop: Spacing.xl,
    backgroundColor: HackerTheme.darkGreen,
    borderBottomWidth: 1,
    borderBottomColor: HackerTheme.primary + '40',
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  titleText: {
    ...Typography.heading3,
    color: HackerTheme.primary,
    fontSize: 14,
  },
  subtitleText: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey,
    fontSize: 10,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: HackerTheme.darkGreen,
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: HackerTheme.primary,
  },
  navControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: HackerTheme.darkerGreen,
    borderBottomWidth: 1,
    borderBottomColor: HackerTheme.primary + '20',
    gap: Spacing.xs,
  },
  navButton: {
    padding: Spacing.sm,
    borderRadius: 8,
    backgroundColor: HackerTheme.darkGreen,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  spacer: {
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: HackerTheme.errorRed + '20',
    borderWidth: 1,
    borderColor: HackerTheme.errorRed,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderRadius: 8,
  },
  errorText: {
    ...Typography.captionText,
    color: HackerTheme.errorRed,
    flex: 1,
  },
  retryText: {
    ...Typography.captionText,
    color: HackerTheme.primary,
    fontWeight: '600',
  },
  webView: {
    flex: 1,
    backgroundColor: HackerTheme.background,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: HackerTheme.background,
  },
  loadingText: {
    ...Typography.bodyText,
    color: HackerTheme.primary,
    marginTop: Spacing.md,
  },
});

export default InfoCardModal;
