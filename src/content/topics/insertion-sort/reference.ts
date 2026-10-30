import type { Reference } from '../../schema';

/** Insertion Sort cheat sheet (F-801 – F-803). */
export const reference = {
  topicId: 'insertion-sort',
  tabs: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          kind: 'text',
          text: 'Insertion sort takes each item in turn as the **key** and slides it back into place among the sorted items before it.',
        },
        { kind: 'heading', text: 'Key ideas' },
        {
          kind: 'bullets',
          items: [
            'The left part is **sorted so far**; each round adds one item to it.',
            'Items bigger than the key **shift right**, one write each, opening a gap.',
            'The key drops in after the first item that isn’t bigger, or at the front.',
            'Nearly sorted input means few shifts: close to **O(n)**.',
          ],
        },
        { kind: 'heading', text: 'Use it for' },
        {
          kind: 'bullets',
          items: [
            'Small or nearly sorted arrays.',
            'Short runs inside hybrid sorts such as Timsort and introsort.',
            'Keeping a list sorted as new items arrive one at a time.',
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
          columns: ['Case', 'Comparisons', 'Shifts'],
          rows: [
            ['Best (sorted)', 'O(n)', '0'],
            ['Average', 'O(n²)', 'O(n²)'],
            ['Worst (reversed)', 'O(n²)', 'O(n²)'],
          ],
        },
        {
          kind: 'text',
          text: 'Space: **O(1)**, in place. **Stable**: yes. Its time grows with how far items are from their places.',
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
            'Save the **key** before shifting, or the first shift overwrites it.',
            'Check j >= 0 before reading a[j], or the loop reads past the front.',
            'Shift only while a[j] > key. Using >= moves equal items and loses **stability**.',
            'Insert at j + 1, not j: j stops on the item the key goes after.',
          ],
        },
      ],
    },
  ],
} satisfies Reference;
