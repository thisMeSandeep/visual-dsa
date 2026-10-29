/** Engine limits and defaults (ARCHITECTURE §5.2). */
export const engine = {
  /** A trace stops with an error step after this many steps, so a runaway input can't hang. */
  maxStepsPerTrace: 2000,
  /** Largest structure a learner can build: fits a phone in portrait (ALGORITHM-CATALOG §2.2). */
  maxItems: 12,
  /** Values learners type, and the range random inputs are drawn from. */
  valueRange: { min: 0, max: 99 },
  /** Seed for random inputs when none is given, so the same session replays the same way. */
  defaultSeed: 42,
} as const;
