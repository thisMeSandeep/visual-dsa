import type { ElementState, Scene, SceneElement } from '../../core/types';
import { capacity, rearSlot, tailSlot, wastedSlots, type QueueModel } from './model';

/** Per-step highlights for a queue scene. */
export type QueueAnnotations = {
  /** One item to highlight, e.g. the front being read, or a new item. */
  highlight?: { id: string; state: ElementState };
  /** Every item at once, e.g. dimmed while the queue is cleared. */
  allItems?: ElementState;
  /** A value that couldn't be enqueued (full), drawn just past the last slot. */
  rejected?: string;
  /** The row itself: 'error' when full or empty at the wrong moment. */
  container?: ElementState;
};

export const FRONT_POINTER_ID = 'pointer-front';
export const REAR_POINTER_ID = 'pointer-rear';
export const REJECTED_ID = 'rejected';

/**
 * Queue → scene. Items are cells in their slot (index slots, so a wrapped queue shows where each
 * item really sits); "front" and "rear" pointers mark the ends. Meta carries what the renderer,
 * describe() and the sandbox stats need.
 */
export function queueToScene(model: QueueModel, annotations: QueueAnnotations = {}): Scene {
  const cells: SceneElement[] = model.slots.flatMap((item, slot): SceneElement[] =>
    item
      ? [
          {
            kind: 'cell',
            id: item.id,
            value: item.value,
            state:
              annotations.highlight?.id === item.id
                ? annotations.highlight.state
                : (annotations.allItems ?? 'default'),
            slot: { type: 'index', index: slot },
          },
        ]
      : [],
  );

  const front = model.size > 0 ? model.slots[model.head] : null;
  const rearIndex = rearSlot(model);
  const rear = rearIndex === undefined ? null : model.slots[rearIndex];
  const pointers: SceneElement[] = [
    ...(front
      ? [{ kind: 'pointer' as const, id: FRONT_POINTER_ID, label: 'front', target: front.id }]
      : []),
    ...(rear
      ? [{ kind: 'pointer' as const, id: REAR_POINTER_ID, label: 'rear', target: rear.id }]
      : []),
  ];

  const rejected: SceneElement[] =
    annotations.rejected === undefined
      ? []
      : [
          {
            kind: 'cell',
            id: REJECTED_ID,
            value: annotations.rejected,
            state: 'error',
            slot: { type: 'index', index: capacity(model) },
          },
        ];

  return {
    renderer: 'queue',
    elements: [...cells, ...rejected, ...pointers],
    meta: {
      size: model.size,
      capacity: capacity(model),
      head: model.head,
      tail: tailSlot(model),
      mode: model.mode,
      wasted: wastedSlots(model),
      container: annotations.container ?? 'default',
      ...(front ? { front: front.value } : {}),
      ...(rear ? { rear: rear.value } : {}),
    },
  };
}
