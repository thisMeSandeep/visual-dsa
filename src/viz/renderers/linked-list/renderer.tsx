import { useVizSizes } from '@/theme';

import { VizCanvas } from '../../canvas';
import type { RendererProps } from '../types';
import { layoutList } from './layout';

/** Draws linked-list scenes: nodes joined by next (and prev) arrows, with labelled pointers. */
export function LinkedListRenderer({ scene, ...canvas }: RendererProps) {
  const sizes = useVizSizes();
  const layout = layoutList(scene, sizes);

  return (
    <VizCanvas
      drawables={layout.drawables}
      contentWidth={layout.width}
      contentHeight={layout.height}
      {...canvas}
    />
  );
}
