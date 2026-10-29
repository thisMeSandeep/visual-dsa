import { fireEvent, render, screen } from '@testing-library/react-native';

import { SegmentedControl } from './segmented-control';

const OPTIONS = [
  { value: 'light', label: 'Light', icon: 'theme-light' },
  { value: 'dark', label: 'Dark', icon: 'theme-dark' },
] as const;

describe('SegmentedControl', () => {
  it('is a named group with the current choice checked', async () => {
    await render(
      <SegmentedControl label="Theme" options={OPTIONS} value="dark" onChange={jest.fn()} />,
    );
    expect(screen.getByLabelText('Theme').props.accessibilityRole).toBe('radiogroup');
    expect(screen.getByRole('radio', { name: 'Dark', checked: true })).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Light', checked: false })).toBeOnTheScreen();
  });

  it('reports the chosen value', async () => {
    const onChange = jest.fn();
    await render(
      <SegmentedControl label="Theme" options={OPTIONS} value="dark" onChange={onChange} />,
    );
    await fireEvent.press(screen.getByRole('radio', { name: 'Light' }));
    expect(onChange).toHaveBeenCalledWith('light');
  });
});
