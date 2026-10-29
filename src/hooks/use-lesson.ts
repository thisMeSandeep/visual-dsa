import { chapterTitles, getTopicMeta, isTopicId, TOPIC_LESSONS } from '@/content/registry';
import { compileLesson } from '@/engine/lesson/compile';
import type { CompiledLesson } from '@/engine/lesson/types';

const cache = new Map<string, CompiledLesson | undefined>();

/**
 * The playable lesson for a topic, or undefined if it isn't written yet. Compiled from the
 * topic's recipe the first time it's asked for, then kept for the rest of the session.
 * `bun run validate:content` compiles every lesson, so a recipe that would throw here never ships.
 */
export function getLesson(topicId: string): CompiledLesson | undefined {
  if (cache.has(topicId)) return cache.get(topicId);

  const meta = getTopicMeta(topicId);
  const recipe = isTopicId(topicId) ? TOPIC_LESSONS[topicId] : undefined;
  const lesson = meta && recipe ? compileLesson(recipe, chapterTitles(meta)) : undefined;

  cache.set(topicId, lesson);
  return lesson;
}
