import Svg from 'react-native-svg';

import type { TopicCategory } from '@/content/schema';
import { useArtStyle, useColors } from '@/theme';
import { SVG_MONO_FONT } from '@/theme/fonts';

import { CATEGORY_TONE, TopicGlyph } from '../topic-glyph';
import { ART_VIEWBOX, DRAWINGS } from './drawings';

export type TopicArtProps = {
  topicId: string;
  /** Used for the accent colour, and for the fallback glyph when a topic has no drawing yet. */
  category: TopicCategory;
  glyph: string;
};

/**
 * A topic's line drawing (VISUAL-SPEC §6 "Topic card"), scaled to fill its container while
 * keeping its proportions. Topics without a drawing yet show their glyph instead.
 */
export function TopicArt({ topicId, category, glyph }: TopicArtProps) {
  const style = useArtStyle();
  const tone = CATEGORY_TONE[category];
  const colors = useColors(['ink-2', 'muted', 'surface-raised', tone]);
  const drawing = DRAWINGS[topicId];

  if (!drawing) return <TopicGlyph glyph={glyph} category={category} />;

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox={ART_VIEWBOX}
      fill="none"
      strokeWidth={style.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={false}
    >
      {drawing({
        ink: colors['ink-2'],
        muted: colors.muted,
        accent: colors[tone],
        cell: colors['surface-raised'],
        font: SVG_MONO_FONT,
        fontSize: style.fontSize,
      })}
    </Svg>
  );
}

export { DRAWINGS };
