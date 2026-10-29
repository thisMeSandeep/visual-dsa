import * as Haptics from 'expo-haptics';
import { useState, type ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, { css, cubicBezier, useReducedMotion } from 'react-native-reanimated';

import { config } from '@/config';

const { press } = config.motion;

/*
 * Press feedback for every button-like control (expo-animation skill, "Press feedback"):
 * a Pressable with a Reanimated CSS transition, scaling on press-in, committing on press-out.
 * Full-width list rows don't use this; they highlight their background with `active:` instead.
 *
 * Styles go through Reanimated's `css.create`, which types CSS transition properties correctly
 * even though Expo's generated types redeclare them on ViewStyle (Reanimated issue #9328).
 */
const styles = css.create({
  resting: {
    opacity: 1,
    transform: [{ scale: 1 }],
    transitionProperty: ['transform', 'opacity'],
    transitionDuration: press.durationMs,
    transitionTimingFunction: cubicBezier(...press.easing),
  },
  pressed: { transform: [{ scale: press.scale }] },
  // Reduced motion: no scale, just a gentle opacity change that still confirms the press.
  pressedReduced: { opacity: press.reducedMotionOpacity },
});
const RESTING_STYLE = styles.resting;
const PRESSED_STYLE = styles.pressed;
const PRESSED_STYLE_REDUCED = styles.pressedReduced;

export type PressableScaleProps = Omit<PressableProps, 'children' | 'style' | 'className'> & {
  children: ReactNode;
  /** Layout of the touch area within its parent (flex-1, self-stretch…). */
  className?: string;
  /** The surface that scales: background, padding, radius and content layout. */
  contentClassName?: string;
  /** Light haptic on press, when haptics are enabled in config.features. */
  haptic?: boolean;
};

export function PressableScale({
  children,
  className,
  contentClassName,
  haptic = true,
  disabled,
  accessibilityState,
  onPress,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const [pressed, setPressed] = useState(false);
  const reducedMotion = useReducedMotion();
  const pressedStyle = reducedMotion ? PRESSED_STYLE_REDUCED : PRESSED_STYLE;

  return (
    <Pressable
      accessibilityRole="button"
      pressRetentionOffset={config.motion.touch.pressRetentionOffset}
      {...rest}
      disabled={disabled}
      accessibilityState={{ ...accessibilityState, disabled: Boolean(disabled) }}
      className={className}
      onPressIn={(event) => {
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        onPressOut?.(event);
      }}
      onPress={(event) => {
        if (haptic && config.features.haptics) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress?.(event);
      }}
    >
      <Animated.View
        className={contentClassName}
        style={[RESTING_STYLE, pressed ? pressedStyle : undefined]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
