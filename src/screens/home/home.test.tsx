import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { Home } from '.';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Home', () => {
  beforeEach(() => jest.clearAllMocks());

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
});
