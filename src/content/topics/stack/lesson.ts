import type { LessonRecipe } from '../../schema';

/**
 * The Stack lesson (ALGORITHM-CATALOG L5). Trace segments run the real stack and bracket
 * checker, so every operation step shows what the code actually does; the back button is a
 * hand-built scene (viz/scenes/browser-back.ts) with one caption per picture.
 */
export const lesson = {
  topicId: 'stack',
  segments: [
    { kind: 'chapter', chapterId: 'lifo' },
    { kind: 'setup', structure: 'stack', input: { capacity: 4 } },
    {
      kind: 'say',
      caption: 'A **stack** is a pile: you add to the top and take from the top. This one holds 4.',
    },
    { kind: 'trace', operation: 'stack.push', input: { value: '23' } },
    { kind: 'trace', operation: 'stack.push', input: { value: '8' } },
    { kind: 'trace', operation: 'stack.push', input: { value: '42' } },
    {
      kind: 'say',
      caption: '42 went in last, so it comes out first. That’s **last in, first out**.',
    },

    { kind: 'chapter', chapterId: 'push-pop-peek' },
    {
      kind: 'say',
      caption: 'Three operations, all at the **top**: push adds, pop removes, peek only looks.',
    },
    { kind: 'trace', operation: 'stack.pop' },
    { kind: 'trace', operation: 'stack.peek' },
    {
      kind: 'say',
      caption: 'Each one touches only the top item, so push, pop and peek all take **O(1)** time.',
    },

    { kind: 'chapter', chapterId: 'browser-back' },
    {
      kind: 'scene',
      sceneId: 'browser-back',
      steps: [
        { caption: 'Your browser keeps the pages you came from on a stack: the **back stack**.' },
        { caption: 'Open **news**. The page you leave, **home**, is pushed onto the back stack.' },
        { caption: 'Open **sport**. **news** is pushed on top of home.' },
        { caption: 'Open **scores**. Now **sport** is on top of the back stack.' },
        { caption: 'Press **Back**: the top page, **sport**, is popped and shown again.' },
        {
          caption:
            'Back again pops **news**. The page you left last is the first one Back returns to.',
        },
      ],
    },

    { kind: 'chapter', chapterId: 'parentheses' },
    { kind: 'setup', structure: 'brackets', input: { expression: '((5+3)+1)(2+9)' } },
    {
      kind: 'say',
      caption:
        'Code editors check brackets with a stack. Every **opening** bracket needs a **closing** partner.',
    },
    { kind: 'trace', operation: 'brackets.check' },
    { kind: 'setup', structure: 'brackets', input: { expression: '(()' } },
    { kind: 'say', caption: 'Now **(()**, where one bracket never closes.' },
    { kind: 'trace', operation: 'brackets.check' },

    { kind: 'chapter', chapterId: 'implementations' },
    { kind: 'setup', structure: 'stack', input: { values: ['23', '8', '42'], capacity: 4 } },
    { kind: 'say', caption: 'Inside the computer, a stack is usually built one of two ways.' },
    {
      kind: 'say',
      caption:
        '**Array-backed**: items sit side by side in one block, and an index marks the top. That’s the code here.',
    },
    {
      kind: 'say',
      caption: 'An array has a fixed size. Growing it means copying every item to a bigger block.',
    },
    {
      kind: 'say',
      caption:
        '**Linked-list-backed**: each push adds a node that points to the one below. The list’s head is the top.',
    },
    {
      kind: 'say',
      caption:
        'A linked list never fills up, but every item also stores a pointer. Both push and pop in **O(1)**.',
    },

    { kind: 'chapter', chapterId: 'overflow-underflow' },
    {
      kind: 'say',
      caption: 'A fixed-size stack can run out of room, and any stack can run out of items.',
    },
    { kind: 'trace', operation: 'stack.push', input: { value: '5' } },
    { kind: 'trace', operation: 'stack.push', input: { value: '9' } },
    { kind: 'trace', operation: 'stack.clear' },
    { kind: 'trace', operation: 'stack.pop' },
    {
      kind: 'say',
      caption:
        'That’s the stack: push, pop and peek at the top, all **O(1)**. Try your own in the **Sandbox**.',
    },
  ],
} satisfies LessonRecipe;
