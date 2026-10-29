import { config } from '@/config';
import type { PauseReason, Step } from '@/engine/core/types';

import { createPlayerStore, stepDelayMs } from './create-player-store';

const BASE = config.player.baseStepMs;

const makeSteps = (count: number, pauses: Record<number, PauseReason> = {}): Step[] =>
  Array.from({ length: count }, (_, i) => ({
    scene: { renderer: 'stack', elements: [] },
    caption: { text: `step ${i}` },
    counters: { comparisons: 0, swaps: 0, reads: 0, writes: 0 },
    a11y: `step ${i}`,
    ...(pauses[i] ? { pause: pauses[i] } : {}),
  }));

describe('createPlayerStore', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('starts paused on the first step and does not tick on its own', () => {
    const store = createPlayerStore({ steps: makeSteps(3) });
    jest.advanceTimersByTime(BASE * 5);
    expect(store.getState()).toMatchObject({ index: 0, status: 'paused' });
    store.destroy();
  });

  it('advances one step per baseStepMs while playing, then ends', () => {
    const store = createPlayerStore({ steps: makeSteps(3) });
    store.getState().dispatch({ type: 'play' });

    jest.advanceTimersByTime(BASE - 1);
    expect(store.getState().index).toBe(0);
    jest.advanceTimersByTime(1);
    expect(store.getState().index).toBe(1);
    jest.advanceTimersByTime(BASE);
    expect(store.getState().index).toBe(2);
    jest.advanceTimersByTime(BASE);
    expect(store.getState().status).toBe('ended');
    store.destroy();
  });

  it('stops ticking when paused', () => {
    const store = createPlayerStore({ steps: makeSteps(5) });
    store.getState().dispatch({ type: 'play' });
    jest.advanceTimersByTime(BASE);
    store.getState().dispatch({ type: 'pause' });
    jest.advanceTimersByTime(BASE * 5);
    expect(store.getState()).toMatchObject({ index: 1, status: 'paused' });
    store.destroy();
  });

  it('runs faster at a higher speed', () => {
    const store = createPlayerStore({ steps: makeSteps(5) });
    store.getState().dispatch({ type: 'setSpeed', speed: 2 });
    store.getState().dispatch({ type: 'play' });

    jest.advanceTimersByTime(stepDelayMs(2));
    expect(store.getState().index).toBe(1);
    expect(stepDelayMs(2)).toBe(BASE / 2);
    store.destroy();
  });

  it('restarts the countdown when the speed changes mid-step', () => {
    const store = createPlayerStore({ steps: makeSteps(5) });
    store.getState().dispatch({ type: 'play' });
    jest.advanceTimersByTime(BASE - 10);
    store.getState().dispatch({ type: 'setSpeed', speed: 0.5 });
    jest.advanceTimersByTime(BASE);
    expect(store.getState().index).toBe(0);
    jest.advanceTimersByTime(BASE);
    expect(store.getState().index).toBe(1);
    store.destroy();
  });

  it('seeks and pauses', () => {
    const store = createPlayerStore({ steps: makeSteps(10) });
    store.getState().dispatch({ type: 'play' });
    store.getState().dispatch({ type: 'seek', index: 6 });
    jest.advanceTimersByTime(BASE * 3);
    expect(store.getState()).toMatchObject({ index: 6, status: 'paused' });
    store.destroy();
  });

  it('waits at a predict step until answered, then keeps playing', () => {
    const store = createPlayerStore({ steps: makeSteps(4, { 1: 'predict' }) });
    store.getState().dispatch({ type: 'play' });
    jest.advanceTimersByTime(BASE * 5);
    expect(store.getState()).toMatchObject({ index: 1, status: 'awaiting-input' });

    store.getState().dispatch({ type: 'answer' });
    jest.advanceTimersByTime(BASE);
    expect(store.getState()).toMatchObject({ index: 2, status: 'playing' });
    store.destroy();
  });

  it('loads a new trace from the start, keeping the speed', () => {
    const store = createPlayerStore({ steps: makeSteps(3) });
    store.getState().dispatch({ type: 'setSpeed', speed: 2 });
    store.getState().dispatch({ type: 'next' });

    const next = makeSteps(6);
    store.getState().load(next);
    expect(store.getState()).toMatchObject({ index: 0, status: 'paused', speed: 2, totalSteps: 6 });
    expect(store.getState().steps).toBe(next);
    store.destroy();
  });

  it('does not notify subscribers when an action changes nothing', () => {
    const store = createPlayerStore({ steps: makeSteps(3) });
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);
    store.getState().dispatch({ type: 'pause' });
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
    store.destroy();
  });

  it('runs two players independently', () => {
    const a = createPlayerStore({ steps: makeSteps(5) });
    const b = createPlayerStore({ steps: makeSteps(5) });
    a.getState().dispatch({ type: 'play' });
    b.getState().dispatch({ type: 'setSpeed', speed: 4 });
    b.getState().dispatch({ type: 'play' });

    jest.advanceTimersByTime(BASE);
    expect(a.getState().index).toBe(1);
    expect(b.getState().index).toBe(4);
    a.destroy();
    b.destroy();
  });

  it('stops the timer when destroyed', () => {
    const store = createPlayerStore({ steps: makeSteps(5) });
    store.getState().dispatch({ type: 'play' });
    store.destroy();
    jest.advanceTimersByTime(BASE * 5);
    expect(store.getState().index).toBe(0);
  });
});
