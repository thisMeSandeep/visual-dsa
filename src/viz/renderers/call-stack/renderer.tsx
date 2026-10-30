import { useVizSizes } from '@/theme';

import { VizCanvas } from '../../canvas';
import type { RendererProps } from '../types';
import { layoutCallStack } from './layout';

/** Draws recursion: the call stack's frames and, for Fibonacci, the call tree. */
export function CallStackRenderer({ scene, ...canvas }: RendererProps) {
  const sizes = useVizSizes();
  const layout = layoutCallStack(scene, sizes);

  return (
    <VizCanvas
      drawables={layout.drawables}
      contentWidth={layout.width}
      contentHeight={layout.height}
      {...canvas}
    />
  );
}
