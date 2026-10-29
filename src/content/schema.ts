/**
 * Zod schemas for all topic content (ARCHITECTURE §4.3). Every content file is checked against
 * these by `bun run validate:content` and by the content tests, so broken content fails before
 * it reaches a learner.
 */
import { z } from 'zod';

import { RENDERER_IDS } from '@/engine/core/renderer';

/* ------------------------------------------------------------------------------------------------
 * Shared pieces
 * ---------------------------------------------------------------------------------------------- */

/** kebab-case ids: topics, chapters, questions, tabs. */
export const IdSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use a kebab-case id, e.g. "hash-function"');

const TextSchema = z.string().trim().min(1, 'Must not be empty');

/** Topic categories (ALGORITHM-CATALOG §1). Each has its own glyph colour in the UI. */
export const TOPIC_CATEGORIES = [
  'foundations',
  'linear',
  'hashing',
  'trees',
  'graphs',
  'algorithms',
] as const;
export type TopicCategory = (typeof TOPIC_CATEGORIES)[number];

/** How each category is named on screen (Home section headers, Topic overline). */
export const CATEGORY_LABELS: Record<TopicCategory, string> = {
  foundations: 'Foundations',
  linear: 'Linear structures',
  hashing: 'Hashing',
  trees: 'Trees',
  graphs: 'Graphs',
  algorithms: 'Algorithms',
};

export const PRIORITIES = ['P0', 'P1', 'P2'] as const;

/** True when every item's `id` is different. */
const hasUniqueIds = (items: readonly { id: string }[]) =>
  new Set(items.map((item) => item.id)).size === items.length;

/* ------------------------------------------------------------------------------------------------
 * Topic meta: everything the Home and Topic screens need, without loading the lesson.
 * ---------------------------------------------------------------------------------------------- */

export const ChapterSchema = z.strictObject({
  id: IdSchema,
  title: TextSchema,
});

export const ComplexityStatSchema = z.strictObject({
  /** e.g. "Search" */
  label: TextSchema,
  /** e.g. "O(1)" */
  value: TextSchema,
});

export const TopicMetaSchema = z.strictObject({
  id: IdSchema,
  title: TextSchema,
  /** One sentence for the Topic screen. */
  summary: TextSchema,
  category: z.enum(TOPIC_CATEGORIES),
  priority: z.enum(PRIORITIES),
  /** The topic's main visualisation renderer. */
  renderer: z.enum(RENDERER_IDS),
  /** Name of the topic glyph drawn on Home (src/components/topic-glyph/glyphs.ts). */
  glyph: IdSchema,
  chapters: z
    .array(ChapterSchema)
    .min(1)
    .refine(hasUniqueIds, 'Chapter ids must be unique within a topic'),
  /** The stat strip on the Topic screen. */
  complexity: z.array(ComplexityStatSchema).min(1),
});

export type TopicMeta = z.infer<typeof TopicMetaSchema>;
export type Chapter = z.infer<typeof ChapterSchema>;

/* ------------------------------------------------------------------------------------------------
 * Lesson recipe: the steps a lesson is compiled from (engine/lesson/compile.ts). The engine
 * declares the same shape as RecipeSegment; content/registry.ts checks the two still match.
 * ---------------------------------------------------------------------------------------------- */

const StepIndexSchema = z.string().regex(/^\d+$/, 'Caption keys are step numbers');

export const LessonSegmentSchema = z.discriminatedUnion('kind', [
  /** Starts a chapter; every following step belongs to it. */
  z.strictObject({ kind: z.literal('chapter'), chapterId: IdSchema }),
  /** Creates (or resets) a structure, e.g. an empty stack of capacity 4. Adds no steps. */
  z.strictObject({
    kind: z.literal('setup'),
    /** e.g. "stack". The compiler checks the structure exists and the input fits it. */
    structure: IdSchema,
    input: z.unknown().optional(),
  }),
  /** Runs a real engine operation on the structure set up earlier and adds its steps. */
  z.strictObject({
    kind: z.literal('trace'),
    /** e.g. "hash-table.put" */
    operation: z.string().regex(/^[a-z0-9-]+\.[a-zA-Z]+$/, 'Use "<structure>.<operation>"'),
    input: z.unknown().optional(),
    /** Authored captions that replace the engine's, keyed by step number within the trace. */
    captions: z.record(StepIndexSchema, TextSchema).optional(),
  }),
  /** A hand-built analogy scene (browser back button, phone book). */
  z.strictObject({
    kind: z.literal('scene'),
    sceneId: IdSchema,
    steps: z.array(z.strictObject({ caption: TextSchema })).min(1),
  }),
  /** A caption over the current scene. */
  z.strictObject({ kind: z.literal('say'), caption: TextSchema }),
  /** The learner has to act before the lesson continues (F-208). */
  z.strictObject({
    kind: z.literal('interactive'),
    prompt: TextSchema,
    expect: z.unknown().optional(),
  }),
  /** An inline predict-the-next-step question (F-702). */
  z.strictObject({ kind: z.literal('predict'), questionId: IdSchema }),
]);

export const LessonRecipeSchema = z
  .strictObject({
    topicId: IdSchema,
    segments: z.array(LessonSegmentSchema).min(1),
  })
  .refine(
    (recipe) => recipe.segments[0]?.kind === 'chapter',
    'A lesson must start with a chapter segment',
  );

export type LessonSegment = z.infer<typeof LessonSegmentSchema>;
export type LessonRecipe = z.infer<typeof LessonRecipeSchema>;

/* ------------------------------------------------------------------------------------------------
 * Quiz (F-701, F-702, F-704)
 * ---------------------------------------------------------------------------------------------- */

const OptionSchema = z.strictObject({ id: IdSchema, text: TextSchema });

const questionBase = {
  id: IdSchema,
  prompt: TextSchema,
  /** Shown after answering: why the answer is right (F-705). */
  explanation: TextSchema,
  /** Chapter to revisit, linked from the feedback panel. */
  chapterId: IdSchema.optional(),
};

const withOptions = {
  options: z.array(OptionSchema).min(2).refine(hasUniqueIds, 'Option ids must be unique'),
  /** The id of the correct option. */
  answer: IdSchema,
};

const answerIsAnOption = (question: { options: { id: string }[]; answer: string }) =>
  question.options.some((option) => option.id === question.answer);

export const QuestionSchema = z
  .discriminatedUnion('kind', [
    z.strictObject({ ...questionBase, kind: z.literal('multiple-choice'), ...withOptions }),
    z.strictObject({ ...questionBase, kind: z.literal('complexity'), ...withOptions }),
    z.strictObject({ ...questionBase, kind: z.literal('true-false'), answer: z.boolean() }),
    z.strictObject({
      ...questionBase,
      kind: z.literal('predict'),
      operation: z.string(),
      input: z.unknown(),
      /** The step the player pauses on before asking. */
      step: z.number().int().nonnegative(),
      ...withOptions,
    }),
  ])
  .refine(
    (question) => question.kind === 'true-false' || answerIsAnOption(question),
    'The answer must be one of the option ids',
  );

export const QuizSchema = z.strictObject({
  topicId: IdSchema,
  questions: z.array(QuestionSchema).min(1).refine(hasUniqueIds, 'Question ids must be unique'),
});

export type Question = z.infer<typeof QuestionSchema>;
export type Quiz = z.infer<typeof QuizSchema>;

/* ------------------------------------------------------------------------------------------------
 * Reference sheet (F-801 – F-803)
 * ---------------------------------------------------------------------------------------------- */

export const ReferenceBlockSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('text'), text: TextSchema }),
  z.strictObject({ kind: z.literal('bullets'), items: z.array(TextSchema).min(1) }),
  z
    .strictObject({
      kind: z.literal('table'),
      columns: z.array(TextSchema).min(1),
      rows: z.array(z.array(TextSchema)).min(1),
    })
    .refine(
      (table) => table.rows.every((row) => row.length === table.columns.length),
      'Every table row needs one cell per column',
    ),
]);

export const ReferenceSchema = z.strictObject({
  topicId: IdSchema,
  tabs: z
    .array(
      z.strictObject({
        id: IdSchema,
        title: TextSchema,
        blocks: z.array(ReferenceBlockSchema).min(1),
      }),
    )
    .min(1)
    .refine(hasUniqueIds, 'Tab ids must be unique'),
});

export type Reference = z.infer<typeof ReferenceSchema>;
