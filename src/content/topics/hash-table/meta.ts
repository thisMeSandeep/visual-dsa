import type { TopicMeta } from '../../schema';

/** ALGORITHM-CATALOG H1 */
export const meta = {
  id: 'hash-table',
  title: 'Hash Table',
  summary: 'Store key–value pairs and find any of them in constant time, on average.',
  category: 'hashing',
  priority: 'P0',
  renderer: 'hash-table',
  glyph: 'hash-table',
  chapters: [
    { id: 'introduction', title: 'Introduction' },
    { id: 'hash-function', title: 'Hash function' },
    { id: 'inserting-keys', title: 'Inserting keys' },
    { id: 'collision', title: 'Collision' },
    { id: 'chaining', title: 'Chaining' },
    { id: 'search', title: 'Search' },
    { id: 'delete', title: 'Delete' },
    { id: 'load-factor', title: 'Load factor and resizing' },
    { id: 'open-addressing', title: 'Open addressing' },
    { id: 'tombstones', title: 'Tombstones' },
  ],
  complexity: [
    { label: 'Search', value: 'O(1)' },
    { label: 'Insert', value: 'O(1)' },
    { label: 'Worst case', value: 'O(n)' },
  ],
} satisfies TopicMeta;
