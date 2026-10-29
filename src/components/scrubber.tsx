import { useRef, useState } from 'react';
import { View, type AccessibilityActionEvent } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';

import { AppText } from './app-text';
import { clampRatio } from './progress-bar';

export type ScrubberProps = {
  /** 1-based step currently shown. */
  current: number;
  total: number;
  /** When given, tapping or dragging along the track seeks (F-403). Receives a 0-based index. */
  onSeek?: (index: number) => void;
  className?: string;
};

const ADJUST_ACTIONS = [{ name: 'increment' }, { name: 'decrement' }] as const;

/**
 * Step position with a knob (VISUAL-SPEC §6 "Scrubber"). With `onSeek` it's a control: drag or
 * tap the track to jump to a step, or swipe up/down with a screen reader.
 */
export function Scrubber({ current, total, onSeek, className }: ScrubberProps) {
  const ratio = clampRatio(total > 0 ? current / total : 0);
  const [trackWidth, setTrackWidth] = useState(0);
  const lastSought = useRef<number | null>(null);

  const seekTo = (x: number) => {
    if (!onSeek || trackWidth <= 0 || total <= 0) return;
    const index = Math.round(clampRatio(x / trackWidth) * (total - 1));
    // Dragging reports many positions; only seek when the step actually changes.
    if (index === lastSought.current) return;
    lastSought.current = index;
    onSeek(index);
  };

  const pan = usePanGesture({
    enabled: Boolean(onSeek),
    minDistance: 0,
    runOnJS: true,
    onBegin: (event) => seekTo(event.x),
    onUpdate: (event) => seekTo(event.x),
    onFinalize: () => {
      lastSought.current = null;
    },
  });

  // Padding makes the touch area 44pt tall around the thin track.
  const track = (
    <View className="flex-1 py-4">
      <View
        className="h-3.5 flex-row items-center"
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      >
        <View className="h-1 rounded-full bg-primary" style={{ flex: ratio }} />
        <View className="-mx-1.75 h-3.5 w-3.5 rounded-full bg-primary" />
        <View className="h-1 rounded-full bg-line" style={{ flex: 1 - ratio }} />
      </View>
    </View>
  );

  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (!onSeek) return;
    const index = current - 1;
    if (event.nativeEvent.actionName === 'increment') onSeek(Math.min(total - 1, index + 1));
    if (event.nativeEvent.actionName === 'decrement') onSeek(Math.max(0, index - 1));
  };

  return (
    <View
      accessible
      accessibilityLabel={`Step ${current} of ${total}`}
      {...(onSeek
        ? {
            accessibilityRole: 'adjustable' as const,
            accessibilityActions: ADJUST_ACTIONS,
            onAccessibilityAction,
          }
        : {})}
      className={`flex-row items-center gap-3 ${className ?? ''}`}
    >
      <AppText variant="index" tone="ink" className="min-w-5">
        {String(current)}
      </AppText>
      {onSeek ? <GestureDetector gesture={pan}>{track}</GestureDetector> : track}
      <AppText variant="index" className="min-w-5 text-right">
        {String(total)}
      </AppText>
    </View>
  );
}
