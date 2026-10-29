import { useSyncExternalStore } from 'react';

import { useProgress } from '@/stores/progress';
import { useSettings } from '@/stores/settings';

const PERSISTED = [useSettings, useProgress];

const allHydrated = () => PERSISTED.every((store) => store.persist.hasHydrated());

const subscribe = (onChange: () => void) => {
  const unsubscribes = PERSISTED.map((store) => store.persist.onFinishHydration(onChange));
  return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
};

/**
 * True once every persisted store has loaded its saved state. The root layout keeps the splash
 * screen up until then. The kv-store reads synchronously, so this is normally true at once.
 */
export function useStoresHydrated(): boolean {
  return useSyncExternalStore(subscribe, allHydrated);
}
