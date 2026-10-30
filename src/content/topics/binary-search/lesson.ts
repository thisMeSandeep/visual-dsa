import type { LessonRecipe } from '../../schema';

/**
 * The Binary Search lesson (ALGORITHM-CATALOG A1). Every chapter runs the real search on the
 * array renderer: mid points down at the item being checked, low and high mark the range from
 * below, and the half thrown away fades.
 */
// Typed rather than `satisfies`, like the queue lesson, so the recipe literal isn't widened.
export const lesson: LessonRecipe = {
  topicId: 'binary-search',
  segments: [
    { kind: 'chapter', chapterId: 'sorted-input' },
    {
      kind: 'setup',
      structure: 'sorted-array',
      input: { values: ['3', '8', '12', '17', '23', '31', '42', '56'] },
    },
    {
      kind: 'say',
      caption:
        '**Binary search** finds a value in a **sorted** array, throwing away half of what’s left at each step.',
    },
    {
      kind: 'say',
      caption:
        'Sorted means smallest to largest. Pick any item: everything to its left is smaller, everything right is bigger.',
    },
    {
      kind: 'setup',
      structure: 'sorted-array',
      input: { values: ['23', '8', '42', '17', '5', '31', '12', '3'] },
    },
    {
      kind: 'say',
      caption:
        'This array isn’t sorted. Watch what happens when binary search looks for **5** anyway.',
    },
    { kind: 'trace', operation: 'sorted-array.binarySearch', input: { value: '5' } },
    {
      kind: 'say',
      caption:
        '5 was at index 4 all along. Without sorted order, throwing half away can throw the answer away.',
    },

    { kind: 'chapter', chapterId: 'pointers' },
    {
      kind: 'setup',
      structure: 'sorted-array',
      input: { values: ['3', '8', '12', '17', '23', '31', '42', '56'] },
    },
    {
      kind: 'say',
      caption:
        'Two pointers mark the part still worth searching: **low** at its start and **high** at its end.',
    },
    {
      kind: 'say',
      caption:
        'Each step checks the item in the middle, **mid**. One comparison says which half could hold the target.',
    },
    { kind: 'trace', operation: 'sorted-array.binarySearch', input: { value: '42' } },
    {
      kind: 'say',
      caption: 'Found in 3 checks, never looking at the five items it threw away.',
    },

    { kind: 'chapter', chapterId: 'halving' },
    {
      kind: 'setup',
      structure: 'sorted-array',
      input: {
        values: ['2', '5', '8', '12', '16', '23', '38', '45', '56', '67', '72', '91'],
      },
    },
    {
      kind: 'say',
      caption:
        'Each check halves what’s left: 12 items, then 6, then 3, then 1. Find **91**, the last.',
    },
    { kind: 'trace', operation: 'sorted-array.binarySearch', input: { value: '91' } },
    {
      kind: 'say',
      caption: 'Found in 4 checks. A **linear search** would have checked all 12 to get there.',
    },
    {
      kind: 'say',
      caption:
        'Doubling the items adds just one check. A million sorted items take about 20: that’s **O(log n)**.',
    },
    {
      kind: 'say',
      caption:
        'It only keeps low, mid and high, whatever the size, so the extra space is **O(1)**.',
    },

    { kind: 'chapter', chapterId: 'not-found' },
    {
      kind: 'say',
      caption: 'What if the value isn’t there? Look for **50** in the same array.',
    },
    { kind: 'trace', operation: 'sorted-array.binarySearch', input: { value: '50' } },
    {
      kind: 'say',
      caption:
        'The range shrank to nothing, so 50 isn’t here. **low** stopped at index 8: where 50 would go to keep order.',
    },
    {
      kind: 'say',
      caption: 'A miss costs the same few checks as a hit. That’s still **O(log n)**.',
    },

    { kind: 'chapter', chapterId: 'variants' },
    {
      kind: 'setup',
      structure: 'sorted-array',
      input: { values: ['2', '5', '7', '7', '7', '7', '9', '12'] },
    },
    {
      kind: 'say',
      caption: 'With **duplicates**, plain binary search stops at whichever 7 it lands on first.',
    },
    { kind: 'trace', operation: 'sorted-array.binarySearch', input: { value: '7' } },
    {
      kind: 'say',
      caption:
        'To find the **first** 7, don’t stop at a match: remember it and keep searching to its left.',
    },
    { kind: 'trace', operation: 'sorted-array.findFirst', input: { value: '7' } },
    {
      kind: 'say',
      caption: 'For the **last** 7, remember each match and keep searching to its right instead.',
    },
    { kind: 'trace', operation: 'sorted-array.findLast', input: { value: '7' } },
    {
      kind: 'say',
      caption:
        'First at 2, last at 5: so there are 5 − 2 + 1 = 4 sevens, counted in **O(log n)** time.',
    },
    {
      kind: 'say',
      caption:
        'Sorted input, check the middle, keep the half that can hold the target. Try your own searches in the **Sandbox**.',
    },
  ],
};
