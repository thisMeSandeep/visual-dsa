import type { Reference } from '../../schema';

/** Selection Sort cheat sheet (F-801 – F-803). */
export const reference = {
  topicId: 'selection-sort',
  tabs: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          kind: 'text',
          text: 'Selection sort finds the **smallest** item of the unsorted part and swaps it to the front of that part, one round per position.',
        },
        { kind: 'heading', text: 'Key ideas' },
        {
          kind: 'bullets',
          items: [
            '**min** tracks the smallest seen so far while **j** scans the rest.',
            'The **sorted prefix** grows by one each round, and those items never move again.',
            'At most one swap per round: n − 1 in all.',
            'It always scans everything left, so the input’s order makes no difference.',
          ],
        },
        { kind: 'heading', text: 'Use it for' },
        {
          kind: 'bullets',
          items: [
            'Small arrays where writing is much more expensive than reading.',
            'Learning: it’s the simplest sort to explain.',
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
          columns: ['Case', 'Comparisons', 'Swaps'],
          rows: [
            ['Best (sorted)', 'O(n²)', '0'],
            ['Average', 'O(n²)', 'O(n)'],
            ['Worst', 'O(n²)', 'O(n)'],
          ],
        },
        {
          kind: 'text',
          text: 'Always n(n − 1) ÷ 2 comparisons. Space: **O(1)**, in place. **Stable**: no.',
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
            'It isn’t **stable**: a long swap can jump an item past an equal one.',
            'It has no early exit: sorted input costs as much as any other.',
            'Start j at i + 1, and the outer loop can stop at n − 2: the last item falls into place.',
            'Remember the **index** of the minimum, not just its value, or you can’t swap it.',
          ],
        },
      ],
    },
  ],
} satisfies Reference;
