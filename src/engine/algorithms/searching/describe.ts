import type { Scene } from '../../core/types';
import { describeArray } from '../../structures/array';

/**
 * Screen-reader summary of a binary search scene (F-1105): the array and its pointers, then the
 * range left, e.g. "… mid at index 3. low at index 0. high at index 7. Searching index 0 to 7."
 */
export function describeSearch(scene: Scene): string {
  const meta = scene.meta ?? {};
  const parts = [describeArray(scene)];
  if (meta.sorted === 'no') parts.push('Not sorted.');
  if (meta.low !== undefined && meta.high !== undefined) {
    parts.push(
      Number(meta.range) > 0
        ? `Searching index ${meta.low} to ${meta.high}.`
        : 'Nothing left to search.',
    );
  }
  return parts.join(' ');
}
