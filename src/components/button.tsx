import { config } from '@/config';
import type { ColorToken } from '@/theme';

import { AppText, type TextTone, type TextVariant } from './app-text';
import { Icon, type IconWeight } from './icon';
import type { IconName } from './icons';
import { PressableScale } from './pressable-scale';

/* VISUAL-SPEC §6 "Buttons". Class names are complete strings so Uniwind finds them. */

type Tone = TextTone & ColorToken;

const VARIANTS = {
  /** Solid cobalt: the one main action on a screen. */
  primary: { surface: 'bg-primary', tone: 'on-primary' },
  /** Cobalt tint: secondary actions next to a primary one (Pop, Peek). */
  tinted: { surface: 'bg-primary-soft', tone: 'primary' },
  /** Mode buttons on the Topic screen. */
  sandbox: { surface: 'bg-mode-sandbox-soft', tone: 'mode-sandbox-ink' },
  practice: { surface: 'bg-mode-practice-soft', tone: 'mode-practice-ink' },
} as const satisfies Record<string, { surface: string; tone: Tone }>;

const SIZES = {
  /** Height 56: main actions. */
  md: { box: 'h-14 rounded-lg px-6', text: 'body' },
  /** Height 52: buttons in a row or grid, often three to a row, so they keep their sides tight. */
  compact: { box: 'h-13 rounded-lg px-3', text: 'body-sm' },
  /** Height 44 capsule, used inside cards (Resume). */
  pill: { box: 'h-11 rounded-full px-5', text: 'body-sm' },
} as const satisfies Record<string, { box: string; text: TextVariant }>;

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconWeight?: IconWeight;
  disabled?: boolean;
  accessibilityHint?: string;
  /** Layout within the parent only (flex-1, self-stretch…). */
  className?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconWeight = 'regular',
  disabled,
  accessibilityHint,
  className,
}: ButtonProps) {
  const { surface, tone } = VARIANTS[variant];
  const { box, text } = SIZES[size];

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      className={className}
      contentClassName={`${box} ${surface} flex-row items-center justify-center gap-2 ${
        disabled ? 'opacity-40' : ''
      }`}
    >
      {icon ? <Icon name={icon} size="xs" tone={tone} weight={iconWeight} /> : null}
      {/* One line, always: a long label shrinks a little rather than wrapping ("Dequeu / e"). */}
      <AppText
        variant={text}
        weight="bold"
        tone={tone}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={config.app.minimumLabelScale}
        className="shrink"
      >
        {label}
      </AppText>
    </PressableScale>
  );
}
