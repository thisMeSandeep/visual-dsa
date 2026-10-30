import { CLASSES, createGrowth, growthToScene, traceGrowth } from '@/engine/foundations/big-o';

import type {
  BoxDrawable,
  Drawable,
  LineDrawable,
  PathDrawable,
  TextDrawable,
} from '../../canvas/types';
import { SIZES } from '../../sizes.fixture';
import { layoutGrowthChart, MARKER_ID } from './layout';

const byId = <T extends Drawable>(drawables: Drawable[], id: string) =>
  drawables.find((d) => d.id === id) as T | undefined;
const texts = (drawables: Drawable[]) =>
  drawables.filter((d): d is TextDrawable => d.kind === 'text');
/** Last point of an "M x y L x y …" path. */
const endOf = (path: string) => path.split(/[ML]/).at(-1)!.trim().split(' ').map(Number);

describe('layoutGrowthChart', () => {
  it('draws each curve in its class colour, labelled, with a dot where n meets it', () => {
    const scene = growthToScene(createGrowth({ n: 8, curves: ['constant', 'linear'] }));
    const { drawables } = layoutGrowthChart(scene, SIZES);
    expect(byId<PathDrawable>(drawables, 'curve-constant-10')?.tone).toBe('curve-1');
    expect(byId<PathDrawable>(drawables, 'curve-linear-10')?.tone).toBe('curve-3');
    expect(byId<TextDrawable>(drawables, 'curve-linear-label')).toMatchObject({
      text: 'O(n)',
      tone: 'ink-2',
    });
    const marker = byId<LineDrawable>(drawables, MARKER_ID)!;
    const dot = byId<BoxDrawable>(drawables, 'curve-linear-dot')!;
    expect(dot.x + dot.width / 2).toBe(marker.x1);
    expect(byId<TextDrawable>(drawables, 'marker-label')?.text).toBe('n = 8');
  });

  it('clips a curve where it leaves the top, and labels it there', () => {
    const scene = growthToScene(createGrowth({ n: 8, curves: ['quadratic'] }));
    const { drawables } = layoutGrowthChart(scene, SIZES);
    const curve = byId<PathDrawable>(drawables, 'curve-quadratic-10')!;
    const axis = byId<LineDrawable>(drawables, 'axis-y')!;
    expect(endOf(curve.path)[1]).toBeCloseTo(axis.y2);
    expect(byId<TextDrawable>(drawables, 'curve-quadratic-label')!.y).toBeLessThan(axis.y2);
    // n² at n = 8 is 64, off the 0–40 chart: no dot for it.
    expect(byId(drawables, 'curve-quadratic-dot')).toBeUndefined();
  });

  it('keeps labels apart when curves end close together', () => {
    const scene = growthToScene(createGrowth({ n: 250, curves: [...CLASSES] }));
    const labels = texts(layoutGrowthChart(scene, SIZES).drawables).filter(
      (t) => t.id.endsWith('-label') && t.id !== 'marker-label',
    );
    const side = labels
      .filter((t) => t.align === 'left')
      .map((t) => t.y)
      .sort((a, b) => a - b);
    side.slice(1).forEach((y, i) => expect(y - side[i]!).toBeGreaterThanOrEqual(SIZES.fontLabel));
  });

  it('gives a zoomed curve a new id, so the old one fades out', () => {
    const near = layoutGrowthChart(
      growthToScene(createGrowth({ n: 8, curves: ['linear'] })),
      SIZES,
    );
    const far = layoutGrowthChart(
      growthToScene(createGrowth({ n: 80, curves: ['linear'] })),
      SIZES,
    );
    expect(byId(near.drawables, 'curve-linear-10')).toBeDefined();
    expect(byId(far.drawables, 'curve-linear-100')).toBeDefined();
    expect(byId(far.drawables, 'curve-linear-10')).toBeUndefined();
  });

  it('shows a run’s dot climbing the marker, with the counter callout', () => {
    const { trace } = traceGrowth(createGrowth({ n: 6 }), { type: 'run', sample: 'loop' });
    const { drawables } = layoutGrowthChart(trace.steps[3]!.scene, SIZES);
    expect(byId<BoxDrawable>(drawables, 'run-dot')?.state).toBe('active');
    expect(byId(drawables, 'counter')).toMatchObject({ kind: 'callout', text: 'steps = 3' });
    expect(byId<PathDrawable>(drawables, 'curve-linear-10')?.tone).toBe('signal');
  });
});
