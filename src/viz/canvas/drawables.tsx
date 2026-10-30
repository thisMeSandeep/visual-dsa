/**
 * One Skia component per drawable kind. Each keeps shared values for what can change between
 * steps (position, size, colour, opacity) and animates them on the UI thread; React only
 * re-renders when a step changes, never per frame.
 */
import {
  DashPathEffect,
  Group,
  Line,
  Path,
  RoundedRect,
  Text,
  vec,
} from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import type { ColorToken, VizSizes } from '@/theme';

import { STATE_PAINT } from '../state-style';
import { FADE_EASING, MOVE_EASING, useAnimatedColor, useAnimatedNumber } from './animated-values';
import type { CanvasTimings } from './timing';
import type {
  BoxDrawable,
  CalloutDrawable,
  LineDrawable,
  PathDrawable,
  TextDrawable,
} from './types';
import { centredBaseline, type VizFonts } from './use-viz-fonts';

export type DrawableContext = {
  fonts: VizFonts;
  sizes: VizSizes;
  timings: CanvasTimings;
  colors: Record<ColorToken, string>;
};

type Props<D> = { drawable: D; exiting: boolean; context: DrawableContext };

// Arrowheads open 30° either side of the line.
const ARROW_HALF_ANGLE_DEGREES = 30;
const DEGREES_PER_HALF_TURN = 180;
const ARROW_HALF_ANGLE = (ARROW_HALF_ANGLE_DEGREES * Math.PI) / DEGREES_PER_HALF_TURN;

/** 0 → 1 on mount, → 0 while exiting. */
function usePresenceProgress(exiting: boolean, timings: CanvasTimings) {
  return useAnimatedNumber(exiting ? 0 : 1, exiting ? timings.exit : timings.enter, FADE_EASING, 0);
}

/* Box: cells and nodes --------------------------------------------------------------------------- */

export function AnimatedBox({ drawable, exiting, context }: Props<BoxDrawable>) {
  const { fonts, sizes, timings, colors } = context;
  const paint = STATE_PAINT[drawable.state];

  const x = useAnimatedNumber(drawable.x, timings.move, MOVE_EASING);
  const y = useAnimatedNumber(drawable.y, timings.move, MOVE_EASING);
  const width = useAnimatedNumber(drawable.width, timings.move, MOVE_EASING);
  const height = useAnimatedNumber(drawable.height, timings.move, MOVE_EASING);
  const presence = usePresenceProgress(exiting, timings);
  const dim = useAnimatedNumber(
    paint.dimmed ? sizes.dimmedOpacity : 1,
    timings.highlight,
    FADE_EASING,
  );
  const strokeWidth = useAnimatedNumber(
    paint.strokeWidth === 'active' ? sizes.borderWidthActive : sizes.borderWidth,
    timings.highlight,
    FADE_EASING,
  );
  const fill = useAnimatedColor(colors[paint.fill], timings.highlight);
  const stroke = useAnimatedColor(colors[paint.stroke], timings.highlight);
  const textColor = useAnimatedColor(colors[paint.text], timings.highlight);

  const { enterScale } = timings;
  const opacity = useDerivedValue(() => presence.get() * dim.get());
  // Scale around the box's centre so entering boxes grow in place.
  const transform = useDerivedValue(() => [
    { translateX: x.get() + width.get() / 2 },
    { translateY: y.get() + height.get() / 2 },
    { scale: enterScale + (1 - enterScale) * presence.get() },
    { translateX: -width.get() / 2 },
    { translateY: -height.get() / 2 },
  ]);

  // The stroke is drawn inside the box so active borders don't grow it.
  const inset = useDerivedValue(() => strokeWidth.get() / 2);
  const strokeBoxWidth = useDerivedValue(() => width.get() - strokeWidth.get());
  const strokeBoxHeight = useDerivedValue(() => height.get() - strokeWidth.get());

  // Value centred; with a detail line, the two lines are centred as a block.
  const valueWidth = fonts.value.measureText(drawable.value).width;
  const detailWidth = drawable.detail ? fonts.detail.measureText(drawable.detail).width : 0;
  const valueHalf = fonts.value.getSize() / 2;
  const detailHalf = drawable.detail ? fonts.detail.getSize() / 2 : 0;
  const valueBaseline = centredBaseline(fonts.value) - detailHalf;
  const detailBaseline = centredBaseline(fonts.detail) + valueHalf;

  const valueX = useDerivedValue(() => (width.get() - valueWidth) / 2, [valueWidth]);
  const valueY = useDerivedValue(() => height.get() / 2 + valueBaseline, [valueBaseline]);
  const detailX = useDerivedValue(() => (width.get() - detailWidth) / 2, [detailWidth]);
  const detailY = useDerivedValue(() => height.get() / 2 + detailBaseline, [detailBaseline]);

  return (
    <Group transform={transform} opacity={opacity}>
      <RoundedRect x={0} y={0} width={width} height={height} r={sizes.radius} color={fill} />
      <RoundedRect
        x={inset}
        y={inset}
        width={strokeBoxWidth}
        height={strokeBoxHeight}
        r={sizes.radius}
        color={stroke}
        style="stroke"
        strokeWidth={strokeWidth}
      >
        {paint.dashed ? <DashPathEffect intervals={[sizes.dash, sizes.dashGap]} /> : null}
      </RoundedRect>
      <Text x={valueX} y={valueY} text={drawable.value} font={fonts.value} color={textColor} />
      {drawable.detail ? (
        <Text
          x={detailX}
          y={detailY}
          text={drawable.detail}
          font={fonts.detail}
          color={colors.muted}
        />
      ) : null}
    </Group>
  );
}

/* Text: labels, indices, pointer names ----------------------------------------------------------- */

export function AnimatedText({ drawable, exiting, context }: Props<TextDrawable>) {
  const { fonts, timings, colors } = context;
  const font = fonts[drawable.font];
  const textWidth = font.measureText(drawable.text).width;
  const offset =
    drawable.align === 'left' ? 0 : drawable.align === 'right' ? -textWidth : -textWidth / 2;

  const x = useAnimatedNumber(drawable.x + offset, timings.move, MOVE_EASING);
  const y = useAnimatedNumber(drawable.y + centredBaseline(font), timings.move, MOVE_EASING);
  const presence = usePresenceProgress(exiting, timings);
  const color = useAnimatedColor(colors[drawable.tone], timings.highlight);

  return (
    <Group opacity={presence}>
      <Text x={x} y={y} text={drawable.text} font={font} color={color} />
    </Group>
  );
}

/* Line: edges and pointer arrows ----------------------------------------------------------------- */

export function AnimatedLine({ drawable, exiting, context }: Props<LineDrawable>) {
  const { sizes, timings, colors } = context;
  const x1 = useAnimatedNumber(drawable.x1, timings.move, MOVE_EASING);
  const y1 = useAnimatedNumber(drawable.y1, timings.move, MOVE_EASING);
  const x2 = useAnimatedNumber(drawable.x2, timings.move, MOVE_EASING);
  const y2 = useAnimatedNumber(drawable.y2, timings.move, MOVE_EASING);
  const presence = usePresenceProgress(exiting, timings);
  const color = useAnimatedColor(colors[drawable.tone], timings.highlight);

  const p1 = useDerivedValue(() => vec(x1.get(), y1.get()));
  const p2 = useDerivedValue(() => vec(x2.get(), y2.get()));
  const arrowSize = sizes.arrowSize;
  const arrowHead = useDerivedValue(() => {
    const angle = Math.atan2(y2.get() - y1.get(), x2.get() - x1.get());
    const left = angle + Math.PI - ARROW_HALF_ANGLE;
    const right = angle + Math.PI + ARROW_HALF_ANGLE;
    return (
      `M ${x2.get() + arrowSize * Math.cos(left)} ${y2.get() + arrowSize * Math.sin(left)} ` +
      `L ${x2.get()} ${y2.get()} ` +
      `L ${x2.get() + arrowSize * Math.cos(right)} ${y2.get() + arrowSize * Math.sin(right)}`
    );
  }, [arrowSize]);

  return (
    <Group opacity={presence}>
      <Line p1={p1} p2={p2} color={color} strokeWidth={sizes.edgeWidth} strokeCap="round" />
      {drawable.arrow ? (
        <Path
          path={arrowHead}
          color={color}
          style="stroke"
          strokeWidth={sizes.edgeWidth}
          strokeCap="round"
          strokeJoin="round"
        />
      ) : null}
    </Group>
  );
}

/* Path: fixed shapes such as the stack container ------------------------------------------------- */

export function AnimatedPath({ drawable, exiting, context }: Props<PathDrawable>) {
  const { sizes, timings, colors } = context;
  const presence = usePresenceProgress(exiting, timings);
  const color = useAnimatedColor(colors[drawable.tone], timings.highlight);
  const strokeWidth = useAnimatedNumber(
    drawable.strokeWidth === 'active' ? sizes.borderWidthActive : sizes.borderWidth,
    timings.highlight,
    FADE_EASING,
  );

  return (
    <Group opacity={presence}>
      <Path
        path={drawable.path}
        color={color}
        style="stroke"
        strokeWidth={strokeWidth}
        strokeCap="round"
        strokeJoin="round"
      />
    </Group>
  );
}

/* Callout: a note on a chip ---------------------------------------------------------------------- */

export function AnimatedCallout({ drawable, exiting, context }: Props<CalloutDrawable>) {
  const { fonts, sizes, timings, colors } = context;
  const font = fonts.callout;
  const width = font.measureText(drawable.text).width + 2 * sizes.calloutPadX;
  const height = font.getSize() + 2 * sizes.calloutPadY;

  const x = useAnimatedNumber(drawable.x, timings.move, MOVE_EASING);
  const y = useAnimatedNumber(drawable.y - height / 2, timings.move, MOVE_EASING);
  const presence = usePresenceProgress(exiting, timings);
  const transform = useDerivedValue(() => [{ translateX: x.get() }, { translateY: y.get() }]);

  return (
    <Group transform={transform} opacity={presence}>
      <RoundedRect
        x={0}
        y={0}
        width={width}
        height={height}
        r={sizes.radius}
        color={colors['signal-soft']}
      />
      <Text
        x={sizes.calloutPadX}
        y={height / 2 + centredBaseline(font)}
        text={drawable.text}
        font={font}
        color={colors.ink}
      />
    </Group>
  );
}
