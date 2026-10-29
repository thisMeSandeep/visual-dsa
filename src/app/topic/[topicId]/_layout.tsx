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

export default function TopicLayout() {
  const background = useColor('background');

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: background } }}>
      <Stack.Screen name="chapters" options={SHEET_OPTIONS} />
      <Stack.Screen name="reference" options={SHEET_OPTIONS} />
    </Stack>
  );
}
