/**
 * AI Chat Store
 * Zustand store for managing AI chat state
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import ChatMessage, { ContextType, AIProvider } from '../models/ChatMessage';
import { GitHubRepository } from '../models/GitHubRepository';
import { NpmPackage } from '../models/NpmPackage';
import AIChatRepository from '../database/repositories/aiChatRepository';
import * as aiService from '../api/ai/aiService';
import { useSettingsStore } from './settingsStore';

interface AIChatState {
  // UI State
  isOpen: boolean;
  loading: boolean;
  error: string | null;

  // Messages
  messages: ChatMessage[];

  // Context
  currentContext: GitHubRepository | NpmPackage | null;
  contextType: ContextType;
  contextId: string | null;

  // Provider
  activeProvider: AIProvider;
  activeModel: string;

  // Actions
  openChat: (context?: GitHubRepository | NpmPackage) => Promise<void>;
  closeChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  switchProvider: (provider: AIProvider) => void;
  loadHistory: (contextType?: ContextType, contextId?: string) => Promise<void>;
  setContext: (context: GitHubRepository | NpmPackage | null) => void;
  clearContext: () => void;

  // Quick actions
  explainContext: () => Promise<void>;
  compareWith: (
    alternatives: Array<GitHubRepository | NpmPackage>,
  ) => Promise<void>;
}

export const useAIChatStore = create<AIChatState>()(
  immer((set, get) => ({
    // Initial state
    isOpen: false,
    loading: false,
    error: null,
    messages: [],
    currentContext: null,
    contextType: null,
    contextId: null,
    activeProvider: 'gemini',
    activeModel: 'gemini-flash',

    /**
     * Open chat with optional context
     */
    openChat: async (context?: GitHubRepository | NpmPackage) => {
      set(state => {
        state.isOpen = true;
        state.error = null;
      });

      // Get provider settings
      const settings = useSettingsStore.getState().settings;
      set(state => {
        state.activeProvider = settings.preferredAIProvider;
        state.activeModel =
          settings.preferredAIProvider === 'gemini'
            ? settings.geminiModel
            : settings.ollamaModel || 'llama2';
      });

      if (context) {
        get().setContext(context);
      }

      // Load existing conversation if context exists
      const { contextType, contextId } = get();
      if (contextType && contextId) {
        await get().loadHistory(contextType, contextId);
      } else if (!contextType) {
        await get().loadHistory(null);
      }
    },

    /**
     * Close chat
     */
    closeChat: () => {
      set(state => {
        state.isOpen = false;
      });
    },

    /**
     * Send a message to AI
     */
    sendMessage: async (content: string) => {
      const {
        messages,
        currentContext,
        activeProvider,
        activeModel,
        contextType,
        contextId,
      } = get();

      // Create user message
      const userMessage = ChatMessage.createUserMessage(
        content,
        activeProvider,
        activeModel,
        contextType,
        contextId,
      );

      // Add to state immediately
      set(state => {
        state.messages.push(userMessage);
        state.loading = true;
        state.error = null;
      });

      // Save to database
      try {
        await AIChatRepository.saveMessage(userMessage);

        // Prepare conversation history
        const conversationHistory = aiService.formatConversationHistory(
          messages.map(m => ({ role: m.role, content: m.content })),
        );

        // Get AI response
        let response;
        if (currentContext) {
          response = await aiService.askContextualQuestion(
            content,
            currentContext,
            conversationHistory,
          );
        } else {
          response = await aiService.sendMessage(content, conversationHistory);
        }

        // Create assistant message
        const assistantMessage = ChatMessage.createAssistantMessage(
          response.content,
          activeProvider,
          activeModel,
          response.tokenCount,
          contextType,
          contextId,
        );

        // Add to state
        set(state => {
          state.messages.push(assistantMessage);
          state.loading = false;
        });

        // Save to database
        await AIChatRepository.saveMessage(assistantMessage);
      } catch (error) {
        console.error('Failed to send message:', error);
        set(state => {
          state.error =
            error instanceof Error
              ? error.message
              : 'Failed to get AI response';
          state.loading = false;
        });
      }
    },

    /**
     * Clear conversation history
     */
    clearHistory: async () => {
      const { contextType, contextId } = get();

      set(state => {
        state.messages = [];
        state.error = null;
      });

      // Clear from database
      try {
        if (contextType && contextId) {
          await AIChatRepository.deleteConversation(contextType, contextId);
        } else {
          await AIChatRepository.deleteGeneralMessages();
        }
      } catch (error) {
        console.error('Failed to clear history:', error);
      }
    },

    /**
     * Switch AI provider
     */
    switchProvider: (provider: AIProvider) => {
      set(state => {
        state.activeProvider = provider;

        // Update model based on provider
        const settings = useSettingsStore.getState().settings;
        state.activeModel =
          provider === 'gemini'
            ? settings.geminiModel
            : settings.ollamaModel || 'llama2';
      });
    },

    /**
     * Load conversation history from database
     */
    loadHistory: async (contextType?: ContextType, contextId?: string) => {
      set(state => {
        state.loading = true;
      });

      try {
        let messages: ChatMessage[];

        // Check if database is initialized
        try {
          if (
            contextType === null ||
            (contextType === undefined && contextId === undefined)
          ) {
            // Load general chat messages
            messages = await AIChatRepository.getGeneralMessages();
          } else if (contextType && contextId) {
            // Load context-specific messages
            messages = await AIChatRepository.getConversationMessages(
              contextType,
              contextId,
            );
          } else {
            // Load all recent messages
            messages = await AIChatRepository.getRecentMessages();
          }
        } catch (dbError) {
          console.warn('Database not available for history:', dbError);
          messages = [];
        }

        set(state => {
          state.messages = messages;
          state.loading = false;
        });
      } catch (error) {
        console.error('Failed to load history:', error);
        set(state => {
          state.error = 'Failed to load conversation history';
          state.loading = false;
        });
      }
    },

    /**
     * Set conversation context
     */
    setContext: (context: GitHubRepository | NpmPackage | null) => {
      set(state => {
        state.currentContext = context;

        if (context) {
          const isRepo = 'fullName' in context;
          state.contextType = isRepo ? 'repo' : 'package';
          state.contextId = isRepo
            ? (context as GitHubRepository).fullName
            : (context as NpmPackage).name;
        } else {
          state.contextType = null;
          state.contextId = null;
        }
      });
    },

    /**
     * Clear context
     */
    clearContext: () => {
      set(state => {
        state.currentContext = null;
        state.contextType = null;
        state.contextId = null;
      });
    },

    /**
     * Quick action: Explain current context
     */
    explainContext: async () => {
      const {
        currentContext,
        activeProvider,
        activeModel,
        contextType,
        contextId,
      } = get();

      if (!currentContext) {
        set(state => {
          state.error = 'No context available to explain';
        });
        return;
      }

      set(state => {
        state.loading = true;
        state.error = null;
      });

      try {
        const isRepo = 'fullName' in currentContext;
        const response = isRepo
          ? await aiService.explainRepo(currentContext as GitHubRepository)
          : await aiService.explainPackage(currentContext as NpmPackage);

        // Create assistant message
        const assistantMessage = ChatMessage.createAssistantMessage(
          response.content,
          activeProvider,
          activeModel,
          response.tokenCount,
          contextType,
          contextId,
        );

        // Add to state
        set(state => {
          state.messages.push(assistantMessage);
          state.loading = false;
        });

        // Save to database
        await AIChatRepository.saveMessage(assistantMessage);
      } catch (error) {
        console.error('Failed to explain context:', error);
        set(state => {
          state.error = 'Failed to explain context';
          state.loading = false;
        });
      }
    },

    /**
     * Quick action: Compare with alternatives
     */
    compareWith: async (alternatives: Array<GitHubRepository | NpmPackage>) => {
      const {
        currentContext,
        activeProvider,
        activeModel,
        contextType,
        contextId,
      } = get();

      if (!currentContext) {
        set(state => {
          state.error = 'No context available to compare';
        });
        return;
      }

      if (alternatives.length === 0) {
        set(state => {
          state.error = 'No alternatives provided for comparison';
        });
        return;
      }

      set(state => {
        state.loading = true;
        state.error = null;
      });

      try {
        const response = await aiService.compareAlternatives(
          currentContext,
          alternatives,
        );

        // Create assistant message
        const assistantMessage = ChatMessage.createAssistantMessage(
          response.content,
          activeProvider,
          activeModel,
          response.tokenCount,
          contextType,
          contextId,
        );

        // Add to state
        set(state => {
          state.messages.push(assistantMessage);
          state.loading = false;
        });

        // Save to database
        await AIChatRepository.saveMessage(assistantMessage);
      } catch (error) {
        console.error('Failed to compare alternatives:', error);
        set(state => {
          state.error = 'Failed to compare alternatives';
          state.loading = false;
        });
      }
    },
  })),
);

export default useAIChatStore;
