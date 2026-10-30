import type { LessonRecipe } from '../../schema';

/**
 * The Selection Sort lesson (ALGORITHM-CATALOG A3). The first three chapters sort one array,
 * a round at a time; the last uses tagged equal values (5a, 5b) to show it isn't stable.
 */
// Typed rather than `satisfies`, like the queue lesson, so the recipe literal isn't widened.
export const lesson: LessonRecipe = {
  topicId: 'selection-sort',
  segments: [
    { kind: 'chapter', chapterId: 'find-minimum' },
    {
      kind: 'setup',
      structure: 'selection-sort',
      input: { values: ['29', '10', '14', '37', '13'] },
    },
    {
      kind: 'say',
      caption:
        '**Selection sort** builds the sorted array from the front: smallest first, then the next smallest…',
    },
    {
      kind: 'say',
      caption:
        'To fill index **i**, **min** remembers the smallest seen so far while **j** checks each item after it.',
    },
    { kind: 'trace', operation: 'selection-sort.pass' },

    { kind: 'chapter', chapterId: 'swap-into-place' },
    {
      kind: 'say',
      caption: 'One swap put 10, the smallest, at index 0: its final place. It never moves again.',
    },
    {
      kind: 'say',
      caption: 'Now the same again for the rest, from index 1. Which is the smallest there?',
    },
    { kind: 'trace', operation: 'selection-sort.pass', input: { from: 1 } },
    {
      kind: 'say',
      caption:
        'That swap was a long jump: 29 went from index 1 to index 4, straight past the items between.',
    },

    { kind: 'chapter', chapterId: 'sorted-prefix' },
    {
      kind: 'say',
      caption: 'The **sorted prefix** at the front grows by one item each round. Finish the job.',
    },
    { kind: 'trace', operation: 'selection-sort.sort', input: { from: 2 } },
    {
      kind: 'say',
      caption:
        'Round 1 compared 4 items, then 3, 2 and 1: n(n − 1) ÷ 2 comparisons in all, so **O(n²)**.',
    },
    {
      kind: 'say',
      caption:
        'It makes every one of those comparisons even when the array is already sorted. No early exit.',
    },
    {
      kind: 'say',
      caption:
        'But it swaps at most n − 1 times, **O(n)**: useful when moving items costs far more than comparing.',
    },

    { kind: 'chapter', chapterId: 'not-stable' },
    {
      kind: 'setup',
      structure: 'selection-sort',
      input: { values: ['5a', '3', '5b', '1'] },
    },
    {
      kind: 'say',
      caption:
        'Two equal 5s, tagged **a** and **b**. A **stable** sort keeps equal values in their first order: a, then b.',
    },
    { kind: 'trace', operation: 'selection-sort.sort' },
    {
      kind: 'say',
      caption:
        'The first swap threw 5a over 5b to the end. Now b comes before a: selection sort is **not stable**.',
    },
    {
      kind: 'say',
      caption:
        'That matters when sorting by one thing after another, like people by name, then by age.',
    },
    {
      kind: 'say',
      caption:
        'It sorts in place with **O(1)** extra space. Try your own numbers in the **Sandbox**.',
    },
  ],
};
