import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { IconButton } from '@/components/icon-button';
import { createRng } from '@/engine/core/rng';
import type { Trace } from '@/engine/core/types';
import {
  createStack,
  traceStack,
  type StackModel,
  type StackOperation,
} from '@/engine/structures/stack';
import { SceneView } from '@/viz/scene-view';

import { DevHeader } from '../dev-header';

const CAPACITY = 5;
const START_VALUES = ['23', '8'];
const CANVAS_HEIGHT = 380;
/** Time each step stays on screen while auto-playing (the player store takes over in 4.3). */
const STEP_MS = 900;

/** Dev-only check for Step 4.2: real stack traces drawn by the stack renderer. */
export function DevStack() {
  const rng = useRef(createRng());
  const [model, setModel] = useState<StackModel>(() => createStack(START_VALUES, CAPACITY));
  const [trace, setTrace] = useState<Trace<string | undefined>>(
    () => traceStack(model, { type: 'peek' }).trace,
  );
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(0);

  const step = trace.steps[index];
  const lastIndex = trace.steps.length - 1;

  // Auto-advance through the trace's steps after each operation.
  useEffect(() => {
    if (index >= lastIndex) return;
    const timer = setTimeout(() => setIndex((i) => i + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [index, lastIndex]);

  const run = (operation: StackOperation) => {
    const result = traceStack(model, operation);
    setModel(result.model);
    setTrace(result.trace);
    setIndex(0);
  };

  const reset = () => {
    const fresh = createStack(START_VALUES, CAPACITY);
    setModel(fresh);
    setTrace(traceStack(fresh, { type: 'peek' }).trace);
    setIndex(0);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-6 px-6 pt-safe-offset-4 pb-safe-offset-6"
    >
      <DevHeader title="Stack renderer" />

      <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {width > 0 && step ? (
          <SceneView
            scene={step.scene}
            width={width}
            height={CANVAS_HEIGHT}
            accessibilityLabel={step.a11y}
          />
        ) : null}
      </View>

      <View className="gap-2">
        <AppText variant="overline">
          {trace.operation} · step {index + 1} of {trace.steps.length}
          {trace.error ? ` · ${trace.error.code}` : ''}
        </AppText>
        <AppText variant="code">{step ? JSON.stringify(step.caption) : ''}</AppText>
        <AppText variant="code">
          line: {step?.codeLine ?? '–'} · vars: {JSON.stringify(step?.vars ?? {})}
        </AppText>
        <AppText variant="code">counters: {JSON.stringify(step?.counters ?? {})}</AppText>
        <AppText variant="label">{step?.a11y}</AppText>
      </View>

      <View className="flex-row items-center justify-center gap-6">
        <IconButton
          label="Previous step"
          icon="step-back"
          variant="step"
          disabled={index === 0}
          onPress={() => setIndex((i) => Math.max(0, i - 1))}
        />
        <IconButton
          label="Next step"
          icon="step-forward"
          variant="step"
          disabled={index >= lastIndex}
          onPress={() => setIndex((i) => Math.min(lastIndex, i + 1))}
        />
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
