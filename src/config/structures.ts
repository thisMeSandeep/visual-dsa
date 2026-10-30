/** Defaults for each data structure, used by lessons and the sandbox when content gives none. */
export const structures = {
  stack: {
    /** How many items fit before push overflows. At most config.engine.maxItems. */
    defaultCapacity: 8,
  },
  array: {
    /** Slots in a new array when content gives no capacity. At most config.engine.maxItems. */
    defaultCapacity: 4,
    /** A full dynamic array grows to this many times its capacity (capped at maxItems). */
    growthFactor: 2,
  },
  queue: {
    /** Slots in a new queue. At most config.engine.maxItems. */
    defaultCapacity: 6,
  },
  brackets: {
    /** Longest expression the bracket checker takes: one canvas cell per character. */
    maxLength: 16,
  },
} as const;
