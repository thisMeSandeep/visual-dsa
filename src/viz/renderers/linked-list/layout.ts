/**
 * Linked-list scene → drawables (VISUAL-SPEC §7). Pure, so it's unit-tested.
 *
 *               [21]                  ← raised: a node being linked in (or out)
 *              ↗    ↘
 *   [12] ──→ [ 7] ──────→ [30] ──→ null
 *    ↑         ↑
 *   head      cur                     ← pointer labels, stacked under their node
 *
 * A doubly linked list draws two arrows per link: next above the centre line, prev below.
 * Arrows are clipped to the boxes, so a re-aimed pointer swings from one node to another.
 */
import type { ElementState, Scene, SceneElement } from '@/engine/core/types';
import { NULL_ID } from '@/engine/structures/linked-list';
import type { ColorToken, VizSizes } from '@/theme';

import type { Drawable } from '../../canvas/types';

export type ListLayout = { drawables: Drawable[]; width: number; height: number };

export const NULL_ARROW_ID = 'null-arrow';

/** Pointer labels stack under a node in this order; walking pointers not listed go last. */
const LABEL_ORDER = ['head', 'tail', 'prev', 'cur', 'next'];

const EDGE_TONES: Partial<Record<ElementState, ColorToken>> = {
  active: 'signal',
  new: 'primary',
  dimmed: 'line',
};

type Cell = Extract<SceneElement, { kind: 'cell' }>;
type Edge = Extract<SceneElement, { kind: 'edge' }>;
type Pointer = Extract<SceneElement, { kind: 'pointer' }>;
type Point = { x: number; y: number };

export function layoutList(scene: Scene, sizes: VizSizes): ListLayout {
  const meta = scene.meta ?? {};
  const w = sizes.cellWidth;
  const h = sizes.nodeHeight;
  const step = w + sizes.linkGap;
  const offset = meta.kind === 'doubly' ? sizes.linkOffset : 0;
  const errorState = meta.container === 'error';

  // Vertical: the raised lane, the row, then pointer labels under it.
  const rowTop = h + sizes.sceneGap;
  const rowCentre = rowTop + h / 2;
  const rowBottom = rowTop + h;

  const cells = scene.elements.filter((e): e is Cell => e.kind === 'cell');
  const placeOf = (cell: Cell) =>
    cell.slot.type === 'link' ? cell.slot : { index: 0, raised: false };
  const centreOf = (cell: Cell): Point => {
    const { index, raised } = placeOf(cell);
    return { x: index * step + w / 2, y: raised ? h / 2 : rowCentre };
  };

  const nodes: Drawable[] = cells.map((cell) => {
    const centre = centreOf(cell);
    return {
      kind: 'box',
      id: cell.id,
      x: centre.x - w / 2,
      y: centre.y - h / 2,
      width: w,
      height: h,
      state: cell.state,
      value: cell.value,
    };
  });

  // Arrows between nodes, from box edge to box edge.
  const byId = new Map(cells.map((cell) => [cell.id, cell]));
  const edges: Drawable[] = scene.elements
    .filter((e): e is Edge => e.kind === 'edge')
    .flatMap((edge): Drawable[] => {
      const from = byId.get(edge.from);
      const to = byId.get(edge.to);
      if (!from || !to) return [];
      const [start, end] = arrowBetween(centreOf(from), centreOf(to), w / 2, h / 2, offset);
      return [
        {
          kind: 'line',
          id: edge.id,
          x1: start.x,
          y1: start.y,
          x2: end.x,
          y2: end.y,
          tone: EDGE_TONES[edge.state] ?? 'edge',
          arrow: edge.directed,
        },
      ];
    });

  // `null` after the last node in the row, with an arrow from it when its next is null.
  const rowCells = cells.filter((cell) => !placeOf(cell).raised);
  const last = rowCells.reduce<Cell | undefined>(
    (best, cell) => (!best || placeOf(cell).index > placeOf(best).index ? cell : best),
    undefined,
  );
  const nullIndex = last ? placeOf(last).index + 1 : 0;
  const nullX = nullIndex * step;
  const nullText: Drawable = {
    kind: 'text',
    id: NULL_ID,
    x: nullX,
    y: rowCentre,
    text: 'null',
    font: 'label',
    tone: errorState ? 'danger' : 'muted',
    align: 'left',
  };
  const lastPointsNowhere =
    last &&
    !scene.elements.some(
      (e) => e.kind === 'edge' && e.from === last.id && e.id.startsWith('next-'),
    );
  const nullArrow: Drawable[] = lastPointsNowhere
    ? [
        {
          kind: 'line',
          id: NULL_ARROW_ID,
          x1: placeOf(last).index * step + w,
          y1: rowCentre - offset,
          x2: nullX - sizes.labelGap,
          y2: rowCentre - offset,
          tone: 'edge',
          arrow: true,
        },
      ]
    : [];

  // Pointer labels under their node (or under null), stacked in a fixed order.
  const pointers = scene.elements.filter((e): e is Pointer => e.kind === 'pointer');
  const rank = (label: string) => {
    const index = LABEL_ORDER.indexOf(label);
    return index === -1 ? LABEL_ORDER.length : index;
  };
  const stacks = new Map<string, Pointer[]>();
  for (const pointer of [...pointers].sort((a, b) => rank(a.label) - rank(b.label))) {
    stacks.set(pointer.target, [...(stacks.get(pointer.target) ?? []), pointer]);
  }
  const arrowTop = rowBottom + sizes.labelGap;
  const arrowBottom = arrowTop + sizes.pointerLength;
  const labelLine = sizes.fontLabel + sizes.labelGap;
  const labelY = (k: number) => arrowBottom + sizes.labelGap + sizes.fontLabel / 2 + k * labelLine;
  const labels: Drawable[] = [...stacks].flatMap(([target, stack]) => {
    const cell = byId.get(target);
    const x =
      target === NULL_ID
        ? nullX + sizes.pointerLabelWidth / 2
        : cell
          ? centreOf(cell).x
          : undefined;
    if (x === undefined) return [];
    return stack.flatMap((pointer, k): Drawable[] => [
      {
        kind: 'line',
        id: `${pointer.id}-arrow`,
        x1: x,
        y1: arrowBottom,
        x2: x,
        y2: arrowTop,
        tone: 'signal',
        arrow: true,
      },
      {
        kind: 'text',
        id: pointer.id,
        x,
        y: labelY(k),
        text: pointer.label,
        font: 'label',
        tone: 'signal-ink',
        align: 'center',
      },
    ]);
  });

  const tallestStack = Math.max(0, ...[...stacks.values()].map((stack) => stack.length));
  const maxIndex = Math.max(-1, ...cells.map((cell) => placeOf(cell).index));
  return {
    drawables: [...edges, ...nullArrow, nullText, ...nodes, ...labels],
    width: Math.max((maxIndex + 1) * step - sizes.linkGap, nullX + sizes.pointerLabelWidth),
    height: tallestStack === 0 ? rowBottom : arrowBottom + tallestStack * labelLine,
  };
}

/**
 * Start and end of an arrow from one box to another: on each box's edge, along the line between
 * their centres, shifted `offset` to the arrow's left (so next and prev arrows sit apart).
 */
function arrowBetween(
  from: Point,
  to: Point,
  halfWidth: number,
  halfHeight: number,
  offset: number,
): [Point, Point] {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  // How far along the centre line each box's edge is.
  const clip = Math.min(
    dx === 0 ? Infinity : halfWidth / Math.abs(dx),
    dy === 0 ? Infinity : halfHeight / Math.abs(dy),
  );
  const shift = { x: (dy / length) * offset, y: (-dx / length) * offset };
  return [
    { x: from.x + dx * clip + shift.x, y: from.y + dy * clip + shift.y },
    { x: to.x - dx * clip + shift.x, y: to.y - dy * clip + shift.y },
  ];
}
