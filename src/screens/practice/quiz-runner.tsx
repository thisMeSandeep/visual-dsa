import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { FeedbackPanel } from '@/components/feedback-panel';
import { IconButton } from '@/components/icon-button';
import { OptionTile, type OptionLayout, type OptionState } from '@/components/option-tile';
import { SegmentedProgress } from '@/components/progress-bar';
import { config } from '@/config';
import {
  answerOf,
  choicesOf,
  isCorrect,
  QUESTION_KIND_LABELS,
  type QuizChoice,
} from '@/content/quiz';
import type { Question } from '@/content/schema';

import { answerQuestion, currentQuestion, nextQuestion, startQuiz } from './quiz-session';

/** A question and the topic it belongs to (a revise session mixes topics). */
export type QuizItem = { topicId: string; question: Question };

export type QuizRunnerProps = {
  /** Small label above each question, e.g. the topic name or "Revise". */
  overline: string;
  items: readonly QuizItem[];
  /** Each answer as it's given, e.g. to update the revise list. */
  onAnswer: (item: QuizItem, correct: boolean) => void;
  /** The run is over: the score and what was missed. */
  onFinish?: (correct: number, total: number) => void;
  /** Opens the lesson at the question's chapter (F-705). */
  onSeeInLesson: (item: QuizItem) => void;
  onClose: () => void;
};

/** Short answers are big tiles two to a row; anything longer is a list (config.practice). */
function layoutFor(question: Question, choices: readonly QuizChoice[]): OptionLayout {
  if (question.kind === 'true-false') return 'word';
  const short = choices.every(
    (choice) => choice.text.length <= config.practice.tileAnswerMaxLength,
  );
  return short ? 'value' : 'text';
}

const rowsOf = <T,>(items: readonly T[], perRow: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / perRow) }, (_, row) =>
    items.slice(row * perRow, row * perRow + perRow),
  );

function stateFor(question: Question, choice: string | undefined, option: string): OptionState {
  if (choice === undefined) return 'idle';
  if (option === answerOf(question)) return 'correct';
  return option === choice ? 'wrong' : 'faded';
}

/**
 * Runs a set of questions (VISUAL-SPEC §11 "Practice"): segmented progress, the question with
 * its optional context block, option tiles, then a feedback panel that explains the answer and
 * links to the lesson; a results view at the end.
 */
export function QuizRunner({
  overline,
  items,
  onAnswer,
  onFinish,
  onSeeInLesson,
  onClose,
}: QuizRunnerProps) {
  const questions = items.map((item) => item.question);
  const [session, setSession] = useState(() => startQuiz(questions));
  const question = currentQuestion(session);
  const item = items[session.index];

  if (session.done || !question || !item) {
    return (
      <Results
        overline={overline}
        correct={session.correct}
        total={questions.length}
        missed={session.missed}
        onAgain={() => setSession(startQuiz(questions))}
        onClose={onClose}
      />
    );
  }

  const choices = choicesOf(question);
  const layout = layoutFor(question, choices);
  const answered = session.choice !== undefined;
  const right = session.choice !== undefined && isCorrect(question, session.choice);
  const last = session.index === questions.length - 1;

  const choose = (choiceId: string) => {
    if (answered) return;
    setSession(answerQuestion(session, choiceId));
    onAnswer(item, isCorrect(question, choiceId));
  };
  const next = () => {
    const after = nextQuestion(session);
    if (after.done) onFinish?.(after.correct, questions.length);
    setSession(after);
  };

  return (
    <View className="flex-1 bg-background pt-safe">
      <View className="flex-row items-center gap-3 px-3">
        <IconButton icon="close" label="Close quiz" onPress={onClose} />
        <SegmentedProgress
          total={questions.length}
          done={session.index + (answered ? 1 : 0)}
          accessibilityLabel={`Question ${session.index + 1} of ${questions.length}`}
          className="flex-1"
        />
        <AppText variant="index" className="pr-3">
          {session.index + 1}/{questions.length}
        </AppText>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-6 pt-6 pb-6">
        <View className="gap-2">
          <AppText variant="overline">
            {overline} · {QUESTION_KIND_LABELS[question.kind]}
          </AppText>
          <AppText variant="title" accessibilityRole="header">
            {question.prompt}
          </AppText>
        </View>

        {question.context ? (
          <View className="rounded-md bg-surface px-4 py-3">
            <AppText variant="value" weight="regular">
              {question.context}
            </AppText>
          </View>
        ) : null}

        {/* Tiles sit two to a row; sentences take a row each. */}
        <View accessibilityRole="radiogroup" className="gap-3">
          {rowsOf(choices, layout === 'text' ? 1 : 2).map((row) => (
            <View key={row.map((option) => option.id).join()} className="flex-row gap-3">
              {row.map((option) => (
                <OptionTile
                  key={option.id}
                  text={option.text}
                  layout={layout}
                  state={stateFor(question, session.choice, option.id)}
                  disabled={answered}
                  onPress={() => choose(option.id)}
                  className="flex-1"
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {answered ? (
        <View className="px-4 pb-safe-offset-4">
          <FeedbackPanel
            result={right ? 'correct' : 'incorrect'}
            title={right ? 'Correct' : 'Not quite'}
            explanation={question.explanation}
            actionLabel={last ? 'See results' : 'Continue'}
            onAction={next}
            {...(question.chapterId
              ? { secondaryLabel: 'See in lesson', onSecondary: () => onSeeInLesson(item) }
              : {})}
          />
        </View>
      ) : null}
    </View>
  );
}

function Results({
  overline,
  correct,
  total,
  missed,
  onAgain,
  onClose,
}: {
  overline: string;
  correct: number;
  total: number;
  missed: readonly Question[];
  onAgain: () => void;
  onClose: () => void;
}) {
  return (
    <View className="flex-1 bg-background pt-safe">
      <ScrollView className="flex-1" contentContainerClassName="gap-7 px-6 pt-6 pb-safe-offset-6">
        <View className="gap-2">
          <AppText variant="overline">{overline}</AppText>
          <AppText variant="display" accessibilityRole="header">
            {correct === total ? 'All correct' : 'Quiz done'}
          </AppText>
          <AppText variant="value-xl" accessibilityLabel={`${correct} of ${total} correct`}>
            {correct} / {total}
          </AppText>
        </View>
        {missed.length > 0 ? (
          <View className="gap-3">
            <AppText variant="overline" accessibilityRole="header">
              On your revise list
            </AppText>
            {missed.map((question) => (
              <AppText key={question.id} variant="body-sm">
                {question.prompt}
              </AppText>
            ))}
          </View>
        ) : (
          <AppText variant="body" tone="ink-2">
            Nothing to revise from this run.
          </AppText>
        )}
        <View className="gap-3">
          <Button label="Try again" variant="tinted" onPress={onAgain} />
          <Button label="Done" onPress={onClose} />
        </View>
      </ScrollView>
    </View>
  );
}
