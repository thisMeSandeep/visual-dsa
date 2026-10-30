import type { Trace } from '../../core/types';
import { describeGrowth } from './describe';
import {
  classRank,
  createGrowth,
  domainFor,
  formatCount,
  halvings,
  stepsAt,
  type GrowthModel,
} from './model';
import { countsShown, traceGrowth, type GrowthOperation } from './operations';
import { COUNTER_ID, curveId, growthToScene, RUN_DOT_ID } from './to-scene';

const lines = (trace: Trace) => trace.steps.map((step) => step.codeLine);
const keys = (trace: Trace) =>
  trace.steps.map((step) => ('key' in step.caption ? step.caption.key : step.caption.text));
const run = (model: GrowthModel, operation: GrowthOperation) => traceGrowth(model, operation);

describe('curves and counts', () => {
  it('computes each class’s steps at n', () => {
    expect(stepsAt('constant', 8)).toBe(1);
    expect(stepsAt('logarithmic', 8)).toBe(3);
    expect(stepsAt('linearithmic', 8)).toBe(24);
    expect(stepsAt('quadratic', 8)).toBe(64);
    expect(stepsAt('exponential', 8)).toBe(256);
    expect(stepsAt('scaled-linear', 10)).toBe(35);
    expect(stepsAt('scaled-quadratic', 10)).toBe(50);
  });

  it('colours the example curves like the class they grow like', () => {
    expect(classRank('constant')).toBe(0);
    expect(classRank('scaled-linear')).toBe(classRank('linear'));
    expect(classRank('exponential')).toBe(5);
  });

  it('counts halvings, picks the x-axis for n, and formats counts', () => {
    expect([1, 2, 8, 9, 1000].map(halvings)).toEqual([0, 1, 3, 3, 9]);
    expect([1, 10, 11, 250, 1000].map(domainFor)).toEqual([10, 10, 20, 500, 1000]);
    expect(formatCount(1000000)).toBe('1,000,000');
    expect(formatCount(9.97)).toBe('10');
    expect(formatCount(2 ** 1000)).toBe('over a trillion');
  });

  it('rejects an n the chart can’t show, and unknown or repeated curves', () => {
    expect(() => createGrowth({ n: 0 })).toThrow(RangeError);
    expect(() => createGrowth({ n: 1001 })).toThrow(RangeError);
    expect(() => createGrowth({ curves: ['linear', 'linear'] })).toThrow(RangeError);
  });
});

describe('setN and show', () => {
  it('moves n, zooming the x-axis out when n passes its end, and clears the last run', () => {
    const ran = run(createGrowth({ n: 8 }), { type: 'run', sample: 'loop' }).model;
    expect(ran.run).toBeDefined();
    const same = run(ran, { type: 'setN', n: 9 });
    expect(keys(same.trace)).toEqual(['bigo.n']);
    expect(same.model.run).toBeUndefined();
    const zoomed = run(ran, { type: 'setN', n: 250 });
    expect(keys(zoomed.trace)).toEqual(['bigo.n.zoom']);
    expect(zoomed.model.xMax).toBe(500);
    expect(run(ran, { type: 'setN', n: 5000 }).trace.error?.code).toBe('bigo.n-range');
  });

  it('adds a curve with its own caption, in focus', () => {
    const { trace, model } = run(createGrowth(), { type: 'show', curve: 'quadratic' });
    expect(model.curves).toEqual(['quadratic']);
    expect(keys(trace)).toEqual(['bigo.show.quadratic']);
    const scene = trace.steps[0]!.scene;
    expect(scene.elements).toContainEqual(
      expect.objectContaining({ id: curveId('quadratic'), state: 'active', detail: '64' }),
    );
  });
});

describe('running samples', () => {
  it('counts every step of a short run, the dot climbing to its curve', () => {
    const { trace, model } = run(createGrowth({ n: 5 }), { type: 'run', sample: 'loop' });
    expect(trace.result).toBe(5);
    expect(lines(trace)).toEqual([
      'loop-start',
      ...Array.from({ length: 5 }, () => 'loop-step'),
      'loop-done',
    ]);
    expect(trace.steps.map((step) => step.scene.meta?.counted)).toEqual([0, 1, 2, 3, 4, 5, 5]);
    const counting = trace.steps[3]!.scene;
    expect(counting.elements).toContainEqual(
      expect.objectContaining({ kind: 'callout', id: COUNTER_ID, text: 'steps = 3' }),
    );
    expect(model.curves).toEqual(['linear']);
    expect(model.run).toEqual({ sample: 'loop', count: 5 });
    // At rest, the dot stays on the curve with the count, without the callout.
    const rest = growthToScene(model);
    expect(rest.elements.find((e) => e.id === RUN_DOT_ID)).toMatchObject({ state: 'found' });
    expect(rest.elements.some((e) => e.id === COUNTER_ID)).toBe(false);
    expect(rest.meta?.steps).toBe('5');
  });

  it('shows milestones for a long run', () => {
    expect(countsShown(3)).toEqual([1, 2, 3]);
    expect(countsShown(100)).toEqual([13, 25, 38, 50, 63, 75, 88, 100]);
    const { trace } = run(createGrowth({ n: 20 }), { type: 'run', sample: 'nested' });
    expect(keys(trace)).toContain('bigo.count.skip');
    expect(trace.steps.at(-2)?.scene.meta?.counted).toBe(400);
  });

  it('halves n down to 1, and does a lookup in one step', () => {
    expect(run(createGrowth({ n: 1000 }), { type: 'run', sample: 'halving' }).trace.result).toBe(9);
    const lookup = run(createGrowth({ n: 1000 }), { type: 'run', sample: 'lookup' });
    expect(lines(lookup.trace)).toEqual(['lookup-start', 'lookup-step', 'lookup-done']);
  });
});

describe('scenes', () => {
  it('carries n and the axes in meta, and describes the chart', () => {
    const scene = growthToScene(createGrowth({ n: 8, curves: ['constant', 'quadratic'] }));
    expect(scene.meta).toMatchObject({ n: 8, xMax: 10, yMax: 40 });
    expect(describeGrowth(scene)).toBe(
      'Growth chart up to n = 10, marked at n = 8. O(1): 1 step. O(n²): 64 steps.',
    );
  });
});
