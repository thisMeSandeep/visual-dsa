import { answerOf, choicesOf, isCorrect } from './quiz';
import { TOPIC_METAS, TOPIC_QUIZZES } from './registry';
import type { Question, Quiz } from './schema';
import { validateQuizzes } from './validate';

const stack = TOPIC_QUIZZES.stack!;
const byId = (id: string) => stack.questions.find((question) => question.id === id)!;

describe('quiz helpers', () => {
  it('offers True and False for true/false questions, and the options otherwise', () => {
    expect(choicesOf(byId('peek-removes')).map((c) => c.text)).toEqual(['True', 'False']);
    expect(choicesOf(byId('push-cost')).map((c) => c.text)).toEqual([
      'O(1)',
      'O(log n)',
      'O(n)',
      'O(n²)',
    ]);
  });

  it('checks answers', () => {
    expect(answerOf(byId('peek-removes'))).toBe('false');
    expect(isCorrect(byId('peek-removes'), 'false')).toBe(true);
    expect(isCorrect(byId('pop-returns'), 'two')).toBe(true);
    expect(isCorrect(byId('pop-returns'), 'seven')).toBe(false);
  });
});

describe('quiz validation', () => {
  const issues = (quizzes: Record<string, unknown>) =>
    validateQuizzes(quizzes, TOPIC_METAS).map((issue) => `${issue.path}: ${issue.message}`);

  it('accepts every registered quiz, and the Stack quiz has at least 8 questions', () => {
    expect(issues(TOPIC_QUIZZES)).toEqual([]);
    expect(stack.questions.length).toBeGreaterThanOrEqual(8);
  });

  it('reports a quiz under the wrong topic, and a chapter the topic does not have', () => {
    expect(issues({ queue: stack })).toEqual([
      'topicId: Registered as "queue" but its topicId is "stack"',
    ]);
    const question: Question = { ...byId('peek-removes'), chapterId: 'heapify' };
    const quiz: Quiz = { topicId: 'stack', questions: [question] };
    expect(issues({ stack: quiz })).toEqual([
      'questions.0.chapterId: No chapter "heapify" in this topic',
    ]);
  });
});
