/**
 * The array itself (ALGORITHM-CATALOG L1): a block of slots, the first `size` of them in use.
 * It's a dynamic array, so a full one grows (operations.ts traces the copy). Plain immutable
 * data plus pure functions; operations.ts adds the steps a learner sees.
 *
 * Slots, not a plain list of items, so a shift can show the gap it leaves for a moment.
 */
import { config } from '@/config';

export type ArrayItem = Readonly<{
  /** Stable across steps so the canvas can animate this exact item (never reused). */
  id: string;
  value: string;
  /** Tells equal values apart, e.g. the a and b of two 5s when showing a sort is unstable. */
  tag?: string;
}>;

/** Memory addresses to show under the indices: slot i is at base + i × stride. */
export type ArrayAddresses = Readonly<{ base: number; stride: number }>;

export type ArrayModel = Readonly<{
  /** One entry per slot (the capacity); null is a free slot. */
  slots: readonly (ArrayItem | null)[];
  /** Items in use, in slots 0 to size − 1 (between the steps of a shift there's a gap). */
  size: number;
  /** Next item id number; only ever grows. */
  nextId: number;
  addresses?: ArrayAddresses;
}>;

const { maxItems } = config.engine;

export const itemId = (n: number) => `item-${n}`;

export const capacity = (array: ArrayModel) => array.slots.length;
export const isFull = (array: ArrayModel) => array.size >= capacity(array);

/** Values in index order. */
export const values = (array: ArrayModel): string[] =>
  array.slots.flatMap((item) => (item ? [item.value] : []));

/** The capacity a full array grows to: growthFactor times bigger, at most maxItems. */
export const grownCapacity = (array: ArrayModel) =>
  Math.min(capacity(array) * config.structures.array.growthFactor, maxItems);

/** Whether a full array can still grow. */
export const canGrow = (array: ArrayModel) => capacity(array) < maxItems;

export function createArray(
  items: readonly string[] = [],
  slots: number = Math.max(items.length, config.structures.array.defaultCapacity),
  options: { addresses?: ArrayAddresses } = {},
): ArrayModel {
  if (!Number.isInteger(slots) || slots < 1 || slots > maxItems) {
    throw new RangeError(`Array capacity must be 1–${maxItems}, got ${slots}`);
  }
  if (items.length > slots) {
    throw new RangeError(`${items.length} values don't fit in ${slots} slots`);
  }
  const filled = Array.from({ length: slots }, (_, index): ArrayItem | null =>
    index < items.length ? { id: itemId(index), value: items[index]! } : null,
  );
  return {
    slots: filled,
    size: items.length,
    nextId: items.length,
    ...(options.addresses ? { addresses: options.addresses } : {}),
  };
}

/** The array with `item` (or nothing) in slot `index`. */
export function withSlot(array: ArrayModel, index: number, item: ArrayItem | null): ArrayModel {
  const slots = [...array.slots];
  slots[index] = item;
  return { ...array, slots };
}

/** A new item for `value`, and the array that has used up its id. */
export function newItem(array: ArrayModel, value: string): [ArrayItem, ArrayModel] {
  return [
    { id: itemId(array.nextId), value },
    { ...array, nextId: array.nextId + 1 },
  ];
}

/** The item in slot `from` moved to slot `to`, leaving `from` free. */
export function withMoved(array: ArrayModel, from: number, to: number): ArrayModel {
  return withSlot(withSlot(array, to, array.slots[from] ?? null), from, null);
}

/** An empty block of `slots` slots, keeping the items' ids counting on (the start of a grow). */
export const withFreshSlots = (array: ArrayModel, slots: number): ArrayModel => ({
  ...array,
  slots: Array.from({ length: slots }, () => null),
});
