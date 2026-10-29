/**
 * React access to a player store. Each selector returns one value (never a new object), so a
 * component only re-renders when that value changes.
 */
import { useEffect, useState } from 'react';
import { useStore } from 'zustand';

import type { Step } from '@/engine/core/types';
import { canGoBack, canGoForward, stepNumber } from '@/engine/player/machine';

import { createPlayerStore, type PlayerStore, type PlayerStoreState } from './create-player-store';

/**
 * Creates a player for this component and keeps it in sync with `steps`: a new trace is loaded
 * into the same player (keeping its speed). The timer stops when the component unmounts.
 */
export function usePlayer(steps: readonly Step[], startIndex?: number): PlayerStore {
  const [store] = useState(() =>
    createPlayerStore({ steps, ...(startIndex === undefined ? {} : { startIndex }) }),
  );

  useEffect(() => {
    if (store.getState().steps !== steps) store.getState().load(steps, startIndex);
  }, [store, steps, startIndex]);

  useEffect(() => () => store.destroy(), [store]);

  return store;
}

const currentStep = (state: PlayerStoreState): Step | undefined => state.steps[state.index];

export function useCurrentStep(store: PlayerStore) {
  return useStore(store, currentStep);
}
export function usePlayerStatus(store: PlayerStore) {
  return useStore(store, (state) => state.status);
}
export function usePlayerSpeed(store: PlayerStore) {
  return useStore(store, (state) => state.speed);
}
export function useStepIndex(store: PlayerStore) {
  return useStore(store, (state) => state.index);
}
/** 1-based, for "6 / 70". */
export function useStepNumber(store: PlayerStore) {
  return useStore(store, stepNumber);
}
export function useTotalSteps(store: PlayerStore) {
  return useStore(store, (state) => state.totalSteps);
}
export function useCanGoBack(store: PlayerStore) {
  return useStore(store, canGoBack);
}
export function useCanGoForward(store: PlayerStore) {
  return useStore(store, canGoForward);
}

/** Stable action helpers (the store's dispatch never changes). */
export const playerActions = (store: PlayerStore) => {
  const { dispatch } = store.getState();
  return {
    play: () => dispatch({ type: 'play' }),
    pause: () => dispatch({ type: 'pause' }),
    next: () => dispatch({ type: 'next' }),
    prev: () => dispatch({ type: 'prev' }),
    seek: (index: number) => dispatch({ type: 'seek', index }),
    setSpeed: (speed: number) => dispatch({ type: 'setSpeed', speed }),
    answer: () => dispatch({ type: 'answer' }),
  };
};
