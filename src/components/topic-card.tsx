import { View } from 'react-native';

import type { TopicCategory } from '@/content/schema';

import { AppText } from './app-text';
import { Icon } from './icon';
import { PressableScale } from './pressable-scale';
import { ProgressBar } from './progress-bar';
import { TopicArt } from './topic-art';
import type { TopicStatus } from './topic-row';

export type TopicCardProps = {
  topicId: string;
  title: string;
  /** e.g. "6 chapters" */
  subtitle: string;
  glyph: string;
  category: TopicCategory;
  status: TopicStatus;
  onPress?: () => void;
};

function statusText(status: TopicStatus): string {
  return status.kind === 'done' ? 'completed' : `${status.done} of ${status.total} chapters done`;
}

/**
 * Home's topic card (VISUAL-SPEC §6 "Topic card"): the topic's line drawing on a soft panel,
 * then its title and progress, inside a hairline outline. Two to a row.
 */
export function TopicCard({
  topicId,
  title,
  subtitle,
  glyph,
  category,
  status,
  onPress,
}: TopicCardProps) {
  const started = status.kind === 'progress' && (status.done > 0 || status.current === true);

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${subtitle}, ${statusText(status)}`}
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
        <View className="h-4.5 flex-row items-center gap-2">
          {status.kind === 'done' ? (
            <>
              <Icon name="done" size="xs" tone="success" />
              <AppText variant="label" tone="success-ink">
                Completed
              </AppText>
            </>
          ) : started ? (
            <>
              <ProgressBar value={status.done / status.total} className="flex-1" />
              <AppText variant="index">
                {status.done}/{status.total}
              </AppText>
            </>
          ) : (
            <AppText variant="label">{subtitle}</AppText>
          )}
        </View>
      </View>
    </PressableScale>
  );
}
