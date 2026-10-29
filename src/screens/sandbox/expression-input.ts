import { z } from 'zod';

import { config } from '@/config';
import { openingCount } from '@/engine/structures/stack';

const { maxLength } = config.structures.brackets;
const { maxItems } = config.engine;

const ExpressionSchema = z
  .string()
  .transform((text) => text.replace(/\s+/g, ''))
  .pipe(
    z
      .string()
      .min(1, 'Type an expression first, or pick a preset.')
      .max(maxLength, `That’s too long to draw: at most ${maxLength} characters, spaces left out.`)
      .refine(
        (expression) => openingCount(expression) <= maxItems,
        `At most ${maxItems} opening brackets fit on the stack.`,
      ),
  );

export type ParsedExpression = { ok: true; expression: string } | { ok: false; problem: string };

/**
 * Checks a typed expression for the bracket checker (F-601, F-606): spaces are dropped, and it
 * must be short enough to draw with few enough opening brackets for the stack. Problems are
 * explained in words.
 */
export function parseExpression(text: string): ParsedExpression {
  const parsed = ExpressionSchema.safeParse(text);
  return parsed.success
    ? { ok: true, expression: parsed.data }
    : { ok: false, problem: parsed.error.issues[0]?.message ?? 'Check the expression.' };
}
