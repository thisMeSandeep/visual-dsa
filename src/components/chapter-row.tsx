import { Pressable } from 'react-native';

import { AppText } from './app-text';
import { Icon } from './icon';

export type ChapterState = 'done' | 'current' | 'upcoming';

export type ChapterRowProps = {
  number: number;
  title: string;
  state: ChapterState;
  /** Shown on the current chapter, e.g. "Step 6". */
  currentLabel?: string;
  onPress?: () => void;
};

const STATE_TEXT: Record<ChapterState, string> = {
  done: 'completed',
  current: 'in progress',
  upcoming: 'not started',
};

/** Topic-screen chapter row (VISUAL-SPEC §6). The current chapter is tinted cobalt. */
export function ChapterRow({ number, title, state, currentLabel, onPress }: ChapterRowProps) {
  const current = state === 'current';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Chapter ${number}, ${title}, ${STATE_TEXT[state]}`}
      accessibilityState={{ selected: current }}
      onPress={onPress}
      className={
        current
          ? '-mx-3 min-h-12 flex-row items-center gap-3.5 rounded-md bg-primary-soft px-3'
          : '-mx-3 min-h-12 flex-row items-center gap-3.5 rounded-md px-3 active:bg-surface'
      }
    >
      <AppText
        variant="value"
        weight="regular"
        tone={current ? 'primary' : 'muted'}
        className="w-6"
      >
        {String(number)}
      </AppText>
      <AppText
        variant="body"
        weight={current ? 'bold' : 'regular'}
        tone={state === 'upcoming' ? 'ink-2' : 'ink'}
        className="flex-1"
      >
        {title}
      </AppText>
      {state === 'done' ? <Icon name="done" size="sm" tone="success" /> : null}
      {current && currentLabel ? (
        <AppText variant="label" weight="bold" tone="primary">
          {currentLabel}
        </AppText>
      ) : null}
    </Pressable>
  );
}
