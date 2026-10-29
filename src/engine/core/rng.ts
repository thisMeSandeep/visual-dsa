/**
 * Seeded random numbers, so a random input always produces the same trace: tests stay stable
 * and a shared sandbox scenario (F-607) replays exactly. Uses mulberry32, a small, fast PRNG.
 */
import { config } from '@/config';

// mulberry32 constants (part of the algorithm's definition, not tunable).
const MULBERRY_INCREMENT = 0x6d2b79f5;
const SHIFT_A = 15;
const SHIFT_B = 7;
const SHIFT_C = 14;
const MIX_B = 61;
const UINT32_RANGE = 4294967296;

export type Rng = {
  /** A float in [0, 1). */
  next(): number;
  /** A whole number in [min, max], both included. */
  int(min: number, max: number): number;
  /** One item, or undefined for an empty list. */
  pick<T>(items: readonly T[]): T | undefined;
  /** A shuffled copy; the input is not changed. */
  shuffle<T>(items: readonly T[]): T[];
};

export function createRng(seed: number = config.engine.defaultSeed): Rng {
  let state = seed >>> 0;

  const next = (): number => {
    state = (state + MULBERRY_INCREMENT) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> SHIFT_A), t | 1);
    t ^= t + Math.imul(t ^ (t >>> SHIFT_B), t | MIX_B);
    return ((t ^ (t >>> SHIFT_C)) >>> 0) / UINT32_RANGE;
  };

  const int = (min: number, max: number): number => min + Math.floor(next() * (max - min + 1));

  return {
    next,
    int,
    pick: (items) => (items.length === 0 ? undefined : items[int(0, items.length - 1)]),
    shuffle: (items) => {
      // Fisher–Yates on a copy.
      const copy = [...items];
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = int(0, i);
        [copy[i], copy[j]] = [copy[j] as (typeof copy)[number], copy[i] as (typeof copy)[number]];
      }
      return copy;
    },
  };
}
