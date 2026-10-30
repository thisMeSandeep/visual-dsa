/**
 * What the Practice tab suggests first: missed questions to revise, else the first quiz not yet
 * tried, else the weakest score to beat. Pure, so it's unit-tested.
 */
export type NextUp =
  | { kind: 'revise'; count: number; topicIds: string[] }
  | { kind: 'try'; topicId: string; questions: number }
  | { kind: 'improve'; topicId: string; best: number; total: number }
  | { kind: 'all-perfect' };

type Score = { best: number; total: number };

export function nextUp(
  revise: readonly { topicId: string }[],
  /** Every topic's quiz, in Home order, with its best score so far. */
  quizzes: readonly { topicId: string; questions: number; score?: Score | undefined }[],
): NextUp {
  if (revise.length > 0) {
    const topicIds = [...new Set(revise.map((item) => item.topicId))];
    return { kind: 'revise', count: revise.length, topicIds };
  }
  const untried = quizzes.find((quiz) => !quiz.score);
  if (untried) return { kind: 'try', topicId: untried.topicId, questions: untried.questions };

  // The lowest best score, as a share of the quiz; the first one wins a tie.
  let weakest: { topicId: string; score: Score } | undefined;
  for (const quiz of quizzes) {
    if (!quiz.score || quiz.score.best === quiz.score.total) continue;
    const ratio = quiz.score.best / quiz.score.total;
    if (!weakest || ratio < weakest.score.best / weakest.score.total) {
      weakest = { topicId: quiz.topicId, score: quiz.score };
    }
  }
  return weakest
    ? { kind: 'improve', topicId: weakest.topicId, ...weakest.score }
    : { kind: 'all-perfect' };
}
