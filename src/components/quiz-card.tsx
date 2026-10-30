import type { TopicCategory } from '@/content/schema';

import { AppText } from './app-text';
import { ArtCard } from './art-card';
import { Icon } from './icon';
import { ProgressBar } from './progress-bar';

export type QuizCardProps = {
  topicId: string;
  title: string;
  glyph: string;
  category: TopicCategory;
  /** Questions in the quiz. */
  questions: number;
  /** The best finished attempt, if any. */
  score?: { best: number; total: number } | undefined;
  onPress?: () => void;
};

const questionCount = (count: number) => `${count} ${count === 1 ? 'question' : 'questions'}`;

/**
 * Practice's quiz card: an ArtCard (like Home's topic cards) whose status line shows the best
 * score as a bar and "8/10"; full marks read "Perfect" in green; an untried quiz shows its size.
 */
export function QuizCard({
  topicId,
  title,
  glyph,
  category,
  questions,
  score,
  onPress,
}: QuizCardProps) {
  const perfect = score !== undefined && score.best === score.total;
  const label = `${title} quiz, ${questionCount(questions)}, ${
    score ? `best score ${score.best} of ${score.total}` : 'not tried yet'
  }`;

  return (
    <ArtCard
      topicId={topicId}
      title={title}
      glyph={glyph}
      category={category}
      accessibilityLabel={label}
      {...(onPress ? { onPress } : {})}
    >
      {perfect ? (
        <>
          <Icon name="done" size="xs" tone="success" />
          <AppText variant="label" tone="success-ink">
            Perfect {score.best}/{score.total}
          </AppText>
        </>
      ) : score ? (
        <>
          <ProgressBar value={score.best / score.total} className="flex-1" />
          <AppText variant="index">
            {score.best}/{score.total}
          </AppText>
        </>
      ) : (
        <AppText variant="label">{questionCount(questions)}</AppText>
      )}
    </ArtCard>
  );
}
