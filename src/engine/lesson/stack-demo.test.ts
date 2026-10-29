import { buildStackDemoLesson } from './stack-demo';
import { chapterAt } from './types';

const TITLES = {
  lifo: 'Last in, first out',
  'push-pop-peek': 'Push, pop and peek',
  'overflow-underflow': 'Overflow and underflow',
};

describe('buildStackDemoLesson', () => {
  const lesson = buildStackDemoLesson(TITLES);

  it('has three chapters, in order, with titles from the topic', () => {
    expect(lesson.chapters.map((c) => [c.id, c.title])).toEqual(Object.entries(TITLES));
    expect(lesson.chapters[0]?.firstStep).toBe(0);
    const starts = lesson.chapters.map((c) => c.firstStep);
    expect([...starts].sort((a, b) => a - b)).toEqual(starts);
  });

  it('pauses autoplay at the last step of each chapter, and nowhere else', () => {
    const lastSteps = lesson.chapters.map((chapter, i) =>
      i + 1 < lesson.chapters.length
        ? lesson.chapters[i + 1]!.firstStep - 1
        : lesson.steps.length - 1,
    );
    lesson.steps.forEach((step, index) => {
      expect(step.pause).toBe(lastSteps.includes(index) ? 'chapter-end' : undefined);
    });
  });

  it('includes the overflow and underflow error steps', () => {
    const keys = lesson.steps.map((step) => ('key' in step.caption ? step.caption.key : ''));
    expect(keys).toContain('stack.overflow');
    expect(keys.at(-1)).toBe('stack.underflow');
  });

  it('is the same every time', () => {
    expect(buildStackDemoLesson(TITLES)).toEqual(lesson);
  });
});

describe('chapterAt', () => {
  const lesson = buildStackDemoLesson(TITLES);

  it('finds the chapter that contains a step', () => {
    const second = lesson.chapters[1]!;
    expect(chapterAt(lesson, 0)?.id).toBe('lifo');
    expect(chapterAt(lesson, second.firstStep)?.id).toBe('push-pop-peek');
    expect(chapterAt(lesson, second.firstStep - 1)?.id).toBe('lifo');
    expect(chapterAt(lesson, lesson.steps.length - 1)?.id).toBe('overflow-underflow');
  });
});
