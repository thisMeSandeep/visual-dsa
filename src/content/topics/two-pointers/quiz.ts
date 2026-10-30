import type { Quiz } from '../../schema';

/** Two Pointers quiz (ALGORITHM-CATALOG A9). Each question links to its chapter. */
export const quiz = {
  topicId: 'two-pointers',
  questions: [
    {
      id: 'reverse-swaps',
      kind: 'multiple-choice',
      prompt: 'How many swaps does reversing 8 items with two pointers take?',
      options: [
        { id: 'four', text: '4' },
        { id: 'eight', text: '8' },
        { id: 'seven', text: '7' },
        { id: 'sixteen', text: '16' },
      ],
      answer: 'four',
      explanation: 'Each swap fixes both ends, so n ÷ 2 swaps: 4.',
      chapterId: 'both-ends',
    },
    {
      id: 'reverse-space',
      kind: 'complexity',
      prompt: 'How much extra space does reversing in place with two pointers use?',
      options: [
        { id: 'constant', text: 'O(1)' },
        { id: 'log', text: 'O(log n)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'constant',
      explanation: 'Just the two indices: no second array.',
      chapterId: 'both-ends',
    },
    {
      id: 'too-small',
      kind: 'multiple-choice',
      prompt: 'Looking for a pair that adds up to 10, the sum is 7. Which pointer moves?',
      context: 'sorted: 1 3 4 6 8   left on 1, right on 6',
      options: [
        { id: 'left', text: 'left moves right' },
        { id: 'right', text: 'right moves left' },
        { id: 'both', text: 'Both move in' },
        { id: 'none', text: 'Neither: stop' },
      ],
      answer: 'left',
      explanation:
        'The sum is too small, and moving left to a bigger item is the only way to raise it.',
      chapterId: 'pair-sum',
    },
    {
      id: 'pair-time',
      kind: 'complexity',
      prompt: 'How long does pair sum with two pointers take on a sorted array of n items?',
      options: [
        { id: 'log', text: 'O(log n)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'nlogn', text: 'O(n log n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'linear',
      explanation: 'Each step moves one pointer in, ruling an item out: at most n − 1 steps.',
      chapterId: 'pair-sum',
    },
    {
      id: 'needs-sorted',
      kind: 'true-false',
      prompt: 'The two-pointer pair sum works on unsorted arrays too.',
      answer: false,
      explanation:
        'Moving a pointer only raises or lowers the sum when the array is sorted. Unsorted, it can miss pairs.',
      chapterId: 'pair-sum',
    },
    {
      id: 'dedupe-result',
      kind: 'multiple-choice',
      prompt: 'After removing duplicates in place, what are the first items?',
      context: '2 2 2 5 7 7 9',
      options: [
        { id: 'unique', text: '2 5 7 9' },
        { id: 'repeats', text: '2 7' },
        { id: 'sorted', text: '2 2 2 5 7 7 9' },
        { id: 'reversed', text: '9 7 5 2' },
      ],
      answer: 'unique',
      explanation: 'One of each value is copied down to write: 2 5 7 9. The count returned is 4.',
      chapterId: 'remove-duplicates',
    },
    {
      id: 'dedupe-pointers',
      kind: 'multiple-choice',
      prompt: 'Removing duplicates, which pointer moves on every step?',
      options: [
        { id: 'read', text: 'read' },
        { id: 'write', text: 'write' },
        { id: 'both', text: 'Both, always together' },
        { id: 'neither', text: 'Neither' },
      ],
      answer: 'read',
      explanation: 'read checks every item; write only moves when a new value is kept.',
      chapterId: 'remove-duplicates',
    },
    {
      id: 'when',
      kind: 'multiple-choice',
      prompt: 'Which problem suits two pointers best?',
      options: [
        { id: 'palindrome', text: 'Checking whether a word reads the same backwards' },
        { id: 'lookup', text: 'Looking up a phone number by name' },
        { id: 'tree', text: 'Finding the height of a tree' },
        { id: 'shortest', text: 'The shortest path between two cities' },
      ],
      answer: 'palindrome',
      explanation:
        'Compare the first and last letters, then step both in: a classic from-both-ends job.',
      chapterId: 'when-it-applies',
    },
  ],
} satisfies Quiz;
