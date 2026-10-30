import type { Reference } from '../../schema';

/** Stack cheat sheet (F-801 – F-803). */
export const reference = {
  topicId: 'stack',
  tabs: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          kind: 'text',
          text: 'A stack is a pile: you add to the top and take from the top, so the last item in is the first out (**LIFO**).',
        },
        { kind: 'heading', text: 'Key ideas' },
        {
          kind: 'bullets',
          items: [
            '**push** adds to the top, **pop** removes the top, **peek** reads it without removing it.',
            'Only the top is in reach; everything else waits underneath.',
            'Build it on an array (with a top index) or a linked list (with the head as the top).',
          ],
        },
        { kind: 'heading', text: 'Use it for' },
        {
          kind: 'bullets',
          items: [
            'Undo and the browser’s back button.',
            'Matching brackets and evaluating expressions.',
            'Function calls: the call stack.',
            'Depth-first search and backtracking.',
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
            ['Push', 'O(1)', 'O(1)'],
            ['Pop', 'O(1)', 'O(1)'],
            ['Peek', 'O(1)', 'O(1)'],
            ['Search', 'O(n)', 'O(n)'],
          ],
        },
        {
          kind: 'text',
          text: 'Space: **O(n)** for n items. On a dynamic array, a push that has to grow the array is O(n), but O(1) amortised.',
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
            '**Underflow**: popping or peeking an empty stack. Check it isn’t empty first.',
            '**Overflow**: pushing onto a full fixed-size stack.',
            'Need the oldest item first? That’s a queue, not a stack.',
            'Searching means digging through everything above. If you search often, use another structure.',
          ],
        },
      ],
    },
  ],
} satisfies Reference;
