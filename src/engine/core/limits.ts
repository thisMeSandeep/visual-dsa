/**
 * Guards that keep traces small enough to animate and inputs small enough to fit a phone
 * (ARCHITECTURE §5.2). Values come from config.engine.
 */
import { config } from '@/config';

import type { Caption } from './types';

const { maxStepsPerTrace, maxItems, valueRange } = config.engine;

/** Thrown by the tracer when a trace reaches the step limit; runTrace turns it into an error step. */
export class StepLimitError extends Error {
  constructor(readonly limit: number) {
    super(`Trace reached the limit of ${limit} steps`);
    this.name = 'StepLimitError';
  }
}

export function isStepLimitReached(stepCount: number, limit: number = maxStepsPerTrace): boolean {
  return stepCount >= limit;
}

/** A problem with learner input, shown as an error step rather than an alert (F-606). */
export type InputProblem = {
  code: 'engine.too-many-items' | 'engine.value-out-of-range' | 'engine.not-a-whole-number';
  message: Caption;
};

/** Null when a structure of `count` items is allowed. */
export function checkItemCount(count: number, limit: number = maxItems): InputProblem | null {
  if (count <= limit) return null;
  return {
    code: 'engine.too-many-items',
    message: { key: 'engine.too-many-items', params: { count, limit } },
  };
}

/** Null when `value` is a whole number inside the allowed range. */
export function checkValue(
  value: number,
  range: { min: number; max: number } = valueRange,
): InputProblem | null {
  if (!Number.isInteger(value)) {
    return {
      code: 'engine.not-a-whole-number',
      message: { key: 'engine.not-a-whole-number', params: { value: String(value) } },
    };
  }
  if (value < range.min || value > range.max) {
    return {
      code: 'engine.value-out-of-range',
      message: { key: 'engine.value-out-of-range', params: { value, ...range } },
    };
  }
  return null;
}
