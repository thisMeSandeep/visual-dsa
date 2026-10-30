import type { LessonRecipe } from '../../schema';

/**
 * The Queue lesson (ALGORITHM-CATALOG L6). Every chapter runs the real queue: the printer
 * example uses job names with captions written for it, and the plain-array and circular-buffer
 * chapters run the same operations so the difference shows.
 */
// Typed rather than `satisfies`: with several caption overrides, inference would widen them.
export const lesson: LessonRecipe = {
  topicId: 'queue',
  segments: [
    { kind: 'chapter', chapterId: 'fifo' },
    { kind: 'setup', structure: 'queue', input: { capacity: 6 } },
    {
      kind: 'say',
      caption:
        'A **queue** is a line: you join at the **rear** and leave from the **front**. This one has 6 slots.',
    },
    { kind: 'trace', operation: 'queue.enqueue', input: { value: '23' } },
    { kind: 'trace', operation: 'queue.enqueue', input: { value: '8' } },
    { kind: 'trace', operation: 'queue.enqueue', input: { value: '42' } },
    {
      kind: 'say',
      caption: '23 joined first, so it will leave first. That’s **first in, first out**.',
    },

    { kind: 'chapter', chapterId: 'operations' },
    {
      kind: 'say',
      caption:
        '**Enqueue** joins at the rear, **dequeue** leaves from the front, and **front** only looks.',
    },
    { kind: 'trace', operation: 'queue.dequeue' },
    { kind: 'trace', operation: 'queue.front' },
    { kind: 'trace', operation: 'queue.enqueue', input: { value: '17' } },
    {
      kind: 'say',
      caption:
        'Each one touches a single end, so enqueue, dequeue and front all take **O(1)** time.',
    },

    { kind: 'chapter', chapterId: 'printer' },
    { kind: 'setup', structure: 'queue', input: { capacity: 4 } },
    {
      kind: 'say',
      caption: 'A printer handles jobs in the order they were sent. The jobs waiting form a queue.',
    },
    {
      kind: 'trace',
      operation: 'queue.enqueue',
      input: { value: 'Ana' },
      captions: { '1': '**Ana** sends a page. Her job joins the queue.' },
    },
    {
      kind: 'trace',
      operation: 'queue.enqueue',
      input: { value: 'Ben' },
      captions: { '1': '**Ben** sends one next. He waits behind Ana.' },
    },
    {
      kind: 'trace',
      operation: 'queue.enqueue',
      input: { value: 'Mia' },
      captions: { '1': 'Then **Mia**. Three jobs are waiting.' },
    },
    {
      kind: 'trace',
      operation: 'queue.dequeue',
      captions: {
        '1': 'The printer is free. It takes the job at the front: **Ana**’s.',
        '2': '**Ana**’s page prints. **Ben** is next in line.',
      },
    },
    {
      kind: 'trace',
      operation: 'queue.dequeue',
      captions: { '2': '**Ben**’s page prints. First sent, first printed: that’s fair.' },
    },

    { kind: 'chapter', chapterId: 'naive-array' },
    { kind: 'setup', structure: 'queue', input: { capacity: 5, mode: 'naive' } },
    {
      kind: 'say',
      caption:
        'The simplest queue uses a plain array and moves the **front** forward as items leave.',
    },
    { kind: 'trace', operation: 'queue.enqueue', input: { value: '1' } },
    { kind: 'trace', operation: 'queue.enqueue', input: { value: '2' } },
    { kind: 'trace', operation: 'queue.enqueue', input: { value: '3' } },
    { kind: 'trace', operation: 'queue.dequeue' },
    { kind: 'trace', operation: 'queue.dequeue' },
    { kind: 'trace', operation: 'queue.enqueue', input: { value: '4' } },
    { kind: 'trace', operation: 'queue.enqueue', input: { value: '5' } },
    { kind: 'trace', operation: 'queue.enqueue', input: { value: '6' } },
    {
      kind: 'say',
      caption:
        'Slots 0 and 1 sit empty but can never be used again. A plain array **wastes** space.',
    },

    { kind: 'chapter', chapterId: 'circular-buffer' },
    { kind: 'setup', structure: 'queue', input: { capacity: 5, head: 2, values: ['3', '4', '5'] } },
    {
      kind: 'say',
      caption:
        'A **circular buffer** treats the array as a ring, so the rear can wrap round to slot 0.',
    },
    { kind: 'trace', operation: 'queue.enqueue', input: { value: '6' } },
    { kind: 'trace', operation: 'queue.enqueue', input: { value: '7' } },
    {
      kind: 'say',
      caption:
        'The front is at slot 2 and the rear at slot 1. Every slot is used, and nothing moves.',
    },
    { kind: 'trace', operation: 'queue.dequeue' },
    {
      kind: 'say',
      caption: 'The next slot is (head + size) mod capacity. That one line is the whole trick.',
    },

    { kind: 'chapter', chapterId: 'bfs-preview' },
    { kind: 'setup', structure: 'queue', input: { capacity: 6, values: ['A'] } },
    {
      kind: 'say',
      caption:
        'Queues power **breadth-first search**: exploring a graph level by level, starting at A.',
    },
    {
      kind: 'trace',
      operation: 'queue.dequeue',
      captions: { '2': 'Visit **A**, the front of the queue.' },
    },
    {
      kind: 'trace',
      operation: 'queue.enqueue',
      input: { value: 'B' },
      captions: { '1': 'A’s neighbour **B** joins the queue to be visited later.' },
    },
    {
      kind: 'trace',
      operation: 'queue.enqueue',
      input: { value: 'C' },
      captions: { '1': 'So does its neighbour **C**.' },
    },
    {
      kind: 'say',
      caption:
        'Visit the front, queue its neighbours, repeat. You’ll see it in full in the graph topics.',
    },
  ],
};
