/**
 * The engine's data model (ARCHITECTURE §4). A trace is a list of steps; each step holds a full
 * snapshot of the scene, so any step can be shown on its own and stepping back is free.
 * Everything here is plain data: no React, no layout, no pixels.
 */
import type { RendererId } from './renderer';

/* ------------------------------------------------------------------------------------------------
 * Scene: what is on the canvas at one moment
 * ---------------------------------------------------------------------------------------------- */

/** Visual state of an element (VISUAL-SPEC §7 "State palette"). */
export type ElementState =
  | 'default'
  | 'active'
  | 'new'
  | 'collision'
  | 'swapping'
  | 'visited'
  | 'found'
  | 'sorted'
  | 'error'
  | 'dimmed';

/** Where an element sits. Renderers turn slots into positions. */
export type Slot =
  /** array, stack and queue cells */
  | { type: 'index'; index: number }
  /** the old, smaller array a dynamic array copies from while it grows */
  | { type: 'source'; index: number }
  /** hash-table chain nodes */
  | { type: 'bucket'; bucket: number; chainIndex: number }
  /** lists, trees and graphs: laid out by the renderer */
  | { type: 'node' }
  /** characters of an input read left to right, e.g. the bracket checker's expression */
  | { type: 'input'; index: number };

/**
 * One thing on the canvas. `id` is stable across steps, so the viz layer can tell what moved,
 * appeared, disappeared or changed state between two steps.
 */
export type SceneElement =
  | {
      kind: 'cell';
      id: string;
      value: string;
      /** Secondary line, e.g. a phone number under a name. */
      detail?: string;
      state: ElementState;
      slot: Slot;
    }
  | {
      kind: 'edge';
      id: string;
      from: string;
      to: string;
      directed: boolean;
      weight?: string;
      state: ElementState;
    }
  /** A labelled arrow at an element: "top", "head", "j". */
  | { kind: 'pointer'; id: string; label: string; target: string }
  /** A short note such as h("Sid") = 2, optionally next to an element. */
  | { kind: 'callout'; id: string; text: string; anchor?: string }
  /** Small text attached to an element: indices, tombstones. */
  | { kind: 'marker'; id: string; target: string; text: string };

export type Scene = {
  renderer: RendererId;
  elements: readonly SceneElement[];
  /** Structure-level facts shown next to the canvas: capacity, size, load factor. */
  meta?: Readonly<Record<string, number | string>>;
};

/* ------------------------------------------------------------------------------------------------
 * Steps and traces
 * ---------------------------------------------------------------------------------------------- */

/** What the learner reads. Engine captions are translatable keys; lessons may write text. */
export type Caption =
  { text: string } | { key: string; params?: Readonly<Record<string, string | number>> };

/** Operation counts shown live on the canvas (F-902). */
export type Counters = {
  comparisons: number;
  swaps: number;
  reads: number;
  writes: number;
};

export type CounterName = keyof Counters;

/** Why the player stops at a step instead of moving on. */
export type PauseReason = 'chapter-end' | 'interactive' | 'predict';

export type Step = {
  /** Full snapshot, never a diff. */
  scene: Scene;
  caption: Caption;
  /** Language-independent code line id, e.g. 'collision' (ARCHITECTURE §5.3). */
  codeLine?: string;
  /** Live variables for the code panel's watch row: { i: '3', top: '42' }. */
  vars?: Readonly<Record<string, string>>;
  /** Counter totals at this step. */
  counters: Readonly<Counters>;
  /** Screen-reader summary of the scene. */
  a11y: string;
  pause?: PauseReason;
};

/** Why an operation stopped early. Part of the lesson, not an exception (overflow, not found). */
export type TraceError = {
  /** e.g. 'stack.overflow', 'engine.step-limit' */
  code: string;
  message: Caption;
};

export type Trace<Result = unknown> = {
  /** e.g. 'stack.push' */
  operation: string;
  steps: readonly Step[];
  /** The operation's return value, e.g. what pop() returned. */
  result?: Result;
  error?: TraceError;
};
