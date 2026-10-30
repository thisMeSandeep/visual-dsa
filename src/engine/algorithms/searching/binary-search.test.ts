import type { ElementState, Scene, SceneElement, Trace } from '../../core/types';
import { describeSearch } from './describe';
import { createSortedArray, isSorted } from './model';
import { traceSearch, type SearchOperation } from './operations';
import { searchToScene } from './to-scene';

type Cell = Extract<SceneElement, { kind: 'cell' }>;
type Pointer = Extract<SceneElement, { kind: 'pointer' }>;

const lines = (trace: Trace) => trace.steps.map((step) => step.codeLine);
const keys = (trace: Trace) =>
  trace.steps.map((step) => ('key' in step.caption ? step.caption.key : step.caption.text));
const states = (scene: Scene): ElementState[] =>
  scene.elements.filter((e): e is Cell => e.kind === 'cell').map((cell) => cell.state);
const pointers = (scene: Scene) =>
  Object.fromEntries(
    scene.elements
      .filter((e): e is Pointer => e.kind === 'pointer')
      .map((pointer) => [pointer.label, pointer.target]),
  );
const run = (items: string[], operation: SearchOperation) =>
  traceSearch(createSortedArray(items), operation).trace;

const EIGHT = ['3', '8', '12', '17', '23', '31', '42', '56'];

describe('createSortedArray', () => {
  it('has one slot per value, and at least one', () => {
    expect(createSortedArray(EIGHT).slots).toHaveLength(8);
    expect(createSortedArray().slots).toHaveLength(1);
  });

  it('only takes numbers', () => {
    expect(() => createSortedArray(['3', 'Sid'])).toThrow(RangeError);
    expect(() => createSortedArray([' '])).toThrow(RangeError);
  });

  it('compares values as numbers, not text', () => {
    expect(isSorted(createSortedArray(['2', '10', '100']))).toBe(true);
    expect(isSorted(createSortedArray(['10', '2']))).toBe(false);
    expect(isSorted(createSortedArray(['5', '5']))).toBe(true);
  });
});

describe('binarySearch', () => {
  it('halves the range until mid lands on the target', () => {
    const trace = run(EIGHT, { type: 'binarySearch', value: '42' });
    expect(trace.result).toBe(6);
    // mid 3 (17) → go right, mid 5 (31) → go right, mid 6 (42) → found.
    expect(lines(trace)).toEqual(['init', 'mid', 'go-right', 'mid', 'go-right', 'mid', 'found']);
    expect(trace.steps.map((step) => step.vars?.mid)).toEqual([
      undefined,
      '3',
      '3',
      '5',
      '5',
      '6',
      '6',
    ]);
    expect(trace.steps.at(-1)?.counters).toMatchObject({ comparisons: 3, reads: 3 });
  });

  it('starts with low and high at the ends, and nothing dimmed', () => {
    const first = run(EIGHT, { type: 'binarySearch', value: '42' }).steps[0]!.scene;
    expect(pointers(first)).toEqual({ low: 'item-0', high: 'item-7' });
    expect(states(first).every((state) => state === 'default')).toBe(true);
  });

  it('dims the half it throws away, mid included, and moves low past mid', () => {
    const step = run(EIGHT, { type: 'binarySearch', value: '42' }).steps[2]!;
    expect(states(step.scene)).toEqual([
      ...Array<ElementState>(4).fill('dimmed'),
      ...Array<ElementState>(4).fill('default'),
    ]);
    expect(pointers(step.scene)).toEqual({ mid: 'item-3', low: 'item-4', high: 'item-7' });
    expect(step.scene.meta).toMatchObject({ range: 4, low: 4, high: 7 });
  });

  it('marks mid active while checking it, and found when it matches', () => {
    const trace = run(EIGHT, { type: 'binarySearch', value: '42' });
    expect(states(trace.steps[1]!.scene)[3]).toBe('active');
    expect(states(trace.steps.at(-1)!.scene)[6]).toBe('found');
    expect(trace.steps.at(-1)!.a11y).toContain('Found 42 at index 6.');
  });

  it('moves high left when mid is too big', () => {
    const trace = run(EIGHT, { type: 'binarySearch', value: '8' });
    expect(trace.result).toBe(1);
    expect(lines(trace)).toEqual(['init', 'mid', 'go-left', 'mid', 'found']);
    expect(pointers(trace.steps[2]!.scene)).toMatchObject({ low: 'item-0', high: 'item-2' });
  });

  it('reports not found once low passes high, leaving the crossed pointers', () => {
    const trace = run(EIGHT, { type: 'binarySearch', value: '20' });
    expect(trace.result).toBe(-1);
    expect(lines(trace).at(-1)).toBe('not-found');
    expect(keys(trace).at(-1)).toBe('binary-search.not-found');
    const last = trace.steps.at(-1)!.scene;
    expect(last.meta).toMatchObject({ range: 0 });
    expect(Number(last.meta?.low)).toBe(Number(last.meta?.high) + 1);
    expect(states(last).every((state) => state === 'dimmed')).toBe(true);
    expect(trace.steps.at(-1)!.a11y).toContain('Nothing left to search.');
  });

  it('drops a pointer that runs off either end', () => {
    const past = run(EIGHT, { type: 'binarySearch', value: '99' }).steps.at(-1)!.scene;
    expect(pointers(past)).toEqual({ high: 'item-7' });
    const before = run(EIGHT, { type: 'binarySearch', value: '1' }).steps.at(-1)!.scene;
    expect(pointers(before)).toEqual({ low: 'item-0' });
  });

  it('takes about log₂ n checks at most', () => {
    const twelve = Array.from({ length: 12 }, (_, i) => String(i * 5));
    for (const value of [...twelve, '1', '99']) {
      const trace = run(twelve, { type: 'binarySearch', value });
      expect(trace.steps.at(-1)!.counters.comparisons).toBeLessThanOrEqual(4);
    }
  });

  it('handles one item and an empty array', () => {
    expect(run(['7'], { type: 'binarySearch', value: '7' }).result).toBe(0);
    expect(run(['7'], { type: 'binarySearch', value: '3' }).result).toBe(-1);
    const empty = run([], { type: 'binarySearch', value: '3' });
    expect(empty.result).toBe(-1);
    expect(keys(empty)).toEqual(['binary-search.empty']);
  });

  it('can miss a value in an unsorted array, and says why', () => {
    const trace = run(['23', '8', '42', '17', '5', '31', '12', '3'], {
      type: 'binarySearch',
      value: '5',
    });
    expect(trace.result).toBe(-1);
    expect(keys(trace).at(-1)).toBe('binary-search.not-found.unsorted');
    expect(trace.steps[0]!.a11y).toContain('Not sorted.');
  });

  it('never changes the array', () => {
    const model = createSortedArray(EIGHT);
    expect(traceSearch(model, { type: 'binarySearch', value: '42' }).model).toBe(model);
  });
});

describe('findFirst and findLast', () => {
  const SEVENS = ['2', '5', '7', '7', '7', '7', '9', '12'];

  it('the plain search stops at whichever match it lands on', () => {
    expect(run(SEVENS, { type: 'binarySearch', value: '7' }).result).toBe(3);
  });

  it('findFirst remembers a match and keeps looking left', () => {
    const trace = run(SEVENS, { type: 'findFirst', value: '7' });
    expect(trace.result).toBe(2);
    expect(lines(trace)).toEqual([
      'first-init',
      'first-mid',
      'first-match',
      'first-mid',
      'first-go-right',
      'first-mid',
      'first-match',
      'first-done',
    ]);
    // The remembered answer stays found even after the range moves away from it.
    expect(states(trace.steps[3]!.scene)[3]).toBe('found');
    expect(trace.steps.at(-1)?.vars?.result).toBe('2');
  });

  it('findLast keeps looking right', () => {
    const trace = run(SEVENS, { type: 'findLast', value: '7' });
    expect(trace.result).toBe(5);
    expect(lines(trace).at(-1)).toBe('last-done');
  });

  it('both report not found when there is no match', () => {
    expect(run(SEVENS, { type: 'findFirst', value: '6' }).result).toBe(-1);
    expect(run(SEVENS, { type: 'findLast', value: '6' }).result).toBe(-1);
  });
});

describe('searchToScene and describeSearch', () => {
  it('shows the array at rest with room kept for low and high', () => {
    const scene = searchToScene(createSortedArray(EIGHT));
    expect(scene.renderer).toBe('array');
    expect(scene.meta).toMatchObject({ range: 8, sorted: 'yes', laneBelow: 1 });
    expect(pointers(scene)).toEqual({});
  });

  it('names every pointer and the range left', () => {
    const scene = searchToScene(createSortedArray(EIGHT), { low: 0, high: 7, mid: 3 });
    expect(describeSearch(scene)).toBe(
      'Array of 8 items, 8 slots: 3, 8, 12, 17, 23, 31, 42, 56. mid at index 3. low at index 0. ' +
        'high at index 7. Searching index 0 to 7.',
    );
  });
});
