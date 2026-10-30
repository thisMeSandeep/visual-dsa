import type { SandboxConfig } from '../../schema';

/**
 * Insertion Sort Play mode (ALGORITHM-CATALOG §8 "Sandbox (all sorts)"): type 2–12 numbers or
 * tap Random, then sort them. Presets are the catalog's starting arrays.
 */
export const sandbox = [
  {
    topicId: 'insertion-sort',
    id: 'insertion-sort',
    label: 'Insertion sort',
    structure: 'insertion-sort',
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
        hint: 'The worst case: every key shifts all the way to the front.',
      },
      {
        id: 'sorted',
        label: 'Sorted',
        input: { values: ['4', '12', '19', '27', '33', '41', '48', '56'] },
        hint: 'Already sorted: each key needs one comparison and stays. Just 7 in all.',
      },
      {
        id: 'nearly',
        label: 'Nearly',
        input: { values: ['4', '12', '27', '19', '33', '41', '56', '48'] },
        hint: 'Nearly sorted: only two keys move, one place each. This is where it shines.',
      },
      {
        id: 'repeats',
        label: 'Repeats',
        input: { values: ['3', '1', '3', '2', '1', '3', '2', '1'] },
        hint: 'Only three different values. A key stops at an equal one, so it’s stable.',
      },
    ],
    stats: [{ label: 'Size', key: 'size' }],
  },
] satisfies SandboxConfig[];
