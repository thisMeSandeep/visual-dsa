import type { LessonRecipe } from '../../schema';

/**
 * The Merge Sort lesson (ALGORITHM-CATALOG A5), drawn as split levels: items move down a row
 * when their range splits and back up, smallest first, when two halves merge.
 */
// Typed rather than `satisfies`, like the queue lesson, so the recipe literal isn't widened.
export const lesson: LessonRecipe = {
  topicId: 'merge-sort',
  segments: [
    { kind: 'chapter', chapterId: 'divide' },
    { kind: 'setup', structure: 'merge-sort', input: { values: ['5', '2'] } },
    {
      kind: 'say',
      caption:
        '**Merge sort** splits the array in half, sorts each half, then **merges** the two sorted halves.',
    },
    {
      kind: 'say',
      caption: 'The faint rows under the array are where halves wait. Watch it sort two items.',
    },
    { kind: 'trace', operation: 'merge-sort.sort' },
    {
      kind: 'say',
      caption: 'Split, then merge: the smaller of the two went back up first.',
    },

    { kind: 'chapter', chapterId: 'recurse' },
    { kind: 'setup', structure: 'merge-sort', input: { values: ['6', '3', '8', '1'] } },
    {
      kind: 'say',
      caption:
        'Each half is split again, until every piece is a **single item**, which is already sorted.',
    },
    { kind: 'trace', operation: 'merge-sort.sort' },
    {
      kind: 'say',
      caption:
        'Single items merged into pairs, pairs into four. The sorting happens on the way back up.',
    },

    { kind: 'chapter', chapterId: 'merge-halves' },
    {
      kind: 'setup',
      structure: 'merge-sort',
      input: { values: ['3', '27', '38', '43', '9', '10', '15', '82'] },
    },
    {
      kind: 'say',
      caption:
        'Merging is the heart of it. These halves are sorted already: 3 27 38 43 and 9 10 15 82.',
    },
    {
      kind: 'trace',
      operation: 'merge-sort.sort',
      input: { depth: 1 },
      captions: {
        '0': 'Merge sort these 8 items, but split just once: the two halves are taken as sorted.',
      },
    },
    {
      kind: 'say',
      caption:
        'Compare the two front items and send the smaller up. Each step places one item: merging is **O(n)**.',
    },

    { kind: 'chapter', chapterId: 'levels' },
    {
      kind: 'setup',
      structure: 'merge-sort',
      input: { values: ['38', '27', '43', '3', '9', '82', '10', '15'] },
    },
    {
      kind: 'say',
      caption: 'Now the whole thing. Count the rows: pieces of 8, then 4, 2 and 1.',
    },
    { kind: 'trace', operation: 'merge-sort.sort' },
    {
      kind: 'say',
      caption:
        'Halving 8 takes 3 levels: **log₂ n**. Each level merges all n items once, O(n) per level.',
    },
    {
      kind: 'say',
      caption:
        'So merge sort is **O(n log n)**, and always: sorted, reversed or mixed, the splits are the same.',
    },

    { kind: 'chapter', chapterId: 'extra-space' },
    {
      kind: 'say',
      caption:
        'Those rows are real memory: a merge copies its halves out, then writes them back in order.',
    },
    {
      kind: 'say',
      caption:
        'That buffer holds up to n items, so merge sort needs **O(n)** extra space, unlike the simple sorts.',
    },
    {
      kind: 'say',
      caption:
        'Quick sort and heap sort sort in place instead. Linked lists can be merged without a buffer.',
    },

    { kind: 'chapter', chapterId: 'stability' },
    { kind: 'setup', structure: 'merge-sort', input: { values: ['5a', '3', '5b', '1'] } },
    {
      kind: 'say',
      caption: 'Two equal 5s, tagged **a** and **b**. Will a still come before b?',
    },
    { kind: 'trace', operation: 'merge-sort.sort' },
    {
      kind: 'say',
      caption:
        'On a tie, the merge takes the **left** one first, so a stays before b: merge sort is **stable**.',
    },
    {
      kind: 'say',
      caption:
        'Stable and always O(n log n): Timsort, in Python and Java, is built on merging. Try the **Sandbox**.',
    },
  ],
};
