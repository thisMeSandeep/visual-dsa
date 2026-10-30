import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useProgress } from '@/stores/progress';

import { PracticeHub } from '.';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

describe('Practice tab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useProgress.setState({ topics: {}, lastTopicId: undefined, revise: [] });
  });

  it('suggests the first quiz and lists every quiz as a card', async () => {
    await render(<PracticeHub />);
    expect(screen.getByText('Try the Big O Notation quiz')).toBeOnTheScreen();
    expect(screen.getByText('0 of 11 tried')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Start' }));
    expect(router.push).toHaveBeenLastCalledWith({
      pathname: '/topic/[topicId]/practice',
      params: { topicId: 'big-o' },
    });

    await fireEvent.press(
      screen.getByRole('button', { name: 'Stack quiz, 10 questions, not tried yet' }),
    );
    expect(router.push).toHaveBeenLastCalledWith({
      pathname: '/topic/[topicId]/practice',
      params: { topicId: 'stack' },
    });
  });

  it('puts missed questions first, and shows best scores on the cards', async () => {
    useProgress.setState({
      topics: { stack: { completedChapters: [], quiz: { last: 6, best: 8, total: 10 } } },
      revise: [
        { topicId: 'stack', questionId: 'peek-removes' },
        { topicId: 'stack', questionId: 'push-cost' },
      ],
    });
    await render(<PracticeHub />);
    expect(screen.getByText('Revise 2 missed questions')).toBeOnTheScreen();
    expect(screen.getByText('1 of 11 tried')).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Stack quiz, 10 questions, best score 8 of 10' }),
    ).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Start' }));
    expect(router.push).toHaveBeenLastCalledWith('/revise');
  });
});
