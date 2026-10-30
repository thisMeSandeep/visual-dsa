import { z } from 'zod';

import { captionText } from '@/content/captions';
import { checkValue } from '@/engine/core/limits';

const ValueTextSchema = z
  .string()
  .trim()
  .min(1, 'Type a number first, or tap Random.')
  .regex(/^-?\d+(\.\d+)?$/, 'Use a number, like 42.');

export type ParsedValue = { ok: true; value: string } | { ok: false; problem: string };

/**
 * Checks a typed value (F-601, F-606): it must be a number (Zod), then a whole number inside
 * the engine's range (engine/core/limits). Problems are explained in words, never ignored.
 */
export function parseValue(text: string): ParsedValue {
  const parsed = ValueTextSchema.safeParse(text);
  if (!parsed.success) {
    return { ok: false, problem: parsed.error.issues[0]?.message ?? 'Use a number, like 42.' };
  }
  const value = Number(parsed.data);
  const problem = checkValue(value);
  if (problem) return { ok: false, problem: captionText(problem.message).replaceAll('**', '') };
  return { ok: true, value: String(value) };
}

/**
 * Checks the node a list operation inserts next to (F-606): typed like a value, with its own
 * prompt when the field is empty.
 */
export function parseTarget(text: string): ParsedValue {
  if (text.trim() === '') return { ok: false, problem: 'Type the node to insert next to, like 7.' };
  return parseValue(text);
}
