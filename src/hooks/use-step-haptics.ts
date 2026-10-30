import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';

import { config, type HapticFeedback } from '@/config';
import type { Step } from '@/engine/core/types';
import { useSettings } from '@/stores/settings';

import { hapticFor } from './step-haptics';

const PLAY: Record<HapticFeedback, () => Promise<void>> = {
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
};

/**
 * Plays a haptic for key canvas events (F-307) as the player moves forward one step at a time,
 * while playing or with Next. Seeking, scrubbing and stepping back stay quiet. Off unless the
 * haptics feature is on and the learner hasn't turned it off in Settings.
 */
export function useStepHaptics(steps: readonly Step[], index: number): void {
  const enabled = useSettings((state) => state.haptics) && config.features.haptics;
  const last = useRef({ steps, index });
  useEffect(() => {
    const before = last.current;
    last.current = { steps, index };
    if (!enabled || before.steps !== steps || index !== before.index + 1) return;
    const step = steps[index];
    if (!step) return;
    const event = hapticFor(step, steps[index - 1]);
    if (event) void PLAY[config.haptics.events[event]]().catch(() => undefined);
  }, [steps, index, enabled]);
}
