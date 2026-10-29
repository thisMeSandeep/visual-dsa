import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useProgress } from '@/stores/progress';

import { Topic } from '.';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));

describe('Topic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useProgress.setState({ topics: {}, lastTopicId: undefined });
  });

  it('shows the topic from content', async () => {
    await render(<Topic topicId="hash-table" />);
    expect(screen.getByRole('header', { name: 'Hash Table' })).toBeOnTheScreen();
    expect(screen.getByText('Hashing')).toBeOnTheScreen();
    expect(screen.getByLabelText('Worst case: O(n)')).toBeOnTheScreen();
    expect(screen.getByText('0 of 10')).toBeOnTheScreen();
  });

  it('lists every chapter in order', async () => {
    await render(<Topic topicId="hash-table" />);
    expect(
      screen.getByRole('button', { name: 'Chapter 1, Introduction, not started' }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Chapter 10, Tombstones, not started' }),
    ).toBeOnTheScreen();
  });

  it('starts the lesson, or jumps to a chapter', async () => {
    await render(<Topic topicId="hash-table" />);

    await fireEvent.press(screen.getByRole('button', { name: 'Start lesson' }));
    expect(router.push).toHaveBeenLastCalledWith({
      pathname: '/topic/[topicId]/learn',
      params: { topicId: 'hash-table' },
    });

    await fireEvent.press(
      screen.getByRole('button', { name: 'Chapter 4, Collision, not started' }),
    );
    expect(router.push).toHaveBeenLastCalledWith({
      pathname: '/topic/[topicId]/learn',
      params: { topicId: 'hash-table', chapter: 'collision' },
    });
  });

  it('opens the sandbox, practice and reference sheet', async () => {
    await render(<Topic topicId="stack" />);
    await fireEvent.press(screen.getByRole('button', { name: 'Sandbox' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Practice' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Reference sheet' }));
    expect(router.push).toHaveBeenNthCalledWith(1, {
      pathname: '/topic/[topicId]/play',
      params: { topicId: 'stack' },
    });
    expect(router.push).toHaveBeenNthCalledWith(2, {
      pathname: '/topic/[topicId]/practice',
      params: { topicId: 'stack' },
    });
    expect(router.push).toHaveBeenNthCalledWith(3, {
      pathname: '/topic/[topicId]/reference',
      params: { topicId: 'stack' },
    });
  });

  it('shows a way back for an unknown topic', async () => {
    await render(<Topic topicId="not-a-topic" />);
    expect(screen.getByRole('header', { name: 'Topic not found' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Back to Learn' }));
    expect(router.replace).toHaveBeenCalledWith('/');
  });

  it('shows saved progress: done chapters, the one to continue, and Continue', async () => {
    useProgress.setState({
      topics: {
        stack: { completedChapters: ['lifo'], last: { chapterId: 'push-pop-peek', offset: 2 } },
      },
    });
    await render(<Topic topicId="stack" />);
    expect(screen.getByText('1 of 6')).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Chapter 1, Last in, first out, completed' }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Chapter 2, Push, pop and peek, in progress' }),
    ).toBeOnTheScreen();
    expect(screen.getByText('Step 3 of 6')).toBeOnTheScreen();

    // Continue resumes: no chapter, so the lesson opens at the saved step.
    await fireEvent.press(screen.getByRole('button', { name: 'Continue lesson' }));
    expect(router.push).toHaveBeenLastCalledWith({
      pathname: '/topic/[topicId]/learn',
      params: { topicId: 'stack' },
    });
  });

  it('offers a review from the start once every chapter is done', async () => {
    useProgress.setState({
      topics: {
        stack: {
          completedChapters: [
            'lifo',
            'push-pop-peek',
            'browser-back',
            'parentheses',
            'implementations',
            'overflow-underflow',
          ],
        },
      },
    });
    await render(<Topic topicId="stack" />);
    await fireEvent.press(screen.getByRole('button', { name: 'Review lesson' }));
    expect(router.push).toHaveBeenLastCalledWith({
      pathname: '/topic/[topicId]/learn',
      params: { topicId: 'stack', chapter: 'lifo' },
    });
  });
});
