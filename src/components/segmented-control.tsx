import { View } from 'react-native';

import { config } from '@/config';

import { AppText } from './app-text';
import { Icon } from './icon';
import type { IconName } from './icons';
import { PressableScale } from './pressable-scale';

export type SegmentOption<T extends string | number> = {
  value: T;
  label: string;
  icon?: IconName;
};

export type SegmentedControlProps<T extends string | number> = {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Names the group for screen readers, e.g. "Theme". */
  label: string;
  /** Layout within the parent only. */
  className?: string;
};

/**
 * One choice from a few, all visible at once (VISUAL-SPEC §6 "Segmented control"): equal
 * segments on a `surface` track, the chosen one a `primary-soft` pill with a bold `primary`
 * label (and a filled icon). Used for settings and the sandbox presets.
 */
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedControlProps<T>) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      className={`flex-row gap-1 rounded-full bg-surface p-1 ${className ?? ''}`}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableScale
            key={String(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(option.value)}
            className="flex-1"
            contentClassName={`h-9 flex-row items-center justify-center gap-1.5 rounded-full px-2 ${selected ? 'bg-primary-soft' : ''}`}
          >
            {option.icon ? (
              <Icon
                name={option.icon}
                size="xs"
                weight={selected ? 'fill' : 'regular'}
                tone={selected ? 'primary' : 'muted'}
              />
            ) : null}
            <AppText
              variant="label"
              weight={selected ? 'bold' : 'medium'}
              tone={selected ? 'primary' : 'ink-2'}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={config.app.minimumLabelScale}
              className="shrink"
            >
              {option.label}
            </AppText>
          </PressableScale>
        );
      })}
    </View>
  );
}
