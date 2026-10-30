import type { Reference } from '../../schema';

/** Singly Linked List cheat sheet (F-801 – F-803). */
export const reference = {
  topicId: 'singly-linked-list',
  tabs: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          kind: 'text',
          text: 'A chain of **nodes**: each holds a value and a **next** pointer to the node after it. The last node’s next is **null**.',
        },
        { kind: 'heading', text: 'Key ideas' },
        {
          kind: 'bullets',
          items: [
            'The list only knows its **head**; many also keep a **tail** to reach the end at once.',
            'There are no indices: reaching position i means walking past i nodes.',
            'Inserting or deleting changes a pointer or two. Nothing shifts.',
          ],
        },
        { kind: 'heading', text: 'Use it for' },
        {
          kind: 'bullets',
          items: [
            'Lots of inserts and deletes at the front.',
            'Stacks and queues with no size limit.',
            'The chains in a hash table.',
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
            ['Insert at head', 'O(1)', 'O(1)'],
            ['Insert at tail, with a tail pointer', 'O(1)', 'O(1)'],
            ['Insert at tail, without one', 'O(n)', 'O(n)'],
            ['Insert after a node you have', 'O(1)', 'O(1)'],
            ['Delete a value', 'O(n)', 'O(n)'],
            ['Reverse', 'O(n)', 'O(n)'],
          ],
        },
        { kind: 'text', text: 'Space: **O(n)**, one pointer per node.' },
      ],
    },
    {
      id: 'versus-array',
      title: 'vs array',
      blocks: [
        {
          kind: 'table',
          columns: ['Feature', 'Array', 'Linked list'],
          rows: [
            ['Access by index', 'O(1)', 'O(n)'],
            ['Insert at the front', 'O(n)', 'O(1)'],
            ['Memory', 'One block', 'Scattered nodes'],
            ['Extra space', 'Spare capacity', 'A pointer per node'],
          ],
        },
        {
          kind: 'text',
          text: 'Arrays win at reading by position and use the cache well; lists win at inserting and deleting at known places.',
        },
      ],
    },
    {
      id: 'pitfalls',
      title: 'Pitfalls',
      blocks: [
        {
          kind: 'bullets',
          items: [
            'Set the new node’s next **before** re-aiming the old pointer, or the rest of the list is lost.',
            'Deleting the first or last node: remember to move **head** or **tail** too.',
            'Following next from null crashes. Check for the end of the list.',
            'Deleting needs the node **before** the target, so track prev as you walk.',
          ],
        },
      ],
    },
  ],
} satisfies Reference;
