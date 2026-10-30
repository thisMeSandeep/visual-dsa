import type { LessonRecipe } from '../../schema';

/**
 * The Quick Sort lesson (ALGORITHM-CATALOG A6), with Lomuto partitioning. The first three
 * chapters sort one array: one partition, then the rest. Hoare's partition is mentioned as an
 * extension, not animated.
 */
// Typed rather than `satisfies`, like the queue lesson, so the recipe literal isn't widened.
export const lesson: LessonRecipe = {
  topicId: 'quick-sort',
  segments: [
    { kind: 'chapter', chapterId: 'pivot' },
    {
      kind: 'setup',
      structure: 'quick-sort',
      input: { values: ['7', '2', '9', '4', '3', '8', '5'] },
    },
    {
      kind: 'say',
      caption:
        '**Quick sort** picks one item, the **pivot**, and moves it straight to its final place.',
    },
    {
      kind: 'say',
      caption:
        'Smaller items end up to its left, bigger ones to its right. Here the pivot is the last item: 5.',
    },

    { kind: 'chapter', chapterId: 'partition' },
    {
      kind: 'say',
      caption:
        'This is **partitioning**. **j** walks the range; each item ≤ the pivot is swapped down to **i**.',
    },
    { kind: 'trace', operation: 'quick-sort.pass' },
    {
      kind: 'say',
      caption:
        'One walk over the range, **O(n)**, and 5 is in place for good: 2 4 3 on its left, 9 8 7 on its right.',
    },

    { kind: 'chapter', chapterId: 'recurse' },
    {
      kind: 'say',
      caption: 'Now quick sort each side on its own. Items never cross the pivot again.',
    },
    // `from` replays the first partition out of sight, so it starts from the original array.
    {
      kind: 'setup',
      structure: 'quick-sort',
      input: { values: ['7', '2', '9', '4', '3', '8', '5'] },
    },
    { kind: 'trace', operation: 'quick-sort.sort', input: { from: 1 } },
    {
      kind: 'say',
      caption:
        'Each partition placed one more pivot and split what was left in two. A side of one is done already.',
    },

    { kind: 'chapter', chapterId: 'worst-case' },
    {
      kind: 'setup',
      structure: 'quick-sort',
      input: { values: ['1', '2', '3', '4', '5', '6', '7'] },
    },
    {
      kind: 'say',
      caption:
        'On a sorted array the last item is the **worst pivot**: it’s the biggest, so nothing goes right of it.',
    },
    { kind: 'trace', operation: 'quick-sort.sort' },
    {
      kind: 'say',
      caption:
        'Each partition peeled off just one item: 6 + 5 + 4 + 3 + 2 + 1 = 21 comparisons. That’s **O(n²)**.',
    },
    {
      kind: 'say',
      caption:
        'Good pivots split the range near the middle: about log n levels of O(n) work, **O(n log n)**.',
    },

    { kind: 'chapter', chapterId: 'random-pivot' },
    {
      kind: 'say',
      caption:
        'A **random pivot** makes a run of bad splits very unlikely, whatever order the input is in.',
    },
    { kind: 'trace', operation: 'quick-sort.sortRandom' },
    {
      kind: 'say',
      caption:
        'Far fewer comparisons on the same sorted array. On average it’s **O(n log n)**, for any input.',
    },
    {
      kind: 'say',
      caption:
        'It sorts in place, with an **O(log n)** recursion stack on average, but it isn’t **stable**.',
    },
    {
      kind: 'say',
      caption:
        'Often the fastest sort in practice. **Hoare’s** partition, from both ends, swaps less. Try the **Sandbox**.',
    },
  ],
};
