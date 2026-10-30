import { createSortedArray, traceSearch } from '@/engine/algorithms/searching';
import { createSortArray, traceSort } from '@/engine/algorithms/sorting';
import type { Trace } from '@/engine/core/types';
import { createRecursion, traceRecursion } from '@/engine/foundations/recursion';
import { createTable, traceHashTable } from '@/engine/structures/hash-table';
import { createStack, traceStack } from '@/engine/structures/stack';

import { hapticFor } from './step-haptics';

/** The haptic of every step played forwards from the first. */
const felt = (trace: Trace) =>
  trace.steps.flatMap((step, index) => hapticFor(step, trace.steps[index - 1]) ?? []);

describe('hapticFor', () => {
  it('taps once when a search finds its match', () => {
    const { trace } = traceSearch(createSortedArray(['1', '3', '5', '7']), {
      type: 'binarySearch',
      value: '5',
    });
    expect(felt(trace)).toEqual(['found']);
  });

  it('taps lightly for each swap', () => {
    const { trace } = traceSort(createSortArray(['3', '2', '1']), 'bubble-sort');
    expect(felt(trace)).toEqual(['swap', 'swap', 'swap']);
  });

  it('buzzes on an overflow', () => {
    const { trace } = traceStack(createStack(['1'], 1), { type: 'push', value: '2' });
    expect(felt(trace)).toContain('error');
  });

  it('marks a collision in a hash table', () => {
    // Sum hash: "Sid" and "Dis" share their letters, so they share a bucket.
    const { trace } = traceHashTable(createTable({ Sid: '1' }, { size: 5 }), {
      type: 'put',
      key: 'Dis',
      value: '2',
    });
    expect(felt(trace)).toContain('collision');
  });

  it('taps once for a run of returning recursive calls, and buzzes on a stack overflow', () => {
    const fact = traceRecursion(createRecursion(), { type: 'fact', n: 4 }).trace;
    expect(felt(fact)).toEqual(['found']);
    const broken = traceRecursion(createRecursion(3), { type: 'broken' }).trace;
    expect(felt(broken)).toEqual(['error']);
  });

  it('stays quiet on ordinary steps', () => {
    const { trace } = traceStack(createStack([], 4), { type: 'push', value: '2' });
    expect(felt(trace)).toEqual([]);
  });
});
