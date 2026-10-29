/**
 * Where a learner is in a lesson, saved as a chapter id plus an offset into that chapter, never
 * a raw step index (ARCHITECTURE §7). Editing a lesson moves step indices; chapter ids stay.
 */
import { chapterAt, type CompiledLesson, type LessonChapter } from './types';

export type LessonPosition = Readonly<{ chapterId: string; offset: number }>;

/** The first and last step index of a chapter. */
export function chapterRange(
  lesson: CompiledLesson,
  chapter: LessonChapter,
): { first: number; last: number } {
  const next = lesson.chapters[lesson.chapters.indexOf(chapter) + 1];
  return { first: chapter.firstStep, last: (next?.firstStep ?? lesson.steps.length) - 1 };
}

/** The position to save for a step index. */
export function positionAt(lesson: CompiledLesson, index: number): LessonPosition | undefined {
  const chapter = chapterAt(lesson, index);
  return chapter && { chapterId: chapter.id, offset: index - chapter.firstStep };
}

/** True when `index` is a chapter's last step: reaching it completes the chapter. */
export function isChapterEnd(lesson: CompiledLesson, index: number): boolean {
  const chapter = chapterAt(lesson, index);
  return chapter !== undefined && chapterRange(lesson, chapter).last === index;
}

/**
 * The step to resume at. Clamped to the chapter, in case the lesson got shorter. A learner who
 * stopped on a chapter's last step has finished it, so they continue with the next chapter.
 * Undefined when the saved chapter no longer exists.
 */
export function resumeIndex(lesson: CompiledLesson, position: LessonPosition): number | undefined {
  const chapter = lesson.chapters.find((c) => c.id === position.chapterId);
  if (!chapter) return undefined;
  const { first, last } = chapterRange(lesson, chapter);
  const index = Math.min(Math.max(first + position.offset, first), last);
  return index === last && index < lesson.steps.length - 1 ? index + 1 : index;
}

/**
 * Where a lesson opens: a `step` deep link (1-based, `learn?step=N`) wins, then a chosen
 * chapter, then the saved position, then the beginning. Out-of-range or unknown values are
 * ignored rather than trusted.
 */
export function startIndex(
  lesson: CompiledLesson,
  from: { step?: number; chapterId?: string; saved?: LessonPosition },
): number {
  const { step, chapterId, saved } = from;
  if (step !== undefined && Number.isInteger(step) && step >= 1 && step <= lesson.steps.length) {
    return step - 1;
  }
  const chapter = lesson.chapters.find((c) => c.id === chapterId);
  if (chapter) return chapter.firstStep;
  return (saved && resumeIndex(lesson, saved)) ?? 0;
}
