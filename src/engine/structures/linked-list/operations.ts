/**
 * Linked-list operations with tracing (ALGORITHM-CATALOG L2, L3). Each step changes one pointer
 * (or one pair, in a doubly linked list), the way the code does. Code line ids must match the
 * `@line` markers in each topic's code samples (ARCHITECTURE §5.3).
 *
 * Code line ids used: head-create, head-link, head-link-back, head-move (insertHead);
 * tail-create, tail-empty, walk, tail-link, tail-link-back, tail-move (insertTail);
 * search-compare, search-found, search-not-found (search, and finding a node to insert by);
 * after-not-found, after-create, after-link, after-relink (insertAfter); before-not-found,
 * before-create, before-link, before-relink (insertBefore); delete-find, delete-not-found,
 * unlink-head, unlink, unlink-forward, unlink-back (delete); traverse-visit (traverse);
 * back-visit (traverseBackward); reverse-save, reverse-flip, reverse-advance, reverse-head
 * (reverse). Caption keys: the `list.*` keys in content/captions.ts.
 */
import { runTrace, type Tracer } from '../../core/tracer';
import type { Caption, ElementState, Trace } from '../../core/types';
import { describeList } from './describe';
import {
  nodeById,
  order,
  positionOf,
  tidied,
  withNewNode,
  withNode,
  without,
  type ListModel,
  type ListNode,
} from './model';
import { listToScene, nextEdgeId, prevEdgeId, type ListAnnotations } from './to-scene';

export type ListTracer = Tracer<ListModel, ListAnnotations>;

const NULL_TEXT = 'null';

const valueOf = (t: ListTracer, id: string | null) => nodeById(t.model, id)?.value ?? NULL_TEXT;
const doubly = (t: ListTracer) => t.model.kind === 'doubly';

/** Adds a raised node for `value` at row position `at`, with a "new node" step. */
function create(t: ListTracer, value: string, at: number, line: string, caption: Caption) {
  const [node, next] = withNewNode(t.model, value, at);
  t.update(() => next);
  t.count('writes');
  t.step({ line, caption, annotations: { highlight: { [node.id]: 'new' } } });
  return node;
}

/**
 * Walks from the head until a node holds `value`, one step per node. Returns it, or ends the
 * trace with `missing` when there's no such node (or a plain step when `missing` isn't given).
 */
function find(
  t: ListTracer,
  value: string,
  missing?: { line: string; caption: Caption },
): ListNode | undefined {
  const visited: Record<string, ElementState> = {};
  for (const id of order(t.model)) {
    const node = nodeById(t.model, id)!;
    t.count('comparisons');
    t.count('reads');
    if (node.value === value) {
      t.step({
        line: 'search-found',
        caption: { key: 'list.search.found', params: { value } },
        annotations: { highlight: { ...visited, [id]: 'found' }, pointers: { cur: id } },
      });
      return node;
    }
    t.step({
      line: 'search-compare',
      caption: { key: 'list.search.compare', params: { value, current: node.value } },
      annotations: { highlight: { ...visited, [id]: 'active' }, pointers: { cur: id } },
    });
    visited[id] = 'visited';
  }
  if (missing) {
    t.fail('list.not-found', missing.caption, {
      line: missing.line,
      annotations: { allNodes: 'visited', container: 'error' },
    });
  } else {
    t.step({
      line: 'search-not-found',
      caption:
        t.model.head === null
          ? { key: 'list.search.empty', params: { value } }
          : { key: 'list.search.not-found', params: { value } },
      annotations: { allNodes: 'visited' },
    });
  }
  return undefined;
}

/** Puts `value` in front of the head: O(1), whatever the length. */
export function insertHead(t: ListTracer, value: string): void {
  const node = create(t, value, 0, 'head-create', { key: 'list.create', params: { value } });
  const oldHead = t.model.head;
  if (oldHead !== null) {
    t.update((list) => withNode(list, node.id, { next: oldHead }));
    t.count('writes');
    t.step({
      line: 'head-link',
      caption: { key: 'list.head.link', params: { head: valueOf(t, oldHead) } },
      annotations: {
        highlight: { [node.id]: 'new' },
        edges: { [nextEdgeId(node.id)]: 'active' },
      },
    });
    if (doubly(t)) {
      t.update((list) => withNode(list, oldHead, { prev: node.id }));
      t.count('writes');
      t.step({
        line: 'head-link-back',
        caption: { key: 'list.head.link-back', params: { head: valueOf(t, oldHead) } },
        annotations: {
          highlight: { [node.id]: 'new' },
          edges: { [prevEdgeId(oldHead)]: 'active' },
        },
      });
    }
  }
  t.update((list) =>
    tidied({
      ...list,
      head: node.id,
      tail: list.hasTail && list.tail === null ? node.id : list.tail,
    }),
  );
  t.count('writes');
  t.step({
    line: 'head-move',
    caption:
      oldHead === null ? { key: 'list.first', params: { value } } : { key: 'list.head.moved' },
    annotations: { highlight: { [node.id]: 'new' } },
  });
}

/** Adds `value` after the last node: O(1) with a tail pointer, a walk without one. */
export function insertTail(t: ListTracer, value: string): void {
  const node = create(t, value, t.model.nodes.length, 'tail-create', {
    key: 'list.create',
    params: { value },
  });
  if (t.model.head === null) {
    t.update((list) => tidied({ ...list, head: node.id, tail: list.hasTail ? node.id : null }));
    t.count('writes');
    t.step({
      line: 'tail-empty',
      caption: { key: 'list.first', params: { value } },
      annotations: { highlight: { [node.id]: 'new' } },
    });
    return;
  }

  // The last node: the tail pointer says, or walk there from the head.
  let last = t.model.tail;
  let walked = 0;
  if (last === null) {
    const ids = order(t.model);
    ids.forEach((id, index) => {
      t.count('reads');
      walked++;
      const isLast = index === ids.length - 1;
      t.step({
        line: 'walk',
        caption: {
          key: isLast ? 'list.walk.end' : index === 0 ? 'list.walk.start' : 'list.walk',
          params: { value: valueOf(t, id) },
        },
        annotations: { highlight: { [node.id]: 'new', [id]: 'active' }, pointers: { cur: id } },
      });
    });
    last = ids.at(-1)!;
  }

  const lastId = last;
  t.update((list) => withNode(list, lastId, { next: node.id }));
  t.count('writes');
  t.step({
    line: 'tail-link',
    caption: {
      key: t.model.hasTail ? 'list.tail.link' : 'list.tail.link.walked',
      params: { last: valueOf(t, lastId) },
    },
    annotations: {
      highlight: { [node.id]: 'new' },
      edges: { [nextEdgeId(lastId)]: 'active' },
      pointers: t.model.hasTail ? {} : { cur: lastId },
    },
  });
  if (doubly(t)) {
    t.update((list) => withNode(list, node.id, { prev: lastId }));
    t.count('writes');
    t.step({
      line: 'tail-link-back',
      caption: { key: 'list.tail.link-back', params: { last: valueOf(t, lastId) } },
      annotations: {
        highlight: { [node.id]: 'new' },
        edges: { [prevEdgeId(node.id)]: 'active' },
      },
    });
  }

  const hasTail = t.model.hasTail;
  t.update((list) => tidied({ ...list, tail: list.hasTail ? node.id : null }));
  if (hasTail) {
    t.count('writes');
    t.step({
      line: 'tail-move',
      caption: { key: 'list.tail.moved' },
      annotations: { highlight: { [node.id]: 'new' } },
    });
  } else {
    t.step({
      caption: { key: 'list.tail.walked', params: { count: walked } },
      annotations: { highlight: { [node.id]: 'new' } },
    });
  }
}

/** Finds the node holding `target` and links `value` in after it. */
export function insertAfter(t: ListTracer, target: string, value: string): void {
  const found = find(t, target, {
    line: 'after-not-found',
    caption: { key: 'list.after.not-found', params: { target } },
  });
  if (!found) return;

  const node = create(t, value, positionOf(t.model, found.id) + 1, 'after-create', {
    key: 'list.create',
    params: { value },
  });
  const after = found.next;
  t.update((list) =>
    withNode(list, node.id, { next: after, ...(doubly(t) ? { prev: found.id } : {}) }),
  );
  t.count('writes');
  t.step({
    line: 'after-link',
    caption: {
      key: `${after === null ? 'list.after.link.last' : 'list.after.link'}${doubly(t) ? '.doubly' : ''}`,
      params: { target, next: valueOf(t, after) },
    },
    annotations: {
      highlight: { [node.id]: 'new' },
      edges: { [nextEdgeId(node.id)]: 'active', [prevEdgeId(node.id)]: 'active' },
    },
  });

  let list = withNode(t.model, found.id, { next: node.id });
  if (doubly(t) && after !== null) list = withNode(list, after, { prev: node.id });
  if (list.hasTail && list.tail === found.id) list = { ...list, tail: node.id };
  const relinked = list;
  const both = doubly(t) && after !== null;
  t.update(() => tidied(relinked));
  t.count('writes');
  t.step({
    line: 'after-relink',
    caption: {
      key: both ? 'list.after.relinked.doubly' : 'list.after.relinked',
      params: { target, value },
    },
    annotations: {
      highlight: { [node.id]: 'new' },
      edges: {
        [nextEdgeId(found.id)]: 'active',
        ...(after === null ? {} : { [prevEdgeId(after)]: 'active' }),
      },
    },
  });
}

/** Finds the node holding `target` and links `value` in before it. Doubly linked lists only. */
export function insertBefore(t: ListTracer, target: string, value: string): void {
  if (!doubly(t)) {
    t.fail(
      'list.no-prev',
      { key: 'list.before.singly', params: { target } },
      { annotations: { container: 'error' } },
    );
    return;
  }
  const found = find(t, target, {
    line: 'before-not-found',
    caption: { key: 'list.before.not-found', params: { target } },
  });
  if (!found) return;

  const node = create(t, value, positionOf(t.model, found.id), 'before-create', {
    key: 'list.create',
    params: { value },
  });
  const before = found.prev;
  t.update((list) => withNode(list, node.id, { next: found.id, prev: before }));
  t.count('writes');
  t.step({
    line: 'before-link',
    caption: {
      key: before === null ? 'list.before.link.first' : 'list.before.link',
      params: { target, prev: valueOf(t, before) },
    },
    annotations: {
      highlight: { [node.id]: 'new' },
      edges: { [nextEdgeId(node.id)]: 'active', [prevEdgeId(node.id)]: 'active' },
    },
  });

  let list = withNode(t.model, found.id, { prev: node.id });
  list = before === null ? { ...list, head: node.id } : withNode(list, before, { next: node.id });
  const relinked = list;
  t.update(() => tidied(relinked));
  t.count('writes');
  t.step({
    line: 'before-relink',
    caption: {
      key: before === null ? 'list.before.relinked.head' : 'list.before.relinked',
      params: { target, value, prev: valueOf(t, before) },
    },
    annotations: {
      highlight: { [node.id]: 'new' },
      edges: {
        [prevEdgeId(found.id)]: 'active',
        ...(before === null ? {} : { [nextEdgeId(before)]: 'active' }),
      },
    },
  });
}

/** Removes the first node holding `value`: find it, re-link around it, let it go. */
export function remove(t: ListTracer, value: string): void {
  if (t.model.head === null) {
    t.fail(
      'list.empty',
      { key: 'list.delete.empty', params: { value } },
      { line: 'delete-not-found', annotations: { container: 'error' } },
    );
    return;
  }

  // Walk with cur; a singly linked list also needs prev, the node before cur.
  const singly = !doubly(t);
  const visited: Record<string, ElementState> = {};
  let prev: string | null = null;
  let cur: ListNode | undefined;
  for (const id of order(t.model)) {
    const node = nodeById(t.model, id)!;
    t.count('comparisons');
    t.count('reads');
    const match = node.value === value;
    t.step({
      line: 'delete-find',
      caption: match
        ? { key: 'list.delete.found', params: { value } }
        : { key: 'list.search.compare', params: { value, current: node.value } },
      annotations: {
        highlight: { ...visited, [id]: match ? 'found' : 'active' },
        pointers: singly ? { prev, cur: id } : { cur: id },
      },
    });
    if (match) {
      cur = node;
      break;
    }
    visited[id] = 'visited';
    prev = id;
  }
  if (!cur) {
    t.fail(
      'list.not-found',
      { key: 'list.delete.not-found', params: { value } },
      { line: 'delete-not-found', annotations: { allNodes: 'visited', container: 'error' } },
    );
    return;
  }

  const gone = cur;
  const out = { [gone.id]: 'dimmed' as const };
  const raise = (list: ListModel) => withNode(list, gone.id, { raised: true });
  if (singly) {
    const before = prev;
    const wasTail = t.model.hasTail && t.model.tail === gone.id;
    t.update((list) => {
      const relinked =
        before === null
          ? { ...list, head: gone.next }
          : withNode(list, before, { next: gone.next });
      return raise(wasTail ? { ...relinked, tail: before } : relinked);
    });
    t.count('writes');
    t.step({
      line: before === null ? 'unlink-head' : 'unlink',
      caption:
        before === null
          ? {
              key: gone.next === null ? 'list.delete.only' : 'list.delete.head',
              params: { value, next: valueOf(t, gone.next) },
            }
          : {
              key: wasTail ? 'list.delete.unlink.tail' : 'list.delete.unlink',
              params: { value, prev: valueOf(t, before), next: valueOf(t, gone.next) },
            },
      annotations: {
        highlight: out,
        edges: before === null ? {} : { [nextEdgeId(before)]: 'active' },
        pointers: { prev: before },
      },
    });
  } else {
    const { prev: before, next: after } = gone;
    t.update((list) =>
      raise(before === null ? { ...list, head: after } : withNode(list, before, { next: after })),
    );
    t.count('writes');
    t.step({
      line: 'unlink-forward',
      caption: {
        key: before === null ? 'list.delete.forward.head' : 'list.delete.forward',
        params: { value, prev: valueOf(t, before), next: valueOf(t, after) },
      },
      annotations: {
        highlight: out,
        edges: before === null ? {} : { [nextEdgeId(before)]: 'active' },
      },
    });
    t.update((list) =>
      after === null ? { ...list, tail: before } : withNode(list, after, { prev: before }),
    );
    t.count('writes');
    t.step({
      line: 'unlink-back',
      caption: {
        key: after === null ? 'list.delete.back.tail' : 'list.delete.back',
        params: { value, prev: valueOf(t, before), next: valueOf(t, after) },
      },
      annotations: {
        highlight: out,
        edges: after === null ? {} : { [prevEdgeId(after)]: 'active' },
      },
    });
  }

  t.update((list) => tidied(without(list, gone.id)));
  t.step({ caption: { key: 'list.delete.freed', params: { value } } });
}

/** Looks for `value` from the head; the node holding it, or undefined. */
export function search(t: ListTracer, value: string): ListNode | undefined {
  return find(t, value);
}

/** Visits every node from the head, following next. */
export function traverse(t: ListTracer): void {
  walkAll(t, order(t.model), 'traverse-visit', 'list.traversed');
}

/** Visits every node from the tail, following prev. Doubly linked lists only. */
export function traverseBackward(t: ListTracer): void {
  if (!doubly(t)) {
    t.fail('list.no-prev', { key: 'list.back.singly' }, { annotations: { container: 'error' } });
    return;
  }
  walkAll(t, [...order(t.model)].reverse(), 'back-visit', 'list.traversed.back');
}

function walkAll(t: ListTracer, ids: readonly string[], line: string, doneKey: string) {
  if (ids.length === 0) {
    t.step({ caption: { key: 'list.traverse.empty' } });
    return;
  }
  const visited: Record<string, ElementState> = {};
  for (const id of ids) {
    t.count('reads');
    t.step({
      line,
      caption: { key: 'list.visit', params: { value: valueOf(t, id) } },
      annotations: { highlight: { ...visited, [id]: 'active' }, pointers: { cur: id } },
    });
    visited[id] = 'visited';
  }
  t.step({
    caption: { key: doneKey, params: { count: ids.length } },
    annotations: { allNodes: 'visited' },
  });
}

/** Reverses the list in place by flipping each next pointer, walking prev, cur and next. */
export function reverse(t: ListTracer): void {
  const ids = order(t.model);
  if (ids.length < 2) {
    t.step({ line: 'reverse-head', caption: { key: 'list.reverse.short' } });
    return;
  }

  const first = t.model.head;
  let prev: string | null = null;
  let cur: string | null = first;
  while (cur !== null) {
    const curId = cur;
    const next = nodeById(t.model, curId)!.next;
    t.count('reads');
    t.step({
      line: 'reverse-save',
      caption: {
        key: next === null ? 'list.reverse.save.last' : 'list.reverse.save',
        params: { cur: valueOf(t, curId), next: valueOf(t, next) },
      },
      annotations: { highlight: { [curId]: 'active' }, pointers: { prev, cur: curId, next } },
    });

    const before = prev;
    t.update((list) =>
      withNode(list, curId, { next: before, ...(list.kind === 'doubly' ? { prev: next } : {}) }),
    );
    t.count('writes');
    t.step({
      line: 'reverse-flip',
      caption: {
        key: before === null ? 'list.reverse.flip.first' : 'list.reverse.flip',
        params: { cur: valueOf(t, curId), prev: valueOf(t, before) },
      },
      annotations: {
        highlight: { [curId]: 'active' },
        edges: { [nextEdgeId(curId)]: 'active' },
        pointers: { prev, cur: curId, next },
      },
    });

    prev = curId;
    cur = next;
    t.step({
      line: 'reverse-advance',
      caption: {
        key: cur === null ? 'list.reverse.advance.end' : 'list.reverse.advance',
        params: { prev: valueOf(t, prev), cur: valueOf(t, cur) },
      },
      annotations: { pointers: { prev, cur } },
    });
  }

  const newHead = prev;
  t.update((list) => ({ ...list, head: newHead, tail: list.hasTail ? first : null }));
  t.count('writes');
  t.step({
    line: 'reverse-head',
    caption: { key: 'list.reverse.head', params: { head: valueOf(t, newHead) } },
    annotations: { pointers: { prev: newHead } },
  });

  t.update(tidied);
  t.step({ caption: { key: 'list.reverse.done' } });
}

export type ListOperation =
  | { type: 'insertHead'; value: string }
  | { type: 'insertTail'; value: string }
  | { type: 'insertAfter'; target: string; value: string }
  | { type: 'insertBefore'; target: string; value: string }
  | { type: 'delete'; value: string }
  | { type: 'search'; value: string }
  | { type: 'traverse' }
  | { type: 'traverseBackward' }
  | { type: 'reverse' };

/** Runs one operation on `model`: the trace to play, and the list to continue from. */
export function traceList(
  model: ListModel,
  operation: ListOperation,
): { trace: Trace<string | undefined>; model: ListModel } {
  return runTrace(
    { operation: `list.${operation.type}`, model, toScene: listToScene, describe: describeList },
    (t): string | undefined => {
      switch (operation.type) {
        case 'insertHead':
          insertHead(t, operation.value);
          return undefined;
        case 'insertTail':
          insertTail(t, operation.value);
          return undefined;
        case 'insertAfter':
          insertAfter(t, operation.target, operation.value);
          return undefined;
        case 'insertBefore':
          insertBefore(t, operation.target, operation.value);
          return undefined;
        case 'delete':
          remove(t, operation.value);
          return undefined;
        case 'search':
          return search(t, operation.value)?.value;
        case 'traverse':
          traverse(t);
          return undefined;
        case 'traverseBackward':
          traverseBackward(t);
          return undefined;
        case 'reverse':
          reverse(t);
          return undefined;
      }
    },
  );
}
