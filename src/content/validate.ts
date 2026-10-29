/**
 * Content validation shared by `bun run validate:content` and the content tests.
 * Returns a list of problems; an empty list means the content is valid.
 */
import type { z } from 'zod';

import { TOPIC_METAS } from './registry';
import { TopicMetaSchema } from './schema';

export type ContentIssue = {
  /** Which topic (or registry key) the problem is in. */
  topicId: string;
  /** Where in the content, e.g. "chapters.2.title". Empty for the whole entry. */
  path: string;
  message: string;
};

function toIssues(topicId: string, error: z.ZodError): ContentIssue[] {
  return error.issues.map((issue) => ({
    topicId,
    path: issue.path.map(String).join('.'),
    message: issue.message,
  }));
}

/** Checks each meta against the schema and that it's registered under its own id. */
export function validateTopicMetas(metas: Record<string, unknown>): ContentIssue[] {
  return Object.entries(metas).flatMap(([key, value]) => {
    const result = TopicMetaSchema.safeParse(value);
    if (!result.success) return toIssues(key, result.error);
    if (result.data.id !== key) {
      return [
        {
          topicId: key,
          path: 'id',
          message: `Registered as "${key}" but its id is "${result.data.id}"`,
        },
      ];
    }
    return [];
  });
}

/** Validates all registered content. */
export function validateContent(): ContentIssue[] {
  return validateTopicMetas(TOPIC_METAS);
}
