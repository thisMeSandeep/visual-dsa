import { config } from '@/config';

/** A slider's values: a linear scale, or a log scale so small values get as much room as big. */
export type SliderRange = Readonly<{ min: number; max: number; scale: 'linear' | 'log' }>;

const { sliderPositions } = config.sandbox;

/** The whole-number value at a slider position (0 to sliderPositions). */
export function valueAt(position: number, range: SliderRange): number {
  const t = Math.min(Math.max(position / sliderPositions, 0), 1);
  const raw =
    range.scale === 'log'
      ? range.min * (range.max / range.min) ** t
      : range.min + (range.max - range.min) * t;
  return Math.round(raw);
}

/** The slider position that shows `value`. */
export function positionOf(value: number, range: SliderRange): number {
  const clamped = Math.min(Math.max(value, range.min), range.max);
  const t =
    range.scale === 'log'
      ? Math.log(clamped / range.min) / Math.log(range.max / range.min)
      : (clamped - range.min) / (range.max - range.min);
  return Math.round(t * sliderPositions);
}
