/**
 * The shape of a lesson recipe, as the compiler reads it (ARCHITECTURE §4.3). Content defines the
 * same shape with Zod (content/schema.ts) and validates it; the engine can't import content, so
 * it declares its own copy and TypeScript checks the two match where they meet.
 */
export type RecipeSegment =
  /** Starts a chapter: every following step belongs to it. */
  | { kind: 'chapter'; chapterId: string }
  /** Creates (or resets) a structure, e.g. an empty stack of capacity 4. Adds no steps. */
  | { kind: 'setup'; structure: string; input?: unknown }
  /** Runs a real operation, e.g. 'stack.push' with { value: '23' }, and adds its steps. */
  | {
      kind: 'trace';
      operation: string;
      input?: unknown;
      /** Authored captions replacing the engine's, keyed by step number within this trace. */
      captions?: Readonly<Record<string, string>>;
    }
  /** A hand-built real-world example scene, one step per caption. */
  | { kind: 'scene'; sceneId: string; steps: readonly { caption: string }[] }
  /** A caption over the structure as it is now. */
  | { kind: 'say'; caption: string }
  /** The learner has to act before the lesson continues (F-208). */
  | { kind: 'interactive'; prompt: string; expect?: unknown }
  /** An inline predict-the-next-step question (F-702). */
  | { kind: 'predict'; questionId: string };

export type LessonRecipeInput = {
  topicId: string;
  segments: readonly RecipeSegment[];
};
