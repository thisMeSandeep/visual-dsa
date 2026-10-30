import type { Quiz } from '../../schema';

/** Array quiz (ALGORITHM-CATALOG L1 "Practice ideas"). Each question links to its chapter. */
export const quiz = {
  topicId: 'array',
  questions: [
    {
      id: 'first-index',
      kind: 'true-false',
      prompt: 'The first item in an array is at index 1.',
      answer: false,
      explanation:
        'Indices count from 0, so the first item is at index 0 and the last at size − 1.',
      chapterId: 'memory-and-indices',
    },
    {
      id: 'address',
      kind: 'multiple-choice',
      prompt: 'An array starts at address 1000 and each slot takes 4 bytes. Where is index 5?',
      options: [
        { id: 'a1005', text: '1005' },
        { id: 'a1016', text: '1016' },
        { id: 'a1020', text: '1020' },
        { id: 'a1024', text: '1024' },
      ],
      answer: 'a1020',
      explanation: 'Index i is at start + i × slot size: 1000 + 5 × 4 = 1020.',
      chapterId: 'memory-and-indices',
    },
    {
      id: 'access-cost',
      kind: 'complexity',
      prompt: 'How long does it take to read the item at index i of an array of n items?',
      options: [
        { id: 'constant', text: 'O(1)' },
        { id: 'log', text: 'O(log n)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'constant',
      explanation: 'The address is one sum away, wherever i is: random access is O(1).',
      chapterId: 'access',
    },
    {
      id: 'past-the-end',
      kind: 'multiple-choice',
      prompt: 'An array holds 5 items. What does get(5) do?',
      options: [
        { id: 'last', text: 'Returns the last item' },
        { id: 'first', text: 'Returns the first item' },
        { id: 'error', text: 'Fails: index out of bounds' },
        { id: 'grow', text: 'Grows the array' },
      ],
      answer: 'error',
      explanation: 'With 5 items the indices are 0 to 4, so index 5 is out of bounds.',
      chapterId: 'access',
    },
    {
      id: 'search-cost',
      kind: 'complexity',
      prompt: 'How long does it take to find a value in an unsorted array of n items?',
      options: [
        { id: 'constant', text: 'O(1)' },
        { id: 'log', text: 'O(log n)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'linear',
      explanation: 'Linear search checks items one by one; in the worst case, all n of them.',
      chapterId: 'linear-search',
    },
    {
      id: 'insert-moves',
      kind: 'multiple-choice',
      prompt: 'Insert 7 at index 2. Which values move?',
      context: 'index 0 1 2 3 4\nvalue 4 9 1 6 3',
      options: [
        { id: 'later', text: '1, 6 and 3' },
        { id: 'earlier', text: '4 and 9' },
        { id: 'one', text: 'Only 1' },
        { id: 'none', text: 'None' },
      ],
      answer: 'later',
      explanation: 'Every item from index 2 on shifts one slot right to make room: 1, 6 and 3.',
      chapterId: 'insert',
    },
    {
      id: 'remove-last',
      kind: 'true-false',
      prompt: 'Removing the last item of an array shifts every other item left.',
      answer: false,
      explanation: 'Nothing comes after the last item, so nothing moves. Removing it is O(1).',
      chapterId: 'delete',
    },
    {
      id: 'push-when-full',
      kind: 'multiple-choice',
      prompt: 'A dynamic array has capacity 4 and size 4. What happens on push?',
      options: [
        { id: 'grow', text: 'A new array of 8 slots is made, and the 4 items copied in' },
        { id: 'error', text: 'It fails with an overflow' },
        { id: 'replace', text: 'The last item is replaced' },
        { id: 'extend', text: 'One slot is added on the end' },
      ],
      answer: 'grow',
      explanation:
        'A full dynamic array doubles: a new block, every item copied across, then the push.',
      chapterId: 'dynamic-arrays',
    },
    {
      id: 'push-amortised',
      kind: 'complexity',
      prompt: 'On average over many pushes, how long does one push onto a dynamic array take?',
      options: [
        { id: 'constant', text: 'O(1)' },
        { id: 'log', text: 'O(log n)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'constant',
      explanation:
        'A copy costs O(n) but doubling makes it rare, so it averages out: amortised O(1).',
      chapterId: 'dynamic-arrays',
    },
  ],
} satisfies Quiz;
