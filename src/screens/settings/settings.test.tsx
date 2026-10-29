import { fireEvent, render, screen } from '@testing-library/react-native';

import { config } from '@/config';
import { DEFAULT_SETTINGS, useSettings } from '@/stores/settings';

import { Settings } from '.';

// @expo/ui renders SwiftUI / Jetpack Compose views, which Jest can't. Pickers become one button
// per option and switches become React Native switches, so tests can choose values.
jest.mock('@expo/ui', () => {
  const { createElement: h, Children } = require('react');
  const { Pressable, Switch, Text, View } = require('react-native');
  const Picker = ({
    selectedValue,
    onValueChange,
    children,
    testID,
  }: {
    selectedValue: string | number;
    onValueChange: (value: string | number) => void;
    children: unknown;
    testID: string;
  }) =>
    h(
      View,
      { testID },
      Children.toArray(children).map(
        (child: { props: { value: string | number; label: string } }) =>
          h(
            Pressable,
            {
              key: String(child.props.value),
              accessibilityRole: 'radio',
              accessibilityLabel: `${testID} ${child.props.label}`,
              accessibilityState: { checked: child.props.value === selectedValue },
              onPress: () => onValueChange(child.props.value),
            },
            h(Text, null, child.props.label),
          ),
      ),
    );
  Picker.Item = function MockPickerItem() {
    return null;
  };
  return {
    Host: ({ children }: { children: unknown }) => children,
    Picker,
    Switch: function MockSwitch(props: object) {
      return h(Switch, props);
    },
  };
});

const option = (picker: string, label: string) =>
  screen.getByRole('radio', { name: `${picker} ${label}` });

describe('Settings', () => {
  beforeEach(() => useSettings.setState(DEFAULT_SETTINGS));

  it('shows the current choices', async () => {
    await render(<Settings />);
    expect(option('setting-theme', 'Match device')).toBeChecked();
    expect(option('setting-code-language', 'Pseudocode')).toBeChecked();
    expect(option('setting-speed', '1×')).toBeChecked();
    expect(option('setting-reduced-motion', 'Match device')).toBeChecked();
  });

  it('saves each change to the settings store', async () => {
    await render(<Settings />);
    await fireEvent.press(option('setting-theme', 'Dark'));
    await fireEvent.press(option('setting-code-language', 'JavaScript'));
    await fireEvent.press(option('setting-speed', '2×'));
    await fireEvent.press(option('setting-reduced-motion', 'On'));

    expect(useSettings.getState()).toMatchObject({
      theme: 'dark',
      codeLanguage: 'javascript',
      defaultSpeed: 2,
      reducedMotion: 'on',
    });
    expect(option('setting-theme', 'Dark')).toBeChecked();
  });

  it('offers every configured speed', async () => {
    await render(<Settings />);
    for (const speed of config.player.speeds) {
      expect(option('setting-speed', `${speed}×`)).toBeOnTheScreen();
    }
  });

  it('shows the haptics switch only when the haptics feature is on', async () => {
    await render(<Settings />);
    expect(screen.queryByTestId('setting-haptics')).toBe(
      config.features.haptics ? expect.anything() : null,
    );
  });
});
