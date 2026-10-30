/**
 * Drawables: what a renderer's layout produces and the canvas draws. Positions are in canvas
 * points. `id` is stable across steps; the canvas animates each id from its old values to its
 * new ones, fades new ids in and old ids out.
 */
import type { ElementState } from '@/engine/core/types';
import type { ColorToken } from '@/theme';

/** A cell or node: rounded box with a centred value and an optional second line. */
export type BoxDrawable = {
  kind: 'box';
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  state: ElementState;
  value: string;
  detail?: string;
};

/** A label: index, pointer name ("top", "j"), callout text. */
export type TextDrawable = {
  kind: 'text';
  id: string;
  /** Anchor point; `align` says which side of the text it is. */
  x: number;
  /** Vertical centre of the text. */
  y: number;
  text: string;
  font: 'label' | 'index' | 'value';
  tone: ColorToken;
  align: 'left' | 'center' | 'right';
};

/** An edge or pointer arrow. */
export type LineDrawable = {
  kind: 'line';
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tone: ColorToken;
  /** Arrowhead at (x2, y2). */
  arrow: boolean;
};

/** A fixed shape such as the stack's U-shaped container. Its outline doesn't animate. */
export type PathDrawable = {
  kind: 'path';
  id: string;
  /** SVG path data in canvas points. */
  path: string;
  tone: ColorToken;
  strokeWidth: 'normal' | 'active';
};

/** A short note on a signal-soft chip, e.g. h("Sid") = 288 (VISUAL-SPEC §7 "Callout"). */
export type CalloutDrawable = {
  kind: 'callout';
  id: string;
  /** Left edge of the chip. */
  x: number;
  /** Vertical centre of the chip. */
  y: number;
  text: string;
};

export type Drawable = BoxDrawable | TextDrawable | LineDrawable | PathDrawable | CalloutDrawable;
