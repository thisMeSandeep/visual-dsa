import type { SandboxConfig } from '../../schema';

/**
 * Binary Search Play mode (ALGORITHM-CATALOG A1). Searching never changes the array, so the
 * presets supply the arrays, including an unsorted one to show what goes wrong.
 */
export const sandbox = [
  {
    topicId: 'binary-search',
    id: 'binary-search',
    label: 'Binary search',
    structure: 'sorted-array',
    operations: [
      { id: 'binarySearch', label: 'Search', input: 'value' },
      { id: 'findFirst', label: 'First', input: 'value' },
      { id: 'findLast', label: 'Last', input: 'value' },
    ],
    presets: [
      {
        id: 'sorted',
        label: 'Sorted',
        input: { values: ['3', '8', '12', '17', '23', '31', '42', '56'] },
        hint: '8 sorted items. **Search** for one, then for a value that isn’t there.',
      },
      {
        id: 'twelve',
        label: '12 items',
        input: { values: ['2', '5', '8', '12', '16', '23', '38', '45', '56', '67', '72', '91'] },
        hint: '12 items, the most that fit. Any search here takes at most 4 checks.',
      },
      {
        id: 'duplicates',
        label: 'Duplicates',
        input: { values: ['2', '5', '7', '7', '7', '7', '9', '12'] },
        hint: 'Four 7s. **Search** finds one of them; **First** and **Last** find the ends.',
      },
      {
        id: 'unsorted',
        label: 'Unsorted',
        input: { values: ['23', '8', '42', '17', '5', '31', '12', '3'] },
        hint: 'Not sorted. **Search** for 5 or 3: binary search can miss values that are there.',
      },
      {
        id: 'single',
        label: 'One item',
        input: { values: ['42'] },
        hint: 'One item: low, mid and high all start on it. One check settles any search.',
      },
    ],
    stats: [
      { label: 'Size', key: 'size' },
      { label: 'In range', key: 'range' },
      { label: 'Sorted', key: 'sorted' },
    ],
  },
] satisfies SandboxConfig[];
