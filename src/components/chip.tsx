import { View } from 'react-native';

import type { ColorToken } from '@/theme';

import { AppText } from './app-text';
import { Icon, type IconWeight } from './icon';
import type { IconName } from './icons';

const TONES = {
  /** Streak and other "now" moments. */
  signal: { surface: 'bg-signal-soft', icon: 'signal' },
  primary: { surface: 'bg-primary-soft', icon: 'primary' },
  neutral: { surface: 'bg-surface', icon: 'ink' },
} as const satisfies Record<string, { surface: string; icon: ColorToken }>;

export type ChipTone = keyof typeof TONES;

export type ChipProps = {
  /** Mono value, e.g. the streak count "4". */
  value?: string;
  /** Muted unit or label after the value, e.g. "days". */
  text?: string;
  icon?: IconName;
  iconWeight?: IconWeight;
  tone?: ChipTone;
  /** Spoken as one phrase, e.g. "4 day streak". */
  accessibilityLabel?: string;
  className?: string;
};

/** Small read-only pill (VISUAL-SPEC §6 "Chips"). */
export function Chip({
  value,
  text,
  icon,
  iconWeight = 'fill',
  tone = 'neutral',
  accessibilityLabel,
  className,
}: ChipProps) {
  const { surface, icon: iconTone } = TONES[tone];

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      className={`h-9 flex-row items-center gap-1.5 self-start rounded-full pl-2.5 pr-3.5 ${surface} ${className ?? ''}`}
    >
      {icon ? <Icon name={icon} size="xs" tone={iconTone} weight={iconWeight} /> : null}
      {value ? <AppText variant="value">{value}</AppText> : null}
      {text ? <AppText variant="label">{text}</AppText> : null}
    </View>
  );
}
