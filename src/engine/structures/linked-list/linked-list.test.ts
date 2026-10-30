import type { Scene, SceneElement, Trace } from '../../core/types';
import { describeList } from './describe';
import { createList, nodeById, order, values, type ListModel } from './model';
import { traceList, type ListOperation } from './operations';
import { listToScene, NULL_ID } from './to-scene';

type Cell = Extract<SceneElement, { kind: 'cell' }>;
const cells = (scene: Scene) => scene.elements.filter((e): e is Cell => e.kind === 'cell');
const edges = (scene: Scene) =>
  scene.elements.flatMap((e) => (e.kind === 'edge' ? [`${e.id}:${e.from}>${e.to}`] : []));
const pointers = (scene: Scene) =>
  Object.fromEntries(
    scene.elements.flatMap((e) => (e.kind === 'pointer' ? [[e.label, e.target]] : [])),
  );
const lines = (trace: Trace) => trace.steps.map((step) => step.codeLine);
const keys = (trace: Trace) =>
  trace.steps.map((step) => ('key' in step.caption ? step.caption.key : step.caption.text));
const run = (model: ListModel, operation: ListOperation) => traceList(model, operation);
/** Every node's prev must be the node whose next points at it. */
const prevsMatch = (list: ListModel) =>
  order(list).every((id, index, ids) => nodeById(list, id)?.prev === (ids[index - 1] ?? null));

describe('createList', () => {
  it('links nodes head to tail; a doubly linked list also links back and keeps a tail', () => {
    const singly = createList(['12', '7', '30']);
    expect(values(singly)).toEqual(['12', '7', '30']);
    expect(singly.tail).toBeNull();
    expect(createList(['1'], { hasTail: true }).tail).toBe('node-0');

    const doubly = createList(['12', '7', '30'], { kind: 'doubly' });
    expect(doubly.hasTail).toBe(true);
    expect(doubly.tail).toBe('node-2');
    expect(prevsMatch(doubly)).toBe(true);
  });

  it('rejects more nodes than the canvas fits', () => {
    expect(() => createList(Array.from({ length: 13 }, String))).toThrow(RangeError);
  });
});

describe('insertHead and insertTail', () => {
  it('links a new head in three pointer steps, the new node raised until it’s in', () => {
    const { trace, model } = run(createList(['7', '30']), { type: 'insertHead', value: '12' });
    expect(values(model)).toEqual(['12', '7', '30']);
    expect(lines(trace)).toEqual(['head-create', 'head-link', 'head-move']);
    const created = cells(trace.steps[0]!.scene).find((c) => c.value === '12');
    expect(created?.slot).toEqual({ type: 'link', index: 0, raised: true });
    expect(edges(trace.steps[1]!.scene)).toContain('next-node-2:node-2>node-0');
    expect(pointers(trace.steps[1]!.scene).head).toBe('node-0');
    expect(pointers(trace.steps[2]!.scene).head).toBe('node-2');
  });

  it('also points the old head back, in a doubly linked list', () => {
    const { trace, model } = run(createList(['7'], { kind: 'doubly' }), {
      type: 'insertHead',
      value: '12',
    });
    expect(lines(trace)).toEqual(['head-create', 'head-link', 'head-link-back', 'head-move']);
    expect(prevsMatch(model)).toBe(true);
  });

  it('walks to the end without a tail pointer, and jumps there with one', () => {
    const walked = run(createList(['1', '2', '3']), { type: 'insertTail', value: '4' });
    expect(values(walked.model)).toEqual(['1', '2', '3', '4']);
    expect(lines(walked.trace)).toEqual([
      'tail-create',
      'walk',
      'walk',
      'walk',
      'tail-link',
      undefined,
    ]);
    expect(keys(walked.trace).at(-1)).toBe('list.tail.walked');

    const direct = run(createList(['1', '2', '3'], { hasTail: true }), {
      type: 'insertTail',
      value: '4',
    });
    expect(lines(direct.trace)).toEqual(['tail-create', 'tail-link', 'tail-move']);
    expect(direct.model.tail).toBe('node-3');
  });

  it('makes the first node both head and tail', () => {
    const { trace, model } = run(createList([], { hasTail: true }), {
      type: 'insertTail',
      value: '5',
    });
    expect(lines(trace)).toEqual(['tail-create', 'tail-empty']);
    expect([model.head, model.tail]).toEqual(['node-0', 'node-0']);
    const head = run(createList([], { kind: 'doubly' }), { type: 'insertHead', value: '5' });
    expect(keys(head.trace).at(-1)).toBe('list.first');
    expect(head.model.tail).toBe('node-0');
  });
});

describe('insertAfter and insertBefore', () => {
  it('finds the node, links the new one to its successor, then re-aims the found node', () => {
    const { trace, model } = run(createList(['12', '7', '30']), {
      type: 'insertAfter',
      target: '7',
      value: '21',
    });
    expect(values(model)).toEqual(['12', '7', '21', '30']);
    expect(lines(trace)).toEqual([
      'search-compare',
      'search-found',
      'after-create',
      'after-link',
      'after-relink',
    ]);
    // Before the re-link, 7 still points at 30 while the raised new node already does too.
    const linked = trace.steps[3]!.scene;
    expect(edges(linked)).toEqual(
      expect.arrayContaining(['next-node-1:node-1>node-2', 'next-node-3:node-3>node-2']),
    );
    expect(edges(trace.steps[4]!.scene)).toContain('next-node-1:node-1>node-3');
  });

  it('moves the tail when inserting after it, and fails for a missing node', () => {
    const last = run(createList(['1', '2'], { hasTail: true }), {
      type: 'insertAfter',
      target: '2',
      value: '3',
    });
    expect(last.model.tail).toBe('node-2');
    expect(keys(last.trace)).toContain('list.after.link.last');

    const missing = run(createList(['1']), { type: 'insertAfter', target: '9', value: '3' });
    expect(missing.trace.error?.code).toBe('list.not-found');
    expect(lines(missing.trace).at(-1)).toBe('after-not-found');
  });

  it('keeps prev pointers right when inserting after and before in a doubly linked list', () => {
    const list = createList(['12', '7', '30'], { kind: 'doubly' });
    const after = run(list, { type: 'insertAfter', target: '7', value: '21' });
    expect(prevsMatch(after.model)).toBe(true);
    expect(keys(after.trace)).toContain('list.after.relinked.doubly');

    const before = run(list, { type: 'insertBefore', target: '7', value: '5' });
    expect(values(before.model)).toEqual(['12', '5', '7', '30']);
    expect(prevsMatch(before.model)).toBe(true);
    expect(lines(before.trace).slice(-3)).toEqual([
      'before-create',
      'before-link',
      'before-relink',
    ]);

    const atHead = run(list, { type: 'insertBefore', target: '12', value: '1' });
    expect(atHead.model.head).toBe('node-3');
    expect(prevsMatch(atHead.model)).toBe(true);
  });

  it('explains that a singly linked list can’t insert before', () => {
    const { trace } = run(createList(['1']), { type: 'insertBefore', target: '1', value: '2' });
    expect(trace.error?.code).toBe('list.no-prev');
  });
});

describe('delete', () => {
  it('walks prev and cur, re-links past the node, then lets it go', () => {
    const { trace, model } = run(createList(['12', '7', '30']), { type: 'delete', value: '7' });
    expect(values(model)).toEqual(['12', '30']);
    expect(lines(trace)).toEqual(['delete-find', 'delete-find', 'unlink', undefined]);
    expect(pointers(trace.steps[1]!.scene)).toMatchObject({ prev: 'node-0', cur: 'node-1' });
    const unlinked = trace.steps[2]!.scene;
    expect(edges(unlinked)).toContain('next-node-0:node-0>node-2');
    expect(cells(unlinked).find((c) => c.id === 'node-1')).toMatchObject({
      state: 'dimmed',
      slot: { type: 'link', index: 1, raised: true },
    });
    expect(unlinked.meta?.size).toBe(2);
    expect(cells(trace.steps[3]!.scene).map((c) => c.value)).toEqual(['12', '30']);
  });

  it('moves head when deleting it, and tail when deleting the last node', () => {
    const head = run(createList(['12', '7']), { type: 'delete', value: '12' });
    expect(lines(head.trace)).toContain('unlink-head');
    expect(head.model.head).toBe('node-1');

    const tail = run(createList(['12', '7'], { hasTail: true }), { type: 'delete', value: '7' });
    expect(tail.model.tail).toBe('node-0');
    expect(keys(tail.trace)).toContain('list.delete.unlink.tail');

    const only = run(createList(['1'], { hasTail: true }), { type: 'delete', value: '1' });
    expect([only.model.head, only.model.tail]).toEqual([null, null]);
  });

  it('re-links both ways in a doubly linked list, with no prev to track', () => {
    const list = createList(['12', '7', '30'], { kind: 'doubly' });
    const middle = run(list, { type: 'delete', value: '7' });
    expect(lines(middle.trace)).toEqual([
      'delete-find',
      'delete-find',
      'unlink-forward',
      'unlink-back',
      undefined,
    ]);
    expect(pointers(middle.trace.steps[1]!.scene).prev).toBeUndefined();
    expect(prevsMatch(middle.model)).toBe(true);

    const last = run(list, { type: 'delete', value: '30' });
    expect(last.model.tail).toBe('node-1');
    const first = run(list, { type: 'delete', value: '12' });
    expect(first.model.head).toBe('node-1');
    expect(prevsMatch(first.model)).toBe(true);
  });

  it('fails on a missing value or an empty list', () => {
    expect(run(createList(['1']), { type: 'delete', value: '9' }).trace.error?.code).toBe(
      'list.not-found',
    );
    expect(run(createList(), { type: 'delete', value: '9' }).trace.error?.code).toBe('list.empty');
  });
});

describe('search, traverse and reverse', () => {
  it('follows next from the head until it finds the value', () => {
    const { trace } = run(createList(['12', '7', '30']), { type: 'search', value: '30' });
    expect(trace.result).toBe('30');
    expect(lines(trace)).toEqual(['search-compare', 'search-compare', 'search-found']);
    const missing = run(createList(['12']), { type: 'search', value: '9' });
    expect(missing.trace.result).toBeUndefined();
    expect(keys(missing.trace).at(-1)).toBe('list.search.not-found');
  });

  it('walks forwards with cur, and backwards only in a doubly linked list', () => {
    const forward = run(createList(['1', '2']), { type: 'traverse' });
    expect(lines(forward.trace)).toEqual(['traverse-visit', 'traverse-visit', undefined]);

    const back = run(createList(['1', '2', '3'], { kind: 'doubly' }), { type: 'traverseBackward' });
    const visited = back.trace.steps.slice(0, 3).map((step) => pointers(step.scene).cur);
    expect(visited).toEqual(['node-2', 'node-1', 'node-0']);
    expect(run(createList(['1']), { type: 'traverseBackward' }).trace.error?.code).toBe(
      'list.no-prev',
    );
  });

  it('flips each arrow in place, then makes the old tail the head', () => {
    const { trace, model } = run(createList(['1', '2', '3'], { hasTail: true }), {
      type: 'reverse',
    });
    expect(values(model)).toEqual(['3', '2', '1']);
    expect(model.tail).toBe('node-0');
    expect(lines(trace)).toEqual([
      ...['reverse-save', 'reverse-flip', 'reverse-advance'],
      ...['reverse-save', 'reverse-flip', 'reverse-advance'],
      ...['reverse-save', 'reverse-flip', 'reverse-advance'],
      'reverse-head',
      undefined,
    ]);
    // After the second flip: 1 ← 2, 3 still points nowhere; nothing has moved.
    const flipped = trace.steps[4]!.scene;
    expect(edges(flipped)).toEqual(['next-node-1:node-1>node-0']);
    expect(cells(flipped).map((c) => c.value)).toEqual(['1', '2', '3']);
    expect(pointers(trace.steps[5]!.scene)).toMatchObject({ prev: 'node-1', cur: 'node-2' });
    // Then the row is redrawn head first.
    expect(cells(trace.steps.at(-1)!.scene).map((c) => c.value)).toEqual(['3', '2', '1']);
  });

  it('keeps prev pointers right when reversing a doubly linked list', () => {
    const { model } = run(createList(['1', '2', '3'], { kind: 'doubly' }), { type: 'reverse' });
    expect(values(model)).toEqual(['3', '2', '1']);
    expect(prevsMatch(model)).toBe(true);
  });
});

describe('scenes', () => {
  it('points head (and tail) at null when the list is empty', () => {
    const scene = listToScene(createList([], { hasTail: true }));
    expect(pointers(scene)).toEqual({ head: NULL_ID, tail: NULL_ID });
    expect(describeList(scene)).toBe('Empty singly linked list: head is null.');
  });

  it('carries head, tail and values in meta, and describes the list', () => {
    const scene = listToScene(createList(['12', '7'], { kind: 'doubly' }));
    expect(scene.meta).toMatchObject({ size: 2, head: '12', tail: '7', kind: 'doubly' });
    expect(describeList(scene)).toBe('Doubly linked list of 2 nodes. From the head: 12, 7.');
  });
});
