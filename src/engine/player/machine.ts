/**
 * Lesson playback rules as a pure reducer (ARCHITECTURE §5.5). No timers and no React: the
 * player store (Step 4.3) owns the timer and dispatches `tick`; everything else is the learner.
 *
 *          play                 tick
 *  paused ───────▶ playing ─────────────▶ playing (next step)
 *    ▲   ◀───────     │
 *    │    pause       │ reaches a predict / interactive step
 *    │                ▼
 *    │          awaiting-input ── answer ──▶ playing (if it was playing) | paused
 *    │
 *    └── next / prev / seek from any state; moving past the last step ──▶ ended
 */
import { config } from '@/config';

import type { PauseReason } from '../core/types';

export type PlayerStatus = 'paused' | 'playing' | 'awaiting-input' | 'ended';

export type PlayerState = Readonly<{
  /** Index of the step on screen. */
  index: number;
  status: PlayerStatus;
  speed: number;
  totalSteps: number;
  /** Each step's pause reason, taken from the trace when the player is created. */
  pauses: readonly (PauseReason | undefined)[];
  pauseAtChapterEnd: boolean;
  /** Whether to keep playing after the learner answers. */
  resumePlaying: boolean;
}>;

export type PlayerAction =
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'seek'; index: number }
  | { type: 'setSpeed'; speed: number }
  /** Sent by the step timer while playing. */
  | { type: 'tick' }
  /** The learner answered (or acted on) the step the player is waiting at. */
  | { type: 'answer' };

export type CreatePlayerOptions = {
  pauses: readonly (PauseReason | undefined)[];
  startIndex?: number;
  speed?: number;
  pauseAtChapterEnd?: boolean;
};

const SPEEDS: readonly number[] = config.player.speeds;

const lastIndex = (state: PlayerState) => Math.max(0, state.totalSteps - 1);
const clampIndex = (state: PlayerState, index: number) =>
  Math.min(Math.max(0, Math.trunc(index)), lastIndex(state));

/** Steps that need the learner before the lesson can move on. */
const needsInput = (reason: PauseReason | undefined) =>
  reason === 'predict' || reason === 'interactive';

export function createPlayerState({
  pauses,
  startIndex = 0,
  speed = config.player.defaultSpeed,
  pauseAtChapterEnd = config.player.pauseAtChapterEnd,
}: CreatePlayerOptions): PlayerState {
  const base: PlayerState = {
    index: 0,
    status: pauses.length === 0 ? 'ended' : 'paused',
    speed: SPEEDS.includes(speed) ? speed : config.player.defaultSpeed,
    totalSteps: pauses.length,
    pauses,
    pauseAtChapterEnd,
    resumePlaying: false,
  };
  return { ...base, index: clampIndex(base, startIndex) };
}

/**
 * Moves forward onto `index` (by tick or next) and works out the new status:
 * waiting for input, stopping at a chapter end, or carrying on.
 */
function arriveForward(state: PlayerState, index: number, playing: boolean): PlayerState {
  const reason = state.pauses[index];
  if (needsInput(reason)) {
    return { ...state, index, status: 'awaiting-input', resumePlaying: playing };
  }
  const stopHere = playing && reason === 'chapter-end' && state.pauseAtChapterEnd;
  return { ...state, index, status: playing && !stopHere ? 'playing' : 'paused' };
}

export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  if (state.totalSteps === 0) return state;

  switch (action.type) {
    case 'play':
      if (state.status === 'ended') return { ...state, index: 0, status: 'playing' };
      if (state.status === 'paused') return { ...state, status: 'playing' };
      return state;

    case 'pause':
      return state.status === 'playing' ? { ...state, status: 'paused' } : state;

    case 'tick':
      if (state.status !== 'playing') return state;
      if (state.index >= lastIndex(state)) return { ...state, status: 'ended' };
      return arriveForward(state, state.index + 1, true);

    case 'next':
      // A step that needs the learner must be answered before moving on.
      if (state.status === 'awaiting-input' || state.status === 'ended') return state;
      if (state.index >= lastIndex(state)) return { ...state, status: 'ended' };
      // Stepping by hand stops autoplay.
      return arriveForward(state, state.index + 1, false);

    case 'prev':
      // Going back is review: it never re-asks a question.
      return { ...state, index: clampIndex(state, state.index - 1), status: 'paused' };

    case 'seek':
      return { ...state, index: clampIndex(state, action.index), status: 'paused' };

    case 'setSpeed':
      return SPEEDS.includes(action.speed) ? { ...state, speed: action.speed } : state;

    case 'answer':
      if (state.status !== 'awaiting-input') return state;
      return { ...state, status: state.resumePlaying ? 'playing' : 'paused', resumePlaying: false };
  }
}

/* ------------------------------------------------------------------------------------------------
 * Derived values for the controls
 * ---------------------------------------------------------------------------------------------- */

export const canGoBack = (state: PlayerState) => state.index > 0;

export const canGoForward = (state: PlayerState) =>
  state.status !== 'awaiting-input' && state.status !== 'ended' && state.totalSteps > 0;

/** The speed the speed button moves to next, wrapping from fastest back to slowest. */
export function nextSpeed(speed: number): number {
  const at = SPEEDS.indexOf(speed);
  return SPEEDS[(at + 1) % SPEEDS.length] ?? config.player.defaultSpeed;
}

/** 1-based step number for display ("6 / 70"). */
export const stepNumber = (state: PlayerState) => (state.totalSteps === 0 ? 0 : state.index + 1);
