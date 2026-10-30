import type { Reference } from '../../schema';

/** Merge Sort cheat sheet (F-801 – F-803). */
export const reference = {
  topicId: 'merge-sort',
  tabs: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          kind: 'text',
          text: 'Merge sort splits the array in half, sorts each half the same way, then **merges** the two sorted halves into one.',
        },
        { kind: 'heading', text: 'Key ideas' },
        {
          kind: 'bullets',
          items: [
            '**Divide and conquer**: split until pieces have one item, then merge back up.',
            'Merging compares the two front items and takes the smaller: **O(n)** per merge.',
            '**log₂ n** levels, each merging n items: **O(n log n)** whatever the input.',
            'On a tie, take from the left half: that keeps it **stable**.',
          ],
        },
        { kind: 'heading', text: 'Use it for' },
        {
          kind: 'bullets',
          items: [
            'When you need a guaranteed O(n log n), or a stable sort.',
            'Linked lists, which it can merge without extra space.',
            'Data too big for memory: sort chunks, then merge them from disk.',
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
          columns: ['Case', 'Time', 'Space'],
          rows: [
            ['Best', 'O(n log n)', 'O(n)'],
            ['Average', 'O(n log n)', 'O(n)'],
            ['Worst', 'O(n log n)', 'O(n)'],
          ],
        },
        {
          kind: 'text',
          text: 'The O(n) is the merge buffer; the recursion adds O(log n). **Stable**: yes.',
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
            'Use <= when comparing the fronts. Using < takes from the right on ties and loses **stability**.',
            'After the loop, copy whatever is left of **both** halves, or items go missing.',
            'Stop at ranges of fewer than 2 items, or the recursion never ends.',
            'On tiny arrays the copying costs more than it saves: real libraries switch to insertion sort.',
          ],
        },
      ],
    },
  ],
} satisfies Reference;
