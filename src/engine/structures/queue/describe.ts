import type { Scene, SceneElement } from '../../core/types';
import { REJECTED_ID } from './to-scene';

/**
 * Screen-reader summary of a queue scene (F-1105), e.g.
 * "Queue of 3 items, 6 slots. Front: 23. Rear: 42. Front to rear: 23, 8, 42."
 */
export function describeQueue(scene: Scene): string {
  const meta = scene.meta ?? {};
  const cells = scene.elements.filter(
    (e): e is Extract<SceneElement, { kind: 'cell' }> => e.kind === 'cell' && e.id !== REJECTED_ID,
  );
  const capacity = Number(meta.capacity ?? 0);
  const head = Number(meta.head ?? 0);
  // Front to rear: slots in order starting at the front, wrapping round.
  const order = (slot: number) => (slot - head + capacity) % Math.max(capacity, 1);
  const values = [...cells]
    .sort((a, b) =>
      a.slot.type === 'index' && b.slot.type === 'index'
        ? order(a.slot.index) - order(b.slot.index)
        : 0,
    )
    .map((cell) => cell.value);

  const parts =
    values.length === 0
      ? [`Empty queue, ${capacity} slots.`]
      : [
          `Queue of ${values.length} ${values.length === 1 ? 'item' : 'items'}, ${capacity} slots.`,
          `Front: ${values[0]}. Rear: ${values.at(-1)}.`,
          `Front to rear: ${values.join(', ')}.`,
        ];
  const wasted = Number(meta.wasted ?? 0);
  if (wasted > 0)
    parts.push(`${wasted} ${wasted === 1 ? 'slot' : 'slots'} at the start can’t be reused.`);
  const rejected = scene.elements.find((e) => e.id === REJECTED_ID);
  if (rejected?.kind === 'cell') parts.push(`${rejected.value} does not fit.`);
  if (meta.container === 'error') parts.push('Error.');
  return parts.join(' ');
}
