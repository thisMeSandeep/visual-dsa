import { z } from 'zod';

import { config } from '@/config';

const { maxItems } = config.engine;

const IndexTextSchema = z
  .string()
  .trim()
  .min(1, 'Type an index first, like 2.')
  .regex(/^\d+$/, 'Use a whole number from 0, like 2.')
  .transform(Number)
  .pipe(
    z.number().max(maxItems - 1, `No array here is that long: indices go up to ${maxItems - 1}.`),
  );

export type ParsedIndex = { ok: true; index: number } | { ok: false; problem: string };

/**
 * Checks a typed index (F-601, F-606): a whole number from 0 that could exist in an array this
 * app draws. Whether it's inside the current array is the engine's job: going out of bounds is
 * part of the lesson, shown on the canvas.
 */
export function parseIndex(text: string): ParsedIndex {
  const parsed = IndexTextSchema.safeParse(text);
  if (!parsed.success) {
    return { ok: false, problem: parsed.error.issues[0]?.message ?? 'Use a whole number, like 2.' };
  }
  return { ok: true, index: parsed.data };
}
