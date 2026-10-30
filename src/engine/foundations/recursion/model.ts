/**
 * Recursion (ALGORITHM-CATALOG F2): the calls a recursive function makes, the call stack of the
 * ones still running, and (for Fibonacci) the call tree. Plain immutable data; operations.ts
 * makes the calls one step at a time.
 *
 * A dry run of the same function first works out the whole call tree, so every call's place in
 * the tree (and the stack's tallest point) is known before it happens: the drawing never moves
 * or resizes as calls appear.
 */
import { config } from '@/config';

export type RecursiveFunction = 'fact' | 'fib' | 'fibMemo' | 'broken';

export type CallStatus =
  /** Its frame is on top of the stack: it's the code running now. */
  | 'running'
  /** On the stack, waiting for a call it made to return. */
  | 'waiting'
  /** Returning its result; its frame comes off the stack next. */
  | 'returning'
  /** Returned. */
  | 'done'
  /** Answered from the memo without running. */
  | 'memo';

export type Call = Readonly<{
  id: string;
  fn: RecursiveFunction;
  n: number;
  parent?: string;
  /** Depth in the call tree (and the stack): 0 is the first call. */
  depth: number;
  /** Place in the call tree, left to right (a parent sits over the middle of its children). */
  column: number;
  /** What the frame shows: "3 × fact(2)", "2 + fib(1)", "= 6". */
  note: string;
  status: CallStatus;
  result?: number;
}>;

export type RecursionModel = Readonly<{
  /** n for the next run (the sandbox's presets set it). */
  n: number;
  /** Every call so far, in the order they were made. */
  calls: readonly Call[];
  /** Ids of the calls on the stack, bottom first. */
  stack: readonly string[];
  /** Frames to keep room for: the deepest the stack gets in this run. */
  reserve: number;
  /** The call tree's size, so it's drawn at its final size from the start. */
  columns: number;
  levels: number;
  /** Whether the call tree is drawn (Fibonacci); factorial's tree is just the stack again. */
  tree: boolean;
  /** Fibonacci results saved so far, when memoising. */
  memo?: Readonly<Record<number, number>>;
  /** The stack ran out of room (the no-base-case run). */
  overflow?: boolean;
}>;

export function createRecursion(n: number = config.recursion.defaultN): RecursionModel {
  return { n, calls: [], stack: [], reserve: 1, columns: 1, levels: 1, tree: false };
}

/** The call's name as frames show it: fact(3), fib(3). */
export const callLabel = (fn: RecursiveFunction, n: number) =>
  `${fn === 'fib' || fn === 'fibMemo' ? 'fib' : 'fact'}(${n})`;

/** Each call's depth and parent in the order they'll be made, for fn(n). */
type Shape = { depth: number; parent: number | undefined }[];

export function callShape(fn: RecursiveFunction, n: number): Shape {
  const shape: Shape = [];
  const memo = new Set<number>();
  const visit = (k: number, depth: number, parent: number | undefined) => {
    const index = shape.length;
    shape.push({ depth, parent });
    if (fn === 'broken') {
      if (depth + 1 < config.recursion.maxDepth) visit(k - 1, depth + 1, index);
      return;
    }
    if (fn === 'fibMemo' && memo.has(k)) return;
    if (k <= 1) return;
    if (fn === 'fact') {
      visit(k - 1, depth + 1, index);
      return;
    }
    visit(k - 1, depth + 1, index);
    visit(k - 2, depth + 1, index);
    if (fn === 'fibMemo') memo.add(k);
  };
  visit(n, 0, undefined);
  return shape;
}

/**
 * Columns for a call tree laid out tidily: leaves take 0, 1, 2… from left to right, and each
 * parent sits halfway between its first and last child.
 */
export function treeColumns(shape: Shape): number[] {
  const children = shape.map(() => [] as number[]);
  shape.forEach(({ parent }, index) => {
    if (parent !== undefined) children[parent]!.push(index);
  });
  const columns: number[] = [];
  let leaf = 0;
  const place = (index: number): number => {
    const kids = children[index]!;
    if (kids.length === 0) {
      columns[index] = leaf++;
      return columns[index]!;
    }
    const placed = kids.map(place);
    columns[index] = (placed[0]! + placed.at(-1)!) / 2;
    return columns[index]!;
  };
  if (shape.length > 0) place(0);
  return columns;
}
