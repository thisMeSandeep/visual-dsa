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
  hashTable: {
    /** Buckets in a new table when content gives none. */
    defaultSize: 5,
    /** Smallest and largest tables: the bucket column must fit a phone. */
    minSize: 2,
    maxSize: 12,
    /** Resize when a put would push the load factor (keys ÷ buckets) above this. */
    defaultLoadLimit: 0.75,
    /** A full table grows to this many times its buckets (capped at maxSize). */
    growthFactor: 2,
    /** Longest key: a name that fits an entry box. */
    maxKeyLength: 6,
    /** The polynomial hash multiplies by this as it reads each letter. */
    polynomialBase: 31,
    /** Decimal places when a load factor is shown, e.g. 0.75. */
    loadFactorDigits: 2,
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
