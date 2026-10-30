import type { Quiz } from '../../schema';

/** Hash Table quiz (ALGORITHM-CATALOG H1 "Practice ideas"). Each links to its chapter. */
export const quiz = {
  topicId: 'hash-table',
  questions: [
    {
      id: 'which-bucket',
      kind: 'multiple-choice',
      prompt: 'h("Kat") = 17 and the table has 6 buckets. Which bucket does Kat go in?',
      options: [
        { id: 'zero', text: '0' },
        { id: 'two', text: '2' },
        { id: 'five', text: '5' },
        { id: 'seventeen', text: '17' },
      ],
      answer: 'five',
      explanation: '17 mod 6 = 5: the remainder after dividing by the number of buckets.',
      chapterId: 'hash-function',
    },
    {
      id: 'same-bucket',
      kind: 'true-false',
      prompt: 'While the table keeps its size, the same key always hashes to the same bucket.',
      answer: true,
      explanation: 'A hash function is deterministic. That’s how get finds what put stored.',
      chapterId: 'hash-function',
    },
    {
      id: 'collision',
      kind: 'multiple-choice',
      prompt: 'What is a collision?',
      options: [
        { id: 'same-bucket', text: 'Two different keys hash to the same bucket' },
        { id: 'same-key', text: 'The same key is put twice' },
        { id: 'full', text: 'The table runs out of buckets' },
        { id: 'error', text: 'The hash function fails' },
      ],
      answer: 'same-bucket',
      explanation: 'There are far more possible keys than buckets, so some keys must share one.',
      chapterId: 'collision',
    },
    {
      id: 'chaining',
      kind: 'multiple-choice',
      prompt: 'With separate chaining, where does a key go when its bucket already holds one?',
      options: [
        { id: 'chain', text: 'Into that bucket’s chain' },
        { id: 'next', text: 'The next bucket along' },
        { id: 'replace', text: 'It replaces the key there' },
        { id: 'resize', text: 'Nowhere until the table resizes' },
      ],
      answer: 'chain',
      explanation: 'Each bucket holds a chain, so colliding keys simply line up in it.',
      chapterId: 'chaining',
    },
    {
      id: 'search-average',
      kind: 'complexity',
      prompt: 'With a good hash and a sensible load factor, how long does get take on average?',
      options: [
        { id: 'constant', text: 'O(1)' },
        { id: 'log', text: 'O(log n)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'constant',
      explanation: 'It hashes straight to one bucket, whose chain is short on average.',
      chapterId: 'search',
    },
    {
      id: 'search-worst',
      kind: 'complexity',
      prompt: 'Every key hashes to the same bucket. How long does get take?',
      options: [
        { id: 'constant', text: 'O(1)' },
        { id: 'log', text: 'O(log n)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'linear',
      explanation: 'All n keys sit in one chain, and get may have to check every one of them.',
      chapterId: 'search',
    },
    {
      id: 'at-the-limit',
      kind: 'multiple-choice',
      prompt: 'The load factor is 0.75 and the limit is 0.75. What happens when you put a new key?',
      options: [
        { id: 'grow', text: 'The table grows and every key is rehashed, then the key goes in' },
        { id: 'insert', text: 'The key goes in as usual' },
        { id: 'refuse', text: 'The put is refused' },
        { id: 'evict', text: 'The oldest key is removed to make room' },
      ],
      answer: 'grow',
      explanation: 'One more key would push the load factor over 0.75, so the table doubles first.',
      chapterId: 'load-factor',
    },
    {
      id: 'rehash',
      kind: 'true-false',
      prompt: 'When a table doubles, every key keeps its bucket number.',
      answer: false,
      explanation:
        'A bucket is the hash mod the size. Change the size and keys move: each is rehashed.',
      chapterId: 'load-factor',
    },
    {
      id: 'probe-landing',
      kind: 'multiple-choice',
      prompt:
        'Linear probing: Leo’s home bucket is 3, and buckets 3 and 4 are full. Where does he go?',
      options: [
        { id: 'two', text: 'Bucket 2' },
        { id: 'three', text: 'Bucket 3, in a chain' },
        { id: 'five', text: 'Bucket 5' },
        { id: 'zero', text: 'Bucket 0' },
      ],
      answer: 'five',
      explanation: 'Probing tries 3, then 4, then 5: the first free bucket after his home.',
      chapterId: 'open-addressing',
    },
    {
      id: 'tombstone',
      kind: 'multiple-choice',
      prompt: 'Why does open addressing leave a tombstone instead of emptying the bucket?',
      options: [
        { id: 'keep-probing', text: 'So searches keep probing past it' },
        { id: 'undo', text: 'So the key can be restored' },
        { id: 'faster', text: 'Emptying a bucket is slow' },
        { id: 'count', text: 'To keep the load factor the same' },
      ],
      answer: 'keep-probing',
      explanation:
        'An empty bucket ends a search, so keys that probed past this one would be lost.',
      chapterId: 'tombstones',
    },
  ],
} satisfies Quiz;
