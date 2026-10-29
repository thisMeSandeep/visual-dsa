import { createRng } from '../../core/rng';
import type { Scene, SceneElement, Trace } from '../../core/types';
import { describeStack } from './describe';
import { createStack, type StackModel } from './model';
import { traceStack, type StackOperation } from './operations';

/* Helpers ------------------------------------------------------------------------------------- */

const cells = (scene: Scene) =>
  scene.elements.filter(
    (e): e is Extract<SceneElement, { kind: 'cell' }> => e.kind === 'cell' && e.id !== 'rejected',
  );
const values = (scene: Scene) => cells(scene).map((cell) => cell.value);
const lastScene = (trace: Trace) => {
  const scene = trace.steps.at(-1)?.scene;
  if (!scene) throw new Error('trace has no steps');
  return scene;
};
const lines = (trace: Trace) => trace.steps.map((step) => step.codeLine);

/** Runs several operations in a row, returning each trace and the final model. */
function runAll(model: StackModel, ...operations: StackOperation[]) {
  const traces: Trace<string | undefined>[] = [];
  let current = model;
  for (const operation of operations) {
    const result = traceStack(current, operation);
    traces.push(result.trace);
    current = result.model;
  }
  return { traces, model: current };
}

/* createStack ------------------------------------------------------------------------------- */

describe('createStack', () => {
  it('builds a stack bottom first, with the configured default capacity', () => {
    const stack = createStack(['23', '8']);
    expect(stack.items.map((item) => item.value)).toEqual(['23', '8']);
    expect(stack.capacity).toBe(8);
  });

  it('rejects starting values that do not fit, and impossible capacities', () => {
    expect(() => createStack(['1', '2', '3'], 2)).toThrow(RangeError);
    expect(() => createStack([], 0)).toThrow(RangeError);
    expect(() => createStack([], 13)).toThrow(RangeError);
  });
});

/* push ---------------------------------------------------------------------------------------- */

describe('push', () => {
  it('checks for room, then adds the value on top as a new item', () => {
    const { trace, model } = traceStack(createStack(['23']), { type: 'push', value: '42' });

    expect(trace.operation).toBe('stack.push');
    expect(lines(trace)).toEqual(['check-full', 'push']);
    expect(model.items.map((item) => item.value)).toEqual(['23', '42']);

    const scene = lastScene(trace);
    expect(values(scene)).toEqual(['23', '42']);
    expect(cells(scene)[1]).toMatchObject({ state: 'new', slot: { type: 'index', index: 1 } });
    expect(scene.elements).toContainEqual({
      kind: 'pointer',
      id: 'pointer-top',
      label: 'top',
      target: model.items[1]?.id,
    });
    expect(trace.steps.at(-1)?.counters).toMatchObject({ comparisons: 1, writes: 1 });
    expect(trace.error).toBeUndefined();
  });

  it('overflows when full: an error step, the value shown rejected, the stack unchanged', () => {
    const full = createStack(['1', '2'], 2);
    const { trace, model } = traceStack(full, { type: 'push', value: '3' });

    expect(trace.error).toEqual({
      code: 'stack.overflow',
      message: { key: 'stack.overflow', params: { value: '3', capacity: 2 } },
    });
    expect(lines(trace)).toEqual(['check-full', 'overflow']);
    expect(model).toBe(full);

    const scene = lastScene(trace);
    expect(scene.meta?.container).toBe('error');
    expect(scene.elements).toContainEqual(
      expect.objectContaining({ id: 'rejected', value: '3', state: 'error' }),
    );
  });
});

/* pop ----------------------------------------------------------------------------------------- */

describe('pop', () => {
  it('checks, reads the top, then removes it and returns its value', () => {
    const { trace, model } = traceStack(createStack(['23', '8', '42']), { type: 'pop' });

    expect(trace.result).toBe('42');
    expect(lines(trace)).toEqual(['check-empty', 'read-top', 'pop']);
    expect(cells(trace.steps[1]!.scene)[2]?.state).toBe('active');
    expect(values(lastScene(trace))).toEqual(['23', '8']);
    expect(model.items).toHaveLength(2);
    expect(trace.steps.at(-1)?.counters).toMatchObject({ comparisons: 1, reads: 1, writes: 1 });
  });

  it('underflows on an empty stack', () => {
    const { trace } = traceStack(createStack(), { type: 'pop' });

    expect(trace.result).toBeUndefined();
    expect(trace.error?.code).toBe('stack.underflow');
    expect(lines(trace)).toEqual(['check-empty', 'underflow']);
    expect(lastScene(trace).meta?.container).toBe('error');
  });
});

/* peek and clear ------------------------------------------------------------------------------ */

describe('peek', () => {
  it('returns the top value without changing the stack', () => {
    const stack = createStack(['5', '9']);
    const { trace, model } = traceStack(stack, { type: 'peek' });

    expect(trace.result).toBe('9');
    expect(model).toBe(stack);
    expect(cells(lastScene(trace))[1]?.state).toBe('active');
  });

  it('fails on an empty stack', () => {
    const { trace } = traceStack(createStack(), { type: 'peek' });
    expect(trace.error?.code).toBe('stack.empty');
    expect(lines(trace)).toEqual(['peek-empty']);
  });
});

describe('clear', () => {
  it('dims every item, then empties the stack', () => {
    const { trace, model } = traceStack(createStack(['1', '2', '3']), { type: 'clear' });

    expect(cells(trace.steps[0]!.scene).every((cell) => cell.state === 'dimmed')).toBe(true);
    expect(values(lastScene(trace))).toEqual([]);
    expect(model.items).toEqual([]);
  });

  it('says so when the stack is already empty', () => {
    const { trace } = traceStack(createStack(), { type: 'clear' });
    expect(trace.steps.map((step) => step.caption)).toEqual([{ key: 'stack.already-empty' }]);
  });
});

/* Behaviour across operations ------------------------------------------------------------------ */

describe('stack behaviour', () => {
  it('keeps item ids stable and never reuses a popped item id', () => {
    const { traces, model } = runAll(
      createStack(),
      { type: 'push', value: 'a' },
      { type: 'push', value: 'b' },
      { type: 'pop' },
      { type: 'push', value: 'c' },
    );

    const idOfA = model.items[0]?.id;
    const firstSceneIds = cells(lastScene(traces[0]!)).map((cell) => cell.id);
    expect(firstSceneIds).toEqual([idOfA]);
    expect(model.items.map((item) => item.id)).toEqual(['item-0', 'item-2']);
  });

  it('is last in, first out (randomised against a plain array)', () => {
    const rng = createRng(2024);
    const reference: string[] = [];
    let model = createStack([], 12);

    for (let i = 0; i < 300; i += 1) {
      const operation: StackOperation =
        rng.next() < 0.55 ? { type: 'push', value: String(rng.int(0, 99)) } : { type: 'pop' };
      const result = traceStack(model, operation);
      model = result.model;

      if (operation.type === 'push') {
        if (reference.length < 12) reference.push(operation.value);
        else expect(result.trace.error?.code).toBe('stack.overflow');
      } else {
        expect(result.trace.result).toBe(reference.pop());
      }
      expect(model.items.map((item) => item.value)).toEqual(reference);
    }
  });

  it('produces identical traces for identical input', () => {
    const run = () => traceStack(createStack(['1', '2']), { type: 'pop' }).trace;
    expect(run()).toEqual(run());
  });
});

/* describeStack ----------------------------------------------------------------------------- */

describe('describeStack', () => {
  it('summarises size, top and order', () => {
    const { trace } = traceStack(createStack(['23', '8']), { type: 'push', value: '42' });
    expect(describeStack(lastScene(trace))).toBe(
      'Stack of 3 items, capacity 8. Top: 42. Bottom to top: 23, 8, 42.',
    );
  });

  it('describes an empty stack, a rejected value and errors', () => {
    expect(traceStack(createStack(), { type: 'peek' }).trace.steps[0]?.a11y).toBe(
      'Empty stack, capacity 8. Error.',
    );
    const overflow = traceStack(createStack(['1'], 1), { type: 'push', value: '2' }).trace;
    expect(overflow.steps.at(-1)?.a11y).toBe(
      'Stack of 1 item, capacity 1. Top: 1. Bottom to top: 1. 2 does not fit. Error.',
    );
  });
});
