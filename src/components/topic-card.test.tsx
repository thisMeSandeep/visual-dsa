import { fireEvent, render, screen } from '@testing-library/react-native';

import { TopicCard, type TopicCardProps } from './topic-card';

const card = (props: Partial<TopicCardProps>) => (
  <TopicCard
    topicId="stack"
    title="Stack"
    subtitle="6 chapters"
    glyph="stack"
    category="linear"
    status={{ kind: 'progress', done: 0, total: 6 }}
    {...props}
  />
);

describe('TopicCard', () => {
  it('shows the chapter count before the topic is started', async () => {
    await render(card({}));
    expect(
      screen.getByRole('button', { name: 'Stack, 6 chapters, 0 of 6 chapters done' }),
    ).toBeOnTheScreen();
    expect(screen.getByText('6 chapters')).toBeOnTheScreen();
  });

  it('shows progress once started', async () => {
    await render(card({ status: { kind: 'progress', done: 2, total: 6, current: true } }));
    expect(screen.getByText('2/6')).toBeOnTheScreen();
    expect(screen.queryByText('6 chapters')).toBeNull();
  });

  it('marks a finished topic', async () => {
    await render(card({ status: { kind: 'done' } }));
    expect(screen.getByText('Completed')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Stack, 6 chapters, completed' })).toBeOnTheScreen();
  });

  it('opens the topic', async () => {
    const onPress = jest.fn();
    await render(card({ onPress }));
    await fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });
});
