import type { Scene, SceneElement } from '../../core/types';

type Cell = Extract<SceneElement, { kind: 'cell' }>;

/**
 * Screen-reader summary of an array scene (F-1105), e.g.
 * "Array of 3 items, 4 slots: 23, 8, 42. i at index 1.", naming every pointer.
 */
export function describeArray(scene: Scene): string {
  const meta = scene.meta ?? {};
  const cells = scene.elements.filter((e): e is Cell => e.kind === 'cell');
  const inRow = (type: 'index' | 'source') =>
    cells
      .filter((cell) => cell.slot.type === type)
      .sort((a, b) => indexOf(a) - indexOf(b))
      .map((cell) => cell.value);

  const items = inRow('index');
  const capacity = Number(meta.capacity ?? 0);
  const parts = [
    items.length === 0
      ? `Empty array, ${capacity} slots.`
      : `Array of ${items.length} ${items.length === 1 ? 'item' : 'items'}, ${capacity} slots: ${items.join(', ')}.`,
  ];
  if (meta.sourceCapacity !== undefined) {
    parts.push(
      `Copying from the old array of ${meta.sourceCapacity} slots: ${inRow('source').join(', ')}.`,
    );
  }
  for (const pointer of scene.elements) {
    if (pointer.kind !== 'pointer') continue;
    const pointed = cells.find((cell) => cell.id === pointer.target);
    if (pointed) parts.push(`${pointer.label} at index ${indexOf(pointed)}.`);
  }
  const found = cells.find((cell) => cell.state === 'found');
  if (found) parts.push(`Found ${found.value} at index ${indexOf(found)}.`);
  if (meta.container === 'error') parts.push('Error.');
  return parts.join(' ');
}

const indexOf = (cell: Cell) =>
  cell.slot.type === 'index' || cell.slot.type === 'source' ? cell.slot.index : 0;
