import type { Quiz } from '../../schema';

/** Insertion Sort quiz (ALGORITHM-CATALOG A4 "Practice ideas"). Each question links to its chapter. */
export const quiz = {
  topicId: 'insertion-sort',
  questions: [
    {
      id: 'sorted-part',
      kind: 'true-false',
      prompt: 'Before round i, the items at indices 0 to i − 1 are sorted among themselves.',
      answer: true,
      explanation:
        'Each round slides one more item into the sorted part, so it stays sorted. Later items may still join it.',
      chapterId: 'playing-cards',
    },
    {
      id: 'final-yet',
      kind: 'true-false',
      prompt: 'Like selection sort, an item in insertion sort’s sorted part is in its final place.',
      answer: false,
      explanation: 'A smaller key arriving later shifts it right, so it can still move.',
      chapterId: 'playing-cards',
    },
    {
      id: 'what-shifts',
      kind: 'multiple-choice',
      prompt: 'The key is 5. Which items of the sorted part shift right?',
      context: 'sorted part: 2 4 7 9   key: 5',
      options: [
        { id: 'bigger', text: '9 and 7' },
        { id: 'all', text: '2, 4, 7 and 9' },
        { id: 'smaller', text: '2 and 4' },
        { id: 'last', text: 'Only 9' },
      ],
      answer: 'bigger',
      explanation: 'Only items bigger than the key move. It stops at 4, and 5 goes after it.',
      chapterId: 'shift-right',
    },
    {
      id: 'shift-vs-swap',
      kind: 'multiple-choice',
      prompt: 'How does insertion sort make room for the key?',
      options: [
        { id: 'shift', text: 'It shifts bigger items one place right into the gap' },
        { id: 'swap', text: 'It swaps the key with the first item' },
        { id: 'new', text: 'It copies everything into a new array' },
        { id: 'end', text: 'It moves the key to the end' },
      ],
      answer: 'shift',
      explanation: 'Taking the key out leaves a gap; each shift moves the gap one place left.',
      chapterId: 'shift-right',
    },
    {
      id: 'after-round',
      kind: 'multiple-choice',
      prompt: 'Insertion sort has done rounds 1 and 2. What does the array look like?',
      context: '7 3 5 2 9 4',
      options: [
        { id: 'three', text: '3 5 7 2 9 4' },
        { id: 'sorted', text: '2 3 4 5 7 9' },
        { id: 'swap', text: '3 7 5 2 9 4' },
        { id: 'min', text: '2 3 5 7 9 4' },
      ],
      answer: 'three',
      explanation:
        'Round 1 inserts 3 before 7, round 2 inserts 5 between them: 3 5 7, the rest untouched.',
      chapterId: 'insert-key',
    },
    {
      id: 'best-case',
      kind: 'complexity',
      prompt: 'How long does insertion sort take on an already sorted array?',
      options: [
        { id: 'constant', text: 'O(1)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'nlogn', text: 'O(n log n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'linear',
      explanation:
        'Each key is compared once with its left neighbour and stays: n − 1 comparisons.',
      chapterId: 'nearly-sorted',
    },
    {
      id: 'worst-case',
      kind: 'complexity',
      prompt: 'How long does insertion sort take on reversed input?',
      options: [
        { id: 'linear', text: 'O(n)' },
        { id: 'nlogn', text: 'O(n log n)' },
        { id: 'quadratic', text: 'O(n²)' },
        { id: 'cubic', text: 'O(n³)' },
      ],
      answer: 'quadratic',
      explanation: 'Every key shifts past every item before it: n(n − 1) ÷ 2 shifts.',
      chapterId: 'nearly-sorted',
    },
    {
      id: 'fastest-nearly',
      kind: 'multiple-choice',
      prompt: 'Which of these sorts is fastest on a nearly sorted array?',
      options: [
        { id: 'insertion', text: 'Insertion sort' },
        { id: 'selection', text: 'Selection sort' },
        { id: 'same', text: 'They all take the same time' },
      ],
      answer: 'insertion',
      explanation:
        'Insertion sort barely shifts anything, close to O(n). Selection sort always scans everything.',
      chapterId: 'nearly-sorted',
    },
    {
      id: 'hybrid',
      kind: 'true-false',
      prompt: 'Fast library sorts often switch to insertion sort for short runs.',
      answer: true,
      explanation:
        'On small arrays its simple loop beats the overhead of cleverer sorts, so Timsort and introsort use it.',
      chapterId: 'hybrid-sorts',
    },
  ],
} satisfies Quiz;
