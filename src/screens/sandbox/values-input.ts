import { z } from 'zod';

import { config } from '@/config';
import { captionText } from '@/content/captions';
import { checkValue } from '@/engine/core/limits';
import type { Rng } from '@/engine/core/rng';

const { minItems, randomCount } = config.structures.sorting;
const { maxItems, valueRange } = config.engine;

const ValuesTextSchema = z
  .string()
  .transform((text) => text.split(/[\s,]+/).filter((part) => part.length > 0))
  .pipe(
    z
      .array(z.string().regex(/^-?\d+(\.\d+)?$/, 'Use numbers only, like 5 3 8 1.'))
      .min(1, 'Type some numbers first, like 5 3 8 1, or tap Random.')
      .min(minItems, `Type at least ${minItems} numbers, so there’s something to sort.`)
      .max(maxItems, `That’s too many to draw: at most ${maxItems} numbers.`),
  );

export type ParsedValues = { ok: true; values: string[] } | { ok: false; problem: string };

/**
 * Checks a typed list of numbers for a sort (F-601, F-606): separated by spaces or commas,
 * `minItems` to `maxItems` of them, each a whole number in the engine's range. Problems are
 * explained in words.
 */
export function parseValues(text: string): ParsedValues {
  const parsed = ValuesTextSchema.safeParse(text);
  if (!parsed.success) {
    return { ok: false, problem: parsed.error.issues[0]?.message ?? 'Check the numbers.' };
  }
  for (const part of parsed.data) {
    const problem = checkValue(Number(part));
    if (problem) return { ok: false, problem: captionText(problem.message).replaceAll('**', '') };
  }
  return { ok: true, values: parsed.data.map((part) => String(Number(part))) };
}

/** A random list of numbers for the field, as text. */
export const randomValues = (rng: Rng): string =>
  Array.from({ length: randomCount }, () => rng.int(valueRange.min, valueRange.max)).join(' ');
