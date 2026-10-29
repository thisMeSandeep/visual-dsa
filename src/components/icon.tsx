import { View } from 'react-native';

import { useColor, useIconSizes, useIconStyle, type ColorToken, type IconSize } from '@/theme';

import { ICONS, type IconName } from './icons';

/**
 * Regular for UI icons, fill for active/selected states and filled glyphs (play, streak),
 * duotone only for accent spots such as empty states and badges (VISUAL-SPEC §5).
 */
export type IconWeight = 'regular' | 'fill' | 'duotone';

export type IconProps = {
  name: IconName;
  /** xs 18 (in buttons) · sm 20 (small icon buttons) · md 22 (headers) · lg 24 (tab bar) */
  size?: IconSize;
  tone?: ColorToken;
  weight?: IconWeight;
  /**
   * Set when the icon carries meaning on its own (e.g. a "Completed" check). Leave it out for
   * icons next to text or inside a labelled button: those are decorative and hidden from
   * screen readers.
   */
  label?: string;
  /** Layout only (margins, alignment). */
  className?: string;
};

export function Icon({
  name,
  size = 'md',
  tone = 'ink',
  weight = 'regular',
  label,
  className,
}: IconProps) {
  const Glyph = ICONS[name];
  const sizes = useIconSizes();
  const { duotoneOpacity } = useIconStyle();
  const color = useColor(tone);

  return (
    <View
      className={className}
      accessible={Boolean(label)}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
      accessibilityElementsHidden={!label}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
    >
      <Glyph
        size={sizes[size]}
        color={color}
        weight={weight}
        duotoneColor={color}
        duotoneOpacity={duotoneOpacity}
      />
    </View>
  );
}
