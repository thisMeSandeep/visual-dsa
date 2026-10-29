import { parseValue } from './value-input';

describe('parseValue', () => {
  it('accepts whole numbers in range, trimmed and normalised', () => {
    expect(parseValue(' 42 ')).toEqual({ ok: true, value: '42' });
    expect(parseValue('07')).toEqual({ ok: true, value: '7' });
  });

  it('explains what is wrong', () => {
    expect(parseValue('')).toEqual({ ok: false, problem: 'Type a number first, or tap Random.' });
    expect(parseValue('abc')).toEqual({ ok: false, problem: 'Use a number, like 42.' });
    expect(parseValue('4.5')).toEqual({ ok: false, problem: '4.5 isn’t a whole number.' });
    expect(parseValue('120')).toEqual({ ok: false, problem: '120 is outside the range 0–99.' });
    expect(parseValue('-3')).toEqual({ ok: false, problem: '-3 is outside the range 0–99.' });
  });
});
