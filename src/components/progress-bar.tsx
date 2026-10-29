import { View } from 'react-native';

/** Keeps a ratio inside 0–1, treating NaN as 0. */
export function clampRatio(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

const TRACKS = {
  /** On the page background. */
  default: 'bg-line',
  /** On a primary-tinted card (Continue card). */
  tinted: 'bg-primary-track',
} as const;

export type ProgressBarProps = {
  /** 0–1. */
  value: number;
  track?: keyof typeof TRACKS;
  accessibilityLabel?: string;
  className?: string;
};

/**
 * 4pt progress bar (VISUAL-SPEC §6 "Progress"). The fill and the remaining track share the row
 * through flex ratios, so no widths are calculated.
 */
export function ProgressBar({
  value,
  track = 'default',
  accessibilityLabel,
  className,
}: ProgressBarProps) {
  const ratio = clampRatio(value);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 1, now: ratio }}
      className={`h-1 flex-row overflow-hidden rounded-full ${TRACKS[track]} ${className ?? ''}`}
    >
      <View className="rounded-full bg-primary" style={{ flex: ratio }} />
      <View style={{ flex: 1 - ratio }} />
    </View>
  );
}

export type SegmentedProgressProps = {
  total: number;
  done: number;
  accessibilityLabel?: string;
  className?: string;
};

/** One segment per item, e.g. quiz questions (VISUAL-SPEC §6 "Segmented"). */
export function SegmentedProgress({
  total,
  done,
  accessibilityLabel,
  className,
}: SegmentedProgressProps) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: total, now: done }}
      className={`flex-row gap-1 ${className ?? ''}`}
    >
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          className={
            index < done ? 'h-1 flex-1 rounded-full bg-primary' : 'h-1 flex-1 rounded-full bg-line'
          }
        />
      ))}
    </View>
  );
}
