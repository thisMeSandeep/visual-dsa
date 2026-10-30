import type { Reference } from '../../schema';

/** Doubly Linked List cheat sheet (F-801 – F-803). */
export const reference = {
  topicId: 'doubly-linked-list',
  tabs: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          kind: 'text',
          text: 'Like a singly linked list, but each node also has a **prev** pointer back to the node before it. The list keeps a **head** and a **tail**.',
        },
        { kind: 'heading', text: 'Key ideas' },
        {
          kind: 'bullets',
          items: [
            'Walk forwards with next, or backwards with prev from the tail.',
            'A node knows both neighbours, so unlinking it is O(1) once you have it.',
            'Every change updates links in **both** directions.',
          ],
        },
        { kind: 'heading', text: 'Use it for' },
        {
          kind: 'bullets',
          items: [
            'LRU caches: a hash table finds the node, the list moves it in O(1).',
            'Browser history, and undo and redo.',
            'Double-ended queues (deques).',
          ],
        },
      ],
    },
    {
      id: 'complexity',
      title: 'Complexity',
      blocks: [
        {
          kind: 'table',
          columns: ['Operation', 'Average', 'Worst'],
          rows: [
            ['Access by position', 'O(n)', 'O(n)'],
            ['Search', 'O(n)', 'O(n)'],
            ['Insert at either end', 'O(1)', 'O(1)'],
            ['Insert before or after a node you have', 'O(1)', 'O(1)'],
            ['Delete a node you have', 'O(1)', 'O(1)'],
            ['Delete a value', 'O(n)', 'O(n)'],
          ],
        },
        { kind: 'text', text: 'Space: **O(n)**, with two pointers per node.' },
      ],
    },
    {
      id: 'pitfalls',
      title: 'Pitfalls',
      blocks: [
        {
          kind: 'bullets',
          items: [
            'Miss one **prev** update and walking backwards breaks, while forwards still looks fine.',
            'The head’s prev and the tail’s next are null: handle both ends.',
            'Deleting the head or tail: move **head** or **tail** as well.',
            'Each node costs an extra pointer. If you never go backwards, a singly linked list is enough.',
          ],
        },
      ],
    },
  ],
} satisfies Reference;
