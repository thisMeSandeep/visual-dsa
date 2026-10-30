import type { SandboxConfig } from '../../schema';

/**
 * Array Play mode (ALGORITHM-CATALOG L1 "Sandbox" and "Presets"). It's a dynamic array, so the
 * catalog's capacity parameter comes from the presets, and pushing onto a full one grows it.
 */
export const sandbox = [
  {
    topicId: 'array',
    id: 'array',
    label: 'Array',
    structure: 'array',
    operations: [
      { id: 'push', label: 'Push', input: 'value' },
      { id: 'insert', label: 'Insert', input: 'index-value' },
      { id: 'set', label: 'Set', input: 'index-value' },
      { id: 'get', label: 'Get', input: 'index' },
      { id: 'removeAt', label: 'Remove', input: 'index' },
      { id: 'search', label: 'Search', input: 'value' },
    ],
    presets: [
      {
        id: 'full',
        label: 'Full',
        input: { values: ['23', '8', '42', '17'], capacity: 4 },
        hint: 'All 4 slots are taken. **Push** a value to watch the array double.',
      },
      {
        id: 'duplicates',
        label: 'Duplicates',
        input: { values: ['5', '8', '5', '3', '5'], capacity: 6 },
        hint: 'Three 5s. **Search** for 5: it stops at the first one.',
      },
      {
        id: 'single',
        label: 'One item',
        input: { values: ['42'], capacity: 4 },
        hint: 'One item, at index 0. Try **Get** at index 1 to go out of bounds.',
      },
      {
        id: 'empty',
        label: 'Empty',
        input: { capacity: 4 },
        hint: 'An empty array with 4 slots. **Push** or **Insert** at index 0.',
      },
    ],
    stats: [
      { label: 'Size', key: 'size' },
      { label: 'Capacity', key: 'capacity' },
    ],
  },
] satisfies SandboxConfig[];
