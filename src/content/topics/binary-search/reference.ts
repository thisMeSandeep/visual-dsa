import type { Reference } from '../../schema';

/** Binary Search cheat sheet (F-801 – F-803). */
export const reference = {
  topicId: 'binary-search',
  tabs: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          kind: 'text',
          text: 'Binary search finds a value in a **sorted** array by checking the middle of the range left and throwing away the half that can’t hold it.',
        },
        { kind: 'heading', text: 'Key ideas' },
        {
          kind: 'bullets',
          items: [
            '**low** and **high** mark the range still to search; **mid** = (low + high) ÷ 2, rounded down.',
            'a[mid] too small: **low = mid + 1**. Too big: **high = mid − 1**.',
            'When **low passes high** the range is empty: the target isn’t there.',
            'For the **first** or **last** of equal values, remember a match and keep going left or right.',
          ],
        },
        { kind: 'heading', text: 'Use it for' },
        {
          kind: 'bullets',
          items: [
            'Looking things up in sorted data that rarely changes.',
            'Finding where a value would go to keep an array sorted.',
            'Any yes/no question that flips once along a range, such as the first bad version.',
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
            ['Best (mid is the target)', 'O(1)', 'O(1)'],
            ['Average', 'O(log n)', 'O(1)'],
            ['Worst, or not found', 'O(log n)', 'O(1)'],
            ['Recursive version', 'O(log n)', 'O(log n)'],
          ],
        },
        {
          kind: 'text',
          text: 'Compare **linear search**: O(n). For 1,000,000 items that’s up to a million checks against about **20**.',
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
            'The array must be **sorted**. On unsorted data it can miss values that are there.',
            '**Off by one**: use low <= high, and move past mid (mid + 1, mid − 1), or the loop can run forever.',
            'In languages with fixed-size integers, low + high can overflow. Use **low + (high − low) ÷ 2**.',
            'With duplicates, the plain search returns any one match, not necessarily the first.',
            'Sorting first costs O(n log n). For a single search, linear search is cheaper.',
          ],
        },
      ],
    },
  ],
} satisfies Reference;
