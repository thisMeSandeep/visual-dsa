import { useFont, type SkFont } from '@shopify/react-native-skia';

import { useVizSizes } from '@/theme';
import { FONT_FILES } from '@/theme/fonts';

export type VizFonts = Record<'value' | 'detail' | 'label' | 'index', SkFont>;

/**
 * The canvas's fonts: the same mono files the UI uses (loaded through Skia,
 * which needs its own font objects), at the --viz-font-* token sizes. Null until all are loaded.
 */
export function useVizFonts(): VizFonts | null {
  const sizes = useVizSizes();
  const value = useFont(FONT_FILES['app-mono-medium'], sizes.fontValue);
  const detail = useFont(FONT_FILES['app-mono'], sizes.fontDetail);
  const label = useFont(FONT_FILES['app-mono-medium'], sizes.fontLabel);
  const index = useFont(FONT_FILES['app-mono'], sizes.fontIndex);

  if (!value || !detail || !label || !index) return null;
  return { value, detail, label, index };
}

/** Distance from a text block's vertical centre to its baseline. */
export function centredBaseline(font: SkFont): number {
  const { ascent, descent } = font.getMetrics();
  return -(ascent + descent) / 2;
}
