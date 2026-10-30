import type { SandboxConfig } from '../../schema';

/**
 * Merge Sort Play mode (ALGORITHM-CATALOG §8 "Sandbox (all sorts)"): type 2–12 numbers or tap
 * Random, then sort them over the split levels.
 */
export const sandbox = [
  {
    topicId: 'merge-sort',
    id: 'merge-sort',
    label: 'Merge sort',
    structure: 'merge-sort',
    operations: [{ id: 'sort', label: 'Sort', input: 'values' }],
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
        hint: 'Reversed doesn’t bother merge sort: the splits and levels are the same as ever.',
      },
      {
        id: 'sorted',
        label: 'Sorted',
        input: { values: ['4', '12', '19', '27', '33', '41', '48', '56'] },
        hint: 'Already sorted. It still splits everything, but each merge needs few comparisons.',
      },
      {
        id: 'nearly',
        label: 'Nearly',
        input: { values: ['4', '12', '27', '19', '33', '41', '56', '48'] },
        hint: 'Nearly sorted: watch which half each item comes from as the halves merge.',
      },
      {
        id: 'repeats',
        label: 'Repeats',
        input: { values: ['3', '1', '3', '2', '1', '3', '2', '1'] },
        hint: 'Lots of repeats. On a tie the left item goes up first, so it’s stable.',
      },
    ],
    stats: [{ label: 'Size', key: 'size' }],
  },
] satisfies SandboxConfig[];
