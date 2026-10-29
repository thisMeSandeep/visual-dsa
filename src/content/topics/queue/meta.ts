import type { TopicMeta } from '../../schema';

/** ALGORITHM-CATALOG L6 */
export const meta = {
  id: 'queue',
  title: 'Queue',
  summary: 'First in, first out, like a line at a printer.',
  category: 'linear',
  priority: 'P0',
  renderer: 'queue',
  glyph: 'queue',
  chapters: [
    { id: 'fifo', title: 'First in, first out' },
    { id: 'operations', title: 'Enqueue, dequeue and front' },
    { id: 'printer', title: 'Example: a printer queue' },
    { id: 'naive-array', title: 'Why a plain array wastes space' },
    { id: 'circular-buffer', title: 'The circular buffer' },
    { id: 'bfs-preview', title: 'Preview: queues in BFS' },
  ],
  complexity: [
    { label: 'Enqueue', value: 'O(1)' },
    { label: 'Dequeue', value: 'O(1)' },
    { label: 'Space', value: 'O(n)' },
  ],
} satisfies TopicMeta;
