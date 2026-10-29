import '../../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaListener, SafeAreaProvider } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

import { useColor } from '@/theme';

export default function RootLayout() {
  const background = useColor('background');

  return (
    <SafeAreaProvider>
      {/* Uniwind's safe-area classes (pt-safe, pb-safe…) need the current insets. */}
      <SafeAreaListener onChange={({ insets }) => Uniwind.updateInsets(insets)}>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: background } }}
        />
      </SafeAreaListener>
    </SafeAreaProvider>
  );
}
