import type { TopicMeta } from '../../schema';

/** ALGORITHM-CATALOG A6 */
export const meta = {
  id: 'quick-sort',
  title: 'Quick Sort',
  summary:
    'Put a pivot in its final place with smaller items left and bigger right, then repeat on each side.',
  category: 'algorithms',
  priority: 'P1',
  renderer: 'array',
  glyph: 'quick-sort',
  chapters: [
    { id: 'pivot', title: 'Choose a pivot' },
    { id: 'partition', title: 'Partition' },
    { id: 'recurse', title: 'Recurse on each side' },
    { id: 'worst-case', title: 'Bad pivots and the worst case' },
    { id: 'random-pivot', title: 'Random pivot' },
  ],
  complexity: [
    { label: 'Average', value: 'O(n log n)' },
    { label: 'Worst', value: 'O(n²)' },
    { label: 'Space', value: 'O(log n)' },
  ],
} satisfies TopicMeta;
