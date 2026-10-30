/**
 * Merge sort with tracing (ALGORITHM-CATALOG A5), drawn as split levels: the array on top and
 * one row per level of recursion under it. Splitting a range moves its items down a level, in
 * two halves; merging moves them back up one at a time, smallest first. So every item is in
 * exactly one row at any moment, and the rows show the extra space a merge needs.
 *
 * Code line ids (merge-sort sample): split, take-left, take-right, rest.
 * Caption keys: the `merge.*` and `sort.trivial.*` keys in content/captions.ts.
 */
import { runTrace, type Tracer } from '../../core/tracer';
import type { ElementState, Scene, SceneElement, Trace } from '../../core/types';
import type { ArrayItem } from '../../structures/array';
import { compareItems, createSortArray, itemLabel } from './model';

export type MergeModel = Readonly<{
  /** rows[0] is the array; rows[d] holds the items at recursion level d, by index. */
  rows: readonly (readonly (ArrayItem | null)[])[];
  size: number;
}>;

/** One range of the split tree: [start, end). */
export type Segment = readonly [number, number];

/** Where merge sort splits an array of n: the ranges at each level, top first. */
export function splitLevels(n: number): Segment[][] {
  const levels: Segment[][] = [];
  const visit = (start: number, end: number, level: number) => {
    (levels[level] ??= []).push([start, end]);
    if (end - start < 2) return;
    const mid = Math.floor((start + end) / 2);
    visit(start, mid, level + 1);
    visit(mid, end, level + 1);
  };
  visit(0, Math.max(n, 1), 0);
  return levels;
}

/** The split tree as scene meta, e.g. "0-4;0-2,2-4;0-1,1-2,2-3,3-4" (levels split by ";"). */
export const encodeLevels = (levels: readonly Segment[][]) =>
  levels.map((segments) => segments.map(([a, b]) => `${a}-${b}`).join(',')).join(';');

/** An array of numbers to merge sort ("5a" tags equal values), with an empty row per level. */
export function createMergeArray(items: readonly string[] = []): MergeModel {
  const top = createSortArray(items).slots;
  const depth = splitLevels(items.length).length;
  return {
    rows: [top, ...Array.from({ length: depth - 1 }, () => top.map(() => null))],
    size: items.length,
  };
}

/** The item at `index` moved from row `from` to row `to`. */
function withMovedRow(model: MergeModel, index: number, from: number, to: number): MergeModel {
  const item = model.rows[from]?.[index] ?? null;
  const rows = model.rows.map((row, level) => {
    if (level !== from && level !== to) return row;
    const next = [...row];
    next[index] = level === to ? item : null;
    return next;
  });
  return { ...model, rows };
}

/** The item `item` written to row `level`, slot `index` (a merge moving it up). */
function withPlaced(model: MergeModel, item: ArrayItem, level: number, index: number): MergeModel {
  const rows = model.rows.map((row, d) => {
    const next = row.map((slot) => (slot?.id === item.id ? null : slot));
    if (d === level) next[index] = item;
    return next;
  });
  return { ...model, rows };
}

export type MergeAnnotations = {
  /** States for particular items, by id. */
  highlight?: Readonly<Record<string, ElementState>>;
  /** Every item not in `highlight`. */
  allItems?: ElementState;
  /** The range being worked on, [start, end): items outside it are out of focus. */
  range?: Segment;
};

/** Merge sort model → an array scene: the top row as the array, lower rows as `level` slots. */
export function mergeToScene(model: MergeModel, annotations: MergeAnnotations = {}): Scene {
  const { highlight = {}, allItems, range } = annotations;
  const cells: SceneElement[] = model.rows.flatMap((row, level) =>
    row.flatMap((item, index): SceneElement[] => {
      if (!item) return [];
      const outside = range !== undefined && (index < range[0] || index >= range[1]);
      return [
        {
          kind: 'cell',
          id: item.id,
          value: item.value,
          ...(item.tag === undefined ? {} : { detail: item.tag }),
          state: highlight[item.id] ?? allItems ?? (outside ? 'dimmed' : 'default'),
          slot: level === 0 ? { type: 'index', index } : { type: 'level', level, index },
        },
      ];
    }),
  );
  return {
    renderer: 'array',
    elements: cells,
    meta: {
      size: model.size,
      capacity: model.rows[0]?.length ?? 0,
      levels: encodeLevels(splitLevels(model.size)),
    },
  };
}

type Cell = Extract<SceneElement, { kind: 'cell' }>;

/** Screen-reader summary (F-1105): each row's values, e.g. "Top row: 3, 8. Level 1: 5." */
export function describeMerge(scene: Scene): string {
  const cells = scene.elements.filter((e): e is Cell => e.kind === 'cell');
  const levelOf = (cell: Cell) => (cell.slot.type === 'level' ? cell.slot.level : 0);
  const indexOf = (cell: Cell) =>
    cell.slot.type === 'level' || cell.slot.type === 'index' ? cell.slot.index : 0;
  const depth = Math.max(0, ...cells.map(levelOf));
  const parts = [`Merge sort of ${scene.meta?.size ?? cells.length} items.`];
  for (let level = 0; level <= depth; level++) {
    const row = cells
      .filter((cell) => levelOf(cell) === level)
      .sort((a, b) => indexOf(a) - indexOf(b))
      .map((cell) => cell.value);
    if (row.length > 0)
      parts.push(`${level === 0 ? 'Top row' : `Level ${level}`}: ${row.join(', ')}.`);
  }
  const sorted = cells.filter((cell) => cell.state === 'sorted').length;
  if (sorted > 0) parts.push(`${sorted} in a sorted run.`);
  return parts.join(' ');
}

type MergeTracer = Tracer<MergeModel, MergeAnnotations>;

/** How far down to split: `depth: 1` splits once and merges two halves taken as sorted. */
export type MergeOptions = { depth?: number };

/** Sorts the top row by splitting down the levels and merging back up. */
export function mergeSort(t: MergeTracer, { depth = Infinity }: MergeOptions = {}): void {
  const n = t.model.size;
  if (n < 2) {
    t.step({
      caption: { key: n === 0 ? 'sort.trivial.empty' : 'sort.trivial.one' },
      annotations: { allItems: 'sorted' },
    });
    return;
  }
  let comparisons = 0;
  const row = (level: number) => t.model.rows[level]!;
  const labels = (level: number, start: number, end: number) =>
    row(level)
      .slice(start, end)
      .flatMap((item) => (item ? [itemLabel(item)] : []))
      .join(' ');
  /** Items already merged at `level` in [start, upTo) are a sorted run. */
  const run = (level: number, start: number, upTo: number): Record<string, ElementState> =>
    Object.fromEntries(
      row(level)
        .slice(start, upTo)
        .flatMap((item) => (item ? [[item.id, 'sorted' as const]] : [])),
    );

  t.step({ caption: { key: 'merge.start', params: { size: n } }, vars: { n } });

  const sortRange = (start: number, end: number, level: number) => {
    if (end - start < 2 || level >= depth) return;
    const mid = Math.floor((start + end) / 2);
    for (let i = start; i < end; i++) t.update((m) => withMovedRow(m, i, level, level + 1));
    t.count('writes', end - start);
    t.step({
      line: 'split',
      caption: {
        key: 'merge.split',
        params: { left: labels(level + 1, start, mid), right: labels(level + 1, mid, end) },
      },
      vars: { lo: start, mid, hi: end },
      annotations: { range: [start, end] },
    });
    sortRange(start, mid, level + 1);
    sortRange(mid, end, level + 1);
    merge(start, mid, end, level);
  };

  const merge = (start: number, mid: number, end: number, level: number) => {
    const below = level + 1;
    let i = start;
    let j = mid;
    let k = start;
    while (i < mid && j < end) {
      const a = row(below)[i]!;
      const b = row(below)[j]!;
      const order = compareItems(a, b);
      const takeLeft = order <= 0;
      const [item, other] = takeLeft ? [a, b] : [b, a];
      comparisons++;
      t.count('comparisons');
      t.count('reads', 2);
      t.update((m) => withPlaced(m, item, level, k));
      t.count('writes');
      k++;
      if (takeLeft) i++;
      else j++;
      t.step({
        line: takeLeft ? 'take-left' : 'take-right',
        caption: {
          key: order === 0 ? 'merge.take.equal' : 'merge.take',
          params: { value: itemLabel(item), other: itemLabel(other) },
        },
        vars: { lo: start, mid, hi: end, i, j, k },
        annotations: {
          range: [start, end],
          highlight: { ...run(level, start, k), [item.id]: 'active', [other.id]: 'active' },
        },
      });
    }

    const rest = [...row(below).slice(i, mid), ...row(below).slice(j, end)].filter(
      (item): item is ArrayItem => item !== null,
    );
    if (rest.length > 0) {
      const restIds = Object.fromEntries(rest.map((item) => [item.id, 'active' as const]));
      for (const item of rest) {
        t.update((m) => withPlaced(m, item, level, k));
        k++;
      }
      t.count('writes', rest.length);
      t.step({
        line: 'rest',
        caption: { key: 'merge.rest', params: { items: rest.map(itemLabel).join(' ') } },
        vars: { lo: start, mid, hi: end, k },
        annotations: { range: [start, end], highlight: { ...run(level, start, k), ...restIds } },
      });
    }

    // The whole array merged is the end; the final step says so.
    if (level === 0 && start === 0 && end === n) return;
    t.step({
      caption: { key: 'merge.merged', params: { items: labels(level, start, end) } },
      annotations: { range: [start, end], highlight: run(level, start, end) },
    });
  };

  sortRange(0, n, 0);
  t.step({
    caption: { key: 'merge.done', params: { comparisons } },
    annotations: { allItems: 'sorted' },
  });
}

/** Merge sorts `model`: the trace to play, and the sorted array (all in the top row). */
export function traceMergeSort(
  model: MergeModel,
  options: MergeOptions = {},
): { trace: Trace<undefined>; model: MergeModel } {
  return runTrace(
    { operation: 'merge-sort.sort', model, toScene: mergeToScene, describe: describeMerge },
    (t) => {
      mergeSort(t, options);
      return undefined;
    },
  );
}
