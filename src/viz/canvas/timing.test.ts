import { config } from '@/config';

import { canvasTimings } from './timing';

const { canvas } = config.motion;

describe('canvasTimings', () => {
  it('uses the configured durations at 1×', () => {
    expect(canvasTimings(1, false)).toEqual({
      move: canvas.moveMs,
      highlight: canvas.highlightMs,
      enter: canvas.enterMs,
      exit: canvas.exitMs,
      enterScale: canvas.enterScale,
    });
  });

  it('gets faster with playback speed and slower below 1×', () => {
    expect(canvasTimings(2, false).move).toBe(canvas.moveMs / 2);
    expect(canvasTimings(0.25, false).move).toBe(canvas.moveMs * 4);
  });

  it('with reduced motion, drops movement and scaling and keeps short fades', () => {
    expect(canvasTimings(1, true)).toEqual({
      move: 0,
      highlight: canvas.reducedMotionMs,
      enter: canvas.reducedMotionMs,
      exit: canvas.reducedMotionMs,
      enterScale: 1,
    });
  });

  it('never grows elements from nothing', () => {
    expect(canvas.enterScale).toBeGreaterThan(0);
  });
});
