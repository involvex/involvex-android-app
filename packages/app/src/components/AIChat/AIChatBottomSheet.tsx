/**
 * AI Chat Bottom Sheet
 * Main chat interface that slides up from bottom
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HackerTheme } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { useAIChatStore } from '../../store/aiChatStore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ContextCard from './ContextCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT * 0.9;
const MIN_TRANSLATE_Y = -SCREEN_HEIGHT * 0.6;

export const AIChatBottomSheet: React.FC = () => {
  const {
    isOpen,
    loading,
    error,
    messages,
    currentContext,
    activeProvider,
    closeChat,
    sendMessage,
    clearHistory,
    clearContext,
    switchProvider,
  } = useAIChatStore();

  const translateY = useSharedValue(0);
  const startY = useSharedValue(0);

  // Reset position when opening/closing
  useEffect(() => {
    if (isOpen) {
      translateY.value = withSpring(MIN_TRANSLATE_Y, {
        damping: 50,
        stiffness: 400,
      });
    } else {
      translateY.value = withSpring(0);
    }
  }, [isOpen, translateY]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      startY.value = translateY.value;
    })
    .onUpdate(event => {
      'worklet';
      let newValue = startY.value + event.translationY;
      // Clamp between max and 0
      if (newValue < MAX_TRANSLATE_Y) {
        newValue = MAX_TRANSLATE_Y;
      }
      if (newValue > 0) {
        newValue = 0;
      }
      translateY.value = newValue;
    })
    .onEnd(event => {
      'worklet';
      const velocity = event.velocityY;

      if (velocity > 500 || translateY.value > MIN_TRANSLATE_Y / 2) {
        translateY.value = withSpring(0);
        runOnJS(closeChat)();
      } else if (velocity < -500 || translateY.value < MAX_TRANSLATE_Y * 0.7) {
        translateY.value = withSpring(MAX_TRANSLATE_Y);
      } else {
        translateY.value = withSpring(MIN_TRANSLATE_Y);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const handleSend = async (message: string) => {
    try {
      await sendMessage(message);
    } catch {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to clear the conversation history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearHistory,
        },
      ],
    );
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={closeChat}
    >
      <GestureHandlerRootView style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closeChat}
        />

        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.bottomSheet, animatedStyle]}>
            {/* Draggable Handle */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Icon
                  name="robot-outline"
                  size={24}
                  color={HackerTheme.primary}
                />
                <Text style={styles.headerTitle}>AI Assistant</Text>
              </View>

              <View style={styles.headerRight}>
                {/* Provider Indicator */}
                <TouchableOpacity
                  style={styles.providerBadge}
                  onPress={() =>
                    switchProvider(
                      activeProvider === 'gemini' ? 'ollama' : 'gemini',
                    )
                  }
                >
                  <Icon
                    name={
                      activeProvider === 'gemini' ? 'google' : 'cog-outline'
                    }
                    size={14}
                    color={HackerTheme.accent}
                  />
                  <Text style={styles.providerText}>
                    {activeProvider === 'gemini' ? 'Gemini' : 'Ollama'}
                  </Text>
                </TouchableOpacity>

                {/* Clear History */}
                <TouchableOpacity onPress={handleClearHistory}>
                  <Icon
                    name="delete-outline"
                    size={22}
                    color={HackerTheme.errorRed}
                  />
                </TouchableOpacity>

                {/* Close */}
                <TouchableOpacity onPress={closeChat}>
                  <Icon name="close" size={24} color={HackerTheme.lightGrey} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Banner */}
            {error && (
              <View style={styles.errorBanner}>
                <Icon
                  name="alert-circle"
                  size={16}
                  color={HackerTheme.errorRed}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Context Card */}
            {currentContext && (
              <View style={styles.contextContainer}>
                <ContextCard context={currentContext} onClear={clearContext} />
              </View>
            )}

            {/* Messages */}
            <View style={styles.messagesContainer}>
              <MessageList messages={messages} loading={loading} />
            </View>

            {/* Input */}
            <MessageInput
              onSend={handleSend}
              loading={loading}
              disabled={!isOpen}
              placeholder={
                currentContext
                  ? `Ask about ${
                      'fullName' in currentContext
                        ? currentContext.fullName
                        : currentContext.name
                    }...`
                  : 'Ask me anything...'
              }
            />
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    height: SCREEN_HEIGHT,
    backgroundColor: HackerTheme.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: HackerTheme.primary + '40',
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: HackerTheme.darkGreen,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: HackerTheme.lightGrey,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: HackerTheme.darkGreen,
    borderBottomWidth: 1,
    borderBottomColor: HackerTheme.primary + '40',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    ...Typography.heading3,
    color: HackerTheme.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: HackerTheme.darkerGreen,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HackerTheme.accent + '40',
  },
  providerText: {
    ...Typography.captionText,
    color: HackerTheme.accent,
    fontSize: 10,
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
    marginTop: Spacing.sm,
    borderRadius: 8,
  },
  errorText: {
    ...Typography.captionText,
    color: HackerTheme.errorRed,
    flex: 1,
  },
  contextContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  messagesContainer: {
    flex: 1,
  },
});

export default AIChatBottomSheet;
