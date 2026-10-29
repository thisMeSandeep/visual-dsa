import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { IconButton } from '@/components/icon-button';
import { Scrubber } from '@/components/scrubber';
import { createRng } from '@/engine/core/rng';
import type { Trace } from '@/engine/core/types';
import { nextSpeed } from '@/engine/player/machine';
import {
  createStack,
  traceStack,
  type StackModel,
  type StackOperation,
} from '@/engine/structures/stack';
import {
  playerActions,
  useCanGoBack,
  useCanGoForward,
  useCurrentStep,
  usePlayer,
  usePlayerSpeed,
  usePlayerStatus,
  useStepNumber,
  useTotalSteps,
} from '@/stores/use-player';
import { SceneView } from '@/viz/scene-view';

import { DevHeader } from '../dev-header';

const CAPACITY = 5;
const START_VALUES = ['23', '8'];
const CANVAS_HEIGHT = 380;

/** Dev-only check for Steps 4.2 and 4.3: real stack traces, played by the player store. */
export function DevStack() {
  const rng = useRef(createRng());
  const [model, setModel] = useState<StackModel>(() => createStack(START_VALUES, CAPACITY));
  const [trace, setTrace] = useState<Trace<string | undefined>>(
    () => traceStack(model, { type: 'peek' }).trace,
  );
  const [width, setWidth] = useState(0);

  const player = usePlayer(trace.steps);
  const actions = playerActions(player);
  const step = useCurrentStep(player);
  const status = usePlayerStatus(player);
  const speed = usePlayerSpeed(player);
  const stepNumber = useStepNumber(player);
  const total = useTotalSteps(player);
  const canBack = useCanGoBack(player);
  const canForward = useCanGoForward(player);

  // Each new operation plays its trace from the start.
  useEffect(() => {
    playerActions(player).play();
  }, [player, trace]);

  const run = (operation: StackOperation) => {
    const result = traceStack(model, operation);
    setModel(result.model);
    setTrace(result.trace);
  };

  const reset = () => {
    const fresh = createStack(START_VALUES, CAPACITY);
    setModel(fresh);
    setTrace(traceStack(fresh, { type: 'peek' }).trace);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-6 px-6 pt-safe-offset-4 pb-safe-offset-6"
    >
      <DevHeader title="Stack player" />

      <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {width > 0 && step ? (
          <SceneView
            scene={step.scene}
            width={width}
            height={CANVAS_HEIGHT}
            speed={speed}
            accessibilityLabel={step.a11y}
          />
        ) : null}
      </View>

      <Scrubber current={stepNumber} total={total} />

      <View className="flex-row items-center justify-between">
        <IconButton
          label="Playback speed"
          text={`${speed}×`}
          variant="round"
          onPress={() => actions.setSpeed(nextSpeed(speed))}
        />
        <IconButton
          label="Previous step"
          icon="step-back"
          variant="step"
          disabled={!canBack}
          onPress={actions.prev}
        />
        <IconButton
          label={status === 'playing' ? 'Pause' : 'Play'}
          icon={status === 'playing' ? 'pause' : 'play'}
          variant="play"
          onPress={status === 'playing' ? actions.pause : actions.play}
        />
        <IconButton
          label="Next step"
          icon="step-forward"
          variant="step"
          disabled={!canForward}
          onPress={actions.next}
        />
        <IconButton label="Restart" icon="reset" variant="round" onPress={() => actions.seek(0)} />
      </View>

      <View className="gap-2">
        <AppText variant="overline">
          {trace.operation} · {status}
          {trace.error ? ` · ${trace.error.code}` : ''}
        </AppText>
        <AppText variant="code">{step ? JSON.stringify(step.caption) : ''}</AppText>
        <AppText variant="code">
          line: {step?.codeLine ?? '–'} · vars: {JSON.stringify(step?.vars ?? {})}
        </AppText>
        <AppText variant="code">counters: {JSON.stringify(step?.counters ?? {})}</AppText>
        <AppText variant="label">{step?.a11y}</AppText>
      </View>

      <View className="gap-3">
        <View className="flex-row gap-3">
          <Button
            label="Push"
            size="compact"
            className="flex-1"
            onPress={() => run({ type: 'push', value: String(rng.current.int(0, 99)) })}
          />
          <Button
            label="Pop"
            variant="tinted"
            size="compact"
            className="flex-1"
            onPress={() => run({ type: 'pop' })}
          />
          <Button
            label="Peek"
            variant="tinted"
            size="compact"
            className="flex-1"
            onPress={() => run({ type: 'peek' })}
          />
        </View>
        <View className="flex-row gap-3">
          <Button
            label="Clear"
            variant="tinted"
            size="compact"
            className="flex-1"
            onPress={() => run({ type: 'clear' })}
          />
          <Button
            label="Reset"
            variant="tinted"
            size="compact"
            className="flex-1"
            onPress={reset}
          />
        </View>
        <AppText variant="label">
          Capacity {CAPACITY}. Push until it overflows, or pop until it underflows, to see the error
          state.
        </AppText>
      </View>
    </ScrollView>
  );
}
