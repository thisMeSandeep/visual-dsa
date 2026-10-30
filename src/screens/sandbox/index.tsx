import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { CaptionText } from '@/components/caption-text';
import { IconButton } from '@/components/icon-button';
import { KeyboardAvoidingView } from '@/components/keyboard-avoiding-view';
import { SegmentedControl } from '@/components/segmented-control';
import { Scrubber } from '@/components/scrubber';
import { TextField } from '@/components/text-field';
import { config } from '@/config';
import { getTopicMeta, isTopicId, TOPIC_SANDBOXES } from '@/content/registry';
import type { SandboxConfig, TopicMeta } from '@/content/schema';
import { createRng } from '@/engine/core/rng';
import { restingStep, STRUCTURES } from '@/engine/lesson/structures';
import {
  applyOperation,
  canUndo,
  loadPreset,
  reset,
  startSession,
  undo,
  type RestStep,
  type SandboxSession,
} from '@/engine/sandbox/session';
import { useSettings } from '@/stores/settings';
import {
  playerActions,
  useCurrentStep,
  usePlayer,
  useStepNumber,
  useTotalSteps,
} from '@/stores/use-player';
import { SceneView } from '@/viz/scene-view';

import { ScreenPlaceholder } from '../placeholder';
import { parseExpression } from './expression-input';
import { parseIndex } from './index-input';
import { parseTarget, parseValue } from './value-input';

/**
 * Sandbox / Play mode (F-601–F-603, F-606): run any operation on a live structure. A topic can
 * have several tools (the Stack has the stack and the bracket checker); a switch at the top of
 * the dock picks one, starting it fresh.
 */
export function Sandbox({ topicId }: { topicId: string }) {
  const meta = getTopicMeta(topicId);
  const tools = isTopicId(topicId) ? TOPIC_SANDBOXES[topicId] : undefined;
  const [toolId, setToolId] = useState(tools?.[0]?.id);
  const tool = tools?.find((item) => item.id === toolId) ?? tools?.[0];

  if (!meta) {
    return <ScreenPlaceholder back title="Topic not found" note="This sandbox doesn’t exist." />;
  }
  if (!tools || !tool) {
    return (
      <ScreenPlaceholder
        back
        overline={meta.title}
        title="Sandbox"
        note="This sandbox arrives with its topic. The Stack sandbox is ready to try now."
      />
    );
  }
  return (
    <Playground key={tool.id} meta={meta} sandbox={tool} tools={tools} onToolChange={setToolId} />
  );
}

type Operation = SandboxConfig['operations'][number];
type Preset = SandboxConfig['presets'][number];

const UNDONE = 'Undone: back to before the last change.';

/** Operations that take a key: an index (array) or the node to insert next to (lists). */
const takesKey = (operation: Operation) =>
  operation.input === 'index' ||
  operation.input === 'index-value' ||
  operation.input === 'target-value';
const takesValue = (operation: Operation) =>
  operation.input === 'value' ||
  operation.input === 'index-value' ||
  operation.input === 'target-value';

/** The key field's name and how its text is checked, for each kind of key. */
const KEY_FIELDS = {
  index: { label: 'Index', parse: parseIndex },
  target: { label: 'Node', parse: parseTarget },
} as const;

/** Splits `items` into rows of `size`, for a grid of buttons. */
const rows = <T,>(items: readonly T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, row) =>
    items.slice(row * size, (row + 1) * size),
  );

/** The expression a bracket-checker preset starts with, to show in the field. */
const presetExpression = (preset: Preset): string => {
  const input = preset.input as { expression?: unknown } | undefined;
  return typeof input?.expression === 'string' ? input.expression : '';
};

function Playground({
  meta,
  sandbox,
  tools,
  onToolChange,
}: {
  meta: TopicMeta;
  sandbox: SandboxConfig;
  tools: readonly SandboxConfig[];
  onToolChange: (toolId: string) => void;
}) {
  // Content validation checks the structure, its operations and every preset.
  const definition = STRUCTURES[sandbox.structure]!;
  const firstPreset = sandbox.presets[0]!;
  const build = (preset: Preset) => definition.create(preset.input, `presets.${preset.id}`);
  const restWith =
    (caption: string): RestStep<unknown> =>
    (model) =>
      restingStep(definition, model, { text: caption });

  const [preset, setPreset] = useState<Preset>(firstPreset);
  const [session, setSession] = useState<SandboxSession<unknown>>(() =>
    startSession(build(firstPreset), restWith(firstPreset.hint)),
  );
  const [primary, ...secondary] = sandbox.operations;
  // The expression field starts filled with the preset's expression, ready to check.
  const [text, setText] = useState(() =>
    primary?.input === 'expression' ? presetExpression(firstPreset) : '',
  );
  const [problem, setProblem] = useState<string>();
  // Tools whose operations take a key (the array's index, a list's node) get a second field.
  const keyed = sandbox.operations.some(takesKey);
  const keyField =
    KEY_FIELDS[
      sandbox.operations.some((operation) => operation.input === 'target-value')
        ? 'target'
        : 'index'
    ];
  const [keyText, setKeyText] = useState('');
  const [keyProblem, setKeyProblem] = useState<string>();
  const [rng] = useState(() => createRng(Date.now()));

  // Each operation's trace plays from its first step at the learner's speed.
  const defaultSpeed = useSettings((state) => state.defaultSpeed);
  const player = usePlayer(session.steps, 0, defaultSpeed);
  const actions = playerActions(player);
  const step = useCurrentStep(player);
  const number = useStepNumber(player);
  const total = useTotalSteps(player);
  useEffect(() => {
    if (session.steps.length > 1) playerActions(player).play();
  }, [player, session.steps]);

  const [canvas, setCanvas] = useState({ width: 0, height: 0 });

  const run = (operation: Operation) => {
    const fields: Record<string, unknown> = {};
    // Check every field the operation needs, so both problems show at once.
    let ok = true;
    if (takesKey(operation)) {
      const parsed = keyField.parse(keyText);
      if (!parsed.ok) {
        setKeyProblem(parsed.problem);
        ok = false;
      } else if ('index' in parsed) fields.index = parsed.index;
      else fields.target = parsed.value;
    }
    if (takesValue(operation)) {
      const parsed = parseValue(text);
      if (parsed.ok) fields.value = parsed.value;
      else {
        setProblem(parsed.problem);
        ok = false;
      }
    } else if (operation.input === 'expression') {
      const parsed = parseExpression(text);
      if (parsed.ok) fields.expression = parsed.expression;
      else {
        setProblem(parsed.problem);
        ok = false;
      }
    }
    if (!ok) return;

    // A value is used up; an index and an expression stay, ready to run again.
    if (takesValue(operation)) setText('');
    if (typeof fields.expression === 'string') setText(fields.expression);
    setProblem(undefined);
    setKeyProblem(undefined);
    const input = operation.input ? fields : undefined;
    const result = definition.operations[operation.id]!(session.model, input, 'sandbox');
    setSession(applyOperation(session, result));
  };

  const choosePreset = (next: Preset) => {
    setPreset(next);
    setSession(loadPreset(session, build(next), restWith(next.hint)));
    if (primary?.input === 'expression') {
      setText(presetExpression(next));
      setProblem(undefined);
    }
  };

  const valueRange = config.engine.valueRange;

  const stats = sandbox.stats.map((stat) => ({
    label: stat.label,
    value: String(step?.scene.meta?.[stat.key] ?? '–'),
  }));

  return (
    // The dock rises with the keyboard on both platforms; the canvas shrinks to make room.
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-background pt-safe">
      <View className="flex-row items-center px-3">
        <IconButton icon="back" label="Back" onPress={() => router.back()} />
        <View className="flex-1 items-center">
          <AppText variant="overline" weight="bold" tone="mode-sandbox-ink">
            Sandbox
          </AppText>
          <AppText variant="body-sm" weight="bold" tone="ink" numberOfLines={1}>
            {meta.title}
          </AppText>
        </View>
        <IconButton
          icon="undo"
          label="Undo"
          disabled={!canUndo(session)}
          onPress={() => setSession(undo(session, restWith(UNDONE)))}
        />
        <IconButton
          icon="reset"
          label="Reset"
          onPress={() => setSession(reset(session, restWith(preset.hint)))}
        />
      </View>

      {/* The canvas: most of the screen, in a soft panel with the stats pinned to its corner. */}
      <View className="flex-1 px-4 pt-2">
        <View className="flex-1 overflow-hidden rounded-xl bg-surface">
          <View className="flex-row flex-wrap gap-2 px-3 pt-3">
            {stats.map((stat) => (
              <View
                key={stat.label}
                accessible
                accessibilityLabel={`${stat.label}: ${stat.value}`}
                className="h-7 flex-row items-center gap-1.5 rounded-full border-hairline border-line bg-surface-raised px-3"
              >
                <AppText variant="label">{stat.label}</AppText>
                <AppText variant="index" tone="ink">
                  {stat.value}
                </AppText>
              </View>
            ))}
          </View>
          <View
            className="flex-1 p-3"
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setCanvas({ width, height });
            }}
          >
            {step && canvas.width > 0 && canvas.height > 0 ? (
              <SceneView
                scene={step.scene}
                width={canvas.width}
                height={canvas.height}
                speed={defaultSpeed}
                accessibilityLabel={step.a11y}
              />
            ) : null}
          </View>
        </View>
      </View>

      <View className="gap-2 px-6 pt-3">
        {/* Two caption lines, so the dock doesn't jump between steps. */}
        <View className="min-h-14 justify-center">
          {step ? <CaptionText caption={step.caption} /> : null}
        </View>
        {total > 1 ? <Scrubber current={number} total={total} onSeek={actions.seek} /> : null}
      </View>

      {/* The dock: every control in one card. */}
      <View className="mx-4 mt-3 mb-safe-offset-3 gap-3 rounded-xl border-hairline border-line-strong bg-surface-raised p-3">
        {tools.length > 1 ? (
          <SegmentedControl
            label="Tool"
            options={tools.map((item) => ({ value: item.id, label: item.label }))}
            value={sandbox.id}
            onChange={onToolChange}
          />
        ) : null}
        <SegmentedControl
          label="Starting state"
          options={sandbox.presets.map((option) => ({ value: option.id, label: option.label }))}
          value={preset.id}
          onChange={(id) => {
            const next = sandbox.presets.find((option) => option.id === id);
            if (next) choosePreset(next);
          }}
        />

        {keyed ? (
          <>
            <View className="flex-row items-start gap-2">
              <TextField
                label={keyField.label}
                labelHidden
                value={keyText}
                onChangeText={(next) => {
                  setKeyText(next);
                  setKeyProblem(undefined);
                }}
                error={keyProblem}
                keyboardType="number-pad"
                returnKeyType="done"
                placeholder={keyField.label}
                className="w-24"
              />
              <TextField
                label={`Value (${valueRange.min}–${valueRange.max})`}
                labelHidden
                value={text}
                onChangeText={(next) => {
                  setText(next);
                  setProblem(undefined);
                }}
                error={problem}
                keyboardType="number-pad"
                returnKeyType="done"
                placeholder={`Value ${valueRange.min}–${valueRange.max}`}
                accessory={
                  <IconButton
                    icon="random"
                    label="Random value"
                    onPress={() => {
                      setText(String(rng.int(valueRange.min, valueRange.max)));
                      setProblem(undefined);
                    }}
                  />
                }
                className="flex-1"
              />
            </View>
            {rows(sandbox.operations, config.sandbox.buttonsPerRow).map((row) => (
              <View key={row[0]!.id} className="flex-row gap-2">
                {row.map((operation) => (
                  <Button
                    key={operation.id}
                    label={operation.label}
                    variant={operation === primary ? 'primary' : 'tinted'}
                    size="compact"
                    className="flex-1"
                    onPress={() => run(operation)}
                  />
                ))}
              </View>
            ))}
          </>
        ) : primary?.input === 'value' ? (
          <View className="flex-row items-start gap-2">
            <TextField
              label={`Value (${valueRange.min}–${valueRange.max})`}
              labelHidden
              value={text}
              onChangeText={(next) => {
                setText(next);
                setProblem(undefined);
              }}
              error={problem}
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={() => run(primary)}
              placeholder={`Value ${valueRange.min}–${valueRange.max}`}
              accessory={
                <IconButton
                  icon="random"
                  label="Random value"
                  onPress={() => {
                    setText(String(rng.int(valueRange.min, valueRange.max)));
                    setProblem(undefined);
                  }}
                />
              }
              className="flex-1"
            />
            <Button label={primary.label} size="compact" onPress={() => run(primary)} />
          </View>
        ) : primary?.input === 'expression' ? (
          <View className="flex-row items-start gap-2">
            <TextField
              label="Expression"
              labelHidden
              value={text}
              onChangeText={(next) => {
                setText(next);
                setProblem(undefined);
              }}
              error={problem}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={() => run(primary)}
              placeholder="Expression, e.g. (1+2)*3"
              className="flex-1"
            />
            <Button label={primary.label} size="compact" onPress={() => run(primary)} />
          </View>
        ) : primary ? (
          <Button label={primary.label} size="compact" onPress={() => run(primary)} />
        ) : null}

        {!keyed && secondary.length > 0 ? (
          <View className="flex-row gap-2">
            {secondary.map((operation) => (
              <Button
                key={operation.id}
                label={operation.label}
                variant="tinted"
                size="compact"
                className="flex-1"
                onPress={() => run(operation)}
              />
            ))}
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}
