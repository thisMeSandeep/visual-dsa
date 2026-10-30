/**
 * Hash-table operations with tracing (ALGORITHM-CATALOG H1). Code line ids must match the
 * `@line` markers in the hash table's code samples (ARCHITECTURE §5.3). The samples hold both
 * strategies, so strategy lines start with `c-` (chaining) or `p-` (probing).
 *
 * Code line ids used: hash-fn, hash-index (hashing); c-/p- resize-check, resize, rehash,
 * resize-done (growing); c-put-compare, c-put-update, c-put-append, p-put-probe,
 * p-put-tombstone, p-put-update, p-put-place, p-full (put); c-get-compare, c-get-found,
 * c-get-missing, p-get-probe, p-get-found, p-get-missing (get); c-remove-compare,
 * c-remove-unlink, c-remove-missing, p-remove-probe, p-remove-mark, p-remove-missing (remove).
 * Caption keys: the `hash.*` keys in content/captions.ts.
 */
import { config } from '@/config';

import { runTrace, type Tracer } from '../../core/tracer';
import type { Caption, Trace } from '../../core/types';
import { describeHashTable } from './describe';
import {
  count,
  emptyBuckets,
  formatLoad,
  grownSize,
  hashOf,
  locate,
  newEntry,
  placeQuietly,
  size,
  withBucket,
  type HashEntry,
  type HashModel,
} from './model';
import { hashToScene, type HashAnnotations } from './to-scene';

export type HashTracer = Tracer<HashModel, HashAnnotations>;

/** A strategy's code line: `c-put-append` or `p-put-place`. */
const line = (t: HashTracer, name: string) =>
  `${t.model.strategy === 'chaining' ? 'c' : 'p'}-${name}`;

/** Hashes `key` in two steps, the hash then the bucket. Returns the home bucket. */
function hashKey(t: HashTracer, key: string): number {
  const fn = t.model.hashFunction;
  const hash = hashOf(fn, key);
  const slots = size(t.model);
  const home = hash % slots;
  t.step({
    line: 'hash-fn',
    caption: {
      key: `hash.fn.${fn}`,
      params: { key, hash, base: config.structures.hashTable.polynomialBase },
    },
    vars: { key, h: hash },
    annotations: { callout: `h("${key}") = ${hash}` },
  });
  t.step({
    line: 'hash-index',
    caption: { key: 'hash.index', params: { key, hash, size: slots, bucket: home } },
    vars: { index: home },
    annotations: {
      callout: `${hash} mod ${slots} = ${home}`,
      bucket: { index: home, state: 'active' },
    },
  });
  return home;
}

/** Before a put: when one more key would push the load factor over the limit, doubles the table. */
function growIfNeeded(t: HashTracer): void {
  const keys = count(t.model) + 1;
  const from = size(t.model);
  const to = grownSize(t.model);
  if (keys / from <= t.model.loadLimit || to === from) return;

  const load = formatLoad(keys / from);
  const limit = formatLoad(t.model.loadLimit);
  t.count('comparisons');
  t.step({
    line: line(t, 'resize-check'),
    caption: { key: 'hash.resize.check', params: { count: keys, size: from, load, limit } },
    annotations: { callout: `${keys} ÷ ${from} = ${load} > ${limit}` },
  });

  const old = t.model.buckets;
  t.update((table) => ({ ...table, buckets: emptyBuckets(to) }));
  t.step({
    line: line(t, 'resize'),
    caption: { key: 'hash.resize', params: { from, to } },
    annotations: { old },
  });

  for (const entry of old.flatMap((bucket) => bucket.entries)) {
    const hash = hashOf(t.model.hashFunction, entry.key);
    const home = hash % to;
    let bucket = home;
    t.update((table) => {
      const buckets = [...table.buckets];
      if (table.strategy === 'probing') bucket = placeQuietly(buckets, entry, table.hashFunction);
      else buckets[home] = { entries: [...buckets[home]!.entries, entry], tombstone: false };
      return { ...table, buckets };
    });
    t.count('reads');
    t.count('writes');
    t.step({
      line: line(t, 'rehash'),
      caption:
        bucket === home
          ? { key: 'hash.rehash', params: { key: entry.key, bucket, size: to } }
          : { key: 'hash.rehash.probed', params: { key: entry.key, home, bucket } },
      annotations: {
        old,
        callout: `${hash} mod ${to} = ${home}`,
        highlight: { [entry.id]: 'active' },
        bucket: { index: bucket, state: 'active' },
      },
    });
  }

  t.step({
    line: line(t, 'resize-done'),
    caption: { key: 'hash.resized', params: { count: keys - 1 } },
  });
}

/** Stores `key` → `value`, or updates the value when the key is already there. */
export function put(t: HashTracer, key: string, value: string): void {
  // Only a new key adds to the load; updating one already there never resizes.
  if (!locate(t.model, key)) growIfNeeded(t);
  const home = hashKey(t, key);
  if (t.model.strategy === 'chaining') putChained(t, key, value, home);
  else putProbing(t, key, value, home);
}

/** The entry's value changed in place (same id, so it stays put on the canvas). */
function update(t: HashTracer, bucket: number, entry: HashEntry, value: string) {
  t.update((table) =>
    withBucket(table, bucket, {
      ...table.buckets[bucket]!,
      entries: table.buckets[bucket]!.entries.map((e) => (e.id === entry.id ? { ...e, value } : e)),
    }),
  );
  t.count('writes');
  t.step({
    line: line(t, 'put-update'),
    caption: { key: 'hash.updated', params: { key: entry.key, value, old: entry.value } },
    annotations: { highlight: { [entry.id]: 'new' }, bucket: { index: bucket, state: 'active' } },
  });
}

function putChained(t: HashTracer, key: string, value: string, home: number) {
  const chain = t.model.buckets[home]!.entries;
  for (const [index, entry] of chain.entries()) {
    t.count('comparisons');
    if (entry.key === key) {
      update(t, home, entry, value);
      return;
    }
    t.step({
      line: line(t, 'put-compare'),
      caption:
        index === 0
          ? { key: 'hash.collision', params: { bucket: home, other: entry.key, key } }
          : { key: 'hash.chain.next', params: { other: entry.key, key } },
      annotations: {
        highlight: { [entry.id]: 'active' },
        bucket: { index: home, state: index === 0 ? 'collision' : 'active' },
      },
    });
  }

  const [entry, next] = newEntry(t.model, key, value);
  t.update(() => withBucket(next, home, { entries: [...chain, entry], tombstone: false }));
  t.count('writes');
  t.step({
    line: line(t, 'put-append'),
    caption: {
      key: chain.length === 0 ? 'hash.placed' : 'hash.chain.appended',
      params: { key, bucket: home },
    },
    annotations: { highlight: { [entry.id]: 'new' }, bucket: { index: home, state: 'active' } },
  });
}

function putProbing(t: HashTracer, key: string, value: string, home: number) {
  const slots = size(t.model);
  let reusable = -1;
  for (let k = 0; k < slots; k++) {
    const index = (home + k) % slots;
    const next = (index + 1) % slots;
    const bucket = t.model.buckets[index]!;
    const occupant = bucket.entries[0];
    if (bucket.tombstone) {
      t.count('comparisons');
      if (reusable < 0) reusable = index;
      t.step({
        line: line(t, 'put-tombstone'),
        caption: { key: 'hash.probe.tombstone', params: { bucket: index, key, next } },
        annotations: { bucket: { index, state: 'active' }, probe: { from: index, to: next } },
      });
      continue;
    }
    if (occupant) {
      t.count('comparisons');
      if (occupant.key === key) {
        update(t, index, occupant, value);
        return;
      }
      t.step({
        line: line(t, 'put-probe'),
        caption: {
          key: k === 0 ? 'hash.collision.probe' : 'hash.probe.next',
          params: { bucket: index, other: occupant.key, next },
        },
        annotations: {
          highlight: { [occupant.id]: 'active' },
          bucket: { index, state: 'collision' },
          probe: { from: index, to: next },
        },
      });
      continue;
    }
    placeAt(t, key, value, reusable >= 0 ? reusable : index, {
      key: reusable >= 0 ? 'hash.probe.reuse' : k === 0 ? 'hash.placed' : 'hash.probe.placed',
      params: { key, bucket: reusable >= 0 ? reusable : index },
    });
    return;
  }
  if (reusable >= 0) {
    placeAt(t, key, value, reusable, {
      key: 'hash.probe.reuse',
      params: { key, bucket: reusable },
    });
    return;
  }
  t.fail(
    'hash.full',
    { key: 'hash.full', params: { key, size: slots } },
    { line: line(t, 'full'), annotations: { container: 'error' } },
  );
}

function placeAt(t: HashTracer, key: string, value: string, index: number, caption: Caption) {
  const [entry, next] = newEntry(t.model, key, value);
  t.update(() => withBucket(next, index, { entries: [entry], tombstone: false }));
  t.count('writes');
  t.step({
    line: line(t, 'put-place'),
    caption,
    annotations: { highlight: { [entry.id]: 'new' }, bucket: { index, state: 'active' } },
  });
}

type FindLines = { compare: string; found: string; missing: string };

/**
 * Looks for `key` from its home bucket, one step per entry checked: along the chain, or probing
 * past other keys and tombstones until an empty bucket. Ends the trace when it isn't there.
 */
function find(
  t: HashTracer,
  key: string,
  home: number,
  lines: FindLines,
  missing: (bucket: number, why: 'chain' | 'empty' | 'everywhere') => Caption,
): { bucket: number; entry: HashEntry } | undefined {
  const fail = (bucket: number, why: 'chain' | 'empty' | 'everywhere') =>
    t.fail('hash.not-found', missing(bucket, why), {
      line: line(t, lines.missing),
      annotations: { bucket: { index: bucket, state: 'error' } },
    });

  if (t.model.strategy === 'chaining') {
    const chain = t.model.buckets[home]!.entries;
    for (const entry of chain) {
      t.count('comparisons');
      t.count('reads');
      if (entry.key === key) return found(t, key, home, entry, lines.found);
      t.step({
        line: line(t, lines.compare),
        caption: { key: 'hash.chain.next', params: { other: entry.key, key } },
        annotations: {
          highlight: { [entry.id]: 'active' },
          bucket: { index: home, state: 'active' },
        },
      });
    }
    fail(home, chain.length === 0 ? 'empty' : 'chain');
    return undefined;
  }

  const slots = size(t.model);
  for (let k = 0; k < slots; k++) {
    const index = (home + k) % slots;
    const next = (index + 1) % slots;
    const bucket = t.model.buckets[index]!;
    const occupant = bucket.entries[0];
    if (!bucket.tombstone && !occupant) {
      fail(index, 'empty');
      return undefined;
    }
    t.count('comparisons');
    if (occupant?.key === key) {
      t.count('reads');
      return found(t, key, index, occupant, lines.found);
    }
    t.step({
      line: line(t, lines.compare),
      caption: occupant
        ? { key: 'hash.probe.skip', params: { bucket: index, other: occupant.key, key, next } }
        : { key: 'hash.probe.past-tombstone', params: { bucket: index, next } },
      annotations: {
        ...(occupant ? { highlight: { [occupant.id]: 'active' } } : {}),
        bucket: { index, state: 'active' },
        probe: { from: index, to: next },
      },
    });
  }
  fail(home, 'everywhere');
  return undefined;
}

function found(t: HashTracer, key: string, bucket: number, entry: HashEntry, foundLine: string) {
  t.step({
    line: line(t, foundLine),
    caption: { key: 'hash.found', params: { key, value: entry.value } },
    annotations: { highlight: { [entry.id]: 'found' }, bucket: { index: bucket, state: 'active' } },
  });
  return { bucket, entry };
}

/** The value stored under `key`, or undefined. */
export function get(t: HashTracer, key: string): string | undefined {
  const home = hashKey(t, key);
  const hit = find(
    t,
    key,
    home,
    {
      compare: t.model.strategy === 'chaining' ? 'get-compare' : 'get-probe',
      found: 'get-found',
      missing: 'get-missing',
    },
    (bucket, why) => ({ key: `hash.missing.${why}`, params: { key, bucket } }),
  );
  return hit?.entry.value;
}

/** Removes `key`: unlinked from its chain, or replaced by a tombstone when probing. */
export function remove(t: HashTracer, key: string): string | undefined {
  const home = hashKey(t, key);
  const chained = t.model.strategy === 'chaining';
  const hit = find(
    t,
    key,
    home,
    chained
      ? { compare: 'remove-compare', found: 'remove-compare', missing: 'remove-missing' }
      : { compare: 'remove-probe', found: 'remove-probe', missing: 'remove-missing' },
    () => ({ key: 'hash.remove.missing', params: { key } }),
  );
  if (!hit) return undefined;

  const { bucket, entry } = hit;
  t.update((table) => {
    const rest = table.buckets[bucket]!.entries.filter((e) => e.id !== entry.id);
    return withBucket(table, bucket, { entries: rest, tombstone: !chained });
  });
  t.count('writes');
  t.step({
    line: line(t, chained ? 'remove-unlink' : 'remove-mark'),
    caption: { key: chained ? 'hash.chain.removed' : 'hash.tombstone', params: { key, bucket } },
    annotations: { bucket: { index: bucket, state: 'active' } },
  });
  return entry.value;
}

export type HashOperation =
  | { type: 'put'; key: string; value: string }
  | { type: 'get'; key: string }
  | { type: 'remove'; key: string }
  | { type: 'hash'; key: string };

/** Runs one operation on `model`: the trace to play, and the table to continue from. */
export function traceHashTable(
  model: HashModel,
  operation: HashOperation,
): { trace: Trace<string | number | undefined>; model: HashModel } {
  return runTrace(
    {
      operation: `hash.${operation.type}`,
      model,
      toScene: hashToScene,
      describe: describeHashTable,
    },
    (t): string | number | undefined => {
      switch (operation.type) {
        case 'put':
          put(t, operation.key, operation.value);
          return undefined;
        case 'get':
          return get(t, operation.key);
        case 'remove':
          return remove(t, operation.key);
        case 'hash':
          return hashKey(t, operation.key);
      }
    },
  );
}
