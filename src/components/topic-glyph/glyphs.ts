/**
 * Artwork for the custom topic glyphs (VISUAL-SPEC §5): line drawings on a 24 × 24 grid that
 * show each structure itself. Stroke colour, width and drawn size come from the theme; only the
 * shapes live here, as SVG path data. Rounded boxes have a corner radius of 1.
 */
export const GLYPH_VIEWBOX = '0 0 24 24';

export const GLYPHS = {
  'big-o': ['M3 3v18h18', 'M5 18.5C11 18.5 15.5 15 19 5', 'M5 18.5L20 12.5'],
  array: [
    'M2.5 9h2.5a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-2.5a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1z',
    'M8 9h2.5a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-2.5a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1z',
    'M13.5 9h2.5a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-2.5a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1z',
    'M19 9h2.5a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-2.5a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1z',
  ],
  'linked-list': [
    'M2.5 9.5h3a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1z',
    'M10.5 9.5h3a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1z',
    'M18.5 9.5h3a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1z',
    'M6.5 12h3M14.5 12h3',
  ],
  stack: [
    'M6 3.5h12a1 1 0 0 1 1 1v2.5a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1v-2.5a1 1 0 0 1 1 -1z',
    'M6 10h12a1 1 0 0 1 1 1v2.5a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1v-2.5a1 1 0 0 1 1 -1z',
    'M6 16.5h12a1 1 0 0 1 1 1v2.5a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1v-2.5a1 1 0 0 1 1 -1z',
  ],
  queue: [
    'M2 9h3a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1z',
    'M8.5 9h3a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1z',
    'M15 9h3a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1z',
    'M20.5 12h2.5M21.5 10.5l1.5 1.5l-1.5 1.5',
  ],
  'hash-table': [
    'M3 3h4a1 1 0 0 1 1 1v2.5a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2.5a1 1 0 0 1 1 -1z',
    'M3 9.75h4a1 1 0 0 1 1 1v2.5a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2.5a1 1 0 0 1 1 -1z',
    'M3 16.5h4a1 1 0 0 1 1 1v2.5a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2.5a1 1 0 0 1 1 -1z',
    'M8 12h5',
    'M14 9.75h7a1 1 0 0 1 1 1v2.5a1 1 0 0 1 -1 1h-7a1 1 0 0 1 -1 -1v-2.5a1 1 0 0 1 1 -1z',
  ],
} as const;

export type GlyphName = keyof typeof GLYPHS;
export const GLYPH_NAMES = Object.keys(GLYPHS) as GlyphName[];
