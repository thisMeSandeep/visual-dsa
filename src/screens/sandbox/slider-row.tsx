import { Host, Slider } from '@expo/ui';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { config } from '@/config';
import { useActiveTheme, useColor } from '@/theme';

import { positionOf, valueAt, type SliderRange } from './slider-scale';

/**
 * A labelled native slider for one value, such as Big O's n. While it moves, the label follows;
 * once it has been still for a moment it reports the value, so a drag is one change (and one
 * undo), not one per pixel. Between drags it shows `value`, so it follows undo and presets.
 */
export function SliderRow({
  label,
  value,
  range,
  onSettle,
}: {
  label: string;
  value: number;
  range: SliderRange;
  onSettle: (value: number) => void;
}) {
  const theme = useActiveTheme();
  const primary = useColor('primary');
  const [dragging, setDragging] = useState<number>();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const position = dragging ?? positionOf(value, range);
  const shown = valueAt(position, range);

  return (
    <View className="flex-row items-center gap-3">
      <AppText variant="label" weight="bold" tone="ink" className="w-20">
        {`${label} = ${shown}`}
      </AppText>
      <Host
        matchContents={{ vertical: true }}
        colorScheme={theme}
        seedColor={primary}
        style={styles.fill}
      >
        <Slider
          testID={`slider-${label}`}
          value={position}
          min={0}
          max={config.sandbox.sliderPositions}
          step={1}
          onValueChange={(next) => {
            setDragging(next);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => {
              setDragging(undefined);
              onSettle(valueAt(next, range));
            }, config.sandbox.sliderSettleMs);
          }}
        />
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
