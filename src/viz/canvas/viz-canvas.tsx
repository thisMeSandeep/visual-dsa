import { Canvas } from '@shopify/react-native-skia';
import { View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { COLOR_TOKENS, useColors, useVizSizes } from '@/theme';

import {
  AnimatedBox,
  AnimatedLine,
  AnimatedPath,
  AnimatedText,
  type DrawableContext,
} from './drawables';
import { canvasTimings } from './timing';
import type { Drawable } from './types';
import { usePresence } from './use-presence';
import { useVizFonts } from './use-viz-fonts';

export type VizCanvasProps = {
  /** The current step, laid out. Ids must be stable across steps. */
  drawables: readonly Drawable[];
  width: number;
  height: number;
  /** Playback speed; animations get faster with it. */
  speed?: number;
  /** Screen-reader summary of the step (Step.a11y). */
  accessibilityLabel: string;
};

/**
 * Draws one step's drawables and animates from the previous step: matching ids move and
 * restyle, new ids fade and grow in, missing ids fade out (ARCHITECTURE §6.2).
 */
export function VizCanvas({
  drawables,
  width,
  height,
  speed = 1,
  accessibilityLabel,
}: VizCanvasProps) {
  const fonts = useVizFonts();
  const sizes = useVizSizes();
  const colors = useColors(COLOR_TOKENS);
  const reducedMotion = useReducedMotion();
  const timings = canvasTimings(speed, reducedMotion);
  const present = usePresence(drawables, timings.exit);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={{ width, height }}
    >
      {fonts ? (
        <Canvas style={{ width, height }}>
          {present.map(({ item, exiting }) => (
            <DrawableView
              key={item.id}
              drawable={item}
              exiting={exiting}
              context={{ fonts, sizes, timings, colors }}
            />
          ))}
        </Canvas>
      ) : null}
    </View>
  );
}

function DrawableView({
  drawable,
  exiting,
  context,
}: {
  drawable: Drawable;
  exiting: boolean;
  context: DrawableContext;
}) {
  switch (drawable.kind) {
    case 'box':
      return <AnimatedBox drawable={drawable} exiting={exiting} context={context} />;
    case 'text':
      return <AnimatedText drawable={drawable} exiting={exiting} context={context} />;
    case 'line':
      return <AnimatedLine drawable={drawable} exiting={exiting} context={context} />;
    case 'path':
      return <AnimatedPath drawable={drawable} exiting={exiting} context={context} />;
  }
}
