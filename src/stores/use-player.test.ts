import { act, renderHook } from '@testing-library/react-native';

import { config } from '@/config';
import type { Step } from '@/engine/core/types';

import { playerActions, useCurrentStep, usePlayer, useStepNumber } from './use-player';

const makeSteps = (count: number, prefix = 'step'): Step[] =>
  Array.from({ length: count }, (_, i) => ({
    scene: { renderer: 'stack', elements: [] },
    caption: { text: `${prefix} ${i}` },
    counters: { comparisons: 0, swaps: 0, reads: 0, writes: 0 },
    a11y: `${prefix} ${i}`,
  }));

function usePlayerView(steps: Step[]) {
  const store = usePlayer(steps);
  return { store, step: useCurrentStep(store), number: useStepNumber(store) };
}

describe('usePlayer', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('re-renders with the current step as the player moves', async () => {
    const steps = makeSteps(3);
    const { result } = await renderHook(() => usePlayerView(steps));
    expect(result.current.number).toBe(1);

    await act(async () => {
      playerActions(result.current.store).play();
      jest.advanceTimersByTime(config.player.baseStepMs);
    });
    expect(result.current.step?.caption).toEqual({ text: 'step 1' });
    expect(result.current.number).toBe(2);
  });

  it('loads a new trace into the same player', async () => {
    const { result, rerender } = await renderHook(
      ({ steps }: { steps: Step[] }) => usePlayerView(steps),
      {
        initialProps: { steps: makeSteps(3) },
      },
    );
    const store = result.current.store;

    await rerender({ steps: makeSteps(2, 'pop') });
    expect(result.current.store).toBe(store);
    expect(result.current.step?.caption).toEqual({ text: 'pop 0' });
  });

  it('stops its timer on unmount', async () => {
    const steps = makeSteps(5);
    const { result, unmount } = await renderHook(() => usePlayerView(steps));
    const store = result.current.store;

    playerActions(store).play();
    await unmount();
    jest.advanceTimersByTime(config.player.baseStepMs * 5);
    expect(store.getState().index).toBe(0);
  });
});
