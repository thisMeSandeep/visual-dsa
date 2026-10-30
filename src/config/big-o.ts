/** Big O (ALGORITHM-CATALOG F1): the growth chart and its sample functions. */
export const bigO = {
  /** Largest n the chart and the sandbox slider go to. */
  maxN: 1000,
  /** n when content gives none. */
  defaultN: 8,
  /** The x-axis runs to the first of these that holds n, so the chart zooms out as n grows. */
  xDomains: [10, 20, 50, 100, 200, 500, 1000],
  /** The y-axis runs to this many times the x-axis, so the curves keep their shapes as it zooms. */
  yPerX: 4,
  /** Points sampled along each curve. */
  curveSamples: 64,
  /** A sample run with at most this many steps shows every one; longer runs show milestones. */
  maxCountedSteps: 24,
  /** How many milestones a long run shows. */
  milestones: 8,
  /**
   * The "dropping constants" curves: factor·n + offset grows like n, and n² ÷ divisor like n².
   */
  constantsExample: { factor: 3, offset: 5, divisor: 2 },
  /** Step counts this big read as "more than a trillion" rather than a number. */
  hugeCount: 1e12,
} as const;
