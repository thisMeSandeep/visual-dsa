import { View } from 'react-native';

import { AppText } from './app-text';

export type Stat = { label: string; value: string };

export type StatStripProps = {
  items: readonly Stat[];
  className?: string;
};

/** Equal columns between two hairlines: label above, mono value below (VISUAL-SPEC §6). */
export function StatStrip({ items, className }: StatStripProps) {
  return (
    <View className={`flex-row gap-3 border-y border-line py-4 ${className ?? ''}`}>
      {items.map((item) => (
        <View
          key={item.label}
          accessible
          accessibilityLabel={`${item.label}: ${item.value}`}
          className="flex-1 gap-1"
        >
          <AppText variant="label">{item.label}</AppText>
          <AppText variant="value">{item.value}</AppText>
        </View>
      ))}
    </View>
  );
}
