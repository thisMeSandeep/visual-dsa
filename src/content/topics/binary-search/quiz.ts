import type { Quiz } from '../../schema';

/** Binary Search quiz (ALGORITHM-CATALOG A1). Each question links to its chapter. */
export const quiz = {
  topicId: 'binary-search',
  questions: [
    {
      id: 'needs-sorted',
      kind: 'true-false',
      prompt: 'Binary search works on any array, sorted or not.',
      answer: false,
      explanation:
        'Throwing half away is only safe when order says the target can’t be there. Unsorted, it can miss.',
      chapterId: 'sorted-input',
    },
    {
      id: 'first-mid',
      kind: 'multiple-choice',
      prompt:
        'An array has 8 items, at indices 0 to 7. Which index does binary search check first?',
      context: 'low = 0, high = 7',
      options: [
        { id: 'i3', text: '3' },
        { id: 'i4', text: '4' },
        { id: 'i0', text: '0' },
        { id: 'i7', text: '7' },
      ],
      answer: 'i3',
      explanation: 'mid = (0 + 7) ÷ 2 = 3.5, rounded down to 3.',
      chapterId: 'pointers',
    },
    {
      id: 'go-right',
      kind: 'multiple-choice',
      prompt: 'a[mid] is 17 and the target is 42. What happens next?',
      options: [
        { id: 'low', text: 'low = mid + 1' },
        { id: 'high', text: 'high = mid − 1' },
        { id: 'found', text: 'Return mid' },
        { id: 'missing', text: 'Return −1' },
      ],
      answer: 'low',
      explanation: '17 is less than 42, so 42 can only be to the right of mid: low moves past it.',
      chapterId: 'pointers',
    },
    {
      id: 'mid-values',
      kind: 'multiple-choice',
      prompt: 'Search this array for 42. Which values does mid land on?',
      context: 'index 0 1  2  3  4  5  6\nvalue 4 9 15 23 30 42 51',
      options: [
        { id: 'two', text: '23, then 42' },
        { id: 'thirty', text: '30, then 42' },
        { id: 'all', text: '4, 9, 15, 23, 30, 42' },
        { id: 'end', text: '51, then 42' },
      ],
      answer: 'two',
      explanation:
        'mid = 3 holds 23, less than 42, so low = 4. Then mid = (4 + 6) ÷ 2 = 5, which holds 42.',
      chapterId: 'pointers',
    },
    {
      id: 'time',
      kind: 'complexity',
      prompt: 'How many checks does binary search need on n sorted items, in the worst case?',
      options: [
        { id: 'constant', text: 'O(1)' },
        { id: 'log', text: 'O(log n)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'nlogn', text: 'O(n log n)' },
      ],
      answer: 'log',
      explanation: 'Each check halves the range, so it runs out after about log₂ n checks.',
      chapterId: 'halving',
    },
    {
      id: 'million',
      kind: 'multiple-choice',
      prompt: 'About how many checks does binary search need for 1,000,000 sorted items?',
      options: [
        { id: 'twenty', text: 'About 20' },
        { id: 'thousand', text: 'About 1,000' },
        { id: 'half', text: 'About 500,000' },
        { id: 'all', text: '1,000,000' },
      ],
      answer: 'twenty',
      explanation: 'Halving a million 20 times leaves 1, because 2²⁰ is just over a million.',
      chapterId: 'halving',
    },
    {
      id: 'space',
      kind: 'complexity',
      prompt: 'How much extra space does the loop version of binary search use?',
      options: [
        { id: 'constant', text: 'O(1)' },
        { id: 'log', text: 'O(log n)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'constant',
      explanation: 'It only keeps low, mid and high, however long the array is.',
      chapterId: 'halving',
    },
    {
      id: 'when-missing',
      kind: 'multiple-choice',
      prompt: 'When does binary search decide the target isn’t in the array?',
      options: [
        { id: 'crossed', text: 'When low passes high' },
        { id: 'last', text: 'When mid reaches the last index' },
        { id: 'bigger', text: 'When a[mid] is bigger than the target' },
        { id: 'checks', text: 'After exactly log₂ n checks' },
      ],
      answer: 'crossed',
      explanation: 'low > high means the range is empty: there’s nowhere left the target could be.',
      chapterId: 'not-found',
    },
    {
      id: 'duplicates',
      kind: 'true-false',
      prompt: 'In [2, 7, 7, 7, 9], plain binary search for 7 returns index 1, the first 7.',
      answer: false,
      explanation:
        'Its first check is mid = (0 + 4) ÷ 2 = 2, which is a 7, so it returns 2 and stops there.',
      chapterId: 'variants',
    },
    {
      id: 'find-first',
      kind: 'multiple-choice',
      prompt: 'Looking for the first of several equal values, what does the search do at a match?',
      options: [
        { id: 'left', text: 'Remembers it and keeps searching left' },
        { id: 'stop', text: 'Returns it straight away' },
        { id: 'right', text: 'Remembers it and keeps searching right' },
        { id: 'restart', text: 'Starts again from index 0' },
      ],
      answer: 'left',
      explanation:
        'An earlier copy could still be to the left, so high = mid − 1. The last match it saw is the first.',
      chapterId: 'variants',
    },
  ],
} satisfies Quiz;
