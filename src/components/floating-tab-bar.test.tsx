import { fireEvent, render, screen } from '@testing-library/react-native';

import { FloatingTabBar, type TabItem } from './floating-tab-bar';

const TABS: TabItem[] = [
  { name: 'index', title: 'Learn', icon: 'learn' },
  { name: 'practice', title: 'Practice', icon: 'practice' },
  { name: 'settings', title: 'Settings', icon: 'settings' },
];

const routes = TABS.map((tab) => ({ key: `${tab.name}-key`, name: tab.name }));

function renderBar({ index = 0, preventDefault = false } = {}) {
  const navigateToTab = jest.fn();
  const emit = jest.fn(() => ({ defaultPrevented: preventDefault }));
  const props = {
    state: { index, routes },
    emitter: { emit },
    navigateToTab,
    tabs: TABS,
  } as unknown as React.ComponentProps<typeof FloatingTabBar>;
  return { navigateToTab, emit, view: render(<FloatingTabBar {...props} />) };
}

describe('FloatingTabBar', () => {
  it('names the current tab on screen and marks it selected', async () => {
    const { view } = renderBar({ index: 1 });
    await view;
    expect(screen.getByRole('tab', { name: 'Practice', selected: true })).toBeOnTheScreen();
    expect(screen.getByText('Practice')).toBeOnTheScreen();
    // Other tabs show only their icon, but are still named for screen readers.
    expect(screen.queryByText('Learn')).toBeNull();
    expect(screen.getByRole('tab', { name: 'Learn', selected: false })).toBeOnTheScreen();
  });

  it('switches tab on press, after telling the navigator', async () => {
    const { view, navigateToTab, emit } = renderBar();
    await view;
    await fireEvent.press(screen.getByRole('tab', { name: 'Settings' }));
    expect(emit).toHaveBeenCalledWith({
      type: 'tabPress',
      target: 'settings-key',
      canPreventDefault: true,
    });
    expect(navigateToTab).toHaveBeenCalledWith('settings-key');
  });

  it('stays put when the current tab is pressed', async () => {
    const { view, navigateToTab } = renderBar();
    await view;
    await fireEvent.press(screen.getByRole('tab', { name: 'Learn' }));
    expect(navigateToTab).not.toHaveBeenCalled();
  });

  it('stays put when the press is prevented', async () => {
    const { view, navigateToTab } = renderBar({ preventDefault: true });
    await view;
    await fireEvent.press(screen.getByRole('tab', { name: 'Practice' }));
    expect(navigateToTab).not.toHaveBeenCalled();
  });
});
