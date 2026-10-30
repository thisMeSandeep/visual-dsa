import { compileLesson } from '@/engine/lesson/compile';
import type { Trace } from '@/engine/core/types';
import {
  createArray,
  traceArray,
  type ArrayModel,
  type ArrayOperation,
} from '@/engine/structures/array';

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
