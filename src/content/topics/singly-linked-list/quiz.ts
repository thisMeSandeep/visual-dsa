import type { Quiz } from '../../schema';

/** Singly Linked List quiz (ALGORITHM-CATALOG L2 "Practice ideas"). Each links to its chapter. */
export const quiz = {
  topicId: 'singly-linked-list',
  questions: [
    {
      id: 'last-next',
      kind: 'true-false',
      prompt: 'The last node’s next pointer is null.',
      answer: true,
      explanation:
        'Nothing comes after the last node, so its next is null. That’s how a walk ends.',
      chapterId: 'nodes-and-pointers',
    },
    {
      id: 'remember-head',
      kind: 'multiple-choice',
      prompt: 'What must a singly linked list remember to reach every node?',
      options: [
        { id: 'head', text: 'A pointer to the head' },
        { id: 'tail', text: 'A pointer to the tail' },
        { id: 'size', text: 'Its size' },
        { id: 'indices', text: 'Each node’s index' },
      ],
      answer: 'head',
      explanation:
        'From the head you can follow next to every node. Lose the head and you lose the list.',
      chapterId: 'head-and-tail',
    },
    {
      id: 'access-cost',
      kind: 'complexity',
      prompt: 'How long does it take to reach the node at position i of a list of n nodes?',
      options: [
        { id: 'constant', text: 'O(1)' },
        { id: 'log', text: 'O(log n)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'linear',
      explanation: 'There are no indices: you follow next from the head, one node at a time. O(n).',
      chapterId: 'traversal',
    },
    {
      id: 'head-cost',
      kind: 'complexity',
      prompt: 'How long does inserting at the head take?',
      options: [
        { id: 'constant', text: 'O(1)' },
        { id: 'log', text: 'O(log n)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'constant',
      explanation:
        'Make a node, point it at the old head, move head. The rest of the list is untouched.',
      chapterId: 'insert-head',
    },
    {
      id: 'tail-cost',
      kind: 'complexity',
      prompt: 'Without a tail pointer, how long does inserting at the tail take?',
      options: [
        { id: 'constant', text: 'O(1)' },
        { id: 'log', text: 'O(log n)' },
        { id: 'linear', text: 'O(n)' },
        { id: 'quadratic', text: 'O(n²)' },
      ],
      answer: 'linear',
      explanation:
        'You walk from the head to find the last node first: O(n). A tail pointer makes it O(1).',
      chapterId: 'insert-tail',
    },
    {
      id: 'link-order',
      kind: 'multiple-choice',
      prompt: 'To insert node n after node a, which pointer do you set first?',
      options: [
        { id: 'new-first', text: 'n.next = a.next' },
        { id: 'old-first', text: 'a.next = n' },
        { id: 'either', text: 'Either order works' },
      ],
      answer: 'new-first',
      explanation:
        'Set a.next first and you lose the rest of the list. Link n to it, then re-aim a.',
      chapterId: 'insert-tail',
    },
    {
      id: 'unreachable',
      kind: 'multiple-choice',
      prompt: 'After prev.next = cur.next, which node is unreachable?',
      context: 'prev → cur → after\n  4  →  7  →  30',
      options: [
        { id: 'four', text: '4' },
        { id: 'seven', text: '7' },
        { id: 'thirty', text: '30' },
        { id: 'none', text: 'None' },
      ],
      answer: 'seven',
      explanation: '4 now points straight at 30, so nothing points to 7: it’s cut out of the list.',
      chapterId: 'delete',
    },
    {
      id: 'binary-search',
      kind: 'true-false',
      prompt: 'Binary search finds a value in a sorted linked list in O(log n).',
      answer: false,
      explanation:
        'Binary search jumps to the middle, but a list can only be walked from the head.',
      chapterId: 'search',
    },
    {
      id: 'reverse-prev',
      kind: 'multiple-choice',
      prompt: 'Reversing 1 → 2 → 3 → 4: after three passes of the loop, what does prev point to?',
      options: [
        { id: 'two', text: '2' },
        { id: 'three', text: '3' },
        { id: 'four', text: '4' },
        { id: 'null', text: 'null' },
      ],
      answer: 'three',
      explanation: 'Each pass flips cur and moves prev up to it: 1, then 2, then 3. cur is now 4.',
      chapterId: 'reverse',
    },
  ],
} satisfies Quiz;
