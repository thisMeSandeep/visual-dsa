/**
 * Lesson recipe → playable lesson (ARCHITECTURE §5.4). Trace segments run the real operations,
 * so a lesson can never drift from what the algorithm does. Everything is checked as it goes:
 * an unknown chapter, structure or operation, or a bad input, throws a CompileError naming the
 * segment. `bun run validate:content` compiles every lesson, so those fail before release.
 */
import type { Counters, Scene, Step } from '../core/types';
import type { LessonRecipeInput } from './recipe';
import { CompileError, STRUCTURES } from './structures';
import type { CompiledLesson, LessonChapter } from './types';

const ZERO_COUNTERS: Counters = { comparisons: 0, swaps: 0, reads: 0, writes: 0 };

/** The structure a lesson is working with right now. */
type Active = { name: string; model: unknown };

/**
 * Compiles a recipe. `chapterTitles` maps the topic's chapter ids to titles; a chapter segment
 * must use one of them.
 */
export function compileLesson(
  recipe: LessonRecipeInput,
  chapterTitles: Readonly<Record<string, string>>,
): CompiledLesson {
  const steps: Step[] = [];
  const chapters: LessonChapter[] = [];
  const models = new Map<string, unknown>();
  let active: Active | undefined;

  /** The current structure drawn at rest, for steps that only change the caption. */
  const restingStep = (caption: Step['caption'], at: string): Step => {
    if (!active) throw new CompileError('Add a setup segment before this one', at);
    const definition = STRUCTURES[active.name]!;
    const scene = definition.toScene(active.model);
    return {
      scene,
      caption,
      counters: steps.at(-1)?.counters ?? ZERO_COUNTERS,
      a11y: definition.describe(scene),
    };
  };

  recipe.segments.forEach((segment, i) => {
    const at = `segments[${i}]`;

    switch (segment.kind) {
      case 'chapter': {
        const title = chapterTitles[segment.chapterId];
        if (title === undefined) {
          throw new CompileError(`Unknown chapter "${segment.chapterId}" for this topic`, at);
        }
        if (chapters.some((chapter) => chapter.id === segment.chapterId)) {
          throw new CompileError(`Chapter "${segment.chapterId}" appears twice`, at);
        }
        const previous = chapters.at(-1);
        if (previous && previous.firstStep === steps.length) {
          throw new CompileError(`Chapter "${previous.id}" has no steps`, at);
        }
        chapters.push({ id: segment.chapterId, title, firstStep: steps.length });
        return;
      }

      case 'setup': {
        const definition = STRUCTURES[segment.structure];
        if (!definition) throw new CompileError(`Unknown structure "${segment.structure}"`, at);
        const model = definition.create(segment.input, at);
        models.set(segment.structure, model);
        active = { name: segment.structure, model };
        return;
      }

      case 'trace': {
        const [structure = '', operation = ''] = segment.operation.split('.');
        const definition = STRUCTURES[structure];
        const run = definition?.operations[operation];
        if (!definition || !run) {
          throw new CompileError(`Unknown operation "${segment.operation}"`, at);
        }
        if (!models.has(structure)) {
          throw new CompileError(`Set up "${structure}" before using it`, at);
        }
        const result = run(models.get(structure), segment.input, at);
        models.set(structure, result.model);
        active = { name: structure, model: result.model };

        const overrides = segment.captions ?? {};
        for (const key of Object.keys(overrides)) {
          const index = Number(key);
          if (!Number.isInteger(index) || index < 0 || index >= result.trace.steps.length) {
            throw new CompileError(
              `Caption for step ${key}, but "${segment.operation}" has ${result.trace.steps.length} steps`,
              at,
            );
          }
        }
        result.trace.steps.forEach((step, index) => {
          const text = overrides[String(index)];
          steps.push(text === undefined ? step : { ...step, caption: { text } });
        });
        return;
      }

      case 'say':
        steps.push(restingStep({ text: segment.caption }, at));
        return;

      case 'interactive':
        steps.push({ ...restingStep({ text: segment.prompt }, at), pause: 'interactive' });
        return;

      case 'predict':
        steps.push({
          ...restingStep({ key: 'lesson.predict', params: { questionId: segment.questionId } }, at),
          pause: 'predict',
        });
        return;

      case 'scene':
        segment.steps.forEach((sceneStep, sceneIndex) => {
          const scene: Scene = {
            renderer: 'analogy',
            elements: [],
            meta: { sceneId: segment.sceneId, sceneStep: sceneIndex },
          };
          steps.push({
            scene,
            caption: { text: sceneStep.caption },
            counters: ZERO_COUNTERS,
            // The scene is a picture; its caption, without the **bold** marks, describes it best.
            a11y: sceneStep.caption.replaceAll('**', ''),
          });
        });
        return;
    }
  });

  if (chapters.length === 0)
    throw new CompileError('A lesson needs at least one chapter', 'segments');
  const last = chapters.at(-1)!;
  if (last.firstStep === steps.length) {
    throw new CompileError(`Chapter "${last.id}" has no steps`, 'segments');
  }

  return { topicId: recipe.topicId, steps: withChapterEnds(steps, chapters), chapters };
}

/** Marks each chapter's last step so autoplay stops there, unless it already waits for input. */
function withChapterEnds(steps: Step[], chapters: readonly LessonChapter[]): Step[] {
  const lastSteps = new Set(
    chapters.map((chapter, i) => (chapters[i + 1]?.firstStep ?? steps.length) - 1),
  );
  return steps.map((step, index) =>
    lastSteps.has(index) && step.pause === undefined ? { ...step, pause: 'chapter-end' } : step,
  );
}
