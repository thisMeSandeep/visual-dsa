import { View } from 'react-native';

import { AppText } from './app-text';
import { clampRatio } from './progress-bar';

export type ScrubberProps = {
  /** 1-based step currently shown. */
  current: number;
  total: number;
  className?: string;
};

/**
 * Step position with a knob (VISUAL-SPEC §6 "Scrubber"). Visual only for now; dragging to a
 * step arrives with the lesson player (F-403).
 */
export function Scrubber({ current, total, className }: ScrubberProps) {
  const ratio = clampRatio(total > 0 ? current / total : 0);

  return (
    <View
      accessible
      accessibilityLabel={`Step ${current} of ${total}`}
      className={`flex-row items-center gap-3 ${className ?? ''}`}
    >
      <AppText variant="index" tone="ink" className="min-w-5">
        {String(current)}
      </AppText>
      <View className="h-3.5 flex-1 flex-row items-center">
        <View className="h-1 rounded-full bg-primary" style={{ flex: ratio }} />
        <View className="-mx-1.75 h-3.5 w-3.5 rounded-full bg-primary" />
        <View className="h-1 rounded-full bg-line" style={{ flex: 1 - ratio }} />
      </View>
      <AppText variant="index" className="min-w-5 text-right">
        {String(total)}
      </AppText>
    </View>
  );
}
