import type { TopicMeta } from '../../schema';

/** ALGORITHM-CATALOG L3 */
export const meta = {
  id: 'doubly-linked-list',
  title: 'Doubly Linked List',
  summary: 'Nodes that point both ways, so you can walk forward and back.',
  category: 'linear',
  priority: 'P0',
  renderer: 'linked-list',
  glyph: 'linked-list',
  chapters: [
    { id: 'prev-pointers', title: 'Previous pointers' },
    { id: 'insert-ends', title: 'Insert at both ends' },
    { id: 'delete-node', title: 'Delete a known node' },
    { id: 'traverse-backwards', title: 'Traverse backwards' },
    { id: 'trade-off', title: 'The memory trade-off' },
  ],
  complexity: [
    { label: 'Insert ends', value: 'O(1)' },
    { label: 'Delete node', value: 'O(1)' },
    { label: 'Search', value: 'O(n)' },
  ],
} satisfies TopicMeta;
