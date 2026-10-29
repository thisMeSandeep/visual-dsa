import { TOPIC_LESSONS } from '@/content/registry';
import type { LessonRecipe } from '@/content/schema';
import { SCENES } from '@/viz/scenes';

import { sceneIssues } from './check-scenes';

const lesson = (sceneId: string, captions: number): LessonRecipe => ({
  topicId: 'stack',
  segments: [
    { kind: 'chapter', chapterId: 'lifo' },
    {
      kind: 'scene',
      sceneId,
      steps: Array.from({ length: captions }, (_, n) => ({ caption: `Step ${n}` })),
    },
  ],
});
const SCENE_COUNTS = { plates: { stepCount: 2 } };

describe('sceneIssues', () => {
  it('accepts one caption per scene step', () => {
    expect(sceneIssues({ stack: lesson('plates', 2) }, SCENE_COUNTS)).toEqual([]);
  });

  it('reports a caption count that does not match the scene', () => {
    expect(sceneIssues({ stack: lesson('plates', 3) }, SCENE_COUNTS)).toEqual([
      {
        topicId: 'stack',
        path: 'segments[1]',
        message: 'Scene "plates" has 2 steps, but 3 captions',
      },
    ]);
  });

  it('reports an unknown scene', () => {
    expect(sceneIssues({ stack: lesson('cups', 1) }, SCENE_COUNTS)[0]?.message).toBe(
      'No scene "cups". Known: plates',
    );
  });

  it('passes for every registered lesson', () => {
    expect(sceneIssues(TOPIC_LESSONS, SCENES)).toEqual([]);
  });
});
