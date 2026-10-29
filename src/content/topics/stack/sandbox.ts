import type { SandboxConfig } from '../../schema';

/**
 * Stack Play mode (ALGORITHM-CATALOG L5 "Sandbox" and "Presets"): the stack itself, and the
 * bracket checker run on any expression the learner types.
 */
export const sandbox = [
  {
    topicId: 'stack',
    id: 'stack',
    label: 'Stack',
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
  },
  {
    topicId: 'stack',
    id: 'brackets',
    label: 'Bracket checker',
    structure: 'brackets',
    operations: [{ id: 'check', label: 'Check', input: 'expression' }],
    presets: [
      {
        id: 'balanced',
        label: 'Balanced',
        input: { expression: '((5+3)+1)(2+9)' },
        hint: 'Every bracket has a partner. Tap **Check** to watch the stack match them.',
      },
      {
        id: 'unbalanced',
        label: 'Unbalanced',
        input: { expression: '(()' },
        hint: 'One bracket never closes. Tap **Check** to see where it fails.',
      },
    ],
    stats: [
      { label: 'Waiting', key: 'size' },
      { label: 'Top', key: 'top' },
    ],
  },
] satisfies SandboxConfig[];
