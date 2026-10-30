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
    const label = byId<TextDrawable>(drawables, 'pointer')!;
    const arrow = byId<LineDrawable>(drawables, 'pointer-arrow')!;
    expect(label).toMatchObject({ text: 'i', x: item.x + item.width / 2 });
    expect(arrow.y2).toBeLessThan(item.y);
    expect(label.y).toBeLessThan(arrow.y1);
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
