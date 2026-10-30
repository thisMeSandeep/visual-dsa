import { createList, listToScene, NULL_ID, traceList } from '@/engine/structures/linked-list';

import type { BoxDrawable, Drawable, LineDrawable, TextDrawable } from '../../canvas/types';
import { SIZES } from '../../sizes.fixture';
import { layoutList, NULL_ARROW_ID } from './layout';

const byId = <T extends Drawable>(drawables: Drawable[], id: string) =>
  drawables.find((d) => d.id === id) as T | undefined;

describe('layoutList', () => {
  it('draws nodes left to right, each next arrow from box edge to box edge, then null', () => {
    const { drawables } = layoutList(listToScene(createList(['12', '7'])), SIZES);
    const first = byId<BoxDrawable>(drawables, 'node-0')!;
    const second = byId<BoxDrawable>(drawables, 'node-1')!;
    expect(second.x).toBe(first.x + SIZES.cellWidth + SIZES.linkGap);
    expect(byId<LineDrawable>(drawables, 'next-node-0')).toMatchObject({
      x1: first.x + first.width,
      x2: second.x,
      y1: first.y + first.height / 2,
      arrow: true,
    });
    const end = byId<TextDrawable>(drawables, NULL_ID)!;
    expect(end.x).toBeGreaterThan(second.x + second.width);
    expect(byId(drawables, NULL_ARROW_ID)).toBeDefined();
  });

  it('puts a doubly linked list’s next arrow above the centre and prev below', () => {
    const { drawables } = layoutList(
      listToScene(createList(['1', '2'], { kind: 'doubly' })),
      SIZES,
    );
    const next = byId<LineDrawable>(drawables, 'next-node-0')!;
    const prev = byId<LineDrawable>(drawables, 'prev-node-1')!;
    const centre = byId<BoxDrawable>(drawables, 'node-0')!.y + SIZES.nodeHeight / 2;
    expect(next.y1).toBe(centre - SIZES.linkOffset);
    expect(prev.y1).toBe(centre + SIZES.linkOffset);
    expect(prev.x2).toBeLessThan(prev.x1);
  });

  it('raises a node being linked in above the row', () => {
    const { trace } = traceList(createList(['12', '30']), {
      type: 'insertAfter',
      target: '12',
      value: '21',
    });
    const { drawables } = layoutList(trace.steps[2]!.scene, SIZES);
    const raised = byId<BoxDrawable>(drawables, 'node-2')!;
    const row = byId<BoxDrawable>(drawables, 'node-0')!;
    expect(raised.y + raised.height).toBeLessThan(row.y);
  });

  it('stacks pointer labels under their node, and points head at null when empty', () => {
    const { trace } = traceList(createList(['5'], { hasTail: true }), {
      type: 'search',
      value: '5',
    });
    const { drawables } = layoutList(trace.steps[0]!.scene, SIZES);
    const node = byId<BoxDrawable>(drawables, 'node-0')!;
    const [head, tail, cur] = ['head', 'tail', 'cur'].map((label) =>
      byId<TextDrawable>(drawables, `pointer-${label}`)!,
    );
    expect(head!.y).toBeGreaterThan(node.y + node.height);
    expect(tail!.y).toBeGreaterThan(head!.y);
    expect(cur!.y).toBeGreaterThan(tail!.y);

    const empty = layoutList(listToScene(createList()), SIZES);
    const end = byId<TextDrawable>(empty.drawables, NULL_ID)!;
    expect(byId<TextDrawable>(empty.drawables, 'pointer-head')?.x).toBeGreaterThan(end.x);
  });

  it('shows null in red when the list can’t do what was asked', () => {
    const { trace } = traceList(createList(), { type: 'delete', value: '1' });
    const { drawables } = layoutList(trace.steps.at(-1)!.scene, SIZES);
    expect(byId<TextDrawable>(drawables, NULL_ID)?.tone).toBe('danger');
  });
});
