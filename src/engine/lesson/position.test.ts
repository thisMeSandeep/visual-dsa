import type { Step } from '../core/types';
import { chapterRange, isChapterEnd, positionAt, resumeIndex, startIndex } from './position';
import type { CompiledLesson } from './types';

// Three chapters: a = steps 0–2, b = 3–4, c = 5–7.
const LESSON: CompiledLesson = {
  topicId: 'stack',
  steps: Array.from({ length: 8 }, () => ({}) as Step),
  chapters: [
    { id: 'a', title: 'A', firstStep: 0 },
    { id: 'b', title: 'B', firstStep: 3 },
    { id: 'c', title: 'C', firstStep: 5 },
  ],
};

describe('lesson positions', () => {
  it('gives each chapter its first and last step', () => {
    expect(LESSON.chapters.map((chapter) => chapterRange(LESSON, chapter))).toEqual([
      { first: 0, last: 2 },
      { first: 3, last: 4 },
      { first: 5, last: 7 },
    ]);
  });

  it('saves a step as its chapter and offset', () => {
    expect(positionAt(LESSON, 0)).toEqual({ chapterId: 'a', offset: 0 });
    expect(positionAt(LESSON, 4)).toEqual({ chapterId: 'b', offset: 1 });
    expect(positionAt({ ...LESSON, chapters: [] }, 0)).toBeUndefined();
  });

  it('knows which steps end a chapter', () => {
    expect([...Array(8).keys()].filter((i) => isChapterEnd(LESSON, i))).toEqual([2, 4, 7]);
  });

  it('resumes at the saved step', () => {
    expect(resumeIndex(LESSON, { chapterId: 'b', offset: 0 })).toBe(3);
    expect(resumeIndex(LESSON, { chapterId: 'c', offset: 1 })).toBe(6);
  });

  it('moves on to the next chapter after a finished one', () => {
    expect(resumeIndex(LESSON, { chapterId: 'a', offset: 2 })).toBe(3);
    // …but stays on the very last step of the lesson.
    expect(resumeIndex(LESSON, { chapterId: 'c', offset: 2 })).toBe(7);
  });

  it('copes with lessons that changed since the position was saved', () => {
    // The chapter got shorter: resume at its end, which moves on to the next chapter.
    expect(resumeIndex(LESSON, { chapterId: 'a', offset: 9 })).toBe(3);
    expect(resumeIndex(LESSON, { chapterId: 'a', offset: -1 })).toBe(0);
    expect(resumeIndex(LESSON, { chapterId: 'gone', offset: 0 })).toBeUndefined();
  });
});

describe('startIndex', () => {
  const saved = { chapterId: 'c', offset: 1 };

  it('opens a step deep link first, then a chapter, then the saved position', () => {
    expect(startIndex(LESSON, { step: 2, chapterId: 'b', saved })).toBe(1);
    expect(startIndex(LESSON, { chapterId: 'b', saved })).toBe(3);
    expect(startIndex(LESSON, { saved })).toBe(6);
    expect(startIndex(LESSON, {})).toBe(0);
  });

  it('ignores a step or chapter the lesson does not have', () => {
    expect(startIndex(LESSON, { step: 0, saved })).toBe(6);
    expect(startIndex(LESSON, { step: 9 })).toBe(0);
    expect(startIndex(LESSON, { step: 1.5 })).toBe(0);
    expect(startIndex(LESSON, { chapterId: 'gone' })).toBe(0);
    expect(startIndex(LESSON, { saved: { chapterId: 'gone', offset: 0 } })).toBe(0);
  });
});
