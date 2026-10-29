import { FlashList } from '@shopify/flash-list';
import { Link, router } from 'expo-router';
import { memo, useCallback, useMemo } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { ContinueCard } from '@/components/continue-card';
import { TopicRow } from '@/components/topic-row';
import { TOPICS, topicsByCategory } from '@/content/registry';
import { CATEGORY_LABELS, type TopicCategory, type TopicMeta } from '@/content/schema';
import { topicStatus, useTopicProgress } from '@/hooks/use-topic-progress';

import { chapterCount } from '@/utils/format';

/* Home is one virtualized list (Vercel list rules): typed items, recycled per type. */
type HomeItem =
  | { type: 'section'; key: string; category: TopicCategory }
  | { type: 'topic'; key: string; topic: TopicMeta };

function buildItems(): HomeItem[] {
  return topicsByCategory().flatMap(({ category, topics }) => [
    { type: 'section' as const, key: `section-${category}`, category },
    ...topics.map((topic) => ({ type: 'topic' as const, key: topic.id, topic })),
  ]);
}

/** Built once: topics are static content. */
const HOME_ITEMS = buildItems();

/** Learn tab: where to start or continue, then every topic grouped by category (F-101, F-104). */
export function Home() {
  const openTopic = useCallback((topicId: string) => {
    router.push({ pathname: '/topic/[topicId]', params: { topicId } });
  }, []);

  return (
    <View testID="home-screen" className="flex-1 bg-background">
      <FlashList
        data={HOME_ITEMS}
        keyExtractor={(item) => item.key}
        getItemType={(item) => item.type}
        renderItem={({ item }) =>
          item.type === 'section' ? (
            <SectionHeader category={item.category} />
          ) : (
            <HomeTopicRow topic={item.topic} onOpen={openTopic} />
          )
        }
        ListHeaderComponent={HomeHeader}
        ListFooterComponent={__DEV__ ? DevLinks : null}
      />
    </View>
  );
}

function HomeHeader() {
  return (
    <View className="gap-7 px-6 pt-safe-offset-4">
      <AppText variant="display" accessibilityRole="header">
        Learn
      </AppText>
      <StartCard />
    </View>
  );
}

/**
 * "Start here" points at the first topic until there's progress; then it becomes the
 * Continue card (Step 6.2).
 */
function StartCard() {
  const first = TOPICS[0];
  if (!first) return null;

  return (
    <ContinueCard
      overline="Start here"
      actionLabel="Start"
      title={first.title}
      position={`${chapterCount(first.chapters.length)} · ${first.summary}`}
      progress={0}
      accessibilityHint="Opens the first lesson"
      onPress={() =>
        router.push({ pathname: '/topic/[topicId]/learn', params: { topicId: first.id } })
      }
    />
  );
}

function SectionHeader({ category }: { category: TopicCategory }) {
  return (
    <View className="px-6 pt-7 pb-1.5">
      <AppText variant="overline" accessibilityRole="header">
        {CATEGORY_LABELS[category]}
      </AppText>
    </View>
  );
}

const HomeTopicRow = memo(function HomeTopicRow({
  topic,
  onOpen,
}: {
  topic: TopicMeta;
  onOpen: (topicId: string) => void;
}) {
  const progress = useTopicProgress(topic.id);
  const status = useMemo(() => topicStatus(topic, progress), [topic, progress]);
  const open = useCallback(() => onOpen(topic.id), [onOpen, topic.id]);

  return (
    <View className="px-6">
      <TopicRow
        title={topic.title}
        subtitle={chapterCount(topic.chapters.length)}
        glyph={topic.glyph}
        category={topic.category}
        status={status}
        onPress={open}
      />
    </View>
  );
});

/** Development-only shortcuts to the design showcases. */
function DevLinks() {
  return (
    <View className="gap-3 px-6 pt-7 pb-6">
      <AppText variant="overline">Development</AppText>
      <Link href="/dev/tokens" asChild>
        <Button label="Design tokens" variant="tinted" size="compact" />
      </Link>
      <Link href="/dev/components" asChild>
        <Button label="Components" variant="tinted" size="compact" />
      </Link>
    </View>
  );
}
