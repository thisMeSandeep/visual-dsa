import type { LessonRecipe } from '../../schema';

/** The Two Pointers lesson (ALGORITHM-CATALOG A9): three classics, then when to use it. */
// Typed rather than `satisfies`, like the queue lesson, so the recipe literal isn't widened.
export const lesson: LessonRecipe = {
  topicId: 'two-pointers',
  segments: [
    { kind: 'chapter', chapterId: 'both-ends' },
    {
      kind: 'setup',
      structure: 'two-pointers',
      input: { values: ['1', '2', '3', '4', '5', '6'] },
    },
    {
      kind: 'say',
      caption:
        'The **two pointers** pattern walks an array with two indices at once, so one pass does more.',
    },
    {
      kind: 'say',
      caption: 'Start one at each end and move them inwards. Reversing is the simplest example.',
    },
    { kind: 'trace', operation: 'two-pointers.reverse' },
    {
      kind: 'say',
      caption:
        'Each swap moved both pointers in: n ÷ 2 swaps, **O(n)** time, and no second array, **O(1)** space.',
    },

    { kind: 'chapter', chapterId: 'pair-sum' },
    {
      kind: 'setup',
      structure: 'two-pointers',
      input: { values: ['1', '3', '4', '6', '8', '11'] },
    },
    {
      kind: 'say',
      caption:
        'Which two items add up to **10**? Trying every pair is **O(n²)**. A sorted array gives a shortcut.',
    },
    { kind: 'trace', operation: 'two-pointers.pairSum', input: { value: '10' } },
    {
      kind: 'say',
      caption: 'Each step ruled one item out for good, so it takes at most n − 1 checks: **O(n)**.',
    },
    {
      kind: 'say',
      caption:
        'It works because the array is **sorted**: moving left can only raise the sum, moving right only lowers it.',
    },

    { kind: 'chapter', chapterId: 'remove-duplicates' },
    {
      kind: 'setup',
      structure: 'two-pointers',
      input: { values: ['1', '1', '2', '3', '3', '3', '4', '5', '5'] },
    },
    {
      kind: 'say',
      caption:
        'Pointers can also move at different speeds. **read** checks every item; **write** moves only to keep one.',
    },
    { kind: 'trace', operation: 'two-pointers.removeDuplicates' },
    {
      kind: 'say',
      caption:
        'The unique values are packed at the front in one pass, with no second array: **O(n)** time, **O(1)** space.',
    },

    { kind: 'chapter', chapterId: 'when-it-applies' },
    {
      kind: 'say',
      caption:
        'Reach for two pointers when the data is **in order**, or the work goes from both ends inwards.',
    },
    {
      kind: 'say',
      caption:
        'Classic uses: pair sums, reversing, removing repeats, merging sorted lists, checking palindromes.',
    },
    {
      kind: 'say',
      caption:
        'If the brute-force answer checks every pair, order plus two pointers often cuts O(n²) to **O(n)**.',
    },
    { kind: 'say', caption: 'Try your own arrays and targets in the **Sandbox**.' },
  ],
};
