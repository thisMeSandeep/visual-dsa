import { router } from 'expo-router';
import { useState } from 'react';

import { isTopicId, TOPIC_QUIZZES } from '@/content/registry';
import { useProgress } from '@/stores/progress';

import { ScreenPlaceholder } from '../placeholder';
import { seeInLesson } from '.';
import { QuizRunner, type QuizItem } from './quiz-runner';

/** The revise-list questions that still exist in content, oldest first. */
function reviseItems(): QuizItem[] {
  return useProgress.getState().revise.flatMap(({ topicId, questionId }) => {
    const question = isTopicId(topicId)
      ? TOPIC_QUIZZES[topicId]?.questions.find((q) => q.id === questionId)
      : undefined;
    return question ? [{ topicId, question }] : [];
  });
}

/**
 * Revise (F-706): the questions answered wrongly, across topics. A right answer takes a
 * question off the list. The set is fixed when the screen opens, so it doesn't shrink mid-run.
 */
export function Revise() {
  const [items] = useState(reviseItems);

  if (items.length === 0) {
    return (
      <ScreenPlaceholder
        back
        title="Revise"
        note="Nothing to revise. Questions you miss in a quiz appear here, ready to try again."
      />
    );
  }

  const { recordAnswer } = useProgress.getState();
  return (
    <QuizRunner
      overline="Revise"
      items={items}
      onAnswer={(item, correct) => recordAnswer(item.topicId, item.question.id, correct)}
      onSeeInLesson={seeInLesson}
      onClose={() => router.back()}
    />
  );
}
