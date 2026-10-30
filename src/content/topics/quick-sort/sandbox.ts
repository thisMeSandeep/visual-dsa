import type { SandboxConfig } from '../../schema';

/**
 * Quick Sort Play mode (ALGORITHM-CATALOG §8 "Sandbox (all sorts)"): type 2–12 numbers or tap
 * Random, then sort them with the last item as pivot, or a random pivot.
 */
export const sandbox = [
  {
    topicId: 'quick-sort',
    id: 'quick-sort',
    label: 'Quick sort',
    structure: 'quick-sort',
    operations: [
      { id: 'sort', label: 'Sort', input: 'values' },
      { id: 'sortRandom', label: 'Random pivot', input: 'values' },
    ],
    presets: [
      {
        id: 'mixed',
        label: 'Mixed',
        input: { values: ['29', '10', '14', '37', '13', '5', '42', '21'] },
        hint: 'Eight numbers in no order. Tap **Sort**, or type your own: 2 to 12 numbers.',
      },
      {
        id: 'reversed',
        label: 'Reversed',
        input: { values: ['56', '48', '41', '33', '27', '19', '12', '4'] },
        hint: 'Reversed: the last item is the smallest, a bad pivot. Then try **Random pivot**.',
      },
      {
        id: 'sorted',
        label: 'Sorted',
        input: { values: ['4', '12', '19', '27', '33', '41', '48', '56'] },
        hint: 'Sorted: the last item is the worst pivot, 28 comparisons. Compare **Random pivot**.',
      },
      {
        id: 'nearly',
        label: 'Nearly',
        input: { values: ['4', '12', '27', '19', '33', '41', '56', '48'] },
        hint: 'Nearly sorted is still bad for the last-item pivot. Random pivots fix that.',
      },
      {
        id: 'repeats',
        label: 'Repeats',
        input: { values: ['3', '1', '3', '2', '1', '3', '2', '1'] },
        hint: 'Lots of repeats: items equal to the pivot all go to its left.',
      },
    ],
    stats: [{ label: 'Size', key: 'size' }],
  },
] satisfies SandboxConfig[];
