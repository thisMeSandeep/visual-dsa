import type { Scene } from '../../core/types';
import { arrayToScene, type ArrayAnnotations, type ArrayModel } from '../../structures/array';
import type { SortAlgorithm } from './model';

/**
 * Room each sort keeps around the row, at rest too, so the drawing never resizes mid-sort:
 * selection sort's `i` points up from below, insertion sort lifts its key above the row.
 */
const LANES: Record<SortAlgorithm, ArrayAnnotations> = {
  'bubble-sort': {},
  'selection-sort': { laneBelow: true },
  'insertion-sort': { laneHeld: true },
};

/** A sort's scene builder: the array scene with the algorithm's lanes kept. */
export const sortToScene =
  (algorithm: SortAlgorithm) =>
  (model: ArrayModel, annotations: ArrayAnnotations = {}): Scene =>
    arrayToScene(model, { ...LANES[algorithm], ...annotations });
