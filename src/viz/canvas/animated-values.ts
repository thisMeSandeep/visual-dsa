/**
 * Shared values that animate towards a target whenever it changes. Writes happen in effects and
 * the per-frame work runs on the UI thread (expo-animation skill, step 6). `.get()` / `.set()`
 * keep this compatible with the React Compiler.
 */
import { useEffect } from 'react';
import {
  Easing,
  interpolateColor,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type DerivedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { config } from '@/config';

const { canvas } = config.motion;

export const MOVE_EASING = Easing.bezier(...canvas.moveEasing);
export const FADE_EASING = Easing.bezier(...canvas.fadeEasing);

type Easing_ = typeof MOVE_EASING;

/**
 * A number that animates to `target`. Starts at `initial` (default: the target), so an element
 * can mount at opacity 0 and fade to 1. A duration of 0 jumps.
 */
export function useAnimatedNumber(
  target: number,
  duration: number,
  easing: Easing_,
  initial: number = target,
): SharedValue<number> {
  const value = useSharedValue(initial);
  useEffect(() => {
    value.set(duration > 0 ? withTiming(target, { duration, easing }) : target);
  }, [value, target, duration, easing]);
  return value;
}

/** A colour that cross-fades from wherever it currently is to `target`. */
export function useAnimatedColor(target: string, duration: number): DerivedValue<string> {
  const from = useSharedValue(target);
  const to = useSharedValue(target);
  const progress = useSharedValue(1);
  const color = useDerivedValue(() =>
    String(interpolateColor(progress.get(), [0, 1], [from.get(), to.get()])),
  );

  useEffect(() => {
    if (to.get() === target) return;
    from.set(color.get());
    to.set(target);
    if (duration > 0) {
      progress.set(0);
      progress.set(withTiming(1, { duration, easing: FADE_EASING }));
    } else {
      progress.set(1);
    }
  }, [target, duration, from, to, progress, color]);

  return color;
}
