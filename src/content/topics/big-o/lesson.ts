import type { LessonRecipe } from '../../schema';

/**
 * The Big O lesson (ALGORITHM-CATALOG F1). The growth chart carries most chapters: n moves,
 * curves arrive one class at a time, and sample loops count their steps until the dot lands on
 * their curve. Best and worst case and amortised cost use a real array instead.
 */
// Typed rather than `satisfies`, like the other lessons, so the recipe literal isn't widened.
export const lesson: LessonRecipe = {
  topicId: 'big-o',
  segments: [
    { kind: 'chapter', chapterId: 'why-growth' },
    { kind: 'setup', structure: 'big-o', input: { n: 10, curves: ['linear', 'quadratic'] } },
    {
      kind: 'say',
      caption:
        'How fast is an algorithm? Seconds depend on the phone and the day, so instead we count **steps**.',
    },
    {
      kind: 'say',
      caption:
        'And we ask how the count **grows** as the input’s size, **n**, grows. Here are two ways to do one job.',
    },
    {
      kind: 'trace',
      operation: 'big-o.setN',
      input: { n: 50 },
      captions: { '0': 'At n = 50 it’s 50 steps against 2,500, and the gap only widens.' },
    },
    {
      kind: 'say',
      caption:
        '**Big O** names that growth: O(n) for the straight line, O(n²) for the curve that shoots up.',
    },

    { kind: 'chapter', chapterId: 'counting-steps' },
    { kind: 'setup', structure: 'big-o', input: { n: 6, curves: ['linear'] } },
    {
      kind: 'say',
      caption: 'To find the growth, count the steps. This loop does one step for each of n items.',
    },
    { kind: 'trace', operation: 'big-o.loop' },
    {
      kind: 'say',
      caption: '6 items, 6 steps. Double n and the steps double: that’s **O(n)**, linear.',
    },
    { kind: 'trace', operation: 'big-o.nested' },
    {
      kind: 'say',
      caption: 'A loop inside a loop does n × n steps: **O(n²)**. Nesting multiplies.',
    },

    { kind: 'chapter', chapterId: 'common-classes' },
    { kind: 'setup', structure: 'big-o', input: { n: 8 } },
    {
      kind: 'say',
      caption: 'Most algorithms fall into a handful of classes. Here they are, fastest first.',
    },
    { kind: 'trace', operation: 'big-o.show', input: { curve: 'constant' } },
    { kind: 'trace', operation: 'big-o.show', input: { curve: 'logarithmic' } },
    { kind: 'trace', operation: 'big-o.show', input: { curve: 'linear' } },
    { kind: 'trace', operation: 'big-o.show', input: { curve: 'linearithmic' } },
    { kind: 'trace', operation: 'big-o.show', input: { curve: 'quadratic' } },
    { kind: 'trace', operation: 'big-o.show', input: { curve: 'exponential' } },
    {
      kind: 'say',
      caption: 'Where does log n come from? From halving. Watch a loop that halves n each time.',
    },
    { kind: 'trace', operation: 'big-o.halving' },

    { kind: 'chapter', chapterId: 'dropping-constants' },
    {
      kind: 'setup',
      structure: 'big-o',
      input: { n: 10, curves: ['linear', 'scaled-linear'] },
    },
    {
      kind: 'say',
      caption:
        'Is 3n + 5 slower than n? Yes, about three times. But both are straight lines: they grow the **same way**.',
    },
    { kind: 'trace', operation: 'big-o.show', input: { curve: 'scaled-quadratic' } },
    {
      kind: 'trace',
      operation: 'big-o.setN',
      input: { n: 50 },
      captions: { '0': 'Zoom out to n = 50: n²/2 has already overtaken 3n + 5.' },
    },
    {
      kind: 'say',
      caption:
        'The shape wins in the end, so Big O drops constants: 3n + 5 is **O(n)**, and n²/2 is **O(n²)**.',
    },
    {
      kind: 'say',
      caption: 'Smaller terms go too: n² + n is just **O(n²)**, since n² dwarfs n as n grows.',
    },

    { kind: 'chapter', chapterId: 'best-average-worst' },
    {
      kind: 'setup',
      structure: 'array',
      input: { values: ['42', '8', '23', '17', '5'], capacity: 5 },
    },
    {
      kind: 'say',
      caption:
        'One algorithm can take different numbers of steps on different inputs. Take linear search.',
    },
    { kind: 'trace', operation: 'array.search', input: { value: '42' } },
    { kind: 'say', caption: '**Best case**: the value is first. 1 step.' },
    { kind: 'trace', operation: 'array.search', input: { value: '99' } },
    {
      kind: 'say',
      caption:
        'On **average**, a search checks about half the items: n/2 steps, which is still O(n).',
    },
    {
      kind: 'say',
      caption:
        'Big O usually describes the worst case, so it’s a promise: linear search is **O(n)**.',
    },

    { kind: 'chapter', chapterId: 'space' },
    { kind: 'setup', structure: 'big-o', input: { n: 8, curves: ['constant', 'linear'] } },
    {
      kind: 'say',
      caption:
        '**Space complexity** counts memory the same way. A loop’s counter is **O(1)** space, whatever n is.',
    },
    {
      kind: 'say',
      caption: 'A copy of the input, one slot per item, is **O(n)** space.',
    },
    {
      kind: 'say',
      caption:
        'Algorithms often trade one for the other: a hash table spends memory to make lookups fast.',
    },

    { kind: 'chapter', chapterId: 'amortised' },
    {
      kind: 'setup',
      structure: 'array',
      input: { values: ['1', '2', '3', '4'], capacity: 4 },
    },
    {
      kind: 'say',
      caption: 'Some operations are usually cheap but now and then expensive. This array is full…',
    },
    { kind: 'trace', operation: 'array.push', input: { value: '5' } },
    { kind: 'trace', operation: 'array.push', input: { value: '6' } },
    {
      kind: 'say',
      caption:
        'Spread over every push, the copying costs **O(1)** each: that’s **amortised** cost. The Array topic has more.',
    },
  ],
};
