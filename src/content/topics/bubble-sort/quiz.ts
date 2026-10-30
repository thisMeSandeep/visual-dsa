import type { Quiz } from '../../schema';

/** Bubble Sort quiz (ALGORITHM-CATALOG A2 "Practice ideas"). Each question links to its chapter. */
export const quiz = {
  topicId: 'bubble-sort',
  questions: [
    {
      id: 'compares-what',
      kind: 'multiple-choice',
      prompt: 'Which items does bubble sort compare?',
      options: [
        { id: 'neighbours', text: 'Two neighbours, side by side' },
        { id: 'ends', text: 'The first and last item' },
        { id: 'smallest', text: 'Each item with the smallest so far' },
        { id: 'middle', text: 'Each item with the middle one' },
      ],
      answer: 'neighbours',
      explanation:
        'It only ever looks at a[j] and a[j + 1], swapping them if they’re out of order.',
      chapterId: 'compare-and-swap',
    },
    {
      id: 'after-pass-one',
      kind: 'multiple-choice',
      prompt: 'After the first pass of bubble sort, what’s the last element?',
      context: '5 3 8 1 9 2',
      options: [
        { id: 'nine', text: '9' },
        { id: 'two', text: '2' },
        { id: 'eight', text: '8' },
        { id: 'one', text: '1' },
      ],
      answer: 'nine',
      explanation: 'One pass carries the biggest value all the way to the end: 9.',
      chapterId: 'one-pass',
    },
    {
      id: 'pass-result',
      kind: 'multiple-choice',
      prompt: 'What does the array look like after one pass?',
      context: '4 1 3 2',
      options: [
        { id: 'right', text: '1 3 2 4' },
        { id: 'sorted', text: '1 2 3 4' },
        { id: 'first', text: '1 4 3 2' },
        { id: 'same', text: '4 1 3 2' },
      ],
      answer: 'right',
      explanation:
        '4 swaps with 1, then 3, then 2, moving to the end. 3 and 2 aren’t compared yet.',
      chapterId: 'one-pass',
    },
    {
      id: 'tail',
      kind: 'true-false',
      prompt: 'After k passes, the last k items are in their final places.',
      answer: true,
      explanation:
        'Each pass fixes the biggest value left, so the sorted tail grows by one per pass.',
      chapterId: 'sorted-tail',
    },
    {
      id: 'passes',
      kind: 'multiple-choice',
      prompt: 'Without the early exit, how many passes does bubble sort make on 8 items?',
      options: [
        { id: 'seven', text: '7' },
        { id: 'eight', text: '8' },
        { id: 'three', text: '3' },
        { id: 'sixtyfour', text: '64' },
      ],
      answer: 'seven',
      explanation: 'n − 1 passes: once 7 values are in place, the 8th must be too.',
      chapterId: 'sorted-tail',
    },
    {
      id: 'early-exit',
      kind: 'multiple-choice',
      prompt: 'When can bubble sort stop early?',
      options: [
        { id: 'no-swaps', text: 'When a whole pass makes no swaps' },
        { id: 'first-sorted', text: 'When the first item is the smallest' },
        { id: 'half', text: 'After n ÷ 2 passes' },
        { id: 'one-swap', text: 'When a pass makes only one swap' },
      ],
      answer: 'no-swaps',
      explanation: 'No swaps means every neighbouring pair is in order, so the whole array is.',
      chapterId: 'early-exit',
    },
    {
      id: 'best-case',
      kind: 'complexity',
      prompt: 'With the early exit, how long does bubble sort take on an already sorted array?',
      options: [
        { id: 'constant', text: 'O(1)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'nlogn', text: 'O(n log n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'linear',
      explanation: 'One pass of n − 1 comparisons finds no swaps, and it stops.',
      chapterId: 'early-exit',
    },
    {
      id: 'worst-case',
      kind: 'complexity',
      prompt: 'How long does bubble sort take on reversed input?',
      options: [
        { id: 'linear', text: 'O(n)' },
        { id: 'nlogn', text: 'O(n log n)' },
        { id: 'quadratic', text: 'O(n²)' },
        { id: 'cubic', text: 'O(n³)' },
      ],
      answer: 'quadratic',
      explanation: 'Every comparison swaps: n(n − 1) ÷ 2 of each, which grows like n².',
      chapterId: 'complexity',
    },
    {
      id: 'stable',
      kind: 'true-false',
      prompt: 'Bubble sort is stable: equal values keep their original order.',
      answer: true,
      explanation:
        'It only swaps when the left item is strictly bigger, so equal values never pass.',
      chapterId: 'complexity',
    },
  ],
} satisfies Quiz;
