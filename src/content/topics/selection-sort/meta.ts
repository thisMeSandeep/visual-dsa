import type { TopicMeta } from '../../schema';

/** ALGORITHM-CATALOG A3 */
export const meta = {
  id: 'selection-sort',
  title: 'Selection Sort',
  summary: 'Find the smallest of what’s left and swap it to the front, again and again.',
  category: 'algorithms',
  priority: 'P1',
  renderer: 'array',
  glyph: 'selection-sort',
  chapters: [
    { id: 'find-minimum', title: 'Find the minimum' },
    { id: 'swap-into-place', title: 'Swap it into place' },
    { id: 'sorted-prefix', title: 'Growing the sorted prefix' },
    { id: 'not-stable', title: 'Why it isn’t stable' },
  ],
  complexity: [
    { label: 'Time', value: 'O(n²)' },
    { label: 'Swaps', value: 'O(n)' },
    { label: 'Space', value: 'O(1)' },
  ],
} satisfies TopicMeta;
