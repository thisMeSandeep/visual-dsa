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
  arrayToScene,
  createArray,
  describeArray,
  traceArray,
  type ArrayAddresses,
  type ArrayModel,
} from '../structures/array';
import {
  createSortedArray,
  describeSearch,
  searchToScene,
  traceSearch,
} from '../algorithms/searching';
import {
  createSortArray,
  describeSort,
  SORT_ALGORITHMS,
  sortToScene,
  traceSort,
  type SortAlgorithm,
} from '../algorithms/sorting';
import {
  CURVE_IDS,
  createGrowth,
  describeGrowth,
  growthToScene,
  SAMPLES,
  traceGrowth,
  type CurveId,
  type GrowthModel,
  type SampleId,
} from '../foundations/big-o';
import {
  createTable,
  describeHashTable,
  hashToScene,
  traceHashTable,
  keyProblem,
  type HashFunctionId,
  type HashModel,
  type HashStrategy,
} from '../structures/hash-table';
import {
  createList,
  describeList,
  listToScene,
  traceList,
  type ListKind,
  type ListModel,
} from '../structures/linked-list';
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

function wholeNumber(input: Record<string, unknown>, key: string, at: string): number {
  const value = optionalWholeNumber(input, key, at);
  if (value === undefined) throw new CompileError(`"${key}" is required`, at);
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

/** The array: a dynamic array that grows when it's full. */
const array: StructureDefinition<ArrayModel> = {
  /** { values?: string[], capacity?: number, addresses?: { base: number, stride: number } } */
  create: (input, at) => {
    const fields = record(input, at);
    const values = optionalTextList(fields, 'values', at);
    const capacity = optionalWholeNumber(fields, 'capacity', at);
    const addresses =
      fields.addresses === undefined ? undefined : addressesFrom(fields.addresses, at);
    return atSegment(at, () =>
      createArray(values, capacity, addresses === undefined ? {} : { addresses }),
    );
  },
  toScene: (model) => arrayToScene(model),
  describe: describeArray,
  operations: {
    get: (model, input, at) =>
      traceArray(model, { type: 'get', index: wholeNumber(record(input, at), 'index', at) }),
    set: (model, input, at) => {
      const fields = record(input, at);
      return traceArray(model, {
        type: 'set',
        index: wholeNumber(fields, 'index', at),
        value: text(fields, 'value', at),
      });
    },
    push: (model, input, at) =>
      traceArray(model, { type: 'push', value: text(record(input, at), 'value', at) }),
    insert: (model, input, at) => {
      const fields = record(input, at);
      return traceArray(model, {
        type: 'insert',
        index: wholeNumber(fields, 'index', at),
        value: text(fields, 'value', at),
      });
    },
    removeAt: (model, input, at) =>
      traceArray(model, { type: 'removeAt', index: wholeNumber(record(input, at), 'index', at) }),
    search: (model, input, at) =>
      traceArray(model, { type: 'search', value: text(record(input, at), 'value', at) }),
    traverse: (model) => traceArray(model, { type: 'traverse' }),
  },
};

/**
 * A sorted array to binary search: one slot per value, values that are numbers. It may be
 * unsorted on purpose, to show what binary search gets wrong then.
 */
const sortedArray: StructureDefinition<ArrayModel> = {
  /** { values?: string[] } */
  create: (input, at) => {
    const values = optionalTextList(record(input, at), 'values', at);
    return atSegment(at, () => createSortedArray(values));
  },
  toScene: (model) => searchToScene(model),
  describe: describeSearch,
  operations: {
    binarySearch: (model, input, at) =>
      traceSearch(model, { type: 'binarySearch', value: text(record(input, at), 'value', at) }),
    findFirst: (model, input, at) =>
      traceSearch(model, { type: 'findFirst', value: text(record(input, at), 'value', at) }),
    findLast: (model, input, at) =>
      traceSearch(model, { type: 'findLast', value: text(record(input, at), 'value', at) }),
  },
};

/**
 * A sort: an array of numbers (a value may carry a letter tag, "5a", to tell equal values
 * apart) and one operation, sort. Bubble, selection and insertion sort are one structure each,
 * so each keeps the room its pointers or held key need.
 */
function sortStructure(algorithm: SortAlgorithm): StructureDefinition<ArrayModel> {
  const create = (input: unknown, at: string) => {
    const values = optionalTextList(record(input, at), 'values', at);
    return atSegment(at, () => createSortArray(values));
  };
  return {
    /** { values?: string[] } */
    create,
    toScene: (model) => sortToScene(algorithm)(model),
    describe: describeSort,
    operations: {
      /**
       * Sorts the current array, or `{ values }` when given: the sandbox sorts whatever the
       * learner typed. Lessons set the array up first, and may pass `{ from }` to carry on
       * after rounds an earlier `pass` showed.
       */
      sort: (model, input, at) => {
        const fields = record(input, at);
        const array = fields.values === undefined ? model : create(fields, at);
        return traceSort(array, algorithm, { from: roundsDone(fields, array, at) });
      },
      /** One round (a pass, or placing one item) after `{ from }` rounds already done. */
      pass: (model, input, at) =>
        traceSort(model, algorithm, { from: roundsDone(record(input, at), model, at), rounds: 1 }),
    },
  };
}

/** How many rounds a lesson says are done already: 0 to n − 1 for n items. */
function roundsDone(input: Record<string, unknown>, model: ArrayModel, at: string): number {
  const from = optionalWholeNumber(input, 'from', at) ?? 0;
  if (from < 0 || from > Math.max(model.size - 1, 0)) {
    throw new CompileError(`"from" must be 0–${Math.max(model.size - 1, 0)} rounds`, at);
  }
  return from;
}

function addressesFrom(input: unknown, at: string): ArrayAddresses {
  const fields = record(input, `${at}.addresses`);
  return {
    base: wholeNumber(fields, 'base', `${at}.addresses`),
    stride: wholeNumber(fields, 'stride', `${at}.addresses`),
  };
}

/** Linked lists, singly (the default) or doubly, with or without a tail pointer. */
const LIST_KINDS: readonly ListKind[] = ['singly', 'doubly'];
const linkedList: StructureDefinition<ListModel> = {
  /** { values?: string[] (head first), kind?: 'singly' | 'doubly', tail?: boolean } */
  create: (input, at) => {
    const fields = record(input, at);
    const values = optionalTextList(fields, 'values', at);
    const { kind, tail } = fields;
    if (kind !== undefined && !LIST_KINDS.includes(kind as ListKind)) {
      throw new CompileError(`"kind" must be one of ${LIST_KINDS.join(', ')}`, at);
    }
    if (tail !== undefined && typeof tail !== 'boolean') {
      throw new CompileError('"tail" must be true or false', at);
    }
    return atSegment(at, () =>
      createList(values, {
        ...(kind === undefined ? {} : { kind: kind as ListKind }),
        ...(tail === undefined ? {} : { hasTail: tail }),
      }),
    );
  },
  toScene: (model) => listToScene(model),
  describe: describeList,
  operations: {
    insertHead: (model, input, at) =>
      traceList(model, { type: 'insertHead', value: text(record(input, at), 'value', at) }),
    insertTail: (model, input, at) =>
      traceList(model, { type: 'insertTail', value: text(record(input, at), 'value', at) }),
    insertAfter: (model, input, at) => {
      const fields = record(input, at);
      return traceList(model, {
        type: 'insertAfter',
        target: text(fields, 'target', at),
        value: text(fields, 'value', at),
      });
    },
    insertBefore: (model, input, at) => {
      const fields = record(input, at);
      return traceList(model, {
        type: 'insertBefore',
        target: text(fields, 'target', at),
        value: text(fields, 'value', at),
      });
    },
    delete: (model, input, at) =>
      traceList(model, { type: 'delete', value: text(record(input, at), 'value', at) }),
    search: (model, input, at) =>
      traceList(model, { type: 'search', value: text(record(input, at), 'value', at) }),
    traverse: (model) => traceList(model, { type: 'traverse' }),
    traverseBackward: (model) => traceList(model, { type: 'traverseBackward' }),
    reverse: (model) => traceList(model, { type: 'reverse' }),
  },
};

/** Hash tables: chaining or linear probing, with a choice of hash function. */
const HASH_STRATEGIES: readonly HashStrategy[] = ['chaining', 'probing'];
const HASH_FUNCTIONS: readonly HashFunctionId[] = ['sum', 'polynomial', 'length'];
const hashTable: StructureDefinition<HashModel> = {
  /**
   * { entries?: { [key]: value } (put in order), size?: number, strategy?, hash?, loadLimit?,
   *   removed?: string[] (keys removed after, leaving tombstones when probing) }
   */
  create: (input, at) => {
    const fields = record(input, at);
    const entries = textRecord(fields, 'entries', at);
    const size = optionalWholeNumber(fields, 'size', at);
    const removed = optionalTextList(fields, 'removed', at);
    const { strategy, hash, loadLimit } = fields;
    if (strategy !== undefined && !HASH_STRATEGIES.includes(strategy as HashStrategy)) {
      throw new CompileError(`"strategy" must be one of ${HASH_STRATEGIES.join(', ')}`, at);
    }
    if (hash !== undefined && !HASH_FUNCTIONS.includes(hash as HashFunctionId)) {
      throw new CompileError(`"hash" must be one of ${HASH_FUNCTIONS.join(', ')}`, at);
    }
    if (loadLimit !== undefined && typeof loadLimit !== 'number') {
      throw new CompileError('"loadLimit" must be a number', at);
    }
    return atSegment(at, () =>
      createTable(entries, {
        removed,
        ...(size === undefined ? {} : { size }),
        ...(strategy === undefined ? {} : { strategy: strategy as HashStrategy }),
        ...(hash === undefined ? {} : { hashFunction: hash as HashFunctionId }),
        ...(loadLimit === undefined ? {} : { loadLimit }),
      }),
    );
  },
  toScene: (model) => hashToScene(model),
  describe: describeHashTable,
  operations: {
    put: (model, input, at) => {
      const fields = record(input, at);
      return traceHashTable(model, {
        type: 'put',
        key: hashKey(fields, at),
        value: text(fields, 'value', at),
      });
    },
    get: (model, input, at) =>
      traceHashTable(model, { type: 'get', key: hashKey(record(input, at), at) }),
    remove: (model, input, at) =>
      traceHashTable(model, { type: 'remove', key: hashKey(record(input, at), at) }),
    hash: (model, input, at) =>
      traceHashTable(model, { type: 'hash', key: hashKey(record(input, at), at) }),
  },
};

/** A key that can go in a table: letters only, short enough to draw. */
function hashKey(input: Record<string, unknown>, at: string): string {
  const key = text(input, 'key', at);
  const problem = keyProblem(key);
  if (problem) throw new CompileError(problem, at);
  return key;
}

function textRecord(
  input: Record<string, unknown>,
  key: string,
  at: string,
): Record<string, string> {
  const value = input[key];
  if (value === undefined) return {};
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value) ||
    !Object.values(value).every((item) => typeof item === 'string')
  ) {
    throw new CompileError(`"${key}" must map keys to strings`, at);
  }
  return value as Record<string, string>;
}

/** The Big O growth chart: curves, the n marker, and sample functions to run. */
const growth: StructureDefinition<GrowthModel> = {
  /** { n?: number, curves?: CurveId[] } */
  create: (input, at) => {
    const fields = record(input, at);
    const n = optionalWholeNumber(fields, 'n', at);
    const curves = optionalTextList(fields, 'curves', at);
    const unknown = curves.find((curve) => !CURVE_IDS.includes(curve as CurveId));
    if (unknown) throw new CompileError(`Unknown curve "${unknown}"`, at);
    return atSegment(at, () =>
      createGrowth({ curves: curves as CurveId[], ...(n === undefined ? {} : { n }) }),
    );
  },
  toScene: (model) => growthToScene(model),
  describe: describeGrowth,
  operations: {
    setN: (model, input, at) =>
      traceGrowth(model, { type: 'setN', n: wholeNumber(record(input, at), 'n', at) }),
    show: (model, input, at) => {
      const curve = text(record(input, at), 'curve', at);
      if (!CURVE_IDS.includes(curve as CurveId)) {
        throw new CompileError(`Unknown curve "${curve}"`, at);
      }
      return traceGrowth(model, { type: 'show', curve: curve as CurveId });
    },
    // One operation per sample, so the sandbox can give each its own button.
    ...Object.fromEntries(
      (Object.keys(SAMPLES) as SampleId[]).map((sample) => [
        sample,
        (model: GrowthModel) => traceGrowth(model, { type: 'run', sample }),
      ]),
    ),
  },
};

/** Every structure a lesson can use, by the name recipes refer to. */
export const STRUCTURES: Readonly<Record<string, StructureDefinition<unknown>>> = {
  stack: stack as StructureDefinition<unknown>,
  brackets: brackets as StructureDefinition<unknown>,
  queue: queue as StructureDefinition<unknown>,
  array: array as StructureDefinition<unknown>,
  'sorted-array': sortedArray as StructureDefinition<unknown>,
  ...Object.fromEntries(
    SORT_ALGORITHMS.map((algorithm) => [
      algorithm,
      sortStructure(algorithm) as StructureDefinition<unknown>,
    ]),
  ),
  'linked-list': linkedList as StructureDefinition<unknown>,
  'hash-table': hashTable as StructureDefinition<unknown>,
  'big-o': growth as StructureDefinition<unknown>,
};
