/**
 * Which haptic a step deserves (F-307): pure, so it's tested. Events are read from the canvas
 * states, so every structure gets them without its engine knowing about haptics:
 *
 * - error: something failed (overflow, out of bounds, a stack overflow);
 * - found: a match appears where the step before had none (so a run of returning recursive
 *   calls, each one `found`, gives one tap, not a tap per call);
 * - collision: a key lands in a taken bucket;
 * - swap: items start trading places.
 *
 * The strongest event wins when a step has several.
 */
import type { HapticEvent } from '@/config';
import type { ElementState, Step } from '@/engine/core/types';

function idsIn(step: Step | undefined, state: ElementState): Set<string> {
  const ids = new Set<string>();
  for (const element of step?.scene.elements ?? []) {
    if ((element.kind === 'cell' || element.kind === 'edge') && element.state === state) {
      ids.add(element.id);
    }
  }
  return ids;
}

const failed = (step: Step | undefined) =>
  step?.scene.meta?.container === 'error' ||
  step?.scene.meta?.bucketState === 'error' ||
  idsIn(step, 'error').size > 0;

/** Whether any element is in `state` now that wasn't in it the step before. */
function newly(step: Step, previous: Step | undefined, state: ElementState): boolean {
  const before = idsIn(previous, state);
  return [...idsIn(step, state)].some((id) => !before.has(id));
}

/** The event `step` should be felt as, coming forward from `previous`, if any. */
export function hapticFor(step: Step, previous: Step | undefined): HapticEvent | undefined {
  if (failed(step) && !failed(previous)) return 'error';
  if (idsIn(step, 'found').size > 0 && idsIn(previous, 'found').size === 0) return 'found';
  // A hash table marks a colliding bucket in its meta rather than on an element.
  const bucketCollides = (s: Step | undefined) => s?.scene.meta?.bucketState === 'collision';
  if (newly(step, previous, 'collision') || (bucketCollides(step) && !bucketCollides(previous))) {
    return 'collision';
  }
  if (newly(step, previous, 'swapping')) return 'swap';
  return undefined;
}
