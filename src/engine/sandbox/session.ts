/**
 * A sandbox session (ARCHITECTURE §6.4): the structure as it is now, the models before each
 * change (for Undo), the starting model (for Reset), and the steps on screen. Pure data and
 * functions; the sandbox screen keeps the session in state.
 */
import { config } from '@/config';

import type { Step, Trace } from '../core/types';

export type SandboxSession<Model> = Readonly<{
  model: Model;
  /** Models before each change, oldest first. Capped at config.sandbox.historyDepth. */
  history: readonly Model[];
  /** Where Reset goes back to: the preset loaded last. */
  initial: Model;
  /** What the canvas plays: the last operation's trace, or one step of the structure at rest. */
  steps: readonly Step[];
}>;

/** Builds the step that shows a model at rest, with a caption saying what just happened. */
export type RestStep<Model> = (model: Model) => Step;

const remember = <Model>(history: readonly Model[], model: Model): readonly Model[] =>
  [...history, model].slice(-config.sandbox.historyDepth);

export function startSession<Model>(model: Model, rest: RestStep<Model>): SandboxSession<Model> {
  return { model, history: [], initial: model, steps: [rest(model)] };
}

/**
 * Shows an operation's trace and continues from its final model. Only a change is remembered for
 * Undo: a peek, or a push that overflowed, leaves nothing to undo.
 */
export function applyOperation<Model>(
  session: SandboxSession<Model>,
  result: { trace: Trace; model: Model },
): SandboxSession<Model> {
  const changed = result.model !== session.model;
  return {
    ...session,
    model: result.model,
    history: changed ? remember(session.history, session.model) : session.history,
    steps: result.trace.steps,
  };
}

export const canUndo = (session: SandboxSession<unknown>) => session.history.length > 0;

/** Back to the model before the last change. */
export function undo<Model>(
  session: SandboxSession<Model>,
  rest: RestStep<Model>,
): SandboxSession<Model> {
  const previous = session.history.at(-1);
  if (previous === undefined) return session;
  return {
    ...session,
    model: previous,
    history: session.history.slice(0, -1),
    steps: [rest(previous)],
  };
}

/** Back to the starting model. Undo can take the learner back again. */
export function reset<Model>(
  session: SandboxSession<Model>,
  rest: RestStep<Model>,
): SandboxSession<Model> {
  return loadModel(session, session.initial, rest);
}

/** Switches to a preset, which becomes what Reset goes back to. Undo returns to before it. */
export function loadPreset<Model>(
  session: SandboxSession<Model>,
  preset: Model,
  rest: RestStep<Model>,
): SandboxSession<Model> {
  return { ...loadModel(session, preset, rest), initial: preset };
}

function loadModel<Model>(
  session: SandboxSession<Model>,
  model: Model,
  rest: RestStep<Model>,
): SandboxSession<Model> {
  return {
    ...session,
    model,
    history: model === session.model ? session.history : remember(session.history, session.model),
    steps: [rest(model)],
  };
}
