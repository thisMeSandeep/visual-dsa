import type { Quiz } from '../../schema';

/** Sliding Window quiz (ALGORITHM-CATALOG A10). Each question links to its chapter. */
export const quiz = {
  topicId: 'sliding-window',
  questions: [
    {
      id: 'slide-update',
      kind: 'multiple-choice',
      prompt:
        'A window of 3 has sum 9. It slides right: 4 enters and 2 leaves. What’s the new sum?',
      options: [
        { id: 'eleven', text: '11' },
        { id: 'thirteen', text: '13' },
        { id: 'seven', text: '7' },
        { id: 'fifteen', text: '15' },
      ],
      answer: 'eleven',
      explanation:
        'Add what enters, take away what leaves: 9 + 4 − 2 = 11. No need to add all 3 again.',
      chapterId: 'fixed-window',
    },
    {
      id: 'max-sum',
      kind: 'multiple-choice',
      prompt: 'What’s the biggest sum of 2 neighbours?',
      context: '3 1 4 1 5 9 2',
      options: [
        { id: 'fourteen', text: '14' },
        { id: 'eleven', text: '11' },
        { id: 'six', text: '6' },
        { id: 'nine', text: '9' },
      ],
      answer: 'fourteen',
      explanation: 'The windows sum to 4, 5, 5, 6, 14 and 11: the best is 5 + 9 = 14.',
      chapterId: 'fixed-window',
    },
    {
      id: 'fixed-time',
      kind: 'complexity',
      prompt: 'How long does the sliding window take to find the best sum of k in n items?',
      options: [
        { id: 'linear', text: 'O(n)' },
        { id: 'nk', text: 'O(n·k)' },
        { id: 'quadratic', text: 'O(n²)' },
        { id: 'k', text: 'O(k)' },
      ],
      answer: 'linear',
      explanation: 'Each slide costs two reads, however big k is: O(n) in all.',
      chapterId: 'fixed-window',
    },
    {
      id: 'longest-unique',
      kind: 'multiple-choice',
      prompt: 'How long is the longest run with no repeated letter?',
      context: 'a b c a b c b b',
      options: [
        { id: 'three', text: '3' },
        { id: 'four', text: '4' },
        { id: 'two', text: '2' },
        { id: 'eight', text: '8' },
      ],
      answer: 'three',
      explanation: 'a b c is the longest; any run of 4 repeats a letter.',
      chapterId: 'variable-window',
    },
    {
      id: 'shrink-when',
      kind: 'multiple-choice',
      prompt: 'In the no-repeats window, when does left move?',
      options: [
        { id: 'repeat', text: 'When the new item is already in the window' },
        { id: 'every', text: 'On every step' },
        { id: 'end', text: 'Only at the end' },
        { id: 'never', text: 'Never: only right moves' },
      ],
      answer: 'repeat',
      explanation: 'The window shrinks from the left until the repeated value has left it.',
      chapterId: 'expand-shrink',
    },
    {
      id: 'forwards',
      kind: 'true-false',
      prompt: 'In a sliding window, left and right only ever move forwards.',
      answer: true,
      explanation:
        'That’s why it’s O(n): each item enters the window once and leaves at most once.',
      chapterId: 'expand-shrink',
    },
    {
      id: 'deque-front',
      kind: 'multiple-choice',
      prompt: 'In the window-maximum deque, where is the current window’s maximum?',
      options: [
        { id: 'front', text: 'At the front' },
        { id: 'back', text: 'At the back' },
        { id: 'middle', text: 'In the middle' },
        { id: 'anywhere', text: 'Anywhere: it has to be searched for' },
      ],
      answer: 'front',
      explanation:
        'Values go down from front to back, so the front is the biggest still in the window.',
      chapterId: 'window-max',
    },
    {
      id: 'deque-pop',
      kind: 'multiple-choice',
      prompt: 'The deque holds 7 5 3 and 6 arrives. What does it hold after 6 is pushed?',
      options: [
        { id: 'seven-six', text: '7 6' },
        { id: 'all', text: '7 5 3 6' },
        { id: 'six', text: '6' },
        { id: 'sorted', text: '3 5 6 7' },
      ],
      answer: 'seven-six',
      explanation:
        '3 and 5 are smaller than 6 and leave sooner, so they can never be the maximum: popped.',
      chapterId: 'window-max',
    },
    {
      id: 'deque-time',
      kind: 'complexity',
      prompt: 'How long does the monotonic deque take to find every window maximum?',
      options: [
        { id: 'linear', text: 'O(n)' },
        { id: 'nk', text: 'O(n·k)' },
        { id: 'nlogn', text: 'O(n log n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'linear',
      explanation: 'Each item is pushed once and popped at most once, so the total work is O(n).',
      chapterId: 'window-max',
    },
  ],
} satisfies Quiz;
