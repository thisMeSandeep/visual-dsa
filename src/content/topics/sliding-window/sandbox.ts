import type { SandboxConfig } from '../../schema';

/**
 * Sliding Window Play mode (ALGORITHM-CATALOG A10): a fixed window of k (sum and maximum, with
 * k changed by buttons) and a variable window that finds the longest run with no repeats. Both
 * run on the numbers in the field, which presets and Random fill in.
 */
export const sandbox = [
  {
    topicId: 'sliding-window',
    id: 'fixed',
    label: 'Fixed window',
    structure: 'sliding-window',
    operations: [
      { id: 'maxSum', label: 'Max sum', input: 'values' },
      { id: 'windowMax', label: 'Max of each', input: 'values' },
      { id: 'narrow', label: 'k − 1' },
      { id: 'widen', label: 'k + 1' },
    ],
    presets: [
      {
        id: 'mixed',
        label: 'Mixed',
        input: { values: ['2', '1', '5', '1', '3', '2', '8', '1'], k: 3 },
        hint: 'A window of 3. Tap **Max sum**, or **Max of each** to watch the deque.',
      },
      {
        id: 'rising',
        label: 'Rising',
        input: { values: ['1', '2', '3', '4', '5', '6', '7', '8'], k: 3 },
        hint: 'Rising values: every slide is a new best, and the deque never holds more than one.',
      },
      {
        id: 'falling',
        label: 'Falling',
        input: { values: ['9', '8', '7', '6', '5', '4', '3', '2'], k: 3 },
        hint: 'Falling values: the deque fills up, and each maximum soon slides out of the front.',
      },
      {
        id: 'wide',
        label: 'Wide',
        input: { values: ['4', '9', '1', '7', '3', '8', '2', '6', '5'], k: 5 },
        hint: 'A window of 5. Change k with the buttons, then run again.',
      },
    ],
    stats: [
      { label: 'k', key: 'k' },
      { label: 'Sum', key: 'sum' },
      { label: 'Best', key: 'best' },
    ],
  },
  {
    topicId: 'sliding-window',
    id: 'no-repeats',
    label: 'No repeats',
    structure: 'sliding-window',
    operations: [{ id: 'longestUnique', label: 'Longest', input: 'values' }],
    presets: [
      {
        id: 'repeats',
        label: 'Repeats',
        input: { values: ['1', '2', '3', '1', '2', '3', '2', '2'] },
        hint: 'Find the longest run with no repeated number. Tap **Longest**.',
      },
      {
        id: 'far',
        label: 'Far repeat',
        input: { values: ['4', '7', '7', '2', '5', '7', '1', '3'] },
        hint: 'Watch the window shrink by several items when the repeat is far back.',
      },
      {
        id: 'different',
        label: 'All different',
        input: { values: ['5', '3', '8', '1', '9', '2'] },
        hint: 'No repeats at all: the window just keeps growing.',
      },
      {
        id: 'same',
        label: 'All same',
        input: { values: ['6', '6', '6', '6', '6'] },
        hint: 'Every item repeats the last one: the window never gets past 1.',
      },
    ],
    stats: [
      { label: 'Window', key: 'window' },
      { label: 'Best', key: 'best' },
    ],
  },
] satisfies SandboxConfig[];
