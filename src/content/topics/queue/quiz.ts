import type { Quiz } from '../../schema';

/** Queue quiz (ALGORITHM-CATALOG L6 "Practice ideas"). Each question links to its chapter. */
export const quiz = {
  topicId: 'queue',
  questions: [
    {
      id: 'dequeue-returns',
      kind: 'multiple-choice',
      prompt: '7, 4 and 2 were enqueued in that order. What does dequeue() return?',
      context: 'front → rear: 7 4 2',
      options: [
        { id: 'seven', text: '7' },
        { id: 'four', text: '4' },
        { id: 'two', text: '2' },
        { id: 'error', text: 'Error' },
      ],
      answer: 'seven',
      explanation: 'A queue is first in, first out: 7 joined first, so it leaves first.',
      chapterId: 'fifo',
    },
    {
      id: 'front-removes',
      kind: 'true-false',
      prompt: 'front() removes the item at the front of the queue.',
      answer: false,
      explanation: 'Front only looks: it returns the front item and leaves the queue as it was.',
      chapterId: 'operations',
    },
    {
      id: 'dequeue-cost',
      kind: 'complexity',
      prompt: 'How long does dequeue take on a circular-buffer queue of n items?',
      options: [
        { id: 'constant', text: 'O(1)' },
        { id: 'log', text: 'O(log n)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'constant',
      explanation: 'Dequeue clears one slot and moves the head along. Nothing else moves: O(1).',
      chapterId: 'operations',
    },
    {
      id: 'like-a-queue',
      kind: 'multiple-choice',
      prompt: 'Which of these works like a queue?',
      options: [
        { id: 'printer', text: 'Jobs waiting for a printer' },
        { id: 'back-button', text: 'A browser’s back button' },
        { id: 'plates', text: 'A pile of plates' },
        { id: 'undo', text: 'Undo in a text editor' },
      ],
      answer: 'printer',
      explanation: 'The printer handles jobs in the order they were sent: first in, first out.',
      chapterId: 'printer',
    },
    {
      id: 'count-wrapped',
      kind: 'multiple-choice',
      prompt: 'head = 4, tail = 1, capacity = 6. How many items are in the queue?',
      context: 'tail is the next free slot',
      options: [
        { id: 'two', text: '2' },
        { id: 'three', text: '3' },
        { id: 'four', text: '4' },
        { id: 'five', text: '5' },
      ],
      answer: 'three',
      explanation: 'The items fill slots 4, 5 and 0, wrapping round: (1 − 4 + 6) mod 6 = 3.',
      chapterId: 'circular-buffer',
    },
    {
      id: 'next-slot',
      kind: 'multiple-choice',
      prompt:
        'A circular buffer has 5 slots, head = 3 and size = 2. Which slot does the next enqueue use?',
      options: [
        { id: 'zero', text: 'Slot 0' },
        { id: 'one', text: 'Slot 1' },
        { id: 'five', text: 'Slot 5' },
        { id: 'full', text: 'None: it’s full' },
      ],
      answer: 'zero',
      explanation:
        'The next slot is (head + size) mod capacity = (3 + 2) mod 5 = 0. The rear wraps.',
      chapterId: 'circular-buffer',
    },
    {
      id: 'naive-waste',
      kind: 'true-false',
      prompt:
        'In a plain array queue, slots freed by dequeue can be used again by a later enqueue.',
      answer: false,
      explanation:
        'The front only moves forward, so slots before it stay empty for good. That’s the waste.',
      chapterId: 'naive-array',
    },
    {
      id: 'dequeue-empty',
      kind: 'multiple-choice',
      prompt: 'You dequeue from an empty queue. What happens?',
      options: [
        { id: 'underflow', text: 'An underflow' },
        { id: 'overflow', text: 'An overflow' },
        { id: 'zero', text: 'It returns 0' },
        { id: 'wait', text: 'It waits for an item' },
      ],
      answer: 'underflow',
      explanation: 'There’s no front item to remove, so the dequeue fails with an underflow.',
      chapterId: 'operations',
    },
    {
      id: 'bfs-uses',
      kind: 'multiple-choice',
      prompt: 'Breadth-first search keeps the nodes it will visit next in a…',
      options: [
        { id: 'queue', text: 'Queue' },
        { id: 'stack', text: 'Stack' },
        { id: 'sorted', text: 'Sorted list' },
        { id: 'hash', text: 'Hash table' },
      ],
      answer: 'queue',
      explanation:
        'Nodes are visited in the order they were found, level by level: first in, first out.',
      chapterId: 'bfs-preview',
    },
  ],
} satisfies Quiz;
