import type { Scene, SceneElement } from '../../core/types';
import { tombstoneId } from './to-scene';

type Cell = Extract<SceneElement, { kind: 'cell' }>;

/**
 * Screen-reader summary of a hash-table scene (F-1105), e.g. "Hash table, 5 buckets, 3 keys,
 * load factor 0.60. Bucket 0: Ann. Bucket 3: Sid, Jim. h("Jim") = 288. Bucket 3: collision."
 */
export function describeHashTable(scene: Scene): string {
  const meta = scene.meta ?? {};
  const cells = scene.elements.filter((e): e is Cell => e.kind === 'cell');
  const size = Number(meta.size ?? 0);
  const parts = [`Hash table, ${size} buckets, ${meta.count} keys, load factor ${meta.load}.`];
  for (let bucket = 0; bucket < size; bucket++) {
    const here = cells
      .filter((c) => c.slot.type === 'bucket' && c.slot.bucket === bucket && !c.slot.old)
      .sort((a, b) => chainIndex(a) - chainIndex(b));
    if (here.length === 0) continue;
    parts.push(
      here[0]!.id === tombstoneId(bucket)
        ? `Bucket ${bucket}: tombstone.`
        : `Bucket ${bucket}: ${here.map((c) => c.value).join(', ')}.`,
    );
  }
  const waiting = cells.filter((c) => c.slot.type === 'bucket' && c.slot.old);
  if (waiting.length > 0) {
    parts.push(`Still in the old table: ${waiting.map((c) => c.value).join(', ')}.`);
  }
  const callout = scene.elements.find((e) => e.kind === 'callout');
  if (callout) parts.push(`${callout.text}.`);
  if (meta.bucket !== undefined && meta.bucketState !== 'active') {
    parts.push(`Bucket ${meta.bucket}: ${meta.bucketState}.`);
  }
  const found = cells.find((c) => c.state === 'found');
  if (found) parts.push(`Found ${found.value}.`);
  if (meta.container === 'error') parts.push('Error.');
  return parts.join(' ');
}

const chainIndex = (cell: Cell) => (cell.slot.type === 'bucket' ? cell.slot.chainIndex : 0);
