/**
 * Sliding window (ALGORITHM-CATALOG A10): a range left…right that moves along the array, updated
 * as items enter on the right and leave on the left instead of being recomputed. Three classics:
 * the biggest sum of k in a row (fixed window), the longest run with no repeats (variable
 * window) and each window's maximum (a monotonic deque, links to the Deque topic).
 *
 * Code line ids (sliding-window sample): sum-start, sum-slide, sum-done (maxSum);
 * unique-start, unique-grow, unique-shrink, unique-done (longestUnique); max-start,
 * max-expire, max-pop, max-push, max-record (windowMax).
 * Caption keys: the `window.*` keys in content/captions.ts.
 */
import { config } from '@/config';

import { runTrace, type Tracer } from '../../core/tracer';
import type { ElementState, Scene, Trace } from '../../core/types';
import {
  arrayToScene,
  createArray,
  type ArrayAnnotations,
  type ArrayModel,
  type ArrayPointer,
} from '../../structures/array';
import { describePattern } from './describe';

export type WindowModel = Readonly<{
  array: ArrayModel;
  /** The fixed window's size, 1 to the number of items. */
  k: number;
}>;

/** An array (numbers, or single letters for the no-repeats window) with a window size k. */
export function createWindowArray(
  items: readonly string[] = [],
  k: number = config.patterns.defaultWindow,
): WindowModel {
  return { array: createArray(items, Math.max(items.length, 1)), k: clampWindow(k, items.length) };
}

/** k kept between 1 and the number of items (at least 1). */
export const clampWindow = (k: number, size: number) => Math.max(1, Math.min(k, Math.max(size, 1)));

/** The array scene, with room kept below the row for `left` and `right`; meta carries k. */
export const windowToScene = (model: WindowModel, annotations: ArrayAnnotations = {}): Scene =>
  arrayToScene(model.array, {
    laneBelow: true,
    ...annotations,
    meta: { k: model.k, ...annotations.meta },
  });

type WindowTracer = Tracer<WindowModel, ArrayAnnotations>;

const valueAt = (t: WindowTracer, index: number) => t.model.array.slots[index]!.value;

/** States by index for the window left…right, with single indices picked out. */
function windowStates(
  t: WindowTracer,
  left: number,
  right: number,
  states: Readonly<Record<number, ElementState>> = {},
  inside: ElementState | undefined = 'active',
): Record<string, ElementState> {
  const result: Record<string, ElementState> = {};
  t.model.array.slots.forEach((item, index) => {
    if (!item) return;
    const state = states[index] ?? (index >= left && index <= right ? inside : undefined);
    if (state) result[item.id] = state;
  });
  return result;
}

const bounds = (left: number, right: number): ArrayPointer[] => [
  { label: 'left', index: left, side: 'below' },
  { label: 'right', index: right, side: 'below' },
];

/**
 * The biggest sum of k neighbours: sum the first window, then slide one place at a time,
 * adding the item that enters and subtracting the one that leaves. Its sum, or undefined.
 */
export function maxSum(t: WindowTracer): number | undefined {
  const { k } = t.model;
  const n = t.model.array.size;
  if (n === 0 || k > n) {
    t.step({ caption: { key: 'window.too-small', params: { k, size: n } } });
    return undefined;
  }
  const nonNumber = t.model.array.slots
    .slice(0, n)
    .find((item) => !Number.isFinite(Number(item!.value)));
  if (nonNumber) {
    t.fail('window.not-numbers', { key: 'window.not-numbers', params: { value: nonNumber.value } });
    return undefined;
  }
  const number = (index: number) => Number(valueAt(t, index));

  let sum = 0;
  for (let i = 0; i < k; i++) sum += number(i);
  t.count('reads', k);
  let best = sum;
  let bestStart = 0;
  t.step({
    line: 'sum-start',
    caption: { key: 'window.sum.start', params: { k, sum } },
    vars: { left: 0, right: k - 1, sum, best },
    annotations: {
      highlight: windowStates(t, 0, k - 1),
      pointers: bounds(0, k - 1),
      meta: { sum, best },
    },
  });

  for (let right = k; right < n; right++) {
    const left = right - k + 1;
    const entering = number(right);
    const leaving = number(left - 1);
    sum += entering - leaving;
    t.count('reads', 2);
    t.count('comparisons');
    const better = sum > best;
    if (better) {
      best = sum;
      bestStart = left;
    }
    t.step({
      line: 'sum-slide',
      caption: {
        key: better ? 'window.sum.slide.best' : 'window.sum.slide',
        params: { entering, leaving, sum },
      },
      vars: { left, right, sum, best },
      annotations: {
        highlight: windowStates(t, left, right, { [right]: 'new', [left - 1]: 'dimmed' }),
        pointers: bounds(left, right),
        meta: { sum, best },
      },
    });
  }

  const bestEnd = bestStart + k - 1;
  t.step({
    line: 'sum-done',
    caption: { key: 'window.sum.done', params: { k, best, start: bestStart, end: bestEnd } },
    vars: { best },
    annotations: {
      highlight: windowStates(t, bestStart, bestEnd, {}, 'found'),
      pointers: bounds(bestStart, bestEnd),
      meta: { best },
    },
  });
  return best;
}

/**
 * The longest run with no repeated value: the window grows on the right; when the new item is
 * already inside, it shrinks from the left until it isn't. Its length.
 */
export function longestUnique(t: WindowTracer): number {
  const n = t.model.array.size;
  if (n === 0) {
    t.step({ caption: { key: 'window.empty' } });
    return 0;
  }
  let left = 0;
  let best = 0;
  let bestStart = 0;
  const inWindow = new Set<string>();
  t.step({ line: 'unique-start', caption: { key: 'window.unique.start' }, vars: { left } });

  for (let right = 0; right < n; right++) {
    const value = valueAt(t, right);
    t.count('reads');
    t.count('comparisons');
    if (inWindow.has(value)) {
      const repeat = t.model.array.slots.findIndex(
        (item, i) => i >= left && i < right && item?.value === value,
      );
      t.step({
        line: 'unique-shrink',
        caption: { key: 'window.unique.repeat', params: { value } },
        vars: { left, right, best },
        annotations: {
          highlight: windowStates(t, left, right - 1, {
            [repeat]: 'collision',
            [right]: 'collision',
          }),
          pointers: bounds(left, right - 1),
          meta: { window: right - left, best },
        },
      });
      while (inWindow.has(value)) {
        const leaving = valueAt(t, left);
        inWindow.delete(leaving);
        left++;
        t.count('comparisons');
        t.step({
          line: 'unique-shrink',
          caption: {
            key: right === left ? 'window.unique.shrink.empty' : 'window.unique.shrink',
            params: { value: leaving, length: right - left },
          },
          vars: { left, right, best },
          annotations: {
            highlight: windowStates(t, left, right - 1, {
              [left - 1]: 'dimmed',
              [right]: 'collision',
            }),
            pointers: bounds(left, Math.max(left, right - 1)),
            meta: { window: right - left, best },
          },
        });
      }
    }
    inWindow.add(value);
    const length = right - left + 1;
    const better = length > best;
    if (better) {
      best = length;
      bestStart = left;
    }
    t.step({
      line: 'unique-grow',
      caption: {
        key: better ? 'window.unique.grow.best' : 'window.unique.grow',
        params: { value, length },
      },
      vars: { left, right, best },
      annotations: {
        highlight: windowStates(t, left, right, { [right]: 'new' }),
        pointers: bounds(left, right),
        meta: { window: length, best },
      },
    });
  }

  const bestEnd = bestStart + best - 1;
  t.step({
    line: 'unique-done',
    caption: { key: 'window.unique.done', params: { best, start: bestStart, end: bestEnd } },
    vars: { best },
    annotations: {
      highlight: windowStates(t, bestStart, bestEnd, {}, 'found'),
      pointers: bounds(bestStart, bestEnd),
      meta: { best },
    },
  });
  return best;
}

/**
 * The maximum of every window of k, with a monotonic deque of indices whose values only go down
 * from front to back: the front is always the window's maximum. Each item is pushed once and
 * popped at most once, so the whole run is O(n). The maxima, one per window.
 */
export function windowMax(t: WindowTracer): number[] {
  const { k } = t.model;
  const n = t.model.array.size;
  if (n === 0 || k > n) {
    t.step({ caption: { key: 'window.too-small', params: { k, size: n } } });
    return [];
  }
  const nonNumber = t.model.array.slots
    .slice(0, n)
    .find((item) => !Number.isFinite(Number(item!.value)));
  if (nonNumber) {
    t.fail('window.not-numbers', { key: 'window.not-numbers', params: { value: nonNumber.value } });
    return [];
  }
  const number = (index: number) => Number(valueAt(t, index));
  const deque: number[] = [];
  const maxima: number[] = [];
  const shown = () => (deque.length === 0 ? '–' : deque.map((i) => valueAt(t, i)).join(' '));
  /** Deque members are kept (visited); the front, once a window is full, is its maximum. */
  const states = (
    left: number,
    right: number,
    picked: Readonly<Record<number, ElementState>> = {},
  ): Record<string, ElementState> => {
    const kept: Record<number, ElementState> = {};
    for (const i of deque) kept[i] = 'visited';
    return windowStates(t, left, right, { ...kept, ...picked }, undefined);
  };
  const front = (): ArrayPointer[] =>
    deque.length === 0 ? [] : [{ label: 'max', index: deque[0]! }];

  t.step({
    line: 'max-start',
    caption: { key: 'window.max.start', params: { k } },
    vars: { k },
    annotations: { meta: { deque: shown() } },
  });

  for (let right = 0; right < n; right++) {
    const left = Math.max(0, right - k + 1);
    if (deque.length > 0 && deque[0]! < left) {
      const expired = deque.shift()!;
      t.step({
        line: 'max-expire',
        caption: { key: 'window.max.expire', params: { value: valueAt(t, expired) } },
        vars: { left, right },
        annotations: {
          highlight: states(left, right, { [expired]: 'dimmed' }),
          pointers: [...front(), ...bounds(left, right)],
          meta: { deque: shown() },
        },
      });
    }
    const incoming = number(right);
    t.count('reads');
    while (deque.length > 0 && number(deque.at(-1)!) <= incoming) {
      t.count('comparisons');
      const popped = deque.pop()!;
      t.step({
        line: 'max-pop',
        caption: {
          key: 'window.max.pop',
          params: { value: valueAt(t, popped), incoming },
        },
        vars: { left, right },
        annotations: {
          highlight: states(left, right, { [popped]: 'dimmed', [right]: 'new' }),
          pointers: [...front(), ...bounds(left, right)],
          meta: { deque: shown() },
        },
      });
    }
    if (deque.length > 0) t.count('comparisons');
    deque.push(right);
    t.step({
      line: 'max-push',
      caption: { key: 'window.max.push', params: { value: incoming, deque: shown() } },
      vars: { left, right },
      annotations: {
        highlight: states(left, right, { [right]: 'new' }),
        pointers: [...front(), ...bounds(left, right)],
        meta: { deque: shown() },
      },
    });
    if (right < k - 1) continue;
    const max = number(deque[0]!);
    maxima.push(max);
    t.step({
      line: 'max-record',
      caption: { key: 'window.max.max', params: { start: left, end: right, value: max } },
      vars: { left, right, max },
      annotations: {
        highlight: states(left, right, { [deque[0]!]: 'found' }),
        pointers: [...front(), ...bounds(left, right)],
        meta: { deque: shown(), best: max },
      },
    });
  }

  t.step({
    caption: { key: 'window.max.done', params: { maxima: maxima.join(' ') } },
    annotations: { meta: { deque: shown() } },
  });
  return maxima;
}

/** A new window size, kept between 1 and the number of items, in one step. */
function setWindow(t: WindowTracer, k: number): void {
  const size = t.model.array.size;
  const next = clampWindow(k, size);
  if (next !== k) {
    t.step({ caption: { key: 'window.k.limit', params: { k, size } } });
    return;
  }
  t.update((model) => ({ ...model, k: next }));
  t.step({
    caption: { key: 'window.k', params: { k: next } },
    annotations: { highlight: windowStates(t, 0, next - 1), pointers: bounds(0, next - 1) },
  });
}

export type WindowOperation =
  | { type: 'maxSum' }
  | { type: 'longestUnique' }
  | { type: 'windowMax' }
  | { type: 'setWindow'; k: number };

/** Runs one sliding-window operation: the trace to play, and the model to continue from. */
export function traceWindow(
  model: WindowModel,
  operation: WindowOperation,
): { trace: Trace<unknown>; model: WindowModel } {
  return runTrace(
    {
      operation: `sliding-window.${operation.type}`,
      model,
      toScene: windowToScene,
      describe: describePattern,
    },
    (t): unknown => {
      switch (operation.type) {
        case 'maxSum':
          return maxSum(t);
        case 'longestUnique':
          return longestUnique(t);
        case 'windowMax':
          return windowMax(t);
        case 'setWindow':
          setWindow(t, operation.k);
          return undefined;
      }
    },
  );
}
