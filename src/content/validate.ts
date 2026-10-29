/**
 * Content validation shared by `bun run validate:content` and the content tests.
 * Returns a list of problems; an empty list means the content is valid.
 */
import type { z } from 'zod';

import { config } from '@/config';
import { compileLesson } from '@/engine/lesson/compile';
import { CompileError, STRUCTURES } from '@/engine/lesson/structures';
import type { CompiledLesson } from '@/engine/lesson/types';

import { CODE_SAMPLES } from './code';
import type { CodeSamples } from './code-types';
import {
  chapterTitles,
  TOPIC_LESSONS,
  TOPIC_METAS,
  TOPIC_QUIZZES,
  TOPIC_SANDBOXES,
} from './registry';
import {
  LessonRecipeSchema,
  QuizSchema,
  SandboxToolsSchema,
  TopicMetaSchema,
  type TopicMeta,
} from './schema';

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
 * such as an unknown chapter or operation, or a pop the lesson's stack can't do. Then checks
 * the code panel can highlight every step (see validateCodeLines).
 */
export function validateLessons(
  lessons: Record<string, unknown>,
  metas: Readonly<Record<string, TopicMeta>>,
  code: CodeSamples = CODE_SAMPLES,
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

    let lesson: CompiledLesson;
    try {
      lesson = compileLesson(result.data, chapterTitles(meta));
    } catch (error) {
      if (!(error instanceof CompileError)) throw error;
      return [{ topicId: key, path: error.at, message: error.reason }];
    }
    return validateCodeLines(key, lesson, code);
  });
}

/**
 * Every code line a lesson's steps point at must be marked (`@line`) in the topic's code
 * sample in every language, or the highlight would vanish when the learner switches language.
 */
export function validateCodeLines(
  topicId: string,
  lesson: CompiledLesson,
  code: CodeSamples,
): ContentIssue[] {
  const used = [...new Set(lesson.steps.flatMap((step) => step.codeLine ?? []))];
  if (used.length === 0) return [];

  return config.app.codeLanguages.flatMap((language): ContentIssue[] => {
    const path = `code/${language}`;
    const sample = code[topicId]?.[language];
    if (!sample) {
      return [{ topicId, path, message: 'The lesson highlights code, but there is no sample' }];
    }
    return used
      .filter((id) => !sample.lineIds[id])
      .map((id) => ({
        topicId,
        path,
        message: `No line is marked "@line ${id}", which the lesson highlights`,
      }));
  });
}

/**
 * Checks each topic's sandbox tools against the schema, then against the engine: each tool's
 * structure and operations exist, and every preset builds. Paths start with the tool's index.
 */
export function validateSandboxes(sandboxes: Record<string, unknown>): ContentIssue[] {
  return Object.entries(sandboxes).flatMap(([key, value]): ContentIssue[] => {
    const result = SandboxToolsSchema.safeParse(value);
    if (!result.success) return toIssues(key, result.error);

    return result.data.flatMap((tool, toolIndex): ContentIssue[] => {
      const issue = (path: string, message: string): ContentIssue => ({
        topicId: key,
        path: `${toolIndex}.${path}`,
        message,
      });

      if (tool.topicId !== key) {
        return [issue('topicId', `Registered as "${key}" but its topicId is "${tool.topicId}"`)];
      }
      const definition = STRUCTURES[tool.structure];
      if (!definition) return [issue('structure', `Unknown structure "${tool.structure}"`)];

      const unknownOperations = tool.operations.flatMap((operation, index) =>
        definition.operations[operation.id]
          ? []
          : [issue(`operations.${index}.id`, `"${tool.structure}" has no "${operation.id}"`)],
      );
      const brokenPresets = tool.presets.flatMap((preset, index) => {
        try {
          definition.create(preset.input, `presets.${index}`);
          return [];
        } catch (error) {
          if (!(error instanceof CompileError)) throw error;
          return [issue(error.at, error.reason)];
        }
      });
      return [...unknownOperations, ...brokenPresets];
    });
  });
}

/**
 * Checks each quiz against the schema, that it's registered under its topic, and that every
 * "See in lesson" chapter is one of the topic's chapters.
 */
export function validateQuizzes(
  quizzes: Record<string, unknown>,
  metas: Readonly<Record<string, TopicMeta>>,
): ContentIssue[] {
  return Object.entries(quizzes).flatMap(([key, value]): ContentIssue[] => {
    const result = QuizSchema.safeParse(value);
    if (!result.success) return toIssues(key, result.error);
    const quiz = result.data;
    if (quiz.topicId !== key) {
      return [
        {
          topicId: key,
          path: 'topicId',
          message: `Registered as "${key}" but its topicId is "${quiz.topicId}"`,
        },
      ];
    }
    const chapters = new Set(metas[key]?.chapters.map((chapter) => chapter.id));
    return quiz.questions.flatMap((question, index) =>
      question.chapterId === undefined || chapters.has(question.chapterId)
        ? []
        : [
            {
              topicId: key,
              path: `questions.${index}.chapterId`,
              message: `No chapter "${question.chapterId}" in this topic`,
            },
          ],
    );
  });
}

/** Validates all registered content. */
export function validateContent(): ContentIssue[] {
  return [
    ...validateTopicMetas(TOPIC_METAS),
    ...validateLessons(TOPIC_LESSONS, TOPIC_METAS),
    ...validateSandboxes(TOPIC_SANDBOXES),
    ...validateQuizzes(TOPIC_QUIZZES, TOPIC_METAS),
  ];
}
