import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { getTopicMeta } from '@/content/registry';
import { useProgress } from '@/stores/progress';

import { Home } from '.';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useProgress.setState({ topics: {}, lastTopicId: undefined });
  });

  it('shows the Learn title and a Start card for the first topic', async () => {
    await render(<Home />);
    expect(screen.getByRole('header', { name: 'Learn' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /^Start here: Big O Notation/ })).toBeOnTheScreen();
  });

  it('starts the first lesson from the Start card', async () => {
    await render(<Home />);
    await fireEvent.press(screen.getByRole('button', { name: /^Start here: Big O Notation/ }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/topic/[topicId]/learn',
      params: { topicId: 'big-o' },
    });
  });

  it('lists topics under their category, with real (zero) progress', async () => {
    await render(<Home />);
    expect(screen.getByRole('header', { name: 'Foundations' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Linear structures' })).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Array, 7 chapters, 0 of 7 chapters done' }),
    ).toBeOnTheScreen();
  });

  it('opens a topic', async () => {
    await render(<Home />);
    await fireEvent.press(screen.getByRole('button', { name: /^Array, / }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/topic/[topicId]',
      params: { topicId: 'array' },
    });
  });

  it('continues the last lesson at the saved step', async () => {
    useProgress.setState({
      lastTopicId: 'stack',
      topics: {
        stack: { completedChapters: ['lifo'], last: { chapterId: 'push-pop-peek', offset: 2 } },
      },
    });
    await render(<Home />);
    const card = screen.getByRole('button', {
      name: 'Continue: Stack, Push, pop and peek · step 3 of 6',
    });
    expect(
      screen.getByRole('button', { name: 'Stack, 6 chapters, 1 of 6 chapters done' }),
    ).toBeOnTheScreen();

    await fireEvent.press(card);
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/topic/[topicId]/learn',
      params: { topicId: 'stack' },
    });
  });

  it('goes back to a Start card once the last topic is finished', async () => {
    const stack = getTopicMeta('stack')!;
    useProgress.setState({
      lastTopicId: 'stack',
      topics: {
        stack: {
          completedChapters: stack.chapters.map((chapter) => chapter.id),
          last: { chapterId: 'overflow-underflow', offset: 9 },
        },
      },
    });
    await render(<Home />);
    expect(screen.queryByRole('button', { name: /^Continue:/ })).toBeNull();
    expect(screen.getByRole('button', { name: /^Start here: Big O Notation/ })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Stack, 6 chapters, completed' })).toBeOnTheScreen();
  });
});
