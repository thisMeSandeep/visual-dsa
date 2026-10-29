/**
 * The tracer records a trace while an operation runs (ARCHITECTURE §5.2). Operations are written
 * as ordinary algorithm code and call `step()` at each moment worth showing; the tracer turns the
 * current model into a full scene snapshot every time.
 *
 *   const { trace, model } = runTrace(options, (t) => {
 *     t.update((m) => m.push(value));
 *     t.count('writes');
 *     t.step({ line: 'push', caption: { key: 'stack.pushed', params: { value } } });
 *     return value;
 *   });
 */
import { config } from '@/config';

import { StepLimitError, isStepLimitReached } from './limits';
import type {
  Caption,
  CounterName,
  Counters,
  PauseReason,
  Scene,
  Step,
  Trace,
  TraceError,
} from './types';

export type TracerOptions<Model, Annotations> = {
  /** e.g. 'stack.push' */
  operation: string;
  /** The structure before the operation runs. */
  model: Model;
  /** Builds the scene for a model plus this step's highlights. */
  toScene: (model: Model, annotations: Annotations | undefined) => Scene;
  /** Screen-reader summary of a scene. */
  describe: (scene: Scene) => string;
  maxSteps?: number;
};

export type StepInput<Annotations> = {
  caption: Caption;
  /** Code line id this step executes. */
  line?: string;
  vars?: Readonly<Record<string, string | number>>;
  /** Structure-specific highlights passed to toScene (active index, new node…). */
  annotations?: Annotations;
  pause?: PauseReason;
};

const ZERO_COUNTERS: Counters = { comparisons: 0, swaps: 0, reads: 0, writes: 0 };

const stringifyVars = (vars: Readonly<Record<string, string | number>>) =>
  Object.fromEntries(Object.entries(vars).map(([name, value]) => [name, String(value)]));

export class Tracer<Model, Annotations = undefined> {
  private currentModel: Model;
  private readonly steps: Step[] = [];
  private counters: Counters = { ...ZERO_COUNTERS };
  private error: TraceError | undefined;
  private readonly maxSteps: number;

  constructor(private readonly options: TracerOptions<Model, Annotations>) {
    this.currentModel = options.model;
    this.maxSteps = options.maxSteps ?? config.engine.maxStepsPerTrace;
  }

  /** The structure as it is now. Treat it as read-only; change it with `update`. */
  get model(): Model {
    return this.currentModel;
  }

  get stepCount(): number {
    return this.steps.length;
  }

  /** Replaces the model with a changed copy. Models are immutable, so old snapshots stay valid. */
  update(change: (model: Model) => Model): void {
    this.currentModel = change(this.currentModel);
  }

  /** Adds to a live counter (comparisons, swaps, reads, writes). */
  count(counter: CounterName, by = 1): void {
    this.counters = { ...this.counters, [counter]: this.counters[counter] + by };
  }

  /** Records a step: a full snapshot of the current model with this step's highlights. */
  step(input: StepInput<Annotations>): void {
    if (isStepLimitReached(this.steps.length, this.maxSteps)) {
      throw new StepLimitError(this.maxSteps);
    }
    this.record(input);
  }

  /**
   * Ends the operation early with a learner-facing error (overflow, not found). Adds a final
   * step showing it, even past the step limit, so the learner always sees why it stopped.
   */
  fail(code: string, message: Caption, input: Omit<StepInput<Annotations>, 'caption'> = {}): void {
    this.error = { code, message };
    this.record({ ...input, caption: message });
  }

  get failed(): boolean {
    return this.error !== undefined;
  }

  finish<Result>(result?: Result): Trace<Result> {
    return {
      operation: this.options.operation,
      steps: [...this.steps],
      ...(result === undefined ? {} : { result }),
      ...(this.error ? { error: this.error } : {}),
    };
  }

  private record({ caption, line, vars, annotations, pause }: StepInput<Annotations>): void {
    const scene = this.options.toScene(this.currentModel, annotations);
    this.steps.push({
      scene,
      caption,
      counters: { ...this.counters },
      a11y: this.options.describe(scene),
      ...(line === undefined ? {} : { codeLine: line }),
      ...(vars === undefined ? {} : { vars: stringifyVars(vars) }),
      ...(pause === undefined ? {} : { pause }),
    });
  }
}

/**
 * Runs an operation against a tracer and returns the trace plus the final model (the sandbox
 * continues from it). Hitting the step limit ends the trace with an error step instead of
 * throwing.
 */
export function runTrace<Model, Annotations, Result>(
  options: TracerOptions<Model, Annotations>,
  operation: (tracer: Tracer<Model, Annotations>) => Result,
): { trace: Trace<Result>; model: Model } {
  const tracer = new Tracer(options);
  try {
    const result = operation(tracer);
    return { trace: tracer.finish(result), model: tracer.model };
  } catch (error) {
    if (!(error instanceof StepLimitError)) throw error;
    tracer.fail('engine.step-limit', { key: 'engine.step-limit', params: { limit: error.limit } });
    return { trace: tracer.finish<Result>(), model: tracer.model };
  }
}
