import type { LessonRecipe } from '../../schema';

/**
 * The Insertion Sort lesson (ALGORITHM-CATALOG A4). The first three chapters sort one array a
 * key at a time: the key lifts out above the row, bigger items shift right under it, and it
 * drops into the gap.
 */
// Typed rather than `satisfies`, like the queue lesson, so the recipe literal isn't widened.
export const lesson: LessonRecipe = {
  topicId: 'insertion-sort',
  segments: [
    { kind: 'chapter', chapterId: 'playing-cards' },
    {
      kind: 'setup',
      structure: 'insertion-sort',
      input: { values: ['7', '3', '5', '2', '9', '4'] },
    },
    {
      kind: 'say',
      caption:
        'Think of sorting a hand of cards: pick up the next card and slide it into place among those you hold.',
    },
    {
      kind: 'say',
      caption:
        '**Insertion sort** does the same. The left part is sorted so far; on its own, the first item already is.',
    },
    { kind: 'trace', operation: 'insertion-sort.pass' },
    {
      kind: 'say',
      caption: 'The sorted part is now 3 and 7. Each round grows it by one item, the **key**.',
    },

    { kind: 'chapter', chapterId: 'shift-right' },
    {
      kind: 'say',
      caption:
        'Next key: 5. Items in the sorted part that are **bigger** than it shift one place right.',
    },
    { kind: 'trace', operation: 'insertion-sort.pass', input: { from: 1 } },
    {
      kind: 'say',
      caption:
        'Each shift opens the gap one place further left. The key waits above until the gap is in the right place.',
    },

    { kind: 'chapter', chapterId: 'insert-key' },
    {
      kind: 'say',
      caption: 'Key 2 is smaller than everything so far. Watch it go all the way to the front.',
    },
    { kind: 'trace', operation: 'insertion-sort.pass', input: { from: 2 } },
    {
      kind: 'say',
      caption:
        'It stops at the first item that isn’t bigger, or at the front. A shift is one write, not a swap.',
    },
    { kind: 'trace', operation: 'insertion-sort.sort', input: { from: 3 } },
    {
      kind: 'say',
      caption:
        '9 stayed put: nothing before it was bigger. 4 shifted three items. Insertion sort is **stable** too.',
    },

    { kind: 'chapter', chapterId: 'nearly-sorted' },
    {
      kind: 'setup',
      structure: 'insertion-sort',
      input: { values: ['1', '2', '4', '3', '5', '6', '8', '7'] },
    },
    {
      kind: 'say',
      caption:
        'On **nearly sorted** input most keys are already in place: one comparison, and they stay.',
    },
    { kind: 'trace', operation: 'insertion-sort.sort' },
    {
      kind: 'say',
      caption:
        '9 comparisons and 2 shifts for 8 items. On sorted input it’s n − 1 comparisons: **O(n)**.',
    },
    {
      kind: 'say',
      caption:
        'Reversed input is the worst: every key shifts to the front, n(n − 1) ÷ 2 shifts, **O(n²)**.',
    },

    { kind: 'chapter', chapterId: 'hybrid-sorts' },
    {
      kind: 'say',
      caption:
        'On small arrays its tight loop beats cleverer sorts, which have more overhead per item.',
    },
    {
      kind: 'say',
      caption:
        'So fast sorts like **Timsort** (Python) and **introsort** (C++) hand short runs to insertion sort.',
    },
    {
      kind: 'say',
      caption:
        'It’s stable, sorts in place with **O(1)** extra space, and can sort items as they arrive.',
    },
    {
      kind: 'say',
      caption: 'Try reversed, sorted and nearly sorted numbers in the **Sandbox**.',
    },
  ],
};
