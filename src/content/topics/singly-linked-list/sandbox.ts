import type { SandboxConfig } from '../../schema';

/**
 * Singly Linked List Play mode (ALGORITHM-CATALOG L2 "Sandbox" and "Presets"). The catalog's
 * "keep a tail pointer" toggle is two tools with the same operations, so Add tail can be compared
 * with and without one.
 */
function tool(id: string, label: string, tail: boolean): SandboxConfig {
  const endHint = 'Try **Delete** on 12, the head, or 30, the tail.';
  return {
    topicId: 'singly-linked-list',
    id,
    label,
    structure: 'linked-list',
    operations: [
      { id: 'insertHead', label: 'Add head', input: 'value' },
      { id: 'insertTail', label: 'Add tail', input: 'value' },
      { id: 'insertAfter', label: 'Add after', input: 'target-value' },
      { id: 'delete', label: 'Delete', input: 'value' },
      { id: 'search', label: 'Search', input: 'value' },
      { id: 'reverse', label: 'Reverse' },
    ],
    presets: [
      {
        id: 'some',
        label: 'A few nodes',
        input: { values: ['12', '7', '30'], tail },
        hint: tail
          ? `With a tail pointer, **Add tail** goes straight to the end. ${endHint}`
          : `No tail pointer: **Add tail** walks from the head. ${endHint}`,
      },
      {
        id: 'empty',
        label: 'Empty',
        input: { tail },
        hint: 'An empty list: head is null. **Add head** or **Add tail** to start it.',
      },
      {
        id: 'single',
        label: 'One node',
        input: { values: ['42'], tail },
        hint: 'One node, both first and last. Try **Reverse**, or **Delete** it.',
      },
      {
        id: 'long',
        label: 'Long list',
        input: { values: ['3', '14', '15', '9', '26', '5', '35', '8'], tail },
        hint: 'A long chain. **Search** for 8 to walk all of it, or **Reverse** it.',
      },
    ],
    stats: [
      { label: 'Size', key: 'size' },
      { label: 'Head', key: 'head' },
      ...(tail ? [{ label: 'Tail', key: 'tail' }] : []),
    ],
  };
}

export const sandbox = [
  tool('head-only', 'Head only', false),
  tool('head-and-tail', 'Head and tail', true),
] satisfies SandboxConfig[];
