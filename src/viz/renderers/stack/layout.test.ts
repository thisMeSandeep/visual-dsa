import { createStack, traceStack, stackToScene, type StackModel } from '@/engine/structures/stack';
import type { VizSizes } from '@/theme';

import type {
  BoxDrawable,
  Drawable,
  LineDrawable,
  PathDrawable,
  TextDrawable,
} from '../../canvas/types';
import { CONTAINER_ID, layoutStack } from './layout';

/** The token values from tokens.css (tests can't read CSS variables). */
const SIZES: VizSizes = {
  cellWidth: 46,
  cellHeight: 52,
  bucketWidth: 44,
  bucketHeight: 40,
  nodeHeight: 44,
  gap: 8,
  radius: 10,
  borderWidth: 1.5,
  borderWidthActive: 2,
  edgeWidth: 1.5,
  dimmedOpacity: 0.4,
  dash: 4,
  dashGap: 3,
  arrowSize: 6,
  fontValue: 20,
  fontDetail: 12,
  fontLabel: 13,
  fontIndex: 12,
  labelGap: 4,
  pointerLength: 16,
  pointerLabelWidth: 32,
  stackItemWidth: 132,
  stackPadding: 10,
  stackRadius: 18,
};

const layout = (model: StackModel) => layoutStack(stackToScene(model), SIZES);
const boxes = (drawables: Drawable[]) =>
  drawables.filter((d): d is BoxDrawable => d.kind === 'box');
const byId = <T extends Drawable>(drawables: Drawable[], id: string) =>
  drawables.find((d) => d.id === id) as T | undefined;

describe('layoutStack', () => {
  it('draws the container for the full capacity, even when empty', () => {
    const { drawables } = layout(createStack([], 3));
    const container = byId<PathDrawable>(drawables, CONTAINER_ID);

    expect(container).toMatchObject({ kind: 'path', tone: 'line-strong', strokeWidth: 'active' });
    expect(boxes(drawables)).toEqual([]);
    expect(drawables.some((d) => d.kind === 'text')).toBe(false);
  });

  it('stacks items bottom-up in one column, one slot apart', () => {
    const { drawables } = layout(createStack(['23', '8', '42'], 5));
    const [bottom, middle, top] = boxes(drawables);

    expect([bottom?.value, middle?.value, top?.value]).toEqual(['23', '8', '42']);
    expect(new Set(boxes(drawables).map((b) => b.x)).size).toBe(1);
    expect(bottom!.y - middle!.y).toBe(SIZES.nodeHeight + SIZES.gap);
    expect(middle!.y - top!.y).toBe(SIZES.nodeHeight + SIZES.gap);
    expect(top).toMatchObject({ width: SIZES.stackItemWidth, height: SIZES.nodeHeight });
  });

  it('points "top" at the top item from the left', () => {
    const model = createStack(['23', '8'], 5);
    const { drawables } = layout(model);
    const top = byId<BoxDrawable>(drawables, model.items[1]!.id)!;
    const label = byId<TextDrawable>(drawables, 'pointer-top')!;
    const arrow = byId<LineDrawable>(drawables, 'pointer-top-arrow')!;

    expect(label).toMatchObject({ text: 'top', align: 'right', tone: 'signal-ink' });
    expect(label.y).toBe(top.y + top.height / 2);
    expect(arrow).toMatchObject({ arrow: true, y1: label.y, y2: label.y });
    expect(arrow.x2).toBeLessThan(top.x);
    expect(label.x).toBeLessThan(arrow.x1);
  });

  it('keeps the same size whatever the stack holds, so the canvas never jumps', () => {
    const empty = layout(createStack([], 4));
    const full = layout(createStack(['1', '2', '3', '4'], 4));
    expect([full.width, full.height]).toEqual([empty.width, empty.height]);
  });

  it('is symmetric around the container, so it sits centred', () => {
    const { drawables, width } = layout(createStack(['1'], 4));
    const [item] = boxes(drawables);
    expect(item!.x + item!.width / 2).toBe(width / 2);
  });

  it('shows an overflowing value above the container and the container in error', () => {
    const { trace } = traceStack(createStack(['1', '2'], 2), { type: 'push', value: '3' });
    const scene = trace.steps.at(-1)!.scene;
    const { drawables } = layoutStack(scene, SIZES);

    const rejected = byId<BoxDrawable>(drawables, 'rejected')!;
    const topItem = boxes(drawables).find((b) => b.value === '2')!;
    expect(rejected).toMatchObject({ value: '3', state: 'error' });
    expect(rejected.y + rejected.height).toBeLessThan(topItem.y);
    expect(rejected.y).toBeGreaterThanOrEqual(0);
    expect(byId<PathDrawable>(drawables, CONTAINER_ID)?.tone).toBe('danger');
  });

  it('passes element states through, e.g. a newly pushed item', () => {
    const { trace } = traceStack(createStack(['1'], 4), { type: 'push', value: '9' });
    const { drawables } = layoutStack(trace.steps.at(-1)!.scene, SIZES);
    expect(boxes(drawables).find((b) => b.value === '9')?.state).toBe('new');
  });
});
