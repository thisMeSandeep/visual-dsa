/**
 * Call-stack scene → drawables (VISUAL-SPEC §7 "Call stack"). Pure, so it's unit-tested.
 *
 *   call stack           calls
 *   ┌──────────────┐               f(4)
 *   │ fib(2)       │             /      \
 *   │ 1 + fib(0)   │ ← running  f(3)    f(2)
 *   ├──────────────┤           /   \
 *   │ fib(3)       │         f(2)  f(1)
 *   │ fib(2) + …   │ ← waiting
 *   └──────────────┘
 *   ──────────────── the bottom of the stack
 *
 * Frames stack upwards from the bottom, with room kept for the deepest the run gets. The call
 * tree (Fibonacci) sits to the right at its final size, each node at its column and depth.
 */
import type { ElementState, Scene, SceneElement } from '@/engine/core/types';
import type { VizSizes } from '@/theme';

import type { Drawable } from '../../canvas/types';

export type CallStackLayout = { drawables: Drawable[]; width: number; height: number };

type Cell = Extract<SceneElement, { kind: 'cell' }>;
type Edge = Extract<SceneElement, { kind: 'edge' }>;

export function layoutCallStack(scene: Scene, sizes: VizSizes): CallStackLayout {
  const meta = scene.meta ?? {};
  const reserve = Math.max(1, Number(meta.reserve ?? 1));
  const containerState = (meta.container ?? 'default') as ElementState;
  const fw = sizes.frameWidth;
  const fh = sizes.cellHeight;
  const gap = sizes.gap;

  const top = sizes.fontLabel + sizes.labelGap * 2;
  const frameY = (depth: number) => top + (reserve - 1 - depth) * (fh + gap);
  const stackBottom = top + reserve * (fh + gap) - gap;
  const groundY = stackBottom + gap;

  const drawables: Drawable[] = [
    label('stack-label', 'call stack', 0),
    {
      kind: 'path',
      id: 'stack-ground',
      path: `M 0 ${groundY} H ${fw}`,
      tone: containerState === 'error' ? 'danger' : 'line-strong',
      strokeWidth: 'active',
    },
  ];

  const cells = scene.elements.filter((e): e is Cell => e.kind === 'cell');
  for (const cell of cells) {
    if (cell.slot.type !== 'frame') continue;
    drawables.push({
      kind: 'box',
      id: cell.id,
      x: 0,
      y: frameY(cell.slot.depth),
      width: fw,
      height: fh,
      state: cell.state,
      value: cell.value,
      ...(cell.detail === undefined ? {} : { detail: cell.detail }),
    });
  }

  // The call tree, when there is one.
  const columns = Number(meta.columns ?? 0);
  const levels = Number(meta.levels ?? 0);
  const nw = sizes.callNodeWidth;
  const nh = sizes.nodeHeight;
  const treeX = fw + sizes.sceneGap;
  const nodeX = (column: number) => treeX + column * (nw + gap);
  const nodeY = (depth: number) => top + depth * (nh + sizes.levelGap);
  const centres = new Map<string, { x: number; top: number; bottom: number }>();
  if (columns > 0) {
    drawables.push(label('tree-label', 'calls', treeX));
    for (const cell of cells) {
      if (cell.slot.type !== 'tree') continue;
      const x = nodeX(cell.slot.column);
      const y = nodeY(cell.slot.depth);
      centres.set(cell.id, { x: x + nw / 2, top: y, bottom: y + nh });
      drawables.push({
        kind: 'box',
        id: cell.id,
        x,
        y,
        width: nw,
        height: nh,
        state: cell.state,
        value: cell.value,
        ...(cell.detail === undefined ? {} : { detail: cell.detail }),
      });
    }
    for (const edge of scene.elements.filter((e): e is Edge => e.kind === 'edge')) {
      const from = centres.get(edge.from);
      const to = centres.get(edge.to);
      if (!from || !to) continue;
      // Drawn first, so the nodes cover the ends of their lines.
      drawables.unshift({
        kind: 'line',
        id: edge.id,
        x1: from.x,
        y1: from.bottom,
        x2: to.x,
        y2: to.top,
        tone: 'line-strong',
        arrow: false,
      });
    }
  }

  const treeWidth = columns > 0 ? nodeX(columns) - gap : 0;
  const treeHeight = levels > 0 ? nodeY(levels) - sizes.levelGap : 0;
  return {
    drawables,
    width: Math.max(fw, treeWidth),
    height: Math.max(groundY, treeHeight),
  };

  function label(id: string, text: string, x: number): Drawable {
    return {
      kind: 'text',
      id,
      x,
      y: sizes.fontLabel / 2,
      text,
      font: 'label',
      tone: 'muted',
      align: 'left',
    };
  }
}
