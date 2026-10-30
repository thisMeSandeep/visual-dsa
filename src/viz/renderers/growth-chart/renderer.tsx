import { useVizSizes } from '@/theme';

import { VizCanvas } from '../../canvas';
import type { RendererProps } from '../types';
import { layoutGrowthChart } from './layout';

/** Draws Big O scenes: growth curves, the n marker, and a sample run's climbing counter. */
export function GrowthChartRenderer({ scene, ...canvas }: RendererProps) {
  const sizes = useVizSizes();
  const layout = layoutGrowthChart(scene, sizes);

  return (
    <VizCanvas
      drawables={layout.drawables}
      contentWidth={layout.width}
      contentHeight={layout.height}
      {...canvas}
    />
  );
}
