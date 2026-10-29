/** Lesson playback (F-401, F-402). */
export const player = {
  /**
   * Time each step stays on screen while playing at 1×: the move animation plus time to read the
   * caption. Divided by the playback speed.
   */
  baseStepMs: 1500,
  /** Speeds offered by the speed control, slowest first. */
  speeds: [0.25, 0.5, 1, 1.5, 2, 4],
  defaultSpeed: 1,
  /** Autoplay stops at the last step of each chapter, so a chapter never runs into the next. */
  pauseAtChapterEnd: true,
  /** Swiping the canvas left/right steps forward/back (F-202). */
  swipe: {
    /** Horizontal travel before the swipe takes over from other touches. */
    activateAfterPx: 12,
    /** A swipe this long changes the step… */
    commitPx: 48,
    /** …and so does a quick flick, whatever its length (points per second). */
    flickVelocity: 500,
  },
} as const;
