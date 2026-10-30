/**
 * Merge sort's split levels (VISUAL-SPEC §7 "Array row"), read from scene meta `levels`, e.g.
 * "0-4;0-2,2-4;0-1,1-2,2-3,3-4": the ranges at each level, top first. Pure, so it's tested.
 *
 * Each level is drawn a little wider than the one above: every place a range has split, at this
 * level or above, adds a split gap. Rows are centred on each other, like an upside-down tree.
 */
export type Segment = readonly [number, number];

/** The ranges per level, or [] when the meta is missing or malformed. */
export function parseLevels(meta: unknown): Segment[][] {
  if (typeof meta !== 'string' || meta === '') return [];
  const levels = meta.split(';').map((level) =>
    level.split(',').map((range): Segment | undefined => {
      const [start, end] = range.split('-').map(Number);
      return Number.isInteger(start) && Number.isInteger(end) ? [start!, end!] : undefined;
    }),
  );
  return levels.every((level) => level.every((segment) => segment !== undefined))
    ? (levels as Segment[][])
    : [];
}

export type LevelGeometry = {
  /** How many split gaps sit left of `index` at `level`. */
  gapsBefore: (level: number, index: number) => number;
  /** The most split gaps any level has: the widest row. */
  maxGaps: number;
  /** Total split gaps across a level. */
  gapsAt: (level: number) => number;
};

export function levelGeometry(levels: readonly Segment[][]): LevelGeometry {
  // Split points from this level and every level above (a split stays split further down).
  const splits = levels.map((_, level) => {
    const points = new Set<number>();
    for (let d = 0; d <= level; d++) {
      for (const [start] of levels[d] ?? []) if (start > 0) points.add(start);
    }
    return [...points];
  });
  const gapsBefore = (level: number, index: number) =>
    (splits[level] ?? []).filter((point) => point <= index).length;
  const gapsAt = (level: number) => (splits[level] ?? []).length;
  return { gapsBefore, gapsAt, maxGaps: Math.max(0, ...splits.map((points) => points.length)) };
}
