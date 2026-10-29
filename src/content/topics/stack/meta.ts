import type { TopicMeta } from '../../schema';

/** ALGORITHM-CATALOG L5 */
export const meta = {
  id: 'stack',
  title: 'Stack',
  summary: 'Last in, first out: you only ever touch the top.',
  category: 'linear',
  priority: 'P0',
  renderer: 'stack',
  glyph: 'stack',
  chapters: [
    { id: 'lifo', title: 'Last in, first out' },
    { id: 'push-pop-peek', title: 'Push, pop and peek' },
    { id: 'browser-back', title: 'Example: the back button' },
    { id: 'parentheses', title: 'Example: balanced parentheses' },
    { id: 'implementations', title: 'Two ways to build one' },
    { id: 'overflow-underflow', title: 'Overflow and underflow' },
  ],
  complexity: [
    { label: 'Push', value: 'O(1)' },
    { label: 'Pop', value: 'O(1)' },
    { label: 'Search', value: 'O(n)' },
  ],
} satisfies TopicMeta;
