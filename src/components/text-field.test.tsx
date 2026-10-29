import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { TextField } from './text-field';

describe('TextField', () => {
  it('shows its label above the field and names the field with it', async () => {
    await render(<TextField label="Value (0–99)" />);
    expect(screen.getByText('Value (0–99)')).toBeOnTheScreen();
    expect(screen.getByLabelText('Value (0–99)')).toBeOnTheScreen();
  });

  it('can keep the label for screen readers only, with an accessory inside', async () => {
    await render(<TextField label="Value (0–99)" labelHidden accessory={<Text>Random</Text>} />);
    expect(screen.queryByText('Value (0–99)')).toBeNull();
    expect(screen.getByLabelText('Value (0–99)')).toBeOnTheScreen();
    expect(screen.getByText('Random')).toBeOnTheScreen();
  });

  it('explains an error under the field', async () => {
    const onChangeText = jest.fn();
    await render(
      <TextField label="Value" error="Use a number, like 42." onChangeText={onChangeText} />,
    );
    expect(screen.getByText('Use a number, like 42.')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('Value'), '7');
    expect(onChangeText).toHaveBeenCalledWith('7');
  });
});
