/**
 * Learning progress (F-1001, F-104), saved on the device (ARCHITECTURE §7). Keyed by topic and
 * chapter id, never by step index, so editing a lesson doesn't break saved progress. Step 6.2
 * adds the actions that record it; quiz scores, bookmarks, streak and the revise list arrive
 * with their features, each as a schema version bump.
 */
import { z } from 'zod';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { config } from '@/config';

import { kvStorage } from './storage';

const TopicProgressSchema = z.object({
  /** Chapter ids the learner has finished. */
  completedChapters: z.array(z.string()).catch([]),
  /** Where the learner left the lesson: a chapter and the step within it. */
  last: z
    .object({ chapterId: z.string(), offset: z.number().int().nonnegative() })
    .optional()
    .catch(undefined),
});

const ProgressSchema = z
  .object({ topics: z.record(z.string(), TopicProgressSchema).catch({}) })
  .catch({ topics: {} });

export type TopicProgress = z.infer<typeof TopicProgressSchema>;
export type ProgressValues = z.infer<typeof ProgressSchema>;

export const EMPTY_PROGRESS: ProgressValues = { topics: {} };

/** Saved progress as the app can use it: invalid parts dropped, never a crash. */
export function parseProgress(saved: unknown): ProgressValues {
  return ProgressSchema.parse(saved ?? {});
}

export type ProgressState = ProgressValues;

export const useProgress = create<ProgressState>()(
  persist(() => EMPTY_PROGRESS, {
    name: config.storage.keys.progress,
    version: config.storage.versions.progress,
    storage: kvStorage,
    migrate: (saved) => parseProgress(saved),
    merge: (saved, current) => ({ ...current, ...parseProgress(saved) }),
  }),
);
