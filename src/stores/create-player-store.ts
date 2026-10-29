/**
 * One store per player instance (ARCHITECTURE §6.1): Compare mode runs two at once, so this is a
 * factory, not a global store. It wraps the pure playback machine (engine/player) and owns the
 * step timer: while playing, a timeout dispatches `tick` every baseStepMs / speed.
 */
import { createStore } from 'zustand/vanilla';

import { config } from '@/config';
import type { Step } from '@/engine/core/types';
import {
  createPlayerState,
  playerReducer,
  type PlayerAction,
  type PlayerState,
} from '@/engine/player/machine';

export type PlayerStoreState = PlayerState & {
  steps: readonly Step[];
  dispatch: (action: PlayerAction) => void;
  /** Replaces the steps (a new trace), keeping the playback speed. */
  load: (steps: readonly Step[], startIndex?: number) => void;
};

export type PlayerStore = ReturnType<typeof createPlayerStore>;

export type CreatePlayerStoreOptions = {
  steps: readonly Step[];
  startIndex?: number;
  speed?: number;
};

/** How long a step stays on screen while playing. */
export const stepDelayMs = (speed: number) => config.player.baseStepMs / speed;

const machineStateFor = (steps: readonly Step[], startIndex?: number, speed?: number) =>
  createPlayerState({
    pauses: steps.map((step) => step.pause),
    ...(startIndex === undefined ? {} : { startIndex }),
    ...(speed === undefined ? {} : { speed }),
  });

export function createPlayerStore({ steps, startIndex, speed }: CreatePlayerStoreOptions) {
  const store = createStore<PlayerStoreState>()((set, get) => ({
    ...machineStateFor(steps, startIndex, speed),
    steps,
    dispatch: (action) => {
      const current = get();
      const next = playerReducer(current, action);
      // The machine returns the same object when nothing changed; skip the update then.
      if (next !== current) set(next);
    },
    load: (nextSteps, nextStart) => {
      set({ ...machineStateFor(nextSteps, nextStart, get().speed), steps: nextSteps });
    },
  }));

  /* Step timer ---------------------------------------------------------------------------------- */

  let timer: ReturnType<typeof setTimeout> | undefined;

  const schedule = (state: PlayerStoreState) => {
    clearTimeout(timer);
    timer = undefined;
    if (state.status !== 'playing') return;
    timer = setTimeout(() => store.getState().dispatch({ type: 'tick' }), stepDelayMs(state.speed));
  };

  const unsubscribe = store.subscribe((state, previous) => {
    if (
      state.status !== previous.status ||
      state.index !== previous.index ||
      state.speed !== previous.speed ||
      state.steps !== previous.steps
    ) {
      schedule(state);
    }
  });

  return Object.assign(store, {
    /** Stops the timer and the subscription. Call when the player goes away. */
    destroy: () => {
      clearTimeout(timer);
      unsubscribe();
    },
  });
}
