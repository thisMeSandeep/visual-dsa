/**
 * Lets the chapter sheet (its own route) tell the open lesson to jump to a chapter. The sheet
 * records the request and closes; the lesson screen seeks and clears it.
 */
import { create } from 'zustand';

export type ChapterRequest = Readonly<{ topicId: string; chapterId: string }>;

type LessonNavigation = {
  chapterRequest: ChapterRequest | null;
  requestChapter: (topicId: string, chapterId: string) => void;
  clearChapterRequest: () => void;
};

export const useLessonNavigation = create<LessonNavigation>()((set) => ({
  chapterRequest: null,
  requestChapter: (topicId, chapterId) => set({ chapterRequest: { topicId, chapterId } }),
  clearChapterRequest: () => set({ chapterRequest: null }),
}));
