import type { ElementState, Scene, SceneElement } from '../../core/types';
import { nodeById, order, type ListModel } from './model';

/** Per-step highlights for a list scene. */
export type ListAnnotations = {
  /** States for particular nodes, by id: the one being visited, the new one… */
  highlight?: Readonly<Record<string, ElementState>>;
  /** Every node not in `highlight`, e.g. visited once a traversal ends. */
  allNodes?: ElementState;
  /** States for particular arrows, by id (`nextEdgeId`, `prevEdgeId`): the one just re-aimed. */
  edges?: Readonly<Record<string, ElementState>>;
  /** Walking pointers such as cur, prev and next, by label. Null ones aren't drawn. */
  pointers?: Readonly<Record<string, string | null>>;
  /** The list itself: 'error' when there's nothing to delete. */
  container?: ElementState;
};

/** What head (and tail) point at in an empty list: the `null` drawn at the end of the row. */
export const NULL_ID = 'null';

export const nextEdgeId = (nodeId: string) => `next-${nodeId}`;
export const prevEdgeId = (nodeId: string) => `prev-${nodeId}`;
export const pointerId = (label: string) => `pointer-${label}`;

/**
 * List → scene. Nodes are cells at their drawing position; each non-null next (and prev) is an
 * edge whose id belongs to the node it starts from, so re-aiming a pointer animates the arrow
 * swinging to its new node. head, tail and walking pointers are labelled pointers.
 */
export function listToScene(model: ListModel, annotations: ListAnnotations = {}): Scene {
  const cells: SceneElement[] = model.nodes.map((node, index) => ({
    kind: 'cell',
    id: node.id,
    value: node.value,
    state: annotations.highlight?.[node.id] ?? annotations.allNodes ?? 'default',
    slot: { type: 'link', index, raised: node.raised },
  }));

  const edgeState = (id: string) => annotations.edges?.[id] ?? 'default';
  const edges: SceneElement[] = model.nodes.flatMap((node): SceneElement[] => [
    ...(node.next === null
      ? []
      : [
          {
            kind: 'edge' as const,
            id: nextEdgeId(node.id),
            from: node.id,
            to: node.next,
            directed: true,
            state: edgeState(nextEdgeId(node.id)),
          },
        ]),
    ...(node.prev === null
      ? []
      : [
          {
            kind: 'edge' as const,
            id: prevEdgeId(node.id),
            from: node.id,
            to: node.prev,
            directed: true,
            state: edgeState(prevEdgeId(node.id)),
          },
        ]),
  ]);

  const ends: [string, string | null][] = [
    ['head', model.head ?? NULL_ID],
    ...(model.hasTail ? ([['tail', model.tail ?? NULL_ID]] as [string, string][]) : []),
  ];
  const walking = Object.entries(annotations.pointers ?? {}).filter(
    (entry): entry is [string, string] => entry[1] !== null,
  );
  const pointers: SceneElement[] = [...ends, ...walking].flatMap(([label, target]) =>
    target === null ? [] : [{ kind: 'pointer' as const, id: pointerId(label), label, target }],
  );

  const ordered = order(model);
  const valueOf = (id: string | null) => nodeById(model, id)?.value;
  const head = valueOf(model.head);
  const tail = model.hasTail ? valueOf(model.tail) : undefined;
  return {
    renderer: 'linked-list',
    elements: [...cells, ...edges, ...pointers],
    meta: {
      kind: model.kind,
      // Nodes in the row: mid-reverse, fewer are reachable from head, but none are gone.
      size: model.nodes.filter((node) => !node.raised).length,
      values: ordered.map((id) => valueOf(id)).join(', '),
      container: annotations.container ?? 'default',
      ...(head === undefined ? {} : { head }),
      ...(tail === undefined ? {} : { tail }),
    },
  };
}
