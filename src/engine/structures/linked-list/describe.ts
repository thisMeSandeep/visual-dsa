import type { Scene, SceneElement } from '../../core/types';

type Cell = Extract<SceneElement, { kind: 'cell' }>;

/**
 * Screen-reader summary of a list scene (F-1105), e.g.
 * "Singly linked list of 3 nodes, head to tail: 12, 7, 30. cur at 7."
 */
export function describeList(scene: Scene): string {
  const meta = scene.meta ?? {};
  const kind = meta.kind === 'doubly' ? 'Doubly' : 'Singly';
  const count = Number(meta.size ?? 0);
  const parts = [
    count === 0
      ? `Empty ${kind.toLowerCase()} linked list: head is null.`
      : `${kind} linked list of ${count} ${count === 1 ? 'node' : 'nodes'}. From the head: ${meta.values}.`,
  ];
  const cells = scene.elements.filter((e): e is Cell => e.kind === 'cell');
  const loose = cells.filter((cell) => cell.slot.type === 'link' && cell.slot.raised);
  if (loose.length > 0)
    parts.push(`Being linked in or out: ${loose.map((c) => c.value).join(', ')}.`);
  for (const pointer of scene.elements) {
    if (pointer.kind !== 'pointer' || pointer.label === 'head' || pointer.label === 'tail')
      continue;
    const target = cells.find((cell) => cell.id === pointer.target);
    if (target) parts.push(`${pointer.label} at ${target.value}.`);
  }
  const found = cells.find((cell) => cell.state === 'found');
  if (found) parts.push(`Found ${found.value}.`);
  if (meta.container === 'error') parts.push('Error.');
  return parts.join(' ');
}
