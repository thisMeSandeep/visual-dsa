/**
 * The array binary search runs on (ALGORITHM-CATALOG A1): the array structure's model, with
 * exactly one slot per value so no empty slots sit in the range. Values are numbers, compared
 * by size, not as text. It may be unsorted: the lesson shows what binary search gets wrong then.
 */
import { createArray, values, type ArrayModel } from '../../structures/array';

/** An array of `items` for binary search. Throws a RangeError for a value that isn't a number. */
export function createSortedArray(items: readonly string[] = []): ArrayModel {
  const bad = items.find((item) => !isNumber(item));
  if (bad !== undefined) throw new RangeError(`"${bad}" isn't a number`);
  return createArray(items, Math.max(items.length, 1));
}

const isNumber = (item: string) => item.trim() !== '' && Number.isFinite(Number(item));

/** Negative when a comes before b, positive when after, 0 when equal. */
export const compareValues = (a: string, b: string) => Number(a) - Number(b);

/** Whether each value is no bigger than the next. */
export function isSorted(array: ArrayModel): boolean {
  const items = values(array);
  return items.every((item, index) => index === 0 || compareValues(items[index - 1]!, item) <= 0);
}
