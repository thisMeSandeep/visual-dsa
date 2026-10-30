import type { TopicMeta } from '../../schema';

/** ALGORITHM-CATALOG A1 */
export const meta = {
  id: 'binary-search',
  title: 'Binary Search',
  summary: 'Find a value in a sorted array by halving the part left to search each step.',
  category: 'algorithms',
  priority: 'P1',
  renderer: 'array',
  glyph: 'binary-search',
  chapters: [
    { id: 'sorted-input', title: 'Requires sorted input' },
    { id: 'pointers', title: 'low, mid and high' },
    { id: 'halving', title: 'Halving the range' },
    { id: 'not-found', title: 'Not found' },
    { id: 'variants', title: 'First and last occurrence' },
  ],
  complexity: [
    { label: 'Search', value: 'O(log n)' },
    { label: 'Best', value: 'O(1)' },
    { label: 'Space', value: 'O(1)' },
  ],
} satisfies TopicMeta;
