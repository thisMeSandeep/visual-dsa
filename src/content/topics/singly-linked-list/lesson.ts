import type { LessonRecipe } from '../../schema';

/**
 * The Singly Linked List lesson (ALGORITHM-CATALOG L2). Every chapter runs the real list: the
 * tail chapter runs the same insert with and without a tail pointer so the walk shows, and the
 * last chapter reverses a list with prev, cur and next.
 */
// Typed rather than `satisfies`, like the other lessons, so the recipe literal isn't widened.
export const lesson: LessonRecipe = {
  topicId: 'singly-linked-list',
  segments: [
    { kind: 'chapter', chapterId: 'nodes-and-pointers' },
    { kind: 'setup', structure: 'linked-list', input: { values: ['12', '7', '30'] } },
    {
      kind: 'say',
      caption:
        'A **linked list** is a chain of **nodes**. Each holds a value and a **next** pointer to the node after it.',
    },
    {
      kind: 'say',
      caption:
        'Unlike an array’s slots, the nodes can sit anywhere in memory. Only the pointers keep them in order.',
    },
    {
      kind: 'say',
      caption: 'The last node’s next is **null**: nothing comes after it.',
    },

    { kind: 'chapter', chapterId: 'head-and-tail' },
    {
      kind: 'say',
      caption:
        'The list itself only remembers where it starts: the **head** pointer. Lose that and you lose the list.',
    },
    {
      kind: 'setup',
      structure: 'linked-list',
      input: { values: ['12', '7', '30'], tail: true },
    },
    {
      kind: 'say',
      caption:
        'Many lists also keep a **tail** pointer to the last node, so they can reach the end at once.',
    },

    { kind: 'chapter', chapterId: 'traversal' },
    { kind: 'setup', structure: 'linked-list', input: { values: ['12', '7', '30', '5'] } },
    {
      kind: 'say',
      caption:
        'There are no indices. To visit every node, start **cur** at the head and follow **next** until it’s null.',
    },
    { kind: 'trace', operation: 'linked-list.traverse' },
    {
      kind: 'say',
      caption:
        'To reach the 4th node you must pass the first 3: getting to position i is **O(n)**, not O(1) as in an array.',
    },

    { kind: 'chapter', chapterId: 'insert-head' },
    { kind: 'trace', operation: 'linked-list.insertHead', input: { value: '4' } },
    {
      kind: 'say',
      caption: 'Adding at the head never touches the rest of the list, however long it is.',
    },

    { kind: 'chapter', chapterId: 'insert-tail' },
    {
      kind: 'say',
      caption: 'Adding at the tail is different. This list keeps no tail pointer…',
    },
    { kind: 'trace', operation: 'linked-list.insertTail', input: { value: '9' } },
    {
      kind: 'setup',
      structure: 'linked-list',
      input: { values: ['4', '12', '7', '30', '5'], tail: true },
    },
    { kind: 'say', caption: 'This list keeps a **tail** pointer. Watch the difference.' },
    { kind: 'trace', operation: 'linked-list.insertTail', input: { value: '9' } },
    {
      kind: 'say',
      caption: 'To insert in the middle, find the node first, then link the new one in after it.',
    },
    {
      kind: 'trace',
      operation: 'linked-list.insertAfter',
      input: { target: '7', value: '21' },
    },
    {
      kind: 'say',
      caption:
        'Only two pointers changed, and nothing shifted as it would in an array. The cost was finding 7.',
    },

    { kind: 'chapter', chapterId: 'delete' },
    {
      kind: 'setup',
      structure: 'linked-list',
      input: { values: ['4', '12', '7', '30'], tail: true },
    },
    {
      kind: 'say',
      caption:
        'To delete a node, find it and the node **before** it: that node’s next is what changes.',
    },
    { kind: 'trace', operation: 'linked-list.delete', input: { value: '7' } },
    { kind: 'trace', operation: 'linked-list.delete', input: { value: '4' } },
    {
      kind: 'say',
      caption:
        'Deleting the head is **O(1)**. Anywhere else, finding the node is O(n); the re-link itself is O(1).',
    },

    { kind: 'chapter', chapterId: 'search' },
    { kind: 'setup', structure: 'linked-list', input: { values: ['12', '7', '30', '5'] } },
    { kind: 'trace', operation: 'linked-list.search', input: { value: '30' } },
    { kind: 'trace', operation: 'linked-list.search', input: { value: '8' } },
    {
      kind: 'say',
      caption:
        'Search checks nodes one by one: **O(n)**. A list can’t jump to its middle, so binary search can’t help.',
    },

    { kind: 'chapter', chapterId: 'reverse' },
    { kind: 'setup', structure: 'linked-list', input: { values: ['1', '2', '3', '4'] } },
    {
      kind: 'say',
      caption:
        'A classic interview question: reverse the list in place with three pointers, **prev**, **cur** and **next**.',
    },
    { kind: 'trace', operation: 'linked-list.reverse' },
    {
      kind: 'say',
      caption: 'One pass, one arrow flipped per node: **O(n)** time and **O(1)** extra space.',
    },
  ],
};
