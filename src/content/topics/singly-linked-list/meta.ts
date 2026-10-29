import type { TopicMeta } from '../../schema';

/** ALGORITHM-CATALOG L2 */
export const meta = {
  id: 'singly-linked-list',
  title: 'Singly Linked List',
  summary: 'A chain of nodes, each pointing to the next one.',
  category: 'linear',
  priority: 'P0',
  renderer: 'linked-list',
  glyph: 'linked-list',
  chapters: [
    { id: 'nodes-and-pointers', title: 'Nodes and pointers' },
    { id: 'head-and-tail', title: 'Head and tail' },
    { id: 'traversal', title: 'Traversal' },
    { id: 'insert-head', title: 'Insert at the head' },
    { id: 'insert-tail', title: 'Insert at the tail' },
    { id: 'delete', title: 'Delete a node' },
    { id: 'search', title: 'Search' },
    { id: 'reverse', title: 'Reverse a list' },
  ],
  complexity: [
    { label: 'Access', value: 'O(n)' },
    { label: 'Insert head', value: 'O(1)' },
    { label: 'Search', value: 'O(n)' },
  ],
} satisfies TopicMeta;
