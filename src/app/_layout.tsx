import '../../global.css';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaListener, SafeAreaProvider } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

import { useColor } from '@/theme';
import { FONT_FILES } from '@/theme/fonts';

// Keep the splash screen up until the fonts are ready, so text never renders in a fallback font.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const background = useColor('background');
  const [fontsLoaded, fontError] = useFonts(FONT_FILES);
  const ready = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

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
