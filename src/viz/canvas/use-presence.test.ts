import { act, renderHook } from '@testing-library/react-native';

import { usePresence } from './use-presence';

type Item = { id: string };
const items = (...ids: string[]): Item[] => ids.map((id) => ({ id }));
const view = (result: { current: { item: Item; exiting: boolean }[] }) =>
  result.current.map(({ item, exiting }) => (exiting ? `${item.id}(leaving)` : item.id));

describe('usePresence', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('shows current items without re-rendering forever when given a new array each render', async () => {
    const { result } = await renderHook(() => usePresence(items('a', 'b'), 200));
    expect(view(result)).toEqual(['a', 'b']);
  });

  it('keeps a removed item, marked leaving, in its old place until the exit ends', async () => {
    const { result, rerender } = await renderHook(
      ({ list }: { list: Item[] }) => usePresence(list, 200),
      {
        initialProps: { list: items('a', 'b', 'c') },
      },
    );

    await rerender({ list: items('a', 'c') });
    expect(view(result)).toEqual(['a', 'b(leaving)', 'c']);

    await act(async () => {
      jest.advanceTimersByTime(199);
    });
    expect(view(result)).toEqual(['a', 'b(leaving)', 'c']);

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(view(result)).toEqual(['a', 'c']);
  });

  it('cancels the exit when the item comes back', async () => {
    const { result, rerender } = await renderHook(
      ({ list }: { list: Item[] }) => usePresence(list, 200),
      {
        initialProps: { list: items('a', 'b') },
      },
    );

    await rerender({ list: items('a') });
    await rerender({ list: items('a', 'b') });
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(view(result)).toEqual(['a', 'b']);
  });
});
