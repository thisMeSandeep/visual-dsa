import type { Reference } from '../../schema';

/** Recursion cheat sheet (F-801 – F-803). */
export const reference = {
  topicId: 'recursion',
  tabs: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          kind: 'text',
          text: 'A recursive function calls itself on a smaller problem until it reaches one small enough to answer directly.',
        },
        { kind: 'heading', text: 'Key ideas' },
        {
          kind: 'bullets',
          items: [
            'A **base case** answers directly; a **recursive case** calls itself on something smaller.',
            'Each call gets a **frame** on the **call stack**; the last call made returns first.',
            'When a function calls itself more than once, the calls form a **call tree**.',
            '**Memoisation** saves answers so repeated calls are looked up, not redone.',
          ],
        },
        { kind: 'heading', text: 'Use it for' },
        {
          kind: 'bullets',
          items: [
            'Problems made of smaller copies of themselves: trees, divide and conquer, backtracking.',
            'Merge sort and quick sort, and walking trees and graphs.',
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
          columns: ['Function', 'Time', 'Stack'],
          rows: [
            ['fact(n)', 'O(n)', 'O(n)'],
            ['fib(n)', 'O(2ⁿ)', 'O(n)'],
            ['fib(n) with a memo', 'O(n)', 'O(n)'],
          ],
        },
        {
          kind: 'text',
          text: 'Stack space is the deepest the calls go, not how many there are. The memo adds **O(n)** space.',
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
            'No base case, or one the input never reaches, means a **stack overflow**.',
            'Each call must move closer to the base case: n − 1, not n.',
            'Calling twice on overlapping problems repeats work: use a memo or a loop.',
            'Very deep recursion can overflow even when it’s correct. A loop uses O(1) stack.',
          ],
        },
      ],
    },
  ],
} satisfies Reference;
