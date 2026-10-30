import type { TopicMeta } from '../../schema';

/** ALGORITHM-CATALOG A4 */
export const meta = {
  id: 'insertion-sort',
  title: 'Insertion Sort',
  summary: 'Slide each item back into place among the sorted ones before it, like a hand of cards.',
  category: 'algorithms',
  priority: 'P1',
  renderer: 'array',
  glyph: 'insertion-sort',
  chapters: [
    { id: 'playing-cards', title: 'Like sorting playing cards' },
    { id: 'shift-right', title: 'Shift larger values right' },
    { id: 'insert-key', title: 'Insert the key' },
    { id: 'nearly-sorted', title: 'Nearly sorted input is fast' },
    { id: 'hybrid-sorts', title: 'Used inside hybrid sorts' },
  ],
  complexity: [
    { label: 'Best', value: 'O(n)' },
    { label: 'Worst', value: 'O(n²)' },
    { label: 'Space', value: 'O(1)' },
  ],
} satisfies TopicMeta;
