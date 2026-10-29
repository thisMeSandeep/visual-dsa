import type { ElementState, Scene, SceneElement } from '../../core/types';
import type { StackModel } from './model';

/** Per-step highlights for a stack scene. */
export type StackAnnotations = {
  /** One item to highlight, e.g. the top being read, or a new item. */
  highlight?: { id: string; state: ElementState };
  /** Every item at once, e.g. dimmed while the stack is cleared. */
  allItems?: ElementState;
  /** A value that couldn't be pushed (overflow), drawn just above the full stack. */
  rejected?: string;
  /** The container itself: 'error' on overflow / underflow. */
  container?: ElementState;
};

/** Element ids that aren't items. */
export const TOP_POINTER_ID = 'pointer-top';
export const REJECTED_ID = 'rejected';

/**
 * Stack → scene. Items are cells in index slots, bottom first; a "top" pointer marks the top.
 * Scene meta carries size, capacity, the top value and the container's state for the renderer,
 * describe() and the sandbox's stat strip.
 */
export function stackToScene(model: StackModel, annotations: StackAnnotations = {}): Scene {
  const cells: SceneElement[] = model.items.map((item, index) => ({
    kind: 'cell',
    id: item.id,
    value: item.value,
    state:
      annotations.highlight?.id === item.id
        ? annotations.highlight.state
        : (annotations.allItems ?? 'default'),
    slot: { type: 'index', index },
  }));

  const topItem = model.items.at(-1);
  const pointer: SceneElement[] = topItem
    ? [{ kind: 'pointer', id: TOP_POINTER_ID, label: 'top', target: topItem.id }]
    : [];

  const rejected: SceneElement[] =
    annotations.rejected === undefined
      ? []
      : [
          {
            kind: 'cell',
            id: REJECTED_ID,
            value: annotations.rejected,
            state: 'error',
            slot: { type: 'index', index: model.items.length },
          },
        ];

  return {
    renderer: 'stack',
    elements: [...cells, ...rejected, ...pointer],
    meta: {
      size: model.items.length,
      capacity: model.capacity,
      ...(topItem ? { top: topItem.value } : {}),
      container: annotations.container ?? 'default',
    },
  };
}
