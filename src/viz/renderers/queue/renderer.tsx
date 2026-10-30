import { useVizSizes } from '@/theme';

import { VizCanvas } from '../../canvas';
import type { RendererProps } from '../types';
import { layoutQueue } from './layout';

/** Draws queue scenes: a row of slots with front and rear pointers (and a wrap-around arc). */
export function QueueRenderer({ scene, ...canvas }: RendererProps) {
  const sizes = useVizSizes();
  const layout = layoutQueue(scene, sizes);

  return (
    <VizCanvas
      drawables={layout.drawables}
      contentWidth={layout.width}
      contentHeight={layout.height}
      {...canvas}
    />
  );
}
