/**
 * The stack itself: plain immutable data plus pure functions. No tracing here; operations.ts
 * wraps these with the steps a learner sees.
 */
import { config } from '@/config';

export type StackItem = Readonly<{
  /** Stable across steps so the canvas can animate this exact item (never reused). */
  id: string;
  /** What's drawn in the cell: a number, a bracket, a web address. */
  value: string;
}>;

export type StackModel = Readonly<{
  /** Bottom first, top last. */
  items: readonly StackItem[];
  capacity: number;
  /** Next item id number; only ever grows, so a popped item's id is never reused. */
  nextId: number;
}>;

export function createStack(
  values: readonly string[] = [],
  capacity: number = config.structures.stack.defaultCapacity,
): StackModel {
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > config.engine.maxItems) {
    throw new RangeError(`Stack capacity must be 1–${config.engine.maxItems}, got ${capacity}`);
  }
  if (values.length > capacity) {
    throw new RangeError(`${values.length} values don't fit a stack of capacity ${capacity}`);
  }
  return {
    items: values.map((value, index) => ({ id: itemId(index), value })),
    capacity,
    nextId: values.length,
  };
}

export const itemId = (n: number) => `item-${n}`;

export const size = (stack: StackModel) => stack.items.length;
export const isEmpty = (stack: StackModel) => stack.items.length === 0;
export const isFull = (stack: StackModel) => stack.items.length >= stack.capacity;
export const top = (stack: StackModel): StackItem | undefined => stack.items.at(-1);

/** The stack with `value` on top. Callers check isFull first. */
export function withPushed(stack: StackModel, value: string): StackModel {
  return {
    ...stack,
    items: [...stack.items, { id: itemId(stack.nextId), value }],
    nextId: stack.nextId + 1,
  };
}

/** The stack without its top item. Callers check isEmpty first. */
export function withoutTop(stack: StackModel): StackModel {
  return { ...stack, items: stack.items.slice(0, -1) };
}

export function emptied(stack: StackModel): StackModel {
  return { ...stack, items: [] };
}
