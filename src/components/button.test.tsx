import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from './button';
import { IconButton } from './icon-button';

describe('Button', () => {
  it('is a labelled button that calls onPress', async () => {
    const onPress = jest.fn();
    await render(<Button label="Continue lesson" onPress={onPress} />);

    fireEvent.press(screen.getByRole('button', { name: 'Continue lesson' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire when disabled, and says so to screen readers', async () => {
    const onPress = jest.fn();
    await render(<Button label="Push" onPress={onPress} disabled />);

    const button = screen.getByRole('button', { name: 'Push' });
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });
});

describe('IconButton', () => {
  it('uses its label as the accessible name', async () => {
    const onPress = jest.fn();
    await render(
      <IconButton label="Next step" icon="step-forward" variant="step" onPress={onPress} />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Next step' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('reports the active state as selected', async () => {
    await render(<IconButton label="Show code" icon="code" variant="round" active />);
    expect(screen.getByRole('button', { name: 'Show code' })).toBeSelected();
  });

  it('can show short text instead of an icon', async () => {
    await render(<IconButton label="Playback speed" text="1×" variant="round" />);
    expect(screen.getByText('1×')).toBeOnTheScreen();
  });
});
