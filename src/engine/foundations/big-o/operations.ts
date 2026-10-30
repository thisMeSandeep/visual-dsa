/**
 * Big O operations with tracing (ALGORITHM-CATALOG F1): move n, add curves, and run sample
 * functions while counting their steps. Code line ids must match the `@line` markers in the
 * topic's code samples (ARCHITECTURE §5.3).
 *
 * Code line ids used: <sample>-start, <sample>-step, <sample>-done for each sample (lookup, loop,
 * nested, halving). Caption keys: the `bigo.*` keys in content/captions.ts.
 */
import { config } from '@/config';

import { runTrace, type Tracer } from '../../core/tracer';
import type { Trace } from '../../core/types';
import { describeGrowth } from './describe';
import {
  CURVES,
  domainFor,
  formatCount,
  nProblem,
  SAMPLES,
  stepsAt,
  type CurveId,
  type GrowthModel,
  type SampleId,
} from './model';
import { growthToScene, type GrowthAnnotations } from './to-scene';

export type GrowthTracer = Tracer<GrowthModel, GrowthAnnotations>;

const { bigO } = config;

/** Moves the n marker; the chart zooms out when n passes the end of the x-axis. */
export function setN(t: GrowthTracer, n: number): void {
  if (nProblem(n)) {
    t.fail('bigo.n-range', { key: 'bigo.n-range', params: { n, max: bigO.maxN } });
    return;
  }
  const zoomed = domainFor(n) !== t.model.xMax;
  t.update((model) => ({ n, xMax: domainFor(n), curves: model.curves }));
  t.step({
    caption: { key: zoomed ? 'bigo.n.zoom' : 'bigo.n', params: { n, xMax: t.model.xMax } },
    vars: { n },
  });
}

/** Adds a curve to the chart, described in its own caption. */
export function show(t: GrowthTracer, curve: CurveId): void {
  if (!t.model.curves.includes(curve)) {
    t.update((model) => ({ ...model, curves: [...model.curves, curve] }));
  }
  t.step({
    caption: {
      key: `bigo.show.${curve}`,
      params: {
        n: t.model.n,
        steps: formatCount(stepsAt(curve, t.model.n)),
        label: CURVES[curve].label,
      },
    },
    annotations: { focus: curve },
  });
}

/** The counts a run shows: every step when there are few, evenly spaced milestones otherwise. */
export function countsShown(total: number): number[] {
  if (total <= bigO.maxCountedSteps) return Array.from({ length: total }, (_, i) => i + 1);
  return Array.from({ length: bigO.milestones }, (_, i) =>
    Math.round((total * (i + 1)) / bigO.milestones),
  );
}

/** Runs a sample function at the current n, counting its steps until the dot meets its curve. */
export function run(t: GrowthTracer, sample: SampleId): number {
  const { curve, count } = SAMPLES[sample];
  const n = t.model.n;
  const total = count(n);
  t.update((model) => ({
    ...model,
    curves: model.curves.includes(curve) ? model.curves : [...model.curves, curve],
    run: undefined,
  }));
  t.step({
    line: `${sample}-start`,
    caption: { key: `bigo.run.${sample}`, params: { n } },
    vars: { n },
    annotations: { focus: curve, counter: 0 },
  });

  const shown = countsShown(total);
  for (const steps of shown) {
    t.step({
      line: `${sample}-step`,
      caption: {
        key: shown.length < total ? 'bigo.count.skip' : 'bigo.count',
        params: { count: formatCount(steps) },
      },
      vars: { steps },
      annotations: { focus: curve, counter: steps },
    });
  }

  t.update((model) => ({ ...model, run: { sample, count: total } }));
  t.step({
    line: `${sample}-done`,
    caption: {
      key: `bigo.done.${sample}`,
      params: { n, count: formatCount(total), label: CURVES[curve].label },
    },
    vars: { steps: total },
    annotations: { focus: curve },
  });
  return total;
}

export type GrowthOperation =
  | { type: 'setN'; n: number }
  | { type: 'show'; curve: CurveId }
  | { type: 'run'; sample: SampleId };

/** Runs one operation on `model`: the trace to play, and the chart to continue from. */
export function traceGrowth(
  model: GrowthModel,
  operation: GrowthOperation,
): { trace: Trace<number | undefined>; model: GrowthModel } {
  return runTrace(
    {
      operation: `bigo.${operation.type}`,
      model,
      toScene: growthToScene,
      describe: describeGrowth,
    },
    (t): number | undefined => {
      switch (operation.type) {
        case 'setN':
          setN(t, operation.n);
          return undefined;
        case 'show':
          show(t, operation.curve);
          return undefined;
        case 'run':
          return run(t, operation.sample);
      }
    },
  );
}
