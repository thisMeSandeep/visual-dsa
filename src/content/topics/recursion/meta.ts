import type { TopicMeta } from '../../schema';

/** ALGORITHM-CATALOG F2 */
export const meta = {
  id: 'recursion',
  title: 'Recursion',
  summary:
    'A function that calls itself on a smaller problem, until one is small enough to answer.',
  category: 'foundations',
  priority: 'P1',
  renderer: 'call-stack',
  glyph: 'recursion',
  chapters: [
    { id: 'base-case', title: 'Base case and recursive case' },
    { id: 'call-stack', title: 'The call stack' },
    { id: 'factorial', title: 'Factorial' },
    { id: 'fibonacci', title: 'Fibonacci and its repeated work' },
    { id: 'memoisation', title: 'Memoisation preview' },
    { id: 'stack-overflow', title: 'Stack overflow' },
  ],
  complexity: [
    { label: 'Factorial', value: 'O(n)' },
    { label: 'Fibonacci', value: 'O(2ⁿ)' },
    { label: 'With memo', value: 'O(n)' },
  ],
} satisfies TopicMeta;
