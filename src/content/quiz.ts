/**
 * Small helpers for quiz questions: the choices a question offers and whether a choice is right.
 * True/false questions offer "True" and "False"; the others offer their options.
 */
import type { Question } from './schema';

export type QuizChoice = { id: string; text: string };

const TRUE_FALSE: readonly QuizChoice[] = [
  { id: 'true', text: 'True' },
  { id: 'false', text: 'False' },
];

export function choicesOf(question: Question): readonly QuizChoice[] {
  return question.kind === 'true-false' ? TRUE_FALSE : question.options;
}

/** The id of the right choice. */
export function answerOf(question: Question): string {
  return question.kind === 'true-false' ? String(question.answer) : question.answer;
}

export const isCorrect = (question: Question, choiceId: string) => answerOf(question) === choiceId;

/** How each kind is named above the question. */
export const QUESTION_KIND_LABELS: Record<Question['kind'], string> = {
  'multiple-choice': 'Choose one',
  complexity: 'Complexity',
  'true-false': 'True or false',
  predict: 'Predict the next step',
};
