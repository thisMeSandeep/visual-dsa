import type { Reference } from '../../schema';

/** Sliding Window cheat sheet (F-801 – F-803). */
export const reference = {
  topicId: 'sliding-window',
  tabs: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          kind: 'text',
          text: 'A sliding window is a run of neighbours, left…right, that moves along the array. Update it as items enter and leave instead of recomputing it.',
        },
        { kind: 'heading', text: 'Two shapes' },
        {
          kind: 'bullets',
          items: [
            '**Fixed** size k: add the item entering, take away the one leaving.',
            '**Variable** size: grow on the right; shrink from the left when a rule breaks (a repeat, a sum too big).',
            'A **monotonic deque** tracks the window’s maximum (or minimum) as it slides.',
          ],
        },
        { kind: 'heading', text: 'Use it for' },
        {
          kind: 'bullets',
          items: [
            'Best sum or average of k in a row.',
            'Longest or shortest run that meets a rule.',
            'Moving maxima, such as the highest price over the last 7 days.',
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
          columns: ['Problem', 'Window', 'Brute force'],
          rows: [
            ['Best sum of k', 'O(n)', 'O(n·k)'],
            ['Longest with no repeats', 'O(n)', 'O(n²)'],
            ['Maximum of each window', 'O(n)', 'O(n·k)'],
          ],
        },
        {
          kind: 'text',
          text: 'Space: **O(1)** for a sum, up to **O(k)** for the set or deque.',
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
            'Off by one: a window of k ending at right starts at **right − k + 1**.',
            'Record a fixed window’s answer only once it holds k items.',
            'Shrink with a **while**, not an if: one step left may not be enough.',
            'Windows need **neighbours**. For any k items, not just neighbours, it’s a different problem.',
          ],
        },
      ],
    },
  ],
} satisfies Reference;
