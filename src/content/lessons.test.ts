import { compileLesson } from '@/engine/lesson/compile';
import type { CompiledLesson } from '@/engine/lesson/types';

import { captionText } from './captions';
import { chapterTitles, TOPIC_LESSONS, TOPIC_METAS, type TopicId } from './registry';
import type { LessonRecipe } from './schema';
import { validateLessons } from './validate';

/**
 * One readable line per step: caption, code line, what the canvas shows, and any pause.
 * Snapshots of this catch any change to what a lesson teaches, in a diff a reviewer can read.
 */
function outline(lesson: CompiledLesson) {
  return {
    chapters: lesson.chapters.map((chapter) => `${chapter.firstStep}: ${chapter.title}`),
    steps: lesson.steps.map((step, index) =>
      [
        index,
        captionText(step.caption),
        step.codeLine ?? '-',
        step.a11y,
        ...(step.pause ? [`⏸ ${step.pause}`] : []),
      ].join(' | '),
    ),
  };
}

describe.each(Object.entries(TOPIC_LESSONS))('the %s lesson', (topicId, recipe) => {
  const meta = TOPIC_METAS[topicId as TopicId];
  const lesson = compileLesson(recipe, chapterTitles(meta));

  it('compiles to the expected steps', () => {
    expect(outline(lesson)).toMatchSnapshot();
  });

  it('only uses chapters in the topic’s order', () => {
    const order = meta.chapters.map((chapter) => chapter.id);
    const used = lesson.chapters.map((chapter) => order.indexOf(chapter.id));
    expect(used).toEqual([...used].sort((a, b) => a - b));
  });

  it('ends each chapter with a pause', () => {
    for (const chapter of lesson.chapters.slice(1)) {
      expect(lesson.steps[chapter.firstStep - 1]?.pause).toBeDefined();
    }
    expect(lesson.steps.at(-1)?.pause).toBeDefined();
  });
});

describe('lesson validation', () => {
  const recipe: LessonRecipe = {
    topicId: 'stack',
    segments: [
      { kind: 'chapter', chapterId: 'lifo' },
      { kind: 'setup', structure: 'stack' },
      { kind: 'trace', operation: 'stack.push', input: { value: '1' } },
    ],
  };
  const issues = (lessons: Record<string, unknown>) =>
    validateLessons(lessons, TOPIC_METAS).map((issue) => `${issue.path}: ${issue.message}`);

  it('accepts a lesson that compiles', () => {
    expect(issues({ stack: recipe })).toEqual([]);
  });

  it('reports schema problems', () => {
    const broken = { ...recipe, segments: [{ kind: 'chapter', chapterId: 'Not Kebab' }] };
    expect(issues({ stack: broken })).toEqual([
      expect.stringMatching(/^segments\.0\.chapterId: Use a kebab-case id/),
    ]);
  });

  it('reports a lesson registered under the wrong topic', () => {
    expect(issues({ queue: recipe })).toEqual([
      'topicId: Registered as "queue" but its topicId is "stack"',
    ]);
  });

  it('reports a lesson with no topic meta', () => {
    expect(issues({ heap: { ...recipe, topicId: 'heap' } })).toEqual([
      ': No topic meta with this id',
    ]);
  });

  it('reports what only compiling finds, with the segment', () => {
    const wrongChapter = {
      ...recipe,
      segments: [...recipe.segments, { kind: 'chapter', chapterId: 'heapify' }],
    };
    const wrongOperation = {
      ...recipe,
      segments: [...recipe.segments, { kind: 'trace', operation: 'stack.shuffle' }],
    };
    expect(issues({ stack: wrongChapter })).toEqual([
      'segments[3]: Unknown chapter "heapify" for this topic',
    ]);
    expect(issues({ stack: wrongOperation })).toEqual([
      'segments[3]: Unknown operation "stack.shuffle"',
    ]);
  });
});
