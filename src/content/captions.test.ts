import { compileLesson } from '@/engine/lesson/compile';
import type { Caption, Trace } from '@/engine/core/types';
import {
  createPointerArray,
  createWindowArray,
  tracePointers,
  traceWindow,
  type PointerOperation,
  type WindowOperation,
} from '@/engine/algorithms/patterns';
import {
  createSortedArray,
  traceSearch,
  type SearchOperation,
} from '@/engine/algorithms/searching';
import {
  createMergeArray,
  createSortArray,
  SORT_ALGORITHMS,
  traceMergeSort,
  traceSort,
} from '@/engine/algorithms/sorting';
import {
  CURVE_IDS,
  createGrowth,
  traceGrowth,
  type GrowthOperation,
} from '@/engine/foundations/big-o';
import {
  createArray,
  traceArray,
  type ArrayModel,
  type ArrayOperation,
} from '@/engine/structures/array';

import {
  createTable,
  traceHashTable,
  type HashModel,
  type HashOperation,
} from '@/engine/structures/hash-table';
import {
  createList,
  traceList,
  type ListModel,
  type ListOperation,
} from '@/engine/structures/linked-list';

import { CAPTIONS, captionSegments, captionText } from './captions';
import { chapterTitles } from './registry';
import { lesson as stackRecipe } from './topics/stack/lesson';
import { meta as stackMeta } from './topics/stack/meta';

describe('captionText', () => {
  it('fills params into a template', () => {
    expect(captionText({ key: 'stack.pushed', params: { value: '42' } })).toBe(
      '**42** goes on top. It’s the new **top**.',
    );
  });

  it('uses authored text as it is', () => {
    expect(captionText({ text: 'A stack is like a pile of plates.' })).toBe(
      'A stack is like a pile of plates.',
    );
  });

  it('shows the key for an unknown caption, and leaves missing params visible', () => {
    expect(captionText({ key: 'stack.nope' })).toBe('stack.nope');
    expect(captionText({ key: 'stack.pushed' })).toBe(
      '**{value}** goes on top. It’s the new **top**.',
    );
  });
});

describe('captionSegments', () => {
  it('splits text into plain and bold runs', () => {
    expect(captionSegments('**Sid** also hashes to bucket 2, a **collision**.')).toEqual([
      { text: 'Sid', bold: true },
      { text: ' also hashes to bucket 2, a ', bold: false },
      { text: 'collision', bold: true },
      { text: '.', bold: false },
    ]);
  });

  it('returns plain text unchanged', () => {
    expect(captionSegments('Clear removes all 3 items.')).toEqual([
      { text: 'Clear removes all 3 items.', bold: false },
    ]);
  });
});

describe('caption catalogue', () => {
  const lesson = compileLesson(stackRecipe, chapterTitles(stackMeta));

  it('has text for every caption the stack lesson uses', () => {
    const keys = new Set(
      lesson.steps.flatMap((step) => ('key' in step.caption ? [step.caption.key] : [])),
    );
    for (const key of keys) expect(CAPTIONS).toHaveProperty([key]);
  });

  it('leaves no placeholder unfilled in the stack lesson', () => {
    for (const step of lesson.steps) expect(captionText(step.caption)).not.toMatch(/\{\w+\}/);
  });
});

describe('array captions', () => {
  const keys = (trace: Trace) =>
    trace.steps.map((step) => ('key' in step.caption ? step.caption.key : step.caption.text));

  it('has a caption for every key the operations use', () => {
    const operations: [ArrayModel, ArrayOperation][] = [
      [createArray(['1', '2']), { type: 'get', index: 0 }],
      [createArray(['1', '2']), { type: 'get', index: 4 }],
      [createArray(), { type: 'get', index: 0 }],
      [createArray(['1']), { type: 'set', index: 0, value: '2' }],
      [createArray(['1', '2'], 2), { type: 'push', value: '3' }],
      [createArray(Array.from({ length: 8 }, String), 8), { type: 'push', value: '3' }],
      [createArray(Array.from({ length: 12 }, String), 12), { type: 'push', value: '3' }],
      [createArray(['1', '2'], 4), { type: 'insert', index: 0, value: '3' }],
      [createArray(['1', '2'], 4), { type: 'insert', index: 2, value: '3' }],
      [createArray(['1', '2'], 4), { type: 'insert', index: 3, value: '3' }],
      [createArray(['1', '2']), { type: 'removeAt', index: 0 }],
      [createArray(['1', '2']), { type: 'removeAt', index: 1 }],
      [createArray(['1', '2']), { type: 'search', value: '2' }],
      [createArray(['1', '2']), { type: 'search', value: '3' }],
      [createArray(), { type: 'search', value: '3' }],
      [createArray(['1']), { type: 'traverse' }],
      [createArray(), { type: 'traverse' }],
    ];
    const used = operations.flatMap(([model, operation]) =>
      keys(traceArray(model, operation).trace),
    );
    expect(used.filter((key) => !(key in CAPTIONS))).toEqual([]);
  });
});

describe('binary search captions', () => {
  it('has a caption for every key the searches use, with every placeholder filled', () => {
    const sorted = ['2', '5', '7', '7', '9'];
    const cases: [string[], SearchOperation][] = [
      [sorted, { type: 'binarySearch', value: '9' }],
      [sorted, { type: 'binarySearch', value: '2' }],
      [sorted, { type: 'binarySearch', value: '6' }],
      [['9', '2', '5'], { type: 'binarySearch', value: '5' }],
      [[], { type: 'binarySearch', value: '5' }],
      [sorted, { type: 'findFirst', value: '7' }],
      [sorted, { type: 'findFirst', value: '6' }],
      [sorted, { type: 'findLast', value: '7' }],
      [[], { type: 'findLast', value: '7' }],
    ];
    for (const [values, operation] of cases) {
      for (const step of traceSearch(createSortedArray(values), operation).trace.steps) {
        if ('key' in step.caption) expect(CAPTIONS).toHaveProperty([step.caption.key]);
        const text = captionText(step.caption);
        expect(text).not.toMatch(/\{\w+\}/);
        expect(text.replaceAll('**', '').length).toBeLessThanOrEqual(120);
      }
    }
  });
});

describe('sorting captions', () => {
  it('has a caption for every key the sorts use, with every placeholder filled', () => {
    const arrays = [
      [],
      ['4'],
      ['3', '1', '2'],
      ['1', '2', '3'],
      ['5a', '3', '5b', '1'],
      ['3', '2', '1'],
    ];
    for (const algorithm of SORT_ALGORITHMS) {
      for (const values of arrays) {
        for (const options of [{}, { rounds: 1 }, { from: 1 }, { pivot: 'random' as const }]) {
          const { trace } = traceSort(createSortArray(values), algorithm, options);
          for (const step of trace.steps) {
            if ('key' in step.caption) expect(CAPTIONS).toHaveProperty([step.caption.key]);
            const text = captionText(step.caption);
            expect(text).not.toMatch(/\{\w+\}/);
            expect(text.replaceAll('**', '').length).toBeLessThanOrEqual(120);
          }
        }
      }
    }
  });
});

describe('merge sort captions', () => {
  it('has a caption for every key merge sort uses, with every placeholder filled', () => {
    const arrays = [
      [],
      ['4'],
      ['3', '1', '2'],
      ['5a', '3', '5b', '1'],
      ['9', '8', '7', '6', '5', '4'],
    ];
    for (const values of arrays) {
      for (const options of [{}, { depth: 1 }]) {
        for (const step of traceMergeSort(createMergeArray(values), options).trace.steps) {
          if ('key' in step.caption) expect(CAPTIONS).toHaveProperty([step.caption.key]);
          const text = captionText(step.caption);
          expect(text).not.toMatch(/\{\w+\}/);
          expect(text.replaceAll('**', '').length).toBeLessThanOrEqual(120);
        }
      }
    }
  });
});

describe('two pointers and sliding window captions', () => {
  const check = (steps: readonly { caption: Caption }[]) => {
    for (const step of steps) {
      if ('key' in step.caption) expect(CAPTIONS).toHaveProperty([step.caption.key]);
      const text = captionText(step.caption);
      expect(text).not.toMatch(/\{\w+\}/);
      expect(text.replaceAll('**', '').length).toBeLessThanOrEqual(120);
    }
  };

  it('has a caption for every key the patterns use, with every placeholder filled', () => {
    const pointerCases: [string[], PointerOperation][] = [
      [['1', '2', '3'], { type: 'reverse' }],
      [['1'], { type: 'reverse' }],
      [['1', '3', '4', '6'], { type: 'pairSum', target: 7 }],
      [['1', '3', '4', '6'], { type: 'pairSum', target: 99 }],
      [['8', '1', '6'], { type: 'pairSum', target: 7 }],
      [['1'], { type: 'pairSum', target: 7 }],
      [['1', '1', '2', '3', '3'], { type: 'removeDuplicates' }],
      [['1'], { type: 'removeDuplicates' }],
    ];
    for (const [values, operation] of pointerCases) {
      check(tracePointers(createPointerArray(values), operation).trace.steps);
    }
    const windowCases: [string[], number, WindowOperation][] = [
      [['2', '1', '5', '1', '3'], 2, { type: 'maxSum' }],
      [['a', 'b'], 2, { type: 'maxSum' }],
      [[], 1, { type: 'maxSum' }],
      [['a', 'b', 'a', 'c', 'b', 'b'], 1, { type: 'longestUnique' }],
      [[], 1, { type: 'longestUnique' }],
      [['1', '3', '2', '5', '4'], 3, { type: 'windowMax' }],
      [['1', '2'], 1, { type: 'setWindow', k: 2 }],
      [['1', '2'], 1, { type: 'setWindow', k: 5 }],
    ];
    for (const [values, k, operation] of windowCases) {
      check(traceWindow(createWindowArray(values, k), operation).trace.steps);
    }
  });
});

describe('linked-list captions', () => {
  it('has a caption for every key the operations use, with every placeholder filled', () => {
    const singly = (items: string[], hasTail = false) => createList(items, { hasTail });
    const doubly = (items: string[]) => createList(items, { kind: 'doubly' });
    const cases: [ListModel, ListOperation][] = [
      [singly(['1', '2']), { type: 'insertHead', value: '0' }],
      [singly([]), { type: 'insertHead', value: '0' }],
      [doubly(['1']), { type: 'insertHead', value: '0' }],
      [singly(['1', '2']), { type: 'insertTail', value: '3' }],
      [singly(['1'], true), { type: 'insertTail', value: '3' }],
      [singly([]), { type: 'insertTail', value: '3' }],
      [doubly(['1']), { type: 'insertTail', value: '3' }],
      [singly(['1', '2']), { type: 'insertAfter', target: '1', value: '3' }],
      [singly(['1', '2']), { type: 'insertAfter', target: '2', value: '3' }],
      [singly(['1']), { type: 'insertAfter', target: '9', value: '3' }],
      [doubly(['1', '2']), { type: 'insertAfter', target: '1', value: '3' }],
      [doubly(['1', '2']), { type: 'insertAfter', target: '2', value: '3' }],
      [doubly(['1', '2']), { type: 'insertBefore', target: '2', value: '3' }],
      [doubly(['1', '2']), { type: 'insertBefore', target: '1', value: '3' }],
      [doubly(['1']), { type: 'insertBefore', target: '9', value: '3' }],
      [singly(['1']), { type: 'insertBefore', target: '1', value: '3' }],
      [singly(['1', '2', '3']), { type: 'delete', value: '2' }],
      [singly(['1', '2']), { type: 'delete', value: '1' }],
      [singly(['1']), { type: 'delete', value: '1' }],
      [singly(['1', '2'], true), { type: 'delete', value: '2' }],
      [singly(['1']), { type: 'delete', value: '9' }],
      [singly([]), { type: 'delete', value: '9' }],
      [doubly(['1', '2', '3']), { type: 'delete', value: '2' }],
      [doubly(['1', '2']), { type: 'delete', value: '1' }],
      [doubly(['1', '2']), { type: 'delete', value: '2' }],
      [singly(['1']), { type: 'search', value: '1' }],
      [singly(['1']), { type: 'search', value: '9' }],
      [singly([]), { type: 'search', value: '9' }],
      [singly(['1']), { type: 'traverse' }],
      [singly([]), { type: 'traverse' }],
      [doubly(['1']), { type: 'traverseBackward' }],
      [singly(['1']), { type: 'traverseBackward' }],
      [singly(['1', '2']), { type: 'reverse' }],
      [singly(['1']), { type: 'reverse' }],
    ];
    for (const [model, operation] of cases) {
      for (const step of traceList(model, operation).trace.steps) {
        if ('key' in step.caption) expect(CAPTIONS).toHaveProperty([step.caption.key]);
        expect(captionText(step.caption)).not.toMatch(/\{\w+\}/);
      }
    }
  });
});

describe('hash-table captions', () => {
  it('has a caption for every key the operations use, with every placeholder filled', () => {
    const chained = (entries: Record<string, string>, size = 5) => createTable(entries, { size });
    const probed = (entries: Record<string, string>, removed: string[] = []) =>
      createTable(entries, { size: 5, strategy: 'probing', removed, loadLimit: 1 });
    const cases: [HashModel, HashOperation][] = [
      [chained({}), { type: 'put', key: 'Sid', value: '1' }],
      [chained({ Sid: '1', Jim: '2' }), { type: 'put', key: 'Kat', value: '3' }],
      [chained({ Sid: '1' }), { type: 'put', key: 'Sid', value: '3' }],
      [chained({ Ann: '1', Ben: '2', Mia: '3' }, 4), { type: 'put', key: 'Sid', value: '4' }],
      [createTable({ Sid: '1' }, { hashFunction: 'polynomial' }), { type: 'hash', key: 'Jim' }],
      [createTable({}, { hashFunction: 'length' }), { type: 'hash', key: 'Jim' }],
      [probed({ Sid: '1', Jim: '2' }), { type: 'put', key: 'Kat', value: '3' }],
      [probed({ Sid: '1', Jim: '2', Kat: '3' }, ['Jim']), { type: 'put', key: 'Leo', value: '4' }],
      [
        createTable({ Ann: '1', Ben: '2' }, { size: 2, strategy: 'probing', loadLimit: 5 }),
        { type: 'put', key: 'Sid', value: '3' },
      ],
      [
        createTable({ Sid: '1', Jim: '2', Ann: '3' }, { size: 4, strategy: 'probing' }),
        { type: 'put', key: 'Ben', value: '4' },
      ],
      [chained({ Sid: '1', Jim: '2' }), { type: 'get', key: 'Jim' }],
      [chained({ Sid: '1' }), { type: 'get', key: 'Kat' }],
      [chained({}), { type: 'get', key: 'Kat' }],
      [probed({ Sid: '1', Jim: '2', Kat: '3' }, ['Jim']), { type: 'get', key: 'Kat' }],
      [
        createTable({ Ann: '1', Ben: '2' }, { size: 2, strategy: 'probing' }),
        { type: 'get', key: 'Sid' },
      ],
      [chained({ Sid: '1' }), { type: 'remove', key: 'Sid' }],
      [chained({ Sid: '1' }), { type: 'remove', key: 'Kat' }],
      [probed({ Sid: '1' }), { type: 'remove', key: 'Sid' }],
    ];
    for (const [model, operation] of cases) {
      for (const step of traceHashTable(model, operation).trace.steps) {
        if ('key' in step.caption) expect(CAPTIONS).toHaveProperty([step.caption.key]);
        expect(captionText(step.caption)).not.toMatch(/\{\w+\}/);
      }
    }
  });
});

describe('Big O captions', () => {
  it('has a caption for every key the operations use, with every placeholder filled', () => {
    const operations: GrowthOperation[] = [
      { type: 'setN', n: 9 },
      { type: 'setN', n: 300 },
      { type: 'setN', n: 0 },
      ...CURVE_IDS.map((curve): GrowthOperation => ({ type: 'show', curve })),
      ...(['lookup', 'loop', 'nested', 'halving'] as const).map((sample): GrowthOperation => ({
        type: 'run',
        sample,
      })),
    ];
    for (const operation of operations) {
      for (const step of traceGrowth(createGrowth({ n: 30 }), operation).trace.steps) {
        if ('key' in step.caption) expect(CAPTIONS).toHaveProperty([step.caption.key]);
        expect(captionText(step.caption)).not.toMatch(/\{\w+\}/);
      }
    }
  });
});
