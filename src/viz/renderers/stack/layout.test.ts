import {
  bracketsToScene,
  createBrackets,
  createStack,
  stackToScene,
  traceBrackets,
  traceStack,
  type StackModel,
} from '@/engine/structures/stack';

import type {
  BoxDrawable,
  Drawable,
  LineDrawable,
  PathDrawable,
  TextDrawable,
} from '../../canvas/types';
import { SIZES } from '../../sizes.fixture';
import { CONTAINER_ID, layoutStack } from './layout';

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

  it('draws an input row on top, one cell per character, with the stack centred under it', () => {
    const { drawables, width } = layoutStack(bracketsToScene(createBrackets('((5+3)+1)')), SIZES);
    const chars = boxes(drawables).filter((b) => b.id.startsWith('char-'));
    const container = byId<PathDrawable>(drawables, CONTAINER_ID)!;

    expect(chars.map((c) => c.value).join('')).toBe('((5+3)+1)');
    expect(chars.every((c) => c.y === 0 && c.width === SIZES.charWidth)).toBe(true);
    expect(chars[1]!.x - chars[0]!.x).toBe(SIZES.charWidth + SIZES.charGap);
    // The row is wider than the stack, so it sets the width and the stack is centred under it.
    expect(chars[0]!.x).toBe(0);
    expect(chars.at(-1)!.x + SIZES.charWidth).toBe(width);
    const containerTop = Number(container.path.split(' ')[2]);
    expect(containerTop).toBeGreaterThan(SIZES.charHeight);
  });

  it('keeps bracket items in the stack, not the row', () => {
    const { trace } = traceBrackets(createBrackets('((1'));
    const { drawables, width } = layoutStack(trace.steps.at(-1)!.scene, SIZES);
    const items = boxes(drawables).filter((b) => b.id.startsWith('item-'));
    expect(items.map((b) => b.value)).toEqual(['(', '(']);
    expect(items[0]!.x + items[0]!.width / 2).toBe(width / 2);
  });
});
