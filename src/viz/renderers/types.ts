import type { Scene } from '@/engine/core/types';

/** What every renderer receives: one step's scene and the space to draw it in. */
export type RendererProps = {
  scene: Scene;
  width: number;
  height: number;
  speed?: number;
  /** Screen-reader summary of the step (Step.a11y). */
  accessibilityLabel: string;
};
