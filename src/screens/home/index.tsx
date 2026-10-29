import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { memo, useCallback, useMemo } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/app-text';
import { TAB_BAR_CLEARANCE } from '@/components/floating-tab-bar';
import { TopicCard } from '@/components/topic-card';
import { topicsByCategory } from '@/content/registry';
import { CATEGORY_LABELS, type TopicCategory, type TopicMeta } from '@/content/schema';
import { topicStatus, useTopicProgress } from '@/hooks/use-topic-progress';

import { chapterCount } from '@/utils/format';

/*
 * Home is one virtualized grid (Vercel list rules): typed items, recycled per type. Topic cards
 * sit two to a row; section headers span both columns.
 */
const COLUMNS = 2;

type HomeItem =
  | { type: 'section'; key: string; category: TopicCategory; count: number }
  | { type: 'topic'; key: string; topic: TopicMeta; column: number };

function buildItems(): HomeItem[] {
  return topicsByCategory().flatMap(({ category, topics }) => [
    { type: 'section' as const, key: `section-${category}`, category, count: topics.length },
    ...topics.map((topic, index) => ({
      type: 'topic' as const,
      key: topic.id,
      topic,
      column: index % COLUMNS,
    })),
  ]);
}

/** Built once: topics are static content. */
const HOME_ITEMS = buildItems();

/**
 * Learn tab: every topic as a card, grouped by category (F-101). Each card shows its progress;
 * the Topic screen's Continue button resumes a lesson (F-104).
 */
export function Home() {
  const openTopic = useCallback((topicId: string) => {
    // A topic opens straight into its (landscape) lesson, resuming where the learner left off.
    router.push({ pathname: '/topic/[topicId]/learn', params: { topicId } });
  }, []);

  return (
    // The safe-area padding sits outside the list, so cards never scroll under the status bar.
    <View testID="home-screen" className="flex-1 bg-background pt-safe">
      <FlashList
        data={HOME_ITEMS}
        numColumns={COLUMNS}
        keyExtractor={(item) => item.key}
        getItemType={(item) => item.type}
        overrideItemLayout={(layout, item) => {
          if (item.type === 'section') layout.span = COLUMNS;
        }}
        renderItem={({ item }) =>
          item.type === 'section' ? (
            <SectionHeader category={item.category} count={item.count} />
          ) : (
            <HomeTopicCard topic={item.topic} column={item.column} onOpen={openTopic} />
          )
        }
        ListHeaderComponent={HomeHeader}
        ListFooterComponent={ListEnd}
      />
    </View>
  );
}

function HomeHeader() {
  return (
    <View className="gap-1 px-6 pt-4">
      <AppText variant="display" accessibilityRole="header">
        Learn
      </AppText>
      <AppText variant="body-sm">Data structures and algorithms, step by step.</AppText>
    </View>
  );
}

function SectionHeader({ category, count }: { category: TopicCategory; count: number }) {
  return (
    <View className="flex-row items-baseline justify-between px-6 pt-8 pb-3">
      <AppText variant="overline" accessibilityRole="header">
        {CATEGORY_LABELS[category]}
      </AppText>
      <AppText variant="label">{count === 1 ? '1 topic' : `${count} topics`}</AppText>
    </View>
  );
}

/** Half the gap between the two columns sits on each card's inner side. */
const COLUMN_PADDING = ['pl-6 pr-1.5', 'pl-1.5 pr-6'] as const;

const HomeTopicCard = memo(function HomeTopicCard({
  topic,
  column,
  onOpen,
}: {
  topic: TopicMeta;
  column: number;
  onOpen: (topicId: string) => void;
}) {
  const progress = useTopicProgress(topic.id);
  const status = useMemo(() => topicStatus(topic, progress), [topic, progress]);
  const open = useCallback(() => onOpen(topic.id), [onOpen, topic.id]);

  return (
    <View className={`pb-3 ${COLUMN_PADDING[column] ?? COLUMN_PADDING[0]}`}>
      <TopicCard
        topicId={topic.id}
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

/** Space after the last row of cards, so it scrolls clear of the floating tab bar. */
function ListEnd() {
  return <View className={TAB_BAR_CLEARANCE} />;
}
