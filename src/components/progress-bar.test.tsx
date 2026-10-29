import { render, screen } from '@testing-library/react-native';

import { ProgressBar, SegmentedProgress, clampRatio } from './progress-bar';
import { Scrubber } from './scrubber';

describe('clampRatio', () => {
  it.each([
    [0.4, 0.4],
    [-1, 0],
    [3, 1],
    [Number.NaN, 0],
  ])('clamps %p to %p', (input, expected) => {
    expect(clampRatio(input)).toBe(expected);
  });
});

describe('ProgressBar', () => {
  it('exposes its value to screen readers', async () => {
    await render(<ProgressBar value={0.4} accessibilityLabel="Lesson progress" />);
    expect(screen.getByRole('progressbar', { name: 'Lesson progress' })).toHaveAccessibilityValue({
      min: 0,
      max: 1,
      now: 0.4,
    });
  });
});

describe('SegmentedProgress', () => {
  it('reports done out of total', async () => {
    await render(<SegmentedProgress total={8} done={3} accessibilityLabel="Question 3 of 8" />);
    expect(screen.getByRole('progressbar', { name: 'Question 3 of 8' })).toHaveAccessibilityValue({
      min: 0,
      max: 8,
      now: 3,
    });
  });
});

describe('Scrubber', () => {
  it('shows the current step and total', async () => {
    await render(<Scrubber current={6} total={70} />);
    expect(screen.getByLabelText('Step 6 of 70')).toBeOnTheScreen();
  });
});
