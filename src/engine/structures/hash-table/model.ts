/**
 * Hash tables (ALGORITHM-CATALOG H1): a column of buckets, keys placed by hash(key) mod size.
 * Plain immutable data plus pure functions; operations.ts adds the steps a learner sees.
 *
 * Two collision strategies, so the lesson can compare them:
 * - `chaining`: each bucket holds a chain of every key that lands there.
 * - `probing` (linear probing, open addressing): one key per bucket; a collision tries the next
 *   bucket. A removed key leaves a tombstone, so searches know to keep going past it.
 */
import { config } from '@/config';

export type HashEntry = Readonly<{
  /** Stable across steps so the canvas can animate this exact entry (never reused). */
  id: string;
  key: string;
  value: string;
}>;

export type HashBucket = Readonly<{
  /** The chain (chaining), or at most one entry (probing). */
  entries: readonly HashEntry[];
  /** Probing only: a key was removed from here; searches keep going, inserts may reuse it. */
  tombstone: boolean;
}>;

export type HashStrategy = 'chaining' | 'probing';
/** Sum of letter codes, a polynomial that mixes them, or a bad hash that only counts letters. */
export type HashFunctionId = 'sum' | 'polynomial' | 'length';

export type HashModel = Readonly<{
  strategy: HashStrategy;
  hashFunction: HashFunctionId;
  /** Resize when a put would push keys ÷ buckets above this. */
  loadLimit: number;
  buckets: readonly HashBucket[];
  /** Next entry id number; only ever grows. */
  nextId: number;
}>;

const { hashTable } = config.structures;

export const entryId = (n: number) => `entry-${n}`;

const EMPTY: HashBucket = { entries: [], tombstone: false };

/** The hash of `key` before it's reduced to a bucket. */
export function hashOf(fn: HashFunctionId, key: string): number {
  const codes = [...key].map((char) => char.codePointAt(0) ?? 0);
  switch (fn) {
    case 'sum':
      return codes.reduce((sum, code) => sum + code, 0);
    case 'polynomial':
      return codes.reduce((hash, code) => hash * hashTable.polynomialBase + code, 0);
    case 'length':
      return codes.length;
  }
}

export const size = (table: HashModel) => table.buckets.length;
export const count = (table: HashModel) =>
  table.buckets.reduce((sum, bucket) => sum + bucket.entries.length, 0);

/** Keys ÷ buckets, as shown: 0.75. */
export const formatLoad = (load: number) => load.toFixed(hashTable.loadFactorDigits);

/** The bucket a key's hash points to, its home bucket. */
export const homeBucket = (table: HashModel, key: string) =>
  hashOf(table.hashFunction, key) % size(table);

/** The capacity a full table grows to, or the same size when it can't grow. */
export const grownSize = (table: HashModel) =>
  Math.min(size(table) * hashTable.growthFactor, hashTable.maxSize);

/** Where `key` is, by bucket and place in the chain. */
export function locate(table: HashModel, key: string): { bucket: number; index: number } | null {
  for (const [bucket, { entries }] of table.buckets.entries()) {
    const index = entries.findIndex((entry) => entry.key === key);
    if (index >= 0) return { bucket, index };
  }
  return null;
}

export function emptyBuckets(slots: number): HashBucket[] {
  return Array.from({ length: slots }, () => EMPTY);
}

/** The table with bucket `index` replaced. */
export function withBucket(table: HashModel, index: number, bucket: HashBucket): HashModel {
  const buckets = [...table.buckets];
  buckets[index] = bucket;
  return { ...table, buckets };
}

/** A new entry, and the table that has used up its id. */
export function newEntry(table: HashModel, key: string, value: string): [HashEntry, HashModel] {
  return [
    { id: entryId(table.nextId), key, value },
    { ...table, nextId: table.nextId + 1 },
  ];
}

/** Where a new key goes without tracing: its home bucket, or the next free one when probing. */
export function placeQuietly(buckets: HashBucket[], entry: HashEntry, fn: HashFunctionId) {
  const home = hashOf(fn, entry.key) % buckets.length;
  for (let k = 0; k < buckets.length; k++) {
    const index = (home + k) % buckets.length;
    const bucket = buckets[index]!;
    if (bucket.entries.length === 0 || bucket.tombstone) {
      buckets[index] = { entries: [entry], tombstone: false };
      return index;
    }
  }
  return -1;
}

export function createTable(
  entries: Readonly<Record<string, string>> = {},
  options: {
    size?: number;
    strategy?: HashStrategy;
    hashFunction?: HashFunctionId;
    loadLimit?: number;
    /** Keys to remove after filling, leaving tombstones when probing. */
    removed?: readonly string[];
  } = {},
): HashModel {
  const slots = options.size ?? hashTable.defaultSize;
  const strategy = options.strategy ?? 'chaining';
  const hashFunction = options.hashFunction ?? 'sum';
  const loadLimit = options.loadLimit ?? hashTable.defaultLoadLimit;
  const keys = Object.keys(entries);
  if (!Number.isInteger(slots) || slots < hashTable.minSize || slots > hashTable.maxSize) {
    throw new RangeError(
      `A table here has ${hashTable.minSize}–${hashTable.maxSize} buckets, got ${slots}`,
    );
  }
  if (keys.length > config.engine.maxItems) {
    throw new RangeError(`A table here holds at most ${config.engine.maxItems} keys`);
  }
  if (strategy === 'probing' && keys.length > slots) {
    throw new RangeError(`${keys.length} keys don't fit in ${slots} buckets, one key each`);
  }
  if (!(loadLimit > 0)) throw new RangeError(`The load limit must be above 0, got ${loadLimit}`);
  for (const key of keys) {
    const problem = keyProblem(key);
    if (problem) throw new RangeError(problem);
  }

  const buckets = emptyBuckets(slots);
  keys.forEach((key, index) => {
    const entry: HashEntry = { id: entryId(index), key, value: entries[key]! };
    if (strategy === 'probing') {
      placeQuietly(buckets, entry, hashFunction);
    } else {
      const home = hashOf(hashFunction, key) % slots;
      buckets[home] = { entries: [...buckets[home]!.entries, entry], tombstone: false };
    }
  });
  for (const key of options.removed ?? []) {
    const index = buckets.findIndex((bucket) => bucket.entries.some((e) => e.key === key));
    if (index < 0) throw new RangeError(`Can't remove "${key}": it isn't in the table`);
    const rest = buckets[index]!.entries.filter((entry) => entry.key !== key);
    buckets[index] = { entries: rest, tombstone: strategy === 'probing' };
  }
  return { strategy, hashFunction, loadLimit, buckets, nextId: keys.length };
}

/** Null when `key` can be a key: letters only, short enough to draw. */
export function keyProblem(key: string): string | null {
  if (!/^[A-Za-z]+$/.test(key)) return `Keys are names made of letters, got "${key}"`;
  if (key.length > hashTable.maxKeyLength) {
    return `Keys are at most ${hashTable.maxKeyLength} letters, got "${key}"`;
  }
  return null;
}
