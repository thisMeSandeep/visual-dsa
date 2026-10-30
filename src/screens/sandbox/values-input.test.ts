import { config } from '@/config';
import { createRng } from '@/engine/core/rng';

import { parseValues, randomValues } from './values-input';

describe('parseValues', () => {
  it('accepts numbers separated by spaces or commas', () => {
    expect(parseValues(' 5 3, 8,1 ')).toEqual({ ok: true, values: ['5', '3', '8', '1'] });
    expect(parseValues('07 10')).toEqual({ ok: true, values: ['7', '10'] });
  });

  it('explains an empty, short, long or out-of-range list', () => {
    expect(parseValues('  ')).toEqual({
      ok: false,
      problem: 'Type some numbers first, like 5 3 8 1, or tap Random.',
    });
    expect(parseValues('4')).toMatchObject({
      ok: false,
      problem: expect.stringMatching(/at least 2/),
    });
    const long = Array.from({ length: config.engine.maxItems + 1 }, () => '1').join(' ');
    expect(parseValues(long)).toMatchObject({
      ok: false,
      problem: expect.stringMatching(/too many/),
    });
    expect(parseValues('5 x 1')).toMatchObject({
      ok: false,
      problem: expect.stringMatching(/numbers only/),
    });
    expect(parseValues('5 120')).toEqual({ ok: false, problem: '120 is outside the range 0–99.' });
    expect(parseValues('5 2.5')).toMatchObject({
      ok: false,
      problem: expect.stringMatching(/whole number/),
    });
  });
});

describe('randomValues', () => {
  it('makes a list that parses', () => {
    const text = randomValues(createRng(3));
    expect(parseValues(text)).toMatchObject({ ok: true });
    expect(text.split(' ')).toHaveLength(config.structures.sorting.randomCount);
  });
});
