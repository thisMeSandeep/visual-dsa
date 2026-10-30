import type { Quiz } from '../../schema';

/** Quick Sort quiz (ALGORITHM-CATALOG A6 "Practice ideas"). Each question links to its chapter. */
export const quiz = {
  topicId: 'quick-sort',
  questions: [
    {
      id: 'lomuto-pivot',
      kind: 'multiple-choice',
      prompt: 'Which item does Lomuto’s partition use as the pivot?',
      context: '7 2 9 4 3 8 5',
      options: [
        { id: 'last', text: '5, the last item' },
        { id: 'first', text: '7, the first item' },
        { id: 'middle', text: '4, the middle item' },
        { id: 'median', text: '5, because it’s the median' },
      ],
      answer: 'last',
      explanation: 'Lomuto always takes the range’s last item, a[hi]. Here that happens to be 5.',
      chapterId: 'pivot',
    },
    {
      id: 'pivot-final',
      kind: 'true-false',
      prompt: 'After a partition, the pivot is in its final sorted place.',
      answer: true,
      explanation:
        'Everything left of it is smaller or equal, everything right is bigger, so it never moves again.',
      chapterId: 'partition',
    },
    {
      id: 'partition-result',
      kind: 'multiple-choice',
      prompt: 'Partition around the pivot 5, the last item. Where does 5 end up?',
      context: 'index 0 1 2 3 4 5 6\nvalue 7 2 9 4 3 8 5',
      options: [
        { id: 'three', text: 'Index 3' },
        { id: 'six', text: 'Index 6' },
        { id: 'zero', text: 'Index 0' },
        { id: 'four', text: 'Index 4' },
      ],
      answer: 'three',
      explanation: 'Three items are ≤ 5 (2, 4, 3), so they take indices 0 to 2 and 5 lands at 3.',
      chapterId: 'partition',
    },
    {
      id: 'partition-cost',
      kind: 'complexity',
      prompt: 'How long does one partition of a range of n items take?',
      options: [
        { id: 'log', text: 'O(log n)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'nlogn', text: 'O(n log n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'linear',
      explanation: 'j walks the range once, comparing each item with the pivot.',
      chapterId: 'partition',
    },
    {
      id: 'sides',
      kind: 'true-false',
      prompt: 'After partitioning, the two sides are sorted separately and never mixed again.',
      answer: true,
      explanation: 'Every item on the left is ≤ the pivot and every item on the right is bigger.',
      chapterId: 'recurse',
    },
    {
      id: 'worst-input',
      kind: 'multiple-choice',
      prompt: 'Using the last item as pivot, which input is the worst case?',
      options: [
        { id: 'sorted', text: 'An already sorted array' },
        { id: 'random', text: 'A shuffled array' },
        { id: 'small', text: 'An array of 2 items' },
        { id: 'distinct', text: 'An array with no repeats' },
      ],
      answer: 'sorted',
      explanation:
        'Each pivot is the biggest in its range, so every partition peels off just one item.',
      chapterId: 'worst-case',
    },
    {
      id: 'worst-time',
      kind: 'complexity',
      prompt: 'What is quick sort’s worst-case time?',
      options: [
        { id: 'nlogn', text: 'O(n log n)' },
        { id: 'quadratic', text: 'O(n²)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'log', text: 'O(log n)' },
      ],
      answer: 'quadratic',
      explanation: 'Partitions of n, n − 1, n − 2… items add up to about n²/2 comparisons.',
      chapterId: 'worst-case',
    },
    {
      id: 'random-why',
      kind: 'multiple-choice',
      prompt: 'Why pick the pivot at random?',
      options: [
        { id: 'unlikely', text: 'It makes many bad splits in a row very unlikely' },
        { id: 'stable', text: 'It makes quick sort stable' },
        { id: 'space', text: 'It removes the need for recursion' },
        { id: 'always', text: 'It guarantees a split exactly in half' },
      ],
      answer: 'unlikely',
      explanation: 'No input order can force bad pivots, so the expected time is O(n log n).',
      chapterId: 'random-pivot',
    },
    {
      id: 'stable',
      kind: 'true-false',
      prompt: 'Quick sort is stable.',
      answer: false,
      explanation:
        'Partition swaps can carry an item past an equal one, so their order can change.',
      chapterId: 'random-pivot',
    },
  ],
} satisfies Quiz;
