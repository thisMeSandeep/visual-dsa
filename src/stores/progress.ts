/**
 * Learning progress (F-1001, F-104), saved on the device (ARCHITECTURE §7). Keyed by topic and
 * chapter id, never by step index, so editing a lesson doesn't break saved progress. Quiz
 * scores, bookmarks, streak and the revise list arrive with their features.
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
});

const ProgressSchema = z
  .object({
    topics: z.record(z.string(), TopicProgressSchema).catch({}),
    /** The topic whose lesson was open most recently: Home's Continue card. */
    lastTopicId: z.string().optional().catch(undefined),
  })
  .catch({ topics: {} });

export type TopicProgress = z.infer<typeof TopicProgressSchema>;
export type ProgressValues = z.infer<typeof ProgressSchema>;
export type SavedPosition = z.infer<typeof PositionSchema>;

export const EMPTY_PROGRESS: ProgressValues = { topics: {} };
const EMPTY_TOPIC: TopicProgress = { completedChapters: [] };

/** Saved progress as the app can use it: invalid parts dropped, never a crash. */
export function parseProgress(saved: unknown): ProgressValues {
  return ProgressSchema.parse(saved ?? {});
}

export type ProgressState = ProgressValues & {
  /** Records where the learner is in a topic's lesson, and makes it the topic to continue. */
  savePosition: (topicId: string, position: SavedPosition) => void;
  completeChapter: (topicId: string, chapterId: string) => void;
};

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
      };
    },
    {
      name: config.storage.keys.progress,
      version: config.storage.versions.progress,
      storage: kvStorage,
      partialize: ({ topics, lastTopicId }) => ({ topics, lastTopicId }),
      migrate: (saved) => parseProgress(saved),
      merge: (saved, current) => ({ ...current, ...parseProgress(saved) }),
    },
  ),
);
