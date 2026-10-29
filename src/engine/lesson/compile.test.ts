import type { Step } from '../core/types';
import { compileLesson } from './compile';
import type { LessonRecipeInput, RecipeSegment } from './recipe';
import { CompileError } from './structures';

/* Helpers ------------------------------------------------------------------------------------- */

const TITLES = { intro: 'Introduction', errors: 'When it goes wrong', extra: 'Extra' };

const recipe = (...segments: RecipeSegment[]): LessonRecipeInput => ({
  topicId: 'stack',
  segments,
});
const compile = (...segments: RecipeSegment[]) => compileLesson(recipe(...segments), TITLES);

/** Runs a compile that should fail and returns the error. */
function compileError(...segments: RecipeSegment[]): CompileError {
  try {
    compile(...segments);
  } catch (error) {
    if (error instanceof CompileError) return error;
    throw error;
  }
  throw new Error('expected a CompileError');
}

const keys = (steps: readonly Step[]) =>
  steps.map((step) => ('key' in step.caption ? step.caption.key : step.caption.text));
const pauses = (steps: readonly Step[]) => steps.map((step) => step.pause);

const chapter = (chapterId: string): RecipeSegment => ({ kind: 'chapter', chapterId });
const setup = (input?: unknown): RecipeSegment => ({ kind: 'setup', structure: 'stack', input });
const push = (value: string): Extract<RecipeSegment, { kind: 'trace' }> => ({
  kind: 'trace',
  operation: 'stack.push',
  input: { value },
});
const pop: RecipeSegment = { kind: 'trace', operation: 'stack.pop' };

/* Compiling ----------------------------------------------------------------------------------- */

describe('compileLesson', () => {
  it('runs trace segments as real operations, one after another', () => {
    const lesson = compile(chapter('intro'), setup({ capacity: 4 }), push('23'), push('8'), pop);

    expect(lesson.topicId).toBe('stack');
    expect(keys(lesson.steps)).toEqual([
      'stack.push.check',
      'stack.pushed',
      'stack.push.check',
      'stack.pushed',
      'stack.pop.check',
      'stack.pop.read',
      'stack.popped',
    ]);
    expect(lesson.steps.at(-1)?.a11y).toMatch(/23/);
    expect(lesson.steps.at(-1)?.a11y).not.toMatch(/8/);
  });

  it('knows every stack operation', () => {
    const lesson = compile(
      chapter('intro'),
      setup({ values: ['4', '9'] }),
      { kind: 'trace', operation: 'stack.peek' },
      { kind: 'trace', operation: 'stack.clear' },
    );
    expect(keys(lesson.steps)).toEqual(['stack.peeked', 'stack.clear.start', 'stack.cleared']);
  });

  it('records where each chapter starts, with titles from the topic', () => {
    const lesson = compile(chapter('intro'), setup(), push('1'), chapter('errors'), pop);
    expect(lesson.chapters).toEqual([
      { id: 'intro', title: 'Introduction', firstStep: 0 },
      { id: 'errors', title: 'When it goes wrong', firstStep: 2 },
    ]);
  });

  it('pauses at the end of each chapter', () => {
    const lesson = compile(chapter('intro'), setup(), push('1'), chapter('errors'), pop);
    expect(pauses(lesson.steps)).toEqual([
      undefined,
      'chapter-end',
      undefined,
      undefined,
      'chapter-end',
    ]);
  });

  it('keeps the structure across chapters until a new setup', () => {
    const lesson = compile(
      chapter('intro'),
      setup({ values: ['5'] }),
      push('6'),
      chapter('errors'),
      setup({ capacity: 1 }),
      pop,
    );
    expect(keys(lesson.steps).at(-1)).toBe('stack.underflow');
  });

  it('replaces engine captions with authored ones by step number', () => {
    const lesson = compile(chapter('intro'), setup(), {
      kind: 'trace',
      operation: 'stack.push',
      input: { value: '7' },
      captions: { '1': 'Now **7** is on top.' },
    });
    expect(lesson.steps.map((step) => step.caption)).toEqual([
      { key: 'stack.push.check', params: { value: '7' } },
      { text: 'Now **7** is on top.' },
    ]);
  });

  it('adds a say step over the structure as it is, keeping the counters', () => {
    const lesson = compile(chapter('intro'), setup(), push('3'), {
      kind: 'say',
      caption: 'Three is on top.',
    });
    const [, pushed, said] = lesson.steps;
    expect(said?.caption).toEqual({ text: 'Three is on top.' });
    expect(said?.scene.elements.map((element) => element.id)).toEqual(
      pushed?.scene.elements.map((element) => element.id),
    );
    expect(said?.counters).toEqual(pushed?.counters);
    expect(said?.codeLine).toBeUndefined();
    expect(said?.a11y).toMatch(/3/);
  });

  it('starts counters at zero when nothing has run yet', () => {
    const lesson = compile(chapter('intro'), setup(), { kind: 'say', caption: 'An empty stack.' });
    expect(lesson.steps[0]?.counters).toEqual({ comparisons: 0, swaps: 0, reads: 0, writes: 0 });
  });

  it('pauses for interactive and predict steps, and keeps that pause at a chapter end', () => {
    const lesson = compile(
      chapter('intro'),
      setup(),
      { kind: 'interactive', prompt: 'Push any number.' },
      { kind: 'predict', questionId: 'what-pops' },
    );
    expect(pauses(lesson.steps)).toEqual(['interactive', 'predict']);
    expect(lesson.steps[0]?.caption).toEqual({ text: 'Push any number.' });
    expect(lesson.steps[1]?.caption).toEqual({
      key: 'lesson.predict',
      params: { questionId: 'what-pops' },
    });
  });

  it('turns a scene segment into analogy steps, one per caption', () => {
    const lesson = compile(chapter('intro'), {
      kind: 'scene',
      sceneId: 'browser-back',
      steps: [{ caption: 'You open a page.' }, { caption: 'Then another.' }],
    });
    expect(lesson.steps.map((step) => step.scene)).toEqual([
      { renderer: 'analogy', elements: [], meta: { sceneId: 'browser-back', sceneStep: 0 } },
      { renderer: 'analogy', elements: [], meta: { sceneId: 'browser-back', sceneStep: 1 } },
    ]);
    expect(lesson.steps.map((step) => step.a11y)).toEqual(['You open a page.', 'Then another.']);
  });

  it('gives the same lesson every time', () => {
    const segments = [chapter('intro'), setup({ capacity: 2 }), push('1'), push('2'), push('3')];
    expect(compile(...segments)).toEqual(compile(...segments));
  });
});

/* Errors ---------------------------------------------------------------------------------------- */

describe('compileLesson errors name the segment', () => {
  it.each<[string, RecipeSegment[], RegExp]>([
    ['an unknown chapter', [chapter('nope')], /segments\[0\]: Unknown chapter "nope"/],
    [
      'a repeated chapter',
      [chapter('intro'), setup(), push('1'), chapter('intro')],
      /segments\[3\]: Chapter "intro" appears twice/,
    ],
    [
      'an empty chapter',
      [chapter('intro'), chapter('errors')],
      /segments\[1\]: Chapter "intro" has no steps/,
    ],
    [
      'an empty last chapter',
      [chapter('intro'), setup()],
      /segments: Chapter "intro" has no steps/,
    ],
    [
      'an unknown structure',
      [chapter('intro'), { kind: 'setup', structure: 'heap' }],
      /segments\[1\]: Unknown structure "heap"/,
    ],
    [
      'an unknown operation',
      [chapter('intro'), setup(), { kind: 'trace', operation: 'stack.shuffle' }],
      /segments\[2\]: Unknown operation "stack.shuffle"/,
    ],
    [
      'an operation on a structure that was never set up',
      [chapter('intro'), pop],
      /segments\[1\]: Set up "stack" before using it/,
    ],
    [
      'a say before any setup',
      [chapter('intro'), { kind: 'say', caption: 'Hi' }],
      /segments\[1\]: Add a setup segment/,
    ],
    [
      'a caption for a step the trace does not have',
      [chapter('intro'), setup(), { ...push('1'), captions: { '5': 'Too far.' } }],
      /segments\[2\]: Caption for step 5, but "stack.push" has 2 steps/,
    ],
    [
      'a missing push value',
      [chapter('intro'), setup(), { kind: 'trace', operation: 'stack.push', input: {} }],
      /segments\[2\]: "value" must be a non-empty string/,
    ],
    ['input that is not an object', [chapter('intro'), setup([1])], /Input must be an object/],
    [
      'starting values that are not strings',
      [chapter('intro'), setup({ values: [1, 2] })],
      /"values" must be a list of strings/,
    ],
    [
      'a capacity that is not a whole number',
      [chapter('intro'), setup({ capacity: 2.5 })],
      /"capacity" must be a whole number/,
    ],
    [
      'a capacity out of range',
      [chapter('intro'), setup({ capacity: 0 })],
      /segments\[1\]: .*capacity/i,
    ],
  ])('rejects %s', (_name, segments, message) => {
    expect(compileError(...segments).message).toMatch(message);
  });

  it('rejects a lesson with no chapters', () => {
    expect(compileError().message).toMatch(/at least one chapter/);
  });

  it('says where the problem is', () => {
    const error = compileError(chapter('intro'), setup(), { kind: 'trace', operation: 'x.y' });
    expect(error.name).toBe('CompileError');
    expect(error.at).toBe('segments[2]');
  });
});
