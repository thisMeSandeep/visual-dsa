/**
 * Learning progress (F-1001, F-104, F-706), saved on the device (ARCHITECTURE §7). Keyed by
 * topic, chapter and question id, never by step index, so editing content doesn't break saved
 * progress. Bookmarks and the streak arrive with their features.
 *
 * Adding a field with a `.catch()` default needs no version bump: older saves simply get the
 * default. Renaming, removing or changing the meaning of a field does.
 */
import { z } from 'zod';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { config } from '@/config';

import { kvStorage } from './storage';

const PositionSchema = z.object({
  chapterId: z.string(),
  offset: z.number().int().nonnegative(),
});

const TopicProgressSchema = z.object({
  /** Chapter ids the learner has finished. */
  completedChapters: z.array(z.string()).catch([]),
  /** Where the learner last was in the lesson: a chapter and the step within it. */
  last: PositionSchema.optional().catch(undefined),
  /** The topic quiz: correct answers last time and at best, out of `total`. */
  quiz: z
    .object({
      last: z.number().int().nonnegative(),
      best: z.number().int().nonnegative(),
      total: z.number().int().positive(),
    })
    .optional()
    .catch(undefined),
});

/** A question answered wrongly, waiting on the revise list until it's answered right. */
const ReviseItemSchema = z.object({ topicId: z.string(), questionId: z.string() });

const ProgressSchema = z
  .object({
    topics: z.record(z.string(), TopicProgressSchema).catch({}),
    /** The topic whose lesson was open most recently. */
    lastTopicId: z.string().optional().catch(undefined),
    /** Questions to revise, oldest first (F-706). */
    revise: z.array(ReviseItemSchema).catch([]),
  })
  .catch({ topics: {}, revise: [] });

export type TopicProgress = z.infer<typeof TopicProgressSchema>;
export type ProgressValues = z.infer<typeof ProgressSchema>;
export type SavedPosition = z.infer<typeof PositionSchema>;
export type ReviseItem = z.infer<typeof ReviseItemSchema>;

export const EMPTY_PROGRESS: ProgressValues = { topics: {}, revise: [] };
const EMPTY_TOPIC: TopicProgress = { completedChapters: [] };

/** Saved progress as the app can use it: invalid parts dropped, never a crash. */
export function parseProgress(saved: unknown): ProgressValues {
  return ProgressSchema.parse(saved ?? {});
}

export type ProgressState = ProgressValues & {
  /** Records where the learner is in a topic's lesson, and makes it the topic to continue. */
  savePosition: (topicId: string, position: SavedPosition) => void;
  completeChapter: (topicId: string, chapterId: string) => void;
  /** A wrong answer goes on the revise list; a right one takes it off. */
  recordAnswer: (topicId: string, questionId: string, correct: boolean) => void;
  /** Saves a finished topic quiz's score, keeping the best. */
  recordQuizScore: (topicId: string, correct: number, total: number) => void;
};

const sameQuestion = (a: ReviseItem, b: ReviseItem) =>
  a.topicId === b.topicId && a.questionId === b.questionId;

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => {
      const updateTopic = (topicId: string, change: (topic: TopicProgress) => TopicProgress) =>
        set((state) => ({
          topics: { ...state.topics, [topicId]: change(state.topics[topicId] ?? EMPTY_TOPIC) },
        }));

      return {
        ...EMPTY_PROGRESS,
        savePosition: (topicId, position) => {
          const { last } = get().topics[topicId] ?? EMPTY_TOPIC;
          // Each step lands here; skip the save when nothing changed.
          if (
            get().lastTopicId === topicId &&
            last?.chapterId === position.chapterId &&
            last.offset === position.offset
          ) {
            return;
          }
          updateTopic(topicId, (topic) => ({ ...topic, last: position }));
          set({ lastTopicId: topicId });
        },
        completeChapter: (topicId, chapterId) => {
          if ((get().topics[topicId] ?? EMPTY_TOPIC).completedChapters.includes(chapterId)) return;
          updateTopic(topicId, (topic) => ({
            ...topic,
            completedChapters: [...topic.completedChapters, chapterId],
          }));
        },
        recordAnswer: (topicId, questionId, correct) => {
          const item = { topicId, questionId };
          const listed = get().revise.some((other) => sameQuestion(other, item));
          if (correct && listed) {
            set({ revise: get().revise.filter((other) => !sameQuestion(other, item)) });
          } else if (!correct && !listed) {
            set({ revise: [...get().revise, item] });
          }
        },
        recordQuizScore: (topicId, correct, total) =>
          updateTopic(topicId, (topic) => ({
            ...topic,
            quiz: { last: correct, best: Math.max(correct, topic.quiz?.best ?? 0), total },
          })),
      };
    },
    {
      name: config.storage.keys.progress,
      version: config.storage.versions.progress,
      storage: kvStorage,
      partialize: ({ topics, lastTopicId, revise }) => ({ topics, lastTopicId, revise }),
      migrate: (saved) => parseProgress(saved),
      merge: (saved, current) => ({ ...current, ...parseProgress(saved) }),
    },
  ),
);
