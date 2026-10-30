import type { Reference } from '../../schema';

/** Array cheat sheet (F-801 – F-803). */
export const reference = {
  topicId: 'array',
  tabs: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          kind: 'text',
          text: 'An array stores items side by side in one block of memory, numbered from **index 0**.',
        },
        { kind: 'heading', text: 'Key ideas' },
        {
          kind: 'bullets',
          items: [
            'Any index is one step away: its address is **start + index × slot size**.',
            'Inserting or deleting in the middle shifts every item after it.',
            'A **dynamic array** doubles when it’s full, so pushing stays O(1) on average.',
            '**Size** counts items; **capacity** counts slots.',
          ],
        },
        { kind: 'heading', text: 'Use it for' },
        {
          kind: 'bullets',
          items: [
            'Reading and writing by position.',
            'Lists that mostly grow at the end.',
            'The base for stacks, queues, heaps and hash tables.',
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
            ['Get or set by index', 'O(1)', 'O(1)'],
            ['Search (unsorted)', 'O(n)', 'O(n)'],
            ['Push to the end', 'O(1)', 'O(n)'],
            ['Insert at an index', 'O(n)', 'O(n)'],
            ['Delete at an index', 'O(n)', 'O(n)'],
          ],
        },
        {
          kind: 'text',
          text: 'Push is O(n) only when the array grows; spread over all pushes it’s **O(1) amortised**. Space: **O(n)**.',
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
            '**Off by one**: with n items the last index is n − 1, not n.',
            'Reading or writing past the end is **out of bounds**.',
            'Inserting at the front of a big array moves every item. A linked list or a deque may suit better.',
            'Deleting while looping forwards skips the item that shifts into the gap.',
          ],
        },
      ],
    },
  ],
} satisfies Reference;
