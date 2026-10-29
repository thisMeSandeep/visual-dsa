import { Tabs } from 'expo-router/js-tabs';

import { FloatingTabBar, type TabItem } from '@/components/floating-tab-bar';
import { useColor } from '@/theme';

/*
 * JS tabs rather than NativeTabs: NativeTabs only accepts SF Symbols, Material symbols, images or
 * font icons, and our tab bar uses Phosphor icons (filled when active) on both platforms. The bar
 * itself is our own floating capsule (VISUAL-SPEC §6 "Tab bar"). Tab switches don't animate.
 */
const TABS: readonly TabItem[] = [
  { name: 'index', title: 'Learn', icon: 'learn' },
  { name: 'practice', title: 'Practice', icon: 'practice' },
  { name: 'progress', title: 'Progress', icon: 'progress' },
  { name: 'settings', title: 'Settings', icon: 'settings' },
];

export default function TabsLayout() {
  const background = useColor('background');

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} tabs={TABS} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: background } }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title }} />
      ))}
    </Tabs>
  );
}
