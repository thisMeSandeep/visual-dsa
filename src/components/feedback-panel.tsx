import { View } from 'react-native';

import { AppText } from './app-text';
import { Button } from './button';
import { Icon } from './icon';

const RESULTS = {
  correct: {
    surface: 'bg-success-soft',
    icon: 'done',
    iconTone: 'success',
    titleTone: 'success-ink',
  },
  incorrect: {
    surface: 'bg-danger-soft',
    icon: 'incorrect',
    iconTone: 'danger',
    titleTone: 'danger',
  },
} as const;

export type FeedbackResult = keyof typeof RESULTS;

export type FeedbackPanelProps = {
  result: FeedbackResult;
  /** "Correct" / "Not quite" */
  title: string;
  /** Why, in one or two sentences. */
  explanation: string;
  actionLabel: string;
  onAction?: () => void;
  /** An optional second action beside the main one, e.g. "See in lesson". */
  secondaryLabel?: string;
  onSecondary?: () => void;
};

/**
 * Answer feedback at the bottom of a practice question (VISUAL-SPEC §6). The result is shown
 * by icon and heading as well as colour, so it doesn't rely on colour alone.
 */
export function FeedbackPanel({
  result,
  title,
  explanation,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: FeedbackPanelProps) {
  const spec = RESULTS[result];

  return (
    <View accessibilityLiveRegion="polite" className={`gap-4 rounded-xl p-5 ${spec.surface}`}>
      <View className="gap-1.5">
        <View className="flex-row items-center gap-2">
          <Icon name={spec.icon} size="sm" tone={spec.iconTone} />
          <AppText variant="body" weight="bold" tone={spec.titleTone} accessibilityRole="header">
            {title}
          </AppText>
        </View>
        <AppText variant="body-sm">{explanation}</AppText>
      </View>
      {secondaryLabel ? (
        <View className="flex-row gap-3">
          <Button
            label={secondaryLabel}
            variant="tinted"
            size="compact"
            className="flex-1"
            onPress={onSecondary}
          />
          <Button label={actionLabel} size="compact" className="flex-1" onPress={onAction} />
        </View>
      ) : (
        <Button label={actionLabel} onPress={onAction} />
      )}
    </View>
  );
}
