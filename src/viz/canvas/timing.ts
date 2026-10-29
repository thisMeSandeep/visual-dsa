/**
 * Animation durations for one step change, from config.motion.canvas, playback speed and the
 * reduced-motion setting. Pure, so it's unit-tested without rendering.
 */
import { config } from '@/config';

const { canvas } = config.motion;

export type CanvasTimings = {
  /** Moving and resizing; 0 means jump straight to the new position. */
  move: number;
  highlight: number;
  enter: number;
  exit: number;
  /** Scale new elements grow from; 1 means they only fade in. */
  enterScale: number;
};

export function canvasTimings(speed: number, reducedMotion: boolean): CanvasTimings {
  if (reducedMotion) {
    // Fewer and gentler: no movement or scaling, only short cross-fades (expo-animation step 9).
    return {
      move: 0,
      highlight: canvas.reducedMotionMs,
      enter: canvas.reducedMotionMs,
      exit: canvas.reducedMotionMs,
      enterScale: 1,
    };
  }
  const scale = (ms: number) => ms / speed;
  return {
    move: scale(canvas.moveMs),
    highlight: scale(canvas.highlightMs),
    enter: scale(canvas.enterMs),
    exit: scale(canvas.exitMs),
    enterScale: canvas.enterScale,
  };
}
