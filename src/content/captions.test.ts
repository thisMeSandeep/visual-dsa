import { buildStackDemoLesson } from '@/engine/lesson/stack-demo';

import { CAPTIONS, captionSegments, captionText } from './captions';

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
  it('has text for every caption the stack lesson uses', () => {
    const lesson = buildStackDemoLesson({});
    const keys = new Set(
      lesson.steps.flatMap((step) => ('key' in step.caption ? [step.caption.key] : [])),
    );
    for (const key of keys) expect(CAPTIONS).toHaveProperty([key]);
  });

  it('leaves no placeholder unfilled in the stack lesson', () => {
    const lesson = buildStackDemoLesson({});
    for (const step of lesson.steps) expect(captionText(step.caption)).not.toMatch(/\{\w+\}/);
  });
});
