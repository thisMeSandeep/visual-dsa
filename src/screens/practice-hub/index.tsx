import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { TAB_BAR_CLEARANCE } from '@/components/floating-tab-bar';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { TopicGlyph } from '@/components/topic-glyph';
import { config } from '@/config';
import { getTopicMeta, isTopicId, TOPIC_QUIZZES, TOPICS } from '@/content/registry';
import { useProgress } from '@/stores/progress';

/** Practice tab (F-701, F-706): the revise list first, then every topic's quiz. */
export function PracticeHub() {
  return (
    <View className="flex-1 bg-background pt-safe">
      <ScrollView
        className="flex-1"
        contentContainerClassName={`gap-7 px-6 pt-4 ${TAB_BAR_CLEARANCE}`}
      >
        <View className="gap-1">
          <AppText variant="display" accessibilityRole="header">
            Practice
          </AppText>
          <AppText variant="body-sm">Quizzes for each topic, and the questions you missed.</AppText>
        </View>
        <ReviseCard />
        <TopicQuizzes />
      </ScrollView>
    </View>
  );
}

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

/** The revise list (F-706): how many questions wait, a few of them, and a button to start. */
function ReviseCard() {
  const revise = useProgress((state) => state.revise);
  const prompts = revise.flatMap(({ topicId, questionId }) => {
    const question = isTopicId(topicId)
      ? TOPIC_QUIZZES[topicId]?.questions.find((q) => q.id === questionId)
      : undefined;
    return question ? [{ key: `${topicId}/${questionId}`, topicId, prompt: question.prompt }] : [];
  });
  const shown = prompts.slice(0, config.practice.revisePreviewCount);
  const more = prompts.length - shown.length;

  return (
    <View className="gap-4 rounded-xl border-hairline border-line-strong bg-surface-raised p-5">
      <View className="gap-1">
        <AppText variant="overline" accessibilityRole="header">
          Revise
        </AppText>
        <AppText variant="headline">
          {prompts.length === 0
            ? 'Nothing to revise'
            : plural(prompts.length, 'question to revise', 'questions to revise')}
        </AppText>
      </View>
      {prompts.length === 0 ? (
        <AppText variant="body-sm">
          Questions you miss in a quiz appear here, ready to try again.
        </AppText>
      ) : (
        <>
          <View className="gap-2">
            {shown.map((item) => (
              <View key={item.key} className="flex-row gap-2">
                <AppText variant="label">{getTopicMeta(item.topicId)?.title}</AppText>
                <AppText variant="body-sm" numberOfLines={1} className="flex-1">
                  {item.prompt}
                </AppText>
              </View>
            ))}
            {more > 0 ? <AppText variant="label">and {more} more</AppText> : null}
          </View>
          <Button
            label="Revise now"
            icon="play"
            iconWeight="fill"
            onPress={() => router.push('/revise')}
          />
        </>
      )}
    </View>
  );
}

/**
 * Every topic with a quiz, with its best score so far on the right (F-1001): green when it's
 * perfect, a dash before the first try.
 */
function TopicQuizzes() {
  const topics = useProgress((state) => state.topics);
  const withQuiz = TOPICS.flatMap((meta) => {
    const quiz = isTopicId(meta.id) ? TOPIC_QUIZZES[meta.id] : undefined;
    return quiz ? [{ meta, count: quiz.questions.length }] : [];
  });

  return (
    <View className="gap-2">
      <AppText variant="overline" accessibilityRole="header">
        Topic quizzes
      </AppText>
      <View className="gap-3">
        {withQuiz.map(({ meta, count }) => {
          const score = topics[meta.id]?.quiz;
          const questions = plural(count, 'question', 'questions');
          const perfect = score !== undefined && score.best === score.total;
          return (
            <PressableScale
              key={meta.id}
              accessibilityRole="button"
              accessibilityLabel={`${meta.title} quiz, ${questions}, ${
                score ? `best score ${score.best} of ${score.total}` : 'not tried yet'
              }`}
              onPress={() =>
                router.push({ pathname: '/topic/[topicId]/practice', params: { topicId: meta.id } })
              }
              contentClassName="flex-row items-center gap-4 rounded-xl border-hairline border-line-strong bg-surface-raised px-4 py-4"
            >
              <TopicGlyph glyph={meta.glyph} category={meta.category} />
              <View className="flex-1 gap-0.5">
                <AppText variant="body" weight="bold">
                  {meta.title}
                </AppText>
                <AppText variant="label">{questions}</AppText>
              </View>
              <View className="items-end gap-0.5">
                <AppText variant="value" tone={perfect ? 'success-ink' : score ? 'ink' : 'muted'}>
                  {score ? `${score.best}/${score.total}` : '–'}
                </AppText>
                <AppText variant="label">{score ? 'best' : 'not tried'}</AppText>
              </View>
              <Icon name="step-forward" size="sm" tone="muted" />
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}
