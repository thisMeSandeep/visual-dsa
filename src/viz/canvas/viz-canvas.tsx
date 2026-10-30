import { Canvas, Group } from '@shopify/react-native-skia';
import { View } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { COLOR_TOKENS, useColors, useVizSizes } from '@/theme';

import { MOVE_EASING, useAnimatedNumber } from './animated-values';
import {
  AnimatedBox,
  AnimatedCallout,
  AnimatedLine,
  AnimatedPath,
  AnimatedText,
  type DrawableContext,
} from './drawables';
import { fitContent } from './fit';
import { canvasTimings } from './timing';
import type { Drawable } from './types';
import { usePresence } from './use-presence';
import { useVizFonts } from './use-viz-fonts';

export type VizCanvasProps = {
  /** The current step, laid out. Ids must be stable across steps. */
  drawables: readonly Drawable[];
  /** Size of the canvas on screen. */
  width: number;
  height: number;
  /**
   * Natural size of the drawables. When it's larger than the canvas, the drawing is scaled down
   * to fit; either way it's centred. Defaults to the canvas size (no scaling).
   */
  contentWidth?: number;
  contentHeight?: number;
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
  contentWidth = width,
  contentHeight = height,
  speed = 1,
  accessibilityLabel,
}: VizCanvasProps) {
  const fonts = useVizFonts();
  const sizes = useVizSizes();
  const colors = useColors(COLOR_TOKENS);
  const reducedMotion = useReducedMotion();
  const timings = canvasTimings(speed, reducedMotion);
  const present = usePresence(drawables, timings.exit);
  const fit = fitContent({ width, height }, { width: contentWidth, height: contentHeight });
  // The fit animates like the elements do, so a drawing that grows (an array doubling) zooms
  // out smoothly instead of jumping.
  const scale = useAnimatedNumber(fit.scale, timings.move, MOVE_EASING);
  const offsetX = useAnimatedNumber(fit.offsetX, timings.move, MOVE_EASING);
  const offsetY = useAnimatedNumber(fit.offsetY, timings.move, MOVE_EASING);
  const transform = useDerivedValue(() => [
    { translateX: offsetX.get() },
    { translateY: offsetY.get() },
    { scale: scale.get() },
  ]);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={{ width, height }}
    >
      {fonts ? (
        <Canvas style={{ width, height }}>
          <Group transform={transform}>
            {present.map(({ item, exiting }) => (
              <DrawableView
                key={item.id}
                drawable={item}
                exiting={exiting}
                context={{ fonts, sizes, timings, colors }}
              />
            ))}
          </Group>
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
    case 'callout':
      return <AnimatedCallout drawable={drawable} exiting={exiting} context={context} />;
  }
}
