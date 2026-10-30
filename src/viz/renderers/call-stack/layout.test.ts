import { createRecursion, traceRecursion } from '@/engine/foundations/recursion';

import type { BoxDrawable, Drawable, LineDrawable } from '../../canvas/types';
import { SIZES } from '../../sizes.fixture';
import { layoutCallStack } from './layout';

const byId = <T extends Drawable>(drawables: Drawable[], id: string) =>
  drawables.find((d) => d.id === id) as T | undefined;

describe('layoutCallStack', () => {
  it('stacks frames upwards from the bottom, the newest on top', () => {
    const { trace } = traceRecursion(createRecursion(), { type: 'fact', n: 3 });
    const { drawables, height } = layoutCallStack(trace.steps[2]!.scene, SIZES);
    const bottom = byId<BoxDrawable>(drawables, 'frame-c0')!;
    const top = byId<BoxDrawable>(drawables, 'frame-c2')!;
    expect(top.y).toBeLessThan(bottom.y);
    expect(bottom.width).toBe(SIZES.frameWidth);
    // The same height whether 1 or 3 frames are up: room is kept for the deepest.
    expect(layoutCallStack(trace.steps[0]!.scene, SIZES).height).toBe(height);
  });

  it('draws the call tree to the right, children under their parent', () => {
    const { trace } = traceRecursion(createRecursion(), { type: 'fib', n: 3 });
    const { drawables, width } = layoutCallStack(trace.steps.at(-1)!.scene, SIZES);
    const root = byId<BoxDrawable>(drawables, 'call-c0')!;
    const left = byId<BoxDrawable>(drawables, 'call-c1')!;
    const right = byId<BoxDrawable>(drawables, 'call-c4')!;
    expect(root.x).toBeGreaterThan(SIZES.frameWidth);
    expect(left.y).toBeGreaterThan(root.y);
    expect(left.x).toBeLessThan(root.x);
    expect(right.x).toBeGreaterThan(root.x);
    const edge = byId<LineDrawable>(drawables, 'edge-c1')!;
    expect(edge.y1).toBe(root.y + root.height);
    expect(edge.y2).toBe(left.y);
    expect(width).toBe(
      SIZES.frameWidth + SIZES.sceneGap + 3 * (SIZES.callNodeWidth + SIZES.gap) - SIZES.gap,
    );
  });

  it('turns the bottom of the stack red on overflow', () => {
    const { trace } = traceRecursion(createRecursion(3), { type: 'broken' });
    const { drawables } = layoutCallStack(trace.steps.at(-1)!.scene, SIZES);
    expect(byId(drawables, 'stack-ground')).toMatchObject({ tone: 'danger' });
  });
});
