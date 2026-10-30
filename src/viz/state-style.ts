/**
 * How each element state looks on the canvas (VISUAL-SPEC §7 "State palette"). Values are colour
 * token names, resolved through src/theme, so changing tokens.css restyles the canvas too.
 * Every state differs by more than colour (border weight, dash, opacity) for colour-blind users.
 */
import type { ElementState } from '@/engine/core/types';
import type { ColorToken } from '@/theme';

export type StatePaint = {
  fill: ColorToken;
  stroke: ColorToken;
  text: ColorToken;
  /** 'active' uses the thicker --viz-border-width-active. */
  strokeWidth: 'normal' | 'active';
  /** Dashed border, used for errors. */
  dashed: boolean;
  /** Drawn at --viz-dimmed-opacity. */
  dimmed: boolean;
};

const DEFAULT: StatePaint = {
  fill: 'surface-raised',
  stroke: 'line-strong',
  text: 'ink',
  strokeWidth: 'normal',
  dashed: false,
  dimmed: false,
};

/** "Look here now": active, comparing, new, collision, swapping. */
const SIGNAL: StatePaint = {
  ...DEFAULT,
  fill: 'signal-soft',
  stroke: 'signal',
  strokeWidth: 'active',
};

const SUCCESS: StatePaint = {
  ...DEFAULT,
  fill: 'success-soft',
  stroke: 'success',
  strokeWidth: 'active',
};

export const STATE_PAINT: Record<ElementState, StatePaint> = {
  default: DEFAULT,
  active: SIGNAL,
  new: SIGNAL,
  collision: SIGNAL,
  swapping: SIGNAL,
  pivot: { ...DEFAULT, fill: 'primary-soft', stroke: 'primary', strokeWidth: 'active' },
  visited: { ...DEFAULT, fill: 'primary-soft' },
  found: SUCCESS,
  sorted: SUCCESS,
  error: { ...DEFAULT, fill: 'danger-soft', stroke: 'danger', strokeWidth: 'active', dashed: true },
  dimmed: { ...DEFAULT, dimmed: true },
};
