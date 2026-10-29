/**
 * The structures lessons can drive, by name: how to set one up from recipe input, how to draw it
 * at rest, and which operations exist. Recipe input is untrusted data, so every input is checked
 * here and a bad one is a CompileError naming the segment.
 */
import type { Scene, Trace } from '../core/types';
import {
  createStack,
  describeStack,
  stackToScene,
  traceStack,
  type StackModel,
} from '../structures/stack';

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

/** Every structure a lesson can use, by the name recipes refer to. */
export const STRUCTURES: Readonly<Record<string, StructureDefinition<unknown>>> = {
  stack: stack as StructureDefinition<unknown>,
};
