/**
 * Content validation shared by `bun run validate:content` and the content tests.
 * Returns a list of problems; an empty list means the content is valid.
 */
import type { z } from 'zod';

import { compileLesson } from '@/engine/lesson/compile';
import { CompileError } from '@/engine/lesson/structures';

import { chapterTitles, TOPIC_LESSONS, TOPIC_METAS } from './registry';
import { LessonRecipeSchema, TopicMetaSchema, type TopicMeta } from './schema';

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

/**
 * Checks each lesson against the schema, then compiles it: that catches what the schema can't,
 * such as an unknown chapter or operation, or a pop the lesson's stack can't do.
 */
export function validateLessons(
  lessons: Record<string, unknown>,
  metas: Readonly<Record<string, TopicMeta>>,
): ContentIssue[] {
  return Object.entries(lessons).flatMap(([key, value]): ContentIssue[] => {
    const result = LessonRecipeSchema.safeParse(value);
    if (!result.success) return toIssues(key, result.error);

    if (result.data.topicId !== key) {
      return [
        {
          topicId: key,
          path: 'topicId',
          message: `Registered as "${key}" but its topicId is "${result.data.topicId}"`,
        },
      ];
    }
    const meta = metas[key];
    if (!meta) return [{ topicId: key, path: '', message: 'No topic meta with this id' }];

    try {
      compileLesson(result.data, chapterTitles(meta));
      return [];
    } catch (error) {
      if (!(error instanceof CompileError)) throw error;
      return [{ topicId: key, path: error.at, message: error.reason }];
    }
  });
}

/** Validates all registered content. */
export function validateContent(): ContentIssue[] {
  return [...validateTopicMetas(TOPIC_METAS), ...validateLessons(TOPIC_LESSONS, TOPIC_METAS)];
}
