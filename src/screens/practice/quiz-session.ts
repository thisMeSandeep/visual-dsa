/**
 * One run through a set of questions, as plain data: the question on screen, the choice made
 * for it, the score so far and what was missed. The quiz screen keeps it in state.
 */
import { isCorrect } from '@/content/quiz';
import type { Question } from '@/content/schema';

export type QuizSession = Readonly<{
  questions: readonly Question[];
  index: number;
  /** The choice for the current question, once it's answered. */
  choice: string | undefined;
  correct: number;
  missed: readonly Question[];
  done: boolean;
}>;

export const startQuiz = (questions: readonly Question[]): QuizSession => ({
  questions,
  index: 0,
  choice: undefined,
  correct: 0,
  missed: [],
  done: questions.length === 0,
});

export const currentQuestion = (session: QuizSession): Question | undefined =>
  session.questions[session.index];

/** Answers the current question; a second answer to the same question is ignored. */
export function answerQuestion(session: QuizSession, choiceId: string): QuizSession {
  const question = currentQuestion(session);
  if (!question || session.choice !== undefined || session.done) return session;
  const right = isCorrect(question, choiceId);
  return {
    ...session,
    choice: choiceId,
    correct: session.correct + (right ? 1 : 0),
    missed: right ? session.missed : [...session.missed, question],
  };
}

/** Moves on after an answer: the next question, or the end. */
export function nextQuestion(session: QuizSession): QuizSession {
  if (session.choice === undefined || session.done) return session;
  const last = session.index >= session.questions.length - 1;
  return last
    ? { ...session, done: true }
    : { ...session, index: session.index + 1, choice: undefined };
}
