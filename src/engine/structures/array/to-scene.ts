import type { ElementState, Scene, SceneElement } from '../../core/types';
import { capacity, type ArrayItem, type ArrayModel } from './model';

/** Per-step highlights for an array scene. */
export type ArrayAnnotations = {
  /** States for particular items, by id: the one being read, moved, found… */
  highlight?: Readonly<Record<string, ElementState>>;
  /** Every item not in `highlight`, e.g. visited once a traversal ends. */
  allItems?: ElementState;
  /**
   * Labelled pointers at items: "i" during a linear search, or binary search's low, mid and
   * high (low and high drawn below the row). A pointer at an index with no item isn't drawn.
   */
  pointers?: readonly ArrayPointer[];
  /** The old array's slots while the items are copied into the new, bigger one. */
  source?: readonly (ArrayItem | null)[];
  /** The array itself: 'error' when an index is out of bounds or it can't grow. */
  container?: ElementState;
  /**
   * Keeps room under the row for `below` pointers even while none are shown, so the drawing
   * doesn't change size when they appear (binary search).
   */
  laneBelow?: boolean;
  /** Extra facts for the stat strip and describe(), e.g. how much of a search range is left. */
  meta?: Readonly<Record<string, number | string>>;
};

export type ArrayPointer = { label: string; index: number; side?: 'below' };

/** Each pointer's element id, from its label, so a pointer keeps its id as it moves. */
export const pointerId = (label: string) => `pointer-${label}`;
/** Prefix for an old-array cell whose item has already been copied: what's left behind. */
export const COPIED_PREFIX = 'copied:';

/**
 * Array → scene. Items are cells in their slot; while the array grows, the old array's items
 * sit in `source` slots and move down one by one as they're copied, leaving a dimmed copy
 * behind. Meta carries what the renderer, describe() and the sandbox stats need.
 */
export function arrayToScene(model: ArrayModel, annotations: ArrayAnnotations = {}): Scene {
  const stateOf = (item: ArrayItem) =>
    annotations.highlight?.[item.id] ?? annotations.allItems ?? 'default';

  const cells: SceneElement[] = model.slots.flatMap((item, index): SceneElement[] =>
    item
      ? [
          {
            kind: 'cell',
            id: item.id,
            value: item.value,
            state: stateOf(item),
            slot: { type: 'index', index },
          },
        ]
      : [],
  );

  const placed = new Set(model.slots.flatMap((item) => (item ? [item.id] : [])));
  const source: SceneElement[] = (annotations.source ?? []).flatMap(
    (item, index): SceneElement[] => {
      if (!item) return [];
      const copied = placed.has(item.id);
      return [
        {
          kind: 'cell',
          id: copied ? `${COPIED_PREFIX}${item.id}` : item.id,
          value: item.value,
          state: copied ? 'dimmed' : 'default',
          slot: { type: 'source', index },
        },
      ];
    },
  );

  const pointers: SceneElement[] = (annotations.pointers ?? []).flatMap(
    ({ label, index, side }): SceneElement[] => {
      const target = model.slots[index];
      if (!target) return [];
      return [
        { kind: 'pointer', id: pointerId(label), label, target: target.id, ...(side && { side }) },
      ];
    },
  );

  return {
    renderer: 'array',
    elements: [...cells, ...source, ...pointers],
    meta: {
      size: model.size,
      capacity: capacity(model),
      container: annotations.container ?? 'default',
      ...(annotations.source ? { sourceCapacity: annotations.source.length } : {}),
      ...(model.addresses
        ? { addressBase: model.addresses.base, addressStride: model.addresses.stride }
        : {}),
      ...(annotations.laneBelow ? { laneBelow: 1 } : {}),
      ...annotations.meta,
    },
  };
}
