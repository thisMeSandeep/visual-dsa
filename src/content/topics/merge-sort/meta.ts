import type { TopicMeta } from '../../schema';

/** ALGORITHM-CATALOG A5 */
export const meta = {
  id: 'merge-sort',
  title: 'Merge Sort',
  summary:
    'Split the array in half until each piece is one item, then merge the pieces back in order.',
  category: 'algorithms',
  priority: 'P1',
  renderer: 'array',
  glyph: 'merge-sort',
  chapters: [
    { id: 'divide', title: 'Divide in half' },
    { id: 'recurse', title: 'Down to single items' },
    { id: 'merge-halves', title: 'Merge two sorted halves' },
    { id: 'levels', title: 'The recursion levels' },
    { id: 'extra-space', title: 'Extra space' },
    { id: 'stability', title: 'Stability' },
  ],
  complexity: [
    { label: 'Time', value: 'O(n log n)' },
    { label: 'Space', value: 'O(n)' },
    { label: 'Stable', value: 'Yes' },
  ],
} satisfies TopicMeta;
