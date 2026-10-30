/**
 * Array operations with tracing (ALGORITHM-CATALOG L1). Code line ids must match the `@line`
 * markers in the array's code samples (ARCHITECTURE §5.3).
 *
 * Code line ids used: get-check, get-out-of-bounds, get (get); set-check, set-out-of-bounds,
 * set (set); push-check, push (push); grow, copy, grow-done (growing, from push and insert);
 * insert-check, insert-out-of-bounds, shift-right, insert (insert); remove-check,
 * remove-out-of-bounds, remove-read, shift-left, remove-done (removeAt); search-compare,
 * search-found, search-not-found (search); traverse-visit (traverse).
 * Caption keys: the `array.*` keys in content/captions.ts.
 */
import { config } from '@/config';

import { runTrace, type Tracer } from '../../core/tracer';
import type { Caption, ElementState, Trace } from '../../core/types';
import { describeArray } from './describe';
import {
  canGrow,
  capacity,
  grownCapacity,
  isFull,
  newItem,
  withFreshSlots,
  withMoved,
  withSlot,
  type ArrayModel,
} from './model';
import { arrayToScene, type ArrayAnnotations } from './to-scene';

export type ArrayTracer = Tracer<ArrayModel, ArrayAnnotations>;

const POINTER_LABEL = 'i';

/** The item in slot `index`. Only called for indices inside the array. */
const itemAt = (t: ArrayTracer, index: number) => t.model.slots[index]!;

/** The caption for an index outside 0 … size − 1. */
function outOfBounds(index: number, size: number): Caption {
  return size === 0
    ? { key: 'array.out-of-bounds.empty', params: { index } }
    : { key: 'array.out-of-bounds', params: { index, size, last: size - 1 } };
}

/** Checks `index` is an item's index; records the check, and the failure if it isn't. */
function checkIndex(
  t: ArrayTracer,
  index: number,
  lines: { check: string; fail: string },
  caption: Caption,
): boolean {
  t.count('comparisons');
  t.step({ line: lines.check, caption, vars: { index, size: t.model.size } });
  if (index >= 0 && index < t.model.size) return true;
  t.fail('array.out-of-bounds', outOfBounds(index, t.model.size), {
    line: lines.fail,
    annotations: { container: 'error' },
  });
  return false;
}

/** Reads the value at `index` in one step: random access. */
export function get(t: ArrayTracer, index: number): string | undefined {
  const ok = checkIndex(
    t,
    index,
    { check: 'get-check', fail: 'get-out-of-bounds' },
    { key: 'array.get.check', params: { index, size: t.model.size } },
  );
  if (!ok) return undefined;
  const item = itemAt(t, index);
  t.count('reads');
  t.step({
    line: 'get',
    caption: { key: 'array.got', params: { index, value: item.value } },
    vars: { index, value: item.value },
    annotations: {
      highlight: { [item.id]: 'active' },
      pointers: [{ label: POINTER_LABEL, index }],
    },
  });
  return item.value;
}

/** Overwrites the value at `index`, also in one step. */
export function set(t: ArrayTracer, index: number, value: string): void {
  const ok = checkIndex(
    t,
    index,
    { check: 'set-check', fail: 'set-out-of-bounds' },
    { key: 'array.set.check', params: { index, value, size: t.model.size } },
  );
  if (!ok) return;
  const old = itemAt(t, index).value;
  const [item, next] = newItem(t.model, value);
  t.update(() => withSlot(next, index, item));
  t.count('writes');
  t.step({
    line: 'set',
    caption: { key: 'array.set', params: { index, old, value } },
    vars: { index, value },
    annotations: { highlight: { [item.id]: 'new' }, pointers: [{ label: POINTER_LABEL, index }] },
  });
}

/**
 * Makes room in a full array: a new, bigger block, then each item copied across, then the old
 * block let go. Fails when the array is already as big as the app draws.
 */
function grow(t: ArrayTracer, value: string): boolean {
  const from = capacity(t.model);
  if (!canGrow(t.model)) {
    t.fail(
      'array.limit',
      { key: 'array.limit', params: { capacity: from, value } },
      { line: 'grow', annotations: { container: 'error' } },
    );
    return false;
  }

  const to = grownCapacity(t.model);
  const source = t.model.slots;
  const doubled = to === from * config.structures.array.growthFactor;
  t.update((array) => withFreshSlots(array, to));
  t.count('writes');
  t.step({
    line: 'grow',
    caption: { key: doubled ? 'array.grow' : 'array.grow.limit', params: { from, to } },
    vars: { capacity: to },
    annotations: { source },
  });

  source.forEach((item, index) => {
    if (!item) return;
    t.update((array) => withSlot(array, index, item));
    t.count('reads');
    t.count('writes');
    t.step({
      line: 'copy',
      caption: { key: 'array.copy', params: { value: item.value, index } },
      vars: { i: index },
      annotations: { source, highlight: { [item.id]: 'active' } },
    });
  });

  t.step({
    line: 'grow-done',
    caption: { key: 'array.grown', params: { count: t.model.size, capacity: to } },
    vars: { capacity: to },
  });
  return true;
}

/** Adds `value` after the last item, growing the array first when it's full. */
export function push(t: ArrayTracer, value: string): void {
  t.count('comparisons');
  t.step({
    line: 'push-check',
    caption: { key: 'array.push.check', params: { value } },
    vars: { size: t.model.size, capacity: capacity(t.model) },
  });
  if (isFull(t.model) && !grow(t, value)) return;

  const index = t.model.size;
  const [item, next] = newItem(t.model, value);
  t.update(() => ({ ...withSlot(next, index, item), size: index + 1 }));
  t.count('writes');
  t.step({
    line: 'push',
    caption: { key: 'array.pushed', params: { value, index } },
    vars: { size: t.model.size },
    annotations: { highlight: { [item.id]: 'new' } },
  });
}

/** Puts `value` at `index` (0 to size), shifting the items from there one slot right. */
export function insert(t: ArrayTracer, index: number, value: string): void {
  const size = t.model.size;
  t.count('comparisons');
  t.step({
    line: 'insert-check',
    caption: { key: 'array.insert.check', params: { index, value, size } },
    vars: { index, size },
  });
  if (index < 0 || index > size) {
    t.fail(
      'array.out-of-bounds',
      { key: 'array.insert.out-of-bounds', params: { index, size } },
      { line: 'insert-out-of-bounds', annotations: { container: 'error' } },
    );
    return;
  }
  if (isFull(t.model) && !grow(t, value)) return;

  for (let j = size - 1; j >= index; j--) {
    const moving = itemAt(t, j);
    t.update((array) => withMoved(array, j, j + 1));
    t.count('reads');
    t.count('writes');
    t.step({
      line: 'shift-right',
      caption: { key: 'array.shift-right', params: { value: moving.value, from: j, to: j + 1 } },
      vars: { j },
      annotations: { highlight: { [moving.id]: 'active' } },
    });
  }

  const shifted = size - index;
  const [item, next] = newItem(t.model, value);
  t.update(() => ({ ...withSlot(next, index, item), size: size + 1 }));
  t.count('writes');
  t.step({
    line: 'insert',
    caption: {
      key: shifted === 0 ? 'array.inserted.end' : 'array.inserted',
      params: { value, index, shifted },
    },
    vars: { index, size: t.model.size },
    annotations: { highlight: { [item.id]: 'new' } },
  });
}

/** Removes and returns the value at `index`, shifting the items after it one slot left. */
export function removeAt(t: ArrayTracer, index: number): string | undefined {
  const ok = checkIndex(
    t,
    index,
    { check: 'remove-check', fail: 'remove-out-of-bounds' },
    { key: 'array.remove.check', params: { index, size: t.model.size } },
  );
  if (!ok) return undefined;

  const size = t.model.size;
  const item = itemAt(t, index);
  t.count('reads');
  t.step({
    line: 'remove-read',
    caption: { key: 'array.remove.read', params: { index, value: item.value } },
    vars: { index, value: item.value },
    annotations: {
      highlight: { [item.id]: 'active' },
      pointers: [{ label: POINTER_LABEL, index }],
    },
  });

  const last = index === size - 1;
  t.update((array) => ({ ...withSlot(array, index, null), size: size - 1 }));
  t.step({
    line: 'remove-read',
    caption: {
      key: last ? 'array.removed.end' : 'array.removed',
      params: { index, value: item.value },
    },
    vars: { index },
  });
  if (last) return item.value;

  for (let j = index + 1; j < size; j++) {
    const moving = itemAt(t, j);
    t.update((array) => withMoved(array, j, j - 1));
    t.count('reads');
    t.count('writes');
    t.step({
      line: 'shift-left',
      caption: { key: 'array.shift-left', params: { value: moving.value, from: j, to: j - 1 } },
      vars: { j },
      annotations: { highlight: { [moving.id]: 'active' } },
    });
  }
  t.step({
    line: 'remove-done',
    caption: { key: 'array.remove.done', params: { shifted: size - 1 - index } },
    vars: { size: t.model.size },
  });
  return item.value;
}

/** Checks each item from index 0 until one equals `value`: its index, or -1. */
export function search(t: ArrayTracer, value: string): number {
  const visited: Record<string, ElementState> = {};
  for (let index = 0; index < t.model.size; index++) {
    const item = itemAt(t, index);
    t.count('comparisons');
    t.count('reads');
    if (item.value === value) {
      t.step({
        line: 'search-found',
        caption: { key: 'array.found', params: { value, index } },
        vars: { i: index },
        annotations: {
          highlight: { ...visited, [item.id]: 'found' },
          pointers: [{ label: POINTER_LABEL, index }],
        },
      });
      return index;
    }
    t.step({
      line: 'search-compare',
      caption: { key: 'array.search.compare', params: { index, item: item.value, value } },
      vars: { i: index },
      annotations: {
        highlight: { ...visited, [item.id]: 'active' },
        pointers: [{ label: POINTER_LABEL, index }],
      },
    });
    visited[item.id] = 'visited';
  }
  t.step({
    line: 'search-not-found',
    caption:
      t.model.size === 0
        ? { key: 'array.search.empty', params: { value } }
        : { key: 'array.not-found', params: { value, size: t.model.size } },
    annotations: { allItems: 'visited' },
  });
  return -1;
}

/** Visits every item once, from index 0 to the end. */
export function traverse(t: ArrayTracer): void {
  if (t.model.size === 0) {
    t.step({ caption: { key: 'array.traverse.empty' } });
    return;
  }
  const visited: Record<string, ElementState> = {};
  for (let index = 0; index < t.model.size; index++) {
    const item = itemAt(t, index);
    t.count('reads');
    t.step({
      line: 'traverse-visit',
      caption: { key: 'array.visit', params: { index, value: item.value } },
      vars: { i: index },
      annotations: {
        highlight: { ...visited, [item.id]: 'active' },
        pointers: [{ label: POINTER_LABEL, index }],
      },
    });
    visited[item.id] = 'visited';
  }
  t.step({
    caption: { key: 'array.traversed', params: { size: t.model.size } },
    annotations: { allItems: 'visited' },
  });
}

export type ArrayOperation =
  | { type: 'get'; index: number }
  | { type: 'set'; index: number; value: string }
  | { type: 'push'; value: string }
  | { type: 'insert'; index: number; value: string }
  | { type: 'removeAt'; index: number }
  | { type: 'search'; value: string }
  | { type: 'traverse' };

/** Runs one operation on `model`: the trace to play, and the array to continue from. */
export function traceArray(
  model: ArrayModel,
  operation: ArrayOperation,
): { trace: Trace<string | number | undefined>; model: ArrayModel } {
  return runTrace(
    { operation: `array.${operation.type}`, model, toScene: arrayToScene, describe: describeArray },
    (t): string | number | undefined => {
      switch (operation.type) {
        case 'get':
          return get(t, operation.index);
        case 'set':
          set(t, operation.index, operation.value);
          return undefined;
        case 'push':
          push(t, operation.value);
          return undefined;
        case 'insert':
          insert(t, operation.index, operation.value);
          return undefined;
        case 'removeAt':
          return removeAt(t, operation.index);
        case 'search':
          return search(t, operation.value);
        case 'traverse':
          traverse(t);
          return undefined;
      }
    },
  );
}
