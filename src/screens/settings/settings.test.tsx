import { fireEvent, render, screen } from '@testing-library/react-native';

import { config } from '@/config';
import { DEFAULT_SETTINGS, useSettings } from '@/stores/settings';

import { Settings } from '.';

// @expo/ui renders SwiftUI / Jetpack Compose views, which Jest can't: switches become React
// Native switches so tests can flip them.
jest.mock('@expo/ui', () => {
  const { createElement: h } = require('react');
  const { Switch } = require('react-native');
  return {
    Host: ({ children }: { children: unknown }) => children,
    Switch: function MockSwitch(props: object) {
      return h(Switch, props);
    },
  };
});

/** Taps the first choice with this name ("Device" appears in two groups). */
const choose = (name: string) => fireEvent.press(screen.getAllByRole('radio', { name })[0]!);

describe('Settings', () => {
  beforeEach(() => useSettings.setState(DEFAULT_SETTINGS));

  it('shows the current choices', async () => {
    await render(<Settings />);
    expect(screen.getByLabelText('Theme').props.accessibilityRole).toBe('radiogroup');
    expect(screen.getAllByRole('radio', { name: 'Device', checked: true })).toHaveLength(2);
    expect(screen.getByRole('radio', { name: 'Pseudocode', checked: true })).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: '1×', checked: true })).toBeOnTheScreen();
    expect(screen.getByTestId('setting-progress-bar').props.value).toBe(true);
  });

  it('saves each change to the settings store', async () => {
    await render(<Settings />);
    await choose('Dark');
    await choose('JavaScript');
    await choose('2×');
    await choose('On');
    await fireEvent(screen.getByTestId('setting-progress-bar'), 'valueChange', false);

    expect(useSettings.getState()).toMatchObject({
      theme: 'dark',
      codeLanguage: 'javascript',
      defaultSpeed: 2,
      reducedMotion: 'on',
      showScrubber: false,
    });
    expect(screen.getByRole('radio', { name: 'Dark', checked: true })).toBeOnTheScreen();
  });

  it('offers every configured speed', async () => {
    await render(<Settings />);
    for (const speed of config.player.speeds) {
      expect(screen.getByRole('radio', { name: `${speed}×` })).toBeOnTheScreen();
    }
  });

  it('shows the haptics switch only when the haptics feature is on', async () => {
    await render(<Settings />);
    const toggle = screen.queryByTestId('setting-haptics');
    if (config.features.haptics) expect(toggle).toBeOnTheScreen();
    else expect(toggle).toBeNull();
  });
});
