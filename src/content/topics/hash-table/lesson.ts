import type { LessonRecipe } from '../../schema';

/**
 * The Hash Table lesson (ALGORITHM-CATALOG H1): a phone book of names and numbers. With the
 * letter-sum hash, Sid, Jim and Kat all hash to 288, so the collisions are real. The early
 * chapters use a load limit of 1 so the table only resizes in the chapter about resizing.
 */
// Typed rather than `satisfies`, like the other lessons, so the recipe literal isn't widened.
export const lesson: LessonRecipe = {
  topicId: 'hash-table',
  segments: [
    { kind: 'chapter', chapterId: 'introduction' },
    {
      kind: 'setup',
      structure: 'hash-table',
      input: {
        entries: { Ann: '555-0142', Ben: '555-0187', Sid: '555-0199' },
        loadLimit: 1,
      },
    },
    {
      kind: 'say',
      caption:
        'A **hash table** stores **key–value pairs**: here, names and phone numbers, like a phone book.',
    },
    {
      kind: 'say',
      caption:
        'It has a column of **buckets**. Each name lives in one bucket, so you can go straight to it.',
    },
    {
      kind: 'say',
      caption: 'Which bucket? The key itself decides, through a **hash function**.',
    },

    { kind: 'chapter', chapterId: 'hash-function' },
    { kind: 'setup', structure: 'hash-table', input: { loadLimit: 1 } },
    {
      kind: 'say',
      caption:
        'A **hash function** turns a key into a number. This simple one adds up the codes of its letters.',
    },
    { kind: 'trace', operation: 'hash-table.hash', input: { key: 'Sid' } },
    {
      kind: 'say',
      caption:
        'There are only 5 buckets, and the remainder after dividing by 5 (**mod 5**) is always 0 to 4.',
    },
    {
      kind: 'say',
      caption: 'The same key always gives the same bucket. That’s what lets you find it again.',
    },

    { kind: 'chapter', chapterId: 'inserting-keys' },
    { kind: 'trace', operation: 'hash-table.put', input: { key: 'Sid', value: '555-0199' } },
    { kind: 'trace', operation: 'hash-table.put', input: { key: 'Ann', value: '555-0142' } },
    { kind: 'trace', operation: 'hash-table.put', input: { key: 'Ben', value: '555-0187' } },
    {
      kind: 'say',
      caption:
        'Each put is the same: hash the key, go to its bucket, store it there. No searching: **O(1)**.',
    },

    { kind: 'chapter', chapterId: 'collision' },
    {
      kind: 'say',
      caption: 'Now Jim. J, i and m happen to add up to 288, just like S, i and d…',
    },
    { kind: 'trace', operation: 'hash-table.put', input: { key: 'Jim', value: '555-0110' } },
    {
      kind: 'say',
      caption:
        'Two keys, one bucket: a **collision**. With far more possible keys than buckets, collisions are unavoidable.',
    },

    { kind: 'chapter', chapterId: 'chaining' },
    {
      kind: 'say',
      caption:
        'This table uses **separate chaining**: each bucket holds a chain of every key that lands there.',
    },
    { kind: 'trace', operation: 'hash-table.put', input: { key: 'Kat', value: '555-0101' } },
    {
      kind: 'say',
      caption:
        'A good hash spreads keys out so chains stay short. This one is weak: Sid, Jim and Kat all make 288.',
    },

    { kind: 'chapter', chapterId: 'search' },
    { kind: 'trace', operation: 'hash-table.get', input: { key: 'Kat' } },
    { kind: 'trace', operation: 'hash-table.get', input: { key: 'Zoe' } },
    {
      kind: 'say',
      caption:
        'Search hashes straight to one bucket and checks only its chain: **O(1)** on average, **O(n)** if every key collides.',
    },

    { kind: 'chapter', chapterId: 'delete' },
    { kind: 'trace', operation: 'hash-table.remove', input: { key: 'Jim' } },
    {
      kind: 'say',
      caption: 'Delete finds the key the same way, then unlinks it from its chain.',
    },

    { kind: 'chapter', chapterId: 'load-factor' },
    {
      kind: 'setup',
      structure: 'hash-table',
      input: { entries: { Ann: '555-0142', Ben: '555-0187', Mia: '555-0175' }, size: 4 },
    },
    {
      kind: 'say',
      caption:
        'The **load factor** is keys ÷ buckets: here 3 ÷ 4 = 0.75. The fuller the table, the longer its chains.',
    },
    {
      kind: 'say',
      caption:
        'So a table sets a limit, often 0.75. A put that would go over it makes the table bigger first.',
    },
    { kind: 'trace', operation: 'hash-table.put', input: { key: 'Sid', value: '555-0199' } },
    {
      kind: 'say',
      caption:
        'Every key was **rehashed**, because its bucket depends on the table’s size. Doubling keeps that rare.',
    },

    { kind: 'chapter', chapterId: 'open-addressing' },
    {
      kind: 'setup',
      structure: 'hash-table',
      input: { strategy: 'probing', size: 7 },
    },
    {
      kind: 'say',
      caption:
        '**Open addressing** keeps every key in the buckets themselves, one per bucket. No chains.',
    },
    { kind: 'trace', operation: 'hash-table.put', input: { key: 'Sid', value: '555-0199' } },
    { kind: 'trace', operation: 'hash-table.put', input: { key: 'Jim', value: '555-0110' } },
    { kind: 'trace', operation: 'hash-table.put', input: { key: 'Kat', value: '555-0101' } },
    {
      kind: 'say',
      caption:
        'On a collision, **linear probing** tries the next bucket, then the next, until one is free.',
    },
    { kind: 'trace', operation: 'hash-table.get', input: { key: 'Kat' } },
    {
      kind: 'say',
      caption: 'Search follows the same path, and stops at the first empty bucket.',
    },

    { kind: 'chapter', chapterId: 'tombstones' },
    {
      kind: 'say',
      caption:
        'Now delete Jim. If bucket 2 were simply emptied, a search for Kat would stop there and miss it.',
    },
    { kind: 'trace', operation: 'hash-table.remove', input: { key: 'Jim' } },
    { kind: 'trace', operation: 'hash-table.get', input: { key: 'Kat' } },
    { kind: 'trace', operation: 'hash-table.put', input: { key: 'Leo', value: '555-0123' } },
    {
      kind: 'say',
      caption:
        'Searches skip tombstones and inserts reuse them. A resize clears them away for good.',
    },
  ],
};
