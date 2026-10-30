import type { SandboxConfig } from '../../schema';

/**
 * Hash Table Play mode (ALGORITHM-CATALOG H1 "Sandbox" and "Presets"). The collision strategy is
 * the tool; the presets pick the hash function (sum, polynomial, bad), the table size and how
 * near the resize threshold it starts.
 */
const operations: SandboxConfig['operations'] = [
  { id: 'put', label: 'Put', input: 'key-value' },
  { id: 'get', label: 'Get', input: 'key' },
  { id: 'remove', label: 'Remove', input: 'key' },
];

const stats: SandboxConfig['stats'] = [
  { label: 'Keys', key: 'count' },
  { label: 'Buckets', key: 'size' },
  { label: 'Load', key: 'load' },
];

const nearResize = (strategy: 'chaining' | 'probing') => ({
  id: 'near-resize',
  label: 'Near resize',
  input: { entries: { Ann: '42', Ben: '17', Mia: '8' }, size: 4, strategy },
  hint: '3 keys in 4 buckets: load factor 0.75. One more **Put** doubles the table.',
});

export const sandbox = [
  {
    topicId: 'hash-table',
    id: 'chaining',
    label: 'Chaining',
    structure: 'hash-table',
    operations,
    presets: [
      {
        id: 'sum',
        label: 'Sum hash',
        input: { entries: { Sid: '42', Jim: '17', Ann: '8' }, size: 7 },
        hint: 'Sid and Jim both sum to 288, so they share bucket 1. **Put** Kat to grow the chain.',
      },
      {
        id: 'better',
        label: 'Better hash',
        input: { entries: { Sid: '42', Jim: '17', Ann: '8' }, size: 7, hash: 'polynomial' },
        hint: 'The same names with a polynomial hash spread out. **Put** Kat and compare.',
      },
      {
        id: 'bad',
        label: 'Bad hash',
        input: { entries: { Sid: '42', Jim: '17', Ann: '8', Ben: '5' }, size: 7, hash: 'length' },
        hint: 'This hash only counts letters: every 3-letter name lands in bucket 3. **Get** Ben.',
      },
      nearResize('chaining'),
    ],
    stats,
  },
  {
    topicId: 'hash-table',
    id: 'probing',
    label: 'Probing',
    structure: 'hash-table',
    operations,
    presets: [
      {
        id: 'sum',
        label: 'Sum hash',
        input: { entries: { Sid: '42', Jim: '17', Ann: '8' }, size: 7, strategy: 'probing' },
        hint: 'Jim collided with Sid in bucket 1 and probed on to 2. **Put** Kat to probe further.',
      },
      {
        id: 'tombstone',
        label: 'Tombstone',
        input: {
          entries: { Sid: '42', Jim: '17', Kat: '8' },
          size: 7,
          strategy: 'probing',
          removed: ['Jim'],
        },
        hint: 'Jim was removed, leaving a tombstone in bucket 2. **Get** Kat: the search walks past it.',
      },
      {
        id: 'bad',
        label: 'Bad hash',
        input: {
          entries: { Sid: '42', Jim: '17', Ann: '8' },
          size: 7,
          strategy: 'probing',
          hash: 'length',
        },
        hint: 'Every 3-letter name starts at bucket 3, so they pile up in a run. **Put** Ben.',
      },
      nearResize('probing'),
    ],
    stats,
  },
] satisfies SandboxConfig[];
