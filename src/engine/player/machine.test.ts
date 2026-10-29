import type { PauseReason } from '../core/types';
import {
  canGoBack,
  canGoForward,
  createPlayerState,
  nextSpeed,
  playerReducer,
  stepNumber,
  type PlayerAction,
  type PlayerState,
} from './machine';

const steps = (count: number, pauses: Record<number, PauseReason> = {}) =>
  Array.from({ length: count }, (_, i) => pauses[i]);

const run = (state: PlayerState, ...actions: PlayerAction[]) =>
  actions.reduce(playerReducer, state);

const play = { type: 'play' } as const;
const pause = { type: 'pause' } as const;
const tick = { type: 'tick' } as const;
const next = { type: 'next' } as const;
const prev = { type: 'prev' } as const;
const answer = { type: 'answer' } as const;
const seek = (index: number) => ({ type: 'seek', index }) as const;
const setSpeed = (speed: number) => ({ type: 'setSpeed', speed }) as const;

describe('createPlayerState', () => {
  it('starts paused on the first step at the default speed', () => {
    expect(createPlayerState({ pauses: steps(3) })).toMatchObject({
      index: 0,
      status: 'paused',
      speed: 1,
      totalSteps: 3,
    });
  });

  it('clamps the start step into range', () => {
    expect(createPlayerState({ pauses: steps(3), startIndex: 9 }).index).toBe(2);
    expect(createPlayerState({ pauses: steps(3), startIndex: -4 }).index).toBe(0);
  });

  it('falls back to the default speed for a speed that is not offered', () => {
    expect(createPlayerState({ pauses: steps(3), speed: 3 }).speed).toBe(1);
  });

  it('is ended, and ignores every action, when there are no steps', () => {
    const empty = createPlayerState({ pauses: [] });
    expect(empty.status).toBe('ended');
    expect(run(empty, play, tick, next, prev, seek(2))).toBe(empty);
  });
});

describe('play and pause', () => {
  it('plays from paused and pauses from playing', () => {
    const playing = run(createPlayerState({ pauses: steps(3) }), play);
    expect(playing.status).toBe('playing');
    expect(run(playing, pause).status).toBe('paused');
  });

  it('restarts from the first step when played after the end', () => {
    const ended = run(createPlayerState({ pauses: steps(2) }), play, tick, tick);
    expect(ended.status).toBe('ended');
    expect(run(ended, play)).toMatchObject({ index: 0, status: 'playing' });
  });

  it('returns the same state when nothing changes', () => {
    const paused = createPlayerState({ pauses: steps(3) });
    expect(playerReducer(paused, pause)).toBe(paused);
    expect(playerReducer(paused, tick)).toBe(paused);
  });
});

describe('tick (autoplay)', () => {
  it('advances one step per tick while playing', () => {
    const state = run(createPlayerState({ pauses: steps(4) }), play, tick, tick);
    expect(state).toMatchObject({ index: 2, status: 'playing' });
  });

  it('ends after the last step', () => {
    const state = run(createPlayerState({ pauses: steps(2) }), play, tick, tick);
    expect(state).toMatchObject({ index: 1, status: 'ended' });
  });

  it('stops at the end of a chapter', () => {
    const state = run(createPlayerState({ pauses: steps(4, { 1: 'chapter-end' }) }), play, tick);
    expect(state).toMatchObject({ index: 1, status: 'paused' });
  });

  it('runs through chapter ends when that is turned off', () => {
    const state = run(
      createPlayerState({ pauses: steps(4, { 1: 'chapter-end' }), pauseAtChapterEnd: false }),
      play,
      tick,
    );
    expect(state.status).toBe('playing');
  });
});

describe('steps that need the learner', () => {
  it.each<PauseReason>(['predict', 'interactive'])(
    'waits at a %s step, and blocks moving on until answered',
    (reason) => {
      const waiting = run(createPlayerState({ pauses: steps(4, { 1: reason }) }), play, tick);
      expect(waiting).toMatchObject({ index: 1, status: 'awaiting-input' });
      expect(run(waiting, tick, next, play)).toMatchObject({
        index: 1,
        status: 'awaiting-input',
      });
    },
  );

  it('resumes playing after the answer when it was playing', () => {
    const state = run(createPlayerState({ pauses: steps(4, { 1: 'predict' }) }), play, tick);
    expect(run(state, answer)).toMatchObject({ index: 1, status: 'playing' });
  });

  it('stays paused after the answer when the learner was stepping by hand', () => {
    const state = run(createPlayerState({ pauses: steps(4, { 1: 'predict' }) }), next);
    expect(state.status).toBe('awaiting-input');
    expect(run(state, answer).status).toBe('paused');
  });

  it('ignores an answer when nothing is being asked', () => {
    const paused = createPlayerState({ pauses: steps(3) });
    expect(playerReducer(paused, answer)).toBe(paused);
  });
});

describe('next, prev and seek', () => {
  it('next moves one step and stops autoplay', () => {
    const state = run(createPlayerState({ pauses: steps(4) }), play, next);
    expect(state).toMatchObject({ index: 1, status: 'paused' });
  });

  it('next on the last step ends the lesson', () => {
    const state = run(createPlayerState({ pauses: steps(2), startIndex: 1 }), next);
    expect(state).toMatchObject({ index: 1, status: 'ended' });
  });

  it('prev moves back one step, never below the first', () => {
    const atStart = createPlayerState({ pauses: steps(3) });
    expect(run(atStart, prev).index).toBe(0);
    expect(run(atStart, next, next, prev)).toMatchObject({ index: 1, status: 'paused' });
  });

  it('prev from the end goes back to reviewing', () => {
    const ended = run(createPlayerState({ pauses: steps(3), startIndex: 2 }), next);
    expect(run(ended, prev)).toMatchObject({ index: 1, status: 'paused' });
  });

  it('prev never re-asks a question it passes', () => {
    const state = run(
      createPlayerState({ pauses: steps(4, { 1: 'predict' }), startIndex: 2 }),
      prev,
    );
    expect(state).toMatchObject({ index: 1, status: 'paused' });
  });

  it('seek jumps to a step, clamped, and pauses', () => {
    const playing = run(createPlayerState({ pauses: steps(10) }), play);
    expect(run(playing, seek(6))).toMatchObject({ index: 6, status: 'paused' });
    expect(run(playing, seek(40)).index).toBe(9);
    expect(run(playing, seek(-2)).index).toBe(0);
  });
});

describe('setSpeed', () => {
  it('accepts every offered speed', () => {
    const state = createPlayerState({ pauses: steps(3) });
    for (const speed of [0.25, 0.5, 1, 1.5, 2, 4]) {
      expect(run(state, setSpeed(speed)).speed).toBe(speed);
    }
  });

  it('ignores a speed that is not offered', () => {
    const state = createPlayerState({ pauses: steps(3) });
    expect(run(state, setSpeed(3))).toBe(state);
  });

  it('keeps the position and status', () => {
    const playing = run(createPlayerState({ pauses: steps(5) }), play, tick);
    expect(run(playing, setSpeed(2))).toMatchObject({ index: 1, status: 'playing', speed: 2 });
  });
});

describe('derived values', () => {
  it('reports what the controls can do', () => {
    const start = createPlayerState({ pauses: steps(3, { 1: 'predict' }) });
    expect(canGoBack(start)).toBe(false);
    expect(canGoForward(start)).toBe(true);

    const waiting = run(start, next);
    expect(canGoBack(waiting)).toBe(true);
    expect(canGoForward(waiting)).toBe(false);
  });

  it('numbers steps from 1', () => {
    expect(stepNumber(createPlayerState({ pauses: steps(70), startIndex: 5 }))).toBe(6);
    expect(stepNumber(createPlayerState({ pauses: [] }))).toBe(0);
  });
});

describe('nextSpeed', () => {
  it('steps through the offered speeds and wraps around', () => {
    expect(nextSpeed(1)).toBe(1.5);
    expect(nextSpeed(4)).toBe(0.25);
  });

  it('falls back to the first offered speed for an unknown one', () => {
    expect(nextSpeed(3)).toBe(0.25);
  });
});
