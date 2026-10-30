import { z } from 'zod';

import { config } from '@/config';

const { maxKeyLength } = config.structures.hashTable;

const KeyTextSchema = z
  .string()
  .trim()
  .min(1, 'Type a key first, like Sid.')
  .regex(/^[A-Za-z]+$/, 'Keys are names made of letters, like Sid.')
  .max(maxKeyLength, `At most ${maxKeyLength} letters, so the key fits its box.`);

export type ParsedKey = { ok: true; key: string } | { ok: false; problem: string };

/** Checks a typed hash-table key (F-606): a short name made of letters. */
export function parseKey(text: string): ParsedKey {
  const parsed = KeyTextSchema.safeParse(text);
  if (!parsed.success) {
    return { ok: false, problem: parsed.error.issues[0]?.message ?? 'Use a name, like Sid.' };
  }
  return { ok: true, key: parsed.data };
}
