/**
 * Array scene → drawables (VISUAL-SPEC §7). Pure, so it's unit-tested.
 *
 *   old array                                   ← only while growing
 *   ┌─────────────────────┐
 *   │ [··] [ 8] [42] [17] │                     ← items wait here, copies left dimmed
 *   └─────────────────────┘
 *   new array        i
 *                    ↓
 *   ┌─────────────────────────────────────────┐
 *   │ [23] [  ] [  ] [  ] [  ] [  ] [  ] [  ] │ ← every slot of the capacity, items in place
 *   └─────────────────────────────────────────┘
 *      0    1    2    3    4    5    6    7     ← indices
 *    1000 1004 1008 1012 …                      ← memory addresses, when the lesson shows them
 *
 * Every slot is drawn, empty or not, so free capacity is visible and a shift shows its gap.
 */
import type { ElementState, Scene, SceneElement } from '@/engine/core/types';
import type { VizSizes } from '@/theme';

import type { Drawable } from '../../canvas/types';
import { roundedRect } from '../paths';

export type ArrayLayout = { drawables: Drawable[]; width: number; height: number };

/** Frames change width with the capacity, so each capacity has its own id and cross-fades. */
export const frameId = (capacity: number) => `array-frame-${capacity}`;
export const sourceFrameId = (capacity: number) => `array-source-frame-${capacity}`;

type Cell = Extract<SceneElement, { kind: 'cell' }>;
type Pointer = Extract<SceneElement, { kind: 'pointer' }>;

export function layoutArray(scene: Scene, sizes: VizSizes): ArrayLayout {
  const meta = scene.meta ?? {};
  const capacity = Number(meta.capacity ?? 0);
  const growing = meta.sourceCapacity !== undefined;
  const sourceCapacity = Number(meta.sourceCapacity ?? 0);
  const containerState = (meta.container ?? 'default') as ElementState;

  const w = sizes.cellWidth;
  const h = sizes.cellHeight;
  const pad = sizes.stackPadding;
  const slotX = (index: number) => pad + index * (w + sizes.gap);
  const frameRight = (slots: number) => slotX(slots) - sizes.gap + pad;
  const centre = (index: number) => slotX(index) + w / 2;
  const labelHeight = sizes.fontLabel + sizes.labelGap;

  const drawables: Drawable[] = [];

  // The old array, above, while the items are copied out of it.
  const sourceFrameTop = labelHeight;
  const sourceRowTop = sourceFrameTop + pad;
  const sourceFrameBottom = sourceRowTop + h + pad;
  if (growing) {
    drawables.push(
      label('source-label', 'old array', sizes.fontLabel / 2),
      {
        kind: 'path',
        id: sourceFrameId(sourceCapacity),
        path: roundedRect(0, sourceFrameTop, frameRight(sourceCapacity), sourceFrameBottom, pad),
        tone: 'line',
        strokeWidth: 'normal',
      },
      ...slotBoxes('source-slot', sourceCapacity, slotX, sourceRowTop, sizes),
    );
  }

  // The array itself: pointer space, the framed row, indices, then addresses.
  const top = growing ? sourceFrameBottom + sizes.sceneGap : 0;
  const pointerArrowTop = top + labelHeight;
  const frameTop = pointerArrowTop + sizes.pointerLength + sizes.labelGap;
  const rowTop = frameTop + pad;
  const frameBottom = rowTop + h + pad;
  const indexY = frameBottom + sizes.labelGap + sizes.fontIndex / 2;
  const indexBottom = frameBottom + sizes.labelGap + sizes.fontIndex;
  const hasAddresses = meta.addressBase !== undefined;
  const addressY = indexBottom + sizes.labelGap + sizes.fontIndex / 2;
  const bottom = hasAddresses ? indexBottom + sizes.labelGap + sizes.fontIndex : indexBottom;

  if (growing) drawables.push(label('main-label', 'new array', top + sizes.fontLabel / 2));
  drawables.push(
    {
      kind: 'path',
      id: frameId(capacity),
      path: roundedRect(0, frameTop, frameRight(capacity), frameBottom, pad),
      tone: containerState === 'error' ? 'danger' : 'line-strong',
      strokeWidth: 'active',
    },
    ...slotBoxes('slot', capacity, slotX, rowTop, sizes),
    ...Array.from({ length: capacity }, (_, index): Drawable => ({
      kind: 'text',
      id: `index-${index}`,
      x: centre(index),
      y: indexY,
      text: String(index),
      font: 'index',
      tone: 'muted',
      align: 'center',
    })),
  );

  if (hasAddresses) {
    const base = Number(meta.addressBase);
    const stride = Number(meta.addressStride ?? 1);
    drawables.push(
      ...Array.from({ length: capacity }, (_, index): Drawable => ({
        kind: 'text',
        id: `address-${index}`,
        x: centre(index),
        y: addressY,
        text: String(base + index * stride),
        font: 'index',
        tone: 'muted',
        align: 'center',
      })),
    );
  }

  const cells = scene.elements.filter((e): e is Cell => e.kind === 'cell');
  for (const cell of cells) {
    const index = cell.slot.type === 'index' || cell.slot.type === 'source' ? cell.slot.index : 0;
    drawables.push({
      kind: 'box',
      id: cell.id,
      x: slotX(index),
      y: cell.slot.type === 'source' ? sourceRowTop : rowTop,
      width: w,
      height: h,
      state: cell.state,
      value: cell.value,
    });
  }

  // Pointers point down at an item in the array from above.
  for (const pointer of scene.elements.filter((e): e is Pointer => e.kind === 'pointer')) {
    const target = cells.find((cell) => cell.id === pointer.target);
    if (target?.slot.type !== 'index') continue;
    const x = centre(target.slot.index);
    drawables.push(
      {
        kind: 'line',
        id: `${pointer.id}-arrow`,
        x1: x,
        x2: x,
        y1: pointerArrowTop,
        y2: frameTop - sizes.labelGap,
        tone: 'signal',
        arrow: true,
      },
      {
        kind: 'text',
        id: pointer.id,
        x,
        y: top + sizes.fontLabel / 2,
        text: pointer.label,
        font: 'label',
        tone: 'signal-ink',
        align: 'center',
      },
    );
  }

  return {
    drawables,
    width: Math.max(frameRight(capacity), growing ? frameRight(sourceCapacity) : 0),
    height: bottom,
  };

  function label(id: string, text: string, y: number): Drawable {
    return { kind: 'text', id, x: 0, y, text, font: 'label', tone: 'muted', align: 'left' };
  }
}

/** One empty box per slot, under the items. */
function slotBoxes(
  prefix: string,
  count: number,
  slotX: (index: number) => number,
  y: number,
  sizes: VizSizes,
): Drawable[] {
  return Array.from({ length: count }, (_, index) => ({
    kind: 'box',
    id: `${prefix}-${index}`,
    x: slotX(index),
    y,
    width: sizes.cellWidth,
    height: sizes.cellHeight,
    state: 'default',
    value: '',
  }));
}
