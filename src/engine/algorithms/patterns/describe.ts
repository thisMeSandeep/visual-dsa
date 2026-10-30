import type { Scene } from '../../core/types';
import { describeArray } from '../../structures/array';

/**
 * Screen-reader summary of a two-pointer or sliding-window scene (F-1105): the array and its
 * pointers, then the running numbers the meta carries, e.g. "… Sum 8. Best 9. Deque: 6, 4."
 */
export function describePattern(scene: Scene): string {
  const meta = scene.meta ?? {};
  const parts = [describeArray(scene)];
  if (meta.k !== undefined) parts.push(`Window size ${meta.k}.`);
  if (meta.sum !== undefined) parts.push(`Sum ${meta.sum}.`);
  if (meta.window !== undefined) parts.push(`Window length ${meta.window}.`);
  if (meta.best !== undefined) parts.push(`Best ${meta.best}.`);
  if (typeof meta.deque === 'string') {
    parts.push(meta.deque === '–' ? 'Deque empty.' : `Deque: ${meta.deque}.`);
  }
  return parts.join(' ');
}
