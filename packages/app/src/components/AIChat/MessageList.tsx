/**
 * MessageList Component
 * Displays chat messages with FlashList for performance
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { HackerTheme } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import ChatMessage from '../../models/ChatMessage';

interface MessageListProps {
  messages: ChatMessage[];
  loading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading = false,
}) => {
  const listRef = useRef<any>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && listRef.current) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.isUser;
    const isSystem = item.isSystem;

    if (isSystem) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.content}</Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.aiText,
            ]}
          >
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.timestamp,
                isUser ? styles.userTimestamp : styles.aiTimestamp,
              ]}
            >
              {item.formattedTime}
            </Text>
            {item.tokenCount && (
              <Text
                style={[
                  styles.tokenCount,
                  isUser ? styles.userTimestamp : styles.aiTimestamp,
                ]}
              >
                {item.tokenCount} tokens
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {loading
          ? 'Loading messages...'
          : 'No messages yet. Start a conversation!'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {messages.length === 0 ? (
        renderEmpty()
      ) : (
        <FlashList
          ref={listRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          // @ts-ignore
          estimatedItemSize={100}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HackerTheme.background,
  },
  listContent: {
    padding: Spacing.md,
  },
  messageContainer: {
    marginBottom: Spacing.md,
    flexDirection: 'row',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: HackerTheme.darkGreen,
    borderColor: HackerTheme.primary,
  },
  aiBubble: {
    backgroundColor: HackerTheme.darkerGreen,
    borderColor: HackerTheme.accent + '40',
  },
  messageText: {
    ...Typography.bodyText,
    lineHeight: 20,
  },
  userText: {
    color: HackerTheme.primary,
  },
  aiText: {
    color: HackerTheme.accent,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  timestamp: {
    ...Typography.captionText,
    fontSize: 10,
  },
  userTimestamp: {
    color: HackerTheme.primary + '80',
  },
  aiTimestamp: {
    color: HackerTheme.accent + '80',
  },
  tokenCount: {
    ...Typography.captionText,
    fontSize: 10,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  systemMessageText: {
    ...Typography.captionText,
    color: HackerTheme.lightGrey,
    fontStyle: 'italic',
    textAlign: 'center',
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
});

export default MessageList;
