/**
 * Binary search with tracing (ALGORITHM-CATALOG A1): the classic search, and the variants that
 * find the first or last of several equal values. Code line ids must match the `@line` markers
 * in the binary search code samples (ARCHITECTURE §5.3).
 *
 * Code line ids used: init, mid, found, go-right, go-left, not-found (binarySearch); the same
 * with a `first-` or `last-` prefix, match for found and done for not-found (findFirst,
 * findLast). Caption keys: the `binary-search.*` keys in content/captions.ts.
 *
 * Each check reads the middle item and compares it with the target once (a three-way compare),
 * so the comparisons counter is the number of checks: about log₂ n.
 */
import { runTrace, type Tracer } from '../../core/tracer';
import type { Trace } from '../../core/types';
import type { ArrayModel } from '../../structures/array';
import { describeSearch } from './describe';
import { compareValues, isSorted } from './model';
import { searchToScene, type SearchState } from './to-scene';

export type SearchTracer = Tracer<ArrayModel, SearchState>;

type Variant = 'search' | 'first' | 'last';

const lineIds = (prefix: string) => ({
  init: `${prefix}init`,
  mid: `${prefix}mid`,
  right: `${prefix}go-right`,
  left: `${prefix}go-left`,
});

const LINES: Record<Variant, ReturnType<typeof lineIds> & { match: string; done: string }> = {
  search: { ...lineIds(''), match: 'found', done: 'not-found' },
  first: { ...lineIds('first-'), match: 'first-match', done: 'first-done' },
  last: { ...lineIds('last-'), match: 'last-match', done: 'last-done' },
};

/**
 * Searches the array for `value` by halving the range low…high: its index, or −1. The classic
 * search stops at the first match it lands on; `first` and `last` remember a match and keep
 * looking left or right of it, so they find the first or last of several equal values.
 */
export function binarySearch(t: SearchTracer, value: string, variant: Variant = 'search'): number {
  const lines = LINES[variant];
  const size = t.model.size;
  let low = 0;
  let high = size - 1;
  let result = -1;
  let checks = 0;
  const vars = (mid?: number) => ({
    low,
    ...(mid === undefined ? {} : { mid }),
    high,
    ...(variant === 'search' ? {} : { result }),
  });

  if (size === 0) {
    t.step({
      line: lines.done,
      caption: { key: 'binary-search.empty', params: { value } },
      vars: vars(),
      annotations: { low, high },
    });
    return -1;
  }

  t.step({
    line: lines.init,
    caption: {
      key: variant === 'search' ? 'binary-search.start' : `binary-search.${variant}.start`,
      params: { value, size, high },
    },
    vars: vars(),
    annotations: { low, high },
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const item = t.model.slots[mid]!.value;
    checks++;
    t.count('reads');
    t.step({
      line: lines.mid,
      caption: { key: 'binary-search.mid', params: { low, high, mid, item } },
      vars: vars(mid),
      annotations: { low, high, mid, ...(result < 0 ? {} : { result }) },
    });

    t.count('comparisons');
    const order = compareValues(item, value);
    if (order === 0 && variant === 'search') {
      t.step({
        line: lines.match,
        caption: { key: 'binary-search.found', params: { value, mid, checks } },
        vars: vars(mid),
        annotations: { low, high, mid, found: true },
      });
      return mid;
    }

    if (order === 0) {
      // A match, but there may be another one further left (first) or right (last).
      result = mid;
      if (variant === 'first') high = mid - 1;
      else low = mid + 1;
      t.step({
        line: lines.match,
        caption: { key: `binary-search.${variant}.match`, params: { value, mid, low, high } },
        vars: vars(mid),
        annotations: { low, high, mid, found: true, result },
      });
    } else if (order < 0) {
      low = mid + 1;
      t.step({
        line: lines.right,
        caption: { key: 'binary-search.go-right', params: { item, value, low } },
        vars: vars(mid),
        annotations: { low, high, mid, ...(result < 0 ? {} : { result }) },
      });
    } else {
      high = mid - 1;
      t.step({
        line: lines.left,
        caption: { key: 'binary-search.go-left', params: { item, value, high } },
        vars: vars(mid),
        annotations: { low, high, mid, ...(result < 0 ? {} : { result }) },
      });
    }
  }

  if (result >= 0) {
    t.step({
      line: lines.done,
      caption: { key: `binary-search.${variant}.done`, params: { value, result, checks } },
      vars: vars(),
      annotations: { low, high, result },
    });
    return result;
  }
  t.step({
    line: lines.done,
    caption: {
      key: isSorted(t.model) ? 'binary-search.not-found' : 'binary-search.not-found.unsorted',
      params: { value, low, high, checks },
    },
    vars: vars(),
    annotations: { low, high },
  });
  return -1;
}

export type SearchOperation = {
  type: 'binarySearch' | 'findFirst' | 'findLast';
  value: string;
};

const VARIANTS: Record<SearchOperation['type'], Variant> = {
  binarySearch: 'search',
  findFirst: 'first',
  findLast: 'last',
};

/** Runs one search on `model`: the trace to play. Searching never changes the array. */
export function traceSearch(
  model: ArrayModel,
  operation: SearchOperation,
): { trace: Trace<number>; model: ArrayModel } {
  return runTrace(
    {
      operation: `sorted-array.${operation.type}`,
      model,
      toScene: searchToScene,
      describe: describeSearch,
    },
    (t) => binarySearch(t, operation.value, VARIANTS[operation.type]),
  );
}
