import type { Scene, SceneElement, Trace } from '../../core/types';
import { describeHashTable } from './describe';
import { count, createTable, hashOf, locate, type HashModel } from './model';
import { traceHashTable, type HashOperation } from './operations';
import { hashToScene, tombstoneId } from './to-scene';

type Cell = Extract<SceneElement, { kind: 'cell' }>;
const cells = (scene: Scene) => scene.elements.filter((e): e is Cell => e.kind === 'cell');
const lines = (trace: Trace) => trace.steps.map((step) => step.codeLine);
const keys = (trace: Trace) =>
  trace.steps.map((step) => ('key' in step.caption ? step.caption.key : step.caption.text));
const callouts = (trace: Trace) =>
  trace.steps.flatMap((step) =>
    step.scene.elements.flatMap((e) => (e.kind === 'callout' ? [e.text] : [])),
  );
const run = (model: HashModel, operation: HashOperation) => traceHashTable(model, operation);
/** Keys by bucket, e.g. [[], ['Sid', 'Jim'], …]; a tombstone shows as '×'. */
const layout = (table: HashModel) =>
  table.buckets.map((bucket) => (bucket.tombstone ? ['×'] : bucket.entries.map((e) => e.key)));

describe('hash functions', () => {
  it('sums letter codes, mixes them polynomially, or (badly) counts letters', () => {
    expect(hashOf('sum', 'Sid')).toBe(83 + 105 + 100);
    expect(hashOf('polynomial', 'Sid')).toBe((83 * 31 + 105) * 31 + 100);
    expect(hashOf('length', 'Sid')).toBe(3);
  });

  it('sends Sid, Jim and Kat to the same bucket with the sum hash (the lesson relies on it)', () => {
    expect(['Sid', 'Jim', 'Kat'].map((key) => hashOf('sum', key))).toEqual([288, 288, 288]);
    // The polynomial hash spreads them over 7 buckets (not 8: 31 mod 8 = −1, so they'd collide).
    const spread = ['Sid', 'Jim', 'Kat'].map((key) => hashOf('polynomial', key) % 7);
    expect(spread).toEqual([0, 5, 4]);
  });
});

describe('createTable', () => {
  it('places entries by hash, chaining or probing, and can leave tombstones', () => {
    const chained = createTable({ Sid: '1', Jim: '2', Ann: '3' }, { size: 5 });
    expect(layout(chained)).toEqual([['Ann'], [], [], ['Sid', 'Jim'], []]);

    const probed = createTable(
      { Sid: '1', Jim: '2', Kat: '3' },
      { size: 5, strategy: 'probing', removed: ['Jim'] },
    );
    expect(layout(probed)).toEqual([['Kat'], [], [], ['Sid'], ['×']]);
  });

  it('rejects bad sizes, keys and fills', () => {
    expect(() => createTable({}, { size: 1 })).toThrow(RangeError);
    expect(() => createTable({}, { size: 13 })).toThrow(RangeError);
    expect(() => createTable({ sid9: '1' })).toThrow(RangeError);
    expect(() => createTable({ Abigail: '1' })).toThrow(RangeError);
    expect(() =>
      createTable({ Ann: '1', Ben: '2', Sid: '3' }, { size: 2, strategy: 'probing' }),
    ).toThrow(RangeError);
  });
});

describe('put with chaining', () => {
  it('hashes in two steps with callouts, then drops the key into an empty bucket', () => {
    const { trace, model } = run(createTable({}, { size: 5 }), {
      type: 'put',
      key: 'Sid',
      value: '555-0199',
    });
    expect(lines(trace)).toEqual(['hash-fn', 'hash-index', 'c-put-append']);
    expect(callouts(trace)).toEqual(['h("Sid") = 288', '288 mod 5 = 3']);
    expect(keys(trace).at(-1)).toBe('hash.placed');
    expect(locate(model, 'Sid')).toEqual({ bucket: 3, index: 0 });
  });

  it('names the collision, walks the chain, and appends to it', () => {
    const table = createTable({ Sid: '1' }, { size: 5, loadLimit: 1 });
    const { trace, model } = run(table, { type: 'put', key: 'Jim', value: '2' });
    expect(lines(trace)).toEqual(['hash-fn', 'hash-index', 'c-put-compare', 'c-put-append']);
    expect(trace.steps[2]!.scene.meta).toMatchObject({ bucket: 3, bucketState: 'collision' });
    expect(layout(model)[3]).toEqual(['Sid', 'Jim']);
  });

  it('updates the value of a key already there, without resizing', () => {
    const table = createTable({ Ann: '1', Ben: '2', Sid: '3' }, { size: 4 });
    const { trace, model } = run(table, { type: 'put', key: 'Sid', value: '9' });
    expect(keys(trace).at(-1)).toBe('hash.updated');
    expect(model.buckets).toHaveLength(4);
    expect(count(model)).toBe(3);
  });
});

describe('put with linear probing', () => {
  it('probes past collisions to the next free bucket', () => {
    const table = createTable(
      { Sid: '1', Jim: '2' },
      { size: 5, strategy: 'probing', loadLimit: 1 },
    );
    const { trace, model } = run(table, { type: 'put', key: 'Kat', value: '3' });
    expect(lines(trace)).toEqual([
      'hash-fn',
      'hash-index',
      'p-put-probe',
      'p-put-probe',
      'p-put-place',
    ]);
    expect(trace.steps[2]!.scene.meta).toMatchObject({ probeFrom: 3, probeTo: 4 });
    expect(trace.steps[3]!.scene.meta).toMatchObject({ probeFrom: 4, probeTo: 0 });
    expect(layout(model)).toEqual([['Kat'], [], [], ['Sid'], ['Jim']]);
  });

  it('remembers a tombstone, checks on, and reuses it', () => {
    const table = createTable(
      { Sid: '1', Jim: '2', Kat: '3' },
      { size: 5, strategy: 'probing', removed: ['Jim'], loadLimit: 1 },
    );
    const { trace, model } = run(table, { type: 'put', key: 'Leo', value: '4' });
    expect(lines(trace)).toContain('p-put-tombstone');
    expect(keys(trace).at(-1)).toBe('hash.probe.reuse');
    expect(layout(model)).toEqual([['Kat'], [], [], ['Sid'], ['Leo']]);
  });

  it('fails when every bucket is taken and the table can’t grow', () => {
    const table = createTable(
      { Ann: '1', Ben: '2' },
      { size: 2, strategy: 'probing', loadLimit: 5 },
    );
    const { trace } = run(table, { type: 'put', key: 'Sid', value: '3' });
    expect(trace.error?.code).toBe('hash.full');
    expect(lines(trace).at(-1)).toBe('p-full');
  });
});

describe('get and remove', () => {
  it('walks the chain to find a key, or reports it missing in red', () => {
    const table = createTable({ Sid: '1', Jim: '2', Kat: '555-0101' }, { size: 5 });
    const hit = run(table, { type: 'get', key: 'Kat' });
    expect(hit.trace.result).toBe('555-0101');
    expect(lines(hit.trace)).toEqual([
      'hash-fn',
      'hash-index',
      'c-get-compare',
      'c-get-compare',
      'c-get-found',
    ]);
    const miss = run(table, { type: 'get', key: 'Zoe' });
    expect(miss.trace.error?.code).toBe('hash.not-found');
    expect(miss.trace.steps.at(-1)?.scene.meta).toMatchObject({ bucketState: 'error' });
    expect(keys(miss.trace).at(-1)).toBe('hash.missing.empty');
  });

  it('unlinks from a chain, and leaves a tombstone when probing', () => {
    const chained = run(createTable({ Sid: '1', Jim: '2', Kat: '3' }, { size: 5 }), {
      type: 'remove',
      key: 'Jim',
    });
    expect(chained.trace.result).toBe('2');
    expect(layout(chained.model)[3]).toEqual(['Sid', 'Kat']);
    expect(lines(chained.trace).at(-1)).toBe('c-remove-unlink');

    const probed = run(
      createTable({ Sid: '1', Jim: '2', Kat: '3' }, { size: 7, strategy: 'probing' }),
      { type: 'remove', key: 'Jim' },
    );
    expect(layout(probed.model)).toEqual([[], ['Sid'], ['×'], ['Kat'], [], [], []]);
    const last = probed.trace.steps.at(-1)!.scene;
    expect(cells(last).find((c) => c.id === tombstoneId(2))?.state).toBe('dimmed');
  });

  it('searches past a tombstone instead of stopping at it', () => {
    const table = createTable(
      { Sid: '1', Jim: '2', Kat: '3' },
      { size: 7, strategy: 'probing', removed: ['Jim'] },
    );
    const { trace } = run(table, { type: 'get', key: 'Kat' });
    expect(trace.result).toBe('3');
    expect(keys(trace)).toContain('hash.probe.past-tombstone');
  });

  it('stops a probing search at an empty bucket', () => {
    const table = createTable({ Sid: '1' }, { size: 7, strategy: 'probing' });
    const { trace } = run(table, { type: 'get', key: 'Kat' });
    expect(lines(trace)).toEqual(['hash-fn', 'hash-index', 'p-get-probe', 'p-get-missing']);
  });
});

describe('resizing', () => {
  it('doubles the table before a put that would pass the load limit, rehashing every key', () => {
    const table = createTable({ Ann: '1', Ben: '2', Mia: '3' }, { size: 4 });
    const { trace, model } = run(table, { type: 'put', key: 'Sid', value: '4' });
    expect(model.buckets).toHaveLength(8);
    expect(count(model)).toBe(4);
    expect(lines(trace).slice(0, 6)).toEqual([
      'c-resize-check',
      'c-resize',
      'c-rehash',
      'c-rehash',
      'c-rehash',
      'c-resize-done',
    ]);
    expect(callouts(trace)[0]).toBe('4 ÷ 4 = 1.00 > 0.75');

    // Mid-resize, keys not yet moved wait in the old table.
    const firstMove = trace.steps[2]!.scene;
    expect(firstMove.meta?.oldSize).toBe(4);
    const waiting = cells(firstMove).filter((c) => c.slot.type === 'bucket' && c.slot.old);
    expect(waiting).toHaveLength(2);
    expect(trace.steps[5]!.scene.meta?.oldSize).toBeUndefined();
  });

  it('probes while rehashing when two keys share a new bucket', () => {
    const table = createTable({ Sid: '1', Jim: '2', Ann: '3' }, { size: 4, strategy: 'probing' });
    const { trace, model } = run(table, { type: 'put', key: 'Ben', value: '4' });
    expect(keys(trace)).toContain('hash.rehash.probed');
    expect(model.buckets).toHaveLength(8);
    expect(count(model)).toBe(4);
  });
});

describe('scenes', () => {
  it('carries sizes and the load factor in meta, and describes the table', () => {
    const scene = hashToScene(createTable({ Sid: '1', Jim: '2', Ann: '3' }, { size: 5 }));
    expect(scene.meta).toMatchObject({ size: 5, count: 3, load: '0.60', loadLimit: '0.75' });
    expect(describeHashTable(scene)).toBe(
      'Hash table, 5 buckets, 3 keys, load factor 0.60. Bucket 0: Ann. Bucket 3: Sid, Jim.',
    );
  });
});
