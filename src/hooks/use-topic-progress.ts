import type { TopicStatus } from '@/components/topic-row';
import type { ChapterState } from '@/components/chapter-row';
import type { TopicMeta } from '@/content/schema';

/** What a learner has done in one topic. Keyed by chapter id, never step index (ARCHITECTURE §7). */
export type TopicProgress = {
  completedChapterIds: readonly string[];
  /** Where the learner stopped, if they're part-way through a chapter. */
  current?: { chapterId: string; step: number };
};

const NOT_STARTED: TopicProgress = { completedChapterIds: [] };

/**
 * Progress for one topic. The progress store arrives in Step 6.2; until then every topic is
 * unstarted, so screens show real counts (0 of N) rather than invented progress.
 */
export function useTopicProgress(_topicId: string): TopicProgress {
  return NOT_STARTED;
}

/** Topic row status: done when every chapter is complete, otherwise "x of y". */
export function topicStatus(meta: TopicMeta, progress: TopicProgress): TopicStatus {
  const total = meta.chapters.length;
  const done = meta.chapters.filter((chapter) =>
    progress.completedChapterIds.includes(chapter.id),
  ).length;
  if (done === total) return { kind: 'done' };
  return { kind: 'progress', done, total, current: progress.current !== undefined };
}

/** Each chapter's state for the Topic screen's chapter list. */
export function chapterState(chapterId: string, progress: TopicProgress): ChapterState {
  if (progress.current?.chapterId === chapterId) return 'current';
  if (progress.completedChapterIds.includes(chapterId)) return 'done';
  return 'upcoming';
}
