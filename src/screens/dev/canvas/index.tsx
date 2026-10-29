import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { IconButton } from '@/components/icon-button';
import { config } from '@/config';
import type { ElementState } from '@/engine/core/types';
import { useVizSizes, type VizSizes } from '@/theme';
import { VizCanvas, type Drawable } from '@/viz/canvas';

import { DevHeader } from '../dev-header';

/* Four snapshots of an array that exercise every kind of change between steps. */
type Cell = { id: string; value: string; state: ElementState };
type Snapshot = { caption: string; cells: Cell[]; pointerAt?: number };

const SNAPSHOTS: Snapshot[] = [
  {
    caption: 'At rest: four cells, all default.',
    cells: [
      { id: 'a', value: '5', state: 'default' },
      { id: 'b', value: '3', state: 'default' },
      { id: 'c', value: '8', state: 'default' },
      { id: 'd', value: '1', state: 'default' },
    ],
  },
  {
    caption: 'Restyle: comparing 5 and 3 (orange), pointer j appears.',
    pointerAt: 0,
    cells: [
      { id: 'a', value: '5', state: 'active' },
      { id: 'b', value: '3', state: 'active' },
      { id: 'c', value: '8', state: 'default' },
      { id: 'd', value: '1', state: 'default' },
    ],
  },
  {
    caption: 'Move and enter: 5 and 3 swap places, 9 grows in, j moves on.',
    pointerAt: 1,
    cells: [
      { id: 'b', value: '3', state: 'default' },
      { id: 'a', value: '5', state: 'swapping' },
      { id: 'c', value: '8', state: 'default' },
      { id: 'd', value: '1', state: 'default' },
      { id: 'e', value: '9', state: 'new' },
    ],
  },
  {
    caption: 'Exit and states: 1 fades out; visited, error (dashed), found, dimmed.',
    pointerAt: 3,
    cells: [
      { id: 'b', value: '3', state: 'dimmed' },
      { id: 'a', value: '5', state: 'visited' },
      { id: 'c', value: '8', state: 'error' },
      { id: 'e', value: '9', state: 'found' },
    ],
  },
];

/** A simple row layout, good enough to exercise the canvas (real renderers arrive in Step 4.2). */
function layoutRow(snapshot: Snapshot, sizes: VizSizes) {
  const step = sizes.cellWidth + sizes.gap;
  const top = sizes.fontIndex + sizes.labelGap;
  const cellsBottom = top + sizes.cellHeight;
  const arrowLength = sizes.cellHeight / 2;

  const drawables: Drawable[] = snapshot.cells.flatMap((cell, index) => [
    {
      kind: 'text',
      id: `index-${index}`,
      x: index * step + sizes.cellWidth / 2,
      y: sizes.fontIndex / 2,
      text: String(index),
      font: 'index',
      tone: 'muted',
      align: 'center',
    },
    {
      kind: 'box',
      id: cell.id,
      x: index * step,
      y: top,
      width: sizes.cellWidth,
      height: sizes.cellHeight,
      state: cell.state,
      value: cell.value,
    },
  ]);

  if (snapshot.pointerAt !== undefined) {
    const x = snapshot.pointerAt * step + sizes.cellWidth / 2;
    drawables.push(
      {
        kind: 'line',
        id: 'pointer-j-arrow',
        x1: x,
        y1: cellsBottom + sizes.labelGap + arrowLength,
        x2: x,
        y2: cellsBottom + sizes.labelGap,
        tone: 'signal',
        arrow: true,
      },
      {
        kind: 'text',
        id: 'pointer-j',
        x,
        y: cellsBottom + 2 * sizes.labelGap + arrowLength + sizes.fontLabel / 2,
        text: 'j',
        font: 'label',
        tone: 'signal-ink',
        align: 'center',
      },
    );
  }

  const height = cellsBottom + 3 * sizes.labelGap + arrowLength + sizes.fontLabel + sizes.labelGap;
  return { drawables, height };
}

const SPEEDS = config.player.speeds.filter((speed) => speed === 0.25 || speed === 1 || speed === 2);

/** Dev-only check for Step 4.1: animation between snapshots on the Skia canvas. */
export function DevCanvas() {
  const sizes = useVizSizes();
  const [index, setIndex] = useState(0);
  const [speed, setSpeed] = useState<number>(config.player.defaultSpeed);
  const [width, setWidth] = useState(0);

  const snapshot = SNAPSHOTS[index] ?? SNAPSHOTS[0]!;
  const { drawables, height } = layoutRow(snapshot, sizes);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-7 px-6 pt-safe-offset-4 pb-safe-offset-6"
    >
      <DevHeader title="Canvas" />

      <View className="gap-3">
        <AppText variant="overline">
          Snapshot {index + 1} of {SNAPSHOTS.length}
        </AppText>
        <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
          {width > 0 ? (
            <VizCanvas
              drawables={drawables}
              width={width}
              height={height}
              speed={speed}
              accessibilityLabel={snapshot.caption}
            />
          ) : null}
        </View>
        <AppText variant="caption">{snapshot.caption}</AppText>
      </View>

      <View className="flex-row items-center justify-center gap-6">
        <IconButton
          label="Previous snapshot"
          icon="step-back"
          variant="step"
          disabled={index === 0}
          onPress={() => setIndex((i) => Math.max(0, i - 1))}
        />
        <IconButton
          label="Next snapshot"
          icon="step-forward"
          variant="step"
          disabled={index === SNAPSHOTS.length - 1}
          onPress={() => setIndex((i) => Math.min(SNAPSHOTS.length - 1, i + 1))}
        />
      </View>

      <View className="gap-3">
        <AppText variant="overline">Speed (slow it down to watch)</AppText>
        <View className="flex-row gap-3">
          {SPEEDS.map((option) => (
            <Button
              key={option}
              label={`${option}×`}
              size="compact"
              variant={option === speed ? 'primary' : 'tinted'}
              className="flex-1"
              onPress={() => setSpeed(option)}
            />
          ))}
        </View>
        <AppText variant="label">
          Turn on Reduce Motion in system settings: moves become instant and only colours fade.
        </AppText>
      </View>
    </ScrollView>
  );
}
