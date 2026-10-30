import type { Scene, SceneElement, Trace } from '../../core/types';
import { describeQueue } from './describe';
import { createQueue, itemsInOrder, type QueueModel } from './model';
import { traceQueue, type QueueOperation } from './operations';
import { queueToScene } from './to-scene';

type Cell = Extract<SceneElement, { kind: 'cell' }>;
const cells = (scene: Scene) =>
  scene.elements.filter((e): e is Cell => e.kind === 'cell' && e.id !== 'rejected');
const lines = (trace: Trace) => trace.steps.map((step) => step.codeLine);
const keys = (trace: Trace) =>
  trace.steps.map((step) => ('key' in step.caption ? step.caption.key : step.caption.text));
const values = (model: QueueModel) => itemsInOrder(model).map((item) => item.value);

function runAll(model: QueueModel, ...operations: QueueOperation[]) {
  const traces: Trace<string | undefined>[] = [];
  let current = model;
  for (const operation of operations) {
    const result = traceQueue(current, operation);
    traces.push(result.trace);
    current = result.model;
  }
  return { traces, model: current };
}
const enq = (value: string): QueueOperation => ({ type: 'enqueue', value });
const deq: QueueOperation = { type: 'dequeue' };

describe('createQueue', () => {
  it('fills slots from the front, with the configured default capacity', () => {
    const queue = createQueue(['23', '8']);
    expect(queue.slots).toHaveLength(6);
    expect(values(queue)).toEqual(['23', '8']);
  });

  it('can start part-way round, wrapping in circular mode', () => {
    const queue = createQueue(['1', '2', '3'], 4, { head: 2 });
    expect(queue.slots.map((slot) => slot?.value ?? null)).toEqual(['3', null, '1', '2']);
    expect(values(queue)).toEqual(['1', '2', '3']);
  });

  it('rejects impossible capacities, fronts and fills', () => {
    expect(() => createQueue([], 0)).toThrow(RangeError);
    expect(() => createQueue([], 13)).toThrow(RangeError);
    expect(() => createQueue([], 4, { head: 4 })).toThrow(RangeError);
    expect(() => createQueue(['1', '2', '3'], 2)).toThrow(RangeError);
    expect(() => createQueue(['1', '2', '3'], 4, { head: 2, mode: 'naive' })).toThrow(RangeError);
  });
});

describe('enqueue and dequeue', () => {
  it('is first in, first out', () => {
    const { traces, model } = runAll(createQueue([], 4), enq('23'), enq('8'), enq('42'), deq);
    expect(traces[3]?.result).toBe('23');
    expect(values(model)).toEqual(['8', '42']);
    expect(lines(traces[0]!)).toEqual(['check-full', 'enqueue']);
    expect(lines(traces[3]!)).toEqual(['check-empty', 'read-front', 'dequeue']);
  });

  it('marks the new item and points front and rear at the ends', () => {
    const { traces } = runAll(createQueue(['23'], 4), enq('8'));
    const scene = traces[0]!.steps.at(-1)!.scene;
    expect(cells(scene).find((cell) => cell.value === '8')?.state).toBe('new');
    expect(scene.elements).toContainEqual({
      kind: 'pointer',
      id: 'pointer-front',
      label: 'front',
      target: 'item-0',
    });
    expect(scene.elements).toContainEqual({
      kind: 'pointer',
      id: 'pointer-rear',
      label: 'rear',
      target: 'item-1',
    });
    expect(scene.meta).toMatchObject({ size: 2, capacity: 4, front: '23', rear: '8', tail: 2 });
  });

  it('wraps the rear round to slot 0 in a circular buffer', () => {
    const start = createQueue(['4', '5'], 5, { head: 3 });
    const { traces, model } = runAll(start, enq('6'));
    expect(keys(traces[0]!).at(-1)).toBe('queue.enqueued.wrap');
    expect(traces[0]!.steps.at(-1)?.caption).toEqual({
      key: 'queue.enqueued.wrap',
      params: { value: '6', slot: 0 },
    });
    expect(model.slots[0]?.value).toBe('6');
    expect(values(model)).toEqual(['4', '5', '6']);
  });

  it('overflows when every slot is taken, showing the value that did not fit', () => {
    const { traces, model } = runAll(createQueue(['1', '2'], 2), enq('3'));
    expect(traces[0]!.error?.code).toBe('queue.overflow');
    expect(traces[0]!.steps.at(-1)?.caption).toEqual({
      key: 'queue.full',
      params: { value: '3', capacity: 2 },
    });
    const scene = traces[0]!.steps.at(-1)!.scene;
    expect(scene.elements.find((e) => e.id === 'rejected')).toMatchObject({
      value: '3',
      state: 'error',
    });
    expect(scene.meta?.container).toBe('error');
    expect(values(model)).toEqual(['1', '2']);
  });

  it('underflows when empty', () => {
    const { traces } = runAll(createQueue([], 3), deq);
    expect(traces[0]!.error?.code).toBe('queue.underflow');
    expect(lines(traces[0]!)).toEqual(['check-empty', 'underflow']);
  });
});

describe('a plain array (naive mode)', () => {
  it('wastes the slots before the front, and is full with free slots', () => {
    const { traces, model } = runAll(
      createQueue([], 5, { mode: 'naive' }),
      enq('1'),
      enq('2'),
      enq('3'),
      deq,
      deq,
      enq('4'),
      enq('5'),
      enq('6'),
    );
    expect(model.head).toBe(2);
    expect(values(model)).toEqual(['3', '4', '5']);
    expect(traces.at(-1)!.steps.at(-1)?.caption).toEqual({
      key: 'queue.full.wasted',
      params: { value: '6', free: 2 },
    });
    expect(queueToScene(model).meta?.wasted).toBe(2);
  });
});

describe('front and clear', () => {
  it('reads the front without removing it', () => {
    const queue = createQueue(['7', '9']);
    const { trace, model } = traceQueue(queue, { type: 'front' });
    expect(trace.result).toBe('7');
    expect(model).toBe(queue);
    expect(lines(trace)).toEqual(['front']);
  });

  it('fails to read the front of an empty queue', () => {
    const { trace } = traceQueue(createQueue(), { type: 'front' });
    expect(trace.error?.code).toBe('queue.empty');
    expect(lines(trace)).toEqual(['front-empty']);
  });

  it('dims every item, then empties the queue and resets the front', () => {
    const { trace, model } = traceQueue(createQueue(['1', '2'], 4, { head: 3 }), { type: 'clear' });
    expect(keys(trace)).toEqual(['queue.clear.start', 'queue.cleared']);
    expect(cells(trace.steps[0]!.scene).every((cell) => cell.state === 'dimmed')).toBe(true);
    expect(model).toMatchObject({ size: 0, head: 0 });
    expect(keys(traceQueue(model, { type: 'clear' }).trace)).toEqual(['queue.already-empty']);
  });

  it('counts comparisons, reads and writes', () => {
    const { traces } = runAll(createQueue([], 3), enq('1'), deq);
    expect(traces[1]!.steps.at(-1)?.counters).toEqual({
      comparisons: 1,
      swaps: 0,
      reads: 1,
      writes: 1,
    });
  });
});

describe('describeQueue', () => {
  it('reads front to rear, wrapping round', () => {
    expect(describeQueue(queueToScene(createQueue(['4', '5', '6'], 5, { head: 3 })))).toBe(
      'Queue of 3 items, 5 slots. Front: 4. Rear: 6. Front to rear: 4, 5, 6.',
    );
    expect(describeQueue(queueToScene(createQueue([], 3)))).toBe('Empty queue, 3 slots.');
  });

  it('mentions wasted slots in a plain array', () => {
    const { model } = runAll(createQueue(['1', '2'], 4, { mode: 'naive' }), deq);
    expect(describeQueue(queueToScene(model))).toBe(
      'Queue of 1 item, 4 slots. Front: 2. Rear: 2. Front to rear: 2. 1 slot at the start can’t be reused.',
    );
  });
});
