import type { ElementState, Scene, SceneElement, Trace } from '../../core/types';
import { values } from '../../structures/array';
import {
  createWindowArray,
  traceWindow,
  windowToScene,
  type WindowOperation,
} from './sliding-window';
import { createPointerArray, tracePointers, type PointerOperation } from './two-pointers';

type Cell = Extract<SceneElement, { kind: 'cell' }>;
type Pointer = Extract<SceneElement, { kind: 'pointer' }>;

const lines = (trace: Trace) => trace.steps.flatMap((step) => step.codeLine ?? []);
const keys = (trace: Trace) =>
  trace.steps.map((step) => ('key' in step.caption ? step.caption.key : step.caption.text));
const row = (scene: Scene) =>
  scene.elements
    .filter((e): e is Cell => e.kind === 'cell' && e.slot.type === 'index')
    .sort((a, b) =>
      a.slot.type === 'index' && b.slot.type === 'index' ? a.slot.index - b.slot.index : 0,
    );
const states = (scene: Scene): ElementState[] => row(scene).map((cell) => cell.state);
const pointers = (scene: Scene) =>
  Object.fromEntries(
    scene.elements
      .filter((e): e is Pointer => e.kind === 'pointer')
      .map((pointer) => [pointer.label, pointer.target]),
  );
const pointer = (items: string[], operation: PointerOperation) =>
  tracePointers(createPointerArray(items), operation);
const window = (items: string[], operation: WindowOperation, k?: number) =>
  traceWindow(createWindowArray(items, k), operation);

describe('two pointers: reverse', () => {
  it('swaps the ends and steps both pointers in until they meet', () => {
    const { trace, model } = pointer(['1', '2', '3', '4', '5'], { type: 'reverse' });
    expect(values(model)).toEqual(['5', '4', '3', '2', '1']);
    expect(lines(trace)).toEqual(['reverse-start', 'reverse-swap', 'reverse-swap', 'reverse-done']);
    expect(pointers(trace.steps[0]!.scene)).toEqual({ left: 'item-0', right: 'item-4' });
    expect(states(trace.steps[2]!.scene)).toEqual([
      'sorted',
      'swapping',
      'default',
      'swapping',
      'sorted',
    ]);
    expect(trace.steps.at(-1)?.counters.swaps).toBe(2);
  });

  it('has nothing to do for one item', () => {
    expect(keys(pointer(['4'], { type: 'reverse' }).trace)).toEqual(['pointers.reverse.trivial']);
  });
});

describe('two pointers: pair sum', () => {
  const SORTED = ['1', '3', '4', '6', '8', '11'];

  it('moves left up when the sum is too small and right down when too big', () => {
    const { trace } = pointer(SORTED, { type: 'pairSum', target: 10 });
    // 1+11 big, 1+8 small, 3+8 big, 3+6 small, 4+6 found.
    expect(lines(trace)).toEqual([
      'pair-start',
      'pair-right',
      'pair-left',
      'pair-right',
      'pair-left',
      'pair-found',
    ]);
    expect(trace.result).toEqual([2, 3]);
    const last = trace.steps.at(-1)!.scene;
    expect(states(last)).toEqual(['dimmed', 'dimmed', 'found', 'found', 'dimmed', 'dimmed']);
    expect(last.meta?.sum).toBe(10);
  });

  it('reports no pair once the pointers meet, and warns when unsorted', () => {
    expect(keys(pointer(SORTED, { type: 'pairSum', target: 2 }).trace).at(-1)).toBe(
      'pointers.pair.none',
    );
    expect(keys(pointer(['8', '1', '6'], { type: 'pairSum', target: 7 }).trace).at(-1)).toBe(
      'pointers.pair.unsorted',
    );
  });

  it('takes at most n − 1 comparisons', () => {
    const { trace } = pointer(SORTED, { type: 'pairSum', target: 99 });
    expect(trace.steps.at(-1)!.counters.comparisons).toBe(5);
  });
});

describe('two pointers: remove duplicates', () => {
  it('copies each new value down to write and drops the rest', () => {
    const { trace, model } = pointer(['1', '1', '2', '3', '3', '4'], { type: 'removeDuplicates' });
    expect(values(model)).toEqual(['1', '2', '3', '4']);
    expect(model.slots).toHaveLength(6);
    expect(trace.result).toBe(4);
    expect(lines(trace)).toEqual([
      'dedupe-start',
      'dedupe-skip',
      'dedupe-keep',
      'dedupe-keep',
      'dedupe-skip',
      'dedupe-keep',
      'dedupe-done',
    ]);
    const keep = trace.steps[2]!.scene;
    // 2 was copied down to index 1 (a new item there), and write moved on to index 2.
    expect(states(keep).slice(0, 2)).toEqual(['sorted', 'new']);
    expect(pointers(keep)).toEqual({ read: 'item-2', write: 'item-2' });
    expect(keep.elements.find((e) => e.kind === 'pointer' && e.label === 'write')).toMatchObject({
      side: 'below',
    });
  });

  it('keeps a new value where it is when nothing has been skipped yet', () => {
    expect(keys(pointer(['1', '2', '2'], { type: 'removeDuplicates' }).trace)).toContain(
      'pointers.dedupe.keep-in-place',
    );
  });
});

describe('sliding window: max sum', () => {
  it('slides a window of k, adding the item that enters and dropping the one that leaves', () => {
    const { trace } = window(['2', '1', '5', '1', '3', '2'], { type: 'maxSum' }, 3);
    expect(lines(trace)).toEqual(['sum-start', 'sum-slide', 'sum-slide', 'sum-slide', 'sum-done']);
    expect(trace.result).toBe(9);
    const slide = trace.steps[1]!.scene;
    expect(states(slide)).toEqual(['dimmed', 'active', 'active', 'new', 'default', 'default']);
    expect(pointers(slide)).toEqual({ left: 'item-1', right: 'item-3' });
    expect(slide.meta).toMatchObject({ k: 3, sum: 7, best: 8 });
    expect(states(trace.steps.at(-1)!.scene)).toEqual([
      'default',
      'default',
      'found',
      'found',
      'found',
      'default',
    ]);
  });

  it('reads each item at most twice: O(n)', () => {
    const { trace } = window(['2', '1', '5', '1', '3', '2', '8', '1'], { type: 'maxSum' }, 3);
    expect(trace.steps.at(-1)!.counters.reads).toBe(3 + 2 * 5);
  });

  it('explains a window bigger than the array, and letters that can’t be summed', () => {
    expect(keys(window(['1', '2'], { type: 'maxSum' }, 2).trace)).not.toContain('window.too-small');
    expect(keys(window([], { type: 'maxSum' }).trace)).toEqual(['window.too-small']);
    expect(window(['a', 'b'], { type: 'maxSum' }, 2).trace.error?.code).toBe('window.not-numbers');
  });

  it('changes k within 1 and the number of items', () => {
    const model = createWindowArray(['1', '2', '3'], 2);
    expect(traceWindow(model, { type: 'setWindow', k: 3 }).model.k).toBe(3);
    const tooBig = traceWindow(model, { type: 'setWindow', k: 4 });
    expect(tooBig.model.k).toBe(2);
    expect(keys(tooBig.trace)).toEqual(['window.k.limit']);
    expect(windowToScene(model).meta?.k).toBe(2);
  });
});

describe('sliding window: longest run with no repeats', () => {
  it('grows on the right and shrinks from the left past a repeat', () => {
    const { trace } = window(['a', 'b', 'c', 'a', 'b', 'c', 'b', 'b'], { type: 'longestUnique' });
    expect(trace.result).toBe(3);
    expect(keys(trace)).toContain('window.unique.repeat');
    const repeat = trace.steps.find(
      (step) => keys({ ...trace, steps: [step] })[0] === 'window.unique.repeat',
    )!;
    expect(states(repeat.scene).slice(0, 4)).toEqual([
      'collision',
      'active',
      'active',
      'collision',
    ]);
  });

  it('can shrink by more than one when the repeat is further in', () => {
    const { trace } = window(['p', 'w', 'w', 'k', 'e', 'w'], { type: 'longestUnique' });
    expect(trace.result).toBe(3);
    // Two drops (p, then w, leaving it empty for a moment), then one more later.
    expect(keys(trace).filter((key) => key.startsWith('window.unique.shrink'))).toHaveLength(3);
    expect(keys(trace)).toContain('window.unique.shrink.empty');
  });

  it('handles an empty array', () => {
    expect(keys(window([], { type: 'longestUnique' }).trace)).toEqual(['window.empty']);
  });
});

describe('sliding window: window maximum with a deque', () => {
  it('finds every window’s maximum at the deque’s front', () => {
    const { trace } = window(['1', '3', '2', '5', '4', '2', '6', '1'], { type: 'windowMax' }, 3);
    expect(trace.result).toEqual([3, 5, 5, 5, 6, 6]);
    expect(lines(trace)).toContain('max-pop');
    expect(lines(trace)).toContain('max-expire');
    const record = trace.steps.find((step) => step.codeLine === 'max-record')!;
    expect(pointers(record.scene)).toMatchObject({ max: 'item-1' });
    expect(record.scene.meta?.deque).toBe('3 2');
    expect(record.a11y).toContain('Deque: 3 2.');
  });

  it('pushes and pops each item at most once', () => {
    const { trace } = window(['9', '8', '7', '6', '5', '4'], { type: 'windowMax' }, 2);
    expect(lines(trace).filter((line) => line === 'max-push')).toHaveLength(6);
    expect(trace.result).toEqual([9, 8, 7, 6, 5]);
  });
});
