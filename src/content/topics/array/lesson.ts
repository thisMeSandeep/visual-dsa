import type { LessonRecipe } from '../../schema';

/**
 * The Array lesson (ALGORITHM-CATALOG L1). Every chapter runs the real dynamic array: memory
 * addresses in the first two chapters, then search, shifting and growing. The 2D arrays chapter
 * (P1) comes later.
 */
// Typed rather than `satisfies`, like the queue lesson, so the recipe literal isn't widened.
export const lesson: LessonRecipe = {
  topicId: 'array',
  segments: [
    { kind: 'chapter', chapterId: 'memory-and-indices' },
    {
      kind: 'setup',
      structure: 'array',
      input: { values: ['23', '8', '42', '17', '5'], addresses: { base: 1000, stride: 4 } },
    },
    {
      kind: 'say',
      caption:
        'An **array** keeps its items side by side in one block of memory, like seats in a row.',
    },
    {
      kind: 'say',
      caption: 'Each slot has an **index**, counting from **0**. The first item is at index 0.',
    },
    {
      kind: 'say',
      caption:
        'Under each index is the slot’s memory **address**. Each slot takes 4 bytes, so they go up by 4.',
    },

    { kind: 'chapter', chapterId: 'access' },
    {
      kind: 'say',
      caption: 'To find index i, the computer works out 1000 + 4 × i. No searching: it’s one sum.',
    },
    { kind: 'trace', operation: 'array.get', input: { index: 3 } },
    { kind: 'trace', operation: 'array.set', input: { index: 1, value: '99' } },
    {
      kind: 'say',
      caption:
        'Reading or writing any index takes **O(1)**, however long the array is. That’s **random access**.',
    },
    { kind: 'trace', operation: 'array.get', input: { index: 7 } },

    { kind: 'chapter', chapterId: 'traversal' },
    { kind: 'setup', structure: 'array', input: { values: ['4', '9', '2', '7'] } },
    {
      kind: 'say',
      caption: '**Traversal** means visiting every item once, from index 0 to the end.',
    },
    { kind: 'trace', operation: 'array.traverse' },

    { kind: 'chapter', chapterId: 'linear-search' },
    {
      kind: 'setup',
      structure: 'array',
      input: { values: ['23', '8', '42', '17', '5'], capacity: 5 },
    },
    {
      kind: 'say',
      caption:
        'Where is 42? Index access needs the index. To find a **value**, check the items one by one.',
    },
    { kind: 'trace', operation: 'array.search', input: { value: '42' } },
    { kind: 'trace', operation: 'array.search', input: { value: '50' } },
    {
      kind: 'say',
      caption:
        'That’s **linear search**: **O(n)**. A sorted array can do much better, with binary search.',
    },

    { kind: 'chapter', chapterId: 'insert' },
    {
      kind: 'setup',
      structure: 'array',
      input: { values: ['3', '8', '12', '20'], capacity: 6 },
    },
    { kind: 'trace', operation: 'array.push', input: { value: '25' } },
    {
      kind: 'say',
      caption: 'Adding at the end is easy. But the items must stay side by side, with no gaps…',
    },
    { kind: 'trace', operation: 'array.insert', input: { index: 1, value: '5' } },
    {
      kind: 'say',
      caption:
        'So inserting at index 1 moved every later item one slot right. Near the front, that’s almost all of them.',
    },

    { kind: 'chapter', chapterId: 'delete' },
    {
      kind: 'say',
      caption: 'Deleting works the other way: the items after the gap shift left to close it.',
    },
    { kind: 'trace', operation: 'array.removeAt', input: { index: 1 } },
    { kind: 'trace', operation: 'array.removeAt', input: { index: 4 } },
    {
      kind: 'say',
      caption:
        'Deleting from the end moves nothing. From the front, it moves everything: **O(n)**.',
    },

    { kind: 'chapter', chapterId: 'dynamic-arrays' },
    {
      kind: 'setup',
      structure: 'array',
      input: { values: ['1', '2', '3', '4'], capacity: 4 },
    },
    {
      kind: 'say',
      caption:
        'All 4 slots are full. A fixed-size array would refuse another item. A **dynamic array** grows.',
    },
    { kind: 'trace', operation: 'array.push', input: { value: '5' } },
    { kind: 'trace', operation: 'array.push', input: { value: '6' } },
    {
      kind: 'say',
      caption:
        'That push was quick: there was room. Doubling means copies get rarer as the array grows.',
    },
    {
      kind: 'say',
      caption:
        'Spread over every push, the copying costs **O(1)** each on average: **amortised O(1)**.',
    },
  ],
};
