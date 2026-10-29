import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  THEME_PREFERENCES,
  setThemePreference,
  useColor,
  useThemePreference,
  useVizSizes,
  type ColorToken,
  type ThemePreference,
} from '@/theme';

/* Class names must be complete strings so Uniwind can find them at build time. */
const GROUPS: { title: string; swatches: { token: ColorToken; className: string }[] }[] = [
  {
    title: 'Neutrals',
    swatches: [
      { token: 'background', className: 'bg-background' },
      { token: 'surface', className: 'bg-surface' },
      { token: 'surface-raised', className: 'bg-surface-raised' },
      { token: 'line', className: 'bg-line' },
      { token: 'line-strong', className: 'bg-line-strong' },
      { token: 'line-input', className: 'bg-line-input' },
      { token: 'edge', className: 'bg-edge' },
      { token: 'ink', className: 'bg-ink' },
      { token: 'ink-2', className: 'bg-ink-2' },
      { token: 'muted', className: 'bg-muted' },
    ],
  },
  {
    title: 'Semantic',
    swatches: [
      { token: 'primary', className: 'bg-primary' },
      { token: 'on-primary', className: 'bg-on-primary' },
      { token: 'primary-soft', className: 'bg-primary-soft' },
      { token: 'primary-track', className: 'bg-primary-track' },
      { token: 'signal', className: 'bg-signal' },
      { token: 'signal-ink', className: 'bg-signal-ink' },
      { token: 'signal-soft', className: 'bg-signal-soft' },
      { token: 'success', className: 'bg-success' },
      { token: 'success-ink', className: 'bg-success-ink' },
      { token: 'success-soft', className: 'bg-success-soft' },
      { token: 'danger', className: 'bg-danger' },
      { token: 'danger-soft', className: 'bg-danger-soft' },
    ],
  },
  {
    title: 'Categories',
    swatches: [
      { token: 'cat-foundations', className: 'bg-cat-foundations' },
      { token: 'cat-linear', className: 'bg-cat-linear' },
      { token: 'cat-hashing', className: 'bg-cat-hashing' },
      { token: 'cat-trees', className: 'bg-cat-trees' },
      { token: 'cat-graphs', className: 'bg-cat-graphs' },
      { token: 'cat-algorithms', className: 'bg-cat-algorithms' },
    ],
  },
  {
    title: 'Modes',
    swatches: [
      { token: 'mode-sandbox', className: 'bg-mode-sandbox' },
      { token: 'mode-sandbox-soft', className: 'bg-mode-sandbox-soft' },
      { token: 'mode-practice', className: 'bg-mode-practice' },
      { token: 'mode-practice-soft', className: 'bg-mode-practice-soft' },
    ],
  },
];

const THEME_LABELS: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

export function DevTokens() {
  const preference = useThemePreference();
  const viz = useVizSizes();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-7 px-6 pt-safe-offset-4 pb-safe-offset-6"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-ink font-bold">Design tokens</Text>
        <Pressable accessibilityRole="button" onPress={() => router.back()} className="py-2">
          <Text className="text-primary font-bold">Close</Text>
        </Pressable>
      </View>

      <View className="flex-row gap-2">
        {THEME_PREFERENCES.map((option) => (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: preference === option }}
            onPress={() => setThemePreference(option)}
            className={
              preference === option
                ? 'flex-1 items-center rounded-lg bg-primary py-3'
                : 'flex-1 items-center rounded-lg bg-surface py-3'
            }
          >
            <Text className={preference === option ? 'text-on-primary font-bold' : 'text-ink'}>
              {THEME_LABELS[option]}
            </Text>
          </Pressable>
        ))}
      </View>

      {GROUPS.map((group) => (
        <View key={group.title} className="gap-3">
          <Text className="text-muted uppercase">{group.title}</Text>
          {group.swatches.map((swatch) => (
            <Swatch key={swatch.token} {...swatch} />
          ))}
        </View>
      ))}

      <View className="gap-1">
        <Text className="text-muted uppercase">Canvas sizes (TS-only tokens)</Text>
        <Text className="text-ink-2">
          cell {viz.cellWidth} × {viz.cellHeight} · bucket {viz.bucketWidth} × {viz.bucketHeight}
        </Text>
        <Text className="text-ink-2">
          gap {viz.gap} · radius {viz.radius} · edge {viz.edgeWidth} · dimmed {viz.dimmedOpacity}
        </Text>
      </View>
    </ScrollView>
  );
}

function Swatch({ token, className }: { token: ColorToken; className: string }) {
  // Read through src/theme too, to prove TypeScript sees the same value as the class name.
  const value = useColor(token);

  return (
    <View className="flex-row items-center gap-3">
      <View className={`h-10 w-10 rounded-md border border-line ${className}`} />
      <View className="flex-1">
        <Text className="text-ink">{token}</Text>
        <Text className="text-muted">{value || 'not readable from TS'}</Text>
      </View>
    </View>
  );
}
