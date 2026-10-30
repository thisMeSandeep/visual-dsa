import { config } from '@/config';

import { positionOf, valueAt, type SliderRange } from './slider-scale';

const LOG: SliderRange = { min: 1, max: 1000, scale: 'log' };
const LINEAR: SliderRange = { min: 0, max: 10, scale: 'linear' };
const end = config.sandbox.sliderPositions;

describe('slider scale', () => {
  it('maps the ends of the slider to the ends of the range', () => {
    expect([valueAt(0, LOG), valueAt(end, LOG)]).toEqual([1, 1000]);
    expect([valueAt(0, LINEAR), valueAt(end, LINEAR)]).toEqual([0, 10]);
  });

  it('gives small values room on a log scale: the middle is √(min × max)', () => {
    expect(valueAt(end / 2, LOG)).toBe(32);
    expect(valueAt(end / 2, LINEAR)).toBe(5);
  });

  it('finds the position for a value, so the slider follows undo and presets', () => {
    expect(positionOf(1000, LOG)).toBe(end);
    expect(valueAt(positionOf(8, LOG), LOG)).toBe(8);
    expect(positionOf(5000, LOG)).toBe(end);
  });
});
