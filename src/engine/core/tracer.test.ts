import { runTrace, Tracer, type TracerOptions } from './tracer';
import type { Scene } from './types';

/* A tiny list model, just enough to exercise the tracer. */
type ListModel = { readonly items: readonly number[] };
type ListAnnotations = { active?: number };

const toScene = (model: ListModel, annotations: ListAnnotations | undefined): Scene => ({
  renderer: 'array',
  elements: model.items.map((value, index) => ({
    kind: 'cell',
    id: `cell-${index}`,
    value: String(value),
    state: annotations?.active === index ? 'active' : 'default',
    slot: { type: 'index', index },
  })),
});

const describe_ = (scene: Scene) => `${scene.elements.length} items`;

const options = (
  items: number[] = [],
  extra: Partial<TracerOptions<ListModel, ListAnnotations>> = {},
): TracerOptions<ListModel, ListAnnotations> => ({
  operation: 'list.test',
  model: { items },
  toScene,
  describe: describe_,
  ...extra,
});

const push = (value: number) => (model: ListModel) => ({ items: [...model.items, value] });

describe('Tracer', () => {
  it('records a full snapshot per step, unaffected by later changes', () => {
    const { trace } = runTrace(options(), (t) => {
      t.update(push(4));
      t.step({ caption: { text: 'one' } });
      t.update(push(7));
      t.step({ caption: { text: 'two' }, annotations: { active: 1 } });
    });

    expect(trace.steps).toHaveLength(2);
    expect(trace.steps[0]?.scene.elements.map((e) => e.id)).toEqual(['cell-0']);
    expect(trace.steps[1]?.scene.elements).toHaveLength(2);
    expect(trace.steps[1]?.scene.elements[1]).toMatchObject({ value: '7', state: 'active' });
  });

  it('records caption, code line, variables and the screen-reader summary', () => {
    const { trace } = runTrace(options([1]), (t) => {
      t.step({ caption: { key: 'list.read', params: { i: 0 } }, line: 'read', vars: { i: 0 } });
    });

    expect(trace.steps[0]).toEqual(
      expect.objectContaining({
        caption: { key: 'list.read', params: { i: 0 } },
        codeLine: 'read',
        vars: { i: '0' },
        a11y: '1 items',
      }),
    );
  });

  it('snapshots counters at each step', () => {
    const { trace } = runTrace(options([3, 1]), (t) => {
      t.count('comparisons');
      t.step({ caption: { text: 'compare' } });
      t.count('swaps');
      t.count('writes', 2);
      t.step({ caption: { text: 'swap' } });
    });

    expect(trace.steps.map((s) => s.counters)).toEqual([
      { comparisons: 1, swaps: 0, reads: 0, writes: 0 },
      { comparisons: 1, swaps: 1, reads: 0, writes: 2 },
    ]);
  });

  it('returns the result and the final model', () => {
    const { trace, model } = runTrace(options([5]), (t) => {
      t.update(push(9));
      t.step({ caption: { text: 'pushed' } });
      return 9;
    });

    expect(trace).toMatchObject({ operation: 'list.test', result: 9 });
    expect(trace.error).toBeUndefined();
    expect(model.items).toEqual([5, 9]);
  });

  it('ends with an error step when the operation fails', () => {
    const { trace } = runTrace(options(), (t) => {
      t.fail('list.empty', { key: 'list.empty' }, { line: 'check' });
    });

    expect(trace.error).toEqual({ code: 'list.empty', message: { key: 'list.empty' } });
    expect(trace.steps).toHaveLength(1);
    expect(trace.steps[0]).toMatchObject({ caption: { key: 'list.empty' }, codeLine: 'check' });
  });

  it('stops a runaway trace at the step limit with an error step', () => {
    const { trace } = runTrace(options([], { maxSteps: 3 }), (t) => {
      for (;;) t.step({ caption: { text: 'again' } });
    });

    expect(trace.steps).toHaveLength(4);
    expect(trace.error?.code).toBe('engine.step-limit');
    expect(trace.steps[3]?.caption).toEqual({ key: 'engine.step-limit', params: { limit: 3 } });
  });

  it('rethrows errors that are not about the step limit', () => {
    expect(() =>
      runTrace(options(), () => {
        throw new Error('bug in an operation');
      }),
    ).toThrow('bug in an operation');
  });

  it('is deterministic: the same input gives the same trace', () => {
    const run = () =>
      runTrace(options([2, 8]), (t) => {
        t.update(push(6));
        t.count('writes');
        t.step({ caption: { text: 'push' }, annotations: { active: 2 } });
      }).trace;

    expect(run()).toEqual(run());
  });

  it('exposes step count and failure state while running', () => {
    const tracer = new Tracer(options());
    expect(tracer.stepCount).toBe(0);
    tracer.step({ caption: { text: 'one' } });
    expect(tracer.stepCount).toBe(1);
    expect(tracer.failed).toBe(false);
    tracer.fail('list.full', { key: 'list.full' });
    expect(tracer.failed).toBe(true);
  });
});
