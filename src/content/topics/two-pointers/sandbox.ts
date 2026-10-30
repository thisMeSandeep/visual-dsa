import type { SandboxConfig } from '../../schema';

/**
 * Two Pointers Play mode (ALGORITHM-CATALOG A9): type a target and find a pair that adds up to
 * it, reverse the array, or remove its repeats. Presets supply the arrays.
 */
export const sandbox = [
  {
    topicId: 'two-pointers',
    id: 'two-pointers',
    label: 'Two pointers',
    structure: 'two-pointers',
    operations: [
      { id: 'pairSum', label: 'Pair sum', input: 'value' },
      { id: 'reverse', label: 'Reverse' },
      { id: 'removeDuplicates', label: 'Remove repeats' },
    ],
    presets: [
      {
        id: 'sorted',
        label: 'Sorted',
        input: { values: ['1', '3', '4', '6', '8', '11', '14', '17'] },
        hint: 'Sorted. Type a target such as 20 and tap **Pair sum**.',
      },
      {
        id: 'repeats',
        label: 'Repeats',
        input: { values: ['1', '1', '2', '3', '3', '3', '4', '5', '5'] },
        hint: 'Sorted, with repeats. Tap **Remove repeats** to pack the unique values at the front.',
      },
      {
        id: 'unsorted',
        label: 'Unsorted',
        input: { values: ['8', '1', '6', '3', '11', '4'] },
        hint: 'Not sorted, so **Pair sum** can miss pairs. Try 7: 1 + 6 is there.',
      },
      {
        id: 'two',
        label: 'Two items',
        input: { values: ['4', '9'] },
        hint: 'Just two items: the pointers start next to each other. Try a target of 13.',
      },
    ],
    stats: [
      { label: 'Size', key: 'size' },
      { label: 'Sum', key: 'sum' },
    ],
  },
] satisfies SandboxConfig[];
