import { useState, type ReactNode } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { useColor } from '@/theme';

import { AppText, appTextClassName } from './app-text';

export type TextFieldProps = Omit<
  TextInputProps,
  'className' | 'style' | 'placeholderTextColor'
> & {
  label: string;
  /** Keep the label for screen readers only, when the placeholder and context say enough. */
  labelHidden?: boolean;
  /** A small control inside the field, on the right (e.g. a Random button). */
  accessory?: ReactNode;
  /** Shown under the field in `danger`, and the border turns `danger`. */
  error?: string;
  /** Layout within the parent only. */
  className?: string;
};

/**
 * Text input (VISUAL-SPEC §6 "Inputs"): label above, 52 tall, `surface-raised` fill, 1.5pt
 * `line-input` border, `radius-md`, mono value. Focus shows a 2pt `primary` ring; an error
 * shows a `danger` border and the message underneath.
 */
export function TextField({
  label,
  labelHidden = false,
  accessory,
  error,
  className,
  onFocus,
  onBlur,
  ...input
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const placeholder = useColor('muted');
  const border = error
    ? 'border-2 border-danger'
    : focused
      ? 'border-2 border-primary'
      : 'border-control border-line-input';

  return (
    <View className={`gap-1.5 ${className ?? ''}`}>
      {labelHidden ? null : <AppText variant="label">{label}</AppText>}
      <View className={`h-13 flex-row items-center rounded-md bg-surface-raised ${border}`}>
        <TextInput
          accessibilityLabel={label}
          {...(error ? { accessibilityHint: error } : {})}
          placeholderTextColor={placeholder}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          className={appTextClassName(
            { variant: 'value', weight: 'regular' },
            'h-full flex-1 px-4',
          )}
          {...input}
        />
        {accessory ? <View className="pr-1">{accessory}</View> : null}
      </View>
      {error ? (
        <AppText variant="label" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
