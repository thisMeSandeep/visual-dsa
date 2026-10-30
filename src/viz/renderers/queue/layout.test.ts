import { createQueue, queueToScene, traceQueue } from '@/engine/structures/queue';

import type { BoxDrawable, Drawable, PathDrawable, TextDrawable } from '../../canvas/types';
import { SIZES } from '../../sizes.fixture';
import { FRAME_ID, layoutQueue, WRAP_ARC_ID } from './layout';

const boxes = (drawables: Drawable[]) =>
  drawables.filter((d): d is BoxDrawable => d.kind === 'box');
const byId = <T extends Drawable>(drawables: Drawable[], id: string) =>
  drawables.find((d) => d.id === id) as T | undefined;

describe('layoutQueue', () => {
  it('draws every slot with its index, empty or not, so the size never changes', () => {
    const empty = layoutQueue(queueToScene(createQueue([], 5)), SIZES);
    const full = layoutQueue(queueToScene(createQueue(['1', '2', '3', '4', '5'], 5)), SIZES);
    expect(boxes(empty.drawables).filter((b) => b.id.startsWith('slot-'))).toHaveLength(5);
    expect(byId<TextDrawable>(empty.drawables, 'index-4')?.text).toBe('4');
    expect([full.width, full.height]).toEqual([empty.width, empty.height]);
  });

  it('puts each item in its own slot, so a wrapped queue shows where items really are', () => {
    const { drawables } = layoutQueue(
      queueToScene(createQueue(['4', '5', '6'], 5, { head: 3 })),
      SIZES,
    );
    const slot0 = byId<BoxDrawable>(drawables, 'slot-0')!;
    const six = boxes(drawables).find((b) => b.value === '6')!;
    expect([six.x, six.y]).toEqual([slot0.x, slot0.y]);
  });

  it('points front down from above and rear up from below', () => {
    const { drawables } = layoutQueue(queueToScene(createQueue(['23', '8'], 4)), SIZES);
    const row = byId<BoxDrawable>(drawables, 'slot-0')!;
    const front = byId<TextDrawable>(drawables, 'pointer-front')!;
    const rear = byId<TextDrawable>(drawables, 'pointer-rear')!;
    expect(front.y).toBeLessThan(row.y);
    expect(rear.y).toBeGreaterThan(row.y + row.height);
    expect(front.x).toBe(row.x + row.width / 2);
  });

  it('draws the wrap-around arc only for a circular buffer, and dims wasted slots in a plain array', () => {
    const circular = layoutQueue(queueToScene(createQueue(['1'], 4)), SIZES);
    expect(byId<PathDrawable>(circular.drawables, WRAP_ARC_ID)).toBeDefined();

    let naive = createQueue(['1', '2'], 4, { mode: 'naive' });
    naive = traceQueue(naive, { type: 'dequeue' }).model;
    const { drawables } = layoutQueue(queueToScene(naive), SIZES);
    expect(byId<PathDrawable>(drawables, WRAP_ARC_ID)).toBeUndefined();
    expect(byId<BoxDrawable>(drawables, 'slot-0')?.state).toBe('dimmed');
    expect(byId<BoxDrawable>(drawables, 'slot-1')?.state).toBe('default');
  });

  it('shows a value that did not fit past the row, and the frame in error', () => {
    const { trace } = traceQueue(createQueue(['1', '2'], 2), { type: 'enqueue', value: '3' });
    const { drawables } = layoutQueue(trace.steps.at(-1)!.scene, SIZES);
    const rejected = byId<BoxDrawable>(drawables, 'rejected')!;
    const last = byId<BoxDrawable>(drawables, 'slot-1')!;
    expect(rejected).toMatchObject({ value: '3', state: 'error' });
    expect(rejected.x).toBeGreaterThan(last.x + last.width);
    expect(byId<PathDrawable>(drawables, FRAME_ID)?.tone).toBe('danger');
  });
});
