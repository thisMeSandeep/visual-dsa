import type { Scene } from '@/engine/core/types';
import type { VizSizes } from '@/theme';

import { SCENES, type SceneLayout } from '../../scenes';

/**
 * Analogy step → drawables. The scene's meta names the hand-built scene and the step within it
 * (engine/lesson/compile.ts). Undefined for a scene that doesn't exist.
 */
export function layoutAnalogy(scene: Scene, sizes: VizSizes): SceneLayout | undefined {
  const definition = SCENES[String(scene.meta?.sceneId ?? '')];
  return definition?.layout(Number(scene.meta?.sceneStep ?? 0), sizes);
}
