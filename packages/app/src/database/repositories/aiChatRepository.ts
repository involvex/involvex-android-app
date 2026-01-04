/**
 * AI Chat Repository
 * Database operations for chat messages
 */

import ChatMessage, { ContextType } from '../../models/ChatMessage';
import { Database } from '../schema';

export class AIChatRepository {
  /**
   * Save a chat message to the database
   */
  static async saveMessage(message: ChatMessage): Promise<void> {
    const db = Database.getDB();
    const data = message.toDB();

    await db.executeSql(
      `INSERT INTO ai_chat_messages
       (id, role, content, context_type, context_id, provider, model, token_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id,
        data.role,
        data.content,
        data.context_type,
        data.context_id,
        data.provider,
        data.model,
        data.token_count,
        data.created_at,
      ],
    );
  }

  /**
   * Get all chat messages, optionally filtered by context
   */
  static async getMessages(
    contextType?: ContextType,
    contextId?: string,
    limit: number = 100,
  ): Promise<ChatMessage[]> {
    const db = Database.getDB();

    let query = 'SELECT * FROM ai_chat_messages';
    const params: (string | number | null)[] = [];

    if (contextType && contextId) {
      query += ' WHERE context_type = ? AND context_id = ?';
      params.push(contextType, contextId);
    } else if (contextType === null) {
      query += ' WHERE context_type IS NULL';
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const [results] = await db.executeSql(query, params);

    const messages: ChatMessage[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      messages.push(ChatMessage.fromDB(results.rows.item(i)));
    }

    return messages.reverse(); // Return in chronological order
  }

  /**
   * Get recent messages (last N messages regardless of context)
   */
  static async getRecentMessages(limit: number = 50): Promise<ChatMessage[]> {
    const db = Database.getDB();

    const [results] = await db.executeSql(
      'SELECT * FROM ai_chat_messages ORDER BY created_at DESC LIMIT ?',
      [limit],
    );

    const messages: ChatMessage[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      messages.push(ChatMessage.fromDB(results.rows.item(i)));
    }

    return messages.reverse();
  }

  /**
   * Get messages for a specific conversation context
   */
  static async getConversationMessages(
    contextType: ContextType,
    contextId: string,
  ): Promise<ChatMessage[]> {
    return this.getMessages(contextType, contextId, 100);
  }

  /**
   * Get general chat messages (no context)
   */
  static async getGeneralMessages(limit: number = 100): Promise<ChatMessage[]> {
    const db = Database.getDB();

    const [results] = await db.executeSql(
      'SELECT * FROM ai_chat_messages WHERE context_type IS NULL ORDER BY created_at DESC LIMIT ?',
      [limit],
    );

    const messages: ChatMessage[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      messages.push(ChatMessage.fromDB(results.rows.item(i)));
    }

    return messages.reverse();
  }

  /**
   * Delete a specific message
   */
  static async deleteMessage(messageId: string): Promise<void> {
    const db = Database.getDB();
    await db.executeSql('DELETE FROM ai_chat_messages WHERE id = ?', [
      messageId,
    ]);
  }

  /**
   * Delete all messages for a specific context
   */
  static async deleteConversation(
    contextType: ContextType,
    contextId: string,
  ): Promise<void> {
    const db = Database.getDB();
    await db.executeSql(
      'DELETE FROM ai_chat_messages WHERE context_type = ? AND context_id = ?',
      [contextType, contextId],
    );
  }

  /**
   * Delete all general messages (no context)
   */
  static async deleteGeneralMessages(): Promise<void> {
    const db = Database.getDB();
    await db.executeSql(
      'DELETE FROM ai_chat_messages WHERE context_type IS NULL',
    );
  }

  /**
   * Delete all messages
   */
  static async deleteAllMessages(): Promise<void> {
    const db = Database.getDB();
    await db.executeSql('DELETE FROM ai_chat_messages');
  }

  /**
   * Get total message count
   */
  static async getMessageCount(): Promise<number> {
    const db = Database.getDB();
    const [results] = await db.executeSql(
      'SELECT COUNT(*) as count FROM ai_chat_messages',
    );
    return results.rows.item(0).count;
  }

  /**
   * Get message count for a specific context
   */
  static async getContextMessageCount(
    contextType: ContextType,
    contextId: string,
  ): Promise<number> {
    const db = Database.getDB();
    const [results] = await db.executeSql(
      'SELECT COUNT(*) as count FROM ai_chat_messages WHERE context_type = ? AND context_id = ?',
      [contextType, contextId],
    );
    return results.rows.item(0).count;
  }

  /**
   * Get contexts that have messages (for listing conversations)
   */
  static async getActiveContexts(): Promise<
    Array<{
      contextType: ContextType;
      contextId: string;
      messageCount: number;
      lastMessageAt: Date;
    }>
  > {
    const db = Database.getDB();

    const [results] = await db.executeSql(
      `SELECT
        context_type,
        context_id,
        COUNT(*) as message_count,
        MAX(created_at) as last_message_at
      FROM ai_chat_messages
      WHERE context_type IS NOT NULL AND context_id IS NOT NULL
      GROUP BY context_type, context_id
      ORDER BY last_message_at DESC`,
    );

    const contexts: Array<{
      contextType: ContextType;
      contextId: string;
      messageCount: number;
      lastMessageAt: Date;
    }> = [];

    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      contexts.push({
        contextType: row.context_type as ContextType,
        contextId: row.context_id,
        messageCount: row.message_count,
        lastMessageAt: new Date(row.last_message_at),
      });
    }

    return contexts;
  }

  /**
   * Clean old messages (older than N days)
   */
  static async cleanOldMessages(daysOld: number = 30): Promise<number> {
    const db = Database.getDB();
    const cutoffDate = Date.now() - daysOld * 24 * 60 * 60 * 1000;

    const [results] = await db.executeSql(
      'DELETE FROM ai_chat_messages WHERE created_at < ?',
      [cutoffDate],
    );

    return results.rowsAffected || 0;
  }

  /**
   * Save multiple messages in a transaction
   */
  static async saveMessages(messages: ChatMessage[]): Promise<void> {
    for (const message of messages) {
      await this.saveMessage(message);
    }
  }
}

export default AIChatRepository;
