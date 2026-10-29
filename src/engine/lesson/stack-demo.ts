/**
 * A hard-coded Stack lesson for the lesson player (Step 4.4). It runs real stack operations, so
 * every step is genuine engine output. Step 5.1 replaces this with lesson recipes in content
 * compiled by engine/lesson/compile.ts.
 */
import type { Step } from '../core/types';
import { createStack, traceStack, type StackModel, type StackOperation } from '../structures/stack';
import type { CompiledLesson, LessonChapter } from './types';

type DemoChapter = { id: string; operations: StackOperation[] };

const CAPACITY = 4;

/** Uses the Stack topic's own chapter ids, so the chapter sheet and progress line up. */
const CHAPTERS: DemoChapter[] = [
  {
    id: 'lifo',
    operations: [
      { type: 'push', value: '23' },
      { type: 'push', value: '8' },
      { type: 'push', value: '42' },
    ],
  },
  {
    id: 'push-pop-peek',
    operations: [{ type: 'pop' }, { type: 'peek' }],
  },
  {
    id: 'overflow-underflow',
    operations: [
      { type: 'push', value: '17' },
      { type: 'push', value: '5' },
      { type: 'push', value: '9' },
      { type: 'clear' },
      { type: 'pop' },
    ],
  },
];

/**
 * Builds the demo lesson. `titles` maps chapter ids to titles (from the topic's meta).
 * The last step of each chapter pauses autoplay.
 */
export function buildStackDemoLesson(titles: Readonly<Record<string, string>>): CompiledLesson {
  let model: StackModel = createStack([], CAPACITY);
  const steps: Step[] = [];
  const chapters: LessonChapter[] = [];

  for (const chapter of CHAPTERS) {
    chapters.push({
      id: chapter.id,
      title: titles[chapter.id] ?? chapter.id,
      firstStep: steps.length,
    });
    for (const operation of chapter.operations) {
      const result = traceStack(model, operation);
      model = result.model;
      steps.push(...result.trace.steps);
    }
    const last = steps.length - 1;
    const lastStep = steps[last];
    if (lastStep) steps[last] = { ...lastStep, pause: 'chapter-end' };
  }

  return { topicId: 'stack', steps, chapters };
}
