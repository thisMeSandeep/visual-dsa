import type { Reference } from '../../schema';

/** Two Pointers cheat sheet (F-801 – F-803). */
export const reference = {
  topicId: 'two-pointers',
  tabs: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          kind: 'text',
          text: 'Two pointers walk one array at the same time, so a single pass replaces nested loops.',
        },
        { kind: 'heading', text: 'Two shapes' },
        {
          kind: 'bullets',
          items: [
            '**From both ends**: left starts at 0, right at n − 1, and they move inwards until they meet.',
            '**Fast and slow**: read visits every item, write moves only when it keeps one.',
          ],
        },
        { kind: 'heading', text: 'Use it for' },
        {
          kind: 'bullets',
          items: [
            'Pair sums and triplets in sorted arrays.',
            'Reversing, and checking palindromes.',
            'Removing repeats or filtering in place.',
            'Merging two sorted lists.',
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
          columns: ['Problem', 'Two pointers', 'Brute force'],
          rows: [
            ['Pair sum (sorted)', 'O(n)', 'O(n²)'],
            ['Reverse', 'O(n)', 'O(n)'],
            ['Remove duplicates (sorted)', 'O(n)', 'O(n²)'],
          ],
        },
        {
          kind: 'text',
          text: 'Extra space: **O(1)**, just the two indices. Sorting first adds O(n log n).',
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
            'Pair sum needs **sorted** input: on unsorted data it can miss pairs.',
            'Loop while left < right, not <=, or an item pairs with itself.',
            'Removing duplicates in place only works when equal values sit together, as in a sorted array.',
            'Each step must move at least one pointer, or the loop never ends.',
          ],
        },
      ],
    },
  ],
} satisfies Reference;
