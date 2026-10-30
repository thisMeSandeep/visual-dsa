/**
 * The array the simple sorts work on (ALGORITHM-CATALOG A2–A4): the array structure's model,
 * one slot per value. Values are numbers, compared by size. A value may carry a letter tag,
 * written "5a", to tell equal values apart when a lesson shows whether a sort is stable.
 */
import {
  createArray,
  values,
  withSlot,
  type ArrayItem,
  type ArrayModel,
} from '../../structures/array';

/** The sorts that work on the array in place (merge sort has its own model: merge.ts). */
export type SortAlgorithm = 'bubble-sort' | 'selection-sort' | 'insertion-sort' | 'quick-sort';
export const SORT_ALGORITHMS: readonly SortAlgorithm[] = [
  'bubble-sort',
  'selection-sort',
  'insertion-sort',
  'quick-sort',
];

const TAGGED = /^(\d+)([a-z])?$/;

/** An array of `items` to sort. Throws a RangeError for one that isn't a number, like "5" or "5a". */
export function createSortArray(items: readonly string[] = []): ArrayModel {
  const parsed = items.map((item) => {
    const match = TAGGED.exec(item.trim());
    if (!match) throw new RangeError(`"${item}" isn't a number`);
    return { value: String(Number(match[1])), tag: match[2] };
  });
  const array = createArray(
    parsed.map((item) => item.value),
    Math.max(items.length, 1),
  );
  return parsed.reduce(
    (model, { tag }, index) =>
      tag === undefined ? model : withSlot(model, index, { ...model.slots[index]!, tag }),
    array,
  );
}

/** Negative when a sorts before b, positive when after, 0 when equal (tags don't count). */
export const compareItems = (a: ArrayItem, b: ArrayItem) => Number(a.value) - Number(b.value);

/** How an item is named in captions: its value, plus its tag if it has one ("5a"). */
export const itemLabel = (item: ArrayItem) => `${item.value}${item.tag ?? ''}`;

/** The items in slots i and j trade places. */
export function withSwapped(array: ArrayModel, i: number, j: number): ArrayModel {
  return withSlot(withSlot(array, i, array.slots[j] ?? null), j, array.slots[i] ?? null);
}

/** Whether each value is no bigger than the next. */
export function isSortedArray(array: ArrayModel): boolean {
  const items = values(array).map(Number);
  return items.every((item, index) => index === 0 || items[index - 1]! <= item);
}
