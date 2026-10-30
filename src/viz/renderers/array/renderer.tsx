import { useVizSizes } from '@/theme';

import { VizCanvas } from '../../canvas';
import type { RendererProps } from '../types';
import { layoutArray } from './layout';

/** Draws array scenes: indexed slots, an `i` pointer, and the old array while it grows. */
export function ArrayRenderer({ scene, ...canvas }: RendererProps) {
  const sizes = useVizSizes();
  const layout = layoutArray(scene, sizes);

  return (
    <VizCanvas
      drawables={layout.drawables}
      contentWidth={layout.width}
      contentHeight={layout.height}
      {...canvas}
    />
  );
}
