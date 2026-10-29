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
  /**
   * Visualisation canvas: how elements move between two steps. Durations are at 1× playback
   * speed and divided by the current speed. No finger is involved, so these are timing curves,
   * not springs (expo-animation skill, step 5).
   */
  canvas: {
    /** Moving or resizing on screen (swap, shift, reposition). */
    moveMs: 400,
    moveEasing: [0.77, 0, 0.175, 1],
    /** Colour and state changes (comparing → sorted). */
    highlightMs: 150,
    /** Elements appearing and leaving. */
    enterMs: 200,
    exitMs: 200,
    /** Appearing elements grow from this scale; never from 0. */
    enterScale: 0.9,
    /** Strong ease-out for highlights, enter and exit. */
    fadeEasing: [0.23, 1, 0.32, 1],
    /** Reduced motion: no movement, only short cross-fades. */
    reducedMotionMs: 150,
  },
  /**
   * Tab bar: the active pill slides to the tapped tab while the tabs re-flow and the label fades,
   * all together. On-screen movement, so ease-in-out (expo-animation skill, tab indicator recipe).
   * Reduced motion: everything snaps.
   */
  tabBar: {
    slideMs: 250,
    slideEasing: [0.77, 0, 0.175, 1],
  },
  /**
   * Side panels (the lesson's chapter list): slide in from the edge with a strong ease-out, leave
   * a little faster; the scrim fades. Reduced motion: fades only.
   */
  panel: {
    enterMs: 250,
    exitMs: 200,
    easing: [0.23, 1, 0.32, 1],
  },
} as const;
