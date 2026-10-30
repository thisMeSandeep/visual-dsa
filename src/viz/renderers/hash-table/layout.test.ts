import { createTable, hashToScene, traceHashTable } from '@/engine/structures/hash-table';

import type { BoxDrawable, Drawable, LineDrawable } from '../../canvas/types';
import { SIZES } from '../../sizes.fixture';
import { layoutHashTable, PROBE_ID } from './layout';

const byId = <T extends Drawable>(drawables: Drawable[], id: string) =>
  drawables.find((d) => d.id === id) as T | undefined;

describe('layoutHashTable', () => {
  it('stacks buckets in a column and chains entries to the right, a dot in occupied buckets', () => {
    const table = createTable({ Sid: '1', Jim: '2' }, { size: 5 });
    const { drawables } = layoutHashTable(hashToScene(table), SIZES);
    const bucket3 = byId<BoxDrawable>(drawables, 'bucket-3')!;
    const bucket4 = byId<BoxDrawable>(drawables, 'bucket-4')!;
    expect(bucket4.y).toBeGreaterThan(bucket3.y);
    expect(bucket3.value).toBe('•');
    expect(byId<BoxDrawable>(drawables, 'bucket-0')?.value).toBe('');

    const [sid, jim] = ['entry-0', 'entry-1'].map((id) => byId<BoxDrawable>(drawables, id)!);
    expect(sid).toMatchObject({ value: 'Sid', detail: '1' });
    expect(jim!.x).toBeGreaterThan(sid!.x + sid!.width);
    expect(byId<LineDrawable>(drawables, 'link-entry-1')).toMatchObject({
      x1: sid!.x + sid!.width,
      x2: jim!.x,
    });
  });

  it('colours the bucket in focus, and shows the callout above the table', () => {
    const { trace } = traceHashTable(createTable({ Sid: '1' }, { size: 5, loadLimit: 1 }), {
      type: 'put',
      key: 'Jim',
      value: '2',
    });
    const hashed = layoutHashTable(trace.steps[0]!.scene, SIZES);
    const callout = byId(hashed.drawables, 'callout');
    expect(callout).toMatchObject({ kind: 'callout', text: 'h("Jim") = 288' });
    const collision = layoutHashTable(trace.steps[2]!.scene, SIZES);
    expect(byId<BoxDrawable>(collision.drawables, 'bucket-3')?.state).toBe('collision');
    // The callout row is reserved, so the table doesn't move when the callout goes.
    expect(byId<BoxDrawable>(collision.drawables, 'bucket-0')?.y).toBe(
      byId<BoxDrawable>(hashed.drawables, 'bucket-0')?.y,
    );
  });

  it('puts probing entries in their slot and draws the probe arrow down to the next bucket', () => {
    const table = createTable(
      { Sid: '1', Jim: '2' },
      { size: 5, strategy: 'probing', loadLimit: 1 },
    );
    const { trace } = traceHashTable(table, { type: 'put', key: 'Kat', value: '3' });
    const { drawables } = layoutHashTable(trace.steps[2]!.scene, SIZES);
    const slot3 = byId<BoxDrawable>(drawables, 'bucket-3')!;
    expect(byId<BoxDrawable>(drawables, 'entry-0')).toMatchObject({ x: slot3.x, y: slot3.y });
    const probe = byId<LineDrawable>(drawables, PROBE_ID)!;
    expect(probe.x1).toBeGreaterThan(slot3.x + slot3.width);
    expect(probe.y2).toBeGreaterThan(probe.y1);
  });

  it('draws the old table on the left while resizing, then only the new one', () => {
    const table = createTable({ Ann: '1', Ben: '2', Mia: '3' }, { size: 4 });
    const { trace } = traceHashTable(table, { type: 'put', key: 'Sid', value: '4' });
    const mid = layoutHashTable(trace.steps[2]!.scene, SIZES);
    const oldBucket = byId<BoxDrawable>(mid.drawables, 'old-bucket-0')!;
    const newBucket = byId<BoxDrawable>(mid.drawables, 'bucket-0')!;
    expect(newBucket.x).toBeGreaterThan(oldBucket.x);
    expect(byId(mid.drawables, 'bucket-7')).toBeDefined();
    const done = layoutHashTable(trace.steps.at(-1)!.scene, SIZES);
    expect(byId(done.drawables, 'old-bucket-0')).toBeUndefined();
    expect(byId<BoxDrawable>(done.drawables, 'bucket-0')?.x).toBe(oldBucket.x);
  });
});
