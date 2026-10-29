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

  it('shows the Learn title, with no Start or Continue card', async () => {
    await render(<Home />);
    expect(screen.getByRole('header', { name: 'Learn' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /^(Start here|Continue):/ })).toBeNull();
  });

  it('lists topics under their category, with real (zero) progress', async () => {
    await render(<Home />);
    expect(screen.getByRole('header', { name: 'Foundations' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Linear structures' })).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Array, 7 chapters, 0 of 7 chapters done' }),
    ).toBeOnTheScreen();
  });

  it('opens a topic straight into its lesson', async () => {
    await render(<Home />);
    await fireEvent.press(screen.getByRole('button', { name: /^Array, / }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/topic/[topicId]/learn',
      params: { topicId: 'array' },
    });
  });

  it('shows saved progress on each card', async () => {
    useProgress.setState({
      topics: {
        stack: { completedChapters: ['lifo'], last: { chapterId: 'push-pop-peek', offset: 2 } },
      },
    });
    await render(<Home />);
    expect(
      screen.getByRole('button', { name: 'Stack, 6 chapters, 1 of 6 chapters done' }),
    ).toBeOnTheScreen();
    expect(screen.getByText('1/6')).toBeOnTheScreen();
  });

  it('marks a finished topic', async () => {
    const stack = getTopicMeta('stack')!;
    useProgress.setState({
      topics: { stack: { completedChapters: stack.chapters.map((chapter) => chapter.id) } },
    });
    await render(<Home />);
    expect(screen.getByRole('button', { name: 'Stack, 6 chapters, completed' })).toBeOnTheScreen();
  });
});
