/**
 * Recursive functions with tracing (ALGORITHM-CATALOG F2): factorial, Fibonacci (plain and
 * memoised) and a factorial with no base case that overflows the stack. Each call pushes a
 * frame; a frame shows what it's waiting for, then its result as it returns and comes off.
 *
 * Code line ids (recursion sample): fact-base, fact-call, fact-return (fact); fib-base,
 * fib-left, fib-right, fib-return (fib); memo-hit, memo-base, memo-left, memo-right,
 * memo-store (fibMemo); broken-call (broken).
 * Caption keys: the `recursion.*` keys in content/captions.ts.
 */
import { config } from '@/config';

import { runTrace, type Tracer } from '../../core/tracer';
import type { Trace } from '../../core/types';
import { describeRecursion } from './describe';
import {
  callLabel,
  callShape,
  treeColumns,
  type Call,
  type CallStatus,
  type RecursionModel,
  type RecursiveFunction,
} from './model';
import { recursionToScene } from './to-scene';

type RecursionTracer = Tracer<RecursionModel, undefined>;

const LIMITS: Record<RecursiveFunction, number> = {
  fact: config.recursion.maxFactorial,
  broken: config.recursion.maxFactorial,
  fib: config.recursion.maxFib,
  fibMemo: config.recursion.maxFib,
};

/** Runs fn(n) call by call. Its result, or undefined when n is too big or it overflows. */
export function runRecursion(
  t: RecursionTracer,
  fn: RecursiveFunction,
  n: number,
): number | undefined {
  if (n < 0 || n > LIMITS[fn]) {
    t.step({
      caption: { key: 'recursion.too-big', params: { label: callLabel(fn, n), max: LIMITS[fn] } },
    });
    return undefined;
  }

  // The whole call tree, worked out first, so every call has its place from the start.
  const shape = callShape(fn, n);
  const columns = treeColumns(shape);
  const memoised = fn === 'fibMemo';
  t.update((model) => ({
    n: model.n,
    calls: [],
    stack: [],
    reserve: Math.max(...shape.map((s) => s.depth)) + 1,
    columns: Math.max(...columns) + 1,
    levels: Math.max(...shape.map((s) => s.depth)) + 1,
    tree: fn === 'fib' || memoised,
    ...(memoised ? { memo: {} } : {}),
  }));

  let made = 0;
  const memo = new Map<number, number>();

  /** Makes a call: a new frame on top of the stack; the caller now waits. */
  const call = (
    k: number,
    parent: string | undefined,
    depth: number,
    note: string,
    status: CallStatus,
    result?: number,
  ): string => {
    const id = `c${made}`;
    const column = columns[made] ?? 0;
    made++;
    const created: Call = {
      id,
      fn,
      n: k,
      depth,
      column,
      note,
      status,
      ...(parent === undefined ? {} : { parent }),
      ...(result === undefined ? {} : { result }),
    };
    t.update((model) => ({
      ...model,
      calls: [
        ...model.calls.map((c) => (c.id === parent ? { ...c, status: 'waiting' as const } : c)),
        created,
      ],
      stack: [...model.stack, id],
    }));
    return id;
  };
  /** Changes a call's frame: its note, status or result. */
  const set = (id: string, change: Partial<Call>) =>
    t.update((model) => ({
      ...model,
      calls: model.calls.map((c) => (c.id === id ? { ...c, ...change } : c)),
    }));
  /** The top frame comes off the stack; the frame under it runs again. */
  const pop = () =>
    t.update((model) => {
      const top = model.stack.at(-1);
      const stack = model.stack.slice(0, -1);
      const below = stack.at(-1);
      return {
        ...model,
        stack,
        calls: model.calls.map((c) =>
          c.id === top && c.status !== 'memo'
            ? { ...c, status: 'done' as const }
            : c.id === below
              ? { ...c, status: 'running' as const }
              : c,
        ),
      };
    });

  const fact = (k: number, parent: string | undefined, depth: number): number => {
    if (k <= 1) {
      call(k, parent, depth, 'base case: 1', 'returning', 1);
      t.step({
        line: 'fact-base',
        caption: { key: 'recursion.base.fact', params: { n: k } },
        vars: { n: k },
      });
      return 1;
    }
    const id = call(k, parent, depth, `${k} × fact(${k - 1})`, 'running');
    t.step({
      line: 'fact-call',
      caption: { key: 'recursion.call.fact', params: { n: k, m: k - 1 } },
      vars: { n: k },
    });
    const child = fact(k - 1, id, depth + 1);
    pop();
    const result = k * child;
    set(id, { note: `${k} × ${child} = ${result}`, status: 'returning', result });
    t.step({
      line: 'fact-return',
      caption: {
        key: 'recursion.return.fact',
        params: { n: k, m: k - 1, child, result },
      },
      vars: { n: k, rest: child },
    });
    return result;
  };

  const lines = memoised
    ? { base: 'memo-base', left: 'memo-left', right: 'memo-right', back: 'memo-store' }
    : { base: 'fib-base', left: 'fib-left', right: 'fib-right', back: 'fib-return' };

  const fib = (k: number, parent: string | undefined, depth: number): number => {
    const saved = memo.get(k);
    if (memoised && saved !== undefined) {
      call(k, parent, depth, `in the memo: ${saved}`, 'memo', saved);
      t.count('reads');
      t.step({
        line: 'memo-hit',
        caption: { key: 'recursion.memo.hit', params: { n: k, result: saved } },
        vars: { n: k },
      });
      return saved;
    }
    if (k <= 1) {
      call(k, parent, depth, `base case: ${k}`, 'returning', k);
      t.step({
        line: lines.base,
        caption: { key: 'recursion.base.fib', params: { n: k } },
        vars: { n: k },
      });
      return k;
    }
    const id = call(k, parent, depth, `fib(${k - 1}) + fib(${k - 2})`, 'running');
    t.step({
      line: lines.left,
      caption: { key: 'recursion.call.fib', params: { n: k, a: k - 1, b: k - 2 } },
      vars: { n: k },
    });
    const left = fib(k - 1, id, depth + 1);
    pop();
    set(id, { note: `${left} + fib(${k - 2})` });
    t.step({
      line: lines.right,
      caption: { key: 'recursion.resume.fib', params: { n: k, a: k - 1, b: k - 2, left } },
      vars: { n: k, a: left },
    });
    const right = fib(k - 2, id, depth + 1);
    pop();
    const result = left + right;
    set(id, { note: `${left} + ${right} = ${result}`, status: 'returning', result });
    if (memoised) {
      memo.set(k, result);
      t.count('writes');
      t.update((model) => ({ ...model, memo: { ...model.memo, [k]: result } }));
    }
    t.step({
      line: lines.back,
      caption: {
        key: memoised ? 'recursion.return.memo' : 'recursion.return.fib',
        params: { n: k, b: k - 2, left, right, result },
      },
      vars: { n: k, a: left, b: right },
    });
    return result;
  };

  /** No base case: every call makes another, until the stack is full. */
  const broken = (): undefined => {
    let parent: string | undefined;
    for (let depth = 0, k = n; depth < config.recursion.maxDepth; depth++, k--) {
      parent = call(k, parent, depth, `${k} × fact(${k - 1})`, 'running');
      t.step({
        line: 'broken-call',
        caption: { key: 'recursion.call.broken', params: { n: k, m: k - 1 } },
        vars: { n: k },
      });
    }
    t.update((model) => ({ ...model, overflow: true }));
    t.fail('recursion.overflow', {
      key: 'recursion.overflow',
      params: { depth: config.recursion.maxDepth },
    });
    return undefined;
  };

  if (fn === 'broken') return broken();
  const result = fn === 'fact' ? fact(n, undefined, 0) : fib(n, undefined, 0);
  pop();
  t.step({
    caption: {
      key: 'recursion.done',
      params: { label: callLabel(fn, n), result, calls: made, depth: t.model.reserve },
    },
  });
  return result;
}

export type RecursionOperation = { type: RecursiveFunction; n?: number };

/** Runs one recursive function, on the model's n unless one is given. */
export function traceRecursion(
  model: RecursionModel,
  operation: RecursionOperation,
): { trace: Trace<number | undefined>; model: RecursionModel } {
  const n = operation.n ?? model.n;
  const run = runTrace(
    {
      operation: `recursion.${operation.type}`,
      model,
      toScene: recursionToScene,
      describe: describeRecursion,
    },
    (t) => runRecursion(t, operation.type, n),
  );
  // The run ends with an empty stack; keep the n learners picked for the next run.
  return { trace: run.trace, model: { ...run.model, n: model.n } };
}
