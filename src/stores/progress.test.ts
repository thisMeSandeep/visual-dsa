import Storage from 'expo-sqlite/kv-store';

import { config } from '@/config';

import { EMPTY_PROGRESS, parseProgress, type ProgressState } from './progress';

describe('progress store', () => {
  beforeEach(() => Storage.clearSync());

  it('starts empty', () => {
    expect(parseProgress(undefined)).toEqual(EMPTY_PROGRESS);
  });

  it('loads saved progress on launch', () => {
    const topics = {
      stack: { completedChapters: ['lifo'], last: { chapterId: 'push-pop-peek', offset: 3 } },
    };
    Storage.setItemSync(
      config.storage.keys.progress,
      JSON.stringify({ state: { topics }, version: config.storage.versions.progress }),
    );
    let state: ProgressState | undefined;
    jest.isolateModules(() => {
      state = (require('./progress') as typeof import('./progress')).useProgress.getState();
    });
    expect(state?.topics).toEqual(topics);
  });

  it('drops the invalid parts of a save', () => {
    expect(
      parseProgress({
        topics: {
          stack: { completedChapters: 'lifo', last: { chapterId: 'lifo', offset: -1 } },
          queue: { completedChapters: ['fifo'] },
        },
      }),
    ).toEqual({
      topics: {
        stack: { completedChapters: [], last: undefined },
        queue: { completedChapters: ['fifo'] },
      },
    });
    expect(parseProgress({ topics: 'all' })).toEqual(EMPTY_PROGRESS);
  });
});
