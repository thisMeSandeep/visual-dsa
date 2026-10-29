import { useEffect, useRef, useState } from 'react';

export type Presence<T> = { item: T; exiting: boolean };

/**
 * Keeps items that just disappeared for `exitMs`, marked `exiting`, so they can fade out instead
 * of vanishing. An item that comes back before its exit finishes is simply present again.
 * Exiting items keep their last position in the list.
 */
export function usePresence<T extends { id: string }>(items: readonly T[], exitMs: number) {
  const [exiting, setExiting] = useState<ReadonlyMap<string, { item: T; index: number }>>(
    () => new Map(),
  );
  const previous = useRef<readonly T[]>(items);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const current = new Set(items.map((item) => item.id));
    const removed = previous.current
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !current.has(item.id));
    previous.current = items;

    setExiting((before) => {
      const returning = [...before.keys()].filter((id) => current.has(id));
      // Same state object when nothing left or came back, so callers that pass a new array each
      // render don't loop.
      if (removed.length === 0 && returning.length === 0) return before;
      const next = new Map(before);
      for (const id of returning) next.delete(id);
      for (const entry of removed) next.set(entry.item.id, entry);
      return next;
    });

    for (const id of current) {
      clearTimeout(timers.current.get(id));
      timers.current.delete(id);
    }
    for (const { item } of removed) {
      clearTimeout(timers.current.get(item.id));
      timers.current.set(
        item.id,
        setTimeout(() => {
          timers.current.delete(item.id);
          setExiting((before) => {
            const next = new Map(before);
            next.delete(item.id);
            return next;
          });
        }, exitMs),
      );
    }
  }, [items, exitMs]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const present: Presence<T>[] = items.map((item) => ({ item, exiting: false }));
  for (const { item, index } of exiting.values()) {
    if (!present.some((entry) => entry.item.id === item.id)) {
      present.splice(Math.min(index, present.length), 0, { item, exiting: true });
    }
  }
  return present;
}
