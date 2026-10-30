import type { Scene, SceneElement } from '../../core/types';
import { describeArray } from '../../structures/array';

type Cell = Extract<SceneElement, { kind: 'cell' }>;

/**
 * Screen-reader summary of a sort scene (F-1105): the array and its pointers, then what's
 * happening, e.g. "… Swapping 8 and 3. 2 of 6 sorted." or "… Holding 4 above index 2."
 */
export function describeSort(scene: Scene): string {
  const cells = scene.elements.filter((e): e is Cell => e.kind === 'cell');
  const row = cells.filter((cell) => cell.slot.type === 'index');
  const parts = [describeArray(scene)];
  const swapping = row.filter((cell) => cell.state === 'swapping').map((cell) => cell.value);
  if (swapping.length === 2) parts.push(`Swapping ${swapping[0]} and ${swapping[1]}.`);
  const held = cells.find((cell) => cell.slot.type === 'held');
  if (held?.slot.type === 'held')
    parts.push(`Holding ${held.value} above index ${held.slot.index}.`);
  const sorted = row.filter((cell) => cell.state === 'sorted').length;
  if (sorted > 0) parts.push(`${sorted} of ${row.length + (held ? 1 : 0)} sorted.`);
  return parts.join(' ');
}
