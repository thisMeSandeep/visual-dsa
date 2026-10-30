import type { LessonRecipe } from '../../schema';

/**
 * The Sliding Window lesson (ALGORITHM-CATALOG A10). left and right point up at the window's
 * ends from below; the fixed window sums numbers, the variable one finds letters with no repeats.
 */
// Typed rather than `satisfies`, like the queue lesson, so the recipe literal isn't widened.
export const lesson: LessonRecipe = {
  topicId: 'sliding-window',
  segments: [
    { kind: 'chapter', chapterId: 'fixed-window' },
    {
      kind: 'setup',
      structure: 'sliding-window',
      input: { values: ['2', '1', '5', '1', '3', '2', '8', '1'], k: 3 },
    },
    {
      kind: 'say',
      caption: 'A **sliding window** is a run of neighbouring items that moves along the array.',
    },
    {
      kind: 'say',
      caption:
        'Which 3 neighbours have the biggest sum? Adding up every window from scratch is **O(n·k)**.',
    },
    { kind: 'trace', operation: 'sliding-window.maxSum' },
    {
      kind: 'say',
      caption:
        'Each slide added one item and took one away: two reads, whatever k is. That’s **O(n)**.',
    },

    { kind: 'chapter', chapterId: 'variable-window' },
    {
      kind: 'setup',
      structure: 'sliding-window',
      input: { values: ['a', 'b', 'c', 'a', 'b', 'c', 'b', 'b'] },
    },
    {
      kind: 'say',
      caption: 'A window can change size too. Find the longest run of letters with **no repeats**.',
    },
    { kind: 'trace', operation: 'sliding-window.longestUnique' },
    {
      kind: 'say',
      caption:
        'The window **grew** on the right until a letter repeated, then **shrank** from the left past it.',
    },

    { kind: 'chapter', chapterId: 'expand-shrink' },
    {
      kind: 'setup',
      structure: 'sliding-window',
      input: { values: ['p', 'w', 'w', 'k', 'e', 'w'] },
    },
    {
      kind: 'say',
      caption: 'When the repeat is further in, the window shrinks by several items at once.',
    },
    { kind: 'trace', operation: 'sliding-window.longestUnique' },
    {
      kind: 'say',
      caption:
        '**left** and **right** only ever move forwards. Each item enters once and leaves once: **O(n)**.',
    },
    {
      kind: 'say',
      caption:
        'A set of what’s inside makes each repeat check O(1). Checking every run instead would be O(n²).',
    },

    { kind: 'chapter', chapterId: 'window-max' },
    {
      kind: 'setup',
      structure: 'sliding-window',
      input: { values: ['1', '3', '2', '5', '4', '2', '6', '1'], k: 3 },
    },
    {
      kind: 'say',
      caption:
        'What’s the biggest item in each window of 3? Rescanning every window again costs **O(n·k)**.',
    },
    {
      kind: 'say',
      caption:
        'A **deque** keeps the candidates. A smaller item behind a newer, bigger one can never win, so it goes.',
    },
    { kind: 'trace', operation: 'sliding-window.windowMax' },
    {
      kind: 'say',
      caption:
        'The deque’s values only go down from front to back, so its front is always the window’s maximum.',
    },
    {
      kind: 'say',
      caption:
        'That’s a **monotonic deque**: O(n) for every window. Try your own numbers in the **Sandbox**.',
    },
  ],
};
