import type { NativeStackNavigationOptions } from 'expo-router';
import { Stack } from 'expo-router/stack';

import { config } from '@/config';
import { useColor } from '@/theme';

const { sheet } = config.navigation;

/** Native form sheet: the platform's real sheet, with a grabber, at half and full height. */
const SHEET_OPTIONS: NativeStackNavigationOptions = {
  presentation: 'formSheet',
  sheetGrabberVisible: sheet.grabberVisible,
  sheetAllowedDetents: [...sheet.detents],
};

/**
 * A topic's screens. The lesson is always landscape and full screen (status bar and Android's
 * navigation bar hidden, like the reference), so the canvas gets every pixel; the reference
 * and legend sheets open over it in landscape too. Sandbox and practice stay portrait, with the bars shown,
 * like the rest of the app. The native stack applies and restores these per screen.
 */
const LESSON_OPTIONS: NativeStackNavigationOptions = {
  orientation: 'landscape',
  statusBarHidden: true,
  navigationBarHidden: true,
};
export default function TopicLayout() {
  const background = useColor('background');

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        orientation: 'portrait',
        statusBarHidden: false,
        navigationBarHidden: false,
        contentStyle: { backgroundColor: background },
      }}
    >
      <Stack.Screen name="learn" options={LESSON_OPTIONS} />
      <Stack.Screen name="reference" options={{ ...SHEET_OPTIONS, ...LESSON_OPTIONS }} />
      <Stack.Screen name="legend" options={{ ...SHEET_OPTIONS, ...LESSON_OPTIONS }} />
    </Stack>
  );
}
