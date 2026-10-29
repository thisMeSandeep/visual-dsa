import { useReducedMotion as useSystemReducedMotion } from 'react-native-reanimated';

import { useSettings } from '@/stores/settings';

/**
 * Whether to reduce motion (F-1104): the device setting, unless the learner forced it on or off
 * in Settings. Use this instead of Reanimated's useReducedMotion.
 */
export function useReducedMotion(): boolean {
  const system = useSystemReducedMotion();
  const choice = useSettings((state) => state.reducedMotion);
  return choice === 'system' ? system : choice === 'on';
}
