import { Pressable, View } from 'react-native';

import { AppText } from './app-text';
import { Icon } from './icon';
import { TopicGlyph, type TopicCategory } from './topic-glyph';

export type TopicStatus =
  | { kind: 'done' }
  /** `current` marks the topic the learner is in the middle of. */
  | { kind: 'progress'; done: number; total: number; current?: boolean };

export type TopicRowProps = {
  title: string;
  /** e.g. "5 chapters" */
  subtitle: string;
  /** Glyph name from content (validated by `bun run validate:content`). */
  glyph: string;
  category: TopicCategory;
  status: TopicStatus;
  onPress?: () => void;
};

function statusText(status: TopicStatus): string {
  return status.kind === 'done' ? 'completed' : `${status.done} of ${status.total} chapters done`;
}

/**
 * Home-screen topic row (VISUAL-SPEC §6). Full width, so it highlights its background when
 * pressed instead of scaling. No dividers: rows are separated by space.
 */
export function TopicRow({ title, subtitle, glyph, category, status, onPress }: TopicRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${subtitle}, ${statusText(status)}`}
      onPress={onPress}
      className="-mx-3 min-h-15.5 flex-row items-center gap-4 rounded-md px-3 active:bg-surface"
    >
      <TopicGlyph glyph={glyph} category={category} />
      <View className="flex-1 gap-0.5">
        <AppText variant="body" weight="medium">
          {title}
        </AppText>
        <AppText variant="label">{subtitle}</AppText>
      </View>
      <TopicRowStatus status={status} />
    </Pressable>
  );
}

function TopicRowStatus({ status }: { status: TopicStatus }) {
  if (status.kind === 'done') {
    return <Icon name="done" size="sm" tone="success" />;
  }
  const fraction = `${status.done}/${status.total}`;
  if (status.current) {
    return (
      <View className="flex-row items-center gap-2">
        <View className="h-2 w-2 rounded-full bg-primary" />
        <AppText variant="value" weight="regular">
          {fraction}
        </AppText>
      </View>
    );
  }
  return (
    <AppText variant="value" weight="regular" tone="muted">
      {fraction}
    </AppText>
  );
}
