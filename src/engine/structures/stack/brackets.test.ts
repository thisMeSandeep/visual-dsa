import type { Scene, SceneElement, Trace } from '../../core/types';
import { bracketsToScene, createBrackets, describeBrackets, traceBrackets } from './brackets';

const lines = (trace: Trace) => trace.steps.map((step) => step.codeLine);
const keys = (trace: Trace) =>
  trace.steps.map((step) => ('key' in step.caption ? step.caption.key : step.caption.text));

type Cell = Extract<SceneElement, { kind: 'cell' }>;
const cells = (scene: Scene, type: 'index' | 'input') =>
  scene.elements.filter((e): e is Cell => e.kind === 'cell' && e.slot.type === type);
const stackValues = (scene: Scene) => cells(scene, 'index').map((cell) => cell.value);
const charStates = (scene: Scene) => cells(scene, 'input').map((cell) => cell.state);

const run = (expression: string) => traceBrackets(createBrackets(expression)).trace;

describe('createBrackets', () => {
  it('sizes the stack to hold every opening bracket', () => {
    expect(createBrackets('((5+3)+1)(2+9)').stack.capacity).toBe(3);
    expect(createBrackets('2+9').stack.capacity).toBe(1);
  });

  it('rejects an empty or overlong expression', () => {
    expect(() => createBrackets('')).toThrow(RangeError);
    expect(() => createBrackets('('.repeat(17))).toThrow(RangeError);
  });
});

describe('traceBrackets', () => {
  it('pushes openers and pops each one its partner closes', () => {
    const trace = run('(1)[2]');
    expect(trace.result).toBe(true);
    expect(trace.error).toBeUndefined();
    expect(lines(trace)).toEqual([
      'scan',
      'push-open',
      'close-match',
      'pop-open',
      'push-open',
      'close-match',
      'pop-open',
      'balanced',
    ]);
  });

  it('shows nested brackets waiting on the stack', () => {
    const trace = run('((5+3)+1)(2+9)');
    expect(trace.result).toBe(true);
    const deepest = trace.steps[2]?.scene;
    expect(deepest && stackValues(deepest)).toEqual(['(', '(']);
    expect(trace.steps.filter((step) => step.codeLine === 'push-open')).toHaveLength(3);
  });

  it('marks read characters, the current one, and those still to come', () => {
    const trace = run('(1)');
    const [start, pushed, matched] = trace.steps;
    expect(start && charStates(start.scene)).toEqual(['default', 'default', 'default']);
    expect(pushed && charStates(pushed.scene)).toEqual(['active', 'default', 'default']);
    expect(matched && charStates(matched.scene)).toEqual(['dimmed', 'dimmed', 'found']);
    expect(trace.steps.at(-1) && charStates(trace.steps.at(-1)!.scene)).toEqual([
      'dimmed',
      'dimmed',
      'dimmed',
    ]);
  });

  it('fails on a closer with nothing to close', () => {
    const trace = run('1)');
    expect(trace.result).toBe(false);
    expect(trace.error?.code).toBe('brackets.unmatched');
    expect(lines(trace)).toEqual(['scan', 'close-empty']);
    expect(trace.steps.at(-1)?.scene.meta?.container).toBe('error');
  });

  it('fails on a closer of the wrong kind', () => {
    const trace = run('(]');
    expect(trace.error).toEqual({
      code: 'brackets.mismatch',
      message: { key: 'brackets.mismatch', params: { bracket: ']', open: '(' } },
    });
    expect(lines(trace)).toEqual(['scan', 'push-open', 'mismatch']);
  });

  it('fails when openers are left at the end', () => {
    const trace = run('(()');
    expect(trace.error).toEqual({
      code: 'brackets.unclosed',
      message: { key: 'brackets.unclosed', params: { count: 1 } },
    });
    expect(keys(trace).at(-1)).toBe('brackets.unclosed');
    const last = trace.steps.at(-1)!.scene;
    expect(cells(last, 'index').map((cell) => cell.state)).toEqual(['error']);
  });

  it('counts each comparison and stack write', () => {
    expect(run('(1)').steps.at(-1)?.counters).toEqual({
      comparisons: 2,
      swaps: 0,
      reads: 1,
      writes: 2,
    });
  });
});

describe('describeBrackets', () => {
  it('says where the reading is and what the stack holds', () => {
    const model = createBrackets('(1)');
    expect(describeBrackets(bracketsToScene(model))).toBe(
      'Reading (1), before the first character. Empty stack, capacity 1.',
    );
    const trace = run('(1)');
    expect(trace.steps[1]?.a11y).toBe(
      'Reading (1), at character 1: (. Stack of 1 item, capacity 1. Top: (. Bottom to top: (.',
    );
    expect(trace.steps.at(-1)?.a11y).toBe(
      'Reading (1), after the last character. Empty stack, capacity 1.',
    );
  });
});
