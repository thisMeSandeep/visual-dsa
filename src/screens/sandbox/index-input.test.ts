import { parseIndex } from './index-input';

describe('parseIndex', () => {
  it('accepts whole numbers from 0, ignoring spaces', () => {
    expect(parseIndex('0')).toEqual({ ok: true, index: 0 });
    expect(parseIndex(' 3 ')).toEqual({ ok: true, index: 3 });
  });

  it('explains empty, negative, decimal and impossibly large indices', () => {
    expect(parseIndex('')).toEqual({ ok: false, problem: 'Type an index first, like 2.' });
    expect(parseIndex('-1')).toEqual({ ok: false, problem: 'Use a whole number from 0, like 2.' });
    expect(parseIndex('1.5')).toEqual({ ok: false, problem: 'Use a whole number from 0, like 2.' });
    expect(parseIndex('12')).toEqual({
      ok: false,
      problem: 'No array here is that long: indices go up to 11.',
    });
  });
});
