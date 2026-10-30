import type { SandboxConfig } from '../../schema';

/**
 * Recursion Play mode (ALGORITHM-CATALOG F2): pick n with a preset, then run factorial,
 * Fibonacci (with or without a memo) or a factorial with no base case. The catalog's
 * sum(array) is left out: it teaches what factorial does, and its frames don't fit.
 */
export const sandbox = [
  {
    topicId: 'recursion',
    id: 'recursion',
    label: 'Recursion',
    structure: 'recursion',
    operations: [
      { id: 'factorial', label: 'Factorial' },
      { id: 'fib', label: 'Fibonacci' },
      { id: 'fibMemo', label: 'Fib + memo' },
      { id: 'noBaseCase', label: 'No base case' },
    ],
    presets: [
      {
        id: 'three',
        label: 'n = 3',
        input: { n: 3 },
        hint: 'n = 3. Tap **Factorial** to watch 3 frames pile up and come off again.',
      },
      {
        id: 'four',
        label: 'n = 4',
        input: { n: 4 },
        hint: 'n = 4. Compare **Fibonacci** (9 calls) with **Fib + memo** (7 calls).',
      },
      {
        id: 'six',
        label: 'n = 6',
        input: { n: 6 },
        hint: 'n = 6: plain Fibonacci makes 25 calls. With the memo it needs only 11.',
      },
      {
        id: 'one',
        label: 'n = 1',
        input: { n: 1 },
        hint: 'n = 1, the base case: each function answers at once, except the one with no base case.',
      },
    ],
    stats: [
      { label: 'n', key: 'n' },
      { label: 'Calls', key: 'calls' },
      { label: 'Depth', key: 'depth' },
    ],
  },
] satisfies SandboxConfig[];
