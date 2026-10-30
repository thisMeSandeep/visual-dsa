import { createRng } from '../../core/rng';
import type { ElementState, Scene, SceneElement, Trace } from '../../core/types';
import { values } from '../../structures/array';
import { describeSort } from './describe';
import { createSortArray, isSortedArray, SORT_ALGORITHMS, type SortAlgorithm } from './model';
import { traceSort } from './operations';
import { sortToScene } from './to-scene';

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
const labels = (scene: Scene) => row(scene).map((cell) => `${cell.value}${cell.detail ?? ''}`);
const pointers = (scene: Scene) =>
  Object.fromEntries(
    scene.elements
      .filter((e): e is Pointer => e.kind === 'pointer')
      .map((pointer) => [pointer.label, pointer.target]),
  );
const sort = (items: string[], algorithm: SortAlgorithm) =>
  traceSort(createSortArray(items), algorithm);

describe('createSortArray', () => {
  it('takes numbers, with an optional letter tag', () => {
    const array = createSortArray(['5a', '3', '05b']);
    expect(values(array)).toEqual(['5', '3', '5']);
    expect(array.slots.map((item) => item?.tag)).toEqual(['a', undefined, 'b']);
    expect(() => createSortArray(['5', 'Sid'])).toThrow(RangeError);
  });
});

describe.each(SORT_ALGORITHMS)('%s', (algorithm) => {
  it('sorts any array, as numbers', () => {
    const rng = createRng(7);
    for (let round = 0; round < 40; round++) {
      const items = Array.from({ length: rng.int(2, 12) }, () => String(rng.int(0, 99)));
      const { model, trace } = sort(items, algorithm);
      expect(values(model).map(Number)).toEqual(items.map(Number).sort((a, b) => a - b));
      expect(isSortedArray(model)).toBe(true);
      expect(states(trace.steps.at(-1)!.scene).every((state) => state === 'sorted')).toBe(true);
    }
  });

  it('says there’s nothing to do for 0 or 1 items', () => {
    expect(keys(sort([], algorithm).trace)).toEqual(['sort.trivial.empty']);
    expect(keys(sort(['4'], algorithm).trace)).toEqual(['sort.trivial.one']);
  });

  it('keeps the same lanes at rest as while sorting', () => {
    const { trace } = sort(['3', '1', '2'], algorithm);
    const rest = sortToScene(algorithm)(createSortArray(['3', '1', '2']));
    for (const step of trace.steps) {
      expect(step.scene.meta?.laneBelow).toBe(rest.meta?.laneBelow);
      expect(step.scene.meta?.laneHeld).toBe(rest.meta?.laneHeld);
    }
  });
});

describe('bubble sort', () => {
  it('compares neighbours, swaps the ones out of order, and fixes one more per pass', () => {
    const { trace } = sort(['3', '1', '2'], 'bubble-sort');
    // Pass 1: 3>1 swap, 3>2 swap → 3 in place. Pass 2: 1<2 keep → no swaps, stop early.
    expect(lines(trace)).toEqual([
      'compare',
      'swap',
      'compare',
      'swap',
      'pass-done',
      'compare',
      'early-exit',
    ]);
    const passDone = trace.steps.find((step) => step.codeLine === 'pass-done')!;
    expect(states(passDone.scene)).toEqual(['default', 'default', 'sorted']);
    expect(trace.steps.at(-1)?.counters).toMatchObject({ comparisons: 3, swaps: 2 });
  });

  it('marks the pair active while comparing and swapping while trading places', () => {
    const { trace } = sort(['3', '1', '2'], 'bubble-sort');
    expect(states(trace.steps[1]!.scene)).toEqual(['active', 'active', 'default']);
    expect(states(trace.steps[2]!.scene)).toEqual(['swapping', 'swapping', 'default']);
    expect(labels(trace.steps[2]!.scene)).toEqual(['1', '3', '2']);
    expect(pointers(trace.steps[2]!.scene)).toEqual({ j: 'item-1' });
    expect(trace.steps[2]!.a11y).toContain('Swapping 1 and 3.');
  });

  it('stops after one pass on sorted input: O(n)', () => {
    const { trace } = sort(['1', '2', '3', '4', '5'], 'bubble-sort');
    expect(trace.steps.at(-1)?.counters).toMatchObject({ comparisons: 4, swaps: 0 });
    expect(keys(trace)).toContain('bubble.early-exit');
  });

  it('does n(n − 1)/2 comparisons and swaps on reversed input', () => {
    const { trace } = sort(['6', '5', '4', '3', '2', '1'], 'bubble-sort');
    expect(trace.steps.at(-1)?.counters).toMatchObject({ comparisons: 15, swaps: 15 });
    expect(keys(trace)).toContain('bubble.last-pass');
    expect(keys(trace)).not.toContain('bubble.early-exit');
  });

  it('is stable: equal values keep their order', () => {
    expect(labels(sort(['5a', '3', '5b', '1'], 'bubble-sort').trace.steps.at(-1)!.scene)).toEqual([
      '1',
      '3',
      '5a',
      '5b',
    ]);
  });
});

describe('selection sort', () => {
  it('scans for the smallest, then swaps it to the front of the rest', () => {
    const { trace } = sort(['3', '1', '2'], 'selection-sort');
    // i=0: 1<3 new min, 2 not smaller → swap 3 and 1. i=1: 2<3 new min → swap.
    expect(lines(trace)).toEqual(['scan', 'new-min', 'compare', 'swap', 'scan', 'new-min', 'swap']);
    expect(trace.steps.at(-1)?.counters).toMatchObject({ comparisons: 3, swaps: 2 });
  });

  it('points min and j at what it compares, and i up at the place to fill', () => {
    const { trace } = sort(['3', '1', '2'], 'selection-sort');
    const newMin = trace.steps[2]!.scene;
    expect(pointers(newMin)).toEqual({ min: 'item-1', j: 'item-1', i: 'item-0' });
    expect(newMin.elements.find((e) => e.kind === 'pointer' && e.label === 'i')).toMatchObject({
      side: 'below',
    });
  });

  it('grows the sorted part from the left', () => {
    const { trace } = sort(['3', '1', '2'], 'selection-sort');
    const secondScan = trace.steps.filter((step) => step.codeLine === 'scan')[1]!;
    expect(states(secondScan.scene)).toEqual(['sorted', 'active', 'default']);
  });

  it('skips the swap when the smallest is already in place', () => {
    const { trace } = sort(['1', '3', '2'], 'selection-sort');
    expect(keys(trace)).toContain('selection.in-place');
    expect(trace.steps.at(-1)?.counters.swaps).toBe(1);
  });

  it('always does n(n − 1)/2 comparisons, even on sorted input', () => {
    const { trace } = sort(['1', '2', '3', '4', '5', '6'], 'selection-sort');
    expect(trace.steps.at(-1)?.counters).toMatchObject({ comparisons: 15, swaps: 0 });
  });

  it('is not stable: a long swap can jump one 5 over the other', () => {
    expect(
      labels(sort(['5a', '3', '5b', '1'], 'selection-sort').trace.steps.at(-1)!.scene),
    ).toEqual(['1', '3', '5b', '5a']);
  });
});

describe('insertion sort', () => {
  it('takes each key out, shifts bigger items right, and drops it into the gap', () => {
    const { trace } = sort(['3', '1', '2'], 'insertion-sort');
    // i=1: key 1, shift 3 → front. i=2: key 2, shift 3, 1 isn't bigger → insert at 1.
    expect(lines(trace)).toEqual(['take', 'shift', 'insert', 'take', 'shift', 'insert']);
    expect(keys(trace)).toContain('insertion.front');
    expect(trace.steps.at(-1)?.counters).toMatchObject({ comparisons: 3, writes: 4, swaps: 0 });
  });

  it('holds the key above its gap, which moves left as items shift', () => {
    const { trace } = sort(['3', '1', '2'], 'insertion-sort');
    const held = (step: number) =>
      trace.steps[step]!.scene.elements.find(
        (e): e is Cell => e.kind === 'cell' && e.slot.type === 'held',
      );
    expect(held(1)).toMatchObject({
      value: '1',
      state: 'active',
      slot: { type: 'held', index: 1 },
    });
    expect(labels(trace.steps[1]!.scene)).toEqual(['3', '2']);
    expect(held(2)?.slot).toEqual({ type: 'held', index: 0 });
    expect(held(3)).toBeUndefined();
    expect(trace.steps[1]!.a11y).toContain('Holding 1 above index 1.');
    expect(trace.steps[1]!.scene.meta?.laneHeld).toBe(1);
  });

  it('barely moves anything on nearly sorted input', () => {
    const { trace } = sort(['1', '2', '4', '3', '5', '6'], 'insertion-sort');
    expect(trace.steps.at(-1)?.counters).toMatchObject({ comparisons: 6, writes: 6 });
    expect(keys(trace).filter((key) => key === 'insertion.stay')).toHaveLength(4);
  });

  it('is stable: equal values keep their order', () => {
    expect(
      labels(sort(['5a', '3', '5b', '1'], 'insertion-sort').trace.steps.at(-1)!.scene),
    ).toEqual(['1', '3', '5a', '5b']);
  });
});

describe('describeSort', () => {
  it('counts the items in place', () => {
    const { trace } = sort(['3', '1', '2'], 'bubble-sort');
    expect(describeSort(trace.steps.at(-1)!.scene)).toContain('3 of 3 sorted.');
  });
});

describe('running some rounds', () => {
  it('runs one bubble pass, then carries on from it with the tail kept', () => {
    const start = createSortArray(['5', '2', '6', '3', '8', '1']);
    const first = traceSort(start, 'bubble-sort', { rounds: 1 });
    expect(values(first.model)).toEqual(['2', '5', '3', '6', '1', '8']);
    expect(keys(first.trace).at(-1)).toBe('bubble.pass-done');
    const rest = traceSort(first.model, 'bubble-sort', { from: 1 });
    expect(keys(rest.trace)[0]).toBe('bubble.compare.keep');
    expect(states(rest.trace.steps[0]!.scene).at(-1)).toBe('sorted');
    expect(values(rest.model)).toEqual(['1', '2', '3', '5', '6', '8']);
    expect(keys(rest.trace).at(-1)).toBe('sort.done.rest');
  });

  it('places one item per selection or insertion round, finishing on the last', () => {
    const selection = traceSort(createSortArray(['3', '1', '2']), 'selection-sort', {
      from: 1,
      rounds: 1,
    });
    expect(lines(selection.trace)).toEqual(['scan', 'compare', 'place']);
    expect(keys(selection.trace).at(-1)).toBe('sort.done.rest');

    const insertion = traceSort(createSortArray(['3', '1', '2']), 'insertion-sort', { rounds: 1 });
    expect(values(insertion.model)).toEqual(['1', '3', '2']);
    expect(keys(insertion.trace)).not.toContain('insertion.done');
  });
});

describe('quick sort', () => {
  it('partitions around the last item, then sorts each side', () => {
    const { trace, model } = sort(['3', '1', '2'], 'quick-sort');
    // Pivot 2: 3 > 2 stays, 1 ≤ 2 swaps to index 0, the pivot swaps into index 1.
    expect(lines(trace)).toEqual(['pivot', 'compare', 'compare', 'swap', 'place']);
    expect(values(model)).toEqual(['1', '2', '3']);
    expect(keys(trace)).toEqual(
      expect.arrayContaining(['quick.big', 'quick.small', 'quick.place', 'quick.single']),
    );
  });

  it('marks the pivot, points i up from below and j down, and dims outside the range', () => {
    const { trace } = sort(['5', '9', '1', '7', '3', '8', '4'], 'quick-sort');
    const compare = trace.steps.find((step) => step.codeLine === 'compare')!;
    expect(states(compare.scene)[6]).toBe('pivot');
    expect(states(compare.scene)[0]).toBe('active');
    expect(pointers(compare.scene)).toEqual({ j: 'item-0', i: 'item-0' });
    // The second partition works on the left side only: the pivot is sorted, the right dimmed.
    const second = trace.steps.filter((step) => step.codeLine === 'pivot')[1]!;
    expect(states(second.scene)).toContain('sorted');
    expect(states(second.scene)).toContain('dimmed');
  });

  it('degrades to n(n − 1)/2 comparisons on sorted input with the last item as pivot', () => {
    const { trace } = sort(['1', '2', '3', '4', '5', '6', '7'], 'quick-sort');
    expect(trace.steps.at(-1)?.counters.comparisons).toBe(21);
  });

  it('does far fewer with a random pivot, the same way every time', () => {
    const run = () =>
      traceSort(createSortArray(['1', '2', '3', '4', '5', '6', '7']), 'quick-sort', {
        pivot: 'random',
      });
    const { trace, model } = run();
    expect(values(model)).toEqual(['1', '2', '3', '4', '5', '6', '7']);
    expect(trace.steps.at(-1)!.counters.comparisons).toBeLessThan(21);
    expect(lines(trace)).toContain('random-pivot');
    expect(run().trace.steps.length).toBe(trace.steps.length);
  });

  it('shows one partition, then the rest with the first done out of sight', () => {
    const start = createSortArray(['5', '9', '1', '7', '3', '8', '4']);
    const first = traceSort(start, 'quick-sort', { rounds: 1 });
    expect(lines(first.trace).filter((line) => line === 'pivot')).toHaveLength(1);
    expect(keys(first.trace).at(-1)).toBe('quick.place');
    const rest = traceSort(start, 'quick-sort', { from: 1 });
    expect(rest.trace.steps[0]!.counters.comparisons).toBe(0);
    expect(states(rest.trace.steps[0]!.scene)).toContain('sorted');
    expect(values(rest.model)).toEqual(['1', '3', '4', '5', '7', '8', '9']);
    expect(keys(rest.trace).at(-1)).toBe('sort.done.rest');
  });
});
