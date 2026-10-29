import Svg, { Path } from 'react-native-svg';

import { useColor, useGlyphStyle, type ColorToken } from '@/theme';

import { GLYPHS, GLYPH_VIEWBOX, type GlyphName } from './glyphs';

export { GLYPH_NAMES, type GlyphName } from './glyphs';

/** Topic categories (ALGORITHM-CATALOG §1). Each has its own glyph colour. */
export type TopicCategory =
  'foundations' | 'linear' | 'hashing' | 'trees' | 'graphs' | 'algorithms';

const CATEGORY_TONE: Record<TopicCategory, ColorToken> = {
  foundations: 'cat-foundations',
  linear: 'cat-linear',
  hashing: 'cat-hashing',
  trees: 'cat-trees',
  graphs: 'cat-graphs',
  algorithms: 'cat-algorithms',
};

export type TopicGlyphProps = {
  glyph: GlyphName;
  category: TopicCategory;
};

/** A topic's structure drawn as a line glyph in its category colour. No background tile. */
export function TopicGlyph({ glyph, category }: TopicGlyphProps) {
  const color = useColor(CATEGORY_TONE[category]);
  const { size, strokeWidth } = useGlyphStyle();

  return (
    <Svg
      width={size}
      height={size}
      viewBox={GLYPH_VIEWBOX}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {GLYPHS[glyph].map((d) => (
        <Path key={d} d={d} />
      ))}
    </Svg>
  );
}
