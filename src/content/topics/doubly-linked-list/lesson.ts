import type { LessonRecipe } from '../../schema';

/**
 * The Doubly Linked List lesson (ALGORITHM-CATALOG L3). One list runs through the lesson: both
 * ends, inserting before a node, deleting a known node, then walking it backwards.
 */
// Typed rather than `satisfies`, like the other lessons, so the recipe literal isn't widened.
export const lesson: LessonRecipe = {
  topicId: 'doubly-linked-list',
  segments: [
    { kind: 'chapter', chapterId: 'prev-pointers' },
    {
      kind: 'setup',
      structure: 'linked-list',
      input: { values: ['12', '7', '30'], kind: 'doubly' },
    },
    {
      kind: 'say',
      caption:
        'In a **doubly linked list** each node also has a **prev** pointer, back to the node before it.',
    },
    {
      kind: 'say',
      caption:
        'So arrows go both ways: **next** along the top, **prev** underneath. The list keeps a **head** and a **tail**.',
    },

    { kind: 'chapter', chapterId: 'insert-ends' },
    { kind: 'trace', operation: 'linked-list.insertHead', input: { value: '4' } },
    { kind: 'trace', operation: 'linked-list.insertTail', input: { value: '9' } },
    {
      kind: 'say',
      caption: 'Both ends are **O(1)**: there’s a pointer to each, and only a few pointers change.',
    },
    {
      kind: 'say',
      caption:
        'With prev pointers you can also insert **before** a node, which a singly linked list can’t.',
    },
    {
      kind: 'trace',
      operation: 'linked-list.insertBefore',
      input: { target: '30', value: '15' },
    },

    { kind: 'chapter', chapterId: 'delete-node' },
    {
      kind: 'say',
      caption:
        'A singly linked list needs the node **before** the one it deletes. Here every node knows both neighbours.',
    },
    { kind: 'trace', operation: 'linked-list.delete', input: { value: '7' } },
    {
      kind: 'say',
      caption:
        'Once you have the node, unlinking it is **O(1)**: ideal when something else, like a hash table, hands you the node.',
    },

    { kind: 'chapter', chapterId: 'traverse-backwards' },
    {
      kind: 'say',
      caption: 'Start **cur** at the tail and follow **prev** to walk the list backwards.',
    },
    { kind: 'trace', operation: 'linked-list.traverseBackward' },

    { kind: 'chapter', chapterId: 'trade-off' },
    {
      kind: 'say',
      caption:
        'The price: every node stores two pointers instead of one. More memory, and more pointers to keep right.',
    },
    {
      kind: 'say',
      caption:
        'Choose a doubly linked list when you need to go backwards or delete known nodes fast, like a browser’s history.',
    },
  ],
};
