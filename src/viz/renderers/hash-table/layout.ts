/**
 * Hash-table scene → drawables (VISUAL-SPEC §7). Pure, so it's unit-tested.
 *
 *   ┌──────────────┐
 *   │ h("Jim") = 288│                         ← callout row, reserved even when empty
 *   └──────────────┘
 *   0 [•]──→[ Ann  ]                          chaining: a bucket column, chains to the right
 *   1 [ ]                                     (probing: one wide slot per bucket holding the
 *   2 [•]──→[ Ben  ]                           entry, and a probe arrow beside the slots)
 *   3 [•]──→[ Sid  ]──→[ Jim  ]
 *   4 [ ]
 *
 * While the table resizes, the old table stands on the left and the new one on its right; keys
 * move across one by one as they're rehashed.
 */
import type { ElementState, Scene, SceneElement } from '@/engine/core/types';
import type { VizSizes } from '@/theme';

import type { Drawable } from '../../canvas/types';

export type HashLayout = { drawables: Drawable[]; width: number; height: number };

export const PROBE_ID = 'probe';
/** Shown in an occupied chaining bucket (VISUAL-SPEC §7 "Bucket": a small dot). */
const OCCUPIED = '•';

type Cell = Extract<SceneElement, { kind: 'cell' }>;
type Placed = Cell & {
  slot: { type: 'bucket'; bucket: number; chainIndex: number; old?: boolean };
};

export function layoutHashTable(scene: Scene, sizes: VizSizes): HashLayout {
  const meta = scene.meta ?? {};
  const probing = meta.strategy === 'probing';
  const size = Number(meta.size ?? 0);
  const oldSize = meta.oldSize === undefined ? 0 : Number(meta.oldSize);
  const resizing = oldSize > 0;
  const failed = meta.container === 'error';

  const rowStep = sizes.nodeHeight + sizes.gap;
  const indexColumn = sizes.pointerLabelWidth;
  const calloutHeight = sizes.fontCallout + 2 * sizes.calloutPadY;
  const tableTop = calloutHeight + sizes.gap;
  const rowY = (bucket: number) => tableTop + bucket * rowStep;
  const nodeX = (left: number, chainIndex: number) =>
    left +
    indexColumn +
    sizes.bucketWidth +
    sizes.linkGap +
    chainIndex * (sizes.entryWidth + sizes.linkGap);

  const cells = scene.elements.filter(
    (e): e is Placed => e.kind === 'cell' && e.slot.type === 'bucket',
  );
  const inOld = cells.filter((cell) => cell.slot.old);
  const inNew = cells.filter((cell) => !cell.slot.old);

  // How wide a column is: its slots, or its buckets plus the longest chain.
  const columnWidth = (column: Placed[]) => {
    if (probing) return indexColumn + sizes.entryWidth + sizes.linkGap;
    const longest = Math.max(0, ...column.map((cell) => cell.slot.chainIndex + 1));
    return longest === 0
      ? indexColumn + sizes.bucketWidth
      : nodeX(0, longest - 1) + sizes.entryWidth;
  };
  const oldWidth = resizing ? columnWidth(inOld) : 0;
  const newLeft = resizing ? oldWidth + sizes.sceneGap : 0;

  const drawables: Drawable[] = [];

  /** One table's buckets (or slots), indices and entries, starting at `left`. */
  const drawTable = (
    left: number,
    buckets: number,
    column: Placed[],
    prefix: string,
    live: boolean,
  ) => {
    for (let bucket = 0; bucket < buckets; bucket++) {
      const y = rowY(bucket);
      const here = column.filter((cell) => cell.slot.bucket === bucket);
      const state: ElementState = failed
        ? 'error'
        : live && meta.bucket === bucket
          ? ((meta.bucketState ?? 'active') as ElementState)
          : 'default';
      drawables.push({
        kind: 'text',
        id: `${prefix}index-${bucket}`,
        x: left + indexColumn - sizes.labelGap,
        y: y + sizes.nodeHeight / 2,
        text: String(bucket),
        font: 'index',
        tone: 'muted',
        align: 'right',
      });
      drawables.push(
        probing
          ? {
              kind: 'box',
              id: `${prefix}bucket-${bucket}`,
              x: left + indexColumn,
              y,
              width: sizes.entryWidth,
              height: sizes.nodeHeight,
              state,
              value: '',
            }
          : {
              kind: 'box',
              id: `${prefix}bucket-${bucket}`,
              x: left + indexColumn,
              y: y + (sizes.nodeHeight - sizes.bucketHeight) / 2,
              width: sizes.bucketWidth,
              height: sizes.bucketHeight,
              state,
              value: here.length > 0 ? OCCUPIED : '',
            },
      );
    }

    for (const cell of column) {
      const { bucket, chainIndex } = cell.slot;
      const x = probing ? left + indexColumn : nodeX(left, chainIndex);
      const y = rowY(bucket);
      drawables.push({
        kind: 'box',
        id: cell.id,
        x,
        y,
        width: sizes.entryWidth,
        height: sizes.nodeHeight,
        state: cell.state,
        value: cell.value,
        ...(cell.detail ? { detail: cell.detail } : {}),
      });
      if (probing) continue;
      // The arrow into this node: from its bucket, or from the node before it in the chain.
      const fromX =
        chainIndex === 0
          ? left + indexColumn + sizes.bucketWidth
          : nodeX(left, chainIndex - 1) + sizes.entryWidth;
      const centre = y + sizes.nodeHeight / 2;
      drawables.push({
        kind: 'line',
        id: `link-${cell.id}`,
        x1: fromX,
        y1: centre,
        x2: x,
        y2: centre,
        tone: 'edge',
        arrow: true,
      });
    }
  };

  if (resizing) drawTable(0, oldSize, inOld, 'old-', false);
  drawTable(newLeft, size, inNew, '', true);

  // Linear probing: an arrow beside the slots, from the bucket just tried to the next one.
  if (probing && meta.probeFrom !== undefined && meta.probeTo !== undefined) {
    const x = newLeft + indexColumn + sizes.entryWidth + sizes.linkGap / 2;
    const centre = (bucket: number) => rowY(bucket) + sizes.nodeHeight / 2;
    drawables.push({
      kind: 'line',
      id: PROBE_ID,
      x1: x,
      y1: centre(Number(meta.probeFrom)),
      x2: x,
      y2: centre(Number(meta.probeTo)),
      tone: 'signal',
      arrow: true,
    });
  }

  const rows = Math.max(size, oldSize);
  let bottom = rowY(rows) - sizes.gap;
  if (resizing) {
    const y = bottom + sizes.labelGap + sizes.fontLabel / 2;
    const title = (id: string, x: number, text: string): Drawable => ({
      kind: 'text',
      id,
      x,
      y,
      text,
      font: 'label',
      tone: 'muted',
      align: 'left',
    });
    drawables.push(title('old-title', 0, 'old table'), title('new-title', newLeft, 'new table'));
    bottom += sizes.labelGap + sizes.fontLabel;
  }

  const callout = scene.elements.find((e) => e.kind === 'callout');
  const calloutWidth = callout
    ? callout.text.length * sizes.fontCallout * sizes.monoAdvance + 2 * sizes.calloutPadX
    : 0;
  if (callout) {
    drawables.push({
      kind: 'callout',
      id: callout.id,
      x: 0,
      y: calloutHeight / 2,
      text: callout.text,
    });
  }

  return {
    drawables,
    width: Math.max(newLeft + columnWidth(inNew), calloutWidth),
    height: bottom,
  };
}
