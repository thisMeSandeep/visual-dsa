import { View } from 'react-native';

import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { ACCENT_CHOICES, type AccentChoice } from '@/stores/settings';
import { useAccentSwatches } from '@/theme';

/** Each accent's name, shown under the row's label and read by screen readers. */
export const ACCENT_LABELS: Record<AccentChoice, string> = {
  cobalt: 'Cobalt',
  violet: 'Violet',
  plum: 'Plum',
  ocean: 'Ocean',
  graphite: 'Graphite',
};

/**
 * The accent choice (VISUAL-SPEC §2.8): one round swatch per accent, painted in its own primary
 * for the theme on screen. The chosen one has a check and a ring. A radio group for screen
 * readers.
 */
export function AccentPicker({
  value,
  onChange,
}: {
  value: AccentChoice;
  onChange: (accent: AccentChoice) => void;
}) {
  const swatches = useAccentSwatches();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Accent" className="flex-row gap-2">
      {ACCENT_CHOICES.map((accent) => {
        const selected = accent === value;
        return (
          <PressableScale
            key={accent}
            accessibilityRole="radio"
            accessibilityLabel={ACCENT_LABELS[accent]}
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(accent)}
            contentClassName={`rounded-full border-2 p-1 ${selected ? 'border-ink' : 'border-surface-raised'}`}
          >
            <View
              style={{ backgroundColor: swatches[accent] }}
              className="size-9 items-center justify-center rounded-full"
            >
              {selected ? <Icon name="done" size="xs" weight="regular" tone="on-primary" /> : null}
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}
