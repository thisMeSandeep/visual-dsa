import type { TopicCategory } from '@/content/schema';

import { AppText } from './app-text';
import { ArtCard } from './art-card';
import { Icon } from './icon';
import { ProgressBar } from './progress-bar';
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
 * Home's topic card (VISUAL-SPEC §6 "Topic card"): an ArtCard whose status line shows the
 * topic's lesson progress.
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
    <ArtCard
      topicId={topicId}
      title={title}
      glyph={glyph}
      category={category}
      accessibilityLabel={`${title}, ${subtitle}, ${statusText(status)}`}
      {...(onPress ? { onPress } : {})}
    >
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
    </ArtCard>
  );
}
