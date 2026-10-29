import { fireEvent, render, screen } from '@testing-library/react-native';

import { ChapterRow } from './chapter-row';
import { ContinueCard } from './continue-card';
import { FeedbackPanel } from './feedback-panel';
import { TopicRow } from './topic-row';

describe('TopicRow', () => {
  it('announces title, subtitle and progress as one button', async () => {
    const onPress = jest.fn();
    await render(
      <TopicRow
        title="Linked List"
        subtitle="5 chapters"
        glyph="linked-list"
        category="linear"
        status={{ kind: 'progress', done: 2, total: 5 }}
        onPress={onPress}
      />,
    );

    const row = screen.getByRole('button', {
      name: 'Linked List, 5 chapters, 2 of 5 chapters done',
    });
    await fireEvent.press(row);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText('2/5')).toBeOnTheScreen();
  });

  it('announces a finished topic as completed', async () => {
    await render(
      <TopicRow
        title="Array"
        subtitle="4 chapters"
        glyph="array"
        category="linear"
        status={{ kind: 'done' }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Array, 4 chapters, completed' })).toBeOnTheScreen();
  });
});

describe('ChapterRow', () => {
  it('marks the current chapter as selected and shows its step', async () => {
    await render(<ChapterRow number={4} title="Collision" state="current" currentLabel="Step 6" />);

    const row = screen.getByRole('button', { name: 'Chapter 4, Collision, in progress' });
    expect(row).toBeSelected();
    expect(screen.getByText('Step 6')).toBeOnTheScreen();
  });

  it('does not show a step label on other chapters', async () => {
    await render(<ChapterRow number={5} title="Chaining" state="upcoming" currentLabel="Step 6" />);
    expect(screen.queryByText('Step 6')).toBeNull();
  });
});

describe('ContinueCard', () => {
  it('is one button describing where the learner stopped', async () => {
    const onPress = jest.fn();
    await render(
      <ContinueCard
        title="Hash Table"
        position="Collision · step 6 of 70"
        progress={0.09}
        onPress={onPress}
      />,
    );

    await fireEvent.press(
      screen.getByRole('button', { name: 'Continue: Hash Table, Collision · step 6 of 70' }),
    );
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('FeedbackPanel', () => {
  it('shows the result and runs the action', async () => {
    const onAction = jest.fn();
    await render(
      <FeedbackPanel
        result="correct"
        title="Correct"
        explanation="17 divided by 6 leaves a remainder of 5."
        actionLabel="Continue"
        onAction={onAction}
      />,
    );

    expect(screen.getByRole('header', { name: 'Correct' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
