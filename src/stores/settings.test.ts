import Storage from 'expo-sqlite/kv-store';

import { config } from '@/config';

import { DEFAULT_SETTINGS, parseSettings, useSettings, type SettingsState } from './settings';

const KEY = config.storage.keys.settings;
const saved = () => JSON.parse(Storage.getItemSync(KEY) ?? 'null');

/** Loads the settings module fresh, as on an app launch, with `stored` already on the device. */
function launchWith(stored: unknown): SettingsState {
  Storage.setItemSync(KEY, JSON.stringify(stored));
  let state: SettingsState | undefined;
  jest.isolateModules(() => {
    state = (require('./settings') as typeof import('./settings')).useSettings.getState();
  });
  return state!;
}

describe('settings store', () => {
  beforeEach(() => {
    Storage.clearSync();
    useSettings.setState(DEFAULT_SETTINGS);
  });

  it('starts with the defaults from config', () => {
    expect(useSettings.getState()).toMatchObject({
      theme: 'system',
      codeLanguage: config.app.defaultCodeLanguage,
      defaultSpeed: config.player.defaultSpeed,
      haptics: true,
      reducedMotion: 'system',
    });
  });

  it('saves every change, with the schema version', async () => {
    const {
      setTheme,
      setCodeLanguage,
      setDefaultSpeed,
      setHaptics,
      setShowScrubber,
      setReducedMotion,
    } = useSettings.getState();
    setTheme('dark');
    setCodeLanguage('javascript');
    setDefaultSpeed(2);
    setHaptics(false);
    setShowScrubber(false);
    setReducedMotion('on');
    await Promise.resolve();

    expect(saved()).toEqual({
      state: {
        theme: 'dark',
        codeLanguage: 'javascript',
        defaultSpeed: 2,
        haptics: false,
        showScrubber: false,
        reducedMotion: 'on',
      },
      version: config.storage.versions.settings,
    });
  });

  it('loads saved settings on launch', () => {
    const state = launchWith({
      state: { ...DEFAULT_SETTINGS, theme: 'dark', defaultSpeed: 0.5 },
      version: config.storage.versions.settings,
    });
    expect(state).toMatchObject({ theme: 'dark', defaultSpeed: 0.5 });
  });

  it('falls back to the default for anything invalid, keeping the rest', () => {
    const state = launchWith({
      state: { theme: 'sepia', codeLanguage: 'javascript', defaultSpeed: 3, haptics: 'yes' },
      version: config.storage.versions.settings,
    });
    expect(state).toMatchObject({
      theme: 'system',
      codeLanguage: 'javascript',
      defaultSpeed: config.player.defaultSpeed,
      haptics: true,
      reducedMotion: 'system',
    });
  });

  it('reads a save from an older version', () => {
    const state = launchWith({ state: { theme: 'light' }, version: 0 });
    expect(state).toMatchObject({ theme: 'light', codeLanguage: config.app.defaultCodeLanguage });
  });
});

describe('parseSettings', () => {
  it('gives the defaults for nothing or garbage', () => {
    expect(parseSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings('corrupt')).toEqual(DEFAULT_SETTINGS);
  });
});
