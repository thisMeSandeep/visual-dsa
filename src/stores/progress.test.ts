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

describe('progress actions', () => {
  // Loaded here so the launch tests above get a fresh module each time.
  const { useProgress } = require('./progress') as typeof import('./progress');

  beforeEach(() => useProgress.setState({ topics: {}, lastTopicId: undefined }));

  it('saves the position and remembers the topic to continue', async () => {
    useProgress.getState().savePosition('stack', { chapterId: 'lifo', offset: 3 });
    expect(useProgress.getState()).toMatchObject({
      lastTopicId: 'stack',
      topics: { stack: { completedChapters: [], last: { chapterId: 'lifo', offset: 3 } } },
    });
    await Promise.resolve();
    expect(JSON.parse(Storage.getItemSync(config.storage.keys.progress) ?? '{}').state).toEqual({
      lastTopicId: 'stack',
      topics: { stack: { completedChapters: [], last: { chapterId: 'lifo', offset: 3 } } },
    });
  });

  it('skips the save when the position has not changed', () => {
    const { savePosition } = useProgress.getState();
    savePosition('stack', { chapterId: 'lifo', offset: 3 });
    const before = useProgress.getState().topics;
    savePosition('stack', { chapterId: 'lifo', offset: 3 });
    expect(useProgress.getState().topics).toBe(before);
  });

  it('completes each chapter once, keeping the position', () => {
    const { savePosition, completeChapter } = useProgress.getState();
    savePosition('stack', { chapterId: 'lifo', offset: 7 });
    completeChapter('stack', 'lifo');
    completeChapter('stack', 'lifo');
    completeChapter('queue', 'fifo');
    expect(useProgress.getState().topics).toEqual({
      stack: { completedChapters: ['lifo'], last: { chapterId: 'lifo', offset: 7 } },
      queue: { completedChapters: ['fifo'] },
    });
    expect(useProgress.getState().lastTopicId).toBe('stack');
  });
});
