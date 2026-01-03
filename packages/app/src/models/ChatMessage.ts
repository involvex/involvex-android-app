/**
 * Chat Message Model
 * Represents an AI chat message with context
 */

export type MessageRole = 'user' | 'assistant' | 'system';
export type ContextType = 'repo' | 'package' | null;
export type AIProvider = 'gemini' | 'ollama';

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
  static fromDB(row: any): ChatMessage {
    return new ChatMessage({
      id: row.id,
      role: row.role as MessageRole,
      content: row.content,
      contextType: row.context_type as ContextType,
      contextId: row.context_id,
      provider: row.provider as AIProvider,
      model: row.model,
      tokenCount: row.token_count,
      createdAt: new Date(row.created_at),
    });
  }

  /**
   * Convert to database row format
   */
  toDB(): any {
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
  static fromJSON(json: Record<string, any>): ChatMessage {
    return new ChatMessage({
      id: json.id,
      role: json.role,
      content: json.content,
      contextType: json.contextType,
      contextId: json.contextId,
      provider: json.provider,
      model: json.model,
      tokenCount: json.tokenCount,
      createdAt: new Date(json.createdAt),
    });
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
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
