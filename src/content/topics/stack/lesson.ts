import type { LessonRecipe } from '../../schema';

/**
 * The Stack lesson (ALGORITHM-CATALOG L5). Trace segments run the real stack, so every step
 * after a push or pop shows what the code actually does. Chapters without segments yet
 * (browser-back, parentheses, implementations) are written in Step 5.3.
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
    { kind: 'trace', operation: 'stack.pop' },
    { kind: 'trace', operation: 'stack.peek' },

    { kind: 'chapter', chapterId: 'overflow-underflow' },
    { kind: 'trace', operation: 'stack.push', input: { value: '17' } },
    { kind: 'trace', operation: 'stack.push', input: { value: '5' } },
    { kind: 'trace', operation: 'stack.push', input: { value: '9' } },
    { kind: 'trace', operation: 'stack.clear' },
    { kind: 'trace', operation: 'stack.pop' },
  ],
} satisfies LessonRecipe;
