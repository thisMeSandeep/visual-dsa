/**
 * Topic line drawings on a 160 × 100 grid: small, precise pictures of each structure for Home's
 * topic cards. Drawn in hairline strokes; `ink` for the structure, `muted` for labels, and one
 * `accent` (the topic's category colour) for the part that tells the topic's story.
 *
 * Coordinates are drawing data, like glyph paths, so this file is exempt from the
 * magic-number lint rule. Keyed by topic id: each topic has its own picture.
 */
import type { ReactElement } from 'react';
import { Circle, G, Path, Rect, Text } from 'react-native-svg';

export const ART_VIEWBOX = '0 0 160 100';

export type ArtPalette = {
  ink: string;
  muted: string;
  accent: string;
  /** Fill inside cells and nodes, so they read as objects on the art panel. */
  cell: string;
  font: string;
  fontSize: number;
};

type Drawing = (p: ArtPalette) => ReactElement;

/** Mono label text. */
const label = (p: ArtPalette, x: number, y: number, text: string, color = p.muted) => (
  <Text
    x={x}
    y={y}
    fill={color}
    stroke="none"
    fontFamily={p.font}
    fontSize={p.fontSize}
    textAnchor="middle"
  >
    {text}
  </Text>
);

/** A small open arrowhead pointing in the direction from (fromX, fromY) to (x, y). */
const head = (x: number, y: number, fromX: number, fromY: number) => {
  const angle = Math.atan2(y - fromY, x - fromX);
  const size = 4;
  const spread = 0.5;
  const a = { x: x - size * Math.cos(angle - spread), y: y - size * Math.sin(angle - spread) };
  const b = { x: x - size * Math.cos(angle + spread), y: y - size * Math.sin(angle + spread) };
  return `M ${a.x} ${a.y} L ${x} ${y} L ${b.x} ${b.y}`;
};

/* Big O: three growth curves on a pair of axes. --------------------------------------------- */
const bigO: Drawing = (p) => (
  <G>
    <Path d="M 22 14 V 84 H 144" stroke={p.ink} />
    <Path d={head(22, 12, 22, 20)} stroke={p.ink} />
    <Path d={head(146, 84, 138, 84)} stroke={p.ink} />
    <Path d="M 24 74 H 136" stroke={p.muted} />
    <Path d="M 24 80 L 134 38" stroke={p.ink} />
    <Path d="M 24 82 Q 96 80 118 16" stroke={p.accent} />
    {label(p, 144, 76, '1')}
    {label(p, 142, 38, 'n')}
    {label(p, 126, 18, 'n²', p.accent)}
  </G>
);

/* Array: indexed cells, with a jump straight to index 3. ------------------------------------- */
const ARRAY_X = [19, 44, 69, 94, 119];
const array: Drawing = (p) => (
  <G>
    {ARRAY_X.map((x, i) => (
      <G key={x}>
        <Rect
          x={x}
          y={42}
          width={22}
          height={22}
          rx={3}
          fill={p.cell}
          stroke={i === 3 ? p.accent : p.ink}
        />
        {label(p, x + 11, 56, ['7', '3', '9', '1', '5'][i] ?? '', i === 3 ? p.accent : p.ink)}
        {label(p, x + 11, 78, String(i), i === 3 ? p.accent : p.muted)}
      </G>
    ))}
    <Path d="M 30 38 Q 67 4 104 37" stroke={p.accent} strokeDasharray="3 3" />
    <Path d={head(105, 39, 100, 31)} stroke={p.accent} />
    {label(p, 67, 94, 'index')}
  </G>
);

/* Linked list: nodes stepping down the page, each pointing to the next. ---------------------- */
const LIST_NODES = [
  { x: 14, y: 16 },
  { x: 62, y: 40 },
  { x: 110, y: 64 },
];
const linkedList: Drawing = (p) => (
  <G>
    {LIST_NODES.map(({ x, y }, i) => {
      const next = LIST_NODES[i + 1];
      const stroke = i === 0 ? p.accent : p.ink;
      return (
        <G key={x}>
          <Rect x={x} y={y} width={36} height={20} rx={3} fill={p.cell} stroke={stroke} />
          <Path d={`M ${x + 25} ${y} V ${y + 20}`} stroke={stroke} />
          {next ? (
            <G>
              <Circle cx={x + 30.5} cy={y + 10} r={1.4} fill={p.ink} stroke="none" />
              <Path
                d={`M ${x + 30.5} ${y + 10} H ${x + 36} Q ${x + 40} ${y + 10} ${x + 40} ${y + 14} V ${next.y + 6} Q ${x + 40} ${next.y + 10} ${x + 44} ${next.y + 10} H ${next.x - 1}`}
                stroke={p.ink}
              />
              <Path d={head(next.x - 1, next.y + 10, next.x - 6, next.y + 10)} stroke={p.ink} />
            </G>
          ) : (
            <Path d={`M ${x + 27} ${y + 16} L ${x + 34} ${y + 4}`} stroke={p.muted} />
          )}
        </G>
      );
    })}
    {label(p, 32, 48, 'head', p.accent)}
  </G>
);

/* Doubly linked list: three nodes with links both ways. ------------------------------------- */
const DOUBLY_X = [8, 62, 116];
const doublyLinkedList: Drawing = (p) => (
  <G>
    {DOUBLY_X.map((x, i) => {
      const stroke = i === 1 ? p.accent : p.ink;
      const next = DOUBLY_X[i + 1];
      return (
        <G key={x}>
          <Rect x={x} y={40} width={36} height={20} rx={3} fill={p.cell} stroke={stroke} />
          <Path d={`M ${x + 8} 40 V 60 M ${x + 28} 40 V 60`} stroke={stroke} />
          {next === undefined ? null : (
            <G>
              <Path d={`M ${x + 32} 46 H ${next - 1}`} stroke={p.ink} />
              <Path d={head(next - 1, 46, next - 6, 46)} stroke={p.ink} />
              <Path d={`M ${next + 4} 54 H ${x + 37}`} stroke={p.ink} />
              <Path d={head(x + 37, 54, x + 42, 54)} stroke={p.ink} />
            </G>
          )}
        </G>
      );
    })}
    {label(p, 80, 30, 'prev  next', p.accent)}
    {label(p, 80, 80, 'both ways')}
  </G>
);

/* Stack: items in a container, one more being pushed onto the top. --------------------------- */
const STACK_Y = [68, 53, 38];
const stack: Drawing = (p) => (
  <G>
    <Path d="M 56 30 V 80 Q 56 86 62 86 H 98 Q 104 86 104 80 V 30" stroke={p.ink} />
    {STACK_Y.map((y) => (
      <Rect key={y} x={61} y={y} width={38} height={13} rx={2.5} fill={p.cell} stroke={p.ink} />
    ))}
    <Rect x={61} y={10} width={38} height={13} rx={2.5} fill={p.cell} stroke={p.accent} />
    <Path d="M 116 12 V 32" stroke={p.accent} />
    <Path d={head(116, 34, 116, 28)} stroke={p.accent} />
    <Path d="M 124 34 V 14" stroke={p.muted} />
    <Path d={head(124, 12, 124, 18)} stroke={p.muted} />
    {label(p, 30, 58, 'LIFO')}
    {label(p, 120, 46, 'top')}
  </G>
);

/* Queue: items in a tube; the front one leaves on the left, a new one joins on the right. ----- */
const QUEUE_X = [44, 66, 88];
const queue: Drawing = (p) => (
  <G>
    <Path d="M 38 38 H 116 M 38 62 H 116" stroke={p.ink} />
    {QUEUE_X.map((x) => (
      <Rect key={x} x={x} y={41} width={18} height={18} rx={3} fill={p.cell} stroke={p.ink} />
    ))}
    <Rect x={10} y={41} width={18} height={18} rx={3} fill={p.cell} stroke={p.accent} />
    <Path d="M 36 30 H 12" stroke={p.accent} />
    <Path d={head(10, 30, 16, 30)} stroke={p.accent} />
    <Rect
      x={128}
      y={41}
      width={18}
      height={18}
      rx={3}
      fill={p.cell}
      stroke={p.muted}
      strokeDasharray="2.5 2.5"
    />
    <Path d="M 146 30 H 122" stroke={p.muted} />
    <Path d={head(120, 30, 126, 30)} stroke={p.muted} />
    {label(p, 19, 76, 'front', p.accent)}
    {label(p, 137, 76, 'rear')}
    {label(p, 77, 88, 'FIFO')}
  </G>
);

/* Hash table: a bucket column with chained entries and one collision. ------------------------- */
const BUCKET_Y = [16, 34, 52, 70];
const hashTable: Drawing = (p) => (
  <G>
    {BUCKET_Y.map((y, i) => (
      <G key={y}>
        {label(p, 22, y + 10, String(i))}
        <Rect x={30} y={y} width={18} height={14} rx={2.5} fill={p.cell} stroke={p.ink} />
      </G>
    ))}
    <Path d="M 48 41 H 63" stroke={p.ink} />
    <Path d={head(65, 41, 59, 41)} stroke={p.ink} />
    <Rect x={66} y={34} width={30} height={14} rx={2.5} fill={p.cell} stroke={p.ink} />
    {label(p, 81, 44, 'Sam', p.ink)}
    <Path d="M 96 41 H 109" stroke={p.accent} />
    <Path d={head(111, 41, 105, 41)} stroke={p.accent} />
    <Rect x={112} y={34} width={30} height={14} rx={2.5} fill={p.cell} stroke={p.accent} />
    {label(p, 127, 44, 'Sid', p.accent)}
    <Path d="M 48 77 H 63" stroke={p.ink} />
    <Path d={head(65, 77, 59, 77)} stroke={p.ink} />
    <Rect x={66} y={70} width={30} height={14} rx={2.5} fill={p.cell} stroke={p.ink} />
    {label(p, 81, 80, 'Ana', p.ink)}
    {label(p, 127, 22, 'collision', p.accent)}
  </G>
);

/* Binary search: a sorted row, the left half faded away, mid checking the middle of the rest. */
const SEARCH_X = [12, 32, 52, 72, 92, 112, 132];
const SEARCH_VALUES = ['3', '8', '12', '17', '23', '31', '42'];
const binarySearch: Drawing = (p) => (
  <G>
    {SEARCH_X.map((x, i) => {
      const ruledOut = i < 4;
      const stroke = ruledOut ? p.muted : i === 5 ? p.accent : p.ink;
      return (
        <G key={x}>
          <Rect
            x={x}
            y={40}
            width={16}
            height={18}
            rx={3}
            fill={p.cell}
            stroke={stroke}
            strokeDasharray={ruledOut ? '2.5 2.5' : undefined}
          />
          {label(p, x + 8, 52, SEARCH_VALUES[i] ?? '', stroke)}
        </G>
      );
    })}
    <Path d="M 120 18 V 34" stroke={p.accent} />
    <Path d={head(120, 36, 120, 30)} stroke={p.accent} />
    {label(p, 120, 14, 'mid', p.accent)}
    <Path d="M 100 76 V 64" stroke={p.ink} />
    <Path d={head(100, 62, 100, 68)} stroke={p.ink} />
    <Path d="M 140 76 V 64" stroke={p.ink} />
    <Path d={head(140, 62, 140, 68)} stroke={p.ink} />
    {label(p, 100, 86, 'low')}
    {label(p, 140, 86, 'high')}
    {label(p, 46, 86, 'ruled out')}
  </G>
);

/* Sorts: a row of cells with three values and a story told by the accent. ------------------- */
const SORT_X = [15, 37, 59, 81, 103, 125];
const sortCell = (p: ArtPalette, x: number, value: string, stroke: string, y = 42) => (
  <G key={`${x}-${y}`}>
    <Rect x={x} y={y} width={18} height={18} rx={3} fill={p.cell} stroke={stroke} />
    {label(p, x + 9, y + 12, value, stroke)}
  </G>
);

/* Bubble sort: two neighbours trading places along arcs; the biggest already at the end. */
const BUBBLE_VALUES = ['2', '5', '6', '3', '1', '8'];
const bubbleSort: Drawing = (p) => (
  <G>
    {SORT_X.map((x, i) =>
      sortCell(p, x, BUBBLE_VALUES[i] ?? '', i === 2 || i === 3 ? p.accent : p.ink),
    )}
    <Path d="M 68 38 Q 79 24 90 38" stroke={p.accent} />
    <Path d={head(90, 38, 87, 32)} stroke={p.accent} />
    <Path d="M 90 64 Q 79 78 68 64" stroke={p.accent} />
    <Path d={head(68, 64, 71, 70)} stroke={p.accent} />
    {label(p, 79, 90, 'swap', p.accent)}
    {label(p, 134, 76, 'in place')}
  </G>
);

/* Selection sort: the smallest jumps straight to the front of the unsorted part. */
const SELECTION_VALUES = ['1', '3', '9', '7', '4', '8'];
const selectionSort: Drawing = (p) => (
  <G>
    {SORT_X.map((x, i) =>
      sortCell(p, x, SELECTION_VALUES[i] ?? '', i === 2 || i === 4 ? p.accent : p.ink),
    )}
    <Path d="M 112 38 Q 90 12 68 38" stroke={p.accent} />
    <Path d={head(68, 38, 71, 32)} stroke={p.accent} />
    {label(p, 112, 76, 'min', p.accent)}
    <Path d="M 15 68 H 55" stroke={p.muted} />
    {label(p, 35, 80, 'sorted')}
  </G>
);

/* Insertion sort: the key lifted out above a gap that bigger items shift right into. */
const INSERTION_VALUES = ['2', '4', '', '7', '9', '3'];
const insertionSort: Drawing = (p) => (
  <G>
    {SORT_X.map((x, i) =>
      i === 2 ? (
        <Rect
          key={x}
          x={x}
          y={52}
          width={18}
          height={18}
          rx={3}
          fill="none"
          stroke={p.muted}
          strokeDasharray="2.5 2.5"
        />
      ) : (
        sortCell(p, x, INSERTION_VALUES[i] ?? '', p.ink, 52)
      ),
    )}
    {sortCell(p, 59, '5', p.accent, 12)}
    <Path d="M 68 34 V 46" stroke={p.accent} />
    <Path d={head(68, 48, 68, 42)} stroke={p.accent} />
    {label(p, 92, 24, 'key', p.accent)}
    <Path d="M 82 80 H 100" stroke={p.muted} />
    <Path d={head(102, 80, 96, 80)} stroke={p.muted} />
    {label(p, 92, 92, 'shift')}
  </G>
);

export const DRAWINGS: Readonly<Record<string, Drawing>> = {
  'big-o': bigO,
  array,
  'singly-linked-list': linkedList,
  'doubly-linked-list': doublyLinkedList,
  stack,
  queue,
  'hash-table': hashTable,
  'binary-search': binarySearch,
  'bubble-sort': bubbleSort,
  'selection-sort': selectionSort,
  'insertion-sort': insertionSort,
};
