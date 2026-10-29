import { TOPIC_QUIZZES } from '@/content/registry';

import { answerQuestion, currentQuestion, nextQuestion, startQuiz } from './quiz-session';

const questions = TOPIC_QUIZZES.stack!.questions.slice(0, 3);
// pop-returns (answer "two"), peek-removes (false), push-cost ("constant")

describe('quiz session', () => {
  it('starts on the first question with nothing answered', () => {
    const session = startQuiz(questions);
    expect(currentQuestion(session)?.id).toBe('pop-returns');
    expect(session).toMatchObject({ choice: undefined, correct: 0, missed: [], done: false });
  });

  it('scores answers and remembers what was missed', () => {
    let session = startQuiz(questions);
    session = nextQuestion(answerQuestion(session, 'two'));
    session = nextQuestion(answerQuestion(session, 'true'));
    session = answerQuestion(session, 'constant');
    expect(session.correct).toBe(2);
    expect(session.missed.map((question) => question.id)).toEqual(['peek-removes']);
    expect(nextQuestion(session).done).toBe(true);
  });

  it('ignores a second answer, and moving on before answering', () => {
    const session = startQuiz(questions);
    expect(nextQuestion(session)).toBe(session);
    const answered = answerQuestion(session, 'seven');
    expect(answerQuestion(answered, 'two')).toBe(answered);
  });

  it('is done at once with no questions', () => {
    expect(startQuiz([]).done).toBe(true);
  });
});
