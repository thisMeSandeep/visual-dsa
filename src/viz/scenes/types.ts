import type { VizSizes } from '@/theme';

import type { Drawable } from '../canvas/types';

/** What a scene draws at one step: drawables plus the content's natural size. */
export type SceneLayout = { drawables: Drawable[]; width: number; height: number };

/**
 * A hand-built real-world example (ARCHITECTURE §6.2): a fixed series of pictures, drawn with the
 * same drawables as the renderers, so the canvas animates between them. A lesson's `scene`
 * segment gives one caption per step; `bun run validate:content` checks the counts match.
 */
export type AnalogyScene = {
  stepCount: number;
  layout: (step: number, sizes: VizSizes) => SceneLayout;
};
