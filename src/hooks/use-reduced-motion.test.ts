import { act, renderHook } from '@testing-library/react-native';
import * as Reanimated from 'react-native-reanimated';

import { DEFAULT_SETTINGS, useSettings } from '@/stores/settings';

import { useReducedMotion } from './use-reduced-motion';

describe('useReducedMotion', () => {
  beforeEach(() => useSettings.setState(DEFAULT_SETTINGS));

  it('follows the device by default', async () => {
    const system = jest.spyOn(Reanimated, 'useReducedMotion').mockReturnValue(true);
    const { result } = await renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
    system.mockRestore();
  });

  it('can be forced on or off in Settings', async () => {
    const { result } = await renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
    await act(async () => useSettings.getState().setReducedMotion('on'));
    expect(result.current).toBe(true);
    await act(async () => useSettings.getState().setReducedMotion('off'));
    expect(result.current).toBe(false);
  });
});
