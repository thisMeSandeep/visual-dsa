/**
 * Balanced brackets, the classic stack example (ALGORITHM-CATALOG L5, "balancing parentheses").
 * Read the expression left to right: push every opening bracket; a closing bracket must match
 * the opening bracket on top, which is then popped. Balanced when the stack ends empty.
 *
 * Code line ids used: scan, push-open, close-empty, close-match, mismatch, pop-open, unclosed,
 * balanced. Caption keys: brackets.start, brackets.open, brackets.match, brackets.popped,
 * brackets.unmatched, brackets.mismatch, brackets.unclosed, brackets.balanced.
 */
import { config } from '@/config';

import { runTrace, type Tracer } from '../../core/tracer';
import type { ElementState, Scene, SceneElement, Trace } from '../../core/types';
import { describeStack } from './describe';
import { createStack, itemId, top, withPushed, withoutTop, type StackModel } from './model';
import { stackToScene, type StackAnnotations } from './to-scene';

/** Closing bracket → the opening bracket it closes. */
const PARTNERS: Readonly<Record<string, string>> = { ')': '(', ']': '[', '}': '{' };
const OPENING = new Set(Object.values(PARTNERS));

/** How many opening brackets an expression has: the most its stack must hold. */
export const openingCount = (expression: string) =>
  [...expression].filter((char) => OPENING.has(char)).length;

export type BracketsModel = Readonly<{
  expression: string;
  /** Index of the character being read; -1 before the first, the length once done. */
  position: number;
  /** The opening brackets still waiting for a partner. */
  stack: StackModel;
}>;

export type BracketsAnnotations = StackAnnotations & {
  /** How the character being read is drawn: active, found (matched) or error. */
  current?: ElementState;
};

/**
 * A checker for `expression`. The stack is sized to hold every opening bracket, so it can never
 * overflow; throws RangeError for an empty expression, one that's too long to draw, or one with
 * more opening brackets than a stack can hold.
 */
export function createBrackets(expression: string): BracketsModel {
  const { maxLength } = config.structures.brackets;
  if (expression.length === 0 || expression.length > maxLength) {
    throw new RangeError(`An expression needs 1–${maxLength} characters, got ${expression.length}`);
  }
  return {
    expression,
    position: -1,
    stack: createStack([], Math.max(1, openingCount(expression))),
  };
}

export const charId = (index: number) => `char-${index}`;

/**
 * Checker → scene: the stack scene plus the expression as a row of input cells. Characters
 * already read are dimmed, the current one is highlighted.
 */
export function bracketsToScene(
  model: BracketsModel,
  annotations: BracketsAnnotations = {},
): Scene {
  const stackScene = stackToScene(model.stack, annotations);
  const chars: SceneElement[] = [...model.expression].map((char, index) => ({
    kind: 'cell',
    id: charId(index),
    value: char,
    state:
      index === model.position
        ? (annotations.current ?? 'active')
        : index < model.position
          ? 'dimmed'
          : 'default',
    slot: { type: 'input', index },
  }));
  return {
    ...stackScene,
    elements: [...chars, ...stackScene.elements],
    meta: { ...stackScene.meta, expression: model.expression, position: model.position },
  };
}

/** e.g. "Reading ((5+3)+1)(2+9), at character 2: (. Stack of 2 items…" */
export function describeBrackets(scene: Scene): string {
  const expression = String(scene.meta?.expression ?? '');
  const position = Number(scene.meta?.position ?? -1);
  const char = expression[position];
  const where =
    char === undefined
      ? position < 0
        ? 'before the first character'
        : 'after the last character'
      : `at character ${position + 1}: ${char}`;
  return `Reading ${expression}, ${where}. ${describeStack(scene)}`;
}

type BracketsTracer = Tracer<BracketsModel, BracketsAnnotations>;

/** Checks the whole expression. Returns whether it's balanced; failures end the trace early. */
export function check(t: BracketsTracer): boolean {
  const { expression } = t.model;
  t.step({ line: 'scan', caption: { key: 'brackets.start', params: { expression } } });

  for (const [index, char] of [...expression].entries()) {
    if (OPENING.has(char)) {
      const id = itemId(t.model.stack.nextId);
      t.update((m) => ({ ...m, position: index, stack: withPushed(m.stack, char) }));
      t.count('writes');
      t.step({
        line: 'push-open',
        caption: { key: 'brackets.open', params: { bracket: char } },
        vars: { ch: char },
        annotations: { highlight: { id, state: 'new' } },
      });
      continue;
    }

    const partner = PARTNERS[char];
    if (partner === undefined) continue; // Not a bracket: nothing to do.

    t.update((m) => ({ ...m, position: index }));
    t.count('comparisons');
    const item = top(t.model.stack);
    if (!item) {
      t.fail(
        'brackets.unmatched',
        { key: 'brackets.unmatched', params: { bracket: char } },
        { line: 'close-empty', annotations: { current: 'error', container: 'error' } },
      );
      return false;
    }

    t.count('reads');
    if (item.value !== partner) {
      t.fail(
        'brackets.mismatch',
        { key: 'brackets.mismatch', params: { bracket: char, open: item.value } },
        {
          line: 'mismatch',
          annotations: { current: 'error', highlight: { id: item.id, state: 'error' } },
        },
      );
      return false;
    }

    t.step({
      line: 'close-match',
      caption: { key: 'brackets.match', params: { bracket: char, open: item.value } },
      vars: { ch: char, top: item.value },
      annotations: { current: 'found', highlight: { id: item.id, state: 'found' } },
    });
    t.update((m) => ({ ...m, stack: withoutTop(m.stack) }));
    t.count('writes');
    t.step({
      line: 'pop-open',
      caption: { key: 'brackets.popped', params: { open: item.value } },
      annotations: { current: 'found' },
    });
  }

  t.update((m) => ({ ...m, position: expression.length }));
  t.count('comparisons');
  const left = t.model.stack.items.length;
  if (left > 0) {
    t.fail(
      'brackets.unclosed',
      { key: 'brackets.unclosed', params: { count: left } },
      { line: 'unclosed', annotations: { allItems: 'error', container: 'error' } },
    );
    return false;
  }
  t.step({ line: 'balanced', caption: { key: 'brackets.balanced' } });
  return true;
}

/** Runs the checker: the trace to play, and the checker as it ended. */
export function traceBrackets(model: BracketsModel): {
  trace: Trace<boolean>;
  model: BracketsModel;
} {
  return runTrace(
    {
      operation: 'brackets.check',
      model,
      toScene: bracketsToScene,
      describe: describeBrackets,
    },
    check,
  );
}
