/**
 * The queue itself (ALGORITHM-CATALOG L6): a fixed row of slots, the index of the front item
 * and how many items there are. Plain immutable data plus pure functions; operations.ts adds
 * the steps a learner sees.
 *
 * Two modes, so the lesson can compare them:
 * - `circular` (the real thing): the rear wraps round to slot 0, so every slot is reused.
 * - `naive` (a plain array): the front only moves forward, so slots before it are wasted and the
 *   queue is full once the rear reaches the last slot.
 */
import { config } from '@/config';

export type QueueItem = Readonly<{
  /** Stable across steps so the canvas can animate this exact item (never reused). */
  id: string;
  value: string;
}>;

export type QueueMode = 'circular' | 'naive';

export type QueueModel = Readonly<{
  /** One entry per slot; null is an empty slot. */
  slots: readonly (QueueItem | null)[];
  /** Slot of the front item (where the next front will be when empty). */
  head: number;
  size: number;
  mode: QueueMode;
  /** Next item id number; only ever grows. */
  nextId: number;
}>;

export const itemId = (n: number) => `item-${n}`;

export const capacity = (queue: QueueModel) => queue.slots.length;
export const isEmpty = (queue: QueueModel) => queue.size === 0;

/** The slot the next item goes into. In naive mode it can run off the end. */
export function tailSlot(queue: QueueModel): number {
  const raw = queue.head + queue.size;
  return queue.mode === 'circular' ? raw % capacity(queue) : raw;
}

/** Slot of the rear item, or undefined when empty. */
export function rearSlot(queue: QueueModel): number | undefined {
  if (isEmpty(queue)) return undefined;
  const raw = queue.head + queue.size - 1;
  return queue.mode === 'circular' ? raw % capacity(queue) : raw;
}

/** Full when every slot holds an item, or (naive) when the rear has reached the last slot. */
export const isFull = (queue: QueueModel) =>
  queue.size >= capacity(queue) || tailSlot(queue) >= capacity(queue);

/** Empty slots a plain array can't use any more: the ones before the front. */
export const wastedSlots = (queue: QueueModel) => (queue.mode === 'naive' ? queue.head : 0);

/** Items from front to rear. */
export function itemsInOrder(queue: QueueModel): QueueItem[] {
  return Array.from({ length: queue.size }, (_, offset) => {
    const slot = (queue.head + offset) % capacity(queue);
    return queue.slots[slot];
  }).filter((item): item is QueueItem => item !== null && item !== undefined);
}

export function createQueue(
  values: readonly string[] = [],
  slots: number = config.structures.queue.defaultCapacity,
  options: { head?: number; mode?: QueueMode } = {},
): QueueModel {
  const { head = 0, mode = 'circular' } = options;
  if (!Number.isInteger(slots) || slots < 1 || slots > config.engine.maxItems) {
    throw new RangeError(`Queue capacity must be 1–${config.engine.maxItems}, got ${slots}`);
  }
  if (!Number.isInteger(head) || head < 0 || head >= slots) {
    throw new RangeError(`The front must be a slot from 0 to ${slots - 1}, got ${head}`);
  }
  const fits = mode === 'circular' ? slots : slots - head;
  if (values.length > fits) {
    throw new RangeError(`${values.length} values don't fit from slot ${head} of ${slots}`);
  }
  const filled: (QueueItem | null)[] = Array.from({ length: slots }, () => null);
  values.forEach((value, index) => {
    filled[(head + index) % slots] = { id: itemId(index), value };
  });
  return { slots: filled, head, size: values.length, mode, nextId: values.length };
}

/** The queue with `value` at the rear. Callers check isFull first. */
export function withEnqueued(queue: QueueModel, value: string): QueueModel {
  const slots = [...queue.slots];
  slots[tailSlot(queue)] = { id: itemId(queue.nextId), value };
  return { ...queue, slots, size: queue.size + 1, nextId: queue.nextId + 1 };
}

/** The queue without its front item. Callers check isEmpty first. */
export function withDequeued(queue: QueueModel): QueueModel {
  const slots = [...queue.slots];
  slots[queue.head] = null;
  const next = queue.head + 1;
  return {
    ...queue,
    slots,
    head: queue.mode === 'circular' ? next % capacity(queue) : next,
    size: queue.size - 1,
  };
}

/** Every item gone, the front back at slot 0. */
export function emptied(queue: QueueModel): QueueModel {
  return { ...queue, slots: queue.slots.map(() => null), head: 0, size: 0 };
}
