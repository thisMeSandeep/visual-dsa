import type { ElementState, Scene, SceneElement } from '../../core/types';
import { count, formatLoad, size, type HashBucket, type HashModel } from './model';

/** Per-step highlights for a hash-table scene. */
export type HashAnnotations = {
  /** States for particular entries, by id: the one compared, found, new… */
  highlight?: Readonly<Record<string, ElementState>>;
  /** The bucket in focus: active when hashed to, collision, error when a key isn't there. */
  bucket?: { index: number; state: ElementState };
  /** Linear probing moving from one bucket to the next. */
  probe?: { from: number; to: number };
  /** A short note such as h("Sid") = 288. */
  callout?: string;
  /** The table being resized away from, while its keys are rehashed into the new one. */
  old?: readonly HashBucket[];
  /** The table itself: 'error' when a probing table is full. */
  container?: ElementState;
};

export const CALLOUT_ID = 'callout';
export const tombstoneId = (bucket: number) => `tombstone-${bucket}`;
export const TOMBSTONE_TEXT = { value: '×', detail: 'deleted' } as const;

/**
 * Hash table → scene. Entries are cells by bucket and place in the chain; a probing tombstone is
 * a dimmed cell. Bucket highlights, the probe arrow and sizes travel in meta, since the renderer
 * draws the buckets themselves.
 */
export function hashToScene(model: HashModel, annotations: HashAnnotations = {}): Scene {
  const stateOf = (id: string) => annotations.highlight?.[id] ?? 'default';
  const placed = new Set(model.buckets.flatMap((bucket) => bucket.entries.map((e) => e.id)));

  const entries: SceneElement[] = model.buckets.flatMap((bucket, index) => [
    ...bucket.entries.map((entry, chainIndex): SceneElement => ({
      kind: 'cell',
      id: entry.id,
      value: entry.key,
      detail: entry.value,
      state: stateOf(entry.id),
      slot: { type: 'bucket', bucket: index, chainIndex },
    })),
    ...(bucket.tombstone
      ? [
          {
            kind: 'cell' as const,
            id: tombstoneId(index),
            ...TOMBSTONE_TEXT,
            state: 'dimmed' as const,
            slot: { type: 'bucket' as const, bucket: index, chainIndex: 0 },
          },
        ]
      : []),
  ]);

  // While resizing: the keys still waiting in the old table.
  const waiting: SceneElement[] = (annotations.old ?? []).flatMap((bucket, index) =>
    bucket.entries
      .filter((entry) => !placed.has(entry.id))
      .map((entry, chainIndex): SceneElement => ({
        kind: 'cell',
        id: entry.id,
        value: entry.key,
        detail: entry.value,
        state: stateOf(entry.id),
        slot: { type: 'bucket', bucket: index, chainIndex, old: true },
      })),
  );

  const callout: SceneElement[] = annotations.callout
    ? [{ kind: 'callout', id: CALLOUT_ID, text: annotations.callout }]
    : [];

  const keys = count(model);
  return {
    renderer: 'hash-table',
    elements: [...entries, ...waiting, ...callout],
    meta: {
      strategy: model.strategy,
      hashFunction: model.hashFunction,
      size: size(model),
      count: keys,
      load: formatLoad(keys / size(model)),
      loadLimit: formatLoad(model.loadLimit),
      container: annotations.container ?? 'default',
      ...(annotations.bucket
        ? { bucket: annotations.bucket.index, bucketState: annotations.bucket.state }
        : {}),
      ...(annotations.probe
        ? { probeFrom: annotations.probe.from, probeTo: annotations.probe.to }
        : {}),
      ...(annotations.old ? { oldSize: annotations.old.length } : {}),
    },
  };
}
