import { useMemo } from 'react';

import type { ChapterState } from '@/components/chapter-row';
import type { TopicStatus } from '@/components/topic-row';
import type { TopicMeta } from '@/content/schema';
import { chapterRange, resumeIndex } from '@/engine/lesson/position';
import { chapterAt } from '@/engine/lesson/types';
import { useProgress, type TopicProgress as SavedProgress } from '@/stores/progress';

import { getLesson } from './use-lesson';

/** Where the learner will pick a lesson up again. */
export type ResumePoint = {
  /** Step index in the compiled lesson. */
  index: number;
  chapterId: string;
  chapterTitle: string;
  /** 1-based step within the chapter, for "step 3 of 6". */
  step: number;
  chapterSteps: number;
};

/** What a learner has done in one topic, ready for screens. */
export type TopicProgress = {
  completedChapterIds: readonly string[];
  /** Set once the learner has opened the lesson (and its saved chapter still exists). */
  resume?: ResumePoint;
};

/** Saved progress → screen-ready progress, using the topic's compiled lesson for positions. */
export function topicProgress(topicId: string, saved: SavedProgress | undefined): TopicProgress {
  const completedChapterIds = saved?.completedChapters ?? [];
  const lesson = getLesson(topicId);
  const index = lesson && saved?.last ? resumeIndex(lesson, saved.last) : undefined;
  const chapter = lesson && index !== undefined ? chapterAt(lesson, index) : undefined;
  if (!lesson || index === undefined || !chapter) return { completedChapterIds };

  const { first, last } = chapterRange(lesson, chapter);
  return {
    completedChapterIds,
    resume: {
      index,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      step: index - first + 1,
      chapterSteps: last - first + 1,
    },
  };
}

/** Progress for one topic, from the progress store. */
export function useTopicProgress(topicId: string): TopicProgress {
  const saved = useProgress((state) => state.topics[topicId]);
  return useMemo(() => topicProgress(topicId, saved), [topicId, saved]);
}

/** How many of the topic's chapters are done (ignoring ids the lesson no longer has). */
export function completedCount(meta: TopicMeta, progress: TopicProgress): number {
  return meta.chapters.filter((chapter) => progress.completedChapterIds.includes(chapter.id))
    .length;
}

/** Topic row status: done when every chapter is complete, otherwise "x of y". */
export function topicStatus(meta: TopicMeta, progress: TopicProgress): TopicStatus {
  const total = meta.chapters.length;
  const done = completedCount(meta, progress);
  if (done === total) return { kind: 'done' };
  return { kind: 'progress', done, total, current: progress.resume !== undefined };
}

/** Each chapter's state for chapter lists: where the learner is, done, or still to come. */
export function chapterState(chapterId: string, progress: TopicProgress): ChapterState {
  if (progress.resume?.chapterId === chapterId) return 'current';
  if (progress.completedChapterIds.includes(chapterId)) return 'done';
  return 'upcoming';
}
