import type { Reference } from '../../schema';

/** Bubble Sort cheat sheet (F-801 – F-803). */
export const reference = {
  topicId: 'bubble-sort',
  tabs: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          kind: 'text',
          text: 'Bubble sort walks the array comparing **neighbours**, swapping any pair that’s out of order, and repeats until a pass needs no swaps.',
        },
        { kind: 'heading', text: 'Key ideas' },
        {
          kind: 'bullets',
          items: [
            'Each pass carries the **biggest** value left to the end.',
            'The **sorted tail** grows by one per pass, so each pass checks one pair fewer.',
            'A pass with **no swaps** means it’s sorted: stop early.',
            'Small values move left only one place per pass, so a small value at the end is slow.',
          ],
        },
        { kind: 'heading', text: 'Use it for' },
        {
          kind: 'bullets',
          items: [
            'Learning how sorting works.',
            'Tiny arrays, or checking an array that should already be sorted.',
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
            ['Best (sorted)', 'O(n)', '0'],
            ['Average', 'O(n²)', 'O(n²)'],
            ['Worst (reversed)', 'O(n²)', 'O(n²)'],
          ],
        },
        {
          kind: 'text',
          text: 'The best case needs the early exit. Space: **O(1)**, in place. **Stable**: yes.',
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
            'Without the **swapped** flag, it always makes n − 1 passes, even on sorted input.',
            'Swap only when a[j] > a[j + 1]. Using >= swaps equal values and loses **stability**.',
            'Loop j up to n − 1 − pass, or a[j + 1] runs past the end.',
            'It’s O(n²) on average: for more than a few dozen items, use a faster sort.',
          ],
        },
      ],
    },
  ],
} satisfies Reference;
