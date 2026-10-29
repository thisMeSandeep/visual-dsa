import { View } from 'react-native';

import { AppText } from '@/components/app-text';

import { RENDERERS } from './renderers/registry';
import type { RendererProps } from './renderers/types';

/**
 * Draws any scene with the renderer it names. A renderer that doesn't exist yet shows a plain
 * message instead of crashing.
 */
export function SceneView(props: RendererProps) {
  const Renderer = RENDERERS[props.scene.renderer];

  if (!Renderer) {
    return (
      <View
        className="items-center justify-center"
        style={{ width: props.width, height: props.height }}
      >
        <AppText variant="label">No visualisation for “{props.scene.renderer}” yet.</AppText>
      </View>
    );
  }
  return <Renderer {...props} />;
}
