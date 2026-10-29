import type { Step } from '../core/types';

/** A chapter's place in a compiled lesson. */
export type LessonChapter = Readonly<{
  id: string;
  title: string;
  /** Index of the chapter's first step. */
  firstStep: number;
}>;

/** A lesson ready to play: one flat list of steps plus where each chapter starts (ARCHITECTURE §5.4). */
export type CompiledLesson = Readonly<{
  topicId: string;
  steps: readonly Step[];
  chapters: readonly LessonChapter[];
}>;

/** The chapter that contains `stepIndex`. */
export function chapterAt(lesson: CompiledLesson, stepIndex: number): LessonChapter | undefined {
  let found: LessonChapter | undefined;
  for (const chapter of lesson.chapters) {
    if (chapter.firstStep <= stepIndex) found = chapter;
  }
  return found;
}
