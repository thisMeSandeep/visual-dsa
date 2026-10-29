import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { IconButton } from '@/components/icon-button';
import {
  THEME_PREFERENCES,
  setThemePreference,
  useThemePreference,
  type ThemePreference,
} from '@/theme';

const THEME_LABELS: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

/** Title, close button and the System / Light / Dark switch shared by the dev screens. */
export function DevHeader({ title }: { title: string }) {
  const preference = useThemePreference();

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <AppText variant="headline" accessibilityRole="header">
          {title}
        </AppText>
        <IconButton icon="close" label="Close" onPress={() => router.back()} />
      </View>
      <View className="flex-row gap-2">
        {THEME_PREFERENCES.map((option) => {
          const selected = preference === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setThemePreference(option)}
              className={
                selected
                  ? 'h-11 flex-1 items-center justify-center rounded-lg bg-primary'
                  : 'h-11 flex-1 items-center justify-center rounded-lg bg-surface'
              }
            >
              <AppText
                variant="body-sm"
                weight={selected ? 'bold' : 'regular'}
                tone={selected ? 'on-primary' : 'ink'}
              >
                {THEME_LABELS[option]}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
