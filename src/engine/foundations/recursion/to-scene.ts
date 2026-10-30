import type { ElementState, Scene, SceneElement } from '../../core/types';
import { callLabel, type Call, type CallStatus, type RecursionModel } from './model';

export const frameId = (callId: string) => `frame-${callId}`;
export const nodeId = (callId: string) => `call-${callId}`;

const FRAME_STATE: Record<CallStatus, ElementState> = {
  running: 'active',
  waiting: 'default',
  returning: 'found',
  done: 'visited',
  memo: 'found',
};

/** In the tree, a node shows its result once it has one: f(3) over "= 2". */
const treeLabel = (call: Call) => `f(${call.n})`;

/**
 * Recursion → a call-stack scene: one frame per call on the stack (bottom first) and, for
 * Fibonacci, every call made so far as a node in the call tree, with an edge from each call to
 * the call that made it. Meta carries the room to keep and the stats.
 */
export function recursionToScene(model: RecursionModel): Scene {
  const byId = new Map(model.calls.map((call) => [call.id, call]));
  const frames: SceneElement[] = model.stack.flatMap((id, depth): SceneElement[] => {
    const call = byId.get(id);
    if (!call) return [];
    return [
      {
        kind: 'cell',
        id: frameId(id),
        value: callLabel(call.fn, call.n),
        detail: call.note,
        state: model.overflow ? 'error' : FRAME_STATE[call.status],
        slot: { type: 'frame', depth },
      },
    ];
  });

  const tree: SceneElement[] = model.tree
    ? model.calls.flatMap((call): SceneElement[] => [
        {
          kind: 'cell',
          id: nodeId(call.id),
          value: treeLabel(call),
          ...(call.result === undefined || call.status === 'running' || call.status === 'waiting'
            ? {}
            : { detail: `= ${call.result}` }),
          state: FRAME_STATE[call.status],
          slot: { type: 'tree', column: call.column, depth: call.depth },
        },
        ...(call.parent === undefined
          ? []
          : [
              {
                kind: 'edge' as const,
                id: `edge-${call.id}`,
                from: nodeId(call.parent),
                to: nodeId(call.id),
                directed: false,
                state: 'default' as const,
              },
            ]),
      ])
    : [];

  const memo = model.memo
    ? Object.entries(model.memo)
        .map(([n, value]) => `f(${n})=${value}`)
        .join(' ')
    : undefined;
  return {
    renderer: 'call-stack',
    elements: [...frames, ...tree],
    meta: {
      n: model.n,
      reserve: model.reserve,
      depth: model.stack.length,
      calls: model.calls.length,
      ...(model.tree ? { columns: model.columns, levels: model.levels } : {}),
      ...(memo === undefined ? {} : { memo: memo === '' ? '–' : memo }),
      ...(model.overflow ? { container: 'error' } : {}),
    },
  };
}
