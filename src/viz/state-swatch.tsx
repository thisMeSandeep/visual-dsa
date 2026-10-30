import { View } from 'react-native';

import type { ElementState } from '@/engine/core/types';
import { COLOR_TOKENS, useColors, useVizSizes } from '@/theme';

import { STATE_PAINT } from './state-style';

/**
 * A small square painted the way the canvas paints `state` (fill, border weight, dashes, fading),
 * so the legend and the drawing always agree.
 */
export function StateSwatch({ state }: { state: ElementState }) {
  const colors = useColors(COLOR_TOKENS);
  const sizes = useVizSizes();
  const paint = STATE_PAINT[state];
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="h-3.5 w-3.5 rounded-sm"
      style={{
        backgroundColor: colors[paint.fill],
        borderColor: colors[paint.stroke],
        borderWidth: paint.strokeWidth === 'active' ? sizes.borderWidthActive : sizes.borderWidth,
        borderStyle: paint.dashed ? 'dashed' : 'solid',
        opacity: paint.dimmed ? sizes.dimmedOpacity : 1,
      }}
    />
  );
}
