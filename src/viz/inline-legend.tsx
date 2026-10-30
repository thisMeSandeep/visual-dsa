import { View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import type { Scene } from '@/engine/core/types';

import { STATE_LABELS, visibleStates } from './state-legend';
import { StateSwatch } from './state-swatch';

/**
 * The inline legend (F-306, VISUAL-SPEC §7): only the states on the canvas right now, each with
 * its swatch. Tapping it opens the full legend sheet, so the legend is always one tap away.
 */
export function InlineLegend({ scene, onPress }: { scene: Scene; onPress: () => void }) {
  const states = visibleStates(scene);
  const labels = states.map((state) => STATE_LABELS[state]);
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={labels.length > 0 ? `State legend: ${labels.join(', ')}` : 'State legend'}
      contentClassName="h-8 flex-row items-center gap-3 rounded-full bg-surface px-3"
    >
      <Icon name="legend" size="xs" tone="muted" />
      {states.map((state) => (
        <View key={state} className="flex-row items-center gap-1.5">
          <StateSwatch state={state} />
          <AppText variant="label" tone="ink-2">
            {STATE_LABELS[state]}
          </AppText>
        </View>
      ))}
    </PressableScale>
  );
}
