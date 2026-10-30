import { createRng } from '../../core/rng';
import type { ElementState, Scene, SceneElement, Trace } from '../../core/types';
import {
  createMergeArray,
  describeMerge,
  encodeLevels,
  mergeToScene,
  splitLevels,
  traceMergeSort,
  type MergeModel,
} from './merge';

type Cell = Extract<SceneElement, { kind: 'cell' }>;

const lines = (trace: Trace) => trace.steps.flatMap((step) => step.codeLine ?? []);
const keys = (trace: Trace) =>
  trace.steps.map((step) => ('key' in step.caption ? step.caption.key : step.caption.text));
const top = (model: MergeModel) => model.rows[0]!.flatMap((item) => (item ? [item.value] : []));
const cells = (scene: Scene) => scene.elements.filter((e): e is Cell => e.kind === 'cell');
const levelOf = (cell: Cell) => (cell.slot.type === 'level' ? cell.slot.level : 0);
const sort = (items: string[], depth?: number) =>
  traceMergeSort(createMergeArray(items), depth === undefined ? {} : { depth });

describe('splitLevels', () => {
  it('halves each range until it has one item', () => {
    expect(encodeLevels(splitLevels(4))).toBe('0-4;0-2,2-4;0-1,1-2,2-3,3-4');
    expect(encodeLevels(splitLevels(3))).toBe('0-3;0-1,1-3;1-2,2-3');
    expect(splitLevels(8)).toHaveLength(4);
    expect(splitLevels(1)).toEqual([[[0, 1]]]);
  });
});

describe('merge sort', () => {
  it('sorts any array, as numbers', () => {
    const rng = createRng(11);
    for (let round = 0; round < 40; round++) {
      const items = Array.from({ length: rng.int(2, 12) }, () => String(rng.int(0, 99)));
      const { model, trace } = sort(items);
      expect(top(model).map(Number)).toEqual(items.map(Number).sort((a, b) => a - b));
      expect(model.rows.slice(1).every((row) => row.every((item) => item === null))).toBe(true);
      expect(cells(trace.steps.at(-1)!.scene).every((cell) => cell.state === 'sorted')).toBe(true);
    }
  });

  it('splits down a level, then merges back up smallest first', () => {
    const { trace } = sort(['6', '3', '8', '1']);
    expect(lines(trace)).toEqual([
      'split',
      'split',
      'take-right',
      'rest',
      'split',
      'take-right',
      'rest',
      // [3 6] with [1 8]: 1, then 3 and 6, then 8 is all that's left.
      'take-right',
      'take-left',
      'take-left',
      'rest',
    ]);
    // After the first split, all four are on level 1; after the second, 6 and 3 on level 2.
    const levels = (step: number) => cells(trace.steps[step]!.scene).map(levelOf);
    expect(levels(1)).toEqual([1, 1, 1, 1]);
    expect(levels(2)).toEqual([1, 1, 2, 2]);
    expect(trace.steps.at(-1)?.counters.comparisons).toBe(5);
  });

  it('dims what’s outside the range and marks the merged run sorted', () => {
    const { trace } = sort(['6', '3', '8', '1']);
    const merging = trace.steps.find((step) => step.codeLine === 'take-right')!;
    const states = Object.fromEntries(
      cells(merging.scene).map((cell): [string, ElementState] => [cell.value, cell.state]),
    );
    expect(states).toMatchObject({ '3': 'active', '6': 'active', '8': 'dimmed', '1': 'dimmed' });
    const merged = trace.steps.find(
      (step) => keys({ ...trace, steps: [step] })[0] === 'merge.merged',
    );
    expect(cells(merged!.scene).filter((cell) => cell.state === 'sorted')).toHaveLength(2);
  });

  it('is stable: equal values keep their order', () => {
    const { model, trace } = sort(['5a', '3', '5b', '1']);
    expect(model.rows[0]!.map((item) => `${item?.value}${item?.tag ?? ''}`)).toEqual([
      '1',
      '3',
      '5a',
      '5b',
    ]);
    expect(keys(trace)).toContain('merge.take.equal');
  });

  it('can merge two sorted halves with one split', () => {
    const { trace, model } = sort(['3', '27', '38', '43', '9', '10', '15', '82'], 1);
    expect(lines(trace).filter((line) => line === 'split')).toHaveLength(1);
    expect(top(model)).toEqual(['3', '9', '10', '15', '27', '38', '43', '82']);
  });

  it('says there’s nothing to do for 0 or 1 items', () => {
    expect(keys(sort([]).trace)).toEqual(['sort.trivial.empty']);
    expect(keys(sort(['4']).trace)).toEqual(['sort.trivial.one']);
  });

  it('keeps its split levels in the scene at rest, and describes each row', () => {
    const scene = mergeToScene(createMergeArray(['6', '3', '8', '1']));
    expect(scene.meta).toMatchObject({ size: 4, levels: '0-4;0-2,2-4;0-1,1-2,2-3,3-4' });
    const { trace } = sort(['6', '3', '8', '1']);
    expect(describeMerge(trace.steps[2]!.scene)).toBe(
      'Merge sort of 4 items. Level 1: 8, 1. Level 2: 6, 3.',
    );
  });
});
