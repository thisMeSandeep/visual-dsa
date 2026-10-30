import type { Scene, SceneElement } from '../../core/types';

type Cell = Extract<SceneElement, { kind: 'cell' }>;

/**
 * Screen-reader summary of a call-stack scene (F-1105), e.g. "Call stack, top first: fact(2),
 * 2 × fact(1); fact(3), 3 × fact(2). 3 calls so far."
 */
export function describeRecursion(scene: Scene): string {
  const meta = scene.meta ?? {};
  const frames = scene.elements
    .filter((e): e is Cell => e.kind === 'cell' && e.slot.type === 'frame')
    .sort((a, b) =>
      a.slot.type === 'frame' && b.slot.type === 'frame' ? b.slot.depth - a.slot.depth : 0,
    );
  const parts = [
    frames.length === 0
      ? 'The call stack is empty.'
      : `Call stack, top first: ${frames.map((f) => `${f.value}, ${f.detail ?? ''}`).join('; ')}.`,
  ];
  const calls = Number(meta.calls ?? 0);
  if (calls > 0) parts.push(`Calls made: ${calls}.`);
  if (typeof meta.memo === 'string')
    parts.push(`Memo: ${meta.memo === '–' ? 'empty' : meta.memo}.`);
  if (meta.container === 'error') parts.push('Stack overflow.');
  return parts.join(' ');
}
