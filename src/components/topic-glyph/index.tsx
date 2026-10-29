import Svg, { Path } from 'react-native-svg';

import type { TopicCategory } from '@/content/schema';
import { useColor, useGlyphStyle, type ColorToken } from '@/theme';

import type { TextTone } from '../app-text';
import { GLYPHS, GLYPH_NAMES, GLYPH_VIEWBOX, type GlyphName } from './glyphs';

export { GLYPH_NAMES, type GlyphName } from './glyphs';
export type { TopicCategory };

/** Each topic category's glyph colour (VISUAL-SPEC §2.3). */
export const CATEGORY_TONE: Record<TopicCategory, ColorToken> = {
  foundations: 'cat-foundations',
  linear: 'cat-linear',
  hashing: 'cat-hashing',
  trees: 'cat-trees',
  graphs: 'cat-graphs',
  algorithms: 'cat-algorithms',
};

/** Text-safe version of each category colour, for overlines next to a glyph. */
export const CATEGORY_TEXT_TONE: Record<TopicCategory, TextTone> = {
  foundations: 'cat-foundations-ink',
  linear: 'cat-linear-ink',
  hashing: 'cat-hashing-ink',
  trees: 'cat-trees-ink',
  graphs: 'cat-graphs-ink',
  algorithms: 'cat-algorithms-ink',
};

const isGlyphName = (name: string): name is GlyphName =>
  (GLYPH_NAMES as readonly string[]).includes(name);

export type TopicGlyphProps = {
  /** Glyph name from content (validated by `bun run validate:content`). */
  glyph: string;
  category: TopicCategory;
  /** md (30) in topic rows, sm (18) next to a category overline. */
  size?: 'md' | 'sm';
};

/** A topic's structure drawn as a line glyph in its category colour. No background tile. */
export function TopicGlyph({ glyph, category, size = 'md' }: TopicGlyphProps) {
  const color = useColor(CATEGORY_TONE[category]);
  const style = useGlyphStyle();
  const side = size === 'sm' ? style.sizeSm : style.size;

  if (!isGlyphName(glyph)) return null;

  return (
    <Svg
      width={side}
      height={side}
      viewBox={GLYPH_VIEWBOX}
      fill="none"
      stroke={color}
      strokeWidth={style.strokeWidth}
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
