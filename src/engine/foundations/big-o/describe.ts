import type { Scene, SceneElement } from '../../core/types';
import { RUN_DOT_ID } from './to-scene';

type Cell = Extract<SceneElement, { kind: 'cell' }>;

/**
 * Screen-reader summary of a growth chart (F-1105), e.g. "Growth chart up to n = 10, marked at
 * n = 8. O(1): 1 step. O(n): 8 steps. O(n²): 64 steps. A run has counted 12 steps."
 */
export function describeGrowth(scene: Scene): string {
  const meta = scene.meta ?? {};
  const cells = scene.elements.filter((e): e is Cell => e.kind === 'cell');
  const parts = [`Growth chart up to n = ${meta.xMax}, marked at n = ${meta.n}.`];
  for (const curve of cells.filter((cell) => cell.id !== RUN_DOT_ID)) {
    parts.push(`${curve.value}: ${curve.detail} ${curve.detail === '1' ? 'step' : 'steps'}.`);
  }
  if (cells.length === 0) parts.push('No curves yet.');
  if (meta.steps !== undefined) parts.push(`A run has counted ${meta.steps} steps.`);
  return parts.join(' ');
}
