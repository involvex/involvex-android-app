/**
 * MessageInput Component
 * Text input with send button for chat messages
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HackerTheme } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

interface MessageInputProps {
  onSend: (message: string) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  loading = false,
  disabled = false,
  placeholder = 'Ask me anything...',
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !loading && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const canSend = message.trim().length > 0 && !loading && !disabled;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor={HackerTheme.lightGrey}
            multiline
            maxLength={2000}
            editable={!disabled && !loading}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              canSend && styles.sendButtonActive,
              !canSend && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!canSend}
          >
            {loading ? (
              <ActivityIndicator size="small" color={HackerTheme.background} />
            ) : (
              <Icon
                name="send"
                size={20}
                color={canSend ? HackerTheme.background : HackerTheme.lightGrey}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: HackerTheme.darkGreen,
    borderTopWidth: 1,
    borderTopColor: HackerTheme.primary + '40',
    padding: Spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.bodyText,
    color: HackerTheme.primary,
    backgroundColor: HackerTheme.darkerGreen,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: HackerTheme.primary + '40',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingTop: Spacing.sm,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  sendButtonActive: {
    backgroundColor: HackerTheme.primary,
    borderColor: HackerTheme.primary,
  },
  sendButtonDisabled: {
    backgroundColor: HackerTheme.darkGreen,
    borderColor: HackerTheme.lightGrey + '40',
  },
});

export default MessageInput;
