/**
 * Queue operations with tracing (ALGORITHM-CATALOG L6). Code line ids must match the `@line`
 * markers in the queue's code samples (ARCHITECTURE §5.3).
 *
 * Code line ids used: check-full, overflow, enqueue (enqueue); check-empty, underflow,
 * read-front, dequeue (dequeue); front-empty, front (front); clear (clear).
 * Caption keys: queue.enqueue.check, queue.enqueued, queue.enqueued.wrap, queue.full,
 * queue.full.wasted, queue.dequeue.check, queue.dequeue.read, queue.dequeued, queue.underflow,
 * queue.front, queue.empty, queue.clear.start, queue.cleared, queue.already-empty.
 */
import { runTrace, type Tracer } from '../../core/tracer';
import type { Trace } from '../../core/types';
import { describeQueue } from './describe';
import {
  capacity,
  emptied,
  isEmpty,
  isFull,
  itemId,
  tailSlot,
  wastedSlots,
  withDequeued,
  withEnqueued,
  type QueueModel,
} from './model';
import { queueToScene, type QueueAnnotations } from './to-scene';

export type QueueTracer = Tracer<QueueModel, QueueAnnotations>;

/** Adds `value` at the rear, or fails when there's no slot for it. */
export function enqueue(t: QueueTracer, value: string): void {
  t.count('comparisons');
  t.step({
    line: 'check-full',
    caption: { key: 'queue.enqueue.check', params: { value } },
    vars: { size: t.model.size, capacity: capacity(t.model) },
  });

  if (isFull(t.model)) {
    // A plain array can be "full" with free slots at the start: say so.
    const free = wastedSlots(t.model);
    t.fail(
      'queue.overflow',
      free > 0 && t.model.size < capacity(t.model)
        ? { key: 'queue.full.wasted', params: { value, free } }
        : { key: 'queue.full', params: { value, capacity: capacity(t.model) } },
      { line: 'overflow', annotations: { rejected: value, container: 'error' } },
    );
    return;
  }

  const slot = tailSlot(t.model);
  // The moment the rear goes past the last slot and lands back on slot 0.
  const wrapped = t.model.mode === 'circular' && t.model.size > 0 && slot === 0;
  const id = itemId(t.model.nextId);
  t.update((queue) => withEnqueued(queue, value));
  t.count('writes');
  t.step({
    line: 'enqueue',
    caption: { key: wrapped ? 'queue.enqueued.wrap' : 'queue.enqueued', params: { value, slot } },
    vars: { size: t.model.size, tail: slot },
    annotations: { highlight: { id, state: 'new' } },
  });
}

/** Removes and returns the front value, or fails when the queue is empty. */
export function dequeue(t: QueueTracer): string | undefined {
  t.count('comparisons');
  t.step({
    line: 'check-empty',
    caption: { key: 'queue.dequeue.check' },
    vars: { size: t.model.size },
  });

  const item = isEmpty(t.model) ? null : t.model.slots[t.model.head];
  if (!item) {
    t.fail(
      'queue.underflow',
      { key: 'queue.underflow' },
      { line: 'underflow', annotations: { container: 'error' } },
    );
    return undefined;
  }

  t.count('reads');
  t.step({
    line: 'read-front',
    caption: { key: 'queue.dequeue.read', params: { value: item.value } },
    vars: { head: t.model.head, front: item.value },
    annotations: { highlight: { id: item.id, state: 'active' } },
  });

  t.update(withDequeued);
  t.count('writes');
  t.step({
    line: 'dequeue',
    caption: { key: 'queue.dequeued', params: { value: item.value } },
    vars: { head: t.model.head, returned: item.value },
  });
  return item.value;
}

/** Returns the front value without removing it, or fails when the queue is empty. */
export function front(t: QueueTracer): string | undefined {
  t.count('comparisons');
  const item = isEmpty(t.model) ? null : t.model.slots[t.model.head];
  if (!item) {
    t.fail(
      'queue.empty',
      { key: 'queue.empty' },
      { line: 'front-empty', annotations: { container: 'error' } },
    );
    return undefined;
  }
  t.count('reads');
  t.step({
    line: 'front',
    caption: { key: 'queue.front', params: { value: item.value } },
    vars: { front: item.value },
    annotations: { highlight: { id: item.id, state: 'active' } },
  });
  return item.value;
}

/** Removes every item. */
export function clear(t: QueueTracer): void {
  if (isEmpty(t.model)) {
    t.step({ line: 'clear', caption: { key: 'queue.already-empty' } });
    return;
  }
  t.step({
    line: 'clear',
    caption: { key: 'queue.clear.start', params: { count: t.model.size } },
    annotations: { allItems: 'dimmed' },
  });
  t.update(emptied);
  t.count('writes');
  t.step({ line: 'clear', caption: { key: 'queue.cleared' } });
}

export type QueueOperation =
  { type: 'enqueue'; value: string } | { type: 'dequeue' } | { type: 'front' } | { type: 'clear' };

/** Runs one operation on `model`: the trace to play, and the queue to continue from. */
export function traceQueue(
  model: QueueModel,
  operation: QueueOperation,
): { trace: Trace<string | undefined>; model: QueueModel } {
  return runTrace(
    { operation: `queue.${operation.type}`, model, toScene: queueToScene, describe: describeQueue },
    (t): string | undefined => {
      switch (operation.type) {
        case 'enqueue':
          enqueue(t, operation.value);
          return undefined;
        case 'dequeue':
          return dequeue(t);
        case 'front':
          return front(t);
        case 'clear':
          clear(t);
          return undefined;
      }
    },
  );
}
