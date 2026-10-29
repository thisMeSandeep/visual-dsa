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
 * A topic's screens. The lesson is always landscape, so the canvas gets the width; the reference
 * sheet opens over it in landscape too. Sandbox and practice stay portrait like the rest of the app.
 */
export default function TopicLayout() {
  const background = useColor('background');

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        orientation: 'portrait',
        contentStyle: { backgroundColor: background },
      }}
    >
      <Stack.Screen name="learn" options={{ orientation: 'landscape' }} />
      <Stack.Screen name="reference" options={{ ...SHEET_OPTIONS, orientation: 'landscape' }} />
    </Stack>
  );
}
