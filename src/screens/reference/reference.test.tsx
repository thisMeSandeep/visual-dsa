import { render, screen } from '@testing-library/react-native';

import { Reference } from '.';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

describe('Reference sheet', () => {
  it('shows the topic summary and how it scales', async () => {
    await render(<Reference topicId="stack" />);
    expect(screen.getByRole('header', { name: 'Reference' })).toBeOnTheScreen();
    expect(screen.getByText('Last in, first out: you only ever touch the top.')).toBeOnTheScreen();
    expect(screen.getByLabelText('Push: O(1)')).toBeOnTheScreen();
    expect(screen.getByLabelText('Search: O(n)')).toBeOnTheScreen();
  });

  it('explains an unknown topic', async () => {
    await render(<Reference topicId="heap" />);
    expect(screen.getByText('This topic doesn’t exist.')).toBeOnTheScreen();
  });
});
