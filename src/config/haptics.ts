/** Haptic feedback on canvas events (F-307), when config.features.haptics is on. */
export const haptics = {
  /** The feedback each event gives: notification types for outcomes, impacts for actions. */
  events: {
    /** Overflow, out of bounds, a stack overflow. */
    error: 'error',
    /** A search finds its match. */
    found: 'success',
    /** Two keys land in the same bucket. */
    collision: 'medium',
    /** Two items trade places. */
    swap: 'light',
  },
} as const;

export type HapticFeedback = (typeof haptics.events)[keyof typeof haptics.events];
export type HapticEvent = keyof typeof haptics.events;
