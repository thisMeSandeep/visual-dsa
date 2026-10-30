/** Recursion (ALGORITHM-CATALOG F2): how big a run the call stack and call tree can draw. */
export const recursion = {
  /** n for the sandbox's first run, before a preset is picked. */
  defaultN: 4,
  /** Largest factorial: n + 1 frames tall. */
  maxFactorial: 7,
  /** Largest Fibonacci: fib(6) makes 25 calls, a tree 13 leaves wide. */
  maxFib: 6,
  /** Frames before the no-base-case run overflows. */
  maxDepth: 7,
} as const;
