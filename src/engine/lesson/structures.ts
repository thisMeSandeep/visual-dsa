/**
 * The structures lessons can drive, by name: how to set one up from recipe input, how to draw it
 * at rest, and which operations exist. Recipe input is untrusted data, so every input is checked
 * here and a bad one is a CompileError naming the segment.
 */
import type { Caption, Counters, Scene, Step, Trace } from '../core/types';
import {
  bracketsToScene,
  createBrackets,
  createStack,
  describeBrackets,
  describeStack,
  stackToScene,
  traceBrackets,
  traceStack,
  type BracketsModel,
  type StackModel,
} from '../structures/stack';
import {
  createQueue,
  describeQueue,
  queueToScene,
  traceQueue,
  type QueueMode,
  type QueueModel,
} from '../structures/queue';

export class CompileError extends Error {
  constructor(
    /** What's wrong, e.g. 'Unknown operation "stack.shuffle"'. */
    readonly reason: string,
    /** Where in the recipe, e.g. "segments[4]". */
    readonly at: string,
  ) {
    super(`${at}: ${reason}`);
    this.name = 'CompileError';
  }
}

export type StructureDefinition<Model> = {
  create: (input: unknown, at: string) => Model;
  /** The structure at rest, with no highlights (for 'say' and 'interactive' steps). */
  toScene: (model: Model) => Scene;
  describe: (scene: Scene) => string;
  operations: Readonly<
    Record<string, (model: Model, input: unknown, at: string) => { trace: Trace; model: Model }>
  >;
};

const ZERO_COUNTERS: Counters = { comparisons: 0, swaps: 0, reads: 0, writes: 0 };

/**
 * A step showing a structure at rest with a caption: a lesson's 'say' step, or the sandbox after
 * an undo or a preset. Counters carry on from the step before, if any.
 */
export function restingStep(
  definition: StructureDefinition<unknown>,
  model: unknown,
  caption: Caption,
  counters: Counters = ZERO_COUNTERS,
): Step {
  const scene = definition.toScene(model);
  return { scene, caption, counters, a11y: definition.describe(scene) };
}

/* Input checks --------------------------------------------------------------------------------- */

function record(input: unknown, at: string): Record<string, unknown> {
  if (input === undefined) return {};
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new CompileError('Input must be an object', at);
  }
  return input as Record<string, unknown>;
}

function text(input: Record<string, unknown>, key: string, at: string): string {
  const value = input[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new CompileError(`"${key}" must be a non-empty string`, at);
  }
  return value;
}

function optionalTextList(input: Record<string, unknown>, key: string, at: string): string[] {
  const value = input[key];
  if (value === undefined) return [];
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new CompileError(`"${key}" must be a list of strings`, at);
  }
  return value;
}

function optionalWholeNumber(
  input: Record<string, unknown>,
  key: string,
  at: string,
): number | undefined {
  const value = input[key];
  if (value === undefined) return undefined;
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new CompileError(`"${key}" must be a whole number`, at);
  }
  return value;
}

/** Turns a model error (e.g. a capacity out of range) into a CompileError for this segment. */
function atSegment<T>(at: string, build: () => T): T {
  try {
    return build();
  } catch (error) {
    if (error instanceof RangeError) throw new CompileError(error.message, at);
    throw error;
  }
}

/* Structures ------------------------------------------------------------------------------------ */

const stack: StructureDefinition<StackModel> = {
  /** { values?: string[] (bottom first), capacity?: number } */
  create: (input, at) => {
    const fields = record(input, at);
    const values = optionalTextList(fields, 'values', at);
    const capacity = optionalWholeNumber(fields, 'capacity', at);
    return atSegment(at, () => createStack(values, capacity));
  },
  toScene: (model) => stackToScene(model),
  describe: describeStack,
  operations: {
    push: (model, input, at) =>
      traceStack(model, { type: 'push', value: text(record(input, at), 'value', at) }),
    pop: (model) => traceStack(model, { type: 'pop' }),
    peek: (model) => traceStack(model, { type: 'peek' }),
    clear: (model) => traceStack(model, { type: 'clear' }),
  },
};

/** The bracket checker: an expression read left to right with a stack of open brackets. */
const brackets: StructureDefinition<BracketsModel> = {
  /** { expression: string } */
  create: (input, at) => {
    const expression = text(record(input, at), 'expression', at);
    return atSegment(at, () => createBrackets(expression));
  },
  toScene: (model) => bracketsToScene(model),
  describe: describeBrackets,
  operations: {
    /**
     * Checks the current expression, or `{ expression }` when given: the sandbox's checker
     * runs whatever the learner typed. Lessons set the expression up first and pass nothing.
     */
    check: (model, input, at) => {
      const fields = record(input, at);
      if (fields.expression === undefined) return traceBrackets(model);
      const expression = text(fields, 'expression', at);
      return traceBrackets(atSegment(at, () => createBrackets(expression)));
    },
  },
};

/** The queue: a row of slots, circular (the default) or a plain array (`mode: 'naive'`). */
const QUEUE_MODES: readonly QueueMode[] = ['circular', 'naive'];
const queue: StructureDefinition<QueueModel> = {
  /** { values?: string[] (front first), capacity?: number, head?: number, mode?: 'circular' | 'naive' } */
  create: (input, at) => {
    const fields = record(input, at);
    const values = optionalTextList(fields, 'values', at);
    const capacity = optionalWholeNumber(fields, 'capacity', at);
    const head = optionalWholeNumber(fields, 'head', at);
    const mode = fields.mode;
    if (mode !== undefined && !QUEUE_MODES.includes(mode as QueueMode)) {
      throw new CompileError(`"mode" must be one of ${QUEUE_MODES.join(', ')}`, at);
    }
    return atSegment(at, () =>
      createQueue(values, capacity, {
        ...(head === undefined ? {} : { head }),
        ...(mode === undefined ? {} : { mode: mode as QueueMode }),
      }),
    );
  },
  toScene: (model) => queueToScene(model),
  describe: describeQueue,
  operations: {
    enqueue: (model, input, at) =>
      traceQueue(model, { type: 'enqueue', value: text(record(input, at), 'value', at) }),
    dequeue: (model) => traceQueue(model, { type: 'dequeue' }),
    front: (model) => traceQueue(model, { type: 'front' }),
    clear: (model) => traceQueue(model, { type: 'clear' }),
  },
};

/** Every structure a lesson can use, by the name recipes refer to. */
export const STRUCTURES: Readonly<Record<string, StructureDefinition<unknown>>> = {
  stack: stack as StructureDefinition<unknown>,
  brackets: brackets as StructureDefinition<unknown>,
  queue: queue as StructureDefinition<unknown>,
};
