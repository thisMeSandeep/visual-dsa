import type { Reference } from '../../schema';

/** Quick Sort cheat sheet (F-801 – F-803). */
export const reference = {
  topicId: 'quick-sort',
  tabs: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          kind: 'text',
          text: 'Quick sort picks a **pivot**, partitions the range so smaller items are left of it and bigger ones right, then sorts each side the same way.',
        },
        { kind: 'heading', text: 'Key ideas' },
        {
          kind: 'bullets',
          items: [
            '**Lomuto**: the pivot is a[hi]; j scans, and items ≤ the pivot swap down to i.',
            'After a partition the **pivot is in its final place**.',
            'Good pivots split near the middle: about **log n** levels of O(n) work.',
            'A **random pivot** stops any input order from forcing bad splits.',
            '**Hoare’s** partition scans from both ends and swaps less.',
          ],
        },
        { kind: 'heading', text: 'Use it for' },
        {
          kind: 'bullets',
          items: [
            'General-purpose in-memory sorting: usually the fastest in practice.',
            'Finding the k-th smallest item (quickselect), using one side only.',
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
          columns: ['Case', 'Time', 'Stack space'],
          rows: [
            ['Best', 'O(n log n)', 'O(log n)'],
            ['Average', 'O(n log n)', 'O(log n)'],
            ['Worst (bad pivots)', 'O(n²)', 'O(n)'],
          ],
        },
        {
          kind: 'text',
          text: 'In place: no buffer, only the recursion stack. **Stable**: no.',
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
            'The last (or first) item as pivot is **O(n²)** on sorted input. Use a random or median-of-three pivot.',
            'Many equal values also unbalance Lomuto’s split. Three-way partitioning handles them.',
            'Recurse into the smaller side and loop over the larger, to keep the stack at O(log n).',
            'It isn’t **stable**. Use merge sort when equal items must keep their order.',
          ],
        },
      ],
    },
  ],
} satisfies Reference;
