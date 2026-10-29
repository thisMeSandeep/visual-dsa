import '../../global.css';

import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
    // Gestures (swipe to step, scrubbing) only work inside GestureHandlerRootView.
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        {/* Uniwind's safe-area classes (pt-safe, pb-safe…) need the current insets. */}
        <SafeAreaListener onChange={({ insets }) => Uniwind.updateInsets(insets)}>
          <StatusBar style="auto" />
          {/* (tabs) is the home of the app; topic/[topicId] and dev/* push on top of it. */}
          <Stack
            screenOptions={{ headerShown: false, contentStyle: { backgroundColor: background } }}
          />
        </SafeAreaListener>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
