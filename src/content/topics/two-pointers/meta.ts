import type { TopicMeta } from '../../schema';

/** ALGORITHM-CATALOG A9 */
export const meta = {
  id: 'two-pointers',
  title: 'Two Pointers',
  summary: 'Walk an array with two indices at once, so one pass does the work of nested loops.',
  category: 'algorithms',
  priority: 'P1',
  renderer: 'array',
  glyph: 'two-pointers',
  chapters: [
    { id: 'both-ends', title: 'Pointers from both ends' },
    { id: 'pair-sum', title: 'Pair sum in a sorted array' },
    { id: 'remove-duplicates', title: 'Removing duplicates in place' },
    { id: 'when-it-applies', title: 'When the pattern applies' },
  ],
  complexity: [
    { label: 'Time', value: 'O(n)' },
    { label: 'Space', value: 'O(1)' },
    { label: 'Brute force', value: 'O(n²)' },
  ],
} satisfies TopicMeta;
