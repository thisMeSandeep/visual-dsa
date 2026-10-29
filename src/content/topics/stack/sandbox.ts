import type { SandboxConfig } from '../../schema';

/** Stack Play mode (ALGORITHM-CATALOG L5 "Sandbox" and "Presets"). */
export const sandbox = {
  topicId: 'stack',
  structure: 'stack',
  operations: [
    { id: 'push', label: 'Push', input: 'value' },
    { id: 'pop', label: 'Pop' },
    { id: 'peek', label: 'Peek' },
    { id: 'clear', label: 'Clear' },
  ],
  presets: [
    {
      id: 'some',
      label: 'A few items',
      input: { values: ['23', '8', '42'], capacity: 5 },
      hint: 'A stack with room for 5. Push a number, or pop the top.',
    },
    {
      id: 'empty',
      label: 'Empty',
      input: { capacity: 5 },
      hint: 'An empty stack. Try **Pop** to see an underflow.',
    },
    {
      id: 'full',
      label: 'Full',
      input: { values: ['23', '8', '42', '17', '5'], capacity: 5 },
      hint: 'A full stack. Try **Push** to see an overflow.',
    },
  ],
  stats: [
    { label: 'Size', key: 'size' },
    { label: 'Capacity', key: 'capacity' },
    { label: 'Top', key: 'top' },
  ],
} satisfies SandboxConfig;
