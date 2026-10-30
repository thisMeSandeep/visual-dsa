/**
 * Two pointers (ALGORITHM-CATALOG A9): two indices that walk an array together, so one pass
 * does what nested loops would. Three classics on the array model: reverse (from both ends),
 * pair sum in a sorted array (from both ends) and removing duplicates in place (a slow `write`
 * and a fast `read`).
 *
 * Code line ids (two-pointers sample): reverse-start, reverse-swap, reverse-done (reverse);
 * pair-start, pair-left, pair-right, pair-found, pair-none (pairSum); dedupe-start,
 * dedupe-skip, dedupe-keep, dedupe-done (removeDuplicates).
 * Caption keys: the `pointers.*` keys in content/captions.ts.
 */
import { runTrace, type Tracer } from '../../core/tracer';
import type { ElementState, Scene, Trace } from '../../core/types';
import {
  arrayToScene,
  createArray,
  newItem,
  withSlot,
  type ArrayAnnotations,
  type ArrayModel,
  type ArrayPointer,
} from '../../structures/array';
import { withSwapped } from '../sorting/model';
import { describePattern } from './describe';

/** An array for the two-pointer patterns: one slot per value. */
export const createPointerArray = (items: readonly string[] = []): ArrayModel =>
  createArray(items, Math.max(items.length, 1));

/** The array scene, always with room for a pointer below the row (`write`). */
export const pointerToScene = (model: ArrayModel, annotations: ArrayAnnotations = {}): Scene =>
  arrayToScene(model, { laneBelow: true, ...annotations });

type PointerTracer = Tracer<ArrayModel, ArrayAnnotations>;

const valueAt = (t: PointerTracer, index: number) => t.model.slots[index]!.value;

/** States by index; empty slots are skipped. */
function byIndex(
  model: ArrayModel,
  state: (index: number) => ElementState | undefined,
): Record<string, ElementState> {
  const result: Record<string, ElementState> = {};
  model.slots.forEach((item, index) => {
    const s = item ? state(index) : undefined;
    if (item && s) result[item.id] = s;
  });
  return result;
}

const ends = (left: number, right: number): ArrayPointer[] => [
  { label: 'left', index: left },
  { label: 'right', index: right },
];

/** Reverses in place: swap the two ends, then step both pointers in, until they meet. */
export function reverse(t: PointerTracer): void {
  const n = t.model.size;
  if (n < 2) {
    t.step({ caption: { key: 'pointers.reverse.trivial', params: { size: n } } });
    return;
  }
  let left = 0;
  let right = n - 1;
  let swaps = 0;
  t.step({
    line: 'reverse-start',
    caption: { key: 'pointers.reverse.start' },
    vars: { left, right },
    annotations: { pointers: ends(left, right) },
  });
  while (left < right) {
    const a = valueAt(t, left);
    const b = valueAt(t, right);
    t.update((array) => withSwapped(array, left, right));
    swaps++;
    t.count('swaps');
    t.count('reads', 2);
    t.count('writes', 2);
    const l = left;
    const r = right;
    t.step({
      line: 'reverse-swap',
      caption: { key: 'pointers.reverse.swap', params: { a, b } },
      vars: { left, right },
      annotations: {
        highlight: byIndex(t.model, (i) =>
          i === l || i === r ? 'swapping' : i < l || i > r ? 'sorted' : undefined,
        ),
        pointers: ends(left, right),
      },
    });
    left++;
    right--;
  }
  t.step({
    line: 'reverse-done',
    caption: { key: 'pointers.reverse.done', params: { swaps } },
    vars: { left, right },
    annotations: { allItems: 'sorted' },
  });
}

/**
 * Finds two items of a sorted array that add up to `target`: left starts at the smallest, right
 * at the biggest. Too small a sum moves left up; too big moves right down. Its index pair, or
 * undefined.
 */
export function pairSum(t: PointerTracer, target: number): [number, number] | undefined {
  const n = t.model.size;
  if (n < 2) {
    t.step({ caption: { key: 'pointers.pair.too-short', params: { size: n, target } } });
    return undefined;
  }
  const numbers = t.model.slots.slice(0, n).map((item) => Number(item!.value));
  const sorted = numbers.every((value, i) => i === 0 || numbers[i - 1]! <= value);
  let left = 0;
  let right = n - 1;
  // Items outside left…right are ruled out: they can't be in the pair.
  const focus = (states: Record<number, ElementState> = {}) =>
    byIndex(t.model, (i) => states[i] ?? (i < left || i > right ? 'dimmed' : undefined));

  t.step({
    line: 'pair-start',
    caption: { key: 'pointers.pair.start', params: { target } },
    vars: { left, right, target },
    annotations: { pointers: ends(left, right) },
  });
  while (left < right) {
    const a = numbers[left]!;
    const b = numbers[right]!;
    const sum = a + b;
    t.count('reads', 2);
    t.count('comparisons');
    if (sum === target) {
      t.step({
        line: 'pair-found',
        caption: { key: 'pointers.pair.found', params: { a, b, sum, left, right } },
        vars: { left, right, sum },
        annotations: {
          highlight: focus({ [left]: 'found', [right]: 'found' }),
          pointers: ends(left, right),
          meta: { sum },
        },
      });
      return [left, right];
    }
    const tooSmall = sum < target;
    const params = { a, b, sum, target };
    if (tooSmall) left++;
    else right--;
    t.step({
      line: tooSmall ? 'pair-left' : 'pair-right',
      caption: { key: tooSmall ? 'pointers.pair.small' : 'pointers.pair.big', params },
      vars: { left, right, sum },
      annotations: {
        highlight: focus(tooSmall ? { [left - 1]: 'active' } : { [right + 1]: 'active' }),
        pointers: ends(left, right),
        meta: { sum },
      },
    });
  }
  t.step({
    line: 'pair-none',
    caption: {
      key: sorted ? 'pointers.pair.none' : 'pointers.pair.unsorted',
      params: { target },
    },
    vars: { left, right },
    annotations: { allItems: 'dimmed' },
  });
  return undefined;
}

/**
 * Removes repeats from a sorted array in place: `read` checks every item, `write` marks where the
 * next new value goes. Values before `write` are the unique ones; the rest are dropped at the end.
 * The number of unique values.
 */
export function removeDuplicates(t: PointerTracer): number {
  const n = t.model.size;
  if (n < 2) {
    t.step({ caption: { key: 'pointers.dedupe.trivial', params: { size: n } } });
    return n;
  }
  let write = 1;
  const at = (read?: number): ArrayPointer[] => [
    ...(read === undefined ? [] : [{ label: 'read', index: read }]),
    { label: 'write', index: write, side: 'below' },
  ];
  const kept = (states: Record<number, ElementState> = {}) =>
    byIndex(t.model, (i) => states[i] ?? (i < write ? 'sorted' : undefined));

  t.step({
    line: 'dedupe-start',
    caption: { key: 'pointers.dedupe.start', params: { value: valueAt(t, 0) } },
    vars: { write },
    annotations: { highlight: kept(), pointers: at(1) },
  });
  for (let read = 1; read < n; read++) {
    const value = valueAt(t, read);
    const last = valueAt(t, write - 1);
    t.count('reads', 2);
    t.count('comparisons');
    if (value === last) {
      t.step({
        line: 'dedupe-skip',
        caption: { key: 'pointers.dedupe.repeat', params: { value } },
        vars: { read, write },
        annotations: {
          highlight: kept({ [read]: 'dimmed', [write - 1]: 'active' }),
          pointers: at(read),
        },
      });
      continue;
    }
    const inPlace = read === write;
    if (!inPlace) {
      const [item, next] = newItem(t.model, value);
      t.update(() => withSlot(next, write, item));
      t.count('writes');
    }
    const target = write;
    write++;
    t.step({
      line: 'dedupe-keep',
      caption: {
        key: inPlace ? 'pointers.dedupe.keep-in-place' : 'pointers.dedupe.keep',
        params: { value, write: target },
      },
      vars: { read, write },
      annotations: { highlight: kept({ [target]: 'new' }), pointers: at(read) },
    });
  }
  t.update((array) => ({
    ...array,
    slots: array.slots.map((item, i) => (i < write ? item : null)),
    size: write,
  }));
  t.step({
    line: 'dedupe-done',
    caption: { key: 'pointers.dedupe.done', params: { count: write, dropped: n - write } },
    vars: { write },
    annotations: { allItems: 'sorted' },
  });
  return write;
}

export type PointerOperation =
  { type: 'reverse' } | { type: 'pairSum'; target: number } | { type: 'removeDuplicates' };

/** Runs one two-pointer operation: the trace to play, and the array to continue from. */
export function tracePointers(
  model: ArrayModel,
  operation: PointerOperation,
): { trace: Trace<unknown>; model: ArrayModel } {
  return runTrace(
    {
      operation: `two-pointers.${operation.type}`,
      model,
      toScene: pointerToScene,
      describe: describePattern,
    },
    (t): unknown => {
      switch (operation.type) {
        case 'reverse':
          reverse(t);
          return undefined;
        case 'pairSum':
          return pairSum(t, operation.target);
        case 'removeDuplicates':
          return removeDuplicates(t);
      }
    },
  );
}
