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

  it('shows an empty revise list and the Stack quiz, not tried yet', async () => {
    await render(<PracticeHub />);
    expect(screen.getByText('Nothing to revise')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Revise now' })).toBeNull();
    await fireEvent.press(
      screen.getByRole('button', { name: 'Stack quiz, 10 questions, not tried yet' }),
    );
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/topic/[topicId]/practice',
      params: { topicId: 'stack' },
    });
  });

  it('shows the revise list and the best score', async () => {
    useProgress.setState({
      topics: { stack: { completedChapters: [], quiz: { last: 6, best: 8, total: 10 } } },
      revise: [
        { topicId: 'stack', questionId: 'peek-removes' },
        { topicId: 'stack', questionId: 'push-cost' },
      ],
    });
    await render(<PracticeHub />);
    expect(screen.getByText('2 questions to revise')).toBeOnTheScreen();
    expect(screen.getByText('peek() removes the top item from the stack.')).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Stack quiz, 10 questions, best score 8 of 10' }),
    ).toBeOnTheScreen();
    expect(screen.getByText('8/10')).toBeOnTheScreen();
    // Every MVP topic has a quiz, each with its own row.
    expect(screen.getByRole('button', { name: /^Big O Notation quiz/ })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Revise now' }));
    expect(router.push).toHaveBeenCalledWith('/revise');
  });
});
