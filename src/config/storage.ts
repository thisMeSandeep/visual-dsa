/** Persisted stores (ARCHITECTURE §7). */
export const storage = {
  /** kv-store keys. Renaming one loses whatever was saved under the old key. */
  keys: {
    settings: 'visual-dsa.settings',
    progress: 'visual-dsa.progress',
  },
  /**
   * Schema version of each store. Bump it when the saved shape changes, and teach the store's
   * `migrate` to read the old shape, so an update never wipes a learner's settings or progress.
   */
  versions: {
    settings: 1,
    progress: 1,
  },
} as const;
