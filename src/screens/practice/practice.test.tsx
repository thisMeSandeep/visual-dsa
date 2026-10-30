import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { answerOf, choicesOf } from '@/content/quiz';
import { TOPIC_QUIZZES } from '@/content/registry';
import { useProgress } from '@/stores/progress';

import { TopicPractice } from '.';
import { Revise } from './revise';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

const questions = TOPIC_QUIZZES.stack!.questions;
const textOf = (question: (typeof questions)[number], id: string) =>
  choicesOf(question).find((choice) => choice.id === id)!.text;
const wrongId = (question: (typeof questions)[number]) =>
  choicesOf(question).find((choice) => choice.id !== answerOf(question))!.id;

/** Answers the question on screen, right or wrong, then moves on. */
async function answer(question: (typeof questions)[number], right: boolean) {
  const id = right ? answerOf(question) : wrongId(question);
  await fireEvent.press(screen.getByRole('radio', { name: textOf(question, id) }));
  const next = screen.queryByRole('button', { name: 'Continue' });
  await fireEvent.press(next ?? screen.getByRole('button', { name: 'See results' }));
}

describe('Topic quiz', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useProgress.setState({ topics: {}, lastTopicId: undefined, revise: [] });
  });

  it('asks the first question with its context and options', async () => {
    await render(<TopicPractice topicId="stack" />);
    expect(screen.getByRole('header', { name: questions[0]!.prompt })).toBeOnTheScreen();
    expect(screen.getByText('bottom → top: 7 4 2')).toBeOnTheScreen();
    expect(screen.getByLabelText('Question 1 of 10')).toBeOnTheScreen();
  });

  it('marks a wrong answer, shows the right one and explains why', async () => {
    await render(<TopicPractice topicId="stack" />);
    await fireEvent.press(screen.getByRole('radio', { name: '7' }));
    expect(screen.getByRole('header', { name: 'Not quite' })).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: '7, your answer, not right' })).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: '2, correct answer' })).toBeOnTheScreen();
    expect(screen.getByText(questions[0]!.explanation)).toBeOnTheScreen();
    expect(useProgress.getState().revise).toEqual([
      { topicId: 'stack', questionId: 'pop-returns' },
    ]);
  });

  it('links to the question’s chapter in the lesson', async () => {
    await render(<TopicPractice topicId="stack" />);
    await fireEvent.press(screen.getByRole('radio', { name: '2' }));
    await fireEvent.press(screen.getByRole('button', { name: 'See in lesson' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/topic/[topicId]/learn',
      params: { topicId: 'stack', chapter: 'push-pop-peek' },
    });
  });

  it('runs the whole quiz, saves the score and lists what was missed', async () => {
    await render(<TopicPractice topicId="stack" />);
    for (const [index, question] of questions.entries()) {
      await answer(question, index !== 1 && index !== 4);
    }
    expect(screen.getByLabelText('8 of 10 correct')).toBeOnTheScreen();
    expect(screen.getByText(questions[1]!.prompt)).toBeOnTheScreen();
    expect(useProgress.getState().topics.stack?.quiz).toEqual({ last: 8, best: 8, total: 10 });
    expect(useProgress.getState().revise.map((item) => item.questionId)).toEqual([
      'peek-removes',
      'like-a-stack',
    ]);

    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByLabelText('Question 1 of 10')).toBeOnTheScreen();
  });

  it('explains a topic without a quiz yet', async () => {
    await render(<TopicPractice topicId="hash-table" />);
    expect(screen.getByText(/arrives with its topic/)).toBeOnTheScreen();
  });
});

describe('Revise', () => {
  beforeEach(() => useProgress.setState({ topics: {}, lastTopicId: undefined, revise: [] }));

  it('says when there is nothing to revise', async () => {
    await render(<Revise />);
    expect(screen.getByText(/Nothing to revise/)).toBeOnTheScreen();
  });

  it('asks the missed questions, and takes one off the list when answered right', async () => {
    useProgress.setState({
      revise: [
        { topicId: 'stack', questionId: 'peek-removes' },
        { topicId: 'stack', questionId: 'gone-from-content' },
      ],
    });
    await render(<Revise />);
    expect(screen.getByLabelText('Question 1 of 1')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('radio', { name: 'False' }));
    expect(useProgress.getState().revise).toEqual([
      { topicId: 'stack', questionId: 'gone-from-content' },
    ]);
  });
});
