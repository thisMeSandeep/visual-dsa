import { config } from '@/config';
import type { ColorToken, IconSize } from '@/theme';

import { AppText, type TextTone } from './app-text';
import { Icon, type IconWeight } from './icon';
import type { IconName } from './icons';
import { PressableScale } from './pressable-scale';

/* VISUAL-SPEC §6: round icon (48), step (56), play (72), plus a bare header icon (44). */

type Tone = TextTone & ColorToken;

type VariantSpec = {
  box: string;
  surface: string;
  activeSurface: string;
  tone: Tone;
  activeTone: Tone;
  iconSize: IconSize;
  iconWeight: IconWeight;
  /** Small targets get extra invisible hit area. */
  smallTarget: boolean;
};

const VARIANTS = {
  /** No background, 44: header actions (close, back, chapters, bookmark). */
  ghost: {
    box: 'h-11 w-11',
    surface: '',
    activeSurface: '',
    tone: 'ink',
    activeTone: 'primary',
    iconSize: 'md',
    iconWeight: 'regular',
    smallTarget: true,
  },
  /** Round 48 on surface: speed, code toggle. Active: tinted cobalt. */
  round: {
    box: 'h-12 w-12',
    surface: 'bg-surface',
    activeSurface: 'bg-primary-soft',
    tone: 'ink',
    activeTone: 'primary',
    iconSize: 'sm',
    iconWeight: 'regular',
    smallTarget: false,
  },
  /** Outlined 56: previous / next step. */
  step: {
    box: 'h-14 w-14 border-control border-line-strong',
    surface: '',
    activeSurface: '',
    tone: 'ink',
    activeTone: 'ink',
    iconSize: 'md',
    iconWeight: 'regular',
    smallTarget: false,
  },
  /** Solid cobalt 72: play / pause, the largest control on the lesson screen. */
  play: {
    box: 'h-18 w-18',
    surface: 'bg-primary',
    activeSurface: 'bg-primary',
    tone: 'on-primary',
    activeTone: 'on-primary',
    iconSize: 'lg',
    iconWeight: 'fill',
    smallTarget: false,
  },
} as const satisfies Record<string, VariantSpec>;

export type IconButtonVariant = keyof typeof VARIANTS;

export type IconButtonProps = {
  /** Spoken label; required because the button has no visible text. */
  label: string;
  icon?: IconName;
  /** Short text instead of an icon, e.g. the playback speed "1×". */
  text?: string;
  variant?: IconButtonVariant;
  /** Selected state (code panel open, bookmarked). */
  active?: boolean;
  iconWeight?: IconWeight;
  onPress?: () => void;
  disabled?: boolean;
  /** Layout within the parent only. */
  className?: string;
};

export function IconButton({
  label,
  icon,
  text,
  variant = 'ghost',
  active = false,
  iconWeight,
  onPress,
  disabled,
  className,
}: IconButtonProps) {
  const spec: VariantSpec = VARIANTS[variant];
  const tone = active ? spec.activeTone : spec.tone;

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      hitSlop={spec.smallTarget ? config.motion.touch.hitSlop : undefined}
      className={className}
      contentClassName={`${spec.box} ${active ? spec.activeSurface : spec.surface} items-center justify-center rounded-full ${
        disabled ? 'opacity-40' : ''
      }`}
    >
      {icon ? (
        <Icon name={icon} size={spec.iconSize} tone={tone} weight={iconWeight ?? spec.iconWeight} />
      ) : (
        <AppText variant="value" tone={tone}>
          {text}
        </AppText>
      )}
    </PressableScale>
  );
}
