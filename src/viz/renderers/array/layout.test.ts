import { createSortedArray, searchToScene } from '@/engine/algorithms/searching';
import { createSortArray, sortToScene, traceSort } from '@/engine/algorithms/sorting';
import { arrayToScene, createArray, traceArray } from '@/engine/structures/array';

import type {
  BoxDrawable,
  Drawable,
  LineDrawable,
  PathDrawable,
  TextDrawable,
} from '../../canvas/types';
import { SIZES } from '../../sizes.fixture';
import { frameId, layoutArray, sourceFrameId } from './layout';

const boxes = (drawables: Drawable[]) =>
  drawables.filter((d): d is BoxDrawable => d.kind === 'box');
const byId = <T extends Drawable>(drawables: Drawable[], id: string) =>
  drawables.find((d) => d.id === id) as T | undefined;

describe('layoutArray', () => {
  it('draws every slot of the capacity with its index, items in their slots', () => {
    const { drawables } = layoutArray(arrayToScene(createArray(['23', '8'], 4)), SIZES);
    expect(boxes(drawables).filter((b) => b.id.startsWith('slot-'))).toHaveLength(4);
    expect(byId<TextDrawable>(drawables, 'index-3')?.text).toBe('3');
    const slot1 = byId<BoxDrawable>(drawables, 'slot-1')!;
    expect(byId<BoxDrawable>(drawables, 'item-1')).toMatchObject({ x: slot1.x, y: slot1.y });
  });

  it('shows memory addresses under the indices only when asked', () => {
    const plain = layoutArray(arrayToScene(createArray(['1'], 3)), SIZES);
    expect(byId(plain.drawables, 'address-0')).toBeUndefined();
    const shown = layoutArray(
      arrayToScene(createArray(['1'], 3, { addresses: { base: 1000, stride: 4 } })),
      SIZES,
    );
    expect(byId<TextDrawable>(shown.drawables, 'address-2')?.text).toBe('1008');
    expect(shown.height).toBeGreaterThan(plain.height);
  });

  it('points i down at its item from above', () => {
    const { trace } = traceArray(createArray(['23', '8', '42']), { type: 'get', index: 2 });
    const { drawables } = layoutArray(trace.steps.at(-1)!.scene, SIZES);
    const item = byId<BoxDrawable>(drawables, 'item-2')!;
    const label = byId<TextDrawable>(drawables, 'pointer-i')!;
    const arrow = byId<LineDrawable>(drawables, 'pointer-i-arrow')!;
    expect(label).toMatchObject({ text: 'i', x: item.x + item.width / 2 });
    expect(arrow.y2).toBeLessThan(item.y);
    expect(label.y).toBeLessThan(arrow.y1);
  });

  it('points low and high up from under the indices, quieter than mid above', () => {
    const scene = searchToScene(createSortedArray(['1', '2', '3', '4']), {
      low: 0,
      high: 3,
      mid: 1,
    });
    const { drawables } = layoutArray(scene, SIZES);
    const index = byId<TextDrawable>(drawables, 'index-0')!;
    const low = byId<TextDrawable>(drawables, 'pointer-low')!;
    const lowArrow = byId<LineDrawable>(drawables, 'pointer-low-arrow')!;
    const mid = byId<TextDrawable>(drawables, 'pointer-mid')!;
    expect(lowArrow.y2).toBeGreaterThan(index.y);
    expect(lowArrow.y2).toBeLessThan(lowArrow.y1);
    expect(low.y).toBeGreaterThan(lowArrow.y1);
    expect(low).toMatchObject({ tone: 'ink-2', align: 'center' });
    expect(mid).toMatchObject({ tone: 'signal-ink' });
  });

  it('puts two pointers at the same item either side of their arrow', () => {
    const scene = searchToScene(createSortedArray(['1', '2', '3']), { low: 2, high: 2 });
    const { drawables } = layoutArray(scene, SIZES);
    const low = byId<TextDrawable>(drawables, 'pointer-low')!;
    const high = byId<TextDrawable>(drawables, 'pointer-high')!;
    const arrow = byId<LineDrawable>(drawables, 'pointer-low-arrow')!;
    expect(low).toMatchObject({ align: 'right' });
    expect(high).toMatchObject({ align: 'left' });
    expect(low.x).toBeLessThan(arrow.x1);
    expect(high.x).toBeGreaterThan(arrow.x1);
  });

  it('keeps the same size whether or not low and high are showing', () => {
    const model = createSortedArray(['1', '2', '3']);
    const resting = layoutArray(searchToScene(model), SIZES);
    const searching = layoutArray(searchToScene(model, { low: 0, high: 2, mid: 1 }), SIZES);
    const plain = layoutArray(arrayToScene(model), SIZES);
    expect(resting.height).toBe(searching.height);
    expect(plain.height).toBeLessThan(resting.height);
  });

  it('lifts a held item above its slot, with room kept for it at rest', () => {
    const { trace } = traceSort(createSortArray(['3', '1', '2']), 'insertion-sort');
    const { drawables, height } = layoutArray(trace.steps[1]!.scene, SIZES);
    const key = byId<BoxDrawable>(drawables, 'item-1')!;
    const slot = byId<BoxDrawable>(drawables, 'slot-1')!;
    expect(key.x).toBe(slot.x);
    expect(key.y + key.height).toBeLessThan(slot.y);
    const rest = layoutArray(
      sortToScene('insertion-sort')(createSortArray(['3', '1', '2'])),
      SIZES,
    );
    expect(rest.height).toBe(height);
  });

  it('moves swapping items along an arc, and only those', () => {
    const { trace } = traceSort(createSortArray(['3', '1', '2']), 'bubble-sort');
    const swapping = layoutArray(trace.steps[2]!.scene, SIZES).drawables;
    expect(byId<BoxDrawable>(swapping, 'item-0')).toMatchObject({ arc: true });
    expect(byId<BoxDrawable>(swapping, 'item-1')).toMatchObject({ arc: true });
    expect(byId<BoxDrawable>(swapping, 'item-2')?.arc).toBeUndefined();
  });

  it('shows an item’s tag as its second line', () => {
    const { drawables } = layoutArray(arrayToScene(createSortArray(['5a', '3'])), SIZES);
    expect(byId<BoxDrawable>(drawables, 'item-0')).toMatchObject({ value: '5', detail: 'a' });
  });

  it('draws the old array above while growing, and the copied item down in the new one', () => {
    const { trace } = traceArray(createArray(['1', '2'], 2), { type: 'push', value: '3' });
    const copying = layoutArray(trace.steps[2]!.scene, SIZES);
    const copied = byId<BoxDrawable>(copying.drawables, 'item-0')!;
    const waiting = byId<BoxDrawable>(copying.drawables, 'item-1')!;
    const leftBehind = byId<BoxDrawable>(copying.drawables, 'copied:item-0')!;
    expect(byId<PathDrawable>(copying.drawables, sourceFrameId(2))).toBeDefined();
    expect(byId<PathDrawable>(copying.drawables, frameId(4))).toBeDefined();
    expect(waiting.y).toBe(leftBehind.y);
    expect(copied.y).toBeGreaterThan(waiting.y);
    expect(leftBehind.state).toBe('dimmed');

    const done = layoutArray(trace.steps.at(-1)!.scene, SIZES);
    expect(byId(done.drawables, sourceFrameId(2))).toBeUndefined();
    expect(done.height).toBeLessThan(copying.height);
  });

  it('turns the frame red on an out-of-bounds index', () => {
    const { trace } = traceArray(createArray(['1']), { type: 'get', index: 3 });
    const { drawables } = layoutArray(trace.steps.at(-1)!.scene, SIZES);
    expect(byId<PathDrawable>(drawables, frameId(4))?.tone).toBe('danger');
  });
});
