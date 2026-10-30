import type { Scene, SceneElement, Trace } from '../../core/types';
import { describeArray } from './describe';
import { createArray, values, type ArrayModel } from './model';
import { traceArray, type ArrayOperation } from './operations';
import { arrayToScene, COPIED_PREFIX } from './to-scene';

type Cell = Extract<SceneElement, { kind: 'cell' }>;
const cells = (scene: Scene) => scene.elements.filter((e): e is Cell => e.kind === 'cell');
const row = (scene: Scene) =>
  cells(scene)
    .filter((cell) => cell.slot.type === 'index')
    .map((cell) => [cell.slot.type === 'index' ? cell.slot.index : -1, cell.value]);
const lines = (trace: Trace) => trace.steps.map((step) => step.codeLine);
const keys = (trace: Trace) =>
  trace.steps.map((step) => ('key' in step.caption ? step.caption.key : step.caption.text));
const run = (model: ArrayModel, operation: ArrayOperation) => traceArray(model, operation);

describe('createArray', () => {
  it('fills slots from index 0, with at least the configured default capacity', () => {
    const array = createArray(['23', '8']);
    expect(array.slots).toHaveLength(4);
    expect(values(array)).toEqual(['23', '8']);
    expect(createArray(['1', '2', '3', '4', '5']).slots).toHaveLength(5);
  });

  it('rejects impossible capacities and fills', () => {
    expect(() => createArray([], 0)).toThrow(RangeError);
    expect(() => createArray([], 13)).toThrow(RangeError);
    expect(() => createArray(['1', '2', '3'], 2)).toThrow(RangeError);
  });
});

describe('get and set', () => {
  it('reads any index in one step and points i at it', () => {
    const { trace } = run(createArray(['23', '8', '42']), { type: 'get', index: 2 });
    expect(trace.result).toBe('42');
    expect(lines(trace)).toEqual(['get-check', 'get']);
    expect(trace.steps.at(-1)?.counters.reads).toBe(1);
    const last = trace.steps.at(-1)!.scene;
    expect(last.elements).toContainEqual(
      expect.objectContaining({ kind: 'pointer', label: 'i', target: 'item-2' }),
    );
  });

  it('overwrites a value as a new item, so the canvas fades it in', () => {
    const { trace, model } = run(createArray(['23', '8']), { type: 'set', index: 1, value: '99' });
    expect(values(model)).toEqual(['23', '99']);
    expect(lines(trace)).toEqual(['set-check', 'set']);
    const changed = cells(trace.steps.at(-1)!.scene).find((cell) => cell.value === '99');
    expect(changed).toMatchObject({ id: 'item-2', state: 'new' });
  });

  it('fails on an index past the end, or in an empty array', () => {
    const past = run(createArray(['1', '2']), { type: 'get', index: 2 });
    expect(past.trace.error?.code).toBe('array.out-of-bounds');
    expect(keys(past.trace).at(-1)).toBe('array.out-of-bounds');
    expect(past.trace.steps.at(-1)?.scene.meta?.container).toBe('error');

    const empty = run(createArray(), { type: 'set', index: 0, value: '1' });
    expect(keys(empty.trace)).toEqual(['array.set.check', 'array.out-of-bounds.empty']);
    expect(lines(empty.trace).at(-1)).toBe('set-out-of-bounds');
  });
});

describe('push and growing', () => {
  it('puts the value in the first free slot', () => {
    const { trace, model } = run(createArray(['1'], 4), { type: 'push', value: '2' });
    expect(values(model)).toEqual(['1', '2']);
    expect(lines(trace)).toEqual(['push-check', 'push']);
  });

  it('doubles a full array: a new block, one copy step per item, then the old one goes', () => {
    const { trace, model } = run(createArray(['1', '2', '3'], 3), { type: 'push', value: '4' });
    expect(model.slots).toHaveLength(6);
    expect(values(model)).toEqual(['1', '2', '3', '4']);
    expect(lines(trace)).toEqual([
      'push-check',
      'grow',
      'copy',
      'copy',
      'copy',
      'grow-done',
      'push',
    ]);

    // The first copy: item 0 has moved into the new array, leaving a dimmed copy behind.
    const firstCopy = trace.steps[2]!.scene;
    expect(firstCopy.meta).toMatchObject({ capacity: 6, sourceCapacity: 3 });
    expect(row(firstCopy)).toEqual([[0, '1']]);
    expect(cells(firstCopy).find((c) => c.id === `${COPIED_PREFIX}item-0`)?.state).toBe('dimmed');
    expect(cells(firstCopy).find((c) => c.id === 'item-1')?.slot).toEqual({
      type: 'source',
      index: 1,
    });
    // Once done, the old array is gone.
    expect(trace.steps[5]!.scene.meta?.sourceCapacity).toBeUndefined();
    expect(trace.steps.at(-1)?.counters.writes).toBe(1 + 3 + 1);
  });

  it('stops growing at the item limit', () => {
    const grown = run(createArray(Array.from({ length: 8 }, String), 8), {
      type: 'push',
      value: '9',
    });
    expect(grown.model.slots).toHaveLength(12);
    expect(keys(grown.trace)).toContain('array.grow.limit');

    const full = createArray(Array.from({ length: 12 }, String), 12);
    const { trace, model } = run(full, { type: 'push', value: '1' });
    expect(trace.error?.code).toBe('array.limit');
    expect(model).toBe(full);
  });
});

describe('insert and removeAt', () => {
  it('shifts later items right, last first, then writes the value', () => {
    const { trace, model } = run(createArray(['3', '8', '12'], 5), {
      type: 'insert',
      index: 1,
      value: '5',
    });
    expect(values(model)).toEqual(['3', '5', '8', '12']);
    expect(lines(trace)).toEqual(['insert-check', 'shift-right', 'shift-right', 'insert']);
    // Mid-shift there's a gap where the new value will go.
    expect(row(trace.steps[2]!.scene)).toEqual([
      [0, '3'],
      [2, '8'],
      [3, '12'],
    ]);
    expect(keys(trace).at(-1)).toBe('array.inserted');
  });

  it('inserts at the end without shifting, and grows a full array first', () => {
    const end = run(createArray(['1', '2'], 4), { type: 'insert', index: 2, value: '3' });
    expect(keys(end.trace)).toEqual(['array.insert.check', 'array.inserted.end']);

    const full = run(createArray(['1', '2'], 2), { type: 'insert', index: 0, value: '0' });
    expect(values(full.model)).toEqual(['0', '1', '2']);
    expect(lines(full.trace)).toContain('grow');
  });

  it('refuses an index that would leave a gap', () => {
    const { trace } = run(createArray(['1'], 4), { type: 'insert', index: 2, value: '3' });
    expect(trace.error?.code).toBe('array.out-of-bounds');
    expect(lines(trace)).toEqual(['insert-check', 'insert-out-of-bounds']);
  });

  it('takes the item out, leaves a gap, and shifts later items left to close it', () => {
    const { trace, model } = run(createArray(['3', '5', '8', '12']), {
      type: 'removeAt',
      index: 1,
    });
    expect(trace.result).toBe('5');
    expect(values(model)).toEqual(['3', '8', '12']);
    expect(model.size).toBe(3);
    expect(lines(trace)).toEqual([
      'remove-check',
      'remove-read',
      'remove-read',
      'shift-left',
      'shift-left',
      'remove-done',
    ]);
    expect(row(trace.steps[2]!.scene)).toEqual([
      [0, '3'],
      [2, '8'],
      [3, '12'],
    ]);
  });

  it('moves nothing when removing the last item, and fails past the end', () => {
    const last = run(createArray(['1', '2']), { type: 'removeAt', index: 1 });
    expect(keys(last.trace).at(-1)).toBe('array.removed.end');
    const past = run(createArray(['1', '2']), { type: 'removeAt', index: 5 });
    expect(lines(past.trace)).toEqual(['remove-check', 'remove-out-of-bounds']);
  });
});

describe('search and traverse', () => {
  it('checks items from the start and stops at the first match', () => {
    const { trace } = run(createArray(['5', '8', '5']), { type: 'search', value: '5' });
    expect(trace.result).toBe(0);
    const later = run(createArray(['23', '8', '42']), { type: 'search', value: '42' });
    expect(later.trace.result).toBe(2);
    expect(lines(later.trace)).toEqual(['search-compare', 'search-compare', 'search-found']);
    const last = cells(later.trace.steps.at(-1)!.scene);
    expect(last.map((cell) => cell.state)).toEqual(['visited', 'visited', 'found']);
    expect(later.trace.steps.at(-1)?.counters.comparisons).toBe(3);
  });

  it('checks every item before saying a value is missing', () => {
    const { trace } = run(createArray(['1', '2']), { type: 'search', value: '9' });
    expect(trace.result).toBe(-1);
    expect(keys(trace).at(-1)).toBe('array.not-found');
    expect(run(createArray(), { type: 'search', value: '1' }).trace.result).toBe(-1);
  });

  it('visits each item once, in order', () => {
    const { trace } = run(createArray(['4', '9', '2']), { type: 'traverse' });
    expect(lines(trace)).toEqual(['traverse-visit', 'traverse-visit', 'traverse-visit', undefined]);
    expect(cells(trace.steps.at(-1)!.scene).every((cell) => cell.state === 'visited')).toBe(true);
    expect(keys(run(createArray(), { type: 'traverse' }).trace)).toEqual(['array.traverse.empty']);
  });
});

describe('scenes and captions', () => {
  it('carries addresses and sizes in meta, and describes the array', () => {
    const scene = arrayToScene(
      createArray(['23', '8'], 4, { addresses: { base: 1000, stride: 4 } }),
    );
    expect(scene.meta).toMatchObject({ size: 2, capacity: 4, addressBase: 1000, addressStride: 4 });
    expect(describeArray(scene)).toBe('Array of 2 items, 4 slots: 23, 8.');
  });
});
