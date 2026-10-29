/** Lesson playback (F-401, F-402). Step timing and swipe settings join in Step 4.3. */
export const player = {
  /** Speeds offered by the speed control, slowest first. */
  speeds: [0.25, 0.5, 1, 1.5, 2, 4],
  defaultSpeed: 1,
  /** Autoplay stops at the last step of each chapter, so a chapter never runs into the next. */
  pauseAtChapterEnd: true,
} as const;
