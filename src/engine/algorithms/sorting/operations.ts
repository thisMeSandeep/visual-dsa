/**
 * Bubble, selection and insertion sort with tracing (ALGORITHM-CATALOG A2–A4). Each topic has
 * its own code sample, so the line ids are short and only need to match the `@line` markers in
 * that topic's sample (ARCHITECTURE §5.3):
 *
 * - bubble-sort: compare, swap, pass-done, early-exit
 * - selection-sort: scan, compare, new-min, swap, place
 * - insertion-sort: take, shift, insert
 * - quick-sort: random-pivot, pivot, compare, swap, place
 *
 * Caption keys: the `bubble.*`, `selection.*`, `insertion.*` and `sort.*` keys in
 * content/captions.ts. Items in their final (or, for insertion sort, sorted-so-far) place are
 * `sorted`; the items being compared are `active`; two items trading places are `swapping`.
 */
import { config } from '@/config';

import { createRng } from '../../core/rng';
import { runTrace, type Tracer } from '../../core/tracer';
import type { ElementState, Trace } from '../../core/types';
import {
  withMoved,
  withSlot,
  type ArrayAnnotations,
  type ArrayItem,
  type ArrayModel,
  type ArrayPointer,
} from '../../structures/array';
import { describeSort } from './describe';
import { compareItems, itemLabel, withSwapped, type SortAlgorithm } from './model';
import { sortToScene } from './to-scene';

export type SortTracer = Tracer<ArrayModel, ArrayAnnotations>;

const itemAt = (t: SortTracer, index: number) => t.model.slots[index]!;

/**
 * Highlights by index: `sorted` says which indices are in place, `states` overrides single
 * indices (the pair being compared…). Empty slots are skipped.
 */
function highlight(
  model: ArrayModel,
  sorted: (index: number) => boolean,
  states: Readonly<Record<number, ElementState>> = {},
): Record<string, ElementState> {
  const result: Record<string, ElementState> = {};
  model.slots.forEach((item, index) => {
    if (!item) return;
    const state = states[index] ?? (sorted(index) ? 'sorted' : undefined);
    if (state) result[item.id] = state;
  });
  return result;
}

/**
 * Which rounds to run (a round is a bubble pass, or placing one item for selection and
 * insertion sort): skip the first `from`, as if already done, then run at most `rounds`.
 * Lessons use this to show one round per chapter on the same array; the default is all.
 */
export type SortRounds = { from?: number; rounds?: number };

/** Quick sort's pivot: always the last item of the range (Lomuto), or a random one. */
export type PivotChoice = 'last' | 'random';
export type SortOptions = SortRounds & { pivot?: PivotChoice };

const ALL = () => true;

/** Arrays of 0 or 1 items are sorted already: one step that says so. */
function trivial(t: SortTracer): boolean {
  if (t.model.size > 1) return false;
  t.step({
    caption: { key: t.model.size === 0 ? 'sort.trivial.empty' : 'sort.trivial.one' },
    annotations: { allItems: 'sorted' },
  });
  return true;
}

/**
 * Bubble sort: compare each pair of neighbours and swap them if they're out of order. Each pass
 * carries the biggest value left to the end, so the sorted part grows from the right. A pass
 * with no swaps means everything is in order, and it stops early.
 */
export function bubbleSort(t: SortTracer, { from = 0, rounds = Infinity }: SortRounds = {}): void {
  if (trivial(t)) return;
  const n = t.model.size;
  let comparisons = 0;
  let swaps = 0;
  let sortedFrom = n - from;
  let finished = from + 1 >= n;
  const inPlace = (index: number) => index >= sortedFrom;

  if (from === 0) t.step({ caption: { key: 'bubble.start', params: { size: n } }, vars: { n } });
  for (let pass = from + 1; pass < n && pass <= from + rounds; pass++) {
    let swapped = false;
    for (let j = 0; j < n - pass; j++) {
      const a = itemAt(t, j);
      const b = itemAt(t, j + 1);
      const swap = compareItems(a, b) > 0;
      comparisons++;
      t.count('comparisons');
      t.count('reads', 2);
      const pointers: ArrayPointer[] = [{ label: 'j', index: j }];
      t.step({
        line: 'compare',
        caption: {
          key: swap ? 'bubble.compare.swap' : 'bubble.compare.keep',
          params: { a: itemLabel(a), b: itemLabel(b) },
        },
        vars: { pass, j },
        annotations: {
          highlight: highlight(t.model, inPlace, { [j]: 'active', [j + 1]: 'active' }),
          pointers,
        },
      });
      if (!swap) continue;

      t.update((array) => withSwapped(array, j, j + 1));
      swaps++;
      swapped = true;
      t.count('swaps');
      t.count('writes', 2);
      t.step({
        line: 'swap',
        caption: { key: 'bubble.swapped', params: { a: itemLabel(a), b: itemLabel(b) } },
        vars: { pass, j },
        annotations: {
          highlight: highlight(t.model, inPlace, { [j]: 'swapping', [j + 1]: 'swapping' }),
          pointers,
        },
      });
    }

    if (!swapped) {
      sortedFrom = 0;
      finished = true;
      t.step({
        line: 'early-exit',
        caption: { key: 'bubble.early-exit', params: { pass } },
        vars: { pass },
        annotations: { highlight: highlight(t.model, ALL) },
      });
      break;
    }
    sortedFrom = n - pass;
    t.step({
      line: 'pass-done',
      caption: {
        key: sortedFrom === 1 ? 'bubble.last-pass' : 'bubble.pass-done',
        params: { pass, value: itemLabel(itemAt(t, sortedFrom)), index: sortedFrom },
      },
      vars: { pass },
      annotations: { highlight: highlight(t.model, sortedFrom === 1 ? ALL : inPlace) },
    });
    if (sortedFrom === 1) finished = true;
  }

  if (!finished) return;
  t.step({
    caption: { key: from === 0 ? 'sort.done' : 'sort.done.rest', params: { comparisons, swaps } },
    annotations: { allItems: 'sorted' },
  });
}

/**
 * Selection sort: find the smallest item in the unsorted part and swap it to the front of that
 * part, so the sorted part grows from the left by one each round. It does at most n − 1 swaps,
 * but always compares every pair.
 */
export function selectionSort(
  t: SortTracer,
  { from = 0, rounds = Infinity }: SortRounds = {},
): void {
  if (trivial(t)) return;
  const n = t.model.size;
  let comparisons = 0;
  let swaps = 0;

  if (from === 0) {
    t.step({ caption: { key: 'selection.start', params: { size: n } }, vars: { n } });
  }
  let i = from;
  for (; i < n - 1 && i < from + rounds; i++) {
    const inPlace = (index: number) => index < i;
    const at = (min: number, j?: number): ArrayPointer[] => [
      { label: 'min', index: min },
      ...(j === undefined ? [] : [{ label: 'j', index: j }]),
      { label: 'i', index: i, side: 'below' },
    ];
    let min = i;
    t.step({
      line: 'scan',
      caption: {
        key: 'selection.scan',
        params: { i, last: n - 1, value: itemLabel(itemAt(t, i)) },
      },
      vars: { i, min },
      annotations: { highlight: highlight(t.model, inPlace, { [i]: 'active' }), pointers: at(i) },
    });

    for (let j = i + 1; j < n; j++) {
      const candidate = itemAt(t, j);
      const best = itemAt(t, min);
      const smaller = compareItems(candidate, best) < 0;
      comparisons++;
      t.count('comparisons');
      t.count('reads');
      if (smaller) min = j;
      t.step({
        line: smaller ? 'new-min' : 'compare',
        caption: {
          key: smaller ? 'selection.new-min' : 'selection.not-smaller',
          params: { value: itemLabel(candidate), min: itemLabel(best) },
        },
        vars: { i, j, min },
        annotations: {
          highlight: highlight(t.model, inPlace, { [min]: 'active', [j]: 'active' }),
          pointers: at(min, j),
        },
      });
    }

    const smallest = itemAt(t, min);
    if (min === i) {
      t.step({
        line: 'place',
        caption: { key: 'selection.in-place', params: { min: itemLabel(smallest), i } },
        vars: { i, min },
        annotations: { highlight: highlight(t.model, (index) => index <= i), pointers: at(min) },
      });
      continue;
    }
    const displaced = itemAt(t, i);
    t.update((array) => withSwapped(array, i, min));
    swaps++;
    t.count('swaps');
    t.count('writes', 2);
    t.step({
      line: 'swap',
      caption: {
        key: 'selection.swap',
        params: { min: itemLabel(smallest), value: itemLabel(displaced), i },
      },
      vars: { i, min },
      annotations: {
        highlight: highlight(t.model, inPlace, { [i]: 'swapping', [min]: 'swapping' }),
        pointers: at(min),
      },
    });
  }

  if (i < n - 1) return;
  t.step({
    caption: { key: from === 0 ? 'sort.done' : 'sort.done.rest', params: { comparisons, swaps } },
    annotations: { allItems: 'sorted' },
  });
}

/**
 * Insertion sort: take the next item out as the key, shift the bigger items of the sorted part
 * one place right, and drop the key into the gap, like sorting a hand of cards. On nearly sorted
 * input almost nothing shifts, so it's close to O(n).
 */
export function insertionSort(
  t: SortTracer,
  { from = 0, rounds = Infinity }: SortRounds = {},
): void {
  if (trivial(t)) return;
  const n = t.model.size;
  let comparisons = 0;
  let shifts = 0;

  if (from === 0) {
    t.step({ caption: { key: 'insertion.start', params: { size: n } }, vars: { n } });
  }
  let i = from + 1;
  for (; i < n && i <= from + rounds; i++) {
    const key: ArrayItem = itemAt(t, i);
    const label = itemLabel(key);
    // The sorted part is 0…i − 1 before the key comes out, and 0…i (less the gap) after.
    const soFar = (index: number) => index <= i;
    t.update((array) => withSlot(array, i, null));
    t.count('reads');
    t.step({
      line: 'take',
      caption: { key: 'insertion.take', params: { key: label, i } },
      vars: { i, key: label },
      annotations: {
        highlight: { ...highlight(t.model, (index) => index < i), [key.id]: 'active' },
        held: { item: key, index: i },
      },
    });

    let gap = i;
    while (gap > 0) {
      const left = itemAt(t, gap - 1);
      comparisons++;
      t.count('comparisons');
      if (compareItems(left, key) <= 0) break;
      t.update((array) => withMoved(array, gap - 1, gap));
      shifts++;
      t.count('writes');
      t.step({
        line: 'shift',
        caption: { key: 'insertion.shift', params: { value: itemLabel(left), key: label } },
        vars: { i, j: gap - 1, key: label },
        annotations: {
          highlight: {
            ...highlight(t.model, soFar, { [gap]: 'active' }),
            [key.id]: 'active',
          },
          held: { item: key, index: gap - 1 },
        },
      });
      gap--;
    }

    const stoppedAt = gap > 0 ? itemAt(t, gap - 1) : undefined;
    t.update((array) => withSlot(array, gap, key));
    t.count('writes');
    t.step({
      line: 'insert',
      caption: stoppedAt
        ? {
            key: gap === i ? 'insertion.stay' : 'insertion.insert',
            params: { key: label, value: itemLabel(stoppedAt), index: gap },
          }
        : { key: 'insertion.front', params: { key: label } },
      vars: { i, j: gap - 1, key: label },
      annotations: { highlight: highlight(t.model, soFar, { [gap]: 'active' }) },
    });
  }

  if (i < n) return;
  t.step({
    caption: {
      key: from === 0 ? 'insertion.done' : 'insertion.done.rest',
      params: { comparisons, shifts },
    },
    annotations: { allItems: 'sorted' },
  });
}

/**
 * Quick sort with Lomuto partitioning: the pivot is the range's last item (or a random one,
 * swapped to the end first). Scanning with j, every item no bigger than the pivot is swapped to
 * i, which then moves on; finally the pivot swaps into index i, its final place, with smaller
 * items left of it and bigger ones right. Then the same for each side, left first.
 *
 * A round is one partition. Unlike the simple sorts, `from` partitions are replayed out of sight
 * on the array given, so a lesson sets up the original array again to show the rest after an
 * earlier `pass`.
 */
export function quickSort(
  t: SortTracer,
  { from = 0, rounds = Infinity, pivot: choice = 'last' }: SortOptions = {},
): void {
  if (trivial(t)) return;
  const n = t.model.size;
  // Seeded, so a "random" pivot run replays the same way every time.
  const rng = createRng(config.engine.defaultSeed);
  const placed = new Set<number>();
  let partitions = 0;
  let comparisons = 0;
  let swaps = 0;

  // Partitions before `from` happen, but out of sight.
  const shown = () => partitions >= from;
  const step = (input: Parameters<SortTracer['step']>[0]) => {
    if (shown()) t.step(input);
  };
  const count = (counter: 'comparisons' | 'swaps' | 'reads' | 'writes', by = 1) => {
    if (shown()) t.count(counter, by);
  };
  /** Placed items are sorted; outside lo…hi is out of focus; `states` picks out single items. */
  const focus = (lo: number, hi: number, states: Readonly<Record<number, ElementState>> = {}) => {
    const result: Record<string, ElementState> = {};
    t.model.slots.forEach((item, index) => {
      if (!item) return;
      const state =
        states[index] ??
        (placed.has(index) ? 'sorted' : index < lo || index > hi ? 'dimmed' : undefined);
      if (state) result[item.id] = state;
    });
    return result;
  };
  const swap = (a: number, b: number) => {
    t.update((array) => withSwapped(array, a, b));
    swaps += shown() ? 1 : 0;
    count('swaps');
    count('writes', 2);
  };

  function partition(lo: number, hi: number): number {
    if (choice === 'random') {
      const r = rng.int(lo, hi);
      const picked = itemLabel(itemAt(t, r));
      if (r !== hi) swap(r, hi);
      step({
        line: 'random-pivot',
        caption: {
          key: r === hi ? 'quick.random.last' : 'quick.random',
          params: { pivot: picked },
        },
        annotations: {
          highlight: focus(
            lo,
            hi,
            r === hi ? { [hi]: 'pivot' } : { [r]: 'swapping', [hi]: 'swapping' },
          ),
        },
      });
    }
    const pivot = itemAt(t, hi);
    const label = itemLabel(pivot);
    let i = lo;
    const at = (j?: number): ArrayPointer[] => [
      ...(j === undefined ? [] : [{ label: 'j', index: j }]),
      { label: 'i', index: i, side: 'below' },
    ];
    step({
      line: 'pivot',
      caption: { key: 'quick.partition', params: { pivot: label, lo, hi } },
      vars: { lo, hi, pivot: label, i },
      annotations: { highlight: focus(lo, hi, { [hi]: 'pivot' }), pointers: at() },
    });

    for (let j = lo; j < hi; j++) {
      const item = itemAt(t, j);
      const small = compareItems(item, pivot) <= 0;
      comparisons += shown() ? 1 : 0;
      count('comparisons');
      count('reads');
      step({
        line: 'compare',
        caption: {
          key: !small ? 'quick.big' : i === j ? 'quick.small.stay' : 'quick.small',
          params: { value: itemLabel(item), pivot: label, i },
        },
        vars: { lo, hi, pivot: label, i, j },
        annotations: {
          highlight: focus(lo, hi, { [hi]: 'pivot', [j]: 'active' }),
          pointers: at(j),
        },
      });
      if (!small) continue;
      if (i !== j) {
        const other = itemAt(t, i);
        swap(i, j);
        step({
          line: 'swap',
          caption: {
            key: 'quick.swapped',
            params: { value: itemLabel(item), other: itemLabel(other), i },
          },
          vars: { lo, hi, pivot: label, i, j },
          annotations: {
            highlight: focus(lo, hi, { [hi]: 'pivot', [i]: 'swapping', [j]: 'swapping' }),
            pointers: at(j),
          },
        });
      }
      i++;
    }

    const moved = i !== hi;
    if (moved) swap(i, hi);
    placed.add(i);
    step({
      line: 'place',
      caption: {
        key: moved ? 'quick.place' : 'quick.place.end',
        params: { pivot: label, index: i, left: i - lo, right: hi - i },
      },
      vars: { lo, hi, pivot: label, i },
      annotations: {
        highlight: focus(lo, hi, moved ? { [i]: 'swapping', [hi]: 'swapping' } : {}),
        pointers: at(),
      },
    });
    return i;
  }

  if (from === 0) {
    t.step({
      caption: {
        key: choice === 'random' ? 'quick.start.random' : 'quick.start',
        params: { size: n },
      },
      vars: { n },
    });
  }
  // Ranges still to sort, lo…hi inclusive; the left side is popped first.
  const ranges: [number, number][] = [[0, n - 1]];
  while (ranges.length > 0) {
    const [lo, hi] = ranges.at(-1)!;
    if (lo === hi) {
      ranges.pop();
      placed.add(lo);
      step({
        caption: { key: 'quick.single', params: { value: itemLabel(itemAt(t, lo)), index: lo } },
        annotations: { highlight: focus(lo, hi) },
      });
      continue;
    }
    if (lo > hi) {
      ranges.pop();
      continue;
    }
    if (partitions >= from + rounds) return;
    ranges.pop();
    const p = partition(lo, hi);
    partitions++;
    ranges.push([p + 1, hi], [lo, p - 1]);
  }

  t.step({
    caption: { key: from === 0 ? 'sort.done' : 'sort.done.rest', params: { comparisons, swaps } },
    annotations: { allItems: 'sorted' },
  });
}

const SORTS: Record<SortAlgorithm, (t: SortTracer, options?: SortOptions) => void> = {
  'bubble-sort': bubbleSort,
  'selection-sort': selectionSort,
  'insertion-sort': insertionSort,
  'quick-sort': quickSort,
};

/**
 * Sorts `model` with `algorithm` (all of it, or the `rounds` asked for): the trace to play, and
 * the array to continue from.
 */
export function traceSort(
  model: ArrayModel,
  algorithm: SortAlgorithm,
  options: SortOptions = {},
): { trace: Trace<undefined>; model: ArrayModel } {
  return runTrace(
    {
      operation: `${algorithm}.sort`,
      model,
      toScene: sortToScene(algorithm),
      describe: describeSort,
    },
    (t) => {
      SORTS[algorithm](t, options);
      return undefined;
    },
  );
}
