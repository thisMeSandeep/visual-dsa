/**
 * Motion and touch behaviour (VISUAL-SPEC §8). Values follow the expo-animation skill:
 * press feedback is near-imperceptible because it happens tens of times a day.
 */
export const motion = {
  press: {
    /** Buttons scale down slightly while pressed. Full-width rows highlight instead. */
    scale: 0.97,
    durationMs: 120,
    /** Strong ease-out, as cubic-bezier control points. */
    easing: [0.23, 1, 0.32, 1],
    /** With reduced motion on, press feedback is an opacity change instead of a scale. */
    reducedMotionOpacity: 0.7,
  },
  touch: {
    /** Extra hit area around small controls so every target reaches 44pt. */
    hitSlop: 12,
    /** How far a finger may drift before a press is cancelled. */
    pressRetentionOffset: 16,
  },
} as const;
