/**
 * SQLite Database Schema
 * Defines all tables for local storage
 * Uses react-native-sqlite-storage
 */

import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

export class Database {
  private static db: any | null = null;

  /**
   * Initialize database and create tables
   */
  static async init(): Promise<void> {
    if (this.db) {
      console.log('Database already initialized');
      return;
    }

    try {
      this.db = await SQLite.openDatabase({
        name: 'trending_hub.db',
        location: 'default',
      });

      console.log('Database opened successfully');

      // Create tables
      await this.createTables();

      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  /**
   * Create all database tables
   */
  private static async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Subscriptions table
    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        item_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        full_name TEXT,
        data TEXT NOT NULL,
        subscribed_at INTEGER NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );
    `);

    // Releases table
    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS releases (
        id TEXT PRIMARY KEY,
        subscription_id TEXT NOT NULL,
        tag_name TEXT NOT NULL,
        name TEXT,
        body TEXT,
        published_at INTEGER NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
      );
    `);

    // Notifications table
    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        data TEXT,
        is_read INTEGER DEFAULT 0,
        scheduled_for INTEGER,
        delivered_at INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );
    `);

    // Cache table
    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );
    `);

    // AI Chat Messages table
    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS ai_chat_messages (
        id TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        context_type TEXT,
        context_id TEXT,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        token_count INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );
    `);

    // Create indexes for performance
    await this.db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_subscriptions_type ON subscriptions(type);',
    );
    await this.db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(is_active);',
    );
    await this.db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_releases_subscription ON releases(subscription_id);',
    );
    await this.db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_releases_published ON releases(published_at DESC);',
    );
    await this.db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);',
    );
    await this.db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);',
    );
    await this.db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache(expires_at);',
    );
    await this.db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_chat_created ON ai_chat_messages(created_at DESC);',
    );
    await this.db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_chat_context ON ai_chat_messages(context_type, context_id);',
    );
  }

  /**
   * Check if database is initialized
   */
  static isInitialized(): boolean {
    return this.db !== null;
  }

  /**
   * Get database instance
   */
  static getDB(): any {
    if (!this.db) throw new Error('Database not initialized');
    return this.db;
  }

  /**
   * Close database connection
   */
  static async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      console.log('Database closed');
    }
  }

  /**
   * Clear all data (for testing/reset)
   */
  static async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql('DELETE FROM subscriptions;');
    await this.db.executeSql('DELETE FROM releases;');
    await this.db.executeSql('DELETE FROM notifications;');
    await this.db.executeSql('DELETE FROM cache;');
    await this.db.executeSql('DELETE FROM ai_chat_messages;');

    console.log('All data cleared');
  }

  /**
   * Clear all cache entries
   */
  static async clearCache(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.executeSql('DELETE FROM cache;');
    console.log('Cache cleared');
  }

  /**
   * Clean expired cache entries
   */
  static async cleanExpiredCache(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const now = Date.now();
    await this.db.executeSql('DELETE FROM cache WHERE expires_at < ?;', [now]);

    console.log('Expired cache entries cleaned');
  }
}

export default Database;
