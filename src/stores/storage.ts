/**
 * The kv-store (expo-sqlite, included in Expo Go) as Zustand `persist` storage.
 *
 * Reads are synchronous, so a persisted store is hydrated the moment it's created: the first
 * frame already has the saved theme and settings, with no flash of the defaults. Writes are
 * asynchronous and don't block the UI.
 */
import Storage from 'expo-sqlite/kv-store';
import { createJSONStorage } from 'zustand/middleware';

export const kvStorage = createJSONStorage(() => ({
  getItem: (name: string) => Storage.getItemSync(name),
  setItem: (name: string, value: string) => Storage.setItem(name, value),
  removeItem: (name: string) => Storage.removeItem(name),
}));
