import type { LessonRecipe } from '../../schema';

/**
 * The Bubble Sort lesson (ALGORITHM-CATALOG A2). Chapters 2 and 3 share one array: one pass
 * first, then the passes after it.
 */
// Typed rather than `satisfies`, like the queue lesson, so the recipe literal isn't widened.
export const lesson: LessonRecipe = {
  topicId: 'bubble-sort',
  segments: [
    { kind: 'chapter', chapterId: 'compare-and-swap' },
    { kind: 'setup', structure: 'bubble-sort', input: { values: ['8', '3'] } },
    {
      kind: 'say',
      caption:
        '**Bubble sort** puts an array in order by looking at just two neighbours at a time.',
    },
    {
      kind: 'say',
      caption:
        'If the left one is bigger, the pair is in the wrong order, so they **swap** places.',
    },
    { kind: 'trace', operation: 'bubble-sort.sort' },
    {
      kind: 'say',
      caption:
        'For a longer array, do that for every pair from left to right: that’s one **pass**.',
    },

    { kind: 'chapter', chapterId: 'one-pass' },
    { kind: 'setup', structure: 'bubble-sort', input: { values: ['5', '2', '6', '3', '8', '1'] } },
    {
      kind: 'say',
      caption: 'Watch one pass. **j** marks the left item of the pair being compared.',
    },
    { kind: 'trace', operation: 'bubble-sort.pass' },
    {
      kind: 'say',
      caption:
        'Each swap carried the bigger value one step right, until 8 took over. The biggest always reaches the end.',
    },
    {
      kind: 'say',
      caption: 'Like a bubble rising to the top: that’s where the name comes from.',
    },

    { kind: 'chapter', chapterId: 'sorted-tail' },
    {
      kind: 'say',
      caption:
        '8 is in its final place. That end part, the **sorted tail**, never needs checking again.',
    },
    { kind: 'trace', operation: 'bubble-sort.sort', input: { from: 1 } },
    {
      kind: 'say',
      caption:
        'Each pass fixed one more value, and checked one pair fewer. 6 items took 5 passes: n − 1.',
    },
    {
      kind: 'say',
      caption:
        '1 started at the end and could only move one place left per pass. That’s why it took them all.',
    },

    { kind: 'chapter', chapterId: 'early-exit' },
    {
      kind: 'setup',
      structure: 'bubble-sort',
      input: { values: ['1', '2', '4', '3', '5', '6'] },
    },
    {
      kind: 'say',
      caption:
        'If a whole pass makes **no swaps**, every pair is in order, so the array is sorted. Stop there.',
    },
    { kind: 'trace', operation: 'bubble-sort.sort' },
    {
      kind: 'say',
      caption:
        'Nearly sorted, so it stopped after 2 passes instead of 5. A **swapped** flag notices the quiet pass.',
    },
    {
      kind: 'say',
      caption:
        'On sorted input, one pass of n − 1 comparisons is enough: the **best case** is **O(n)**.',
    },

    { kind: 'chapter', chapterId: 'complexity' },
    {
      kind: 'setup',
      structure: 'bubble-sort',
      input: { values: ['6', '5', '4', '3', '2', '1'] },
    },
    {
      kind: 'say',
      caption: 'The worst case is reversed input: every single comparison ends in a swap.',
    },
    { kind: 'trace', operation: 'bubble-sort.sort' },
    {
      kind: 'say',
      caption:
        'Passes of 5, 4, 3, 2 and 1 comparisons: 15 in all. For n items it’s n(n − 1) ÷ 2, about n²/2.',
    },
    {
      kind: 'say',
      caption:
        'So bubble sort is **O(n²)**: double the items and the work goes up about four times.',
    },
    {
      kind: 'say',
      caption:
        'It sorts in place, **O(1)** extra space, and equal neighbours never swap, so it’s **stable**.',
    },
    {
      kind: 'say',
      caption: 'Simple, but slow on big arrays. Try your own numbers in the **Sandbox**.',
    },
  ],
};
