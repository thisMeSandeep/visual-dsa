import type { Reference } from '../../schema';

/** Hash Table cheat sheet (F-801 – F-803). */
export const reference = {
  topicId: 'hash-table',
  tabs: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          kind: 'text',
          text: 'A hash table stores **key–value pairs** in an array of **buckets**. A hash function turns each key into its bucket, so you go straight there.',
        },
        { kind: 'heading', text: 'Use it for' },
        {
          kind: 'bullets',
          items: [
            'Looking things up by name or id: dictionaries, maps and sets.',
            'Counting how often things appear.',
            'Caches, and spotting duplicates.',
          ],
        },
      ],
    },
    {
      id: 'hashing',
      title: 'Hashing',
      blocks: [
        {
          kind: 'bullets',
          items: [
            'bucket = **h(key) mod size**: the remainder keeps it between 0 and size − 1.',
            'The same key must always give the same hash.',
            'A good hash spreads keys evenly. Adding up letter codes is weak: anagrams collide.',
            'Mixing the letters as you go (h = h × 31 + code) spreads them much better.',
          ],
        },
      ],
    },
    {
      id: 'collisions',
      title: 'Collisions',
      blocks: [
        {
          kind: 'text',
          text: 'Two keys in one bucket is a **collision**. There are two common fixes.',
        },
        {
          kind: 'table',
          columns: ['Feature', 'Chaining', 'Linear probing'],
          rows: [
            ['A bucket holds', 'A chain of keys', 'One key'],
            ['On a collision', 'Join the chain', 'Try the next bucket'],
            ['Delete', 'Unlink from the chain', 'Leave a tombstone'],
            ['Can be full', 'Never', 'Yes'],
          ],
        },
        {
          kind: 'text',
          text: 'A **tombstone** marks a removed key, so searches keep probing past it instead of stopping there.',
        },
      ],
    },
    {
      id: 'complexity',
      title: 'Complexity',
      blocks: [
        {
          kind: 'table',
          columns: ['Operation', 'Average', 'Worst'],
          rows: [
            ['Put', 'O(1)', 'O(n)'],
            ['Get', 'O(1)', 'O(n)'],
            ['Remove', 'O(1)', 'O(n)'],
            ['Resize', 'O(n)', 'O(n)'],
          ],
        },
        {
          kind: 'text',
          text: 'The worst case is every key in one bucket. The **load factor** (keys ÷ buckets) is kept under a limit, often 0.75, by doubling the table and rehashing every key. Space: **O(n + m)** for m buckets.',
        },
      ],
    },
    {
      id: 'pitfalls',
      title: 'Pitfalls',
      blocks: [
        {
          kind: 'bullets',
          items: [
            'A weak hash function piles keys into a few buckets, and lookups slow to O(n).',
            'Emptying a bucket under open addressing breaks searches. Leave a tombstone.',
            'After a resize every key moves: its bucket depends on the size.',
            'Keys have no order. To walk them sorted, use a tree or sort them first.',
          ],
        },
      ],
    },
  ],
} satisfies Reference;
