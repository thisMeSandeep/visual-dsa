import type { ElementState } from '@/engine/core/types';
import { createArray, traceArray } from '@/engine/structures/array';
import { createTable, traceHashTable } from '@/engine/structures/hash-table';

import { LEGEND_GROUPS, LEGEND_ORDER, STATE_LABELS, visibleStates } from './state-legend';
import { STATE_PAINT } from './state-style';

describe('state legend', () => {
  it('explains every state exactly once, and labels each', () => {
    const grouped = LEGEND_GROUPS.flatMap((group) => group.states);
    const all = Object.keys(STATE_PAINT) as ElementState[];
    expect([...grouped].sort()).toEqual([...all].sort());
    expect(new Set(grouped).size).toBe(grouped.length);
    expect(Object.keys(STATE_LABELS).sort()).toEqual([...all].sort());
    expect(LEGEND_ORDER).not.toContain('default');
  });

  it('lists the states on the canvas, in legend order, without default', () => {
    const { trace } = traceArray(createArray(['23', '8', '42']), { type: 'search', value: '42' });
    expect(visibleStates(trace.steps[1]!.scene)).toEqual(['active', 'visited']);
    expect(visibleStates(trace.steps.at(-1)!.scene)).toEqual(['visited', 'found']);
  });

  it('counts a hash bucket’s collision, and a structure in error', () => {
    const table = createTable({ Sid: '1' }, { size: 5, loadLimit: 1 });
    const put = traceHashTable(table, { type: 'put', key: 'Jim', value: '2' }).trace;
    expect(visibleStates(put.steps[2]!.scene)).toContain('collision');
    const missing = traceArray(createArray(['1']), { type: 'get', index: 4 }).trace;
    expect(visibleStates(missing.steps.at(-1)!.scene)).toEqual(['error']);
  });
});
