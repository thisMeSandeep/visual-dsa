import { View } from 'react-native';

import { AppText } from '@/components/app-text';
import type { CounterName, Counters } from '@/engine/core/types';

/** Shown in this order, each only once it has counted something. */
const ORDER: readonly CounterName[] = ['comparisons', 'reads', 'writes', 'swaps'];

/**
 * Live operation counters for the current step (F-902, VISUAL-SPEC §7 "Counters"): what the
 * operation has cost so far, e.g. "comparisons 3   reads 2". A count that changed on this step
 * is in the signal colour, so the eye catches what just happened.
 */
export function OperationCounters({
  counters,
  previous,
  className,
}: {
  counters: Readonly<Counters>;
  /** The step before, to mark what changed. */
  previous?: Readonly<Counters> | undefined;
  /** Layout only. */
  className?: string;
}) {
  const shown = ORDER.filter((name) => counters[name] > 0);
  if (shown.length === 0) return null;
  return (
    <View
      accessible
      accessibilityLabel={shown.map((name) => `${counters[name]} ${name}`).join(', ')}
      className={`flex-row flex-wrap gap-x-4 gap-y-1 ${className ?? ''}`}
    >
      {shown.map((name) => (
        <AppText
          key={name}
          variant="index"
          tone={previous && previous[name] !== counters[name] ? 'signal-ink' : 'ink-2'}
        >
          {`${name} ${counters[name]}`}
        </AppText>
      ))}
    </View>
  );
}
