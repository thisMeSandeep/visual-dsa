/**
 * Linked lists (ALGORITHM-CATALOG L2, L3): nodes joined by pointers, singly (`next` only) or
 * doubly (`next` and `prev`). Plain immutable data plus pure functions; operations.ts changes
 * one pointer per step, the way the code does.
 *
 * `nodes` is the drawing order, left to right. It's separate from the pointers so a step can
 * re-aim an arrow without anything moving (reversing a list flips arrows in place); `tidied`
 * then redraws the row in list order. A `raised` node is drawn above the row while it's being
 * linked in or out.
 */
import { config } from '@/config';

export type ListKind = 'singly' | 'doubly';

export type ListNode = Readonly<{
  /** Stable across steps so the canvas can animate this exact node (never reused). */
  id: string;
  value: string;
  next: string | null;
  /** Doubly linked lists only; always null in a singly linked list. */
  prev: string | null;
  raised: boolean;
}>;

export type ListModel = Readonly<{
  kind: ListKind;
  nodes: readonly ListNode[];
  head: string | null;
  /** Null when empty, or when the list keeps no tail pointer. */
  tail: string | null;
  /** Whether the list keeps a tail pointer. Doubly linked lists always do. */
  hasTail: boolean;
  /** Next node id number; only ever grows. */
  nextId: number;
}>;

const { maxItems } = config.engine;

export const nodeId = (n: number) => `node-${n}`;

export const nodeById = (list: ListModel, id: string | null): ListNode | undefined =>
  id === null ? undefined : list.nodes.find((node) => node.id === id);

/** Node ids from the head, following next. Stops at a repeat, so it always ends. */
export function order(list: ListModel): string[] {
  const ids: string[] = [];
  let id = list.head;
  while (id !== null && !ids.includes(id) && ids.length < list.nodes.length) {
    ids.push(id);
    id = nodeById(list, id)?.next ?? null;
  }
  return ids;
}

/** Values from head to tail. */
export const values = (list: ListModel): string[] =>
  order(list).map((id) => nodeById(list, id)!.value);

export const size = (list: ListModel) => order(list).length;

/** The last node, found by following next from the head. */
export const lastNode = (list: ListModel): ListNode | undefined =>
  nodeById(list, order(list).at(-1) ?? null);

/** The first node holding `value`, from the head. */
export const findNode = (list: ListModel, value: string): ListNode | undefined =>
  order(list)
    .map((id) => nodeById(list, id)!)
    .find((node) => node.value === value);

export function createList(
  items: readonly string[] = [],
  options: { kind?: ListKind; hasTail?: boolean } = {},
): ListModel {
  const kind = options.kind ?? 'singly';
  const hasTail = kind === 'doubly' || (options.hasTail ?? false);
  if (items.length > maxItems) {
    throw new RangeError(`A list here holds at most ${maxItems} nodes, got ${items.length}`);
  }
  const ids = items.map((_, index) => nodeId(index));
  const nodes = items.map((value, index): ListNode => ({
    id: ids[index]!,
    value,
    next: ids[index + 1] ?? null,
    prev: kind === 'doubly' ? (ids[index - 1] ?? null) : null,
    raised: false,
  }));
  return {
    kind,
    nodes,
    head: ids[0] ?? null,
    tail: hasTail ? (ids.at(-1) ?? null) : null,
    hasTail,
    nextId: items.length,
  };
}

/** The list with node `id` changed. */
export function withNode(
  list: ListModel,
  id: string,
  change: Partial<Omit<ListNode, 'id'>>,
): ListModel {
  return {
    ...list,
    nodes: list.nodes.map((node) => (node.id === id ? { ...node, ...change } : node)),
  };
}

/** A new raised node for `value`, drawn at row position `at`, linked to nothing yet. */
export function withNewNode(list: ListModel, value: string, at: number): [ListNode, ListModel] {
  const node: ListNode = {
    id: nodeId(list.nextId),
    value,
    next: null,
    prev: null,
    raised: true,
  };
  const nodes = [...list.nodes];
  nodes.splice(at, 0, node);
  return [node, { ...list, nodes, nextId: list.nextId + 1 }];
}

/** Drawing position of node `id`. */
export const positionOf = (list: ListModel, id: string) =>
  list.nodes.findIndex((node) => node.id === id);

/** The list without node `id` (it's unreachable: nothing points to it any more). */
export const without = (list: ListModel, id: string): ListModel => ({
  ...list,
  nodes: list.nodes.filter((node) => node.id !== id),
});

/** The row redrawn in list order from the head, nothing raised. */
export function tidied(list: ListModel): ListModel {
  const ids = order(list);
  const linked = ids.map((id) => ({ ...nodeById(list, id)!, raised: false }));
  const loose = list.nodes.filter((node) => !ids.includes(node.id));
  return { ...list, nodes: [...linked, ...loose] };
}
