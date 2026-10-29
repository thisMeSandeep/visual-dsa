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
} as const;
