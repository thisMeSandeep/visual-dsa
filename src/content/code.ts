/**
 * Code samples for the code panel, pre-tokenised at build time by `bun run highlight`
 * (scripts/highlight-code.ts). The JSON is generated and git-ignored; it's rebuilt after
 * `bun install` and before `bun run start`.
 */
import type { CodeLanguage } from '@/config';

import type { CodeSample, CodeSamples } from './code-types';
import generated from './generated/code-tokens.json';

/** Every topic's code, by topic id and language. */
export const CODE_SAMPLES = generated as unknown as CodeSamples;

/** A topic's code in one language, or undefined if it has none. */
export function getCodeSample(topicId: string, language: CodeLanguage): CodeSample | undefined {
  return CODE_SAMPLES[topicId]?.[language];
}

export type { CodeRole, CodeSample, CodeToken } from './code-types';
