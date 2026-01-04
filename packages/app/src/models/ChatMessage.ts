/**
 * Chat Message Model
 * Represents an AI chat message with context
 */

import {
  getString,
  getStringOrNull,
  getNumberOrNull,
  getDate,
} from '../utils/typeGuards';

export type MessageRole = 'user' | 'assistant' | 'system';
export type ContextType = 'repo' | 'package' | null;
export type AIProvider = 'gemini' | 'ollama' | 'openrouter';

export interface ChatMessageData {
  id: string;
  role: MessageRole;
  content: string;
  contextType: ContextType;
  contextId: string | null;
  provider: AIProvider;
  model: string;
  tokenCount: number | null;
  createdAt: Date;
}

export class ChatMessage implements ChatMessageData {
  id: string;
  role: MessageRole;
  content: string;
  contextType: ContextType;
  contextId: string | null;
  provider: AIProvider;
  model: string;
  tokenCount: number | null;
  createdAt: Date;

  constructor(data: ChatMessageData) {
    this.id = data.id;
    this.role = data.role;
    this.content = data.content;
    this.contextType = data.contextType;
    this.contextId = data.contextId;
    this.provider = data.provider;
    this.model = data.model;
    this.tokenCount = data.tokenCount;
    this.createdAt = data.createdAt;
  }

  /**
   * Create from database row
   */
  static fromDB(row: Record<string, unknown>): ChatMessage {
    const role = getString(row, 'role', 'user');
    const contextType = getStringOrNull(row, 'context_type');
    const provider = getString(row, 'provider', 'gemini');

    return new ChatMessage({
      id: getString(row, 'id'),
      role: role as MessageRole,
      content: getString(row, 'content'),
      contextType: contextType as ContextType,
      contextId: getStringOrNull(row, 'context_id'),
      provider: provider as AIProvider,
      model: getString(row, 'model'),
      tokenCount: getNumberOrNull(row, 'token_count'),
      createdAt: getDate(row, 'created_at'),
    });
  }

  /**
   * Convert to database row format
   */
  toDB(): Record<string, unknown> {
    return {
      id: this.id,
      role: this.role,
      content: this.content,
      context_type: this.contextType,
      context_id: this.contextId,
      provider: this.provider,
      model: this.model,
      token_count: this.tokenCount,
      created_at: this.createdAt.getTime(),
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: Record<string, unknown>): ChatMessage {
    const role = getString(json, 'role', 'user');
    const contextType = json.contextType;
    const provider = getString(json, 'provider', 'gemini');

    return new ChatMessage({
      id: getString(json, 'id'),
      role: role as MessageRole,
      content: getString(json, 'content'),
      contextType: contextType as ContextType,
      contextId: getStringOrNull(json, 'contextId'),
      provider: provider as AIProvider,
      model: getString(json, 'model'),
      tokenCount: getNumberOrNull(json, 'tokenCount'),
      createdAt: getDate(json, 'createdAt'),
    });
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      role: this.role,
      content: this.content,
      contextType: this.contextType,
      contextId: this.contextId,
      provider: this.provider,
      model: this.model,
      tokenCount: this.tokenCount,
      createdAt: this.createdAt.toISOString(),
    };
  }

  /**
   * Check if message is from user
   */
  get isUser(): boolean {
    return this.role === 'user';
  }

  /**
   * Check if message is from AI assistant
   */
  get isAssistant(): boolean {
    return this.role === 'assistant';
  }

  /**
   * Check if message is a system message
   */
  get isSystem(): boolean {
    return this.role === 'system';
  }

  /**
   * Check if message has context
   */
  get hasContext(): boolean {
    return this.contextType !== null && this.contextId !== null;
  }

  /**
   * Get formatted timestamp
   */
  get formattedTime(): string {
    const now = new Date();
    const diffMs = now.getTime() - this.createdAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return this.createdAt.toLocaleDateString();
  }

  /**
   * Get short preview of content
   */
  get preview(): string {
    const maxLength = 100;
    if (this.content.length <= maxLength) {
      return this.content;
    }
    return this.content.substring(0, maxLength) + '...';
  }

  /**
   * Create a user message
   */
  static createUserMessage(
    content: string,
    provider: AIProvider,
    model: string,
    contextType?: ContextType,
    contextId?: string | null,
  ): ChatMessage {
    return new ChatMessage({
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content,
      contextType: contextType || null,
      contextId: contextId || null,
      provider,
      model,
      tokenCount: null,
      createdAt: new Date(),
    });
  }

  /**
   * Create an assistant message
   */
  static createAssistantMessage(
    content: string,
    provider: AIProvider,
    model: string,
    tokenCount?: number,
    contextType?: ContextType,
    contextId?: string | null,
  ): ChatMessage {
    return new ChatMessage({
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content,
      contextType: contextType || null,
      contextId: contextId || null,
      provider,
      model,
      tokenCount: tokenCount || null,
      createdAt: new Date(),
    });
  }

  /**
   * Create a system message
   */
  static createSystemMessage(
    content: string,
    provider: AIProvider,
    model: string,
  ): ChatMessage {
    return new ChatMessage({
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'system',
      content,
      contextType: null,
      contextId: null,
      provider,
      model,
      tokenCount: null,
      createdAt: new Date(),
    });
  }
}

export default ChatMessage;
