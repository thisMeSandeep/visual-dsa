/**
 * The shape of the pre-tokenised code samples that `scripts/highlight-code.ts` writes to
 * `generated/code-tokens.json` (ARCHITECTURE §5.3). Kept apart from `code.ts` so the script can
 * use these types before the generated file exists.
 */
import type { CodeLanguage } from '@/config';

/** What a piece of code is. The code panel gives each role its own `code-*` colour token. */
export const CODE_ROLES = ['plain', 'keyword', 'name', 'string', 'number', 'comment'] as const;
export type CodeRole = (typeof CODE_ROLES)[number];

/** A run of text with one role. */
export type CodeToken = readonly [text: string, role: CodeRole];

export type CodeSample = {
  /** The code without its `@line` markers: what Copy puts on the clipboard. */
  source: string;
  /** One list of tokens per line. An empty line has no tokens. */
  lines: readonly (readonly CodeToken[])[];
  /** Line id (from the engine's steps) → the lines it highlights, 0-based. */
  lineIds: Readonly<Record<string, readonly number[]>>;
};

/** Topic id → language → sample. */
export type CodeSamples = Readonly<Record<string, Partial<Record<CodeLanguage, CodeSample>>>>;
