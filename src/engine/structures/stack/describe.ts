import type { Scene, SceneElement } from '../../core/types';
import { REJECTED_ID } from './to-scene';

/**
 * Screen-reader summary of a stack scene (F-1105), e.g.
 * "Stack of 3 items, capacity 8. Top: 42. Bottom to top: 23, 8, 42."
 */
export function describeStack(scene: Scene): string {
  const values = scene.elements
    .filter(
      (element): element is Extract<SceneElement, { kind: 'cell' }> =>
        element.kind === 'cell' && element.id !== REJECTED_ID && element.slot.type === 'index',
    )
    .map((cell) => cell.value);
  const capacity = scene.meta?.capacity;
  const rejected = scene.elements.find((element) => element.id === REJECTED_ID);

  const parts =
    values.length === 0
      ? [`Empty stack, capacity ${capacity}.`]
      : [
          `Stack of ${values.length} ${values.length === 1 ? 'item' : 'items'}, capacity ${capacity}.`,
          `Top: ${values.at(-1)}.`,
          `Bottom to top: ${values.join(', ')}.`,
        ];

  if (rejected?.kind === 'cell') parts.push(`${rejected.value} does not fit.`);
  if (scene.meta?.container === 'error') parts.push('Error.');

  return parts.join(' ');
}
