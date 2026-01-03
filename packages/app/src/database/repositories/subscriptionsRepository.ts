/**
 * Subscriptions Repository
 * Handles all subscription database operations
 */

import { Database } from '../schema';
import { Subscription } from '../../models';

class SubscriptionsRepository {
  /**
   * Get all subscriptions
   */
  async getAll(): Promise<Subscription[]> {
    const db = Database.getDB();
    const [results] = await db.executeSql(
      'SELECT * FROM subscriptions WHERE is_active = 1 ORDER BY subscribed_at DESC;',
    );

    const subscriptions: Subscription[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      subscriptions.push(results.rows.item(i));
    }

    return subscriptions;
  }

  /**
   * Get subscriptions by type
   */
  async getByType(type: 'repository' | 'package'): Promise<Subscription[]> {
    const db = Database.getDB();
    const [results] = await db.executeSql(
      'SELECT * FROM subscriptions WHERE type = ? AND is_active = 1 ORDER BY subscribed_at DESC;',
      [type],
    );

    const subscriptions: Subscription[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      subscriptions.push(results.rows.item(i));
    }

    return subscriptions;
  }

  /**
   * Get subscription by item ID
   */
  async getByItemId(itemId: string): Promise<Subscription | null> {
    const db = Database.getDB();
    const [results] = await db.executeSql(
      'SELECT * FROM subscriptions WHERE item_id = ? AND is_active = 1;',
      [itemId],
    );

    return results.rows.length > 0 ? results.rows.item(0) : null;
  }

  /**
   * Add subscription
   */
  async add(
    subscription: Omit<Subscription, 'createdAt' | 'updatedAt'>,
  ): Promise<void> {
    const db = Database.getDB();
    const now = Date.now();

    await db.executeSql(
      `INSERT OR REPLACE INTO subscriptions (id, type, item_id, name, full_name, data, subscribed_at, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        subscription.id,
        subscription.type,
        subscription.itemId,
        subscription.name,
        subscription.fullName || null,
        subscription.data,
        subscription.subscribedAt,
        subscription.isActive ? 1 : 0,
        now,
        now,
      ],
    );

    console.log('Subscription added:', subscription.name);
  }

  /**
   * Remove subscription (soft delete)
   */
  async remove(id: string): Promise<void> {
    const db = Database.getDB();
    const now = Date.now();

    await db.executeSql(
      'UPDATE subscriptions SET is_active = 0, updated_at = ? WHERE id = ?;',
      [now, id],
    );

    console.log('Subscription removed:', id);
  }

  /**
   * Remove subscription by item ID
   */
  async removeByItemId(itemId: string): Promise<void> {
    const db = Database.getDB();
    const now = Date.now();

    await db.executeSql(
      'UPDATE subscriptions SET is_active = 0, updated_at = ? WHERE item_id = ?;',
      [now, itemId],
    );

    console.log('Subscription removed by item ID:', itemId);
  }

  /**
   * Clear all subscriptions
   */
  async clearAll(): Promise<void> {
    const db = Database.getDB();
    const now = Date.now();

    await db.executeSql(
      'UPDATE subscriptions SET is_active = 0, updated_at = ?;',
      [now],
    );

    console.log('All subscriptions cleared');
  }

  /**
   * Check if item is subscribed
   */
  async isSubscribed(itemId: string): Promise<boolean> {
    const subscription = await this.getByItemId(itemId);
    return subscription !== null;
  }

  /**
   * Get subscription count
   */
  async getCount(): Promise<number> {
    const db = Database.getDB();
    const [results] = await db.executeSql(
      'SELECT COUNT(*) as count FROM subscriptions WHERE is_active = 1;',
    );

    return results.rows.item(0).count;
  }

  /**
   * Export all subscriptions as JSON
   */
  async exportToJSON(): Promise<string> {
    const subscriptions = await this.getAll();
    return JSON.stringify(subscriptions, null, 2);
  }
}

// Export singleton instance
export const subscriptionsRepository = new SubscriptionsRepository();
export default subscriptionsRepository;
