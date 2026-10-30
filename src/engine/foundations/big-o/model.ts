/**
 * Big O (ALGORITHM-CATALOG F1): growth curves and the input size n. Plain immutable data plus
 * pure functions; operations.ts adds the steps a learner sees.
 */
import { config } from '@/config';

const { bigO } = config;
const { factor, offset, divisor } = bigO.constantsExample;

/** The six common classes, fastest first. Their order picks each curve's colour. */
export const CLASSES = [
  'constant',
  'logarithmic',
  'linear',
  'linearithmic',
  'quadratic',
  'exponential',
] as const;
export type ClassId = (typeof CLASSES)[number];

/** The classes, plus two curves for "dropping constants" (3n + 5 and n²/2). */
export type CurveId = ClassId | 'scaled-linear' | 'scaled-quadratic';

export type Curve = Readonly<{
  label: string;
  /** The class it grows like, which gives it its colour. */
  growsLike: ClassId;
  steps: (n: number) => number;
}>;

export const CURVES: Readonly<Record<CurveId, Curve>> = {
  constant: { label: 'O(1)', growsLike: 'constant', steps: () => 1 },
  logarithmic: { label: 'O(log n)', growsLike: 'logarithmic', steps: (n) => Math.log2(n) },
  linear: { label: 'O(n)', growsLike: 'linear', steps: (n) => n },
  linearithmic: {
    label: 'O(n log n)',
    growsLike: 'linearithmic',
    steps: (n) => n * Math.log2(n),
  },
  quadratic: { label: 'O(n²)', growsLike: 'quadratic', steps: (n) => n * n },
  exponential: { label: 'O(2ⁿ)', growsLike: 'exponential', steps: (n) => 2 ** n },
  'scaled-linear': {
    label: `${factor}n + ${offset}`,
    growsLike: 'linear',
    steps: (n) => factor * n + offset,
  },
  'scaled-quadratic': {
    label: `n²/${divisor}`,
    growsLike: 'quadratic',
    steps: (n) => (n * n) / divisor,
  },
};

/** Position of a curve's class among the six, from 0 (fastest). */
export const classRank = (curve: CurveId) => CLASSES.indexOf(CURVES[curve].growsLike);

export const CURVE_IDS = Object.keys(CURVES) as CurveId[];

/** The sample functions a learner can run, and the curve each one follows. */
export type SampleId = 'lookup' | 'loop' | 'nested' | 'halving';

export const SAMPLES: Readonly<Record<SampleId, { curve: CurveId; count: (n: number) => number }>> =
  {
    lookup: { curve: 'constant', count: () => 1 },
    loop: { curve: 'linear', count: (n) => n },
    nested: { curve: 'quadratic', count: (n) => n * n },
    halving: { curve: 'logarithmic', count: halvings },
  };

/** How many times n can be halved before it reaches 1: ⌊log₂ n⌋. */
export function halvings(n: number): number {
  let count = 0;
  for (let rest = n; rest > 1; rest = Math.floor(rest / 2)) count++;
  return count;
}

export type GrowthModel = Readonly<{
  n: number;
  /** The x-axis runs from 0 to here. */
  xMax: number;
  /** Curves on the chart, in the order they were added. */
  curves: readonly CurveId[];
  /** The last sample run at this n, until n changes. */
  run?: Readonly<{ sample: SampleId; count: number }>;
}>;

/** The x-axis for n: the first domain that holds it. */
export const domainFor = (n: number) => bigO.xDomains.find((max) => max >= n) ?? bigO.maxN;
export const yMaxFor = (xMax: number) => xMax * bigO.yPerX;

export const stepsAt = (curve: CurveId, n: number) => CURVES[curve].steps(n);

/** A step count as shown: 1,000,000, or "over a trillion". */
export function formatCount(value: number): string {
  if (value >= bigO.hugeCount) return 'over a trillion';
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Null when `n` is a size the chart can show. */
export function nProblem(n: number): string | null {
  return Number.isInteger(n) && n >= 1 && n <= bigO.maxN
    ? null
    : `n must be a whole number from 1 to ${bigO.maxN}, got ${n}`;
}

export function createGrowth(
  options: { n?: number; curves?: readonly CurveId[] } = {},
): GrowthModel {
  const n = options.n ?? bigO.defaultN;
  const curves = options.curves ?? [];
  const problem = nProblem(n);
  if (problem) throw new RangeError(problem);
  for (const curve of curves) {
    if (!(curve in CURVES)) throw new RangeError(`Unknown curve "${curve}"`);
  }
  if (new Set(curves).size !== curves.length) throw new RangeError('Each curve can show once');
  return { n, xMax: domainFor(n), curves };
}
