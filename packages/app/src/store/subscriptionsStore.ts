/**
 * Subscriptions Store
 * Owns the starred ("Subs") list so cards anywhere in the app can toggle a
 * subscription and have every other card react immediately.
 *
 * Persistence is delegated to the SQLite `subscriptionsRepository`; this store
 * only caches the active set for cheap synchronous reads during render.
 */

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { subscriptionsRepository } from "../database/repositories/subscriptionsRepository";
import { Subscription } from "../models";
import { GitHubRepository } from "../models/GitHubRepository";
import { NpmPackage } from "../models/NpmPackage";

type SubscriptionType = Subscription["type"];

interface SubscriptionsState {
  subscriptions: Subscription[];
  /** itemIds that are starred, for O(1) lookups in render. */
  starredIds: Set<string>;
  loading: boolean;

  load: () => Promise<void>;
  isStarred: (itemId: string, type?: SubscriptionType) => boolean;
  toggle: (
    item: GitHubRepository | NpmPackage,
    type: SubscriptionType,
  ) => Promise<boolean>;
  star: (
    item: GitHubRepository | NpmPackage,
    type: SubscriptionType,
  ) => Promise<void>;
  unstar: (itemId: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

/** Stable id so a repo and a package never collide in the starred set. */
const keyFor = (type: SubscriptionType, itemId: string | number) =>
  `${type}:${itemId}`;

export const useSubscriptionsStore = create<SubscriptionsState>()(
  immer((set, get) => ({
    subscriptions: [],
    starredIds: new Set<string>(),
    loading: false,

    load: async () => {
      try {
        const rows = await subscriptionsRepository.getAll();
        set((state) => {
          state.subscriptions = rows;
          state.starredIds = new Set(rows.map((r) => keyFor(r.type, r.itemId)));
        });
      } catch (error) {
        console.error("Failed to load subscriptions:", error);
      }
    },

    isStarred: (itemId, type) => {
      // Without a type, accept either key so callers that only know the id
      // still resolve correctly.
      if (type) return get().starredIds.has(keyFor(type, itemId));
      return (
        get().starredIds.has(keyFor("repository", itemId)) ||
        get().starredIds.has(keyFor("package", itemId))
      );
    },

    star: async (item, type) => {
      const itemId = String((item as any).id ?? (item as any).name);
      const key = keyFor(type, itemId);

      // Optimistic update so the button reacts on the same frame as the tap.
      set((state) => {
        state.starredIds.add(key);
        state.subscriptions.push({
          id: key,
          type,
          itemId,
          name: item.name,
          fullName:
            type === "repository"
              ? (item as GitHubRepository).fullName
              : undefined,
          data: JSON.stringify(item.toJSON ? item.toJSON() : item),
          subscribedAt: Date.now(),
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      try {
        await subscriptionsRepository.add({
          id: key,
          type,
          itemId,
          name: item.name,
          fullName:
            type === "repository"
              ? (item as GitHubRepository).fullName
              : undefined,
          data: JSON.stringify(item.toJSON ? item.toJSON() : item),
          subscribedAt: Date.now(),
          isActive: true,
        });
      } catch (error) {
        console.error("Failed to star item:", error);
        // Roll back the optimistic insert.
        await get().unstar(itemId);
        throw error;
      }
    },

    unstar: async (itemId) => {
      set((state) => {
        state.subscriptions = state.subscriptions.filter(
          (s) => s.itemId !== itemId,
        );
        // Remove both possible keys; the id alone is ambiguous across types.
        state.starredIds.delete(`repository:${itemId}`);
        state.starredIds.delete(`package:${itemId}`);
      });

      try {
        await subscriptionsRepository.removeByItemId(itemId);
      } catch (error) {
        console.error("Failed to unstar item:", error);
      }
    },

    toggle: async (item, type) => {
      const itemId = String((item as any).id ?? (item as any).name);
      const key = keyFor(type, itemId);

      if (get().starredIds.has(key)) {
        await get().unstar(itemId);
        return false;
      }

      await get().star(item, type);
      return true;
    },

    clearAll: async () => {
      set((state) => {
        state.subscriptions = [];
        state.starredIds = new Set();
      });
      await subscriptionsRepository.clearAll();
    },
  })),
);

export default useSubscriptionsStore;
