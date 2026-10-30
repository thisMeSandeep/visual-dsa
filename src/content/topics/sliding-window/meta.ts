import type { TopicMeta } from '../../schema';

/** ALGORITHM-CATALOG A10 */
export const meta = {
  id: 'sliding-window',
  title: 'Sliding Window',
  summary: 'Move a run of neighbours along the array, updating it as items enter and leave.',
  category: 'algorithms',
  priority: 'P1',
  renderer: 'array',
  glyph: 'sliding-window',
  chapters: [
    { id: 'fixed-window', title: 'Fixed-size window' },
    { id: 'variable-window', title: 'Variable window' },
    { id: 'expand-shrink', title: 'Expanding and shrinking' },
    { id: 'window-max', title: 'Window maximum with a deque' },
  ],
  complexity: [
    { label: 'Time', value: 'O(n)' },
    { label: 'Fixed window', value: 'O(1)' },
    { label: 'Brute force', value: 'O(n·k)' },
  ],
} satisfies TopicMeta;
