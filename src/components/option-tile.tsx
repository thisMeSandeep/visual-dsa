import { View } from 'react-native';

import { AppText } from './app-text';
import { Icon } from './icon';
import { PressableScale } from './pressable-scale';

/** How a tile looks: before answering, or after (right, wrong pick, or one of the others). */
export type OptionState = 'idle' | 'correct' | 'wrong' | 'faded';

/**
 * - `value`: a short mono answer (O(1), 42), large and centred, two to a row.
 * - `word`: a short word answer (True, False), large and centred, two to a row.
 * - `text`: a sentence, left-aligned, one per row.
 */
export type OptionLayout = 'value' | 'word' | 'text';

const STATE_CLASS: Record<OptionState, string> = {
  idle: 'border-control border-line-strong bg-surface-raised',
  correct: 'border-2 border-success bg-success-soft',
  wrong: 'border-2 border-danger bg-danger-soft',
  faded: 'border-control border-line-strong bg-surface-raised opacity-50',
};

const STATE_TEXT: Record<OptionState, string | undefined> = {
  idle: undefined,
  correct: 'correct answer',
  wrong: 'your answer, not right',
  faded: undefined,
};

export type OptionTileProps = {
  text: string;
  state: OptionState;
  layout: OptionLayout;
  onPress?: () => void;
  /** After answering, tiles stop responding. */
  disabled?: boolean;
  className?: string;
};

/**
 * A quiz answer (VISUAL-SPEC §6 "Quiz option tile"). Once answered, the right answer turns
 * `success` with a check, a wrong pick turns `danger` with an X, and the rest fade, so the
 * result never relies on colour alone.
 */
export function OptionTile({ text, state, layout, onPress, disabled, className }: OptionTileProps) {
  const badge =
    state === 'correct' ? (
      <Icon name="done" size="sm" tone="success" />
    ) : state === 'wrong' ? (
      <Icon name="incorrect" size="sm" tone="danger" />
    ) : null;
  const spoken = STATE_TEXT[state];

  return (
    <PressableScale
      accessibilityRole="radio"
      accessibilityLabel={spoken ? `${text}, ${spoken}` : text}
      accessibilityState={{ checked: state === 'correct' || state === 'wrong', disabled }}
      onPress={onPress}
      disabled={disabled}
      className={className}
      contentClassName={`rounded-lg ${STATE_CLASS[state]} ${
        layout === 'text'
          ? 'min-h-14 flex-row items-center gap-3 px-4 py-3'
          : 'h-23 items-center justify-center px-3'
      }`}
    >
      {layout === 'text' ? (
        <>
          <AppText variant="body" className="flex-1">
            {text}
          </AppText>
          {badge}
        </>
      ) : (
        <>
          <AppText variant={layout === 'value' ? 'value-xl' : 'headline'}>{text}</AppText>
          {badge ? <View className="absolute top-2.5 right-2.5">{badge}</View> : null}
        </>
      )}
    </PressableScale>
  );
}
