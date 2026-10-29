/**
 * Stack operations with tracing (ALGORITHM-CATALOG L5). Each `step()` is a moment the learner
 * sees. Code line ids ('check-full', 'push'…) must match the `@line` markers in the stack's code
 * samples (ARCHITECTURE §5.3).
 *
 * Caption keys used: stack.push.check, stack.pushed, stack.overflow, stack.pop.check,
 * stack.pop.read, stack.popped, stack.underflow, stack.peeked, stack.empty, stack.clear.start,
 * stack.cleared, stack.already-empty.
 */
import { runTrace, type Tracer } from '../../core/tracer';
import type { Trace } from '../../core/types';
import { describeStack } from './describe';
import {
  emptied,
  isEmpty,
  isFull,
  itemId,
  size,
  top,
  withPushed,
  withoutTop,
  type StackModel,
} from './model';
import { stackToScene, type StackAnnotations } from './to-scene';

export type StackTracer = Tracer<StackModel, StackAnnotations>;

/** Puts `value` on top, or fails with stack.overflow when the stack is full. */
export function push(t: StackTracer, value: string): void {
  t.count('comparisons');
  t.step({
    line: 'check-full',
    caption: { key: 'stack.push.check', params: { value } },
    vars: { size: size(t.model), capacity: t.model.capacity },
  });

  if (isFull(t.model)) {
    t.fail(
      'stack.overflow',
      { key: 'stack.overflow', params: { value, capacity: t.model.capacity } },
      { line: 'overflow', annotations: { rejected: value, container: 'error' } },
    );
    return;
  }

  const id = itemId(t.model.nextId);
  t.update((stack) => withPushed(stack, value));
  t.count('writes');
  t.step({
    line: 'push',
    caption: { key: 'stack.pushed', params: { value } },
    vars: { size: size(t.model), top: value },
    annotations: { highlight: { id, state: 'new' } },
  });
}

/** Removes and returns the top value, or fails with stack.underflow when the stack is empty. */
export function pop(t: StackTracer): string | undefined {
  t.count('comparisons');
  t.step({
    line: 'check-empty',
    caption: { key: 'stack.pop.check' },
    vars: { size: size(t.model) },
  });

  const item = top(t.model);
  if (!item) {
    t.fail(
      'stack.underflow',
      { key: 'stack.underflow' },
      { line: 'underflow', annotations: { container: 'error' } },
    );
    return undefined;
  }

  t.count('reads');
  t.step({
    line: 'read-top',
    caption: { key: 'stack.pop.read', params: { value: item.value } },
    vars: { size: size(t.model), top: item.value },
    annotations: { highlight: { id: item.id, state: 'active' } },
  });

  t.update(withoutTop);
  t.count('writes');
  t.step({
    line: 'pop',
    caption: { key: 'stack.popped', params: { value: item.value } },
    vars: { size: size(t.model), returned: item.value },
  });
  return item.value;
}

/** Returns the top value without removing it, or fails with stack.empty. */
export function peek(t: StackTracer): string | undefined {
  t.count('comparisons');
  const item = top(t.model);
  if (!item) {
    t.fail(
      'stack.empty',
      { key: 'stack.empty' },
      { line: 'underflow', annotations: { container: 'error' } },
    );
    return undefined;
  }

  t.count('reads');
  t.step({
    line: 'peek',
    caption: { key: 'stack.peeked', params: { value: item.value } },
    vars: { top: item.value },
    annotations: { highlight: { id: item.id, state: 'active' } },
  });
  return item.value;
}

/** Removes every item. */
export function clear(t: StackTracer): void {
  if (isEmpty(t.model)) {
    t.step({ line: 'clear', caption: { key: 'stack.already-empty' } });
    return;
  }

  t.step({
    line: 'clear',
    caption: { key: 'stack.clear.start', params: { count: size(t.model) } },
    annotations: { allItems: 'dimmed' },
  });
  t.update(emptied);
  t.count('writes');
  t.step({ line: 'clear', caption: { key: 'stack.cleared' } });
}

/* ------------------------------------------------------------------------------------------------
 * Running an operation
 * ---------------------------------------------------------------------------------------------- */

export type StackOperation =
  { type: 'push'; value: string } | { type: 'pop' } | { type: 'peek' } | { type: 'clear' };

/** Runs one operation on `model`: the trace to play, and the stack to continue from. */
export function traceStack(
  model: StackModel,
  operation: StackOperation,
): { trace: Trace<string | undefined>; model: StackModel } {
  return runTrace(
    {
      operation: `stack.${operation.type}`,
      model,
      toScene: stackToScene,
      describe: describeStack,
    },
    (t): string | undefined => {
      switch (operation.type) {
        case 'push':
          push(t, operation.value);
          return undefined;
        case 'pop':
          return pop(t);
        case 'peek':
          return peek(t);
        case 'clear':
          clear(t);
          return undefined;
      }
    },
  );
}
