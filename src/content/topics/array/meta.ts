import type { TopicMeta } from '../../schema';

/** ALGORITHM-CATALOG L1 */
export const meta = {
  id: 'array',
  title: 'Array',
  summary: 'A row of numbered slots: read or write any of them in one step.',
  category: 'linear',
  priority: 'P0',
  renderer: 'array',
  glyph: 'array',
  chapters: [
    { id: 'memory-and-indices', title: 'Memory and indices' },
    { id: 'access', title: 'Access by index' },
    { id: 'traversal', title: 'Traversal' },
    { id: 'linear-search', title: 'Linear search' },
    { id: 'insert', title: 'Insert and shift' },
    { id: 'delete', title: 'Delete and shift' },
    { id: 'dynamic-arrays', title: 'Dynamic arrays' },
  ],
  complexity: [
    { label: 'Access', value: 'O(1)' },
    { label: 'Search', value: 'O(n)' },
    { label: 'Insert', value: 'O(n)' },
  ],
} satisfies TopicMeta;
