import type { SandboxConfig } from '../../schema';

/**
 * Queue Play mode (ALGORITHM-CATALOG L6 "Sandbox" and "Presets"). The catalog's circular-buffer
 * toggle is two tools: the circular buffer, and a plain array that wastes the slots it leaves.
 */
export const sandbox = [
  {
    topicId: 'queue',
    id: 'circular',
    label: 'Circular',
    structure: 'queue',
    operations: [
      { id: 'enqueue', label: 'Enqueue', input: 'value' },
      { id: 'dequeue', label: 'Dequeue' },
      { id: 'front', label: 'Front' },
      { id: 'clear', label: 'Clear' },
    ],
    presets: [
      {
        id: 'some',
        label: 'A few items',
        input: { values: ['23', '8', '42'], capacity: 6 },
        hint: 'A queue with 6 slots. Enqueue at the rear, or dequeue from the front.',
      },
      {
        id: 'empty',
        label: 'Empty',
        input: { capacity: 6 },
        hint: 'An empty queue. Try **Dequeue** to see an underflow.',
      },
      {
        id: 'full',
        label: 'Full',
        input: { values: ['23', '8', '42', '17', '5', '31'], capacity: 6 },
        hint: 'Every slot is taken. Try **Enqueue** to see an overflow.',
      },
      {
        id: 'wrap',
        label: 'Wrap-around',
        input: { values: ['3', '4', '5'], capacity: 6, head: 4 },
        hint: 'The front is at slot 4 and the rear has wrapped to slot 0. **Enqueue** to watch it go on.',
      },
    ],
    stats: [
      { label: 'Size', key: 'size' },
      { label: 'Head', key: 'head' },
      { label: 'Tail', key: 'tail' },
    ],
  },
  {
    topicId: 'queue',
    id: 'plain-array',
    label: 'Plain array',
    structure: 'queue',
    operations: [
      { id: 'enqueue', label: 'Enqueue', input: 'value' },
      { id: 'dequeue', label: 'Dequeue' },
      { id: 'front', label: 'Front' },
      { id: 'clear', label: 'Clear' },
    ],
    presets: [
      {
        id: 'some',
        label: 'A few items',
        input: { values: ['23', '8', '42'], capacity: 6, mode: 'naive' },
        hint: 'A plain array: the front only moves forward. Dequeue, then enqueue, and watch the start.',
      },
      {
        id: 'stuck',
        label: 'Wasted slots',
        input: { values: ['4', '5'], capacity: 6, head: 4, mode: 'naive' },
        hint: 'The rear has hit the last slot. Try **Enqueue**: slots 0 to 3 are free but can’t be used.',
      },
    ],
    stats: [
      { label: 'Size', key: 'size' },
      { label: 'Head', key: 'head' },
      { label: 'Wasted', key: 'wasted' },
    ],
  },
] satisfies SandboxConfig[];
