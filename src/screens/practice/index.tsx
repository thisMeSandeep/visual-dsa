import { ScreenPlaceholder } from '../placeholder';

/** A topic's quiz (F-701). The Practice tab is screens/practice-hub. */
export function TopicPractice({ topicId }: { topicId: string }) {
  return (
    <ScreenPlaceholder
      back
      overline={topicId}
      title="Practice"
      note="Topic quizzes arrive in Step 8.1."
    />
  );
}
