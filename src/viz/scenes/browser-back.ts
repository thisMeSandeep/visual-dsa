/**
 * The browser back button as a stack (ALGORITHM-CATALOG L5, "Example 1"). Opening a page pushes
 * the one you leave onto the back stack; Back pops the top page and shows it again.
 *
 *   Browser            Back stack
 *   ┌──────────────┐   │ [ sport ] │
 *   │ ‹ Back       │   │ [ news  ] │
 *   ├──────────────┤   │ [ home  ] │
 *   │ [ scores   ] │   ╰───────────╯
 *   └──────────────┘
 *
 * Pages keep their id, so the canvas slides a page between the window and the stack.
 */
import type { ElementState } from '@/engine/core/types';
import type { VizSizes } from '@/theme';

import type { Drawable } from '../canvas/types';
import { containerPath } from '../renderers/stack/layout';
import type { AnalogyScene, SceneLayout } from './types';

type BrowserState = {
  /** The page in the window. */
  showing: string;
  /** Pages you can go back to, oldest first. */
  back: readonly string[];
  /** How the shown page is drawn: 'new' when just opened, 'active' when Back brought it back. */
  arrived?: ElementState;
  /** This step is a press of Back. */
  pressedBack?: boolean;
};

const STATES: readonly BrowserState[] = [
  { showing: 'home', back: [] },
  { showing: 'news', back: ['home'], arrived: 'new' },
  { showing: 'sport', back: ['home', 'news'], arrived: 'new' },
  { showing: 'scores', back: ['home', 'news', 'sport'], arrived: 'new' },
  { showing: 'sport', back: ['home', 'news'], arrived: 'active', pressedBack: true },
  { showing: 'news', back: ['home'], arrived: 'active', pressedBack: true },
];

/** The back stack is drawn tall enough for the longest history, so the scene never resizes. */
const CAPACITY = Math.max(...STATES.map((state) => state.back.length));

const pageId = (page: string) => `page-${page}`;

function layout(step: number, sizes: VizSizes): SceneLayout {
  const state = STATES[Math.min(Math.max(step, 0), STATES.length - 1)]!;
  const itemWidth = sizes.stackItemWidth;
  const itemHeight = sizes.nodeHeight;
  const pad = sizes.stackPadding;
  const stroke = sizes.borderWidthActive;

  // Column labels on top, then the window (left) and the back stack (right), top-aligned.
  const labelY = sizes.fontLabel / 2;
  const top = sizes.fontLabel + 2 * sizes.labelGap + stroke / 2;

  const windowLeft = stroke / 2;
  const windowWidth = itemWidth + 2 * pad;
  const toolbarBottom = top + itemHeight;
  const windowBottom = toolbarBottom + itemHeight + 2 * pad;

  const stackLeft = windowLeft + windowWidth + sizes.sceneGap;
  const stackRight = stackLeft + windowWidth;
  const stackBottom = top + CAPACITY * itemHeight + (CAPACITY - 1) * sizes.gap + pad;
  /** Top edge of back-stack slot `index` (0 = bottom). */
  const slotY = (index: number) => stackBottom - pad - (index + 1) * itemHeight - index * sizes.gap;

  const page = (name: string, x: number, y: number, state: ElementState): Drawable => ({
    kind: 'box',
    id: pageId(name),
    x,
    y,
    width: itemWidth,
    height: itemHeight,
    state,
    value: name,
  });

  const drawables: Drawable[] = [
    {
      kind: 'text',
      id: 'label-browser',
      x: windowLeft,
      y: labelY,
      text: 'Browser',
      font: 'label',
      tone: 'muted',
      align: 'left',
    },
    {
      kind: 'text',
      id: 'label-back',
      x: stackLeft,
      y: labelY,
      text: 'Back stack',
      font: 'label',
      tone: 'muted',
      align: 'left',
    },
    {
      kind: 'path',
      id: 'window',
      // A window frame with a toolbar across the top.
      path:
        `M ${windowLeft} ${top} H ${windowLeft + windowWidth} V ${windowBottom} H ${windowLeft} Z ` +
        `M ${windowLeft} ${toolbarBottom} H ${windowLeft + windowWidth}`,
      tone: 'line-strong',
      strokeWidth: 'normal',
    },
    {
      kind: 'text',
      id: 'back-button',
      x: windowLeft + pad,
      y: (top + toolbarBottom) / 2,
      text: '‹ Back',
      font: 'label',
      tone: state.pressedBack ? 'signal-ink' : 'muted',
      align: 'left',
    },
    {
      kind: 'path',
      id: 'back-stack',
      path: containerPath(
        { left: stackLeft, top, right: stackRight, bottom: stackBottom },
        sizes.stackRadius,
      ),
      tone: 'line-strong',
      strokeWidth: 'active',
    },
    page(state.showing, windowLeft + pad, toolbarBottom + pad, state.arrived ?? 'default'),
    ...state.back.map((name, index) => page(name, stackLeft + pad, slotY(index), 'default')),
  ];

  return {
    drawables,
    width: stackRight + stroke / 2,
    height: Math.max(windowBottom, stackBottom) + stroke / 2,
  };
}

export const browserBack: AnalogyScene = { stepCount: STATES.length, layout };
