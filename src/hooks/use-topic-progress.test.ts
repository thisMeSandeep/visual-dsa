import { getTopicMeta } from '@/content/registry';

import { chapterState, completedCount, topicProgress, topicStatus } from './use-topic-progress';

const stack = getTopicMeta('stack')!;

describe('topicProgress', () => {
  it('is empty before the lesson is opened', () => {
    expect(topicProgress('stack', undefined)).toEqual({ completedChapterIds: [] });
  });

  it('turns a saved position into a resume point', () => {
    const progress = topicProgress('stack', {
      completedChapters: ['lifo'],
      last: { chapterId: 'push-pop-peek', offset: 2 },
    });
    expect(progress.resume).toEqual({
      index: 10,
      chapterId: 'push-pop-peek',
      chapterTitle: 'Push, pop and peek',
      step: 3,
      chapterSteps: 6,
    });
  });

  it('continues with the next chapter after a finished one', () => {
    const progress = topicProgress('stack', {
      completedChapters: ['lifo'],
      last: { chapterId: 'lifo', offset: 7 },
    });
    expect(progress.resume).toMatchObject({ chapterId: 'push-pop-peek', step: 1 });
  });

  it('has no resume point for a topic without a lesson, or a chapter that is gone', () => {
    const last = { chapterId: 'lifo', offset: 0 };
    expect(topicProgress('queue', { completedChapters: [], last }).resume).toBeUndefined();
    expect(
      topicProgress('stack', { completedChapters: [], last: { chapterId: 'old', offset: 0 } })
        .resume,
    ).toBeUndefined();
  });
});

describe('topic and chapter status', () => {
  it('counts only chapters the topic still has', () => {
    const progress = { completedChapterIds: ['lifo', 'renamed'] };
    expect(completedCount(stack, progress)).toBe(1);
    expect(topicStatus(stack, progress)).toEqual({
      kind: 'progress',
      done: 1,
      total: 6,
      current: false,
    });
  });

  it('is done when every chapter is', () => {
    const progress = { completedChapterIds: stack.chapters.map((chapter) => chapter.id) };
    expect(topicStatus(stack, progress)).toEqual({ kind: 'done' });
  });

  it('marks the chapter to resume as current, before done', () => {
    const progress = topicProgress('stack', {
      completedChapters: ['lifo', 'push-pop-peek'],
      last: { chapterId: 'push-pop-peek', offset: 0 },
    });
    expect(stack.chapters.map((chapter) => chapterState(chapter.id, progress))).toEqual([
      'done',
      'current',
      'upcoming',
      'upcoming',
      'upcoming',
      'upcoming',
    ]);
  });
});
