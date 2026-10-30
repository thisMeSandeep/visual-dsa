/**
 * Growth-chart scene → drawables (VISUAL-SPEC §7). Pure, so it's unit-tested.
 *
 *   ┌───────────────┐
 *   │ steps = 37    │                    ← callout row: a run's counter, reserved even when empty
 *   └───────────────┘
 *   steps      O(2ⁿ)  O(n²)               ← labels of curves that leave the top
 *    40 ┤        ╱    ╱
 *       │       ╱   ╱ │    ·── O(n log n)  ← labels of curves that reach the right edge
 *       │      ╱  ╱   │ ·──── O(n)
 *       │     ╱ ╱ ··──●────── O(log n)
 *     0 ┼────●──────●──────── O(1)
 *       0          n = 8      10          ← ticks, and the n marker's label
 *
 * Curves are sequential tokens (curve-1 fastest … curve-6 slowest); the one in focus is signal.
 * Labels name every curve, so colour is never the only way to tell them apart.
 */
import { config } from '@/config';
import type { Scene, SceneElement } from '@/engine/core/types';
import { classRank, CURVES, RUN_DOT_ID, type CurveId } from '@/engine/foundations/big-o';
import type { ColorToken, VizSizes } from '@/theme';

import type { Drawable } from '../../canvas/types';

export type GrowthLayout = { drawables: Drawable[]; width: number; height: number };

export const MARKER_ID = 'marker';

const CURVE_TONES: readonly ColorToken[] = [
  'curve-1',
  'curve-2',
  'curve-3',
  'curve-4',
  'curve-5',
  'curve-6',
];
const CURVE_PREFIX = 'curve-';

type Cell = Extract<SceneElement, { kind: 'cell' }>;
type Point = { x: number; y: number };
type Label = { id: string; text: string; x: number; y: number; width: number; focus: boolean };

export function layoutGrowthChart(scene: Scene, sizes: VizSizes): GrowthLayout {
  const meta = scene.meta ?? {};
  const n = Number(meta.n ?? 1);
  const xMax = Number(meta.xMax ?? 1);
  const yMax = Number(meta.yMax ?? 1);
  const textWidth = (text: string, font: number) => text.length * font * sizes.monoAdvance;

  const calloutHeight = sizes.fontCallout + 2 * sizes.calloutPadY;
  const labelLine = sizes.fontLabel + sizes.labelGap;
  const left = sizes.pointerLabelWidth + sizes.labelGap;
  const top = calloutHeight + sizes.gap + labelLine;
  const right = left + sizes.chartWidth;
  const bottom = top + sizes.chartHeight;
  const xOf = (v: number) => left + (v / xMax) * sizes.chartWidth;
  const yOf = (v: number) => bottom - (v / yMax) * sizes.chartHeight;

  const drawables: Drawable[] = [];
  const text = (
    id: string,
    value: string,
    x: number,
    y: number,
    align: 'left' | 'center' | 'right',
    tone: ColorToken = 'muted',
    font: 'label' | 'index' = 'index',
  ): Drawable => ({ kind: 'text', id, x, y, text: value, font, tone, align });

  // Axes, recessive: only 0 and the ends are marked.
  drawables.push(
    {
      kind: 'line',
      id: 'axis-y',
      x1: left,
      y1: bottom,
      x2: left,
      y2: top,
      tone: 'edge',
      arrow: false,
    },
    {
      kind: 'line',
      id: 'axis-x',
      x1: left,
      y1: bottom,
      x2: right,
      y2: bottom,
      tone: 'edge',
      arrow: false,
    },
    text('tick-y', String(yMax), left - sizes.labelGap, top, 'right'),
    text('tick-y0', '0', left - sizes.labelGap, bottom, 'right'),
    // A full line above the top tick, so the two never touch.
    text('title-y', 'steps', left - sizes.labelGap, top - labelLine, 'right'),
  );

  // The curves, clipped where they leave the top, each with a direct label at its end.
  const cells = scene.elements.filter((e): e is Cell => e.kind === 'cell');
  const curves = cells.filter((cell) => cell.id.startsWith(CURVE_PREFIX));
  const topLabels: Label[] = [];
  const sideLabels: Label[] = [];
  for (const cell of curves) {
    const curve = cell.id.slice(CURVE_PREFIX.length) as CurveId;
    const focus = cell.state === 'active';
    const points = sample(CURVES[curve].steps, xMax, yMax).map((p) => ({
      x: xOf(p.x),
      y: yOf(p.y),
    }));
    const end = points.at(-1)!;
    drawables.push({
      kind: 'path',
      // The axes rescale when n zooms out: a new id cross-fades the old curve into the new one.
      id: `${cell.id}-${xMax}`,
      path: points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '),
      tone: focus ? 'signal' : CURVE_TONES[classRank(curve)]!,
      strokeWidth: 'active',
    });
    const label = {
      id: `${cell.id}-label`,
      text: cell.value,
      width: textWidth(cell.value, sizes.fontLabel),
      focus,
    };
    if (end.y <= top) topLabels.push({ ...label, x: end.x, y: top - labelLine / 2 });
    else sideLabels.push({ ...label, x: right + sizes.labelGap, y: end.y });
  }

  // Keep labels apart. Top ones start right of the y-axis and are nudged right; side ones stay
  // above the x ticks and are nudged up, working from the bottom.
  topLabels.sort((a, b) => a.x - b.x);
  topLabels.forEach((label, i) => {
    const before = topLabels[i - 1];
    const minX = before
      ? before.x + before.width / 2 + sizes.labelGap + label.width / 2
      : left + sizes.labelGap + label.width / 2;
    label.x = Math.max(label.x, minX);
  });
  sideLabels.sort((a, b) => b.y - a.y);
  sideLabels.forEach((label, i) => {
    const below = sideLabels[i - 1];
    const maxY = below ? below.y - labelLine : bottom - sizes.fontLabel / 2;
    label.y = Math.min(label.y, maxY);
  });
  for (const label of [...topLabels, ...sideLabels]) {
    drawables.push(
      text(
        label.id,
        label.text,
        label.x,
        label.y,
        topLabels.includes(label) ? 'center' : 'left',
        label.focus ? 'signal-ink' : 'ink-2',
        'label',
      ),
    );
  }

  // The n marker, its label among the x ticks, and a dot where it meets each curve.
  const markerX = xOf(n);
  const tickY = bottom + sizes.labelGap + sizes.fontIndex / 2;
  const markerText = `n = ${n}`;
  const markerHalf = textWidth(markerText, sizes.fontLabel) / 2;
  drawables.push({
    kind: 'line',
    id: MARKER_ID,
    x1: markerX,
    y1: bottom,
    x2: markerX,
    y2: top,
    tone: 'signal',
    arrow: false,
  });
  drawables.push(text('marker-label', markerText, markerX, tickY, 'center', 'signal-ink', 'label'));
  // The end ticks give way to the marker's label when they'd overlap it.
  if (markerX - markerHalf > left + textWidth('0', sizes.fontIndex) + sizes.labelGap) {
    drawables.push(text('tick-x0', '0', left, tickY, 'center'));
  }
  const endTick = String(xMax);
  if (markerX + markerHalf < right - textWidth(endTick, sizes.fontIndex) / 2 - sizes.labelGap) {
    drawables.push(text('tick-x', endTick, right, tickY, 'center'));
  }

  const dot = (id: string, value: number, state: Cell['state']): Drawable => ({
    kind: 'box',
    id,
    x: markerX - sizes.chartDot / 2,
    y: yOf(Math.min(value, yMax)) - sizes.chartDot / 2,
    width: sizes.chartDot,
    height: sizes.chartDot,
    state,
    value: '',
  });
  for (const cell of curves) {
    const value = CURVES[cell.id.slice(CURVE_PREFIX.length) as CurveId].steps(n);
    if (value <= yMax) drawables.push(dot(`${cell.id}-dot`, value, cell.state));
  }
  const runDot = cells.find((cell) => cell.id === RUN_DOT_ID);
  if (runDot && meta.counted !== undefined) {
    drawables.push(dot(RUN_DOT_ID, Number(meta.counted), runDot.state));
  }

  const callout = scene.elements.find((e) => e.kind === 'callout');
  if (callout) {
    drawables.push({
      kind: 'callout',
      id: callout.id,
      x: left,
      y: calloutHeight / 2,
      text: callout.text,
    });
  }

  const widest = Math.max(
    right,
    ...sideLabels.map((label) => label.x + label.width),
    ...topLabels.map((label) => label.x + label.width / 2),
    callout ? left + textWidth(callout.text, sizes.fontCallout) + 2 * sizes.calloutPadX : 0,
  );
  return { drawables, width: widest, height: tickY + sizes.fontLabel / 2 };
}

/**
 * Points along a curve from n = 1 to xMax, in data units. A curve that leaves the top ends
 * exactly on the top edge.
 */
function sample(steps: (n: number) => number, xMax: number, yMax: number): Point[] {
  const count = config.bigO.curveSamples;
  const points: Point[] = [];
  for (let i = 0; i <= count; i++) {
    const x = 1 + ((xMax - 1) * i) / count;
    const y = Math.max(0, steps(x));
    const before = points.at(-1);
    if (y > yMax) {
      if (before) {
        const t = (yMax - before.y) / (y - before.y);
        points.push({ x: before.x + (x - before.x) * t, y: yMax });
      } else {
        points.push({ x, y: yMax });
      }
      break;
    }
    points.push({ x, y });
  }
  return points;
}
