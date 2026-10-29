import { browserBack } from './browser-back';
import type { AnalogyScene } from './types';

/** Every analogy scene by the id lesson recipes use (`{ kind: 'scene', sceneId }`). */
export const SCENES: Readonly<Record<string, AnalogyScene>> = {
  'browser-back': browserBack,
};

export type { AnalogyScene, SceneLayout } from './types';
