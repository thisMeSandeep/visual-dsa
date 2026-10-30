/**
 * What each element state means, for the inline legend and the legend sheet (F-306, VISUAL-SPEC
 * §7 "State palette"). Kept beside state-style.ts, which says how each state looks.
 */
import type { ElementState, Scene } from '@/engine/core/types';

/** A state's name in the inline legend. */
export const STATE_LABELS: Readonly<Record<ElementState, string>> = {
  default: 'Waiting',
  active: 'Current',
  new: 'New',
  collision: 'Collision',
  swapping: 'Swapping',
  pivot: 'Pivot',
  visited: 'Visited',
  found: 'Found',
  sorted: 'Sorted',
  error: 'Error',
  dimmed: 'Faded',
};

/** The order states are listed in: "look here" first, then results, then the quiet ones. */
export const LEGEND_ORDER: readonly ElementState[] = [
  'active',
  'new',
  'collision',
  'swapping',
  'pivot',
  'visited',
  'found',
  'sorted',
  'error',
  'dimmed',
];

/** The legend sheet: states that look alike are explained together. */
export const LEGEND_GROUPS: readonly {
  states: readonly ElementState[];
  title: string;
  meaning: string;
}[] = [
  {
    states: ['active', 'new', 'collision', 'swapping'],
    title: 'Look here',
    meaning:
      'Orange means “this one, now”: being compared, read or moved, just added, or colliding.',
  },
  {
    states: ['pivot'],
    title: 'Pivot',
    meaning: 'Quick sort’s pivot: every other item in the range is compared with it.',
  },
  {
    states: ['visited'],
    title: 'Visited',
    meaning: 'Already checked on the way, so it won’t be looked at again in this pass.',
  },
  {
    states: ['found', 'sorted'],
    title: 'Found',
    meaning: 'Green means done: the answer, or an item in its final place.',
  },
  {
    states: ['error'],
    title: 'Error',
    meaning:
      'Something failed, such as out of bounds, overflow or not found. The border is dashed.',
  },
  {
    states: ['dimmed'],
    title: 'Faded',
    meaning: 'Out of focus: removed, wasted, or left behind as a copy.',
  },
  {
    states: ['default'],
    title: 'Waiting',
    meaning: 'Not part of this step.',
  },
];

/**
 * The states on the canvas in a scene, besides default, in legend order: its cells and arrows,
 * a hash table's bucket in focus, and a structure in error.
 */
export function visibleStates(scene: Scene): ElementState[] {
  const seen = new Set<ElementState>();
  for (const element of scene.elements) {
    if (element.kind === 'cell' || element.kind === 'edge') seen.add(element.state);
  }
  const meta = scene.meta ?? {};
  if (typeof meta.bucketState === 'string') seen.add(meta.bucketState as ElementState);
  if (meta.container === 'error') seen.add('error');
  return LEGEND_ORDER.filter((state) => seen.has(state));
}
