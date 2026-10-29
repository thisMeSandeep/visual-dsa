import { config } from '@/config';

import type { Step } from '../core/types';
import { createStack, traceStack, type StackModel } from '../structures/stack';
import { applyOperation, canUndo, loadPreset, reset, startSession, undo } from './session';

/** A resting step that records which model it shows, so tests can check it. */
const rest = (model: StackModel) =>
  ({ a11y: model.items.map((item) => item.value).join(',') }) as Step;
const values = (model: StackModel) => model.items.map((item) => item.value);

const start = createStack(['1'], 3);
type Session = ReturnType<typeof startSession<StackModel>>;
const push = (session: Session, value: string) =>
  applyOperation(session, traceStack(session.model, { type: 'push', value }));
const pop = (session: Session) =>
  applyOperation(session, traceStack(session.model, { type: 'pop' }));

describe('sandbox session', () => {
  it('starts at rest with nothing to undo', () => {
    const session = startSession(start, rest);
    expect(session.steps).toEqual([rest(start)]);
    expect(canUndo(session)).toBe(false);
  });

  it('plays each operation and continues from its result', () => {
    const session = push(push(startSession(start, rest), '2'), '3');
    expect(values(session.model)).toEqual(['1', '2', '3']);
    expect(session.steps.at(-1)?.codeLine).toBe('push');
    expect(session.history.map(values)).toEqual([['1'], ['1', '2']]);
  });

  it('remembers only changes: a peek or a failed push leaves nothing to undo', () => {
    const full = startSession(createStack(['1'], 1), rest);
    const peeked = applyOperation(full, traceStack(full.model, { type: 'peek' }));
    const overflowed = push(peeked, '2');
    expect(overflowed.steps.at(-1)?.codeLine).toBe('overflow');
    expect(canUndo(overflowed)).toBe(false);
  });

  it('undoes one change at a time, showing the structure at rest', () => {
    const session = push(push(startSession(start, rest), '2'), '3');
    const once = undo(session, rest);
    expect(values(once.model)).toEqual(['1', '2']);
    expect(once.steps).toEqual([rest(once.model)]);
    expect(values(undo(undo(once, rest), rest).model)).toEqual(['1']);
  });

  it('keeps a limited history', () => {
    let session = startSession(createStack([], 1), rest);
    for (let i = 0; i < config.sandbox.historyDepth + 5; i++) {
      const operation = session.model.items.length === 0 ? push : pop;
      session = operation(session, '1');
    }
    expect(session.history).toHaveLength(config.sandbox.historyDepth);
  });

  it('resets to the start, and the reset can be undone', () => {
    const session = push(startSession(start, rest), '2');
    const fresh = reset(session, rest);
    expect(fresh.model).toBe(start);
    expect(values(undo(fresh, rest).model)).toEqual(['1', '2']);
    expect(reset(fresh, rest).history).toBe(fresh.history);
  });

  it('loads a preset, which becomes what Reset returns to', () => {
    const preset = createStack(['7', '8', '9'], 3);
    const session = loadPreset(push(startSession(start, rest), '2'), preset, rest);
    expect(session.model).toBe(preset);
    expect(session.steps).toEqual([rest(preset)]);
    expect(reset(push(session, '4'), rest).model).toBe(preset);
    expect(values(undo(session, rest).model)).toEqual(['1', '2']);
  });
});
