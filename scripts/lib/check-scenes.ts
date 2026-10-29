/**
 * Lesson scene segments must name a scene that exists (src/viz/scenes) and give exactly one
 * caption per step of it. Content can't import viz, so this check lives with the scripts.
 */
import type { LessonRecipe } from '@/content/schema';
import type { ContentIssue } from '@/content/validate';

export function sceneIssues(
  lessons: Readonly<Record<string, LessonRecipe>>,
  scenes: Readonly<Record<string, { stepCount: number }>>,
): ContentIssue[] {
  return Object.entries(lessons).flatMap(([topicId, lesson]) =>
    lesson.segments.flatMap((segment, index): ContentIssue[] => {
      if (segment.kind !== 'scene') return [];
      const path = `segments[${index}]`;
      const scene = scenes[segment.sceneId];
      if (!scene) {
        const known = Object.keys(scenes).join(', ');
        return [{ topicId, path, message: `No scene "${segment.sceneId}". Known: ${known}` }];
      }
      if (segment.steps.length !== scene.stepCount) {
        return [
          {
            topicId,
            path,
            message: `Scene "${segment.sceneId}" has ${scene.stepCount} steps, but ${segment.steps.length} captions`,
          },
        ];
      }
      return [];
    }),
  );
}
