import { fireEvent, render, screen } from '@testing-library/react-native';

import { Reference } from '.';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

const tab = (name: string) => fireEvent.press(screen.getByRole('radio', { name }));

describe('Reference sheet', () => {
  it('shows the topic summary and how it scales above the cheat sheet', async () => {
    await render(<Reference topicId="stack" />);
    expect(screen.getByRole('header', { name: 'Reference' })).toBeOnTheScreen();
    expect(screen.getByText('Last in, first out: you only ever touch the top.')).toBeOnTheScreen();
    expect(screen.getByLabelText('Push: O(1)')).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Overview', checked: true })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Use it for' })).toBeOnTheScreen();
  });

  it('switches tabs: a complexity table read row by row, then the pitfalls', async () => {
    await render(<Reference topicId="stack" />);
    await tab('Complexity');
    expect(
      screen.getByLabelText('Operation: Search, Average: O(n), Worst: O(n)'),
    ).toBeOnTheScreen();
    await tab('Pitfalls');
    // Bold markup becomes bold text, not asterisks.
    expect(screen.getByText(/popping or peeking an empty stack/)).toBeOnTheScreen();
    expect(screen.queryByText(/\*\*/)).toBeNull();
  });

  it('explains an unknown topic', async () => {
    await render(<Reference topicId="heap" />);
    expect(screen.getByText('This topic doesn’t exist.')).toBeOnTheScreen();
  });
});
