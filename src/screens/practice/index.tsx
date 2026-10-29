import { router } from 'expo-router';
import { useState } from 'react';

import { getTopicMeta, isTopicId, TOPIC_QUIZZES } from '@/content/registry';
import { useProgress } from '@/stores/progress';

import { ScreenPlaceholder } from '../placeholder';
import { QuizRunner, type QuizItem } from './quiz-runner';

/** Opens the lesson at a question's chapter (F-705). */
export const seeInLesson = ({ topicId, question }: QuizItem) =>
  router.push({
    pathname: '/topic/[topicId]/learn',
    params: question.chapterId ? { topicId, chapter: question.chapterId } : { topicId },
  });

/**
 * A topic's quiz (F-701, F-704, F-705, F-706). Every answer updates the revise list, and the
 * score is saved when the quiz ends. The Practice tab is screens/practice-hub.
 */
export function TopicPractice({ topicId }: { topicId: string }) {
  const meta = getTopicMeta(topicId);
  const quiz = isTopicId(topicId) ? TOPIC_QUIZZES[topicId] : undefined;
  const [items] = useState<QuizItem[]>(
    () => quiz?.questions.map((question) => ({ topicId, question })) ?? [],
  );

  if (!meta) {
    return <ScreenPlaceholder back title="Topic not found" note="This quiz doesn’t exist." />;
  }
  if (!quiz) {
    return (
      <ScreenPlaceholder
        back
        overline={meta.title}
        title="Practice"
        note="This quiz arrives with its topic. The Stack quiz is ready to try now."
      />
    );
  }

  const { recordAnswer, recordQuizScore } = useProgress.getState();
  return (
    <QuizRunner
      overline={meta.title}
      items={items}
      onAnswer={(item, correct) => recordAnswer(item.topicId, item.question.id, correct)}
      onFinish={(correct, total) => recordQuizScore(topicId, correct, total)}
      onSeeInLesson={seeInLesson}
      onClose={() => router.back()}
    />
  );
}
