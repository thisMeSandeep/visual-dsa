import { View } from 'react-native';

import { AppText } from '@/components/app-text';
import { useVizSizes } from '@/theme';

import { VizCanvas } from '../../canvas';
import type { RendererProps } from '../types';
import { layoutAnalogy } from './layout';

/** Draws hand-built real-world example scenes (viz/scenes), such as the browser back button. */
export function AnalogyRenderer({ scene, ...canvas }: RendererProps) {
  const sizes = useVizSizes();
  const layout = layoutAnalogy(scene, sizes);

  if (!layout) {
    return (
      <View
        className="items-center justify-center"
        style={{ width: canvas.width, height: canvas.height }}
      >
        <AppText variant="label">No picture for “{String(scene.meta?.sceneId)}” yet.</AppText>
      </View>
    );
  }
  return (
    <VizCanvas
      drawables={layout.drawables}
      contentWidth={layout.width}
      contentHeight={layout.height}
      {...canvas}
    />
  );
}
