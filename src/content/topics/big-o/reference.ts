import type { Reference } from '../../schema';

/** Big O cheat sheet (F-801 – F-803). */
export const reference = {
  topicId: 'big-o',
  tabs: [
    {
      id: 'classes',
      title: 'Classes',
      blocks: [
        {
          kind: 'table',
          columns: ['Class', 'Name', 'Example'],
          rows: [
            ['O(1)', 'Constant', 'Reading an array index'],
            ['O(log n)', 'Logarithmic', 'Binary search'],
            ['O(n)', 'Linear', 'A single loop'],
            ['O(n log n)', 'Linearithmic', 'Merge sort'],
            ['O(n²)', 'Quadratic', 'Nested loops'],
            ['O(2ⁿ)', 'Exponential', 'Trying every subset'],
          ],
        },
        {
          kind: 'text',
          text: 'Fastest at the top. At n = 1,000: about 10 steps for log n, a million for n².',
        },
      ],
    },
    {
      id: 'rules',
      title: 'Rules',
      blocks: [
        {
          kind: 'bullets',
          items: [
            '**Drop constants**: 3n + 5 is O(n).',
            '**Drop smaller terms**: n² + n is O(n²).',
            '**Steps in a row add**: a loop over n, then one over m, is O(n + m).',
            '**Nested loops multiply**: a loop over n inside a loop over n is O(n²).',
            '**Halving each time** gives a log: O(log n).',
          ],
        },
      ],
    },
    {
      id: 'cases',
      title: 'Cases',
      blocks: [
        {
          kind: 'bullets',
          items: [
            '**Best case**: the luckiest input, such as finding the value first.',
            '**Average case**: what to expect on typical input.',
            '**Worst case**: the most work any input can cause. Big O usually means this.',
            '**Space complexity** counts memory the same way as steps.',
            '**Amortised**: a cost averaged over many operations, like a dynamic array’s push.',
          ],
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
            'Big O describes growth, not speed: for small n, an O(n²) method can beat an O(n) one.',
            'A call inside a loop counts too: a loop that calls an O(n) function is O(n²).',
            'Two different inputs need two letters: O(n + m), not O(n).',
            'O(log n) assumes the problem really halves, as in a sorted array.',
          ],
        },
      ],
    },
  ],
} satisfies Reference;
