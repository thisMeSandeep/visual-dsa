import { render, screen } from '@testing-library/react-native';

import { QuizCard } from './quiz-card';

const card = (score?: { best: number; total: number }) => (
  <QuizCard
    topicId="stack"
    title="Stack"
    glyph="stack"
    category="linear"
    questions={10}
    score={score}
  />
);

describe('QuizCard', () => {
  it('shows the quiz size before the first try', async () => {
    await render(card());
    expect(screen.getByText('10 questions')).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Stack quiz, 10 questions, not tried yet' }),
    ).toBeOnTheScreen();
  });

  it('shows the best score as a bar and a fraction', async () => {
    await render(card({ best: 8, total: 10 }));
    expect(screen.getByText('8/10')).toBeOnTheScreen();
    expect(screen.getByRole('progressbar')).toBeOnTheScreen();
  });

  it('calls a full score perfect', async () => {
    await render(card({ best: 10, total: 10 }));
    expect(screen.getByText('Perfect 10/10')).toBeOnTheScreen();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});
