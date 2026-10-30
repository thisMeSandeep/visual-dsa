import type { TopicMeta } from '../../schema';

/** ALGORITHM-CATALOG A2 */
export const meta = {
  id: 'bubble-sort',
  title: 'Bubble Sort',
  summary: 'Swap neighbours that are out of order, pass after pass, until nothing needs to move.',
  category: 'algorithms',
  priority: 'P1',
  renderer: 'array',
  glyph: 'bubble-sort',
  chapters: [
    { id: 'compare-and-swap', title: 'Compare and swap' },
    { id: 'one-pass', title: 'One pass bubbles up the largest' },
    { id: 'sorted-tail', title: 'Passes and the sorted tail' },
    { id: 'early-exit', title: 'Early exit' },
    { id: 'complexity', title: 'Why it’s O(n²)' },
  ],
  complexity: [
    { label: 'Best', value: 'O(n)' },
    { label: 'Worst', value: 'O(n²)' },
    { label: 'Space', value: 'O(1)' },
  ],
} satisfies TopicMeta;
