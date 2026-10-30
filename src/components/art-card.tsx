import type { ReactNode } from 'react';
import { View } from 'react-native';

import type { TopicCategory } from '@/content/schema';

import { AppText } from './app-text';
import { PressableScale } from './pressable-scale';
import { TopicArt } from './topic-art';

export type ArtCardProps = {
  topicId: string;
  title: string;
  glyph: string;
  category: TopicCategory;
  /** What the whole card reads as, since it's one button. */
  accessibilityLabel: string;
  onPress?: () => void;
  /** The line under the title: progress on Home, a score on Practice. */
  children: ReactNode;
};

/**
 * The topic card's anatomy (VISUAL-SPEC §6 "Topic card"): the topic's line drawing on a soft
 * panel, then its title and one line of status, inside a hairline outline. Two to a row. Home's
 * TopicCard and Practice's QuizCard fill in the status line.
 */
export function ArtCard({
  topicId,
  title,
  glyph,
  category,
  accessibilityLabel,
  onPress,
  children,
}: ArtCardProps) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      contentClassName="overflow-hidden rounded-xl border-hairline border-line-strong bg-surface-raised"
    >
      <View className="aspect-8/5 bg-surface p-3">
        <TopicArt topicId={topicId} category={category} glyph={glyph} />
      </View>
      <View className="gap-2 border-t-hairline border-line px-3.5 pt-3 pb-3.5">
        {/* Two lines reserved, so cards in a row line up whatever the title length. */}
        <AppText variant="body" weight="bold" numberOfLines={2} className="min-h-13">
          {title}
        </AppText>
        <View className="h-4.5 flex-row items-center gap-2">{children}</View>
      </View>
    </PressableScale>
  );
}
