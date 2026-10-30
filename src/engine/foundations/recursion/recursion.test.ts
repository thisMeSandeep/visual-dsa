import { config } from '@/config';

import type { Scene, SceneElement, Trace } from '../../core/types';
import { callShape, createRecursion, treeColumns } from './model';
import { traceRecursion, type RecursionOperation } from './operations';
import { recursionToScene } from './to-scene';

type Cell = Extract<SceneElement, { kind: 'cell' }>;

const lines = (trace: Trace) => trace.steps.flatMap((step) => step.codeLine ?? []);
const keys = (trace: Trace) =>
  trace.steps.map((step) => ('key' in step.caption ? step.caption.key : step.caption.text));
const frames = (scene: Scene) =>
  scene.elements
    .filter((e): e is Cell => e.kind === 'cell' && e.slot.type === 'frame')
    .map((cell) => `${cell.value}:${cell.state}`);
const nodes = (scene: Scene) =>
  scene.elements.filter((e): e is Cell => e.kind === 'cell' && e.slot.type === 'tree');
const run = (operation: RecursionOperation) => traceRecursion(createRecursion(), operation);

describe('the call shape', () => {
  it('lists every call fib(4) makes, depth first', () => {
    const shape = callShape('fib', 4);
    expect(shape).toHaveLength(9);
    expect(shape.map((call) => call.depth)).toEqual([0, 1, 2, 3, 3, 2, 1, 2, 2]);
  });

  it('memoising skips the repeats', () => {
    expect(callShape('fibMemo', 5)).toHaveLength(9);
    expect(callShape('fib', 5)).toHaveLength(15);
  });

  it('lays the tree out tidily: leaves left to right, parents between', () => {
    const columns = treeColumns(callShape('fib', 3));
    // fib(3) → fib(2) → fib(1), fib(0); fib(1).
    expect(columns).toEqual([1.25, 0.5, 0, 1, 2]);
  });
});

describe('factorial', () => {
  it('pushes a frame per call down to the base case, then returns back up', () => {
    const { trace } = run({ type: 'fact', n: 3 });
    expect(trace.result).toBe(6);
    expect(lines(trace)).toEqual([
      'fact-call',
      'fact-call',
      'fact-base',
      'fact-return',
      'fact-return',
    ]);
    expect(frames(trace.steps[2]!.scene)).toEqual([
      'fact(3):default',
      'fact(2):default',
      'fact(1):found',
    ]);
    // fact(1) has come off, and fact(2) returns 2.
    expect(frames(trace.steps[3]!.scene)).toEqual(['fact(3):default', 'fact(2):found']);
    expect(frames(trace.steps.at(-1)!.scene)).toEqual([]);
    expect(keys(trace).at(-1)).toBe('recursion.done');
  });

  it('keeps room for the deepest the stack gets, and draws no tree', () => {
    const { trace } = run({ type: 'fact', n: 4 });
    expect(trace.steps.every((step) => step.scene.meta?.reserve === 4)).toBe(true);
    expect(nodes(trace.steps[0]!.scene)).toHaveLength(0);
  });

  it('shows what each frame is waiting for, and then its answer', () => {
    const { trace } = run({ type: 'fact', n: 3 });
    const detail = (step: number, value: string) =>
      trace.steps[step]!.scene.elements.find(
        (e): e is Cell => e.kind === 'cell' && e.value === value,
      )?.detail;
    expect(detail(0, 'fact(3)')).toBe('3 × fact(2)');
    expect(detail(4, 'fact(3)')).toBe('3 × 2 = 6');
    expect(trace.steps[2]!.a11y).toContain('Call stack, top first: fact(1), base case: 1;');
  });

  it('refuses n too big to draw', () => {
    const { trace } = run({ type: 'fact', n: config.recursion.maxFactorial + 1 });
    expect(keys(trace)).toEqual(['recursion.too-big']);
  });
});

describe('fibonacci', () => {
  it('makes two calls per non-base call and grows the call tree', () => {
    const { trace } = run({ type: 'fib', n: 4 });
    expect(trace.result).toBe(3);
    const last = trace.steps.at(-1)!.scene;
    expect(nodes(last)).toHaveLength(9);
    expect(last.elements.filter((e) => e.kind === 'edge')).toHaveLength(8);
    expect(last.meta).toMatchObject({ calls: 9, columns: 5, levels: 4 });
    expect(nodes(last).every((node) => node.state === 'visited')).toBe(true);
    expect(lines(trace)).toContain('fib-right');
  });

  it('keeps every call at the column worked out first', () => {
    const { trace } = run({ type: 'fib', n: 4 });
    const columns = treeColumns(callShape('fib', 4));
    nodes(trace.steps.at(-1)!.scene).forEach((node, index) => {
      expect(node.slot).toMatchObject({ type: 'tree', column: columns[index] });
    });
  });

  it('with a memo, answers repeats from it instead of calling again', () => {
    const { trace } = run({ type: 'fibMemo', n: 5 });
    expect(trace.result).toBe(5);
    expect(trace.steps.at(-1)!.scene.meta?.calls).toBe(9);
    expect(keys(trace).filter((key) => key === 'recursion.memo.hit')).toHaveLength(2);
    expect(trace.steps.at(-1)!.scene.meta?.memo).toBe('f(2)=1 f(3)=2 f(4)=3 f(5)=5');
    expect(nodes(trace.steps.at(-1)!.scene).filter((node) => node.state === 'found')).toHaveLength(
      2,
    );
  });
});

describe('no base case', () => {
  it('keeps calling until the stack overflows', () => {
    const broken = traceRecursion(createRecursion(3), { type: 'broken' }).trace;
    expect(lines(broken)).toEqual(Array(config.recursion.maxDepth).fill('broken-call'));
    expect(broken.error?.code).toBe('recursion.overflow');
    const last = broken.steps.at(-1)!.scene;
    expect(last.meta?.container).toBe('error');
    expect(frames(last).every((frame) => frame.endsWith(':error'))).toBe(true);
    expect(frames(last)[config.recursion.maxDepth - 1]).toBe(
      `fact(${3 - config.recursion.maxDepth + 1}):error`,
    );
  });
});

describe('at rest', () => {
  it('is an empty stack that keeps its n for the next run', () => {
    const model = createRecursion(5);
    expect(recursionToScene(model).elements).toEqual([]);
    expect(traceRecursion(model, { type: 'fact' }).model.n).toBe(5);
    expect(traceRecursion(model, { type: 'fact' }).trace.result).toBe(120);
  });
});
