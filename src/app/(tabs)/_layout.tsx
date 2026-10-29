import { Tabs } from 'expo-router/js-tabs';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import type { IconName } from '@/components/icons';
import { useColor } from '@/theme';

/*
 * JS tabs rather than NativeTabs: NativeTabs only accepts SF Symbols, Material symbols, images or
 * font icons, and our tab bar uses Phosphor icons (filled when active) on both platforms
 * (VISUAL-SPEC §6 "Tab bar"). Tab switches don't animate.
 */
const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Learn', icon: 'learn' },
  { name: 'practice', title: 'Practice', icon: 'practice' },
  { name: 'progress', title: 'Progress', icon: 'progress' },
  { name: 'settings', title: 'Settings', icon: 'settings' },
];

export default function TabsLayout() {
  const background = useColor('background');
  const line = useColor('line');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: background },
        tabBarStyle: { backgroundColor: background, borderTopColor: line },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <Icon
                name={tab.icon}
                size="lg"
                weight={focused ? 'fill' : 'regular'}
                tone={focused ? 'primary' : 'muted'}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <AppText
                variant="tab"
                weight={focused ? 'bold' : 'regular'}
                tone={focused ? 'primary' : 'muted'}
              >
                {tab.title}
              </AppText>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
