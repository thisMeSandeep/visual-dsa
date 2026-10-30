import type { Quiz } from '../../schema';

/** Doubly Linked List quiz (ALGORITHM-CATALOG L3). Each question links to its chapter. */
export const quiz = {
  topicId: 'doubly-linked-list',
  questions: [
    {
      id: 'head-prev',
      kind: 'true-false',
      prompt: 'In a doubly linked list, the head’s prev pointer is null.',
      answer: true,
      explanation: 'Nothing comes before the head, just as nothing comes after the tail.',
      chapterId: 'prev-pointers',
    },
    {
      id: 'tail-cost',
      kind: 'complexity',
      prompt: 'How long does inserting at the tail of a doubly linked list take?',
      options: [
        { id: 'constant', text: 'O(1)' },
        { id: 'log', text: 'O(log n)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'constant',
      explanation: 'The tail pointer finds the end at once, and only three pointers change.',
      chapterId: 'insert-ends',
    },
    {
      id: 'singly-before',
      kind: 'true-false',
      prompt: 'A singly linked list can insert before a node as easily as a doubly linked list.',
      answer: false,
      explanation:
        'It has no prev pointers, so it has to walk from the head to find the node before.',
      chapterId: 'insert-ends',
    },
    {
      id: 'delete-cost',
      kind: 'complexity',
      prompt: 'You already have a pointer to a node. How long does unlinking it take?',
      options: [
        { id: 'constant', text: 'O(1)' },
        { id: 'log', text: 'O(log n)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'constant',
      explanation: 'The node knows both neighbours, so you re-aim two pointers. No walk needed.',
      chapterId: 'delete-node',
    },
    {
      id: 'pointers-changed',
      kind: 'multiple-choice',
      prompt: 'Deleting a node from the middle of a doubly linked list changes how many pointers?',
      options: [
        { id: 'one', text: '1' },
        { id: 'two', text: '2' },
        { id: 'three', text: '3' },
        { id: 'four', text: '4' },
      ],
      answer: 'two',
      explanation: 'The node before skips forward past it, and the node after skips back past it.',
      chapterId: 'delete-node',
    },
    {
      id: 'delete-tail',
      kind: 'multiple-choice',
      prompt: 'You delete the tail node. What does tail point to afterwards?',
      options: [
        { id: 'before', text: 'The node that was before it' },
        { id: 'head', text: 'The head' },
        { id: 'null', text: 'null' },
        { id: 'deleted', text: 'The deleted node' },
      ],
      answer: 'before',
      explanation:
        'tail moves back along prev to the node before. It’s null only if the list is now empty.',
      chapterId: 'delete-node',
    },
    {
      id: 'search-cost',
      kind: 'complexity',
      prompt: 'How long does finding a value in a doubly linked list of n nodes take?',
      options: [
        { id: 'constant', text: 'O(1)' },
        { id: 'log', text: 'O(log n)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'linear',
      explanation: 'Prev pointers don’t help you find things: you still check nodes one by one.',
      chapterId: 'delete-node',
    },
    {
      id: 'walk-back',
      kind: 'multiple-choice',
      prompt: 'To walk a doubly linked list backwards, you start at…',
      options: [
        { id: 'tail', text: 'The tail, following prev' },
        { id: 'head', text: 'The head, following prev' },
        { id: 'middle', text: 'The middle node' },
        { id: 'null', text: 'null' },
      ],
      answer: 'tail',
      explanation: 'Start at the tail and follow prev until it’s null, at the head.',
      chapterId: 'traverse-backwards',
    },
    {
      id: 'memory',
      kind: 'multiple-choice',
      prompt: 'Compared with a singly linked list node, a doubly linked list node stores…',
      options: [
        { id: 'extra-pointer', text: 'One extra pointer' },
        { id: 'same', text: 'The same' },
        { id: 'index', text: 'An extra index' },
        { id: 'copy', text: 'A copy of its value' },
      ],
      answer: 'extra-pointer',
      explanation:
        'Each node holds prev as well as next: more memory, in exchange for going both ways.',
      chapterId: 'trade-off',
    },
  ],
} satisfies Quiz;
