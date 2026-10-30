import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { memo, useCallback } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { TAB_BAR_CLEARANCE } from '@/components/floating-tab-bar';
import { Icon } from '@/components/icon';
import { QuizCard } from '@/components/quiz-card';
import { TopicGlyph } from '@/components/topic-glyph';
import { config } from '@/config';
import { getTopicMeta, isTopicId, TOPIC_QUIZZES, TOPICS } from '@/content/registry';
import type { TopicMeta } from '@/content/schema';
import { useProgress } from '@/stores/progress';

import { nextUp, type NextUp } from './next-up';

/** Quiz cards sit two to a row, like Home's topic cards. */
const COLUMNS = 2;
/** Half the gap between the two columns sits on each card's inner side. */
const COLUMN_PADDING = ['pl-6 pr-1.5', 'pl-1.5 pr-6'] as const;

type QuizItem = { key: string; topic: TopicMeta; questions: number; column: number };

/** Every topic with a quiz, in Home order. Built once: quizzes are static content. */
const QUIZ_ITEMS: QuizItem[] = TOPICS.flatMap((topic) => {
  const quiz = isTopicId(topic.id) ? TOPIC_QUIZZES[topic.id] : undefined;
  return quiz ? [{ key: topic.id, topic, questions: quiz.questions.length }] : [];
}).map((item, index) => ({ ...item, column: index % COLUMNS }));

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

const openQuiz = (topicId: string) =>
  router.push({ pathname: '/topic/[topicId]/practice', params: { topicId } });

/**
 * Practice tab (F-701, F-706, F-1001): one suggestion of what to practise next, then every
 * topic's quiz as a card with its best score, two to a row like Home.
 */
export function PracticeHub() {
  return (
    <View className="flex-1 bg-background pt-safe">
      <FlashList
        data={QUIZ_ITEMS}
        numColumns={COLUMNS}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => <PracticeQuizCard item={item} />}
        ListHeaderComponent={PracticeHeader}
        ListFooterComponent={ListEnd}
      />
    </View>
  );
}

function PracticeHeader() {
  const topics = useProgress((state) => state.topics);
  const tried = QUIZ_ITEMS.filter((item) => topics[item.topic.id]?.quiz).length;

  return (
    <View>
      <View className="gap-1 px-6 pt-4">
        <AppText variant="display" accessibilityRole="header">
          Practice
        </AppText>
        <AppText variant="body-sm">Quizzes for each topic, and the questions you missed.</AppText>
      </View>
      <NextUpCard />
      <View className="flex-row items-baseline justify-between px-6 pt-8 pb-3">
        <AppText variant="overline" accessibilityRole="header">
          Topic quizzes
        </AppText>
        <AppText variant="label">
          {tried} of {QUIZ_ITEMS.length} tried
        </AppText>
      </View>
    </View>
  );
}

/** The one thing to practise next, with a button to start it. */
function NextUpCard() {
  const revise = useProgress((state) => state.revise);
  const topics = useProgress((state) => state.topics);
  const next = nextUp(
    revise,
    QUIZ_ITEMS.map((item) => ({
      topicId: item.topic.id,
      questions: item.questions,
      score: topics[item.topic.id]?.quiz,
    })),
  );
  const { title, detail, action, glyphs } = describe(next);

  return (
    <View className="mx-6 mt-6 gap-4 rounded-xl border-hairline border-line-strong bg-surface-raised p-5">
      <View className="flex-row items-start gap-4">
        <View className="flex-1 gap-1">
          <AppText variant="overline" weight="bold" tone="mode-practice-ink">
            Next up
          </AppText>
          <AppText variant="headline" accessibilityRole="header">
            {title}
          </AppText>
          <AppText variant="body-sm">{detail}</AppText>
        </View>
        {glyphs.length > 0 ? (
          <View className="flex-row gap-1.5 pt-1">
            {glyphs.map((topic) => (
              <TopicGlyph key={topic.id} glyph={topic.glyph} category={topic.category} />
            ))}
          </View>
        ) : (
          <View className="pt-1">
            <Icon name="done" size="md" tone="success" />
          </View>
        )}
      </View>
      {action ? (
        <Button label={action.label} icon="play" iconWeight="fill" onPress={action.onPress} />
      ) : null}
    </View>
  );
}

/** The Next up card's words, its glyphs, and its button. */
function describe(next: NextUp): {
  title: string;
  detail: string;
  action?: { label: string; onPress: () => void };
  glyphs: TopicMeta[];
} {
  const metas = (ids: readonly string[]) =>
    ids.flatMap((id) => {
      const meta = getTopicMeta(id);
      return meta ? [meta] : [];
    });
  switch (next.kind) {
    case 'revise': {
      const named = metas(next.topicIds);
      const shown = named.slice(0, config.practice.revisePreviewCount);
      const more = named.length - shown.length;
      return {
        title: `Revise ${plural(next.count, 'missed question', 'missed questions')}`,
        detail: shown.map((meta) => meta.title).join(' · ') + (more > 0 ? ` and ${more} more` : ''),
        action: { label: 'Start', onPress: () => router.push('/revise') },
        glyphs: shown,
      };
    }
    case 'try': {
      const [meta] = metas([next.topicId]);
      return {
        title: `Try the ${meta?.title ?? ''} quiz`,
        detail: `${plural(next.questions, 'question', 'questions')} you haven’t tried yet.`,
        action: { label: 'Start', onPress: () => openQuiz(next.topicId) },
        glyphs: meta ? [meta] : [],
      };
    }
    case 'improve': {
      const [meta] = metas([next.topicId]);
      return {
        title: `Beat your ${next.best}/${next.total} in ${meta?.title ?? ''}`,
        detail: 'Your lowest score so far. Missed questions go on your revise list.',
        action: { label: 'Try again', onPress: () => openQuiz(next.topicId) },
        glyphs: meta ? [meta] : [],
      };
    }
    case 'all-perfect':
      return {
        title: 'Every quiz is perfect',
        detail: 'Retake any quiz below to keep it fresh.',
        glyphs: [],
      };
  }
}

const PracticeQuizCard = memo(function PracticeQuizCard({ item }: { item: QuizItem }) {
  const score = useProgress((state) => state.topics[item.topic.id]?.quiz);
  const open = useCallback(() => openQuiz(item.topic.id), [item.topic.id]);
  return (
    <View className={`pb-3 ${COLUMN_PADDING[item.column] ?? COLUMN_PADDING[0]}`}>
      <QuizCard
        topicId={item.topic.id}
        title={item.topic.title}
        glyph={item.topic.glyph}
        category={item.topic.category}
        questions={item.questions}
        score={score}
        onPress={open}
      />
    </View>
  );
});

/** Space after the last row of cards, so it scrolls clear of the floating tab bar. */
function ListEnd() {
  return <View className={TAB_BAR_CLEARANCE} />;
}
