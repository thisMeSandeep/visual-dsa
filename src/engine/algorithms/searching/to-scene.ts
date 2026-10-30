import type { ElementState, Scene } from '../../core/types';
import { arrayToScene, type ArrayModel, type ArrayPointer } from '../../structures/array';
import { isSorted } from './model';

/** Where a binary search is up to: the range still to check, and what it found. */
export type SearchState = {
  low: number;
  high: number;
  /** The index being checked. */
  mid?: number;
  /** The item at mid equals the target. */
  found?: boolean;
  /** The best answer so far, when looking for the first or last of several equal values. */
  result?: number;
};

export const LOW_LABEL = 'low';
export const MID_LABEL = 'mid';
export const HIGH_LABEL = 'high';

/**
 * Sorted array + search state → an array scene. Items outside low…high are dimmed (thrown
 * away, mid too once its half goes), mid is the item being checked, and a match or the
 * remembered answer is `found`.
 * mid points down from above; low and high mark the range from below. A pointer that has run
 * off either end (low = n, high = −1) isn't drawn. Meta carries the stats: how many items are
 * still in range, and whether the array is sorted at all.
 */
export function searchToScene(model: ArrayModel, state?: SearchState): Scene {
  const sorted = isSorted(model) ? 'yes' : 'no';
  if (!state) {
    return arrayToScene(model, { laneBelow: true, meta: { range: model.size, sorted } });
  }

  const { low, high, mid, found, result } = state;
  const highlight: Record<string, ElementState> = {};
  model.slots.forEach((item, index) => {
    if (!item) return;
    if (index === result || (index === mid && found)) highlight[item.id] = 'found';
    else if (index < low || index > high) highlight[item.id] = 'dimmed';
    else if (index === mid) highlight[item.id] = 'active';
  });

  const pointers: ArrayPointer[] = [
    ...(mid === undefined ? [] : [{ label: MID_LABEL, index: mid }]),
    { label: LOW_LABEL, index: low, side: 'below' },
    { label: HIGH_LABEL, index: high, side: 'below' },
  ];

  return arrayToScene(model, {
    highlight,
    pointers,
    laneBelow: true,
    meta: { range: Math.max(0, high - low + 1), sorted, low, high },
  });
}
