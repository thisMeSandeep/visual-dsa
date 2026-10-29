/**
 * Stack scene → drawables (VISUAL-SPEC §7, concept canvas "Sandbox"). Pure, so it's unit-tested.
 *
 *            [rejected]          ← one slot reserved above the container for overflow
 *   top → │ [   42   ] │         ← items bottom-up, top item highlighted by the engine
 *         │ [   17   ] │
 *         ╰────────────╯         ← U-shaped container drawn for the full capacity
 *
 * The container always fits `capacity` items, so the canvas height doesn't change on push/pop.
 * The content is symmetric around the container, so it sits centred on screen.
 */
import type { ElementState, Scene, SceneElement } from '@/engine/core/types';
import type { VizSizes } from '@/theme';

import type { Drawable } from '../../canvas/types';

export type StackLayout = {
  drawables: Drawable[];
  /** Natural size of the content; the canvas scales it down if the viewport is smaller. */
  width: number;
  height: number;
};

export const CONTAINER_ID = 'stack-container';

type Cell = Extract<SceneElement, { kind: 'cell' }>;
type Pointer = Extract<SceneElement, { kind: 'pointer' }>;

export function layoutStack(scene: Scene, sizes: VizSizes): StackLayout {
  const capacity = Number(scene.meta?.capacity ?? 0);
  const containerState = (scene.meta?.container ?? 'default') as ElementState;

  const itemHeight = sizes.nodeHeight;
  const itemWidth = sizes.stackItemWidth;
  const pad = sizes.stackPadding;
  const stroke = sizes.borderWidthActive;

  // Horizontal: [pointer label][arrow] container [same space on the right, for symmetry].
  const sideWidth = sizes.pointerLabelWidth + sizes.pointerLength + 2 * sizes.labelGap;
  const containerWidth = itemWidth + 2 * pad;
  const containerLeft = sideWidth;
  const containerRight = containerLeft + containerWidth;
  const itemX = containerLeft + pad;

  // Vertical: one reserved slot for an overflowing value, then the container.
  const slotsHeight = capacity * itemHeight + Math.max(0, capacity - 1) * sizes.gap;
  const containerTop = itemHeight + sizes.gap + stroke / 2;
  const containerBottom = containerTop + slotsHeight + pad;

  /** Top edge of the item in index slot `index` (0 = bottom). Slot `capacity` is above the container. */
  const itemY = (index: number) =>
    containerBottom - pad - (index + 1) * itemHeight - index * sizes.gap;

  const cells = scene.elements.filter((e): e is Cell => e.kind === 'cell');
  const boxes: Drawable[] = cells.map((cell) => {
    const index = cell.slot.type === 'index' ? cell.slot.index : 0;
    return {
      kind: 'box',
      id: cell.id,
      x: itemX,
      // An item in a slot past capacity (the rejected value) floats just above the container.
      y: index >= capacity ? containerTop - stroke / 2 - sizes.gap - itemHeight : itemY(index),
      width: itemWidth,
      height: itemHeight,
      state: cell.state,
      value: cell.value,
      ...(cell.detail === undefined ? {} : { detail: cell.detail }),
    };
  });

  const pointers = scene.elements
    .filter((e): e is Pointer => e.kind === 'pointer')
    .flatMap((pointer): Drawable[] => {
      const target = boxes.find((box) => box.id === pointer.target);
      if (!target || target.kind !== 'box') return [];
      const y = target.y + target.height / 2;
      const arrowEnd = containerLeft - sizes.labelGap;
      const arrowStart = arrowEnd - sizes.pointerLength;
      return [
        {
          kind: 'line',
          id: `${pointer.id}-arrow`,
          x1: arrowStart,
          y1: y,
          x2: arrowEnd,
          y2: y,
          tone: 'signal',
          arrow: true,
        },
        {
          kind: 'text',
          id: pointer.id,
          x: arrowStart - sizes.labelGap,
          y,
          text: pointer.label,
          font: 'label',
          tone: 'signal-ink',
          align: 'right',
        },
      ];
    });

  const r = sizes.stackRadius;
  const container: Drawable = {
    kind: 'path',
    id: CONTAINER_ID,
    // Open at the top, rounded at the bottom corners.
    path:
      `M ${containerLeft} ${containerTop} ` +
      `L ${containerLeft} ${containerBottom - r} ` +
      `A ${r} ${r} 0 0 0 ${containerLeft + r} ${containerBottom} ` +
      `L ${containerRight - r} ${containerBottom} ` +
      `A ${r} ${r} 0 0 0 ${containerRight} ${containerBottom - r} ` +
      `L ${containerRight} ${containerTop}`,
    tone: containerState === 'error' ? 'danger' : 'line-strong',
    strokeWidth: 'active',
  };

  return {
    drawables: [container, ...boxes, ...pointers],
    width: containerRight + sideWidth,
    height: containerBottom + stroke / 2,
  };
}
