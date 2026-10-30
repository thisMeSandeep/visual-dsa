import type { Reference } from '../../schema';

/** Queue cheat sheet (F-801 – F-803). */
export const reference = {
  topicId: 'queue',
  tabs: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          kind: 'text',
          text: 'A queue is a line: items join at the **rear** and leave from the **front**, so the first in is the first out (**FIFO**).',
        },
        { kind: 'heading', text: 'Key ideas' },
        {
          kind: 'bullets',
          items: [
            '**enqueue** joins at the rear, **dequeue** leaves from the front, **front** only looks.',
            'Each operation touches one end, so none of them has to move other items.',
          ],
        },
        { kind: 'heading', text: 'Use it for' },
        {
          kind: 'bullets',
          items: [
            'Printer jobs, task schedulers and message queues.',
            'Breadth-first search.',
            'Buffers between something that produces data and something that uses it.',
          ],
        },
      ],
    },
    {
      id: 'circular-buffer',
      title: 'Circular buffer',
      blocks: [
        {
          kind: 'text',
          text: 'A plain array wastes the slots before the front. A **circular buffer** treats the array as a ring, so the rear wraps round to slot 0.',
        },
        {
          kind: 'bullets',
          items: [
            '**head** is the slot of the front item; **size** counts the items.',
            'The next free slot is **(head + size) mod capacity**.',
            'Dequeue moves head on by one: **(head + 1) mod capacity**.',
            'Empty when size is 0, full when size equals the capacity.',
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
            ['Enqueue', 'O(1)', 'O(1)'],
            ['Dequeue', 'O(1)', 'O(1)'],
            ['Front', 'O(1)', 'O(1)'],
            ['Search', 'O(n)', 'O(n)'],
          ],
        },
        {
          kind: 'text',
          text: 'Space: **O(n)**. A plain array that shifts every item left on dequeue makes dequeue O(n).',
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
            '**Underflow**: dequeuing an empty queue.',
            'In a plain array, the slots before the front are lost for good.',
            'Forgetting the **mod** when moving head or rear runs off the end of the array.',
            'With only head and tail indices, empty and full look the same. Keep a size, or leave one slot unused.',
          ],
        },
      ],
    },
  ],
} satisfies Reference;
