/**
 * Queue scene → drawables (VISUAL-SPEC §7). Pure, so it's unit-tested.
 *
 *          front
 *            ↓
 *   ┌──────────────────────────────┐
 *   │ [  ] [23] [ 8] [42] [  ] [  ] │  [rejected]   ← slots for the full capacity, items in place
 *   └──────────────────────────────┘
 *      0    1    2    3    4    5                    ← slot indices
 *                      ↑
 *                     rear
 *      ╰──────── wrap-around ───────╯                ← circular mode only
 *
 * Every slot is drawn, empty or not, so the canvas never changes size; a plain array dims the
 * slots it can no longer use. The space for a rejected value is always reserved.
 */
import type { ElementState, Scene, SceneElement } from '@/engine/core/types';
import type { VizSizes } from '@/theme';

import type { Drawable } from '../../canvas/types';

export type QueueLayout = { drawables: Drawable[]; width: number; height: number };

export const FRAME_ID = 'queue-frame';
export const WRAP_ARC_ID = 'queue-wrap';

type Cell = Extract<SceneElement, { kind: 'cell' }>;
type Pointer = Extract<SceneElement, { kind: 'pointer' }>;

export function layoutQueue(scene: Scene, sizes: VizSizes): QueueLayout {
  const meta = scene.meta ?? {};
  const capacity = Number(meta.capacity ?? 0);
  const wasted = Number(meta.wasted ?? 0);
  const circular = meta.mode === 'circular';
  const containerState = (meta.container ?? 'default') as ElementState;

  const w = sizes.cellWidth;
  const h = sizes.cellHeight;
  const pad = sizes.stackPadding;
  const pointerSpace = sizes.fontLabel + sizes.labelGap + sizes.pointerLength;

  // Vertical: front pointer, the framed row, indices, rear pointer, then the wrap-around arc.
  const frameTop = pointerSpace + sizes.labelGap;
  const rowTop = frameTop + pad;
  const frameBottom = rowTop + h + pad;
  const indexY = frameBottom + sizes.labelGap + sizes.fontIndex / 2;
  const indexBottom = frameBottom + sizes.labelGap + sizes.fontIndex;
  const rearArrowTop = indexBottom + sizes.labelGap;
  const rearArrowBottom = rearArrowTop + sizes.pointerLength;
  const rearLabelY = rearArrowBottom + sizes.labelGap + sizes.fontLabel / 2;
  const rearBottom = rearArrowBottom + sizes.labelGap + sizes.fontLabel;
  const arcTop = rearBottom + sizes.labelGap;

  // Horizontal: the framed row, then room for a value that didn't fit.
  const slotX = (slot: number) => pad + slot * (w + sizes.gap);
  const frameRight = slotX(capacity) - sizes.gap + pad;
  const rejectedX = frameRight + 2 * sizes.gap;
  const width = rejectedX + w;
  const centre = (slot: number) => slotX(slot) + w / 2;

  const frame: Drawable = {
    kind: 'path',
    id: FRAME_ID,
    path: roundedRect(0, frameTop, frameRight, frameBottom, sizes.stackRadius),
    tone: containerState === 'error' ? 'danger' : 'line-strong',
    strokeWidth: 'active',
  };

  const slots: Drawable[] = Array.from({ length: capacity }, (_, slot) => ({
    kind: 'box',
    id: `slot-${slot}`,
    x: slotX(slot),
    y: rowTop,
    width: w,
    height: h,
    state: slot < wasted ? 'dimmed' : 'default',
    value: '',
  }));

  const indices: Drawable[] = Array.from({ length: capacity }, (_, slot) => ({
    kind: 'text',
    id: `index-${slot}`,
    x: centre(slot),
    y: indexY,
    text: String(slot),
    font: 'index',
    tone: 'muted',
    align: 'center',
  }));

  const cells = scene.elements.filter((e): e is Cell => e.kind === 'cell');
  const items: Drawable[] = cells.map((cell) => {
    const slot = cell.slot.type === 'index' ? cell.slot.index : 0;
    return {
      kind: 'box',
      id: cell.id,
      x: slot >= capacity ? rejectedX : slotX(slot),
      y: rowTop,
      width: w,
      height: h,
      state: cell.state,
      value: cell.value,
    };
  });

  const slotOf = (target: string) => {
    const cell = cells.find((c) => c.id === target);
    return cell?.slot.type === 'index' ? cell.slot.index : undefined;
  };

  const pointers = scene.elements
    .filter((e): e is Pointer => e.kind === 'pointer')
    .flatMap((pointer): Drawable[] => {
      const slot = slotOf(pointer.target);
      if (slot === undefined) return [];
      const x = centre(slot);
      // "front" points down at the row from above; "rear" points up at its slot from below.
      const above = pointer.label !== 'rear';
      const arrow = above
        ? { y1: sizes.fontLabel + sizes.labelGap, y2: frameTop - sizes.labelGap }
        : { y1: rearArrowBottom, y2: rearArrowTop };
      return [
        {
          kind: 'line',
          id: `${pointer.id}-arrow`,
          x1: x,
          x2: x,
          ...arrow,
          tone: 'signal',
          arrow: true,
        },
        {
          kind: 'text',
          id: pointer.id,
          x,
          y: above ? sizes.fontLabel / 2 : rearLabelY,
          text: pointer.label,
          font: 'label',
          tone: 'signal-ink',
          align: 'center',
        },
      ];
    });

  // A circular buffer's last slot leads back round to slot 0.
  const arc: Drawable[] =
    circular && capacity > 1
      ? [
          {
            kind: 'path',
            id: WRAP_ARC_ID,
            path: wrapArc(centre(capacity - 1), centre(0), arcTop, sizes.queueArc, sizes.arrowSize),
            tone: 'edge',
            strokeWidth: 'normal',
          },
        ]
      : [];

  return {
    drawables: [frame, ...slots, ...indices, ...items, ...pointers, ...arc],
    width,
    height: arcTop + sizes.queueArc,
  };
}

function roundedRect(left: number, top: number, right: number, bottom: number, r: number): string {
  return (
    `M ${left + r} ${top} H ${right - r} A ${r} ${r} 0 0 1 ${right} ${top + r} ` +
    `V ${bottom - r} A ${r} ${r} 0 0 1 ${right - r} ${bottom} H ${left + r} ` +
    `A ${r} ${r} 0 0 1 ${left} ${bottom - r} V ${top + r} A ${r} ${r} 0 0 1 ${left + r} ${top} Z`
  );
}

/** A curve from the last slot, dipping below, back up to slot 0, with an arrowhead there. */
function wrapArc(from: number, to: number, top: number, depth: number, head: number): string {
  const bottom = top + depth;
  return (
    `M ${from} ${top} C ${from} ${bottom}, ${to} ${bottom}, ${to} ${top} ` +
    `M ${to - head} ${top + head} L ${to} ${top} L ${to + head} ${top + head}`
  );
}
