import { getTopicMeta } from '@/content/registry';
import { buildStackDemoLesson } from '@/engine/lesson/stack-demo';
import type { CompiledLesson } from '@/engine/lesson/types';

const cache = new Map<string, CompiledLesson | undefined>();

/**
 * The playable lesson for a topic, or undefined if it isn't written yet. Built once and kept.
 * For now only Stack has one (a hard-coded demo, Step 4.4); Step 5.1 compiles every topic's
 * lesson recipe from content instead.
 */
export function getLesson(topicId: string): CompiledLesson | undefined {
  if (cache.has(topicId)) return cache.get(topicId);

  const meta = getTopicMeta(topicId);
  const lesson =
    meta && topicId === 'stack'
      ? buildStackDemoLesson(
          Object.fromEntries(meta.chapters.map((chapter) => [chapter.id, chapter.title])),
        )
      : undefined;

  cache.set(topicId, lesson);
  return lesson;
}
