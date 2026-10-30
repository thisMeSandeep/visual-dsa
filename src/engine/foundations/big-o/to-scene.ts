import type { Scene, SceneElement } from '../../core/types';
import { CURVES, formatCount, stepsAt, yMaxFor, type CurveId, type GrowthModel } from './model';

/** Per-step highlights for a growth chart. */
export type GrowthAnnotations = {
  /** The curve being talked about, drawn in the signal colour. */
  focus?: CurveId;
  /** A sample run's step count so far: a dot climbing the n marker, and a callout. */
  counter?: number;
};

export const curveId = (curve: CurveId) => `curve-${curve}`;
export const RUN_DOT_ID = 'run-dot';
export const COUNTER_ID = 'counter';

/**
 * Growth model → scene. Each curve on the chart is a cell (its label, and its step count at n
 * as the detail), so the renderer can draw it and the screen reader can read it. The n marker
 * and axes come from meta; a run's dot and counter from the annotations or the last run.
 */
export function growthToScene(model: GrowthModel, annotations: GrowthAnnotations = {}): Scene {
  const curves: SceneElement[] = model.curves.map((curve) => ({
    kind: 'cell',
    id: curveId(curve),
    value: CURVES[curve].label,
    detail: formatCount(stepsAt(curve, model.n)),
    state: annotations.focus === curve ? 'active' : 'default',
    slot: { type: 'node' },
  }));

  const counted = annotations.counter ?? model.run?.count;
  const counting = annotations.counter !== undefined;
  const run: SceneElement[] =
    counted === undefined
      ? []
      : [
          {
            kind: 'cell',
            id: RUN_DOT_ID,
            value: '',
            detail: formatCount(counted),
            state: counting ? 'active' : 'found',
            slot: { type: 'node' },
          },
          ...(counting
            ? [
                {
                  kind: 'callout' as const,
                  id: COUNTER_ID,
                  text: `steps = ${formatCount(counted)}`,
                },
              ]
            : []),
        ];

  return {
    renderer: 'growth-chart',
    elements: [...curves, ...run],
    meta: {
      n: model.n,
      xMax: model.xMax,
      yMax: yMaxFor(model.xMax),
      ...(counted === undefined ? {} : { counted, steps: formatCount(counted) }),
    },
  };
}
