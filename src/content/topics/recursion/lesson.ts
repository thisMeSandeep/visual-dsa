import type { LessonRecipe } from '../../schema';

/**
 * The Recursion lesson (ALGORITHM-CATALOG F2), on the call-stack renderer: frames pile up and
 * come off, and Fibonacci's call tree shows its repeated work.
 */
// Typed rather than `satisfies`, like the queue lesson, so the recipe literal isn't widened.
export const lesson: LessonRecipe = {
  topicId: 'recursion',
  segments: [
    { kind: 'chapter', chapterId: 'base-case' },
    { kind: 'setup', structure: 'recursion' },
    {
      kind: 'say',
      caption:
        'A **recursive** function solves a problem by calling itself on a smaller version of it.',
    },
    {
      kind: 'say',
      caption:
        'It needs a **base case**, small enough to answer directly, and a **recursive case** that calls itself.',
    },
    { kind: 'trace', operation: 'recursion.factorial', input: { n: 1 } },
    {
      kind: 'say',
      caption:
        'fact(1) is the base case: 1, with no more calls. Bigger n takes the recursive case.',
    },

    { kind: 'chapter', chapterId: 'call-stack' },
    {
      kind: 'say',
      caption:
        'Each call gets a **frame** on the **call stack**: its own n, and what it’s waiting for.',
    },
    { kind: 'trace', operation: 'recursion.factorial', input: { n: 3 } },
    {
      kind: 'say',
      caption:
        'Frames piled up on the way down and came off in reverse on the way back: last in, first out.',
    },

    { kind: 'chapter', chapterId: 'factorial' },
    {
      kind: 'say',
      caption: 'fact(n) = n × fact(n − 1), and fact(1) = 1. Watch fact(5).',
    },
    { kind: 'trace', operation: 'recursion.factorial', input: { n: 5 } },
    {
      kind: 'say',
      caption: 'n calls, and at most n frames at once: **O(n)** time and **O(n)** stack space.',
    },

    { kind: 'chapter', chapterId: 'fibonacci' },
    {
      kind: 'say',
      caption:
        'fib(n) = fib(n − 1) + fib(n − 2), with fib(0) = 0 and fib(1) = 1. Each call makes two more.',
    },
    { kind: 'trace', operation: 'recursion.fib', input: { n: 5 } },
    {
      kind: 'say',
      caption:
        'Look at the tree: fib(2) was worked out 3 times and fib(3) twice. That **repeated work** adds up.',
    },
    {
      kind: 'say',
      caption:
        'The calls almost double with each n: about **O(2ⁿ)**. fib(30) makes over a million calls.',
    },

    { kind: 'chapter', chapterId: 'memoisation' },
    {
      kind: 'say',
      caption: '**Memoisation** saves each answer the first time, and looks it up after that.',
    },
    { kind: 'trace', operation: 'recursion.fibMemo', input: { n: 5 } },
    {
      kind: 'say',
      caption:
        '9 calls instead of 15. Each fib(k) is worked out once: **O(n)** time, plus O(n) space for the memo.',
    },
    {
      kind: 'say',
      caption: 'Solving each smaller problem only once is the heart of **dynamic programming**.',
    },

    { kind: 'chapter', chapterId: 'stack-overflow' },
    {
      kind: 'say',
      caption: 'What if there’s no base case? Every call makes another, and none ever returns.',
    },
    { kind: 'trace', operation: 'recursion.noBaseCase', input: { n: 3 } },
    {
      kind: 'say',
      caption:
        'Real stacks hold thousands of frames, but not endless ones. Without a base case, they always run out.',
    },
    {
      kind: 'say',
      caption:
        'Very deep recursion can overflow even with a base case. A loop does the same work in O(1) stack.',
    },
    { kind: 'say', caption: 'Try factorial, Fibonacci and the memo in the **Sandbox**.' },
  ],
};
