/**
 * Typed access to the design tokens in ./tokens.css for TypeScript code (Skia canvas, icons,
 * @expo/ui colour props). This is the only file that calls Uniwind's CSS-variable APIs.
 *
 * Screens and components should prefer class names (bg-primary, text-ink, p-6); use these
 * helpers only where a class name can't reach.
 */
import { Uniwind, useCSSVariable, useUniwind } from 'uniwind';

/* ------------------------------------------------------------------------------------------------
 * Colours
 * ---------------------------------------------------------------------------------------------- */

export const COLOR_TOKENS = [
  // Neutrals
  'background',
  'surface',
  'surface-raised',
  'line',
  'line-strong',
  'line-input',
  'edge',
  'ink',
  'ink-2',
  'muted',
  // Semantic
  'primary',
  'on-primary',
  'primary-soft',
  'primary-track',
  'signal',
  'signal-ink',
  'signal-soft',
  'success',
  'success-ink',
  'success-soft',
  'danger',
  'danger-soft',
  // Categories
  'cat-foundations',
  'cat-foundations-ink',
  'cat-linear',
  'cat-linear-ink',
  'cat-hashing',
  'cat-hashing-ink',
  'cat-trees',
  'cat-trees-ink',
  'cat-graphs',
  'cat-graphs-ink',
  'cat-algorithms',
  'cat-algorithms-ink',
  // Modes
  'mode-sandbox',
  'mode-sandbox-ink',
  'mode-sandbox-soft',
  'mode-practice',
  'mode-practice-ink',
  'mode-practice-soft',
  // Code syntax
  'code-keyword',
  'code-name',
  'code-string',
  'code-number',
  'code-comment',
] as const;

export type ColorToken = (typeof COLOR_TOKENS)[number];

const colorVar = (token: ColorToken) => `--color-${token}` as const;

/** One colour for the current theme. Re-renders when the theme changes. */
export function useColor(token: ColorToken): string {
  return String(useCSSVariable(colorVar(token)) ?? '');
}

/** Several colours at once, keyed by token name. Re-renders when the theme changes. */
export function useColors<T extends ColorToken>(tokens: readonly T[]): Record<T, string> {
  const values = useCSSVariable(tokens.map(colorVar)) as (string | number | undefined)[];
  return Object.fromEntries(tokens.map((token, i) => [token, String(values[i] ?? '')])) as Record<
    T,
    string
  >;
}

/** One-shot read outside React (worklets, callbacks). Not reactive. */
export function getColor(token: ColorToken): string {
  return String(Uniwind.getCSSVariable(colorVar(token)) ?? '');
}

/* ------------------------------------------------------------------------------------------------
 * Sizes (the @theme static block)
 * ---------------------------------------------------------------------------------------------- */

const VIZ_SIZE_VARS = {
  cellWidth: '--viz-cell-width',
  cellHeight: '--viz-cell-height',
  bucketWidth: '--viz-bucket-width',
  bucketHeight: '--viz-bucket-height',
  nodeHeight: '--viz-node-height',
  gap: '--viz-gap',
  radius: '--viz-radius',
  borderWidth: '--viz-border-width',
  borderWidthActive: '--viz-border-width-active',
  edgeWidth: '--viz-edge-width',
  dimmedOpacity: '--viz-dimmed-opacity',
  dash: '--viz-dash',
  dashGap: '--viz-dash-gap',
  arrowSize: '--viz-arrow-size',
  fontValue: '--viz-font-value',
  fontDetail: '--viz-font-detail',
  fontLabel: '--viz-font-label',
  fontIndex: '--viz-font-index',
  labelGap: '--viz-label-gap',
  pointerLength: '--viz-pointer-length',
  pointerLabelWidth: '--viz-pointer-label-width',
  stackItemWidth: '--viz-stack-item-width',
  stackPadding: '--viz-stack-padding',
  stackRadius: '--viz-stack-radius',
  charWidth: '--viz-char-width',
  charHeight: '--viz-char-height',
  charGap: '--viz-char-gap',
  sceneGap: '--viz-scene-gap',
} as const;

const ICON_SIZE_VARS = {
  xs: '--icon-xs',
  sm: '--icon-sm',
  md: '--icon-md',
  lg: '--icon-lg',
} as const;

const ICON_STYLE_VARS = {
  duotoneOpacity: '--icon-duotone-opacity',
} as const;

const GLYPH_VARS = {
  size: '--glyph-size',
  sizeSm: '--glyph-size-sm',
  strokeWidth: '--glyph-stroke',
} as const;

export type VizSizes = Record<keyof typeof VIZ_SIZE_VARS, number>;
export type IconSize = keyof typeof ICON_SIZE_VARS;
export type GlyphStyle = Record<keyof typeof GLYPH_VARS, number>;

/** Turns `46`, `'46px'` or `'0.4'` into a number. Missing or unparsable values become 0. */
function toNumber(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) ? parsed : 0;
}

function readSizes<K extends string>(
  vars: Record<K, string>,
  values: (string | number | undefined)[],
): Record<K, number> {
  const keys = Object.keys(vars) as K[];
  return Object.fromEntries(keys.map((key, i) => [key, toNumber(values[i])])) as Record<K, number>;
}

/** Canvas sizes for the viz layer. Pass them into pure layout functions. */
export function useVizSizes(): VizSizes {
  const values = useCSSVariable(Object.values(VIZ_SIZE_VARS)) as (string | number | undefined)[];
  return readSizes(VIZ_SIZE_VARS, values);
}

/** Icon sizes in points, keyed xs / sm / md / lg. */
export function useIconSizes(): Record<IconSize, number> {
  const values = useCSSVariable(Object.values(ICON_SIZE_VARS)) as (string | number | undefined)[];
  return readSizes(ICON_SIZE_VARS, values);
}

/** Non-size icon styling (duotone second-tone opacity). */
export function useIconStyle(): Record<keyof typeof ICON_STYLE_VARS, number> {
  const values = useCSSVariable(Object.values(ICON_STYLE_VARS)) as (string | number | undefined)[];
  return readSizes(ICON_STYLE_VARS, values);
}

/** Size and stroke width of the custom topic glyphs. */
export function useGlyphStyle(): GlyphStyle {
  const values = useCSSVariable(Object.values(GLYPH_VARS)) as (string | number | undefined)[];
  return readSizes(GLYPH_VARS, values);
}

/* ------------------------------------------------------------------------------------------------
 * Theme (system / light / dark)
 * ---------------------------------------------------------------------------------------------- */

export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

/** Switch the app theme. 'system' follows the device. Persisted from Step 6.1. */
export function setThemePreference(preference: ThemePreference): void {
  Uniwind.setTheme(preference);
}

/** The user's current choice: 'system' while following the device, otherwise the forced theme. */
export function useThemePreference(): ThemePreference {
  const { theme, hasAdaptiveThemes } = useUniwind();
  if (hasAdaptiveThemes) return 'system';
  return theme === 'dark' ? 'dark' : 'light';
}
